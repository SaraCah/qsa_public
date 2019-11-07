require 'nokogiri'
require 'base64'
require_relative 'oai_helpers'


Templates.define(:oai_identify_response, [:params, :now, :earliest_date_timestamp], "lib/oai/templates/identify.xml.erb")
Templates.define(:oai_list_identifiers_response, [:params, :now, :identifiers, :next_resumption_token?], "lib/oai/templates/list_identifiers.xml.erb")
Templates.define(:oai_list_metadata_formats_response, [:params, :now], "lib/oai/templates/list_metadata_formats.xml.erb")
Templates.define(:oai_get_record_response, [:params, :now, :identifier, :record, :last_modified_time], "lib/oai/templates/get_record.xml.erb")
Templates.define(:oai_list_records_response, [:params, :now, :records, :next_resumption_token?], "lib/oai/templates/list_records.xml.erb")

Templates.define(:oai_record_dc, [:identifier, :record, :last_modified_time], "lib/oai/templates/record_dc.xml.erb")


OAI_RECORD_TYPES = ['resource', 'archival_object']

OAI_RECORD_TYPE_URI_PATTERNS = {
  'resource' => '%/resources/%',
  'archival_object' => '%/archival_objects/%',
}


OAI_REQUESTS_PER_PAGE = 100

class OAIProvider
  def self.handle_request(params)
    request = OAIRequest.new(params)

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
    else
      # FIXME: emit special code
      raise "Unrecognised OAI verb: #{params[:verb]}"
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


  # FIXME: Needs to return IdDoesNotExist if required
  def self.handle_get_record(request)
    unless request.identifier
      raise "Bad request" # FIXME
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
      raise "FIXME"
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
      'rows' => OAI_REQUESTS_PER_PAGE + 1,
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
    records = if request.state == 'records'
                    list_records(request)
                  elsif request.state == 'deletes'
                    list_delete_identifiers(request)
                  end

    next_resumption_token = if records.length > OAI_REQUESTS_PER_PAGE
                              request.next_resumption_token(OAI_REQUESTS_PER_PAGE)
                            elsif request.state == 'records'
                              request.resumption_token_for_deletes
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
      'rows' => OAI_REQUESTS_PER_PAGE + 1,
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
                .limit(OAI_REQUESTS_PER_PAGE + 1,
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

  def self.handle_list_identifiers(request)
    identifiers = if request.state == 'records'
                    list_record_identifiers(request)
                  elsif request.state == 'deletes'
                    list_delete_identifiers(request)
                  end

    next_resumption_token = if identifiers.length > OAI_REQUESTS_PER_PAGE
                              request.next_resumption_token(OAI_REQUESTS_PER_PAGE)
                            elsif request.state == 'records'
                              request.resumption_token_for_deletes
                            end

    [
      200,
      {"Content-Type" => "text/xml"},
      pprint_xml(Templates.emit(:oai_list_identifiers_response,
                                :now => Time.now.utc.iso8601,
                                :params => request.params,
                                :identifiers => identifiers.take(OAI_REQUESTS_PER_PAGE),
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

    attr_reader :verb, :from, :until, :offset, :params, :state, :identifier

    def initialize(params)
      @verb = params.fetch(:verb)
      @params = params

      @identifier = params.fetch(:identifier, nil)

      @state = RECORDS_STATE

      @from = params.fetch(:from, nil)
      @until = params.fetch(:until, nil)
      @offset = 0

      load_resumption_token(params.fetch(:resumptionToken, nil))
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
        }.to_json
      )
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
    end
  end
end
