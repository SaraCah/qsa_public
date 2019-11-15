Sequel.migration do
  up do
    alter_table(:page) do
      add_column(:hidden, Integer, default: 0)
    end

    self[:page].filter(Sequel.like(:slug, 'email-%')).update(hidden: 1)
  end
end
