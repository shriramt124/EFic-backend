import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { ProjectModel } from '@/models/Project';
import { jsonOk, jsonError, getPagination } from '../_utils';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const { limit, skip } = getPagination(searchParams);

    const filter: any = {};
    const q = searchParams.get('q');
    const featured = searchParams.get('featured');

    if (q) {
      filter.$text = { $search: q };
    }
    if (featured === 'true') filter.featured = true;
    if (featured === 'false') filter.featured = false;

    const [items, total] = await Promise.all([
      ProjectModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ProjectModel.countDocuments(filter),
    ]);
    return jsonOk({ items, total });
  } catch (e: any) {
    console.error('Failed to GET projects:', e);
    return jsonError(e.message || 'Failed to fetch projects', 500);
  }
}

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(2).regex(/^[a-z0-9\-]+$/),
  description: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
  repoUrl: z.preprocess((v) => (v === '' ? undefined : v), z.string().url().optional()),
  liveUrl: z.preprocess((v) => (v === '' ? undefined : v), z.string().url().optional()),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const raw = await req.json();
    const parsed = createSchema.safeParse(raw);
    if (!parsed.success) {
      return jsonError('Validation failed', 422, { issues: parsed.error.issues });
    }
    const data = parsed.data;
    const project = await ProjectModel.create(data);
    return jsonOk(project);
  } catch (e: any) {
    console.error('Failed to create project:', e);
    return jsonError(e.message || 'Failed to create project', 500);
  }
}
