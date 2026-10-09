import { NextRequest } from "next/server";
import { z } from "zod";
import {
  ADMIN_CHALLENGE_COOKIE,
  ADMIN_SESSION_COOKIE,
  adminRequestContext,
  clearAdminCookie,
  createAdminChallenge,
  normalizeAdminEmail,
  recordAdminAuthEvent,
  setAdminCookie,
} from "@/lib/admin-auth";
import { assertAdminAuthConfigured } from "@/lib/admin-auth-crypto";
import { loginJson, loginRouteError, readLoginBody } from "@/lib/admin-login-api";
import {
  hashAdminPassword,
  PASSWORD_MAX_LENGTH,
  passwordNeedsRehash,
  verifyAdminPassword,
} from "@/lib/admin-password";
import { prisma } from "@/lib/prisma";
import {
  clearKeyedRateLimit,
  enforceKeyedRateLimit,
  enforcePublicRateLimit,
  RateLimitExceededError,
} from "@/lib/public-api-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
 * Step 1 of 2: email + password.
 *
 * Brute force is throttled twice over, both durable in Postgres so every
 * server instance shares the counters:
 *   · per IP      — 10 attempts / 15 min
 *   · per account — 5 attempts / 15 min, keyed by the typed email whether or
 *                   not it exists, so the limiter itself cannot be used to
 *                   discover which emails are real. Cleared on success.
 *
 * Every failure gets the same message and (thanks to the dummy Argon2 run in
 * verifyAdminPassword) the same timing. Success does NOT sign anyone in: it
 * only issues a 5-minute challenge for the authenticator code.
 */
const LOGIN_WINDOW_MS = 15 * 60_000;
const INVALID_CREDENTIALS = "Email or password is incorrect.";

const loginSchema = z
  .object({
    email: z.string().trim().min(3).max(254),
    // Not trimmed: spaces are legitimate password characters.
    password: z.string().min(1).max(PASSWORD_MAX_LENGTH),
  })
  .strict();

export async function POST(request: NextRequest) {
  const context = adminRequestContext(request);
  try {
    assertAdminAuthConfigured();
    const body = await readLoginBody(request, loginSchema);
    const email = normalizeAdminEmail(body.email);

    try {
      await enforcePublicRateLimit({
        request,
        scope: "admin-login-ip",
        limit: 10,
        windowMs: LOGIN_WINDOW_MS,
      });
      await enforceKeyedRateLimit({
        scope: "admin-login-account",
        keyValue: email,
        limit: 5,
        windowMs: LOGIN_WINDOW_MS,
      });
    } catch (error) {
      if (error instanceof RateLimitExceededError) {
        await recordAdminAuthEvent("LOGIN_RATE_LIMITED", { context });
      }
      throw error;
    }

    const user = await prisma.adminUser.findUnique({ where: { email } });
    const passwordOk = await verifyAdminPassword(user?.passwordHash ?? null, body.password);

    if (!user || !passwordOk) {
      await recordAdminAuthEvent("LOGIN_PASSWORD_FAILED", { userId: user?.id, context });
      return loginJson({ error: INVALID_CREDENTIALS }, 401);
    }
    if (user.disabledAt) {
      await recordAdminAuthEvent("LOGIN_DISABLED_ACCOUNT", { userId: user.id, context });
      return loginJson({ error: INVALID_CREDENTIALS }, 401);
    }

    await clearKeyedRateLimit("admin-login-account", email);

    if (passwordNeedsRehash(user.passwordHash)) {
      await prisma.adminUser.update({
        where: { id: user.id },
        data: { passwordHash: await hashAdminPassword(body.password) },
      });
    }

    const stage = user.mfaEnrolledAt && user.totpSecretEnc ? "MFA_PENDING" : "ENROLL_PENDING";
    const challenge = await createAdminChallenge(user.id, stage, context);
    await recordAdminAuthEvent("LOGIN_PASSWORD_OK", { userId: user.id, context });

    const response = loginJson({ next: stage === "MFA_PENDING" ? "code" : "enroll" });
    setAdminCookie(response, ADMIN_CHALLENGE_COOKIE, challenge.token, challenge.expiresAt);
    clearAdminCookie(response, ADMIN_SESSION_COOKIE);
    return response;
  } catch (error) {
    return loginRouteError(error, "login");
  }
}
