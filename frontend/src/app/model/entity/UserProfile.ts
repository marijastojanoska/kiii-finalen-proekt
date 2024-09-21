import {User} from './User';
import {Image} from "./Image";

export interface UserProfile {
  user: User;
  bio?: string;
  profilePicture: Image;
  dateOfBirth?: string;
  createdAt: string;
}
