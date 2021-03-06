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
    tag.gsub(/[^ [:alnum:]]/, '').strip.downcase
  end

  def self.tag_words(tag)
    normalize(tag).split(/[^[:alnum:]]/).reject(&:empty?)
  end

  def self.banned?(tag)
    db[:banned_tags]
      .filter(tag: tag_words(tag))
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
        .insert(tag: normalize(tag_dto.fetch('tag')),
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

  def self.add_to_banned_list(tags)
    Array(tags).each do |tag|
      begin
        db[:banned_tags].insert(tag: normalize(tag))
      rescue Sequel::UniqueConstraintViolation
        # got it already
      end
    end

    # delete all record tags that match the now-banned tags
    matching_record_tags_dataset(tags)
      .filter(deleted: 0)
      .update(deleted: 1,
              modified_time: java.lang.System.currentTimeMillis)
  end

  def self.remove_from_banned_list(tags)
    db[:banned_tags]
      .filter(tag: tags.map{|tag| normalize(tag)})
      .delete

    # Undelete instances of these tags from records too (but only if they're not
    # blocked by some OTHER banned tag)
    unbanned = []

    matching_record_tags_dataset(tags)
      .filter(deleted: 1)
      .select(:tag, :id)
      .each do |candidate|
      if !banned?(candidate[:tag])
        unbanned << candidate[:id]
      end
    end

    db[:record_tag].filter(:id => unbanned)
      .update(deleted: 0,
              modified_time: java.lang.System.currentTimeMillis)
  end

  # Return a sequel dataset over db[:record_tag] where the tag in question is a
  # subword match from `tags`.
  def self.matching_record_tags_dataset(tags)
    ids = []

    # Big ol' WHERE clauses
    tags.map {|tag| normalize(tag)}
      .each_slice(32)
      .each do |subset|

      query = db[:record_tag].filter(1 => 0)

      subset.each do |banned_tag|
        query = query.or { Sequel.function(:instr, :tag, banned_tag) > 0 }
      end

      ids.concat(query.select(:id).map {|row| row[:id]})
    end

    db[:record_tag].filter(:id => ids.uniq)
  end

  def self.ban(tag_id)
    tag = db[:record_tag][id: tag_id]
    add_to_banned_list([tag[:tag]])
  end

  def self.all_banned_tags
    db[:banned_tags]
      .order(:tag)
      .map{|row|
        row[:tag]
      }
  end
end
