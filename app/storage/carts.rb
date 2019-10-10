class Carts < BaseStorage

  REQUEST_TYPE_READING_ROOM = "READING_ROOM"
  VALID_REQUEST_TYPES = [REQUEST_TYPE_READING_ROOM]

  def self.get(user_id)
    items = db[:cart_item]
      .filter(user_id: user_id)
      .map do |row|
      {
        id: row[:id],
        item_id: row[:item_id],
        request_type: row[:request_type]
      }
    end

    documents = Search.get_records_by_ids(items.map{|item| item.fetch(:item_id)})

    items.each do |item|
      item[:record] = documents.fetch(item.fetch(:item_id))
    end

    open_records = items.select{|item| item[:record].fetch('rap_access_status') == 'Open Access'}
    closed_records = items.select{|item| item[:record].fetch('rap_access_status') == 'Restricted Access'}.group_by{|item| item[:record].fetch('responsible_agency').fetch('ref')}

    agencies = Search.get_records_by_uris(closed_records.keys)

    {
      total_count: items.length,
      open_records: open_records,
      closed_records: closed_records,
      agencies: agencies,
    }
  end

  def self.add_item(user_id, request_type, item_id)
    raise "Request type not supported: #{request_type}" unless VALID_REQUEST_TYPES.include?(request_type)

    begin
      db[:cart_item]
        .insert(user_id: user_id,
                request_type: request_type,
                item_id: item_id)
    rescue Sequel::UniqueConstraintViolation
      # ok it's already in there
    end
  end

  def self.clear(user_id)
    db[:cart_item]
      .filter(user_id: user_id)
      .delete
  end

  def self.remove_item(user_id, cart_item_id)
    db[:cart_item]
      .filter(user_id: user_id)
      .filter(id: cart_item_id)
      .delete
  end

  def self.handle_open_records(user_id, date_required)
    now = Time.now

    user = Users.get(user_id)
    cart = get(user_id)

    cart[:open_records].each do |item|
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

    cart[:closed_records].each do |agency_uri, closed_items|
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
