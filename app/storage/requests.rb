class Requests < BaseStorage

  def self.all(user_id)
    results = db[:reading_room_request]
      .filter(user_id: user_id)
      .all

    doc_ids = results.map{|row| row[:item_id]}
    resolved = Search.get_records_by_ids(doc_ids)

    results = results.map do |row|
      next unless resolved.include?(row[:item_id])

      row.merge(:request_type => Carts::REQUEST_TYPE_READING_ROOM,
                :record => Search.resolve_refs!(resolved.fetch(row[:item_id])))
    end.compact

    {
      results: results
    }
  end

  def self.update_mtimes_for_user_id(user_id)
    now = Time.now

    db[:reading_room_request]
      .filter(user_id: user_id)
      .update(system_mtime: now)

    db[:agency_request]
      .filter(user_id: user_id)
      .update(system_mtime: now)
  end
end
