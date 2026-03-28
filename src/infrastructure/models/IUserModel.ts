export interface IUserModel {
  id: string;
  name: string | null;
  last_name: string | null;
  email: string | null;
  password_hash: string | null;
  phone: string | null;
  is_active: boolean | null;
  last_login: Date | string | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
}
