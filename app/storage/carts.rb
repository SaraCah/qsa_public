class Carts < BaseStorage

  REQUEST_TYPE_READING_ROOM = "READING_ROOM"
  REQUEST_TYPE_DIGITAL_COPY = "DIGITAL_COPY"
  VALID_REQUEST_TYPES = [REQUEST_TYPE_READING_ROOM, REQUEST_TYPE_DIGITAL_COPY]

  def self.build_cart_item_hash(user_id, item_id, request_type)
    Digest::MD5.hexdigest([user_id, item_id, request_type].inspect)
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

    (digital_copy_set_price_requests, digital_copy_quotable_requests) = group_by_pricing_scheme(digital_copy_requests)

    cart = {
      reading_room_requests: {
        total_count: reading_room_requests.count,
        open_records: reading_room_requests.select{|item| item[:record].fetch('rap_access_status') == 'Open Access'},
        closed_records: reading_room_requests.select{|item| item[:record].fetch('rap_access_status') == 'Restricted Access'}.group_by{|item| item[:record].fetch('responsible_agency').fetch('ref')},
        agencies: [],
      },
      digital_copy_requests: {
        total_count: digital_copy_requests.count,
        set_price_records: digital_copy_set_price_requests,
        quotable_records: digital_copy_quotable_requests,
      },
    }

    # FIXME filter only fields we need: qsa_id_prefixed, display_string
    cart[:reading_room_requests][:agencies] = Search.get_records_by_uris(cart[:reading_room_requests][:closed_records].keys)

    cart
  end

  def self.group_by_pricing_scheme(digital_copy_requests)
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
      set_price_uris = Set.new(db[:digital_copy_pricing]
                                 .filter(:aspace_record_uri => request_to_linked_uris.values.flatten)
                                 .map(:aspace_record_uri))

      set_price_requests = []
      quote_requests = []

      request_to_linked_uris.each do |request, linked_uris|
        if linked_uris.any? {|uri| set_price_uris.include?(uri)}
          set_price_requests << request
        else
          quote_requests << request
        end
      end

      [set_price_requests, quote_requests]
    end
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

    cart_item_ids = cart_item_dtos.map{|dto| dto.fetch('id')}
    db[:cart_item]
      .filter(user_id: user_id)
      .filter(request_type: request_type)
      .filter(Sequel.~(id: cart_item_ids))
      .delete
  end

  def self.add_item(user_id, request_type, item_id)
    raise "Request type not supported: #{request_type}" unless VALID_REQUEST_TYPES.include?(request_type)

    begin
      db[:cart_item]
        .insert(user_id: user_id,
                request_type: request_type,
                item_id: item_id,
                uniq_hash: build_cart_item_hash(user_id, item_id, request_type))
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

    # create a task to email the archivist
    db[:deferred_task]
      .insert(type: 'quote_request',
              blob: {
                quote_request_id: quote_request_id,
              }.to_json,
              status: DeferredTaskRunner::PENDING_STATUS,
              retries_remaining: 10,
              create_time: java.lang.System.currentTimeMillis)
  end

  def self.handle_open_records(user_id, date_required)
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
            created_by: user.fetch('email'),
            modified_by: user.fetch('email'),
            create_time: now.to_i * 1000,
            modified_time: now.to_i * 1000,
            system_mtime: now,
            )

        remove_item(user_id, item.fetch(:id))
      end
    end
  end

end
