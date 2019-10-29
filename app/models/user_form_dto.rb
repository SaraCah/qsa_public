class UserFormDTO
  include DTO

  define_field(:id, Integer, required: false)
  define_field(:email, String, validator: proc {|s, user| UserFormDTO.validate_email(s, user)})
  define_field(:password, String, required: false, validator: proc {|s, user| validate_password(s, user)})
  define_field(:confirm_password, String, required: false, validator: proc {|s, user| user.new? && s.empty? ? "Confirm Password can't be blank" : nil})
  define_field(:first_name, String)
  define_field(:last_name, String)
  define_field(:street_address, String, required: false)
  define_field(:city_suburb, String, required: false)
  define_field(:state, String, required: false)
  define_field(:post_code, String, required: false, validator: proc {|s| UserFormDTO.validate_post_code(s)})
  define_field(:phone, String, required: false, validator: proc {|s| UserFormDTO.validate_phone(s)})
  define_field(:is_admin, Boolean, default: false)
  define_field(:is_inactive, Boolean, default: false)
  define_field(:is_verified, Boolean, default: false)
  define_field(:lock_version, Integer, default: 0)
  define_field(:create_time, Integer, required: false)
  define_field(:modified_time, Integer, required: false)

  def self.validate_password(password, user)
    if user.new?
      return "Password can't be blank" if password.empty?
    end

    return nil if password.empty?

    unless Users.valid_password?(password)
      return Users::WEAK_PASSWORD_MSG
    end

    nil
  end

  def self.validate_email(email, user)
    if email.nil? || email.empty?
      "Email can't be blank"
    elsif !user.fetch('is_admin') && (email =~ URI::MailTo::EMAIL_REGEXP).nil?
      "Email must be a valid email address"
    else
      nil
    end
  end

  def self.validate_post_code(post_code)
    if post_code.nil? || post_code.empty?
      nil
    elsif post_code.length != 4 || post_code.match?(/[^0-9]/)
      "Postcode must be a valid, 4 digit number"
    end
  end

  def self.validate_phone(phone)
    if phone.nil? || phone.empty?
      nil
    elsif !phone.match?(/[\+]?[0-9]+/)
      "Phone number must be a valid land line or mobile number, with no spaces or separators"
    end
  end
end