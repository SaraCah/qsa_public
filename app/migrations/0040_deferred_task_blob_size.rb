Sequel.migration do
  up do
    alter_table(:deferred_task) do
      set_column_type(:blob, :longtext)
    end
  end
end
