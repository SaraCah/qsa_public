Sequel.migration do
  up do
    create_table(:index_feed) do
      primary_key :id

      Integer :record_id, :null => false
      Integer :repo_id, :null => false
      String :record_type, :null => false
      String :record_uri, :size => 64, :null => false, :unique => true
      File :blob, :size => :medium, :null => false
      Integer :system_mtime, :null => false, :default => 0
    end

    create_table(:index_feed_deletes) do
      primary_key :id

      String :record_uri, :size => 64, :null => false, :unique => true
    end

  end
end
