Sequel.migration do
  up do
    # First and Last Name are mandatory
    self[:user]
      .filter(first_name: nil)
      .update(first_name: 'Test')

    self[:user]
      .filter(last_name: nil)
      .update(last_name: 'User')

    alter_table(:user) do
      set_column_not_null(:first_name)
      set_column_not_null(:last_name)
    end
  end
end
