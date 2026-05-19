import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware handles:
 * 1. www -> non-www canonical redirect (SEO)
 * 2. Pass-through for auth (handled client-side via Firebase)
 */
export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';

  // Canonical domain: redirect www to non-www (301 permanent)
  if (host.startsWith('www.')) {
    const nonWwwHost = host.replace('www.', '');
    const url = request.nextUrl.clone();
    url.host = nonWwwHost;
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next({
    request: { headers: request.headers },
  });
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files and internal Next.js paths.
     * This ensures www redirect works on every page.
     */
    '/((?!_next/static|_next/image|favicon.ico|icons|images|manifest.json|sw.js|workbox-).*)',
  ],
};
