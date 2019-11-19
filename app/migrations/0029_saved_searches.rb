Sequel.migration do
  up do
    create_table(:saved_search) do
      primary_key :id

      foreign_key :user_id, :user, null: false
      String :query_string, text: true, null: false
      String :note, text: true
      Integer :deleted, null: false, default: 0

      Bignum :create_time, null: false
    end

  end
end
