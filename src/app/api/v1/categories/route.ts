import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { CategoryModel } from '@/models/Category';
import { jsonOk, jsonError, getPagination } from '../_utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const { limit, skip } = getPagination(searchParams);
  const items = await CategoryModel.find({}).sort({ name: 1 }).skip(skip).limit(limit).lean();
  const total = await CategoryModel.countDocuments();
  return jsonOk({ items, total });
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const cat = await CategoryModel.create(body);
    return jsonOk(cat);
  } catch (e: any) {
    return jsonError(e.message || 'Failed to create category', 500);
  }
}
