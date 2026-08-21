import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  createSessionToken,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import {
  checkRateLimit,
  getClientIp,
  resetRateLimit,
} from "@/lib/rate-limit";

export const runtime = "nodejs";

/*
 * Brute-force throttle: 8 attempts per 15 minutes per IP.
 *
 * NOTE: the limiter is in-process, so on serverless each instance keeps its
 * own counter and cold starts reset it. This is a real speed bump, not a
 * guarantee — a distributed store (Upstash / Vercel KV) is the durable fix.
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
    const rateKey = `admin-login:${ip}`;
    const rate = checkRateLimit(rateKey, LOGIN_ATTEMPT_LIMIT, LOGIN_WINDOW_MS);

    if (!rate.allowed) {
      console.warn(`[admin.login] rate limited ip=${ip}`);
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(rate.retryAfterSeconds) },
        },
      );
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

    // Successful login — clear the counter for this IP.
    resetRateLimit(rateKey);

    const sessionToken = createSessionToken();
    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
