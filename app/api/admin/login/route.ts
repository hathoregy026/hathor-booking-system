import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  createSessionToken,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import { getClientIp } from "@/lib/rate-limit";
import {
  enforcePublicRateLimit,
  RateLimitExceededError,
} from "@/lib/public-api-security";

export const runtime = "nodejs";

/*
 * Brute-force throttle: 8 attempts per 15 minutes per IP.
 *
 * Backed by the durable, Postgres-backed limiter so the counter is shared
 * across every serverless instance instead of reset on each cold start.
 */
const LOGIN_ATTEMPT_LIMIT = 8;
const LOGIN_WINDOW_MS = 15 * 60_000;

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Admin password is not configured on the server" },
        { status: 500 },
      );
    }

    const ip = getClientIp(request);

    try {
      await enforcePublicRateLimit({
        request,
        scope: "admin-login",
        limit: LOGIN_ATTEMPT_LIMIT,
        windowMs: LOGIN_WINDOW_MS,
      });
    } catch (error) {
      if (error instanceof RateLimitExceededError) {
        console.warn(`[admin.login] rate limited ip=${ip}`);
        return NextResponse.json(
          { error: "Too many attempts. Please try again later." },
          {
            status: 429,
            headers: { "Retry-After": String(error.retryAfterSeconds) },
          },
        );
      }
      throw error;
    }

    let body: { password?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const password = body.password?.trim() ?? "";

    if (!verifyAdminPassword(password)) {
      console.warn(`[admin.login] failed attempt ip=${ip}`);
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const sessionToken = createSessionToken();
    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      /* Match the signed token's own expiry so the two cannot drift apart. */
      maxAge: ADMIN_SESSION_TTL_SECONDS,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
