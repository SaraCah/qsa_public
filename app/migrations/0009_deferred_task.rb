Sequel.migration do
  up do
    create_table(:deferred_task) do
      primary_key :id

      String :type, null: false
      String :blob, text: true, null: false
      String :status, null: false

      Integer :retries_remaining, null: false, default: 1

      Bignum :create_time, null: false
    end

    create_table(:deferred_task_running) do
      primary_key :id

      Integer :task_id, null: false
      Bignum :last_checked_time, null: false
    end
  end
end
