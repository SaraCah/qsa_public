Sequel.migration do
  up do
    alter_table(:user) do
      add_column :street_address, String, null: true
      add_column :city_suburb, String, null: true
      add_column :state, String, null: true
      add_column :post_code, String, null: true
      add_column :phone, String, null: true
    end
  end
end
