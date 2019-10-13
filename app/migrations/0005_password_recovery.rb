Sequel.migration do
  up do
    alter_table(:dbauth) do
      add_column :recovery_token, String, null: true
      add_column :recovery_token_expiry, String, null: true
    end
  end
end
