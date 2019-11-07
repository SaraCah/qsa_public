require 'base64'
require_relative 'oai_helpers'


Templates.define(:oai_identify_response, [:params, :now, :earliest_date_timestamp], "lib/oai/templates/identify.xml.erb")
Templates.define(:oai_list_identifiers_response, [:params, :now, :identifiers, :next_resumption_token?], "lib/oai/templates/list_identifiers.xml.erb")

OAI_RECORD_TYPES = ['resource', 'archival_object']
OAI_REQUESTS_PER_PAGE = 100

class OAIProvider
  def self.handle_request(params)
    request = OAIRequest.new(params)

    case request.verb
        when "Identify"
          [
            200,
            {"Content-Type" => "text/xml"},
            Templates.emit(:oai_identify_response,
                           :now => Time.now.utc.iso8601,
                           :params => params,
                           :earliest_date_timestamp => (Time.now - (86400 * 365)).utc.iso8601)
          ]
        when "ListIdentifiers"
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

          identifiers = response.fetch('response').fetch('docs')

          [
            200,
            {"Content-Type" => "text/xml"},
            Templates.emit(:oai_list_identifiers_response,
                           :now => Time.now.utc.iso8601,
                           :params => params,
                           :identifiers => identifiers.take(OAI_REQUESTS_PER_PAGE),
                           :next_resumption_token => identifiers.length > OAI_REQUESTS_PER_PAGE ?
                                                       request.next_resumption_token(OAI_REQUESTS_PER_PAGE) :
                                                       nil
                          )
          ]


        else
          # FIXME: emit special code
          raise "Unrecognised OAI verb: #{params[:verb]}"
    end
  end


  class OAIRequest
    attr_reader :verb, :from, :until, :offset

    def initialize(params)
      @verb = params.fetch(:verb)
      @params = params

      @from = params.fetch(:from, nil)
      @until = params.fetch(:until, nil)
      @offset = 0

      load_resumption_token(params.fetch(:resumptionToken, nil))
    end


    def build_solr_date_range_filter
      "last_modified_time:[%s TO %s]" % [time_parse(@from) || '*', time_parse(@until) || '*']
    end

    def next_resumption_token(increment)
      Base64::strict_encode64(
        {
          'nonce' => SecureRandom.hex,
          'from' => @from,
          'until' => @until,
          'offset' => @offset + increment,
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
    end
  end
end
