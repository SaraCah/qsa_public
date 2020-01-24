Sequel.migration do
  up do
    alter_table(:user) do
      add_column(:inactive_time, :Bignum, null: true)
      add_column(:last_login_time, :Bignum, null: true)
    end

    self[:user]
      .filter(:inactive => 1)
      .update(:inactive_time => :modified_time)
  end
end
