Sequel.migration do
  up do
    alter_table(:reading_room_request) do
      add_column :time_required, String, null: true
    end
  end
end
