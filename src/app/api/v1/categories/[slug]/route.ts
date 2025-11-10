import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { jsonOk, jsonError } from '../../_utils';
import { mapCategoryRow, type CategoryRow } from '@/lib/sql-mappers';
import { z } from 'zod';
import type { ResultSetHeader } from 'mysql2/promise';

export const dynamic = 'force-dynamic';

const updateSchema = z
  .object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
  })
  .partial();

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
    const values: Array<string | null> = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description ?? null);
    }

    if (!fields.length) {
      const [[category]] = await db.query<CategoryRow[]>(`SELECT * FROM categories WHERE slug = ?`, [slug]);
      if (!category) return jsonError('Not found', 404);
      return jsonOk(mapCategoryRow(category));
    }

    fields.push('updated_at = NOW()');

    const [result] = await db.execute<ResultSetHeader>(
      `UPDATE categories SET ${fields.join(', ')} WHERE slug = ?`,
      [...values, slug]
    );

    if (result.affectedRows === 0) {
      return jsonError('Not found', 404);
    }

    const [[category]] = await db.query<CategoryRow[]>(`SELECT * FROM categories WHERE slug = ?`, [slug]);
    if (!category) {
      return jsonError('Not found', 404);
    }

    return jsonOk(mapCategoryRow(category));
  } catch (error: any) {
    return jsonError(error?.message || 'Failed to update', 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const db = await connectDB();
    const { slug } = await params;
    const [result] = await db.execute<ResultSetHeader>(`DELETE FROM categories WHERE slug = ?`, [slug]);
    if (result.affectedRows === 0) {
      return jsonError('Not found', 404);
    }
    return jsonOk({ deleted: true });
  } catch (error: any) {
    return jsonError(error?.message || 'Failed to delete', 500);
  }
}
