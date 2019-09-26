class Users < BaseStorage

  def self.create_from_dto(user_form_dto)
    if db[:user][:email => user_form_dto.fetch('email')].nil?

      if (user_form_dto.fetch('confirm_password') != user_form_dto.fetch('password'))
        return [{code: 'CONFIRM_PASSWORD_MISMATCH', field: 'password'}]
      else
        user_id = db[:user].insert(:email => user_form_dto.fetch('email'),
                                   :first_name => user_form_dto.fetch('first_name', nil),
                                   :last_name => user_form_dto.fetch('last_name', nil),
                                   :admin => 0,
                                   :inactive => 0,
                                   :verified => 0,
                                   :create_time => java.lang.System.currentTimeMillis,
                                   :modified_time => java.lang.System.currentTimeMillis)

        DBAuth.set_user_password(user_id, user_form_dto.fetch('password'))
      end

      []
    else
      [{code: "UNIQUE_CONSTRAINT", field: 'email'}]
    end
  end

  def self.update_user(user_form_dto)
    raise "DO ME"
  end

  def self.get(user_id)
    user = db[:user][:id => user_id]

    return nil unless user

    UserDTO.from_row(user)
  end

  def self.get_for_email(email)
    user = db[:user][:email => email]

    return nil unless user

    UserDTO.from_row(user)
  end

end
