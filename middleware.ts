import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/api/admin/login"];
const ADMIN_SESSION_COOKIE = "admin_session";

export function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const isAuthenticated = session === "authenticated";

    const isAdminRoute =
      pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

    if (!isAdminRoute) {
      return NextResponse.next();
    }

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
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
