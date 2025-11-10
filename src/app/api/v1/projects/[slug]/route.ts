import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { jsonOk, jsonError } from '../../_utils';
import { mapProjectRow, type ProjectRow } from '@/lib/sql-mappers';
import { z } from 'zod';
import type { ResultSetHeader } from 'mysql2/promise';

export const dynamic = 'force-dynamic';

const updateSchema = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    thumbnailUrl: z.string().url().optional(),
    repoUrl: z.preprocess((v) => (v === '' ? undefined : v), z.string().url().optional()),
    liveUrl: z.preprocess((v) => (v === '' ? undefined : v), z.string().url().optional()),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().optional(),
  })
  .partial();

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const db = await connectDB();
    const { slug } = await params;
    const [rows] = await db.query<ProjectRow[]>(`SELECT * FROM projects WHERE slug = ? LIMIT 1`, [slug]);
    if (!rows.length) return jsonError('Not found', 404);
    return jsonOk(mapProjectRow(rows[0]));
  } catch (error: any) {
    console.error('Failed to GET project:', error);
    return jsonError(error?.message || 'Failed to fetch project', 500);
  }
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
    const values: Array<string | number | null> = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description ?? null);
    }
    if (updates.thumbnailUrl !== undefined) {
      fields.push('thumbnail_url = ?');
      values.push(updates.thumbnailUrl ?? null);
    }
    if (updates.repoUrl !== undefined) {
      fields.push('repo_url = ?');
      values.push(updates.repoUrl ?? null);
    }
    if (updates.liveUrl !== undefined) {
      fields.push('live_url = ?');
      values.push(updates.liveUrl ?? null);
    }
    if (updates.tags !== undefined) {
      fields.push('tags = ?');
      values.push(JSON.stringify(updates.tags ?? []));
    }
    if (updates.featured !== undefined) {
      fields.push('featured = ?');
      values.push(updates.featured ? 1 : 0);
    }

    if (!fields.length) {
      const [rows] = await db.query<ProjectRow[]>(`SELECT * FROM projects WHERE slug = ? LIMIT 1`, [slug]);
      if (!rows.length) return jsonError('Not found', 404);
      return jsonOk(mapProjectRow(rows[0]));
    }

    fields.push('updated_at = NOW()');

    const [result] = await db.execute<ResultSetHeader>(
      `UPDATE projects SET ${fields.join(', ')} WHERE slug = ?`,
      [...values, slug]
    );

    if (result.affectedRows === 0) {
      return jsonError('Not found', 404);
    }

    const [rows] = await db.query<ProjectRow[]>(`SELECT * FROM projects WHERE slug = ? LIMIT 1`, [slug]);
    if (!rows.length) {
      return jsonError('Not found', 404);
    }

    return jsonOk(mapProjectRow(rows[0]));
  } catch (error: any) {
    console.error('Failed to PATCH project:', error);
    return jsonError(error?.message || 'Failed to update project', 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const db = await connectDB();
    const { slug } = await params;
    const [result] = await db.execute<ResultSetHeader>(`DELETE FROM projects WHERE slug = ?`, [slug]);
    if (result.affectedRows === 0) {
      return jsonError('Not found', 404);
    }
    return jsonOk({ deleted: true });
  } catch (error: any) {
    console.error('Failed to DELETE project:', error);
    return jsonError(error?.message || 'Failed to delete project', 500);
  }
}
