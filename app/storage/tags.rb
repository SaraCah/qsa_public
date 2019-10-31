class Tags < BaseStorage
  def self.for_record(record_id)
    db[:record_tag]
      .filter(record_id: record_id)
      .filter(Sequel.~(deleted: 1))
      .map do |row|
      TagDTO.from_row(row)
    end
  end

  def self.normalize(tag)
    tag.gsub(/[^[:alnum:]]/, '').downcase
  end

  def self.blacklisted?(tag)
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
    !blacklisted?(tag) && deleted?(tag, record_id)
  end

  def self.create_from_dto(tag_dto)
    begin
      db[:record_tag]
        .insert(tag: tag_dto.fetch('tag'),
               record_id: tag_dto.fetch('record_id'),
               create_time: java.lang.System.currentTimeMillis,
               modified_time: java.lang.System.currentTimeMillis,
               hash: hash_tag_and_record_id(tag_dto.fetch('tag'), tag_dto.fetch('record_id')))

      []
    rescue Sequel::UniqueConstraintViolation
      return [{code: 'UNIQUE_CONSTRAINT', field: 'tag'}]
    end
  end
end