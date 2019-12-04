Sequel.migration do
  up do
    alter_table(:user) do
      add_column(:admin_notes, String, text: true, null: true)
    end
  end
end
