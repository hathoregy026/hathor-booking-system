import {
  getProductionOrigin,
  isStaleVercelDeploymentHost,
} from "@/lib/public-url";
import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/admin-auth-edge";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/api/admin/login"];

function redirectStaleDeploymentHost(request: NextRequest): NextResponse | null {
  const hostname = request.nextUrl.hostname;
  if (!isStaleVercelDeploymentHost(hostname)) {
    return null;
  }

  const target = new URL(
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
    getProductionOrigin(),
  );

  return NextResponse.redirect(target, 308);
}

/**
 * Force browsers to revalidate HTML on every navigation without relying on
 * a sticky disk cache. CDN no-store is intentional for private / preview /
 * booking shells; marketing ISR pages intentionally skip this helper.
 */
function withHtmlNoStore(response: NextResponse): NextResponse {
  response.headers.set(
    "Cache-Control",
    "private, no-cache, no-store, max-age=0, must-revalidate",
  );
  response.headers.set("CDN-Cache-Control", "no-store");
  response.headers.set("Vercel-CDN-Cache-Control", "no-store");
  response.headers.set("Cloudflare-CDN-Cache-Control", "no-store");
  response.headers.set("Surrogate-Control", "no-store");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

/** Browser must revalidate; allow short CDN ISR (matches layout revalidate=300). */
function withHtmlMustRevalidate(response: NextResponse): NextResponse {
  response.headers.set(
    "Cache-Control",
    "public, max-age=0, s-maxage=300, must-revalidate",
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

function withCachePurge(response: NextResponse): NextResponse {
  withHtmlNoStore(response);
  /* Forces Chromium to drop disk/memory HTTP cache + storage for this origin. */
  response.headers.set("Clear-Site-Data", '"cache", "storage", "executionContexts"');
  return response;
}

/**
 * Clear-Site-Data is destructive (wipes the visitor's cache + storage for this
 * origin), so the purge switch must not be reachable by anyone who guesses the
 * URL. Authorised when EITHER:
 *   - the request carries a valid admin session cookie, or
 *   - `?fresh=<CACHE_PURGE_TOKEN>` matches the env secret (set one to use it
 *     from a logged-out browser; unset means only admins can purge).
 * Unauthorised requests fall through to normal handling — no purge, no error.
 */
async function isPurgeAuthorised(request: NextRequest): Promise<boolean> {
  const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (await verifySessionToken(session)) return true;

  const secret = process.env.CACHE_PURGE_TOKEN?.trim();
  if (!secret) return false;

  const supplied = request.nextUrl.searchParams.get("fresh")?.trim();
  if (!supplied || supplied.length !== secret.length) return false;

  let mismatch = 0;
  for (let index = 0; index < supplied.length; index += 1) {
    mismatch |= supplied.charCodeAt(index) ^ secret.charCodeAt(index);
  }

  return mismatch === 0;
}

/**
 * Routes that must never answer on a production deployment.
 *
 * These are scratch/diagnostic surfaces: they leak build internals, timing
 * data and mail plumbing, and none of them are linked from the public site.
 * Blocking them here — in one place — is safer than remembering to guard each
 * handler individually, and it also covers any dev route added later under the
 * same prefixes.
 */
const PRODUCTION_BLOCKED_PREFIXES = [
  "/api/dev",
  "/api/debug-email",
  "/api/test-email",
  "/dev",
  "/test-create",
  "/test-scroll-reveal",
  "/test-slide",
];

/**
 * Internal-but-useful surfaces. Not deleted, just put behind the admin
 * session so the CMS device preview keeps working while the public cannot
 * reach them.
 */
const ADMIN_ONLY_PREFIXES = ["/preview", "/transition", "/site-index"];

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function requiresPrivateHtml(pathname: string): boolean {
  return (
    pathname === "/book" ||
    pathname.startsWith("/booking") ||
    pathname.startsWith("/preview") ||
    pathname.startsWith("/test-scroll-reveal") ||
    pathname.startsWith("/test-slide") ||
    pathname.startsWith("/transition")
  );
}

export async function middleware(request: NextRequest) {
  try {
    const deploymentRedirect = redirectStaleDeploymentHost(request);
    if (deploymentRedirect) {
      return withHtmlNoStore(deploymentRedirect);
    }

    const { pathname } = request.nextUrl;
    const isProduction = process.env.NODE_ENV === "production";

    /* Dev/diagnostic routes: 404 in production, untouched in local dev. */
    if (isProduction && matchesPrefix(pathname, PRODUCTION_BLOCKED_PREFIXES)) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return new NextResponse(null, { status: 404 });
    }

    /* Preview/transition surfaces: admin session required in production. */
    if (isProduction && matchesPrefix(pathname, ADMIN_ONLY_PREFIXES)) {
      const previewSession = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
      if (!(await verifySessionToken(previewSession))) {
        const loginUrl = new URL("/admin/login", request.url);
        loginUrl.searchParams.set("from", pathname);
        return withHtmlNoStore(NextResponse.redirect(loginUrl));
      }
    }

    if (pathname === "/purge" || request.nextUrl.searchParams.has("fresh")) {
      if (await isPurgeAuthorised(request)) {
        return withCachePurge(NextResponse.next());
      }
      /* Not authorised — ignore the purge request and serve the page normally. */
    }

    if (
      !pathname.startsWith("/admin") &&
      !pathname.startsWith("/api/admin")
    ) {
      // Let branding/font files use next.config Cache-Control (revalidate), not no-store.
      // /sw.js must keep its kill-switch headers from next.config / vercel.json.
      if (
        pathname === "/sw.js" ||
        pathname.startsWith("/branding/") ||
        pathname.startsWith("/email/") ||
        pathname.startsWith("/fonts/") ||
        pathname.startsWith("/_next/") ||
        pathname.startsWith("/media/") ||
        pathname.startsWith("/api/")
      ) {
        return NextResponse.next();
      }

      if (requiresPrivateHtml(pathname)) {
        return withHtmlNoStore(NextResponse.next());
      }

      /*
       * Marketing HTML: browsers must revalidate (max-age=0). Do NOT set
       * Vercel-CDN-Cache-Control: no-store here — that would kill ISR edge
       * caching. DeployFreshness + /api/deploy-id heal already-open tabs.
       * Do not Clear-Site-Data on every visit.
       */
      return withHtmlMustRevalidate(NextResponse.next());
    }

    const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const isAuthenticated = await verifySessionToken(session);

    if (PUBLIC_ADMIN_PATHS.includes(pathname)) {
      if (pathname === "/admin/login" && isAuthenticated) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    if (!isAuthenticated) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);

    if (request.nextUrl.pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|media/|videos/|assets/|email/).*)",
  ],
};
