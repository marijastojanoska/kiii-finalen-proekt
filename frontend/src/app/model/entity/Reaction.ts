import { User } from './User';
import { Post } from './Post';
import {ReactionTypeResponse} from "../response/ReactionTypeResponse";

export interface Reaction {
  id: number;
  user: User;
  type: ReactionTypeResponse;
  post: Post;
  createdAt: string;

}
