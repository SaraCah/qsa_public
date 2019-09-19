Dir.chdir(File.dirname(__FILE__))
$LOAD_PATH << Dir.pwd

Dir.glob('../distlibs/gems/gems/bundler-*/lib').each do |bundler_dir|
  # Force the version of bundler we explicitly installed!
  $LOAD_PATH.unshift(bundler_dir)
end

require 'bundler/setup'
Bundler.require

require 'rjack-slf4j'

$LOG = RJack::SLF4J["qsa.public"]

RJack::Logback.configure do
  console = RJack::Logback::ConsoleAppender.new do |a|
    a.target = "System.err"
    a.layout = RJack::Logback::PatternLayout.new do |p|
      p.pattern = "%date [%thread] %-5level %logger{35} - %msg %ex%n"
    end
  end
  RJack::Logback.root.add_appender( console )
  RJack::Logback.root.level = RJack::Logback::INFO
end

require 'securerandom'
require 'fileutils'
require 'net/http'

require 'util/utils'
require 'common/bootstrap'

require 'storage/db_connection'
require 'storage/db'

require 'lib/endpoint'
require 'lib/ctx'
require 'lib/watch_dir_reloader'
require 'lib/solr_indexer'
require 'lib/advanced_search_query'
require 'lib/search'
require 'lib/date_parse'

require 'lib/templates'
require 'views/templates'

require 'endpoints_api'
require 'endpoints_ui'


class QSAPublic < Sinatra::Base

  configure :development do |config|
    register Sinatra::Reloader
    config.also_reload File.join('**', '*.rb')
  end

  configure do
    FileUtils.mkdir_p(File.join(File.dirname(__FILE__), '..', 'static'))
  end


  # Add CORS headers
  class CORSHeaders
    def initialize(app)
      @app = app
    end

    def call(env)
      headers = {}
      headers['Access-Control-Allow-Origin'] = '*'
      headers['Access-Control-Allow-Methods'] = '*'
      headers['Access-Control-Allow-Headers'] = '*'

      if env['REQUEST_METHOD'] == 'OPTIONS'
        return [200, headers, []]
      end

      (status, response_headers, body) = @app.call(env)

      [status, headers.merge(response_headers), body]
    end
  end

  if QSAPublic.development?
    use CORSHeaders
  end


  configure do
    $LOG.info("Starting application in #{QSAPublic.environment} mode")
  end

  configure do
    Sequel.database_timezone = :utc
    Sequel.typecast_timezone = :utc

    set :show_exceptions, false

    DB.connect

    SolrIndexer.start
  end

  error do
    $LOG.info("*** Caught unexpected exception: #{$!}")
    $LOG.info($@.join("\n"))
    $LOG.info("=" * 80)
    return [500, {}, {"SERVER_ERROR" => {type: $!.class.to_s, message: $!.to_s}}.to_json]
  end

  private

  def json_response(hash)
    content_type :json
    hash.to_json
  end

end
