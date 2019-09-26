class UserDTO
  include DTO

  define_field(:id, Integer)
  define_field(:email, String)
  define_field(:first_name, String)
  define_field(:last_name, String)
  define_field(:is_admin, Boolean)
  define_field(:is_verified, Boolean)
  define_field(:lock_version, Integer)

  def self.from_row(row)
    new(id: row[:id],
        email: row[:email],
        first_name: row[:first_name],
        last_name: row[:last_name],
        is_admin: (row[:admin] == 1),
        is_verified: (row[:verified] == 1),
        lock_version: row[:lock_version])
  end
end