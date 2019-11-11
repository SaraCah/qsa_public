require 'nokogiri'
require 'base64'
require 'date'
require_relative 'oai_helpers'


Templates.define(:oai_identify_response, [:params, :now, :earliest_date_timestamp], "lib/oai/templates/identify.xml.erb")
Templates.define(:oai_list_identifiers_response, [:params, :now, :identifiers, :next_resumption_token?], "lib/oai/templates/list_identifiers.xml.erb")
Templates.define(:oai_list_metadata_formats_response, [:params, :now], "lib/oai/templates/list_metadata_formats.xml.erb")
Templates.define(:oai_get_record_response, [:params, :now, :identifier, :record, :last_modified_time], "lib/oai/templates/get_record.xml.erb")
Templates.define(:oai_list_records_response, [:params, :now, :records, :next_resumption_token?], "lib/oai/templates/list_records.xml.erb")

Templates.define(:oai_record_dc, [:identifier, :record, :last_modified_time], "lib/oai/templates/record_dc.xml.erb")
Templates.define(:oai_error, [:params, :now, :code, :message], "lib/oai/templates/oai_error.xml.erb")


OAI_RECORD_TYPES = ['resource', 'archival_object']

OAI_RECORD_TYPE_URI_PATTERNS = {
  'resource' => '%/resources/%',
  'archival_object' => '%/archival_objects/%',
}


OAI_RECORDS_PER_PAGE = 100

class OAIProvider
  def self.error_response(params, code, message)
    [
      200,
      {"Content-Type" => "text/xml"},
      pprint_xml(Templates.emit(:oai_error,
                                :now => Time.now.utc.iso8601,
                                :params => params,
                                :code => code,
                                :message => message))
    ]
  end

  def self.handle_request(params)
    request = OAIRequest.new(params)

    unless request.valid?
      if request.good_resumption_token
        return error_response(request.params,
                              'badArgument',
                              'from/until/resumptionToken values not valid')
      else
        return error_response(request.params,
                              'badResumptionToken',
                              'resumptionToken not valid')
      end
    end

    if params[:metadataPrefix] && params[:metadataPrefix] != 'oai_dc'
      return error_response(params,
                            'cannotDisseminateFormat',
                            'The metadata format identified by the value given for the metadataPrefix argument is not supported by the item or by the repository.')
    end

    if params[:set]
      return error_response(params, 'noSetHierarchy', 'The repository does not support sets.')
    end

    case request.verb
    when "Identify"
      self.handle_identify(request)
    when "ListIdentifiers"
      self.handle_list_identifiers(request)
    when "ListMetadataFormats"
      self.handle_list_metadata_formats(request)
    when "GetRecord"
      self.handle_get_record(request)
    when "ListRecords"
      self.handle_list_records(request)
    when "ListSets"
      error_response(params, 'noSetHierarchy','This repository does not support sets')
    else
      error_response(params, 'badVerb', 'Value of the verb argument is not a legal OAI-PMH verb, the verb argument is missing, or the verb argument is repeated.')
    end
  end


  def self.handle_identify(request)
    response = Search.solr_handle_search(
      'q' => '*:*',
      'fq' => [
        "primary_type:(#{OAI_RECORD_TYPES.map {|s| Search.solr_escape(s) }.join(' ')})"
      ],
      'sort' => 'last_modified_time asc',
      'rows' => 1,
      'start' => 0,
      'fl' => 'last_modified_time'
    )

    earliest_timestamp = response
                           .fetch('response')
                           .fetch('docs')
                           .fetch(0, {'last_modified_time' => Time.at(0).utc.iso8601})['last_modified_time']

    [
      200,
      {"Content-Type" => "text/xml"},
      pprint_xml(Templates.emit(:oai_identify_response,
                                :now => Time.now.utc.iso8601,
                                :params => request.params,
                                :earliest_date_timestamp => earliest_timestamp))
    ]
  end


  def self.handle_get_record(request)
    unless request.identifier
      return error_response(request.params,
                            'badArgument',
                            'The request includes illegal arguments, is missing required arguments, includes a repeated argument, or values for arguments have an illegal syntax.')
    end

    unless request.wants_dc?
      return error_response(request.params,
                            'badArgument',
                            'metadataPrefix argument was missing.  Must be "oai_dc".')
    end

    uri = identifier_to_uri(request.identifier)

    response = Search.solr_handle_search(
      'q' => 'uri:%s' % [Search.solr_escape(uri)],
      'fq' => [
        "primary_type:(#{OAI_RECORD_TYPES.map {|s| Search.solr_escape(s) }.join(' ')})"
      ],
      'rows' => 1,
      'start' => 0,
      'fl' => 'last_modified_time, json'
    )

    solr_doc = response
                 .fetch('response')
                 .fetch('docs')
                 .fetch(0, nil)

    if solr_doc
      record = Search.resolve_refs!(JSON.parse(solr_doc['json']))
      [
        200,
        {"Content-Type" => "text/xml"},
        pprint_xml(Templates.emit(:oai_get_record_response,
                                  :now => Time.now.utc.iso8601,
                                  :params => request.params,
                                  :identifier => request.identifier,
                                  :record => record,
                                  :last_modified_time => solr_doc['last_modified_time'],
                                 ))
      ]
    else
      error_response(request.params, 'idDoesNotExist', 'The value of the identifier argument is unknown or illegal in this repository.')
    end

  end

  def self.list_records(request)
    response = Search.solr_handle_search(
      'q' => '*:*',
      'fq' => [
        request.build_solr_date_range_filter,
        "primary_type:(#{OAI_RECORD_TYPES.map {|s| Search.solr_escape(s) }.join(' ')})"
      ],
      'sort' => 'last_modified_time asc, uri asc',
      'rows' => OAI_RECORDS_PER_PAGE + 1,
      'start' => request.offset,
      'fl' => 'uri, last_modified_time, json'
    )

    docs = response.fetch('response').fetch('docs').map {|doc|
      doc['record'] = JSON.parse(doc['json'])
      doc
    }

    Search.resolve_refs!(docs)
  end

  def self.handle_list_records(request)
    unless request.wants_dc?
      return error_response(request.params,
                            'badArgument',
                            'metadataPrefix argument was missing.  Must be "oai_dc".')
    end


    records, next_resumption_token = build_request_listing(request, :list_records)

    if records.empty?
      return error_response(request.params,
                            'noRecordsMatch',
                            'The combination of the values of the from, until, set and metadataPrefix arguments results in an empty list.')
    end

    [
      200,
      {"Content-Type" => "text/xml"},
      pprint_xml(Templates.emit(:oai_list_records_response,
                                :now => Time.now.utc.iso8601,
                                :params => request.params,
                                :records => records,
                                :next_resumption_token => next_resumption_token,
                               ))
    ]
  end


  def self.list_record_identifiers(request)
    response = Search.solr_handle_search(
      'q' => '*:*',
      'fq' => [
        request.build_solr_date_range_filter,
        "primary_type:(#{OAI_RECORD_TYPES.map {|s| Search.solr_escape(s) }.join(' ')})"
      ],
      'sort' => 'last_modified_time asc, uri asc',
      'rows' => OAI_RECORDS_PER_PAGE + 1,
      'start' => request.offset,
      'fl' => 'uri,last_modified_time'
    )

    response.fetch('response').fetch('docs')

  end

  def self.list_delete_identifiers(request)
    DB.open do |db|
      query = db[:index_feed_deletes]
      query = request.add_sequel_date_range_filter(query)
      query = query.from_self.filter(1 => 0)

      # Limit to the record types we care about
      OAI_RECORD_TYPES.each do |type|
        query = query.or(Sequel.like(:record_uri, OAI_RECORD_TYPE_URI_PATTERNS.fetch(type)))
      end

      query = query.order(Sequel.asc(:system_mtime))
                .limit(OAI_RECORDS_PER_PAGE + 1,
                       request.offset)
                .select(:record_uri, :system_mtime)

      query.map {|row|
        {
          'uri' => row[:record_uri],
          'last_modified_time' => Time.at(row[:system_mtime]).utc.iso8601,
          'deleted' => true,
        }
      }
    end
  end

  def self.actually_has_deletes?(request, delete_token)
    next_request = OAIRequest.new({
                                    :verb => request.verb,
                                    :resumptionToken => delete_token
                                  })

    !list_delete_identifiers(request).empty?
  end

  def self.build_request_listing(request, list_method)
    listing = []

    if request.state == 'records'
      listing = self.send(list_method, request)
      if listing.empty?
        request.state = 'deletes'
      end
    end

    if request.state == 'deletes'
      listing = list_delete_identifiers(request)
    end

    if listing.empty?
      return [[], nil]
    end

    if listing.length > OAI_RECORDS_PER_PAGE
      return [
        listing,
        request.next_resumption_token(OAI_RECORDS_PER_PAGE)
      ]
    elsif request.state == 'records'
      next_token = request.resumption_token_for_deletes

      if actually_has_deletes?(request, next_token)
        [listing, next_token]
      else
        [listing, nil]
      end
    else
      # Deletes are finished
      [listing, nil]
    end
  end

  def self.handle_list_identifiers(request)
    identifiers, next_resumption_token = build_request_listing(request, :list_record_identifiers)

    if identifiers.empty?
      return error_response(request.params,
                            'noRecordsMatch',
                            'The combination of the values of the from, until, set and metadataPrefix arguments results in an empty list.')
    end

    [
      200,
      {"Content-Type" => "text/xml"},
      pprint_xml(Templates.emit(:oai_list_identifiers_response,
                                :now => Time.now.utc.iso8601,
                                :params => request.params,
                                :identifiers => identifiers.take(OAI_RECORDS_PER_PAGE),
                                :next_resumption_token => next_resumption_token))
    ]
  end

  def self.handle_list_metadata_formats(request)
    [
      200,
      {"Content-Type" => "text/xml"},
      pprint_xml(Templates.emit(:oai_list_metadata_formats_response,
                                :now => Time.now.utc.iso8601,
                                :params => request.params))
    ]
  end


  # oai:something:uri
  def self.identifier_to_uri(identifier)
    identifier.split(/:/).last
  end

  def self.pprint_xml(xml)
    doc = Nokogiri::XML.parse(xml) do |config|
      config.noblanks
    end

    doc.search('//text()').each do |node|
      node.content = node.content.strip
    end

    doc.to_xml(:indent => 2)
  end

  class OAIRequest
    RECORDS_STATE = 'records'
    DELETES_STATE = 'deletes'

    attr_reader :verb, :from, :until, :offset, :params, :identifier, :good_resumption_token
    attr_accessor :state

    def initialize(params)
      @verb = params.fetch(:verb)
      @params = params

      @identifier = params.fetch(:identifier, nil)

      @state = RECORDS_STATE

      @metadata_prefix = params.fetch(:metadataPrefix, nil)
      @from = params.fetch(:from, nil)
      @until = params.fetch(:until, nil)
      @offset = 0

      @good_resumption_token = true

      begin
        load_resumption_token(params.fetch(:resumptionToken, nil))
      rescue
        @good_resumption_token = false
      end
    end

    def wants_dc?
      @metadata_prefix == 'oai_dc'
    end

    def build_solr_date_range_filter
      "last_modified_time:[%s TO %s]" % [time_parse(@from) || '*', time_parse(@until) || '*']
    end

    def add_sequel_date_range_filter(base_ds)
      if @from
        time = Time.parse(@from).to_i
        base_ds = base_ds.where { system_mtime >= time }
      end

      if @until
        time = Time.parse(@until).to_i
        base_ds = base_ds.where { system_mtime <= time }
      end

      base_ds
    end

    def next_resumption_token(increment)
      Base64::strict_encode64(
        {
          'nonce' => SecureRandom.hex,
          'from' => @from,
          'until' => @until,
          'offset' => @offset + increment,
          'state' => @state,
          'metadataPrefix' => @metadata_prefix,
        }.to_json
      )
    end

    def resumption_token_for_deletes
      Base64::strict_encode64(
        {
          'nonce' => SecureRandom.hex,
          'from' => @from,
          'until' => @until,
          'offset' => 0,
          'state' => DELETES_STATE,
          'metadataPrefix' => @metadata_prefix,
        }.to_json
      )
    end

    def valid?
      return false if !@good_resumption_token

      [@from, @until].each do |val|
        next if val.nil?
        DateTime.iso8601(val)
      end

      true
    rescue
      false
    end

    private

    def time_parse(s)
      return nil if s.nil?

      begin
        Time.parse(s).utc.iso8601
      rescue
        nil
      end
    end

    def load_resumption_token(token)
      return if token.nil?

      values = JSON.parse(Base64::strict_decode64(token))

      @from = values.fetch('from', @from)
      @until = values.fetch('until', @until)
      @offset = values.fetch('offset', 0)
      @state = values.fetch('state', RECORDS_STATE)
      @metadata_prefix = values.fetch('metadataPrefix', nil)
    end
  end
end
