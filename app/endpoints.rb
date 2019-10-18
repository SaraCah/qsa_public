require 'pp'

class QSAPublic < Sinatra::Base

  Endpoint.post('/api/error_report') do
    error_report = JSON.parse(request.body.read)

    Array(error_report['errors']).each do |error|
      $LOG.error(error.pretty_inspect)
    end

    Array(error_report['consoleMessages']).each do |msg|
      case msg['method']
          when 'warn' then
            $LOG.warn(msg['arguments'].pretty_inspect)
          when 'error' then
            $LOG.error(msg['arguments'].pretty_inspect)
          else
            $LOG.info(msg['arguments'].pretty_inspect)
      end
    end

    [200]
  end

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
    .param(:query, AdvancedSearchQuery, "Search Query")
    .param(:sort, String, "Sort string", optional: true)
    .param(:page, Integer, "Page to return (zero-indexed)", optional: true) do

    json_response(Search.advanced(page: params[:page],
                                  sort: params[:sort],
                                  query: params[:query]))
  end


  Endpoint.get('/api/fetch')
    .param(:qsa_id, String, "Record QSA ID with prefix", optional: true)
    .param(:uri, String, "Record URI", optional: true)
    .param(:id, String, "Record SOLR ID", optional: true)
    .param(:type, String, "Scope to record type", optional: true) do
    response = [404]

    begin
      # FIXME scope fetch by type if provided
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
    .param(:id, String, "Record SOLR ID", optional: true)
    .param(:type, String, "Scope to record type", optional: true) do
    begin
      response = [404]

      if raw_record = Search.get_raw(qsa_id: params[:qsa_id],
                                     uri: params[:uri],
                                     id: params[:id])
        if raw_record['primary_type'] == 'archival_object'
          # show 8 siblings and self (max 9 siblings) + 5 children
          position = raw_record['position']
          record = JSON.parse(raw_record.fetch('json'))

          siblings_count = Search.children(raw_record.fetch('parent_id'), 0).fetch('total_count')

          response = json_response(current_uri: record.fetch('uri'),
                                   path_to_root: Search.resolve_refs!(record['ancestors']).map{|ref| ref['_resolved']},
                                   siblings: Search.siblings(raw_record, 4).map {|doc| JSON.parse(doc['json'])},
                                   children: Search.children(raw_record.fetch('id'), 0, 'position_asc', 0, 4).fetch('results'),
                                   siblings_count: siblings_count,
                                   children_count: Search.children(raw_record.fetch('id'), 0).fetch('total_count'))
        elsif raw_record['primary_type'] == 'resource'
          record = JSON.parse(raw_record.fetch('json'))
          response = json_response(current_uri: record.fetch('uri'),
                                   path_to_root: [],
                                   siblings: [record],
                                   children: Search.children(raw_record.fetch('id'), 0, 'position_asc', 0, 19).fetch('results'),
                                   siblings_count: 0,
                                   children_count: Search.children(raw_record.fetch('id'), 0).fetch('total_count'))
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
            params_map = {
              name: opts['type'].is_a?(Array) ? "#{param}[]" : param,
              description: opts['description'],
              type: opts['type'].is_a?(Array) ? "Array of #{opts['type'][0]}" : opts['type'],
              required: !(opts['options'][:optional] == true),
            }

            if opts['type'].respond_to?(:endpoint_doc)
              params_map['type_doc'] = opts['type'].endpoint_doc
            end

            params_map
          }
        }
      }
    }

    json_response(endpoints)
  end

  Endpoint.get('/api/info') do
    Templates.emit_with_layout(:home,
                               {},
                               :layout,
                               {
                                 title: "QSA Public API Summary"
                               })
  end

  Endpoint.post('/api/users')
    .param(:user, UserFormDTO, "User to create", :body => true) do

    if (errors = params[:user].validate).empty?
      if (errors = Users.create_from_dto(params[:user])).empty?
        user = Users.get_for_email(params[:user].fetch(:email))
        session = Sessions.create_session(user.fetch('id'))

        json_response(status: 'created',
                      session: session)
      else
        json_response(errors: errors)
      end
    else
      json_response(errors: errors)
    end
  end

  Endpoint.post('/api/logout') do
    if Ctx.get.session
      Sessions.delete_session(Ctx.get.session.id)
    end

    json_response({ bye: "Bye!" })
  end

  Endpoint.post('/api/authenticate')
    .param(:email, String, "Email to authenticate")
    .param(:password, String, "Password") do
    if DBAuth.authenticate(params[:email], params[:password])
      user = Users.get_for_email(params[:email])

      session_id = Sessions.create_session(user.fetch('id'))
      json_response(authenticated: true, session_id: session_id)
    else
      json_response(authenticated: false)
    end
  end

  Endpoint.get('/api/logged_in_user') do
    if Ctx.get.session
      json_response(Users.get(Ctx.get.session.user_id))
    else
      [403]
    end
  end

  Endpoint.post('/api/users/update')
    .param(:user, UserFormDTO, "User") do
    if Ctx.user_logged_in?
      existing_user = Users.get(params[:user].fetch('id'))
      logged_in_user = Users.get(Ctx.get.session.user_id)

      can_edit = existing_user && (logged_in_user.fetch('is_admin') || existing_user.fetch('id') == logged_in_user.fetch('id')) 

      if can_edit
        if (errors = params[:user].validate).empty?
          if logged_in_user.fetch('is_admin')
            if (errors = Users.admin_update_from_dto(params[:user])).empty?
              json_response(status: 'updated')
            else
              json_response(errors: errors)
            end
          else
            if (errors = Users.update_from_dto(params[:user])).empty?
              json_response(status: 'updated')
            else
              json_response(errors: errors)
            end
          end
        else
          json_response(errors: errors) unless errors.empty?
        end
      else
        Ctx.log_bad_access("attempted to update user #{params[:user].fetch('id')}")
        [404]
      end
    else
      Ctx.log_bad_access("anonymous access attempted to update user #{params[:user].fetch('id')}")
      [404]
    end
  end

  Endpoint.post('/api/users/update_password')
    .param(:current_password, String, "Current password")
    .param(:password, String, "New Password")
    .param(:confirm_password, String, "Confirm new password") do
    if Ctx.user_logged_in?
      logged_in_user = Users.get(Ctx.get.session.user_id)

      if (errors = Users.update_password(logged_in_user.fetch('id'), params[:current_password], params[:password], params[:confirm_password])).empty?
        json_response(status: 'updated')
      else
        json_response(errors: errors)
      end
    else
      [404]
    end
  end

  Endpoint.get('/api/admin/users')
    .param(:q, String, "Filter user", optional: true)
    .param(:start_date, String, "Filter after start date", optional: true)
    .param(:end_date, String, "Filter before start date", optional: true)
    .param(:page, Integer , "Page to return", optional: true) do
    if Ctx.user_logged_in?
      logged_in_user = Users.get(Ctx.get.session.user_id)
      if logged_in_user.fetch('is_admin')
        json_response(Users.page(params[:page] || 0, params[:q], DateParse.date_parse_down(params[:start_date]), DateParse.date_parse_up(params[:end_date])))
      else
        [404]
      end
    else
      [404]
    end
  end

  Endpoint.get('/api/admin/user')
    .param(:user_id, Integer, "User id") do
    if Ctx.user_logged_in?
      logged_in_user = Users.get(Ctx.get.session.user_id)
      if logged_in_user.fetch('is_admin')
        json_response(Users.get(params[:user_id]))
      else
        [404]
      end
    else
      [404]
    end
  end

  Endpoint.get('/api/fetch')
    .param(:qsa_id, String, "Record QSA ID with prefix", optional: true)
    .param(:uri, String, "Record URI", optional: true)
    .param(:id, String, "Record SOLR ID", optional: true)
    .param(:type, String, "Scope to record type", optional: true) do
    response = [404]

    begin
      # FIXME scope fetch by type if provided
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

  Endpoint.get('/api/users/cart') do
    if Ctx.user_logged_in?
      json_response(Carts.get(Ctx.get.session.user_id))
    else
      [404]
    end
  end

  Endpoint.post('/api/users/cart/add_item')
    .param(:request_type, String, "Type of request")
    .param(:item_id, String, "SOLR document ID for the record") do
    if Ctx.user_logged_in?
      if Search.exists?(params[:item_id])
        Carts.add_item(Ctx.get.session.user_id, params[:request_type], params[:item_id])
        json_response({status: 'added'})
      else
        [404, "Record does not exist"]
      end
    else
      [404]
    end
  end

  Endpoint.post('/api/users/cart/remove_item')
    .param(:id, String, "Cart item ID") do
    if Ctx.user_logged_in?
      Carts.remove_item(Ctx.get.session.user_id, params[:id])
      json_response({status: 'removed'})
    else
      [404]
    end
  end

  Endpoint.post('/api/users/cart/create_reading_room_requests')
    .param(:date_required, String, "Date of pick up from reading room", optional: true)
    .param(:agency_fields, String, "JSON Blob of agency fields", optional: true) do
    if Ctx.user_logged_in?
      date_required = nil
      if params[:date_required]
        begin
          date_required = Date.parse(params[:date_required])
        rescue
        end
      end

      agency_fields = {}
      if params[:agency_fields]
        agency_fields = JSON.parse(params[:agency_fields])
      end

      Carts.handle_open_records(Ctx.get.session.user_id, date_required)
      Carts.handle_closed_records(Ctx.get.session.user_id, agency_fields)

      json_response({status: 'success'})
    else
      [404]
    end
  end
  Endpoint.get('/api/generate_token')
    .param(:email, String, "User email to reset") do
    email_match = Users.get_for_email(params[:email])

    if email_match
      result = DBAuth.set_recovery_token(email_match.fetch('id'))
      if result != 1
        $LOG.warn("Unable to update record. Response: #{result}")
      end
    end
    [200]
  end

  Endpoint.get('/api/token_update_password')
      .param(:token, String, "Recovery token")
      .param(:password, String, "New password") do

    result = DBAuth.update_password_from_token(params[:token], params[:password])

    json_response(result)
  end

  Endpoint.get('/api/users/requests') do
    if Ctx.user_logged_in?
      json_response(Requests.all(Ctx.get.session.user_id))
    else
      [404]
    end
  end

  Endpoint.post('/api/users/cart/clear')
    .param(:request_type, String, "Request Type") do
    if Ctx.user_logged_in?
      Carts.clear(Ctx.get.session.user_id, params[:request_type])
      json_response({status: 'success'})
    else
      [404]
    end
  end

  if !defined?(STATIC_DIR) 
    STATIC_DIR = File.realpath(File.absolute_path(File.join(File.dirname(__FILE__), '..', 'static')))
  end

  if QSAPublic.development?
    # Delete any matching route from a previous reload
    new_uri = compile('/*')

    method_routes = @routes.fetch('GET', [])

    route_to_replace = method_routes.find do |route_def|
      uri = route_def[0]
      uri.safe_string == new_uri.safe_string
    end

    if route_to_replace
      method_routes.delete(route_to_replace)
    end
  end

  # !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  #  Don't put other endpoints after this one or they'll be overridden by splat
  # !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  get '/*' do
    if request.path == '/'
      send_file(File.join(STATIC_DIR, 'index.html'))
    else
      requested_file = begin
                         File.realpath(File.absolute_path(File.join(STATIC_DIR, request.path)))
                       rescue Errno::ENOENT
                         ""
                       end

      if requested_file.start_with?(STATIC_DIR) && File.exist?(requested_file)
        if request.path =~ /\.[a-f0-9]{8}\./
          # Cache built assets more aggressively
          headers('Cache-Control' => "max-age=86400, public",
                  'Expires' => (Time.now + 86400).utc.rfc2822)
        end

        send_file requested_file
      else
        send_file(File.join(STATIC_DIR, 'index.html'))
      end
    end
  end
end
