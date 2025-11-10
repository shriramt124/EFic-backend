export interface PostRecord {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  contentHtml: string | null;
  contentJson: unknown;
  coverImageUrl: string | null;
  readTime: number | null;
  url: string | null;
  author: string | null;
  tags: string[];
  category: string | null;
  published: boolean;
  publishedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}
