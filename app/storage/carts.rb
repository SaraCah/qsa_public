class Carts < BaseStorage

  REQUEST_TYPE_READING_ROOM = "READING_ROOM"
  VALID_REQUEST_TYPES = [REQUEST_TYPE_READING_ROOM]

  def self.get(user_id)
    items = db[:cart_item]
      .filter(user_id: user_id)
      .map do |row|
      {
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

    db[:cart_item]
      .insert(user_id: user_id,
              request_type: request_type,
              item_id: item_id)
  end

end
