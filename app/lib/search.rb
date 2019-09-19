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

    query_params = {'qt' => 'json'}.merge(query_params)
    query_params = {'rows' => AppConfig[:page_size]}.merge(query_params)

    search_uri = URI.join(solr_url, 'select')
    search_uri.query = URI.encode_www_form(query_params)

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


  def self.get_record_by_uri(uri)
    solr_handle_search(q: "uri:#{solr_escape(uri)}")
      .fetch('response')
      .fetch('docs')
      .map do |doc|
      return JSON.parse(doc.fetch('json'))
    end

    nil
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


  def self.resolve_refs!(record)
    if record.is_a?(Array)
      record.each do |item|
        resolve_refs!(item)
      end
      record.reject!{|h| h['ref'] && h['_resolved'].nil?}
    elsif record.is_a?(Hash)
      record.keys.each do |key|
        if key == 'ref'
          record['_resolved'] = get_record_by_uri(record[key])
          record.delete(key) if record['_resolved'].nil?
        else
          resolve_refs!(record[key])
        end
      end
    end

    record
  end

  def self.children(parent_id, page, sort_by = "position_asc", min_position = nil, max_position = nil)
    start_index = (page * AppConfig[:page_size])
    query = "parent_id:#{solr_escape(parent_id)}"
    if min_position && max_position
      query += " AND position:[#{min_position} TO #{max_position}]"
    end
    response = solr_handle_search(q:query,
                                  start: start_index,
                                  sort: parse_sort(sort_by)).fetch('response', {})

    {
      'total_count' => response.fetch('numFound'),
      'current_page' => page,
      'page_size' => AppConfig[:page_size],
      'sorted_by' => sort_by,
      'results' => response.fetch('docs', []).map do |doc|
        JSON.parse(doc.fetch('json'))
      end
    }
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
      date_filter,
      query.filter_linked_digital_objects_only ? "has_digital_representations:true" : nil,
      query.filter_open_records_only ? "open_record:true" : nil,
    ].compact

    response = solr_handle_search(q: match_all_if_empty(query.query_string),
                                  start: start_index,
                                  sort: sort,
                                  fq: filters).fetch('response', {})

    {
      'total_count' => response.fetch('numFound'),
      'current_page' => page,
      'page_size' => AppConfig[:page_size],
      'sorted_by' => sort,
      'results' => response.fetch('docs', [])
    }
  end
end
