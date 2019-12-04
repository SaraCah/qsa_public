Sequel.migration do
  up do
    alter_table(:agency_request) do
      add_column :request_permission_to_copy, Integer, null: false, default: 0
      drop_column :publication_details
    end
  end
end
