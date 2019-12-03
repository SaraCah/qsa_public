Sequel.migration do
  up do
    alter_table(:cart_item) do
      add_column :position, Integer, null: false, default: 0
    end
  end
end
