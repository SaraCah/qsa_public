class Requests < BaseStorage

  def self.all(user_id)
    results = db[:reading_room_request]
      .filter(user_id: user_id)
      .all

    doc_ids = results.map{|row| row[:item_id]}
    resolved = Search.get_records_by_ids(doc_ids)

    results.each do |row|
      row[:request_type] = Carts::REQUEST_TYPE_READING_ROOM # FIXME
      row[:record] = resolved.fetch(row[:item_id])
    end

    {
      results: results 
    }
  end

end