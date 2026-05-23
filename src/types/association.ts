export interface Association {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  city?: string;
  address?: string;
  phone?: string;
  image?: string;
  website?: string;
  created_at?: string;
  updated_at?: string;

  // relaciones (opcionales)
  posts?: any[];
  news?: any[];
  feedbacks?: any[];
}
