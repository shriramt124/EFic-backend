import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { FaqModel } from '@/models/Faq';
import { jsonOk, jsonError, getPagination } from '../_utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const { limit, skip } = getPagination(searchParams);
  const items = await FaqModel.find({}).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit).lean();
  const total = await FaqModel.countDocuments();
  return jsonOk({ items, total });
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const faq = await FaqModel.create(body);
    return jsonOk(faq);
  } catch (e: any) {
    return jsonError(e.message || 'Failed to create FAQ', 500);
  }
}
