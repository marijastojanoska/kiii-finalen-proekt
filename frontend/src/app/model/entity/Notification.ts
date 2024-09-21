import {User} from "./User";

export interface Notification {
  id: number;
  user: User;
  message: string;
  read: boolean;
  createdAt: string;
}
