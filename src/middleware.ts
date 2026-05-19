import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware — Firebase auth is handled client-side.
 * Protected route redirects are managed by each page component.
 * 
 * NOTE: www-to-non-www redirect should be configured in Vercel Dashboard
 * under Settings > Domains (add www domain and set redirect to non-www).
 */
export async function middleware(request: NextRequest) {
  return NextResponse.next({
    request: { headers: request.headers },
  });
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
