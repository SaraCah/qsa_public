class QSAPublic < Sinatra::Base

  Endpoint.get('/favicon.ico') do
    send_file File.absolute_path('favicon.ico')
  end

  Endpoint.get('/') do
    Templates.emit_with_layout(:home,
                               {},
                               :layout,
                               {
                                 title: "QSA Public"
                               })
  end

  Endpoint.get('/feed/series')
    .param(:sort, String, "Sort string", optional: true)
    .param(:page, Integer, "Page to return", optional: true) do
    json_response(Search.for_type('resource', params[:page] || 0, params[:sort] || 'relevance'))
  end

  Endpoint.get('/feed/items')
    .param(:sort, String, "Sort string", optional: true)
    .param(:page, Integer, "Page to return", optional: true) do
    json_response(Search.for_type('archival_object', params[:page] || 0, params[:sort] || 'relevance'))
  end

  Endpoint.get('/feed/agencies')
    .param(:sort, String, "Sort string", optional: true)
    .param(:page, Integer, "Page to return", optional: true) do
    json_response(Search.for_type('agent_corporate_entity', params[:page] || 0, params[:sort] || 'relevance'))
  end

  Endpoint.get('/feed/subjects')
         .param(:sort, String, "Sort string", optional: true)
         .param(:page, Integer, "Page to return", optional: true) do
    json_response(Search.for_type('subject', params[:page] || 0, params[:sort] || 'relevance'))
  end

  Endpoint.get('/feed/functions')
    .param(:sort, String, "Sort string", optional: true)
    .param(:page, Integer, "Page to return", optional: true) do
    json_response(Search.for_type('function', params[:page] || 0, params[:sort] || 'relevance'))
  end

  Endpoint.get('/feed/mandates')
    .param(:sort, String, "Sort string", optional: true)
    .param(:page, Integer, "Page to return", optional: true) do
    json_response(Search.for_type('mandate', params[:page] || 0, params[:sort] || 'relevance'))
  end

  Endpoint.get('/feed/representations')
    .param(:sort, String, "Sort string", optional: true)
    .param(:page, Integer, "Page to return", optional: true) do
    json_response(Search.for_type(['digital_representation', 'physical_representation'], params[:page] || 0, params[:sort] || 'relevance'))
  end

  Endpoint.get('/feed/digital_representations')
    .param(:sort, String, "Sort string", optional: true)
    .param(:page, Integer, "Page to return", optional: true) do
    json_response(Search.for_type('digital_representation', params[:page] || 0, params[:sort] || 'relevance'))
  end

  Endpoint.get('/feed/physical_representations')
    .param(:sort, String, "Sort string", optional: true)
    .param(:page, Integer, "Page to return", optional: true) do
    json_response(Search.for_type('physical_representation', params[:page] || 0, params[:sort] || 'relevance'))
  end

  Endpoint.get('/feed/:qsa_id_prefixed')
    .param(:qsa_id_prefixed, String, "Record QSA ID with prefix") do
    begin
      if record = Search.get_record_by_qsa_id(params[:qsa_id_prefixed])
        Search.resolve_refs!(record)
        json_response(record)
      else
        [404]
      end
    rescue
      $LOG.error($!)

      [404]
    end
  end

  Endpoint.get('/feed/:qsa_id_prefixed/children')
    .param(:page, Integer, "Page to return", optional: true)
    .param(:qsa_id_prefixed, String, "Record QSA ID with prefix") do
    begin
      if record = Search.get_record_by_qsa_id(params[:qsa_id_prefixed])
        json_response(Search.children(record.fetch('id'), params[:page] || 0))
      else
        [404]
      end
    rescue
      $LOG.error($!)

      [404]
    end
  end


  Endpoint.get('/feed/:qsa_id_prefixed/context')
    .param(:qsa_id_prefixed, String, "Record QSA ID with prefix") do
    begin
      if (raw_record = Search.get_record_by_qsa_id(params[:qsa_id_prefixed], true)) && raw_record['primary_type'] == 'archival_object'
        # show 10 records either side + 5 children
        position = raw_record['position']
        record = JSON.parse(raw_record.fetch('json'))
        min_sibling_position = [0, position - 5].max
        max_sibling_position = (10 - min_sibling_position) + position

        json_response({
                        'path_to_root' => Search.resolve_refs!(record['ancestors']),
                        'siblings' => Search.children(raw_record.fetch('parent_id'), 0, 'position_asc', min_sibling_position, max_sibling_position).fetch('results'),
                        'children' => Search.children(raw_record.fetch('id'), 0, 'position_asc', 0, 4).fetch('results'),
                      })
      else
        [404]
      end
    rescue
      $LOG.error($!)

      [404]
    end
  end
end