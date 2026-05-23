// src/types/post.ts
import { User } from './user';
import { Comment } from './comment';

export interface Post {
  id: number;
  title: string;
  content: string;
  short_content?: string;
  image?: string | null;
  image_url?: string | null;
  category?: string;

  user?: User;
  comments?: Comment[];

  created_at: string;
}
