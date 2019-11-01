Sequel.migration do
  up do
    drop_table(:banned_tags)
    create_table(:banned_tags) do
      primary_key :id

      String :tag, null: false, unique: true
    end
  end
end
