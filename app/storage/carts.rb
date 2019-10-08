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

    items
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
    now = Time.now.to_i

    user = Users.get(user_id)
    cart_items = get(user_id)
    open_items = cart_items.select{|item| item[:request_type] == REQUEST_TYPE_READING_ROOM && item.fetch(:record).fetch('rap_access_status') == 'Open Access'}
    open_items.each do |item|
      db[:reading_room_request]
        .insert(
          user_id: user_id,
          item_id: item.fetch(:record).fetch('id'),
          item_uri: item.fetch(:record).fetch('uri'),
          status: 'PENDING',
          date_required: date_required ? date_required.to_i : date_required,
          created_by: user.fetch('email'),
          modified_by: user.fetch('email'),
          create_time: now,
          modified_time: now,
        )

      remove_item(user_id, item.fetch(:id))
    end
  end

end
