Sequel.migration do
  up do
    create_table(:quote_request) do
      primary_key :id

      Integer :user_id, null: false

      Bignum :create_time, null: false
      Bignum :modified_time, null: false
    end

    create_table(:quote_request_item) do
      primary_key :id

      String :item_id, null: false

      String :digital_copy_type, null: true
      String :digital_copy_delivery, null: true
      String :digital_copy_format, null: true
      String :digital_copy_resolution, null: true
      String :digital_copy_mode, null: true
      String :digital_copy_size, null: true
      String :digital_copy_notes, text: true, null: true

      foreign_key :quote_request_id, :quote_request, null: false
    end

  end
end
