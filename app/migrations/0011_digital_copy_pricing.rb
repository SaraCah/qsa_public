Sequel.migration do
  up do
    create_table(:digital_copy_pricing) do
      primary_key :id

      String :aspace_record_uri, null: true

      Integer :active, null: false

      Integer :price_cents, null: false

      String :created_by, null: false
      String :modified_by, null: false
      Bignum :create_time, null: false
      Bignum :modified_time, null: false

      # This here for ArchivesSpace ASModel compatibility
      Integer :lock_version, :default => 1, :null => false
      DateTime :system_mtime, :index => true, :null => false
    end
  end
end
