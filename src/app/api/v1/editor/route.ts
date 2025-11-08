import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { PostModel } from '@/models/Post';
import { jsonOk, jsonError } from '../_utils';

export const dynamic = 'force-dynamic';

const DEFAULT_SLUG = 'editor-default';

function toClient(p: any) {
  return {
    title: p.title || '',
    content: p.contentHtml || '',
    cover: p.coverImageUrl || '',
    author: p.author || '',
    readingTime: p.readingTime || 0,
    createdAt: (p.createdAt || new Date()).toISOString(),
  };
}

export async function GET() {
  await connectDB();
  let post = await PostModel.findOne({ slug: DEFAULT_SLUG }).lean();
  if (!post) {
    post = await PostModel.create({ title: 'Untitled', slug: DEFAULT_SLUG, contentHtml: '<p></p>' });
  }
  return jsonOk(toClient(post));
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const update: any = {
      title: body.title,
      contentHtml: body.content,
      coverImageUrl: body.cover,
      author: body.author,
      readingTime: body.readingTime,
    };
    const post = await PostModel.findOneAndUpdate(
      { slug: DEFAULT_SLUG },
      { $set: update },
      { new: true, upsert: true }
    ).lean();
    return jsonOk(toClient(post));
  } catch (e: any) {
    return jsonError(e.message || 'Failed to save editor content', 500);
  }
}
