class QSAPublic < Sinatra::Base

  Endpoint.get('/api/search')
    .param(:type, [String], "Record Types", optional: true)
    .param(:responsible_agency, String, "Agency SOLR ID string", optional: true)
    .param(:sort, String, "Sort string (#{Search::VALID_SORTS.keys.join(', ')})", optional: true)
    .param(:page, Integer, "Page to return (zero-indexed)", optional: true) do

    json_response(Search.for(types: params[:type],
                             page: params[:page],
                             sort: params[:sort],
                             responsible_agency: params[:responsible_agency]))
  end

  Endpoint.post('/api/advanced_search')
    .param(:type, [String], "Record Types", optional: true)
    .param(:query, AdvancedSearchQuery, "Search Query")
    .param(:sort, String, "Sort string", optional: true)
    .param(:page, Integer, "Page to return (zero-indexed)", optional: true) do

    json_response(Search.advanced(types: params[:type],
                                  page: params[:page],
                                  sort: params[:sort],
                                  query: params[:query]))
  end


  Endpoint.get('/api/fetch')
    .param(:qsa_id, String, "Record QSA ID with prefix", optional: true)
    .param(:uri, String, "Record URI", optional: true)
    .param(:id, String, "Record SOLR ID", optional: true) do
    response = [404]

    begin
      if params[:qsa_id] || params[:uri] || params[:id]
        if record = Search.get(qsa_id: params[:qsa_id],
                               uri: params[:uri],
                               id: params[:id])
          Search.resolve_refs!(record)
          response = json_response(record)
        end
      end
    rescue
      $LOG.error($!)
    end

    response
  end

  Endpoint.get('/api/fetch_children')
    .param(:page, Integer, "Page to return", optional: true)
    .param(:qsa_id, String, "Record QSA ID with prefix", optional: true)
    .param(:uri, String, "Record URI", optional: true)
    .param(:id, String, "Record SOLR ID", optional: true) do
    response = 404

    begin
      if params[:qsa_id] || params[:uri] || params[:id]
        if record = Search.get(qsa_id: params[:qsa_id],
                               uri: params[:uri],
                               id: params[:id])
          response = json_response(Search.children(record.fetch('id'), params[:page] || 0))
        end
      end
    rescue
      $LOG.error($!)
    end

    response
  end


  Endpoint.get('/api/fetch_context')
    .param(:qsa_id, String, "Record QSA ID with prefix", optional: true)
    .param(:uri, String, "Record URI", optional: true)
    .param(:id, String, "Record SOLR ID", optional: true) do
    begin
      response = [404]

      if raw_record = Search.get_raw(qsa_id: params[:qsa_id],
                                     uri: params[:uri],
                                     id: params[:id])
        if raw_record['primary_type'] == 'archival_object'
          # show 10 records either side + 5 children
          position = raw_record['position']
          record = JSON.parse(raw_record.fetch('json'))
          min_sibling_position = [0, position - 5].max
          max_sibling_position = (10 - min_sibling_position) + position

          response = json_response(path_to_root: Search.resolve_refs!(record['ancestors']),
                                   siblings: Search.children(raw_record.fetch('parent_id'), 0, 'position_asc', min_sibling_position, max_sibling_position).fetch('results'),
                                   children: Search.children(raw_record.fetch('id'), 0, 'position_asc', 0, 4).fetch('results'))
        end
      end
    rescue
      $LOG.error($!)
    end

    response
  end

  # Fudge a quick overview of API endpoints
  # FIXME can drop once dev has settled
  Endpoint.get('/api/doc') do
    endpoints = []

    Endpoint.endpoints.map {|_, uris|
      uris.map{|uri, endpoint|
        next unless uri.start_with?('/api/')
        endpoints << {
          method: endpoint.method,
          uri: endpoint.uri,
          params: endpoint.valid_params.map {|param, opts|
            {
              name: opts['type'].is_a?(Array) ? "#{param}[]" : param,
              description: opts['description'],
              type: opts['type'].is_a?(Array) ? "Array of #{opts['type'][0]}" : opts['type'],
              description: opts['description'],
              required: !(opts['options'][:optional] == true),
            }
          }
        }
      }
    }

    json_response(endpoints)
  end
end
