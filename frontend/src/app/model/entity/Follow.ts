import { User } from './User';

export interface Follow {
  id: number;
  follower: User;
  followed: User;
  createdAt: string;
}
