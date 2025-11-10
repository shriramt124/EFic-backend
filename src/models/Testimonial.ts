export interface TestimonialRecord {
  id: string;
  author: string;
  role: string | null;
  avatarUrl: string | null;
  content: string;
  rating: number;
  featured: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}
