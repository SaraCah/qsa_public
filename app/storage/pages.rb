class Pages < BaseStorage

  class NotFound < StandardError; end

  def self.list
    result = {}

    db[:page]
      .order(:create_time)
      .select(:slug, :locked, :deleted)
      .each do |row|
      result[row[:slug]] = {
        slug: row[:slug],
        locked: row[:locked] == 1,
        deleted: row[:deleted] == 1,
      }
    end

    result.values
  end

  def self.create_version(slug, content, user_descriptor)
    locked = db[:page].filter(slug: slug, locked: 1).count > 0

    db[:page].filter(slug: slug).update(deleted: 1)

    db[:page].insert(slug: slug,
                     content: content,
                     locked: locked ? 1 : 0,
                     deleted: 0,
                     create_time: java.lang.System.currentTimeMillis,
                     created_by: user_descriptor)
  end

  def self.get_content(slug)
    content = db[:page]
      .filter(slug: slug, deleted: 0)
      .order(Sequel.desc(:create_time))
      .select(:content)
      .first

    if content.nil?
      raise NotFound.new
    else
      content[:content] || ''
    end
  end

  def self.delete(slug)
    db[:page]
      .filter(slug: slug)
      .update(deleted: 1)
  end

  def self.restore(slug)
    to_restore = db[:page].filter(slug: slug).order(Sequel.desc(:create_time)).first[:id]

    if to_restore
      db[:page].filter(id: to_restore).update(:deleted => 0)
    end
  end

  def self.slug_used?(slug)
    db[:page].filter(:slug => slug, deleted: 0).count > 0
  end

end
