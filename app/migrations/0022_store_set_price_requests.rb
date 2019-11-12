Sequel.migration do
  up do
    create_table(:set_price_request) do
      primary_key :id

      Integer :user_id, null: false
      String :status, null: false
      String :notify_key, null: true
      String :generated_order_id, null: true

      Bignum :create_time, null: false
      Bignum :modified_time, null: false
    end

  end
end
