Sequel.migration do
  up do
    create_table(:minicart) do
      primary_key :id
      String :cart_id, null: false, unique: true
    end
  end
end
