class Tags < BaseStorage
  def self.for_record(record_id)
    db[:record_tag]
      .filter(record_id: record_id)
      .filter(Sequel.~(deleted: 1))
      .map do |row|
      TagDTO.from_row(row)
    end
  end

  def self.normalize_for_display(tag)
    tag.gsub(/[^ [:alnum:]]/, '').strip
  end

  def self.normalize(tag)
    normalize_for_display(tag).downcase
  end

  def self.banned?(tag)
    hash = Digest::SHA1.hexdigest(normalize(tag))

    db[:banned_tags]
      .filter(hash: hash)
      .count > 0
  end

  def self.hash_tag_and_record_id(tag, record_id)
    Digest::SHA1.hexdigest([normalize(tag), record_id].inspect)
  end

  def self.deleted?(tag, record_id)
    hash = hash_tag_and_record_id(tag, record_id)

    db[:record_tag]
      .filter(hash: hash)
      .filter(deleted: 1)
      .count > 0
  end

  def self.valid?(tag, record_id)
    !banned?(tag) && !deleted?(tag, record_id)
  end

  def self.create_from_dto(tag_dto)
    return [] unless Search.exists?(tag_dto.fetch('record_id'))

    begin
      db[:record_tag]
        .insert(tag: normalize_for_display(tag_dto.fetch('tag')),
                record_id: tag_dto.fetch('record_id'),
                record_type: tag_dto.fetch('record_id').split(/:/)[0],
                create_time: java.lang.System.currentTimeMillis,
                modified_time: java.lang.System.currentTimeMillis,
                hash: hash_tag_and_record_id(tag_dto.fetch('tag'), tag_dto.fetch('record_id')))

      []
    rescue Sequel::UniqueConstraintViolation
      return [{code: 'UNIQUE_CONSTRAINT', field: 'tag'}]
    end
  end

  def self.flag(tag_id)
    db[:record_tag]
      .filter(id: tag_id)
      .update(flagged: 1,
              modified_time: java.lang.System.currentTimeMillis,
              date_flagged: java.lang.System.currentTimeMillis)
  end

  def self.all_flagged_tags
    tags = db[:record_tag]
             .filter(deleted: 0)
             .filter(flagged: 1)
             .order(Sequel.desc(:date_flagged))
             .map{|row|
               TagDTO.from_row(row)
             }

    records = Search.get_records_by_ids(tags.map{|tag| tag.fetch('record_id')})

    tags.each do |tag|
      tag['record'] = records.fetch(tag.fetch('record_id'))
    end

    tags
  end

  def self.unflag(tag_id)
    db[:record_tag]
      .filter(id: tag_id)
      .update(flagged: 0,
              date_flagged: nil,
              modified_time: java.lang.System.currentTimeMillis)
  end

  def self.delete(tag_id)
    db[:record_tag]
      .filter(id: tag_id)
      .update(deleted: 1,
              modified_time: java.lang.System.currentTimeMillis)
  end

  def self.ban(tag_id)
    delete(tag_id)
    # FIXME delete all tags that match?
    # FIXME add to banned list
  end

end
