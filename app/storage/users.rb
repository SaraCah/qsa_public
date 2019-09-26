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

  def self.update_from_dto(user_form_dto)

    user_for_email = db[:user][:email => user_form_dto.fetch('email')]
    if !user_for_email.nil? && user_for_email[:id] != user_form_dto.fetch('id')
      return [{code: "UNIQUE_CONSTRAINT", field: 'email'}]
    end

    data_for_update = {
      email: user_form_dto.fetch('email'),
      lock_version: user_form_dto.fetch('lock_version') + 1,
      first_name: user_form_dto.fetch('first_name'),
      last_name: user_form_dto.fetch('last_name'),
      modified_time: java.lang.System.currentTimeMillis
    }

    updated = db[:user]
                .filter(id: user_form_dto.fetch('id'))
                .filter(lock_version: user_form_dto.fetch('lock_version'))
                .update(data_for_update)

    # FIXME handle this
    raise StaleRecordException.new if updated == 0

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
