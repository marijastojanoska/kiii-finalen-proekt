export interface CommentRequest {
  username: string;
  postId: number;
  parentId?: number;
  content: string;
}
