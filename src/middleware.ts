import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware — Firebase auth is handled client-side.
 * Protected route redirects are managed by each page component.
 * This middleware is kept minimal for future server-side checks if needed.
 */
export async function middleware(request: NextRequest) {
  // Simply pass through — auth is handled client-side via Firebase
  return NextResponse.next({
    request: { headers: request.headers },
  });
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
