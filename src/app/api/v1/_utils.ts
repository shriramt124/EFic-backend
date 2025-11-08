import { NextResponse } from 'next/server';

export function jsonOk(data: unknown, init?: ResponseInit) {
  return NextResponse.json({ data }, { status: 200, ...init });
}

export function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function getPagination(searchParams: URLSearchParams) {
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '10', 10), 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
