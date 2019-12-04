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

  def self.get(user_id, request_id)
    results = db[:reading_room_request]
                .filter(user_id: user_id)
                .filter(id: request_id)
                .all

    doc_ids = results.map{|row| row[:item_id]}

    return nil if doc_ids.length == 0

    resolved = Search.get_records_by_ids(doc_ids)

    results = results.map do |row|
      next unless resolved.include?(row[:item_id])

      row.merge(:request_type => Carts::REQUEST_TYPE_READING_ROOM,
                :record => Search.resolve_refs!(resolved.fetch(row[:item_id])))
    end.compact

    results[0]
  end

  def self.cancel(user_id, request_id)
    db[:reading_room_request]
      .filter(user_id: user_id)
      .filter(id: request_id)
      .update(status: 'CANCELLED_BY_RESEARCHER',
              system_mtime: Time.now)
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

  def self.update(user_id, request_id, date_required, time_required)
    unless ['Morning', 'Afternoon'].include?(time_required)
      time_required = 'Morning'
    end

    db[:reading_room_request]
      .filter(user_id: user_id)
      .filter(id: request_id)
      .update(date_required: Date.parse(date_required).to_time.to_i * 1000,
              time_required: time_required,
              system_mtime: Time.now)
  end
end
