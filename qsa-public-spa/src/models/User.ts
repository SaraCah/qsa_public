export interface UserForm {
  id: number;
  email: string;
  password: string;
  confirm_password: string;
  first_name?: string;
  last_name?: string;
  lock_version: number;
}
