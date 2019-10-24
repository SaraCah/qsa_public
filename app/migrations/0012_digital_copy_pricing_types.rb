Sequel.migration do
  up do
    alter_table(:digital_copy_pricing) do
      add_column :type, String, null: false, default: "record"
    end


    self.transaction do
      self[:digital_copy_pricing].insert(:type => 'registered_mail',
                                         :price_cents => 710,
                                         :active => 1,
                                         :created_by => 'admin',
                                         :modified_by => 'admin',
                                         :create_time => java.lang.System.currentTimeMillis,
                                         :modified_time => java.lang.System.currentTimeMillis,
                                         :system_mtime => Time.now)

      self[:digital_copy_pricing].insert(:type => 'usb',
                                         :price_cents => 850,
                                         :active => 1,
                                         :created_by => 'admin',
                                         :modified_by => 'admin',
                                         :create_time => java.lang.System.currentTimeMillis,
                                         :modified_time => java.lang.System.currentTimeMillis,
                                         :system_mtime => Time.now)

      self[:digital_copy_pricing].insert(:type => 'usb_postage',
                                         :price_cents => 850,
                                         :active => 1,
                                         :created_by => 'admin',
                                         :modified_by => 'admin',
                                         :create_time => java.lang.System.currentTimeMillis,
                                         :modified_time => java.lang.System.currentTimeMillis,
                                         :system_mtime => Time.now)
    end
  end
end
