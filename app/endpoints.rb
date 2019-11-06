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
          Search.filter_representations!(record)
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

    errors = params[:user].validate
    next json_response(errors: errors) unless errors.empty?

    errors = Users.create_from_dto(params[:user])
    next json_response(errors: errors) unless errors.empty?

    user = Users.get_for_email(params[:user].fetch(:email))
    session = Sessions.create_session(user.fetch('id'))
    DeferredTasks.add_welcome_notification_tasks(user)

    json_response(status: 'created',
                  session: session)
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

    limit = RateLimiter.apply_rate_limit(request.ip)
    user_limit = RateLimiter.apply_rate_limit(Users.normalise_email(params[:email]))

    if limit.rate_limited || user_limit.rate_limited
      json_response(authenticated: false,
                    delay_seconds: [limit.delay_seconds, user_limit.delay_seconds].max)
    elsif DBAuth.authenticate(params[:email], params[:password])
      user = Users.get_for_email(params[:email])

      session_id = Sessions.create_session(user.fetch('id'))
      json_response(authenticated: true, session_id: session_id)
    else
      json_response(authenticated: false, delay_seconds: 0)
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

    unless Ctx.user_logged_in?
      Ctx.log_bad_access("anonymous access attempted to update user #{params[:user].fetch('id')}")
      next [404]
    end

    existing_user = Users.get(params[:user].fetch('id'))
    logged_in_user = Users.get(Ctx.get.session.user_id)

    can_edit = existing_user && (logged_in_user.fetch('is_admin') ||
                                 existing_user.fetch('id') == logged_in_user.fetch('id'))

    unless can_edit
      Ctx.log_bad_access("attempted to update user #{params[:user].fetch('id')}")
      next [404]
    end

    errors = params[:user].validate

    unless errors.empty?
      next json_response(errors: errors) unless errors.empty?
    end

    errors = if logged_in_user.fetch('is_admin')
               Users.admin_update_from_dto(params[:user])
             else
               Users.update_from_dto(params[:user])
             end

    if errors.empty?
      json_response(status: 'updated')
    else
      json_response(errors: errors)
    end
  end

  Endpoint.post('/api/users/update_password')
    .param(:current_password, String, "Current password")
    .param(:password, String, "New Password")
    .param(:confirm_password, String, "Confirm new password") do

    next [404] unless Ctx.user_logged_in?

    logged_in_user = Users.get(Ctx.get.session.user_id)

    if (errors = Users.update_password(logged_in_user.fetch('id'),
                                       params[:current_password],
                                       params[:password],
                                       params[:confirm_password])).empty?
      json_response(status: 'updated')
    else
      json_response(errors: errors)
    end
  end

  Endpoint.get('/api/admin/users')
    .param(:q, String, "Filter user", optional: true)
    .param(:start_date, String, "Filter after start date", optional: true)
    .param(:end_date, String, "Filter before start date", optional: true)
    .param(:page, Integer , "Page to return", optional: true) do

    next [404] unless Ctx.user_logged_in?
    logged_in_user = Users.get(Ctx.get.session.user_id)

    if logged_in_user.fetch('is_admin')
      json_response(Users.page(params[:page] || 0, params[:q], DateParse.date_parse_down(params[:start_date]), DateParse.date_parse_up(params[:end_date])))
    else
      [404]
    end
  end

  Endpoint.get('/api/admin/user')
    .param(:user_id, Integer, "User id") do

    next [404] unless Ctx.user_logged_in?
    logged_in_user = Users.get(Ctx.get.session.user_id)

    if logged_in_user.fetch('is_admin')
      json_response(Users.get(params[:user_id]))
    else
      [404]
    end
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

    next [404] unless Ctx.user_logged_in?

    if Search.exists?(params[:item_id])
      Carts.add_item(Ctx.get.session.user_id, params[:request_type], params[:item_id])
      json_response({status: 'added'})
    else
      [404, "Record does not exist"]
    end
  end

  Endpoint.post('/api/users/cart/remove_item')
    .param(:id, String, "Cart item ID") do

    next [404] unless Ctx.user_logged_in?

    Carts.remove_item(Ctx.get.session.user_id, params[:id])
    json_response({status: 'removed'})
  end

  Endpoint.post('/api/users/cart/create_reading_room_requests')
    .param(:date_required, String, "Date of pick up from reading room", optional: true)
    .param(:agency_fields, String, "JSON Blob of agency fields", optional: true) do

    next [404] unless Ctx.user_logged_in?

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

    Carts.clear(Ctx.get.session.user_id, Carts::REQUEST_TYPE_READING_ROOM)

    json_response({status: 'success'})
  end

  Endpoint.post('/api/users/cart/create_digital_copy_quote_requests') do
    next [404] unless Ctx.user_logged_in?

    Carts.handle_digital_copy_quote_records(Ctx.get.session.user_id)

    json_response({status: 'success'})
  end

  Endpoint.get('/api/generate_token')
    .param(:email, String, "User email to reset") do
    email_match = Users.get_for_email(params[:email])

    if email_match
      result = DBAuth.set_recovery_token(email_match.fetch('id'))

      if result != 1
        $LOG.warn("Unable to update record. Response: #{result}")
      end

      DeferredTasks.add_password_reset_notification_task(email_match, host_service_url(env))
    end
    [200]
  end

  Endpoint.get('/api/token_update_password')
      .param(:token, String, "Recovery token")
      .param(:password, String, "New password")
      .param(:confirm_password, String, "Confirm password") do

    if Users.valid_password?(params[:password])
      result = DBAuth.update_password_from_token(params[:token], params[:password], params[:confirm_password])
    else
      result = {errors: [{message: Users::WEAK_PASSWORD_MSG}]}
    end

    json_response(result)
  end

  Endpoint.get('/api/users/requests') do
    next [404] unless Ctx.user_logged_in?

    json_response(Requests.all(Ctx.get.session.user_id))
  end

  Endpoint.post('/api/users/cart/clear')
    .param(:request_type, String, "Request Type") do

    next [404] unless Ctx.user_logged_in?

    Carts.clear(Ctx.get.session.user_id, params[:request_type])
    json_response({status: 'success'})
  end

  Endpoint.post('/api/users/cart/update_items')
    .param(:request_type, String, "Request Type")
    .param(:cart_items, [CartItemDTO], "Cart Items (those missing will be removed)", optional: true) do

    next [404] unless Ctx.user_logged_in?

    Carts.update_items(Ctx.get.session.user_id, params[:request_type], Array(params[:cart_items]))
    json_response({status: 'success'})
  end

  Endpoint.post('/api/admin/become_user')
    .param(:user_id, Integer, "User ID") do

    next [404] unless Ctx.user_logged_in?
    logged_in_user = Users.get(Ctx.get.session.user_id)

    next [404] unless logged_in_user.fetch('is_admin')

    user_to_become = Users.get(params[:user_id])
    if user_to_become
      session_id = Sessions.create_session(user_to_become.fetch('id'))
      json_response(session_id: session_id)
    else
      raise 'user does not exist'
    end
  end

  Endpoint.get('/api/digital_copy_pricing') do
    json_response(Carts.get_pricing)
  end

  Endpoint.post('/api/submit_order')
    .param(:deliveryMethod, String, "Delivery method")
    .param(:registeredPost, String, "Registered post?") \
    .param(:minicartId, String, "Minicart ID") \
  do
    next [404] unless Ctx.user_logged_in?

    cart = Carts.get(Ctx.get.session.user_id)

    $LOG.info("Submitting order for user #{Ctx.get.session.user_id}")

    minicart = Minicart.new(params[:minicartId], host_service_url(env))

    minicart.add_cart(cart)
    minicart.add_registered_post if params[:registeredPost] == 'true'
    minicart.set_delivery_method(params[:deliveryMethod])

    minicart.submit!

    cart.fetch(:digital_copy_requests).fetch(:set_price_records).each do |item|
      Carts.remove_item(Ctx.get.session.user_id, item.fetch(:id))
    end

    $LOG.info("Order succeeded for user #{Ctx.get.session.user_id}")

    [200]
  end

  Endpoint.get('/api/tags')
    .param(:record_id, String, "Record SOLR ID") \
  do
    json_response(Tags.for_record(params[:record_id]))
  end

  Endpoint.get('/api/tags/preview')
    .param(:tag, String, "Tag text to preview") \
  do
    json_response(tag_preview: Tags.normalize(params[:tag]))
  end

  Endpoint.post('/api/tags')
    .param(:tag, TagDTO, "Tag") \
  do
    unless Ctx.captcha_verified?
      next json_response(errors: [{code: 'RECAPTCHA_ERROR', field: 'Captcha is required'}])
    end

    errors = params[:tag].validate
    json_response(errors: errors) unless errors.empty?

    if (errors = Tags.create_from_dto(params[:tag])).empty?
      json_response({status: 'success'})
    else
      json_response(errors: errors)
    end
  end

  Endpoint.post('/api/tags/flag')
    .param(:tag_id, Integer, "Tag Id") \
  do
    unless Ctx.captcha_verified?
      next json_response(errors: [{code: 'RECAPTCHA_ERROR', field: 'Captcha is required'}])
    end

    Tags.flag(params[:tag_id])
    json_response({status: 'success'})
  end

  Endpoint.get('/api/tags/flagged') do
    next [404] unless Ctx.user_logged_in?

    logged_in_user = Users.get(Ctx.get.session.user_id)

    if logged_in_user.fetch('is_admin')
      json_response(Tags.all_flagged_tags)
    else
      [404]
    end
  end

  Endpoint.get('/api/tags/banned') do
    next [404] unless Ctx.user_logged_in?

    logged_in_user = Users.get(Ctx.get.session.user_id)
    if logged_in_user.fetch('is_admin')
      json_response(Tags.all_banned_tags)
    else
      [404]
    end
  end

  Endpoint.post('/api/tags/moderate')
    .param(:tag_id, Integer, "Tag Id")
    .param(:action, String, "Action to perform") \
  do
    next [404] unless Ctx.user_logged_in?

    logged_in_user = Users.get(Ctx.get.session.user_id)
    next [404] unless logged_in_user.fetch('is_admin')

    if params[:action] == 'unflag'
      Tags.unflag(params[:tag_id])
    elsif params[:action] == 'delete'
      Tags.delete(params[:tag_id])
    elsif params[:action] == 'ban'
      Tags.ban(params[:tag_id])
    end

    json_response({status: 'success'})
  end

  Endpoint.post('/api/tags/add-to-banned')
    .param(:tag, [String], "List of Tags") \
  do
    next [404] unless Ctx.user_logged_in?

    logged_in_user = Users.get(Ctx.get.session.user_id)
    next [404] unless logged_in_user.fetch('is_admin')

    Tags.add_to_banned_list(params[:tag])
    json_response({status: 'success'})
  end

  Endpoint.post('/api/tags/remove-from-banned')
    .param(:tag, [String], "List of Tags") \
  do
    next [404] unless Ctx.user_logged_in?

    logged_in_user = Users.get(Ctx.get.session.user_id)
    next [404] unless logged_in_user.fetch('is_admin')

    Tags.remove_from_banned_list(params[:tag])
    json_response({status: 'success'})
  end

  Endpoint.post('/api/verify-captcha')
    .param(:captcha_token, String, "Captcha token") \
  do
    if (errors = Recaptcha.verify_token(params[:captcha_token])).empty?
      Ctx.set_captcha_verified!
      json_response({status: 'success'})
    else
      json_response(errors: errors)
    end
  end

  Endpoint.get('/api/captcha-verified') do
    json_response({status: Ctx.captcha_verified? ? 'verified' : 'unverified'})
  end

  Endpoint.get('/api/download_file/:qsa_id')
    .param(:qsa_id, String, 'QSA Id') do
    record = Search.get_record_by_qsa_id(params[:qsa_id])

    next [404] if record.nil?
    next [404] if record.fetch('jsonmodel_type') != 'digital_representation'
    next [404] if record.fetch('representation_file', nil).nil?
    next [404] if record.fetch('representation_file').fetch('key', nil).nil?

    mime_type_match = MIME::Types[record.fetch('representation_file').fetch('mime_type')]
    extension = mime_type_match.nil? ? 'unknown' : mime_type_match.first.preferred_extension

    [
      200,
      {
        'Content-Type' => record.fetch('representation_file').fetch('mime_type'),
        'Last-Modified' => Time.now.ctime,
        'Content-Disposition' => "attachment; filename=#{params[:qsa_id]}.#{extension}"
      },
      ByteStorage.get.to_enum(:get_stream, record.fetch('representation_file').fetch('key'))
    ]
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
      headers('Cache-Control' => "no-cache")
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
        headers('Cache-Control' => "no-cache")
        send_file(File.join(STATIC_DIR, 'index.html'))
      end
    end
  end

  private

  def host_service_url(rack_env)
    scheme = rack_env['X_FORWARDED_PROTO'] || rack_env['rack.url_scheme'] || 'http'
    host = rack_env['HTTP_HOST']
    "#{scheme}://#{host}"
  end
end
