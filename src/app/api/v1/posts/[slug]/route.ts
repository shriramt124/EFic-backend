import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { jsonOk, jsonError } from '../../_utils';
import { mapPostRow, type PostRow } from '@/lib/sql-mappers';
import { z } from 'zod';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export const dynamic = 'force-dynamic';

const updateSchema = z
  .object({
    title: z.string().min(2).optional(),
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
  })
  .partial();

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const db = await connectDB();
  const { slug } = await params;
  const [rows] = await db.query<PostRow[]>(`SELECT * FROM posts WHERE slug = ? LIMIT 1`, [slug]);
  if (!rows.length) return jsonError('Not found', 404);
  return jsonOk(mapPostRow(rows[0]));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const db = await connectDB();
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError('Validation failed', 422, { issues: parsed.error.issues });
    }

    const updates = parsed.data;
    const { slug } = await params;

    const fields: string[] = [];
    const values: Array<string | number | null | Date> = [];

    const push = (column: string, value: string | number | null | Date) => {
      fields.push(`${column} = ?`);
      values.push(value);
    };

    if (updates.title !== undefined) push('title', updates.title);
    if (updates.coverImageUrl !== undefined) push('cover_image_url', updates.coverImageUrl ?? null);
    if (updates.readTime !== undefined) push('read_time', updates.readTime ?? null);
    if (updates.url !== undefined) push('url', updates.url ?? null);
    if (updates.excerpt !== undefined) push('excerpt', updates.excerpt ?? null);
    if (updates.contentHtml !== undefined) push('content_html', updates.contentHtml ?? null);
    if (updates.contentJson !== undefined) {
      const jsonValue = updates.contentJson === null ? null : JSON.stringify(updates.contentJson);
      push('content_json', jsonValue);
    }
    if (updates.tags !== undefined) push('tags', JSON.stringify(updates.tags ?? []));
    if (updates.category !== undefined) push('category_id', updates.category ?? null);
    if (updates.author !== undefined) push('author', updates.author ?? null);
    if (updates.publishedAt !== undefined) {
      push('published_at', updates.publishedAt ? new Date(updates.publishedAt) : null);
    }
    if (updates.published !== undefined) {
      push('published', updates.published ? 1 : 0);
      if (updates.published && updates.publishedAt === undefined) {
        fields.push('published_at = COALESCE(published_at, NOW())');
      }
    }

    if (!fields.length) {
      const [rows] = await db.query<PostRow[]>(`SELECT * FROM posts WHERE slug = ? LIMIT 1`, [slug]);
      if (!rows.length) return jsonError('Not found', 404);
      return jsonOk(mapPostRow(rows[0]));
    }

    fields.push('updated_at = NOW()');

    const [result] = await db.execute<ResultSetHeader>(
      `UPDATE posts SET ${fields.join(', ')} WHERE slug = ?`,
      [...values, slug]
    );

    if (result.affectedRows === 0) {
      return jsonError('Not found', 404);
    }

    const [rows] = await db.query<PostRow[]>(`SELECT * FROM posts WHERE slug = ? LIMIT 1`, [slug]);
    if (!rows.length) {
      return jsonError('Not found', 404);
    }

    return jsonOk(mapPostRow(rows[0]));
  } catch (error: any) {
    console.error('Failed to update post:', error);
    return jsonError(error?.message || 'Failed to update', 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const db = await connectDB();
    const { slug } = await params;
    const [result] = await db.execute<ResultSetHeader>(`DELETE FROM posts WHERE slug = ?`, [slug]);
    if (result.affectedRows === 0) {
      return jsonError('Not found', 404);
    }
    return jsonOk({ deleted: true });
  } catch (error: any) {
    console.error('Failed to delete post:', error);
    return jsonError(error?.message || 'Failed to delete', 500);
  }
}
