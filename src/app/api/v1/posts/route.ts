import { randomUUID } from 'crypto';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { jsonOk, jsonError, getPagination } from '../_utils';
import { mapPostRow, type PostRow } from '@/lib/sql-mappers';
import { z } from 'zod';
import type { RowDataPacket } from 'mysql2/promise';

export const dynamic = 'force-dynamic';

const createSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9\-]+$/),
  coverImageUrl: z.string().url().optional(),
  readTime: z.number().int().min(0).max(180).optional(),
  url: z.preprocess((val) => (val === '' ? undefined : val), z.string().url().optional()),
  excerpt: z.string().max(500).optional(),
  contentHtml: z.string().optional(),
  contentJson: z.any().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  author: z.string().optional(),
  published: z.boolean().optional(),
  publishedAt: z
    .preprocess((value) => (typeof value === 'string' ? new Date(value) : value), z.date())
    .optional(),
});

export async function GET(req: NextRequest) {
  try {
    const db = await connectDB();
    const { searchParams } = new URL(req.url);
    const { limit, skip } = getPagination(searchParams);

    const filters: string[] = [];
    const params: Array<string | number> = [];

    const q = searchParams.get('q')?.trim();
    if (q) {
      const like = `%${q}%`;
      filters.push('(title LIKE ? OR excerpt LIKE ? OR content_html LIKE ? )');
      params.push(like, like, like);
    }

    const published = searchParams.get('published');
    if (published === 'true') {
      filters.push('published = ?');
      params.push(1);
    } else if (published === 'false') {
      filters.push('published = ?');
      params.push(0);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const [rows] = await db.query<PostRow[]>(
      `SELECT * FROM posts ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, skip]
    );

    const [countRows] = await db.query<Array<{ total: number } & RowDataPacket>>(
      `SELECT COUNT(*) AS total FROM posts ${whereClause}`,
      params
    );

    const total = countRows[0]?.total ?? 0;
    const items = rows.map(mapPostRow);
    return jsonOk({ items, total });
  } catch (error: any) {
    console.error('Failed to GET posts:', error);
    return jsonError(error?.message || 'Failed to fetch posts', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = await connectDB();
    const raw = await req.json();
    const parsed = createSchema.safeParse(raw);
    if (!parsed.success) {
      return jsonError('Validation failed', 422, { issues: parsed.error.issues });
    }

    const data = parsed.data;
    const id = randomUUID();
    const publishedAt = data.published
      ? data.publishedAt ?? new Date()
      : data.publishedAt ?? null;

    await db.execute(
      `INSERT INTO posts (
        id,
        title,
        slug,
        excerpt,
        content_html,
        content_json,
        cover_image_url,
        read_time,
        url,
        author,
        tags,
        category_id,
        published,
        published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.title,
        data.slug,
        data.excerpt ?? null,
        data.contentHtml ?? null,
        data.contentJson === undefined ? null : JSON.stringify(data.contentJson),
        data.coverImageUrl ?? null,
        data.readTime ?? null,
        data.url ?? null,
        data.author ?? null,
        JSON.stringify(data.tags ?? []),
        data.category ?? null,
        data.published ? 1 : 0,
        publishedAt,
      ]
    );

    const [[created]] = await db.query<PostRow[]>(`SELECT * FROM posts WHERE id = ?`, [id]);
    return jsonOk(mapPostRow(created));
  } catch (error: any) {
    console.error('Failed to create post:', error);
    return jsonError(error?.message || 'Failed to create post', 500);
  }
}
