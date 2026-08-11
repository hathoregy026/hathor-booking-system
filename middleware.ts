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

    if (pathname === "/purge" || request.nextUrl.searchParams.has("fresh")) {
      return withCachePurge(NextResponse.next());
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
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|media/|videos/|assets/).*)",
  ],
};
