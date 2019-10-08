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

  def self.remove_item(user_id, cart_item_id)
    db[:cart_item]
      .filter(user_id: user_id)
      .filter(id: cart_item_id)
      .delete
  end

end
