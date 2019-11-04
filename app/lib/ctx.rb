class Ctx

  def self.open(opts = {}, sinatra_session = nil)
    DB.open(opts) do |db|
      raise "Already got a context" if Thread.current[:context]

      Thread.current[:context] = Context.new(db, sinatra_session)

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
    get.session && get.session.user_id
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
                       "QSA Public user '#{self.user_id}'" :
                       "anonymous user (not logged in)"

    $LOG.warn("Access denied to #{username_label}.  Reason: #{msg}\n" +
              "Backtrace: " +
              caller.take(5).join("\n"))
  end

  def self.captcha_verified?
    return true if user_logged_in?
    return true if !AppConfig[:recaptcha_enabled]

    !!get.sinatra_session['captcha_verified']
  end

  def self.set_captcha_verified!
    get.sinatra_session['captcha_verified'] = true
  end

  class Context
    attr_reader :db
    attr_accessor :session
    attr_accessor :sinatra_session

    def initialize(db, sinatra_session)
      @db = db
      @session = nil
      @sinatra_session = sinatra_session
    end
  end

end
