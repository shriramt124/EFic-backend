export interface ProjectRecord {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  repoUrl: string | null;
  liveUrl: string | null;
  tags: string[];
  featured: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}
