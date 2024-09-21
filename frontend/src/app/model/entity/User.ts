import {UserProfile} from "./UserProfile";

export interface User {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  accountDeactivated: Boolean;
  userProfile: UserProfile;
}

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN'
}
