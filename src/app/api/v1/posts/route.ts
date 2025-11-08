import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { PostModel } from '@/models/Post';
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
    const published = searchParams.get('published');

    // Only add text search if 'q' is a non-empty string
    if (q) {
      filter.$text = { $search: q };
    }

    // Filter by published status if the parameter is present
    if (published === 'true') {
      filter.published = true;
    } else if (published === 'false') {
      filter.published = false;
    }

    const [items, total] = await Promise.all([
      PostModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      PostModel.countDocuments(filter),
    ]);
    return jsonOk({ items, total });
  } catch (e: any) {
    console.error('Failed to GET posts:', e);
    return jsonError(e.message || 'Failed to fetch posts', 500);
  }
}

const createSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9\-]+$/),
  coverImageUrl: z.string().url().optional(),
  readTime: z.number().int().min(0).max(180).optional(),
  url: z.preprocess((val) => (val === "" ? undefined : val), z.string().url().optional()),
  excerpt: z.string().max(500).optional(),
  contentHtml: z.string().optional(),
  contentJson: z.any().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  published: z.boolean().optional(),
  publishedAt: z.preprocess((v) => (typeof v === 'string' ? new Date(v) : v), z.date()).optional(),
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
    if (data.published && !data.publishedAt) {
      (data as any).publishedAt = new Date();
    }
    const post = await PostModel.create(data);
    return jsonOk(post);
  } catch (e: any) {
    return jsonError(e.message || 'Failed to create post', 500);
  }
}
