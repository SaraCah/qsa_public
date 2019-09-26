class UserFormDTO
  include DTO

  define_field(:id, Integer, required: false)
  define_field(:email, String, validator: proc {|s, user| UserFormDTO.validate_email(s, user)})
  define_field(:password, String, required: false, validator: proc {|s, user|
    p ['***', user, s, user.new?] 
    user.new? && s.empty? ? "Password can't be blank" : nil
  })
  define_field(:confirm_password, String, required: false, validator: proc {|s, user| user.new? && s.empty? ? "Confirm Password can't be blank" : nil})
  define_field(:first_name, String, required: false)
  define_field(:last_name, String, required: false)
  define_field(:is_admin, Boolean, default: false)
  define_field(:is_inactive, Boolean, default: false)
  define_field(:is_verified, Boolean, default: false)
  define_field(:lock_version, Integer, default: 0)
  define_field(:create_time, Integer, required: false)
  define_field(:modified_time, Integer, required: false)

  def self.validate_email(email, user)
    if email.nil? || email.empty?
      "Email can't be blank"
    elsif !user.fetch('is_admin') && (email =~ URI::MailTo::EMAIL_REGEXP).nil?
      "Email must be a valid email address"
    else
      nil
    end
  end
end