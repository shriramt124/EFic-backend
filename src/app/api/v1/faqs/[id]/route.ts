import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { FaqModel } from '@/models/Faq';
import { jsonOk, jsonError } from '../../_utils';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const body = await req.json();
    if (!mongoose.isValidObjectId(params.id)) return jsonError('Invalid id', 400);
    const faq = await FaqModel.findByIdAndUpdate(params.id, body, { new: true }).lean();
    if (!faq) return jsonError('Not found', 404);
    return jsonOk(faq);
  } catch (e: any) {
    return jsonError(e.message || 'Failed to update FAQ', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    if (!mongoose.isValidObjectId(params.id)) return jsonError('Invalid id', 400);
    const res = await FaqModel.findByIdAndDelete(params.id).lean();
    if (!res) return jsonError('Not found', 404);
    return jsonOk({ deleted: true });
  } catch (e: any) {
    return jsonError(e.message || 'Failed to delete FAQ', 500);
  }
}
