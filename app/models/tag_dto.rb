class TagDTO
  include DTO

  define_field(:id, Integer, required: false)
  define_field(:record_id, String)
  define_field(:tag, String, validator: proc{|s, dto| validate_tag(s, dto)})
  define_field(:flagged, Boolean, required: false)
  define_field(:deleted, Boolean, required: false)
  define_field(:create_time, Integer, required: false)
  define_field(:modified_time, Integer, required: false)
  define_field(:date_flagged, Integer, required: false)
  define_field(:record, Hash, required: false)

  def self.from_row(row)
    new(id: row[:id],
        tag: row[:tag],
        record_id: row[:record_id],
        flagged: row[:flagged] == 1,
        deleted: row[:deleted] == 1,
        create_time: row[:create_time],
        modified_time: row[:modified_time],
        date_flagged: row[:date_flagged])
  end

  def self.validate_tag(tag, dto)
    if tag.empty?
      return "Tag is required"
    end

    if Tags.normalize(tag).empty?
      return "Tag is not allowed"
    end

    unless Tags.valid?(tag, dto.fetch('record_id'))
      return "Tag is not allowed"
    end

    nil
  end
end