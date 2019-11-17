export interface UserForm {
  id?: number;
  email?: string;
  password?: string;
  confirm_password?: string;
  is_admin?: boolean;
  first_name?: string;
  last_name?: string;
  street_address?: string;
  city_suburb?: string;
  state?: string;
  post_code?: string;
  phone?: string;
  lock_version?: number;
}
