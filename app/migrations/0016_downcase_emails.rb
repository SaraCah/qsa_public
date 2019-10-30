Sequel.migration do
  up do
    self.transaction do
      self[:user].update(:email => Sequel.lit("lower(email)"))
    end
  end
end
