Sequel.migration do
  up do
    alter_table(:record_tag) do
      add_column(:record_type, String)
    end

    self.transaction do
      self[:record_tag].update(:record_type => Sequel.lit('substring(record_id, 1, instr(record_id, ":") - 1)'))
    end

    alter_table(:record_tag) do
      set_column_not_null(:record_type)
      add_index([:record_type, :modified_time], name: "record_tag_modtime_idx")
    end
  end
end
