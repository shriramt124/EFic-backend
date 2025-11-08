import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { PostModel } from '@/models/Post';
import { jsonOk, jsonError } from '../../_utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  await connectDB();
  const post = await PostModel.findOne({ slug: params.slug }).lean();
  if (!post) return jsonError('Not found', 404);
  return jsonOk(post);
}

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await connectDB();
    const body = await req.json();
    const post = await PostModel.findOneAndUpdate({ slug: params.slug }, body, { new: true }).lean();
    if (!post) return jsonError('Not found', 404);
    return jsonOk(post);
  } catch (e: any) {
    return jsonError(e.message || 'Failed to update', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await connectDB();
    const post = await PostModel.findOneAndDelete({ slug: params.slug }).lean();
    if (!post) return jsonError('Not found', 404);
    return jsonOk({ deleted: true });
  } catch (e: any) {
    return jsonError(e.message || 'Failed to delete', 500);
  }
}
