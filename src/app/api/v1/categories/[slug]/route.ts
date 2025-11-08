import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { CategoryModel } from '@/models/Category';
import { jsonOk, jsonError } from '../../_utils';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await connectDB();
    const body = await req.json();
    const doc = await CategoryModel.findOneAndUpdate({ slug: params.slug }, body, { new: true }).lean();
    if (!doc) return jsonError('Not found', 404);
    return jsonOk(doc);
  } catch (e: any) {
    return jsonError(e.message || 'Failed to update', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await connectDB();
    const doc = await CategoryModel.findOneAndDelete({ slug: params.slug }).lean();
    if (!doc) return jsonError('Not found', 404);
    return jsonOk({ deleted: true });
  } catch (e: any) {
    return jsonError(e.message || 'Failed to delete', 500);
  }
}
