Sequel.migration do
  up do
    # clear all user carts
    self[:cart_item].delete

    alter_table(:cart_item) do
      drop_foreign_key(:user_id)

      # drop the existing constraint
      begin
        drop_constraint(:user_id)
      rescue
        # not there, all good
      end

      add_foreign_key(:user_id, :user)

      # add a uniq_hash column
      add_column(:uniq_hash, String, null: false, unique: true, size: 32)
    end
  end
end
