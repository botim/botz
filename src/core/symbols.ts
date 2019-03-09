export interface ObjectKeyMap<T = string> {
  [key: string]: T;
}

export interface UserData {
  postId: string;
  commentId?: string;
  replyCommentId?: string;
  userId: string;
  username: string;
}

export const enum Status {
  REPORTED = 'REPORTED',
  IN_PROCESS = 'IN_PROCESS',
  BOT = 'BOT',
  NOT_BOT = 'NOT_BOT'
}
