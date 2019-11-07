require 'json'

class Search

  SOLR_CHARS = '+-&|!(){}[]^"~*?:\\/ '

  def self.solr_url(path = false)
    unless @solr_url
      @solr_url = AppConfig[:solr_url]

      unless @solr_url.end_with?('/')
        @solr_url += '/'
      end
    end

    path ? URI.join(@solr_url, path) : @solr_url
  end


  def self.solr_escape(s)
    pattern = Regexp.quote(SOLR_CHARS)
    s.gsub(/([#{pattern}])/, '\\\\\1')
  end


  def self.build_keyword_query(s)
    s.split(' ').map {|subq| solr_escape(subq)}.join(' ')
  end


  class SolrSearchFailure < StandardError; end


  def self.solr_handle_search(query_params)
    solr_url = AppConfig[:solr_url]

    unless solr_url.end_with?('/')
      solr_url += '/'
    end

    solr_params = {'qt' => 'json',
                  'rows' => AppConfig[:page_size]}

    query_params.each do |param, value|
      solr_params[param.to_s] = value
    end

    search_uri = URI.join(solr_url, 'select')
    search_uri.query = URI.encode_www_form(solr_params)

    request = Net::HTTP::Get.new(search_uri)

    Net::HTTP.start(search_uri.host, search_uri.port) do |http|
      response = http.request(request)

      raise SolrSearchFailure.new(response) unless response.code.start_with?('2')

      return JSON.parse(response.body)
    end
  end


  def self.date_pad_start(s)
    default = ['0000', '01', '01']
    bits = s.split('-')

    full_date = (0...3).map {|i| bits.fetch(i, default.fetch(i))}.join('-')

    "#{full_date}T00:00:00Z"
  end


  def self.date_pad_end(s)
    default = ['9999', '12', '31']
    bits = s.split('-')

    full_date = (0...3).map {|i| bits.fetch(i, default.fetch(i))}.join('-')

    "#{full_date}T23:59:59Z"
  end


  # Either of these parameters might be nil or empty
  def self.build_date_filter(start_date, end_date)
    # A record is NOT in range if its start date is after our end date, OR its
    # end date is before our start date.

    clauses = []

    unless end_date.to_s.empty?
      clauses << "start_date:[#{date_pad_end(end_date)} TO *]"
    end

    unless start_date.to_s.empty?
      clauses << "end_date:[* TO #{date_pad_start(start_date)}]"
    end

    if clauses.empty?
      '*:*'
    else
      "NOT (#{clauses.join(' OR ')})"
    end
  end


  def self.build_supplied_filters(filters)
    return '*:*' if filters.empty?

    clauses = []

    filters.each do |field, value|
      clauses << '%s:%s' % [solr_escape(field), solr_escape(value)]
    end

    clauses.join(' AND ')
  end


  VALID_SORTS = {
    'relevance' => 'score desc',
    'title_asc' => 'title_sort asc',
    'title_desc' => 'title_sort desc',
    'qsaid_asc' => 'qsaid_sort asc',
    'qsaid_desc' => 'qsaid_sort desc',
    'position_asc' => 'position asc',
    'position_desc' => 'position desc',
    'date_asc' => 'start_date asc, title_sort asc',
    'date_desc' => 'start_date desc, title_sort desc',
  }


  def self.parse_sort(sort_spec)
    VALID_SORTS.fetch(sort_spec)
  end


  def self.resolve_agency_names(facets)
    agency_uris = facets.fetch('creating_agency', []).each_slice(2).map(&:first)
    result = {}

    return result if agency_uris.empty?

    # We're assuming that our facet limit is lower than the maximum number of
    # boolean clauses here, which it should be.  If that changes, we'd need to
    # fire more than one search.
    response = solr_handle_search('q' => '*:*',
                                  'fq' => 'uri:(%s)' % agency_uris.map {|uri| solr_escape(uri)}.join(" OR "),
                                  'fl' => 'uri,title',
                                  'rows' => agency_uris.length,)

    response.fetch('response', {}).fetch('docs', []).each do |doc|
      result[doc.fetch('uri')] = doc.fetch('title')
    end

    result
  end


  def self.get_records_by_ids(doc_ids)
    return {} if doc_ids.empty?

    solr_handle_search(q: "{!terms f=id}#{doc_ids.join(',')}",
                       rows: doc_ids.length)
      .fetch('response')
      .fetch('docs')
      .map {|doc|
        json = JSON.parse(doc.fetch('json'))
        [doc['id'], json]
      }.to_h
  end


  def self.get_records_by_uris(uris)
    return {} if uris.empty?

    solr_handle_search(q: "{!terms f=uri}#{uris.join(',')}",
                       rows: uris.length)
      .fetch('response')
      .fetch('docs')
      .map {|doc|
        json = JSON.parse(doc.fetch('json'))
        [doc['uri'], json]
      }.to_h
  end


  def self.get_record_by_qsa_id(qsa_id_prefixed, raw = false)
    solr_handle_search(q: "qsa_id_prefixed:#{solr_escape(qsa_id_prefixed.upcase)}")
      .fetch('response')
      .fetch('docs')
      .map do |doc|
      return doc if raw
      return JSON.parse(doc.fetch('json'))
    end

    nil
  end

  def self.resolve_refs!(root)
    queue = [root]
    to_resolve = {}

    # Round 1: Pull out the refs we need to resolve
    while !queue.empty?
      record = queue.shift

      if record.is_a?(Hash)
        if record['ref']
          to_resolve[record['ref']] = :failed_to_resolve
        else
          queue.concat(record.values)
        end
      elsif record.is_a?(Array)
        queue.concat(record)
      else
        # Boring
      end
    end

    # Round 2: do the resolves
    to_resolve.merge!(get_records_by_uris(to_resolve.keys))

    # Round 3: slot in the resolved values and delete things that couldn't be
    # resolved
    queue = [root]
    while !queue.empty?
      record = queue.shift

      if record.is_a?(Hash)
        record.keys.each do |key|
          if record[key].is_a?(Hash) && record[key]['ref']
            if to_resolve[record[key]['ref']] == :failed_to_resolve
              record.delete(key)
            else
              record[key]['_resolved'] = to_resolve[record[key]['ref']]
            end
          else
            queue << record[key]
          end
        end
      elsif record.is_a?(Array)
        # Is this an array of refs?
        if record.any? {|elt| elt.is_a?(Hash) && elt['ref']}
          # attempt resolve
          to_delete = []
          record.each do |elt|
            if to_resolve[elt['ref']] == :failed_to_resolve
              to_delete << elt
            else
              elt['_resolved'] = to_resolve[elt['ref']]
            end
          end

          to_delete.each do |victim|
            record.delete(victim)
          end
        else
          queue.concat(record)
        end
      else
        # boring
      end
    end

    root
  end


  # Records and representations are indexed separately, and there may be some
  # period of time between when a record hits the index and when its
  # representations do.
  #
  # Avoid strange behaviour by excluding any representations that have not yet
  # been indexed.
  def self.filter_representations!(record)
    representation_fields = ['physical_representations', 'digital_representations']

    representation_ids = representation_fields.flat_map {|field| Array(record[field]).map {|rep| rep['id']}}
    indexed_representations = Set.new(existing_ids(representation_ids))

    representation_fields.each do |representation_key|
      if record[representation_key]
        record[representation_key].reject! {|representation|
          !indexed_representations.include?(representation['id'])
        }
      end
    end

    record
  end


  # Return the `count` siblings on either side of `record`
  #
  # E.g. count = 4 will return up to 9 records: 4 jokers to the left; 4 jokers
  # to the right and the one `record_id` stuck in the middle.
  #
  # If `record` is the first of its siblings, we'll return the 8 records
  # following it.  If it's the second sibling, we'll return the 1 record to the
  # left and 7 records following it.
  #
  def self.siblings(record, count)
    position = record['position']
    parent_id = record['parent_id']

    left_siblings = Array(solr_handle_search(q: "parent_id:#{solr_escape(parent_id)} AND position:[* TO #{position - 1}]",
                                             rows: count * 2,
                                             sort: "position desc")
                            .dig('response', 'docs'))

    right_siblings = Array(solr_handle_search(q: "parent_id:#{solr_escape(parent_id)} AND position:[#{position + 1} TO *]",
                                              rows: count * 2,
                                              sort: "position asc")
                             .dig('response', 'docs'))

    result = [record]
    slots_remaining = count * 2

    while (!left_siblings.empty? || !right_siblings.empty?) && result.length < (1 + (count * 2))
      result.unshift(left_siblings.shift) if !left_siblings.empty?
      result.push(right_siblings.shift) if !right_siblings.empty?
    end

    result
  end

  def self.children(parent_id, page, sort_by = "position_asc", min_position = nil, max_position = nil)
    start_index = (page * AppConfig[:page_size])
    query = "parent_id:#{solr_escape(parent_id)}"
    if min_position && max_position
      query += " AND position:[#{min_position} TO #{max_position}]"
    end
    response = solr_handle_search(q: query,
                                  start: start_index,
                                  sort: parse_sort(sort_by)).fetch('response', {})

    result = {
      'total_count' => response.fetch('numFound'),
      'current_page' => page,
      'page_size' => AppConfig[:page_size],
      'sorted_by' => sort_by,
      'results' => response.fetch('docs', []).map do |doc|
        JSON.parse(doc.fetch('json'))
      end
    }

    # Calculate child counts for the records we're returning
    children_counts = count_children_for_docs(result['results'].map {|result| result['id']})

    result['results'].each do |result|
      result['children_count'] = children_counts.fetch(result['id'], 0)
    end

    result
  end

  def self.count_children_for_docs(doc_ids)
    counts = solr_handle_search('q': "{!terms f=parent_id}#{doc_ids.join(',')}",
                                'facet': true,
                                'facet.field': ['parent_id'],
                                'facet.mincount': 1,
                                'facet.limit': doc_ids.length)

    counts
      .fetch('facet_counts')
      .fetch('facet_fields')
      .fetch('parent_id')
      .each_slice(2)
      .map {|parent_id, child_count| [parent_id, child_count]}.to_h
  end

  def self.parse_filters(search_opts)
    filters = {}
    filters[:responsible_agency] = search_opts.fetch(:responsible_agency, nil)
    filters.reject{|_, v| v.nil?}
  end

  def self.for(search_opts)
    search_opts.reject!{|_,v| v.nil?}

    page = search_opts.fetch(:page, 0)
    record_types = search_opts.fetch(:types, [])
    sort_by = search_opts.fetch(:sort, 'relevance')

    filters = parse_filters(search_opts)

    start_index = (page * AppConfig[:page_size])

    query = if record_types.empty?
              '*:*'
            else
              record_types.map{|type| "primary_type:#{type}"}.join(' OR ')
            end

    search_opts = {
      q:query,
      start: start_index,
      sort: parse_sort(sort_by)
    }

    unless filters.empty?
      fq = []

      if filters[:responsible_agency]
        fq << "+responsible_agency_id:#{solr_escape(filters[:responsible_agency])}"
      end

      search_opts[:fq] = fq.join(' ')
    end

    response = solr_handle_search(search_opts).fetch('response', {})

    {
      'total_count' => response.fetch('numFound'),
      'current_page' => page,
      'page_size' => AppConfig[:page_size],
      'sorted_by' => sort_by,
      'results' => response.fetch('docs', [])
    }
  end

  def self.get_raw(opts)
    query = "qsa_id_prefixed:#{solr_escape(opts[:qsa_id].upcase)}" if opts[:qsa_id]
    query = "uri:#{solr_escape(opts[:uri])}" if opts[:uri]
    query = "id:#{solr_escape(opts[:id])}" if opts[:id]

    solr_handle_search(q: query)
      .fetch('response')
      .fetch('docs')
      .map do |doc|
      return doc
    end

    nil
  end

  def self.get(opts)
    doc = get_raw(opts)
    doc.nil? ? nil : JSON.parse(doc.fetch('json'))
  end


  VALID_TYPES = [
    'resource',
    'archival_object',
    'agent_corporate_entity',
    'mandate',
    'function'
  ]


  def self.parse_types(types)
    if types.nil? || types.empty?
      return VALID_TYPES
    else
      types & VALID_TYPES
    end
  end

  def self.match_all_if_empty(s)
    if s.to_s.empty?
      "*:*"
    else
      s
    end
  end

  def self.resolve_document_ids(facets, fields)
    document_ids_to_resolve = fields.map {|field|
      facets[field].map {|entry|
        entry[:facet_value]
      }
    }.flatten.uniq

    query = "{!terms f=id}" + document_ids_to_resolve.join(',')

    response = solr_handle_search('q' => query,
                       'offset' => 0,
                       'rows' => document_ids_to_resolve.length,
                       'fl' => 'id,title')


    id_to_title = response.fetch('response').fetch('docs').map {|doc|
      [
        doc['id'],
        doc['title']
      ]
    }.to_h

    facets.each do |facet_field, facet_entries|
      next unless fields.include?(facet_field)

      facet_entries.each do |entry|
        entry[:facet_label] = id_to_title.fetch(entry[:facet_value])
      end
    end

    facets
  end

  def self.advanced(search_opts)
    query = search_opts.fetch(:query)

    record_types = parse_types(query.filter_types)

    # Our query date range overlaps with our record's date range UNLESS:
    #
    # Record end < Query start; OR
    # Record start > Query end
    #
    date_filter = "-(end_date:[* TO #{query.filter_start_date}] OR start_date:[#{query.filter_end_date} TO *])"

    page = search_opts.fetch(:page) || 0
    sort = parse_sort(search_opts.fetch(:sort) || 'relevance')

    start_index = (page * AppConfig[:page_size])

    filters = [
      "primary_type:(#{record_types.join(' OR ')})",
      *query.filters.map {|filter|
        [solr_escape(filter['field']), solr_escape(filter['value'])].join(':')
      },
      date_filter,
      query.filter_linked_digital_objects_only ? "has_digital_representations:true" : nil,
      query.filter_open_records_only ? "open_record:true" : nil,
    ].compact

    solr_response = solr_handle_search('q': match_all_if_empty(query.query_string),
                                       'start': start_index,
                                       'sort': sort,
                                       'facet': true,
                                       'facet.field': ['mandate_id', 'function_id', 'responsible_agency_id', 'creating_agency_id', 'tags'],
                                       'facet.mincount': 1,
                                       fq: filters)


    facets = solr_response.fetch('facet_counts').fetch('facet_fields')

    facets.keys.each do |facet_field|
      facets[facet_field] = facets[facet_field].each_slice(2).map {|facet_value, facet_count|
        {
          facet_field: facet_field,
          facet_value: facet_value,
          facet_label: facet_value,
          facet_count: facet_count,
        }
      }
    end

    resolve_document_ids(facets, ['mandate_id', 'function_id', 'responsible_agency_id', 'creating_agency_id'])

    response = solr_response.fetch('response', {})

    {
      'total_count' => response.fetch('numFound'),
      'current_page' => page,
      'page_size' => AppConfig[:page_size],
      'sorted_by' => sort,
      'results' => response.fetch('docs', []),
      'facets' => facets,
    }
  end

  # Return the elements of `ids` that have corresponding Solr documents
  def self.existing_ids(ids)
    return [] if ids.empty?

    solr_handle_search(q: "{!terms f=id}#{ids.join(',')}",
                       rows: ids.length,
                       fl: 'id')
      .fetch('response')
      .fetch('docs')
      .map {|doc| doc['id']}
  end

  def self.exists?(id)
    !existing_ids([id]).empty?
  end
end
