class UserDTO
  include DTO

  define_field(:id, Integer)
  define_field(:email, String)
  define_field(:first_name, String)
  define_field(:last_name, String)
  define_field(:street_address, String)
  define_field(:city_suburb, String)
  define_field(:state, String)
  define_field(:post_code, String)
  define_field(:phone, String)
  define_field(:is_admin, Boolean)
  define_field(:is_verified, Boolean)
  define_field(:is_inactive, Boolean)
  define_field(:lock_version, Integer)
  define_field(:create_time, Integer)
  define_field(:modified_time, Integer)
  define_field(:admin_notes, String)

  def self.from_row(row, admin_access = false)
    user_data = {
      id: row[:id],
      email: row[:email],
      first_name: row[:first_name],
      last_name: row[:last_name],
      street_address: row[:street_address],
      city_suburb: row[:city_suburb],
      state: row[:state],
      post_code: row[:post_code],
      phone: row[:phone],
      is_admin: (row[:admin] == 1),
      is_verified: (row[:verified] == 1),
      is_inactive: (row[:inactive] == 1),
      lock_version: row[:lock_version],
      create_time: row[:create_time],
      modified_time: row[:modified_time]
    }

    if admin_access
      user_data[:admin_notes] = row[:admin_notes]
    end

    new(user_data)
  end

  def display_string
    if self.fetch(:email) == 'admin'
      'Admin user'
    else
      name = [self.fetch(:first_name), self.fetch(:last_name)].compact.join(' ')
      email = self.fetch(:email)

      "%s <%s>" % [name, email]
    end
  end
end
