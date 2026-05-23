export interface CreateDoctorPayload {
  first_name: string;
  last_name: string;
  description?: string;

  degree?: string;          // o career
  specialty?: string;
  graduation_code?: string; // o graduate_code

  services?: string[];
  city?: string;
  university?: string;
  image?: string;
  schedule?: string;
}
