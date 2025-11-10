import type { RowDataPacket } from 'mysql2/promise';

const toIsoString = (value: Date | string | null): string | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const parseJsonValue = <T>(value: unknown): T | null => {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  return value as T;
};

const parseStringArray = (value: unknown): string[] => {
  const parsed = parseJsonValue<string[]>(value);
  return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
};

export interface PostRow extends RowDataPacket {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_html: string | null;
  content_json: unknown;
  cover_image_url: string | null;
  read_time: number | null;
  url: string | null;
  author: string | null;
  tags: unknown;
  category_id: string | null;
  published: number | boolean;
  published_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export const mapPostRow = (row: PostRow) => ({
  _id: row.id,
  id: row.id,
  title: row.title,
  slug: row.slug,
  excerpt: row.excerpt ?? null,
  contentHtml: row.content_html ?? null,
  contentJson: parseJsonValue(row.content_json),
  coverImageUrl: row.cover_image_url ?? null,
  readTime: row.read_time ?? null,
  url: row.url ?? null,
  author: row.author ?? null,
  tags: parseStringArray(row.tags),
  category: row.category_id ?? null,
  published: Boolean(row.published),
  publishedAt: toIsoString(row.published_at),
  createdAt: toIsoString(row.created_at),
  updatedAt: toIsoString(row.updated_at),
});

export interface CategoryRow extends RowDataPacket {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export const mapCategoryRow = (row: CategoryRow) => ({
  _id: row.id,
  id: row.id,
  slug: row.slug,
  name: row.name,
  description: row.description ?? null,
  createdAt: toIsoString(row.created_at),
  updatedAt: toIsoString(row.updated_at),
});

export interface ProjectRow extends RowDataPacket {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  repo_url: string | null;
  live_url: string | null;
  tags: unknown;
  featured: number | boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

export const mapProjectRow = (row: ProjectRow) => ({
  _id: row.id,
  id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description ?? null,
  thumbnailUrl: row.thumbnail_url ?? null,
  repoUrl: row.repo_url ?? null,
  liveUrl: row.live_url ?? null,
  tags: parseStringArray(row.tags),
  featured: Boolean(row.featured),
  createdAt: toIsoString(row.created_at),
  updatedAt: toIsoString(row.updated_at),
});

export interface FaqRow extends RowDataPacket {
  id: string;
  question: string;
  answer_html: string | null;
  answer_json: unknown;
  order_index: number | null;
  published: number | boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

export const mapFaqRow = (row: FaqRow) => ({
  _id: row.id,
  id: row.id,
  question: row.question,
  answerHtml: row.answer_html ?? null,
  answerJson: parseJsonValue(row.answer_json),
  order: row.order_index ?? 0,
  published: Boolean(row.published ?? true),
  createdAt: toIsoString(row.created_at),
  updatedAt: toIsoString(row.updated_at),
});
