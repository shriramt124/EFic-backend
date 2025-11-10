import { randomUUID } from 'crypto';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { jsonOk, jsonError, getPagination } from '../_utils';
import { mapCategoryRow, type CategoryRow } from '@/lib/sql-mappers';
import { z } from 'zod';
import type { RowDataPacket } from 'mysql2/promise';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const db = await connectDB();
  const { searchParams } = new URL(req.url);
  const { limit, skip } = getPagination(searchParams);

  const [rows] = await db.query<CategoryRow[]>(
    `SELECT * FROM categories ORDER BY name ASC LIMIT ? OFFSET ?`,
    [limit, skip]
  );

  const [countRows] = await db.query<Array<{ total: number } & RowDataPacket>>(
    `SELECT COUNT(*) AS total FROM categories`
  );

  const items = rows.map(mapCategoryRow);
  const total = countRows[0]?.total ?? 0;
  return jsonOk({ items, total });
}

export async function POST(req: NextRequest) {
  try {
    const db = await connectDB();
    const body = await req.json();

    const schema = z.object({
      name: z.string().min(2),
      slug: z.string().min(2).regex(/^[a-z0-9\-]+$/),
      description: z.string().optional(),
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonError('Validation failed', 422, { issues: parsed.error.issues });
    }

    const data = parsed.data;
    const id = randomUUID();

    await db.execute(
      `INSERT INTO categories (id, name, slug, description) VALUES (?, ?, ?, ?)` ,
      [id, data.name, data.slug, data.description ?? null]
    );

    const [[created]] = await db.query<CategoryRow[]>(`SELECT * FROM categories WHERE id = ?`, [id]);
    return jsonOk(mapCategoryRow(created));
  } catch (error: any) {
    return jsonError(error?.message || 'Failed to create category', 500);
  }
}
