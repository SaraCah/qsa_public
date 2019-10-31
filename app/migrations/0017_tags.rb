Sequel.migration do
  up do
    create_table(:record_tag) do
      primary_key :id

      String :tag, null: false
      String :record_id, null: false
      Integer :flagged, null: false, default: 0
      Integer :deleted, null: false, default: 0

      String :hash, null: false, unique: true

      Bignum :create_time, null: false
      Bignum :modified_time, null: false
    end

    create_table(:banned_tags) do
      primary_key :id

      String :hash, null: false, unique: true
    end
  end
end
