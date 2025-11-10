import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { jsonOk, jsonError } from '../../_utils';
import { mapFaqRow, type FaqRow } from '@/lib/sql-mappers';
import { z } from 'zod';
import type { ResultSetHeader } from 'mysql2/promise';

export const dynamic = 'force-dynamic';

const updateSchema = z
  .object({
    question: z.string().min(2).optional(),
    answerHtml: z.string().optional(),
    answerJson: z.any().optional(),
    order: z.number().int().nonnegative().optional(),
    published: z.boolean().optional(),
  })
  .partial();

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = await connectDB();
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError('Validation failed', 422, { issues: parsed.error.issues });
    }

    const updates = parsed.data;
    const { id } = await params;

    const fields: string[] = [];
    const values: Array<string | number | null | Date> = [];

    if (updates.question !== undefined) {
      fields.push('question = ?');
      values.push(updates.question);
    }
    if (updates.answerHtml !== undefined) {
      fields.push('answer_html = ?');
      values.push(updates.answerHtml ?? null);
    }
    if (updates.answerJson !== undefined) {
      const jsonValue = updates.answerJson === null ? null : JSON.stringify(updates.answerJson);
      fields.push('answer_json = ?');
      values.push(jsonValue);
    }
    if (updates.order !== undefined) {
      fields.push('order_index = ?');
      values.push(updates.order ?? 0);
    }
    if (updates.published !== undefined) {
      fields.push('published = ?');
      values.push(updates.published ? 1 : 0);
    }

    if (!fields.length) {
      const [[faq]] = await db.query<FaqRow[]>(`SELECT * FROM faqs WHERE id = ?`, [id]);
      if (!faq) return jsonError('Not found', 404);
      return jsonOk(mapFaqRow(faq));
    }

    fields.push('updated_at = NOW()');

    const [result] = await db.execute<ResultSetHeader>(
      `UPDATE faqs SET ${fields.join(', ')} WHERE id = ?`,
      [...values, id]
    );

    if (result.affectedRows === 0) {
      return jsonError('Not found', 404);
    }

    const [[faq]] = await db.query<FaqRow[]>(`SELECT * FROM faqs WHERE id = ?`, [id]);
    if (!faq) {
      return jsonError('Not found', 404);
    }

    return jsonOk(mapFaqRow(faq));
  } catch (error: any) {
    return jsonError(error?.message || 'Failed to update FAQ', 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = await connectDB();
    const { id } = await params;
    const [result] = await db.execute<ResultSetHeader>(`DELETE FROM faqs WHERE id = ?`, [id]);
    if (result.affectedRows === 0) {
      return jsonError('Not found', 404);
    }
    return jsonOk({ deleted: true });
  } catch (error: any) {
    return jsonError(error?.message || 'Failed to delete FAQ', 500);
  }
}
