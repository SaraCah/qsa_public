# create database qsa_public character set UTF8mb4 collate utf8mb4_bin;
# grant all on qsa_public.* to 'qsa'@'localhost' identified by 'qsa123';

# AppConfig[:db_url] = "jdbc:mysql://localhost:3306/qsa_public?useUnicode=true&characterEncoding=UTF-8&user=qsa&password=qsa123&serverTimezone=UTC"

# AppConfig[:session_secret] = "randomly_generated_token"

AppConfig[:indexer_interval_seconds] = 5
AppConfig[:solr_url] = "http://localhost:9384/solr/qsapublic/"
AppConfig[:solr_indexer_state_file] = File.join(File.dirname(__FILE__), "..", "data/solr_indexer_state.dat")
AppConfig[:page_size] = 10

# As a long term average you can try one login every 10 seconds
AppConfig[:dbauth_seconds_per_login] = 10

# But you can try 10 in quick succession before we start limiting
AppConfig[:dbauth_max_login_burst] = 10


begin
  load File.join(File.dirname(__FILE__), "/config.local.rb")
rescue LoadError
end
