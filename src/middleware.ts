import { NextResponse, type NextRequest } from 'next/server';

// Define the allowed origin for your main project
const allowedOrigin = 'http://localhost:3000';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Handle preflight requests (OPTIONS method)
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 }); // No content
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400'); // Cache for 24 hours
    return response;
  }

  // For all other requests, add the CORS header to the response
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);

  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/api/v1/:path*',
};
