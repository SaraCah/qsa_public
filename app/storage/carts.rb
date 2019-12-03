class Carts < BaseStorage

  REQUEST_TYPE_READING_ROOM = "READING_ROOM"
  REQUEST_TYPE_DIGITAL_COPY = "DIGITAL_COPY"
  VALID_REQUEST_TYPES = [REQUEST_TYPE_READING_ROOM, REQUEST_TYPE_DIGITAL_COPY]

  DIGITAL_COPY_SET_PRICE = "SET_PRICE"
  DIGITAL_COPY_QUOTE_REQUIRED = "QUOTE_REQUIRED"


  def self.build_cart_item_hash(user_id, item_id, request_type)
    Digest::MD5.hexdigest([user_id, item_id, request_type].inspect)
  end

  def self.set_price_request?(request)
    if request[:record].fetch('availability') == 'unavailable_due_to_conservation'
      return false
    end

    request[:price]
  end

  def self.get(user_id)
    items = db[:cart_item]
      .filter(user_id: user_id)
      .map do |row|
      {
        id: row[:id],
        item_id: row[:item_id],
        request_type: row[:request_type],
        options: CartItemDTO.from_row(row),
      }
    end

    documents = Search.resolve_refs!(Search.get_records_by_ids(items.map{|item| item.fetch(:item_id)}))

    items = items.map do |item|
      record = documents.fetch(item.fetch(:item_id), nil)
      next unless record
      item.merge(:record => record)
    end.compact

    reading_room_requests = items.select{|item| item[:request_type] == REQUEST_TYPE_READING_ROOM}
    digital_copy_requests = items.select{|item| item[:request_type] == REQUEST_TYPE_DIGITAL_COPY}

    add_pricing_to_requests(digital_copy_requests)
    digital_copy_requests.each do |request|
      request[:digital_copy_request_type] = set_price_request?(request) ? DIGITAL_COPY_SET_PRICE : DIGITAL_COPY_QUOTE_REQUIRED
    end

    cart = {
      reading_room_requests: {
        total_count: reading_room_requests.count,
        open_records: reading_room_requests.select{|item| item[:record].fetch('rap_access_status') == 'Open Access'},
        closed_records: reading_room_requests.select{|item| item[:record].fetch('rap_access_status') == 'Restricted Access'}.group_by{|item| item[:record].fetch('responsible_agency').fetch('ref')},
        agencies: [],
      },
      digital_copy_requests: {
        total_count: digital_copy_requests.count,
        set_price_records: digital_copy_requests.select {|r| r[:digital_copy_request_type] == DIGITAL_COPY_SET_PRICE},
        quotable_records: digital_copy_requests.select {|r| r[:digital_copy_request_type] == DIGITAL_COPY_QUOTE_REQUIRED},
      },
    }

    # FIXME filter only fields we need: qsa_id_prefixed, display_string
    cart[:reading_room_requests][:agencies] = Search.get_records_by_uris(cart[:reading_room_requests][:closed_records].keys)

    cart
  end

  # Adds a :price key to any request whose record has set pricing.
  def self.add_pricing_to_requests(digital_copy_requests)
    request_to_linked_uris = digital_copy_requests.map {|request|
      [
        request,
        [
          request[:record].fetch('controlling_record').fetch('ref'),
          *Array(request[:record].dig('controlling_record', '_resolved', 'ancestors')).map {|a| a['ref']}
        ]
      ]
    }.to_h

    DB.open do |db|
      prices_by_uri = db[:digital_copy_pricing]
                        .filter(:aspace_record_uri => request_to_linked_uris.values.flatten,
                                :active => 1)
                        .select(:aspace_record_uri, :price_cents)
                        .map {|row| [row[:aspace_record_uri], row[:price_cents]]}
                        .to_h

      request_to_linked_uris.each do |request, linked_uris|
        # Our linked URIs are in order of most specific to least specific
        # (controlling record through to series).  This allows prices to be set
        # at the series level but overridden at a lower point in the tree.
        linked_uris.each do |uri|
          if prices_by_uri.include?(uri)
            request[:price] ||= prices_by_uri[uri]
          end
        end
      end
    end

    digital_copy_requests
  end


  def self.update_items(user_id, request_type, cart_item_dtos)
    cart_item_dtos.each do |cart_item_dto|
      cart_item_options = cart_item_dto.to_hash
      cart_item_options.delete(:id)

      db[:cart_item]
        .filter(user_id: user_id)
        .filter(id: cart_item_dto.fetch('id'))
        .update(cart_item_options)
    end
  end

  def self.add_item(user_id, request_type, item_id)
    raise "Request type not supported: #{request_type}" unless VALID_REQUEST_TYPES.include?(request_type)

    values = {
      user_id: user_id,
      request_type: request_type,
      item_id: item_id,
      uniq_hash: build_cart_item_hash(user_id, item_id, request_type)
    }

    # apply defaults for digital copies
    if request_type == REQUEST_TYPE_DIGITAL_COPY
      values['digital_copy_type'] = 'digital copy'
      values['digital_copy_delivery'] = 'email'
      values['digital_copy_format'] = 'pdf'
      values['digital_copy_resolution'] = '300dpi'
    end

    begin
      db[:cart_item]
        .insert(values)
    rescue Sequel::UniqueConstraintViolation
      # ok it's already in there
    end
  end

  def self.clear(user_id, request_type)
    raise "Request type not supported: #{request_type}" unless VALID_REQUEST_TYPES.include?(request_type)

    db[:cart_item]
      .filter(user_id: user_id)
      .filter(request_type: request_type)
      .delete
  end

  def self.remove_item(user_id, cart_item_id)
    db[:cart_item]
      .filter(user_id: user_id)
      .filter(id: cart_item_id)
      .delete
  end

  def self.handle_digital_copy_quote_records(user_id)
    user = Users.get(user_id)
    cart = get(user_id)

    now = java.lang.System.currentTimeMillis
    quote_request_id = db[:quote_request].insert(:user_id => user_id, :create_time => now, :modified_time => now)

    quote_request_items = cart.fetch(:digital_copy_requests).fetch(:quotable_records, []).map {|cart_item|
      item = cart_item.fetch(:options).to_hash.merge(:quote_request_id => quote_request_id,
                                                     :item_id => cart_item.fetch(:item_id))

      item.delete(:id)
      item
    }

    db[:quote_request_item].multi_insert(quote_request_items)

    # remove from the cart
    db[:cart_item]
      .filter(user_id: user_id)
      .filter(id: cart.fetch(:digital_copy_requests).fetch(:quotable_records, []).map{|cart_item| cart_item[:id]})
      .delete

    DeferredTasks.add_digital_copy_quote_request_task(quote_request_id, user)
  end

  def self.handle_open_records(user_id, date_required, time_required)
    now = Time.now

    user = Users.get(user_id)
    cart = get(user_id)

    cart[:reading_room_requests][:open_records].each do |item|
      db[:reading_room_request]
        .insert(
          user_id: user_id,
          item_id: item.fetch(:record).fetch('id'),
          item_uri: item.fetch(:record).fetch('uri'),
          status: 'PENDING',
          date_required: date_required ? date_required.to_time.to_i * 1000 : date_required,
          time_required: time_required,
          created_by: user.fetch('email'),
          modified_by: user.fetch('email'),
          create_time: now.to_i * 1000,
          modified_time: now.to_i * 1000,
          system_mtime: now,
        )

      remove_item(user_id, item.fetch(:id))
    end
  end

  def self.handle_closed_records(user_id, agency_fields)
    now = Time.now

    user = Users.get(user_id)
    cart = get(user_id)

    cart[:reading_room_requests][:closed_records].each do |agency_uri, closed_items|
      agency_id = "agent_corporate_entity:#{agency_uri.split('/').last}"

      agency_request_id = db[:agency_request]
                            .insert(
                              user_id: user_id,
                              agency_id: agency_id,
                              agency_uri: agency_uri,
                              status: 'PENDING',
                              purpose: agency_fields.fetch(agency_uri).fetch('purpose'),
                              publication_details: agency_fields.fetch(agency_uri).fetch('publication_details'),
                              created_by: user.fetch('email'),
                              modified_by: user.fetch('email'),
                              create_time: now.to_i * 1000,
                              modified_time: now.to_i * 1000,
                              system_mtime: now,
                              )

      closed_items.each do |item|
        db[:agency_request_item]
          .insert(
            agency_request_id: agency_request_id,
            item_id: item.fetch(:record).fetch('id'),
            item_uri: item.fetch(:record).fetch('uri'),
            status: 'PENDING',
            created_by: user.fetch('email'),
            modified_by: user.fetch('email'),
            create_time: now.to_i * 1000,
            modified_time: now.to_i * 1000,
            system_mtime: now,
          )

        db[:reading_room_request]
          .insert(
            agency_request_id: agency_request_id,
            user_id: user_id,
            item_id: item.fetch(:record).fetch('id'),
            item_uri: item.fetch(:record).fetch('uri'),
            status: 'AWAITING_AGENCY_APPROVAL',
            date_required: nil,
            time_required: nil,
            created_by: user.fetch('email'),
            modified_by: user.fetch('email'),
            create_time: now.to_i * 1000,
            modified_time: now.to_i * 1000,
            system_mtime: now,
            )

        remove_item(user_id, item.fetch(:id))
      end

      DeferredTasks.add_closed_record_request_task(agency_request_id, user)
    end
  end

  def self.get_pricing
    db[:digital_copy_pricing]
      .filter(Sequel.~(:type => 'record'))
      .filter(:active => 1).map {|row|
      [row[:type], row[:price_cents]]
    }.to_h
  end

  def self.store_set_price_request(user_id, cart, notify_key, order_id)
    now = Time.now

    request_id = db[:set_price_request]
                   .insert(
                     user_id: user_id,
                     status: 'pending',
                     notify_key: notify_key,
                     generated_order_id: order_id,
                     create_time: now.to_i * 1000,
                     modified_time: now.to_i * 1000,
                   )

    cart.fetch(:digital_copy_requests).fetch(:set_price_records).each do |item|
      Carts.remove_item(Ctx.get.session.user_id, item.fetch(:id))
    end
  end

  def self.minicart_notify(notify_key)
    now = Time.now
    request = db[:set_price_request][notify_key: notify_key]

    raise "Request for notify key not found: #{notify_key}" if request.nil?

    user = Users.get(request[:user_id])
    summary = Minicart.retrieve_order_summary(request[:generated_order_id])

    if summary.paid
      hits = db[:set_price_request]
              .filter(notify_key: notify_key)
              .filter(status: 'pending')
              .update(
                status: "paid",
                modified_time: now.to_i * 1000,
              )

      if hits > 0
        DeferredTasks.add_set_price_request_notification_task(request[:generated_order_id],
                                                              summary.order_details,
                                                              user)
        return true
      end
    end

    false
  end

  def self.minicart_notify_all
    count = 0

    db[:set_price_request].filter(status: 'pending').each do |row|
      if self.minicart_notify(row[:notify_key])
        count += 1
      end
    end

    count
  end
end
