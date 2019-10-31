Sequel.migration do
  up do
    alter_table(:record_tag) do
      add_column :date_flagged, :Bignum, null: true
    end
  end
end
