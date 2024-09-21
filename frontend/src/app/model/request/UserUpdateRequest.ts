export interface UserUpdateRequest {
  username?: string;
  oldPassword?: string;
  password?: string;
  confirmPassword?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}
