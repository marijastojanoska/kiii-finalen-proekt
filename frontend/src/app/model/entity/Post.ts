import { User } from './User';
import { Tag } from './Tag';
import {Image} from "./Image";

export interface Post {
  id: number;
  user: User;
  content: string;
  image?: Image;
  createdAt: string;
  tags: Tag[];
}
