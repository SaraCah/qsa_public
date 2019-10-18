Sequel.migration do
  up do
    alter_table(:cart_item) do
      add_column :digital_copy_type, String, null: true
      add_column :digital_copy_delivery, String, null: true
      add_column :digital_copy_format, String, null: true
      add_column :digital_copy_resolution, String, null: true
      add_column :digital_copy_mode, String, null: true
      add_column :digital_copy_size, String, null: true
      add_column :digital_copy_notes, String, text: true,  null: true
    end
  end
end
