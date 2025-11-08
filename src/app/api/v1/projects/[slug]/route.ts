import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { ProjectModel } from '@/models/Project';
import { jsonOk, jsonError } from '../../_utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectDB();
    const { slug } = await params;
    const project = await ProjectModel.findOne({ slug }).lean();
    if (!project) return jsonError('Not found', 404);
    return jsonOk(project);
  } catch (e: any) {
    console.error('Failed to GET project:', e);
    return jsonError(e.message || 'Failed to fetch project', 500);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectDB();
    const body = await req.json();
    const { slug } = await params;
    const project = await ProjectModel.findOneAndUpdate({ slug }, body, { new: true }).lean();
    if (!project) return jsonError('Not found', 404);
    return jsonOk(project);
  } catch (e: any) {
    console.error('Failed to PATCH project:', e);
    return jsonError(e.message || 'Failed to update project', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectDB();
    const { slug } = await params;
    const project = await ProjectModel.findOneAndDelete({ slug }).lean();
    if (!project) return jsonError('Not found', 404);
    return jsonOk({ deleted: true });
  } catch (e: any) {
    console.error('Failed to DELETE project:', e);
    return jsonError(e.message || 'Failed to delete project', 500);
  }
}
