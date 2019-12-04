class Requests < BaseStorage

  SORT_BY_WHITELIST = {
    date_requested_desc: Sequel.desc(:create_time),
    date_requested_asc: Sequel.asc(:create_time),
    date_required_desc: [Sequel.desc(:date_required), Sequel.asc(:time_required)],
    date_required_asc: [Sequel.asc(:date_required), Sequel.desc(:time_required)],
    request_no_desc: Sequel.desc(:id),
    request_no_asc: Sequel.asc(:id),
    status_desc: [Sequel.desc(:status), Sequel.desc(:create_time)],
    status_asc: [Sequel.asc(:status), Sequel.desc(:create_time)],
  }

  def self.all(user_id, sort_by)
    whitelisted_sort_by = SORT_BY_WHITELIST.fetch(sort_by.intern, Sequel.desc(:create_time))

    results = db[:reading_room_request]
      .filter(user_id: user_id)
      .order(*Array(whitelisted_sort_by))
      .all

    doc_ids = results.map{|row| row[:item_id]}
    resolved = Search.get_records_by_ids(doc_ids)

    results = results.map do |row|
      next unless resolved.include?(row[:item_id])

      row.merge(:request_type => Carts::REQUEST_TYPE_READING_ROOM,
                :record => Search.resolve_refs!(resolved.fetch(row[:item_id])))
    end.compact

    if sort_by == 'qsa_id_desc' || sort_by == 'qsa_id_asc'
      # need to sort by resolved records
      #
      results = results.sort do |a, b|
        if sort_by == 'qsa_id_desc'
          b[:record]['qsa_id'] <=> a[:record]['qsa_id']
        else
          a[:record]['qsa_id'] <=> b[:record]['qsa_id']
        end
      end
    end

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
