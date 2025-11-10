import { randomUUID } from 'crypto';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { jsonOk, jsonError, getPagination } from '../_utils';
import { mapProjectRow, type ProjectRow } from '@/lib/sql-mappers';
import { z } from 'zod';
import type { RowDataPacket } from 'mysql2/promise';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const db = await connectDB();
    const { searchParams } = new URL(req.url);
    const { limit, skip } = getPagination(searchParams);

    const q = searchParams.get('q');
    const featured = searchParams.get('featured');

    const filters: string[] = [];
    const params: Array<string | number> = [];

    if (q) {
      const like = `%${q.trim()}%`;
      filters.push('(name LIKE ? OR description LIKE ? )');
      params.push(like, like);
    }

    if (featured === 'true') {
      filters.push('featured = ?');
      params.push(1);
    } else if (featured === 'false') {
      filters.push('featured = ?');
      params.push(0);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const [rows] = await db.query<ProjectRow[]>(
      `SELECT * FROM projects ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, skip]
    );

    const [countRows] = await db.query<Array<{ total: number } & RowDataPacket>>(
      `SELECT COUNT(*) AS total FROM projects ${whereClause}`,
      params
    );

    const total = countRows[0]?.total ?? 0;
    const items = rows.map(mapProjectRow);
    return jsonOk({ items, total });
  } catch (error: any) {
    console.error('Failed to GET projects:', error);
    return jsonError(error?.message || 'Failed to fetch projects', 500);
  }
}

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(2).regex(/^[a-z0-9\-]+$/),
  description: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
  repoUrl: z.preprocess((v) => (v === '' ? undefined : v), z.string().url().optional()),
  liveUrl: z.preprocess((v) => (v === '' ? undefined : v), z.string().url().optional()),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
});

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

    await db.execute(
      `INSERT INTO projects (
        id,
        name,
        slug,
        description,
        thumbnail_url,
        repo_url,
        live_url,
        tags,
        featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
      [
        id,
        data.name,
        data.slug,
        data.description ?? null,
        data.thumbnailUrl ?? null,
        data.repoUrl ?? null,
        data.liveUrl ?? null,
        JSON.stringify(data.tags ?? []),
        data.featured ? 1 : 0,
      ]
    );

    const [[created]] = await db.query<ProjectRow[]>(`SELECT * FROM projects WHERE id = ?`, [id]);
    return jsonOk(mapProjectRow(created));
  } catch (error: any) {
    console.error('Failed to create project:', error);
    return jsonError(error?.message || 'Failed to create project', 500);
  }
}
