Sequel.migration do
  up do
    create_table(:cart_item) do
      primary_key :id

      foreign_key :user_id, :user, null: false
      String :item_id, null: false
      String :request_type, null: false
    end

    alter_table(:cart_item) do
      add_unique_constraint([:user_id, :item_id, :request_type])
    end

    create_table(:agency_request) do
      primary_key :id

      foreign_key :user_id, :user, null: false
      foreign_key :agency_request_id, :agency_request, null: true

      String :agency_id, null: false

      String :status, null: false
      Bignum :date_requested

      String :purpose, text: true
      String :publication_details, text: true

      String :created_by, null: false
      String :modified_by, null: false
      Bignum :create_time, null: false
      Bignum :modified_time, null: false
    end

    create_table(:reading_room_request) do
      primary_key :id

      foreign_key :user_id, :user, null: false
      foreign_key :agency_request_id, :agency_request, null: true

      String :item_id, null: false
      String :item_uri, null: false
      String :status, null: false
      Bignum :date_required

      String :created_by, null: false
      String :modified_by, null: false
      Bignum :create_time, null: false
      Bignum :modified_time, null: false
    end

    create_table(:agency_request_item) do
      primary_key :id

      foreign_key :agency_request_id, :agency_request, null: true

      String :item_id, null: false
      String :status, null: false

      String :created_by, null: false
      String :modified_by, null: false
      Bignum :create_time, null: false
      Bignum :modified_time, null: false
    end

    create_table(:notification) do
      primary_key :id

      foreign_key :user_id, :user, null: false

      String :notification_type, null: false
      String :status # completed, dismissed etc

      String :record_type
      String :record_id

      String :created_by, null: false
      String :modified_by, null: false
      Bignum :create_time, null: false
      Bignum :modified_time, null: false
    end
  end
end
