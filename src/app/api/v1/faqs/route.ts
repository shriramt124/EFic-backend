import { randomUUID } from 'crypto';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { jsonOk, jsonError, getPagination } from '../_utils';
import { mapFaqRow, type FaqRow } from '@/lib/sql-mappers';
import { z } from 'zod';
import type { RowDataPacket } from 'mysql2/promise';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const db = await connectDB();
  const { searchParams } = new URL(req.url);
  const { limit, skip } = getPagination(searchParams);

  const [rows] = await db.query<FaqRow[]>(
    `SELECT * FROM faqs ORDER BY order_index ASC, created_at DESC LIMIT ? OFFSET ?`,
    [limit, skip]
  );

  const [countRows] = await db.query<Array<{ total: number } & RowDataPacket>>(
    `SELECT COUNT(*) AS total FROM faqs`
  );

  const items = rows.map(mapFaqRow);
  const total = countRows[0]?.total ?? 0;
  return jsonOk({ items, total });
}

export async function POST(req: NextRequest) {
  try {
    const db = await connectDB();
    const body = await req.json();

    const schema = z.object({
      question: z.string().min(2),
      answerHtml: z.string().optional(),
      answerJson: z.any().optional(),
      order: z.number().int().nonnegative().optional(),
      published: z.boolean().optional(),
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonError('Validation failed', 422, { issues: parsed.error.issues });
    }

    const data = parsed.data;
    const id = randomUUID();

    await db.execute(
      `INSERT INTO faqs (id, question, answer_html, answer_json, order_index, published)
       VALUES (?, ?, ?, ?, ?, ?)` ,
      [
        id,
        data.question,
        data.answerHtml ?? null,
        data.answerJson === undefined ? null : JSON.stringify(data.answerJson),
        data.order ?? 0,
        data.published === undefined ? 1 : data.published ? 1 : 0,
      ]
    );

    const [[created]] = await db.query<FaqRow[]>(`SELECT * FROM faqs WHERE id = ?`, [id]);
    return jsonOk(mapFaqRow(created));
  } catch (error: any) {
    return jsonError(error?.message || 'Failed to create FAQ', 500);
  }
}
