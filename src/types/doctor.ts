import { User } from './user';
import { Comment } from './comment';

export interface Doctor {
  id: number;
  user_id: number;

  first_name: string;
  last_name: string;
  description?: string;
  degree?: string;
  specialty?: string;
  graduation_code?: string;
  city?: string;
  university?: string;

  services?: string[];   // cast array
  rating?: number;
  image?: string;
  schedule?: string;

  created_at?: string;
  updated_at?: string;

  // relaciones
  user?: User;
  feedbacks?: any[];
  posts?: any[];
  news?: any[];
}
