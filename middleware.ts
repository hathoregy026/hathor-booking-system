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

function withCachePurge(response: NextResponse): NextResponse {
  withHtmlNoStore(response);
  /* Forces Chromium to drop disk/memory HTTP cache for this origin. */
  response.headers.set("Clear-Site-Data", '"cache", "storage"');
  return response;
}

const DEPLOY_COOKIE = "hathor_v";

function resolveDeployId(): string {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.trim();
  if (sha) return sha.slice(0, 12);
  const deployment = process.env.VERCEL_DEPLOYMENT_ID?.trim();
  if (deployment) return deployment.slice(0, 12);
  return "dev";
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
      if (
        pathname.startsWith("/branding/") ||
        pathname.startsWith("/fonts/") ||
        pathname.startsWith("/_next/") ||
        pathname.startsWith("/media/") ||
        pathname.startsWith("/api/")
      ) {
        return NextResponse.next();
      }

      const deployId = resolveDeployId();
      const seen = request.cookies.get(DEPLOY_COOKIE)?.value;
      /* First hit after a new deploy (or never-seen): wipe stuck HTTP cache. */
      const needsPurge = deployId !== "dev" && seen !== deployId;

      const response = needsPurge
        ? withCachePurge(NextResponse.next())
        : withHtmlNoStore(NextResponse.next());

      if (needsPurge) {
        response.cookies.set(DEPLOY_COOKIE, deployId, {
          path: "/",
          sameSite: "lax",
          secure: true,
          maxAge: 60 * 60 * 24 * 365,
        });
      }

      return response;
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
    "/((?!_next/static|_next/image|favicon.ico|media/|videos/|assets/).*)",
  ],
};
