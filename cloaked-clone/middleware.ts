/**
 * Next.js Edge Middleware for Shielded Privacy.
 *
 * Responsibilities:
 *  1. Protect /dashboard/* routes — redirect unauthenticated users to /login.
 *  2. Protect /api/* routes — return 401 for unauthenticated requests,
 *     with allow-list exceptions for public API paths (auth, webhooks).
 *  3. Rate-limit authenticated API requests to 50 requests per 60-second
 *     window per user, using a sliding-window counter stored in a KV-style
 *     header counter (edge-compatible, no Redis required).
 *
 * Note: Rate limiting here uses the built-in request headers and a
 * stateless algorithm suitable for the edge runtime. For a stateful
 * per-user counter, replace the rate-limit section with a Vercel KV or
 * Upstash Redis call.
 */

import { NextRequest, NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from './lib/auth.config';

// Edge-safe Auth.js instance — does NOT import Prisma or bcrypt, so it can
// run in the middleware (Edge) runtime without crashing.
const { auth } = NextAuth(authConfig);

// ─── Config ───────────────────────────────────────────────────────────────────

/** API paths that do NOT require authentication. */
const PUBLIC_API_PATHS: RegExp[] = [
  /^\/api\/auth\//,         // NextAuth sign-in / callback / session
  /^\/api\/webhooks\//,     // Stripe, Twilio, and other webhooks
  /^\/api\/health$/,        // Railway healthcheck — must never require auth
];

/** Rate limit: max requests per window per user. */
const RATE_LIMIT_MAX = 50;
const RATE_LIMIT_WINDOW_SECONDS = 60;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isPublicApiPath(pathname: string): boolean {
  return PUBLIC_API_PATHS.some((re) => re.test(pathname));
}

/**
 * Stateless rate-limiter using a bucket encoded in a response cookie.
 *
 * The cookie stores: `{count}:{windowStart}` and is updated on every call.
 * This is good enough for the edge — upgrade to Upstash Redis for strict
 * distributed enforcement across all edge nodes.
 */
function checkRateLimit(
  req: NextRequest,
  userId: string,
): { allowed: boolean; remaining: number; resetAt: number } {
  const cookieName = `_rl_${userId.slice(-8)}`; // short suffix per user
  const raw = req.cookies.get(cookieName)?.value ?? '';
  const now = Math.floor(Date.now() / 1_000);

  let count = 0;
  let windowStart = now;

  if (raw) {
    const parts = raw.split(':');
    const storedCount = parseInt(parts[0] ?? '0', 10);
    const storedWindow = parseInt(parts[1] ?? '0', 10);

    if (now - storedWindow < RATE_LIMIT_WINDOW_SECONDS) {
      count = storedCount;
      windowStart = storedWindow;
    }
  }

  count++;
  const allowed = count <= RATE_LIMIT_MAX;
  const remaining = Math.max(0, RATE_LIMIT_MAX - count);
  const resetAt = windowStart + RATE_LIMIT_WINDOW_SECONDS;

  return { allowed, remaining, resetAt };
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  // ── Dashboard protection ──────────────────────────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    const session = await auth();

    if (!session?.user?.id) {
      const loginUrl = new URL('/sign-in', req.url);
      loginUrl.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // ── API protection ────────────────────────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    // Allow public paths through without authentication.
    if (isPublicApiPath(pathname)) {
      return NextResponse.next();
    }

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      );
    }

    // Rate limiting.
    const { allowed, remaining, resetAt } = checkRateLimit(req, session.user.id);

    const res = allowed
      ? NextResponse.next()
      : NextResponse.json(
          { success: false, error: 'Rate limit exceeded — please slow down' },
          { status: 429 },
        );

    // Attach standard rate-limit headers.
    res.headers.set('X-RateLimit-Limit', String(RATE_LIMIT_MAX));
    res.headers.set('X-RateLimit-Remaining', String(remaining));
    res.headers.set('X-RateLimit-Reset', String(resetAt));

    if (!allowed) {
      res.headers.set('Retry-After', String(resetAt - Math.floor(Date.now() / 1_000)));
    } else {
      // Persist counter in cookie on the response.
      const cookieName = `_rl_${session.user.id.slice(-8)}`;
      const windowStart = Math.floor(Date.now() / 1_000);
      res.cookies.set(cookieName, `${RATE_LIMIT_MAX - remaining}:${windowStart}`, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: RATE_LIMIT_WINDOW_SECONDS,
        path: '/api',
      });
    }

    return res;
  }

  return NextResponse.next();
}

// ─── Matcher ──────────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     *   - _next/static   (static files)
     *   - _next/image    (image optimisation)
     *   - favicon.ico
     *   - public files   (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
};
