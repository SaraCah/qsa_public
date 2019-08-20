require_relative '../common/bootstrap'

Sequel.connect(AppConfig[:db_url]) do |db|
  migrations_dir = File.join(File.dirname(__FILE__), "..", 'migrations')
  Sequel::Migrator.apply(db, migrations_dir)
end

