Sequel.migration do
  up do
    # clear all user carts
    self[:cart_item].delete

    # drop_constraint(:user_id)
    begin
      alter_table(:cart_item) do
        drop_foreign_key(:user_id)
      end
    rescue
    end

    begin
      alter_table(:cart_item) do
        drop_foreign_key(:cart_item_ibfk_1)
      end
    rescue
    end

    begin
      alter_table(:cart_item) do
        drop_constraint(:user_id)
      end
    rescue
      # all good, it's gone
    end

    alter_table(:cart_item) do
      add_foreign_key(:user_id, :user)

      # add a uniq_hash column
      add_column(:uniq_hash, String, null: false, unique: true, size: 32)
    end
  end
end
