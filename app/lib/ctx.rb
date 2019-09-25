class Ctx

  def self.open(opts = {})
    DB.open(opts) do |db|
      raise "Already got a context" if Thread.current[:context]

      Thread.current[:context] = Context.new(db)

      begin
        yield
      ensure
        Thread.current[:context] = nil
      end
    end
  end

  def self.db
    get.db
  end

  def self.user_logged_in?
    get.session && get.session.username
  end

  def self.username
    if get.session.nil?
      raise "User not currently logged in"
    end

    get.session.username
  end

  def self.get
    ctx = Thread.current[:context]
    raise "No context active" unless ctx
    ctx
  end

  def self.log_bad_access(msg)
    username_label = self.user_logged_in? ?
                       "QSA Public user '#{self.username}'" :
                       "anonymous user (not logged in)"

    $LOG.warn("Access denied to #{username_label}.  Reason: #{msg}\n" +
              "Backtrace: " +
              caller.take(5).join("\n"))
  end

  class Context
    attr_reader :db
    attr_accessor :session

    def initialize(db)
      @db = db
      @session = nil
    end
  end

end
