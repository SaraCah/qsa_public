class UserFormDTO
  include DTO

  define_field(:id, Integer, required: false)
  define_field(:email, String, validator: proc {|s| UserFormDTO.validate_email(s)})
  define_field(:password, String, required: false, validator: proc {|s, user| user.new? && s.empty? ? "Password can't be blank" : nil})
  define_field(:confirm_password, String, required: false)
  define_field(:first_name, String)
  define_field(:last_name, String)
  define_field(:is_admin, Boolean, default: false)
  define_field(:is_inactive, Boolean, default: false)
  define_field(:is_verified, Boolean, default: false)
  define_field(:create_time, Integer, required: false)
  define_field(:modified_time, Integer, required: false)
 
  def self.validate_email(email)
    if email.nil? || email.empty?
      "Email can't be blank"
    elsif (email =~ URI::MailTo::EMAIL_REGEXP).nil?
      "Email must be a valid email address"
    else
      nil
    end
  end
end