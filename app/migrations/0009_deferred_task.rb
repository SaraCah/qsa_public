Sequel.migration do
  up do
    create_table(:task) do
      primary_key :id

      String :type, null: false
      String :blob, text: true, null: false
      String :status, null: false

      Bignum :create_time, null: false
      Bignum :modified_time, null: false
    end
  end
end
