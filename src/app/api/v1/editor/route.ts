import { randomUUID } from 'crypto';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { jsonOk, jsonError } from '../_utils';
import { mapPostRow, type PostRow } from '@/lib/sql-mappers';
import type { ResultSetHeader } from 'mysql2/promise';

export const dynamic = 'force-dynamic';

const DEFAULT_SLUG = 'editor-default';

function toClient(p: any) {
  const createdAt = p.createdAt ? new Date(p.createdAt) : new Date();
  return {
    title: p.title ?? '',
    content: p.contentHtml ?? '',
    cover: p.coverImageUrl ?? '',
    author: p.author ?? '',
    readingTime: p.readTime ?? 0,
    createdAt: createdAt.toISOString(),
  };
}

export async function GET() {
  const db = await connectDB();
  let [rows] = await db.query<PostRow[]>(`SELECT * FROM posts WHERE slug = ? LIMIT 1`, [DEFAULT_SLUG]);

  if (!rows.length) {
    const id = randomUUID();
    await db.execute(
      `INSERT INTO posts (id, slug, title, content_html, cover_image_url, author, read_time, published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, DEFAULT_SLUG, 'Untitled', '<p></p>', null, null, null, 0]
    );
    [rows] = await db.query<PostRow[]>(`SELECT * FROM posts WHERE id = ? LIMIT 1`, [id]);
  }

  return jsonOk(toClient(mapPostRow(rows[0])));
}

export async function POST(req: NextRequest) {
  try {
    const db = await connectDB();
    const body = await req.json();

    const title = body.title ?? 'Untitled';
    const contentHtml = body.content ?? '<p></p>';
    const coverImageUrl = body.cover ?? null;
    const author = body.author ?? null;
    const readTime = body.readingTime ?? null;

    const [updateResult] = await db.execute<ResultSetHeader>(
      `UPDATE posts
       SET title = ?, content_html = ?, cover_image_url = ?, author = ?, read_time = ?, updated_at = NOW()
       WHERE slug = ?`,
      [title, contentHtml, coverImageUrl, author, readTime, DEFAULT_SLUG]
    );

    if (updateResult.affectedRows === 0) {
      const id = randomUUID();
      await db.execute(
        `INSERT INTO posts (id, slug, title, content_html, cover_image_url, author, read_time, published)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, DEFAULT_SLUG, title, contentHtml, coverImageUrl, author, readTime, 0]
      );
    }

    const [rows] = await db.query<PostRow[]>(`SELECT * FROM posts WHERE slug = ? LIMIT 1`, [DEFAULT_SLUG]);
    if (!rows.length) {
      return jsonError('Failed to load editor content', 500);
    }
    return jsonOk(toClient(mapPostRow(rows[0])));
  } catch (error: any) {
    return jsonError(error?.message || 'Failed to save editor content', 500);
  }
}
