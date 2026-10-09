import { NextRequest } from "next/server";
import { z } from "zod";
import {
  ADMIN_CHALLENGE_COOKIE,
  ADMIN_MAX_CODE_ATTEMPTS,
  ADMIN_SESSION_COOKIE,
  adminRequestContext,
  clearAdminCookie,
  loadAdminChallenge,
  promoteAdminChallenge,
  recordAdminAuthEvent,
  remainingRecoveryCodes,
  revokeAdminSession,
  setAdminCookie,
  spendCodeAttempt,
  verifySecondFactor,
} from "@/lib/admin-auth";
import { assertAdminAuthConfigured } from "@/lib/admin-auth-crypto";
import {
  loginJson,
  loginRouteError,
  readLoginBody,
  SIGN_IN_EXPIRED,
} from "@/lib/admin-login-api";
import { prisma } from "@/lib/prisma";
import {
  clearKeyedRateLimit,
  enforceKeyedRateLimit,
  enforcePublicRateLimit,
} from "@/lib/public-api-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
 * Step 2 of 2: authenticator code (or a single-use recovery code).
 *
 * Guessing is capped three ways: 5 codes per password sign-in (then the
 * password is needed again), 10 per account and 20 per IP every 15 minutes.
 * A 6-digit code that was already accepted once is refused (replay guard in
 * verifyAuthenticatorCode).
 */
const CODE_WINDOW_MS = 15 * 60_000;

const codeSchema = z.object({ code: z.string().trim().min(6).max(32) }).strict();

function expired() {
  const response = loginJson({ error: SIGN_IN_EXPIRED, restart: true }, 401);
  clearAdminCookie(response, ADMIN_CHALLENGE_COOKIE);
  return response;
}

export async function POST(request: NextRequest) {
  const context = adminRequestContext(request);
  try {
    assertAdminAuthConfigured();
    const { code } = await readLoginBody(request, codeSchema);
    await enforcePublicRateLimit({
      request,
      scope: "admin-login-code-ip",
      limit: 20,
      windowMs: CODE_WINDOW_MS,
    });

    const challenge = await loadAdminChallenge(
      request.cookies.get(ADMIN_CHALLENGE_COOKIE)?.value,
    );
    if (!challenge || challenge.stage !== "MFA_PENDING") return expired();

    await enforceKeyedRateLimit({
      scope: "admin-login-code-account",
      keyValue: challenge.user.id,
      limit: 10,
      windowMs: CODE_WINDOW_MS,
    });

    if (!(await spendCodeAttempt(challenge.id))) {
      await recordAdminAuthEvent("MFA_ATTEMPTS_EXHAUSTED", { userId: challenge.user.id, context });
      return expired();
    }

    const method = await verifySecondFactor(challenge.user, code);
    if (!method) {
      await recordAdminAuthEvent("MFA_FAILED", { userId: challenge.user.id, context });
      const row = await prisma.adminSession.findUnique({
        where: { id: challenge.id },
        select: { mfaAttempts: true },
      });
      const attemptsLeft = Math.max(0, ADMIN_MAX_CODE_ATTEMPTS - (row?.mfaAttempts ?? ADMIN_MAX_CODE_ATTEMPTS));
      if (attemptsLeft === 0) {
        await revokeAdminSession(challenge.id, "too-many-codes");
        await recordAdminAuthEvent("MFA_ATTEMPTS_EXHAUSTED", { userId: challenge.user.id, context });
        return expired();
      }
      return loginJson({ error: "That code didn't work. Check it and try again.", attemptsLeft }, 401);
    }

    const session = await promoteAdminChallenge(challenge, context);
    if (!session) return expired();

    await clearKeyedRateLimit("admin-login-code-account", challenge.user.id);
    await recordAdminAuthEvent("MFA_OK", { userId: challenge.user.id, context, detail: method });

    let recoveryCodesLeft: number | undefined;
    if (method === "recovery") {
      recoveryCodesLeft = await remainingRecoveryCodes(challenge.user.id);
      await recordAdminAuthEvent("RECOVERY_CODE_USED", {
        userId: challenge.user.id,
        context,
        detail: `${recoveryCodesLeft} left`,
      });
    }

    const response = loginJson({ ok: true, recoveryCodesLeft });
    setAdminCookie(response, ADMIN_SESSION_COOKIE, session.token, session.expiresAt);
    clearAdminCookie(response, ADMIN_CHALLENGE_COOKIE);
    return response;
  } catch (error) {
    return loginRouteError(error, "login-code");
  }
}
