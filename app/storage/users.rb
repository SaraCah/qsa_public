class Users < BaseStorage

  def self.normalise_email(email)
    email.downcase.strip
  end

  def self.create_from_dto(user_form_dto)
    if db[:user][:email => normalise_email(user_form_dto.fetch('email'))].nil?

      if user_form_dto.fetch('confirm_password') != user_form_dto.fetch('password')
        return [{code: 'CONFIRM_PASSWORD_MISMATCH', field: 'password'}]
      else
        user_id = db[:user].insert(:email => normalise_email(user_form_dto.fetch('email')),
                                   :first_name => user_form_dto.fetch('first_name'),
                                   :last_name => user_form_dto.fetch('last_name'),
                                   :street_address => user_form_dto.fetch('street_address', nil),
                                   :city_suburb => user_form_dto.fetch('city_suburb', nil),
                                   :state => user_form_dto.fetch('state', nil),
                                   :post_code => user_form_dto.fetch('post_code', nil),
                                   :phone => user_form_dto.fetch('phone', nil),
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

  def self.update_from_dto(user_form_dto)

    user_for_email = db[:user][:email => normalise_email(user_form_dto.fetch('email'))]
    if !user_for_email.nil? && user_for_email[:id] != user_form_dto.fetch('id')
      return [{code: "UNIQUE_CONSTRAINT", field: 'email'}]
    end

    data_for_update = {
      email: normalise_email(user_form_dto.fetch('email')),
      lock_version: user_form_dto.fetch('lock_version') + 1,
      first_name: user_form_dto.fetch('first_name'),
      last_name: user_form_dto.fetch('last_name'),
      street_address: user_form_dto.fetch('street_address', nil),
      city_suburb: user_form_dto.fetch('city_suburb', nil),
      state: user_form_dto.fetch('state', nil),
      post_code: user_form_dto.fetch('post_code', nil),
      phone: user_form_dto.fetch('phone', nil),
      modified_time: java.lang.System.currentTimeMillis
    }

    updated = db[:user]
                .filter(id: user_form_dto.fetch('id'))
                .filter(lock_version: user_form_dto.fetch('lock_version'))
                .update(data_for_update)

    # FIXME handle this
    raise StaleRecordException.new if updated == 0

    Requests.update_mtimes_for_user_id(user_form_dto.fetch('id'))

    []
  end


  def self.admin_update_from_dto(user_form_dto)
    user_for_email = db[:user][:email => normalise_email(user_form_dto.fetch('email'))]
    if !user_for_email.nil? && user_for_email[:id] != user_form_dto.fetch('id')
      return [{code: "UNIQUE_CONSTRAINT", field: 'email'}]
    end

    if user_form_dto.fetch('password', false)
      if user_form_dto.fetch('confirm_password', nil) != user_form_dto.fetch('password')
        return [{code: 'CONFIRM_PASSWORD_MISMATCH', field: 'password'}]
      end
    end

    data_for_update = {
      email: normalise_email(user_form_dto.fetch('email')),
      lock_version: user_form_dto.fetch('lock_version') + 1,
      first_name: user_form_dto.fetch('first_name'),
      last_name: user_form_dto.fetch('last_name'),
      street_address: user_form_dto.fetch('street_address', nil),
      city_suburb: user_form_dto.fetch('city_suburb', nil),
      state: user_form_dto.fetch('state', nil),
      post_code: user_form_dto.fetch('post_code', nil),
      phone: user_form_dto.fetch('phone', nil),
      admin: user_form_dto.fetch('is_admin') ? 1 : 0,
      verified: user_form_dto.fetch('is_verified') ? 1 : 0,
      inactive: user_form_dto.fetch('is_inactive') ? 1 : 0,
      admin_notes: user_form_dto.fetch('admin_notes', nil),
      modified_time: java.lang.System.currentTimeMillis
    }

    updated = db[:user]
                .filter(id: user_form_dto.fetch('id'))
                .filter(lock_version: user_form_dto.fetch('lock_version'))
                .update(data_for_update)

    # FIXME handle this
    raise StaleRecordException.new if updated == 0


    if user_form_dto.fetch('password', false)
      DBAuth.set_user_password(user_form_dto.fetch('id'), user_form_dto.fetch('password'))
    end

    Requests.update_mtimes_for_user_id(user_form_dto.fetch('id'))

    []
  end


  def self.page(page, query = nil, start_date = nil, end_date = nil, page_size = 25)
    dataset = db[:user]

    if query
      sanitised = query.downcase.gsub(/[^a-z0-9_\-\. ]/, '_')
      dataset = dataset.filter(
                  Sequel.|(
                    Sequel.like(Sequel.function(:lower, Sequel[:user][:email]), "%#{sanitised}%"),
                    Sequel.like(Sequel.function(:lower, Sequel[:user][:first_name]), "%#{sanitised}%"),
                    Sequel.like(Sequel.function(:lower, Sequel[:user][:last_name]), "%#{sanitised}%")))
    end

    if start_date
      dataset = dataset.filter(Sequel[:user][:create_time] >= start_date.to_time.to_i * 1000)
    end

    if end_date
      dataset = dataset.filter(Sequel[:user][:create_time] <= (end_date + 1).to_time.to_i * 1000)
    end

    max_page = (dataset.count / page_size.to_f).ceil - 1
    dataset = dataset.limit(page_size, page * page_size)

    results = dataset.map do |row|
      UserDTO.from_row(row)
    end

    PagedResults.new(results, page, max_page)
  end


  def self.get(user_id, admin_access = false)
    user = db[:user][:id => user_id]

    return nil unless user
    return nil if user[:inactive] == 1 && !admin_access

    UserDTO.from_row(user, admin_access)
  end

  def self.get_for_email(email, admin_access = false)
    user = db[:user][:email => normalise_email(email)]

    return nil unless user
    return nil if user[:inactive] == 1 && !admin_access

    UserDTO.from_row(user, admin_access)
  end

# Contain both upper and lower case characters e.g. a-z, A-Z
# Utilise numerals, spaces, and punctuation characters as well as letters e.g. 0-9, !@#$%^&()_+|~-=`{}[]:";'<>?,./
# Contain at least twelve (12) characters
  PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9\W]).{12,}$/
  WEAK_PASSWORD_MSG = 'Password must be at least 12 characters in length, contain both upper and lower case letters, and at least one non-letter (numeral, space or punctuation)'

  def self.valid_password?(password)
    password =~ PASSWORD_REGEX
  end

  def self.update_password(user_id, current_password, new_password, confirm_new_password)
    unless valid_password?(new_password)
      return [{code: WEAK_PASSWORD_MSG, field: 'password'}]
    end

    if DBAuth.authenticate_for_id(user_id, current_password)
      if new_password == confirm_new_password
        DBAuth.set_user_password(user_id, new_password)

        []
      else
        [{code: 'CONFIRM_PASSWORD_MISMATCH', field: 'password'}]
      end
    else
      [{code: "INCORRECT_PASSWORD", field: 'current_password'}]
    end
  end

end
