class SavedSearches < BaseStorage

  def self.update_note(id, user_id, note)
    db[:saved_search]
      .filter(user_id: user_id,
              id: id)
      .update(note: note)
  end

  def self.all(user_id)
    db[:saved_search]
      .filter(user_id: user_id)
      .filter(deleted: 0)
      .order(Sequel.desc(:create_time))
      .map do |row|
        {
          id: row[:id],
          query_string: row[:query_string],
          create_time: row[:create_time],
          note: row[:note] || '',
        }
      end
  end

  def self.create(user_id, query_string)
    db[:saved_search]
      .insert(user_id: user_id,
              query_string: query_string,
              create_time: java.lang.System.currentTimeMillis)
  end

  def self.delete(id, user_id)
    db[:saved_search]
      .filter(user_id: user_id,
              id: id)
      .update(deleted: 1)
  end

end