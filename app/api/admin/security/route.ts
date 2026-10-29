import { NextRequest } from "next/server";
import { z } from "zod";
import {
  ADMIN_SESSION_COOKIE,
  adminRequestContext,
  clearAdminCookie,
  recordAdminAuthEvent,
  remainingRecoveryCodes,
  replaceRecoveryCodes,
  revokeAdminSession,
  revokeAllAdminSessions,
  verifyAuthenticatorCode,
  verifySecondFactor,
} from "@/lib/admin-auth";
import { loginJson, loginRouteError, readLoginBody } from "@/lib/admin-login-api";
import {
  hashAdminPassword,
  PASSWORD_MAX_LENGTH,
  passwordPolicyError,
  verifyAdminPassword,
} from "@/lib/admin-password";
import { adminIdentityFromRequest } from "@/lib/admin-server-auth";
import { prisma } from "@/lib/prisma";
import { enforceKeyedRateLimit } from "@/lib/public-api-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
 * The signed-in person's own security settings. Sensitive changes need
 * proof beyond the session cookie (step-up): a password change needs the
 * current password AND a code; new recovery codes need an authenticator code.
 * A stolen session alone therefore cannot lock the real owner out.
 */

function unauthorized() {
  return loginJson({ error: "Unauthorized" }, 401);
}

export async function GET(request: NextRequest) {
  try {
    const identity = await adminIdentityFromRequest(request);
    if (!identity) return unauthorized();

    const [user, sessions, events, recoveryCodesLeft] = await Promise.all([
      prisma.adminUser.findUniqueOrThrow({
        where: { id: identity.userId },
        select: { email: true, displayName: true, mfaEnrolledAt: true, passwordChangedAt: true },
      }),
      prisma.adminSession.findMany({
        where: {
          userId: identity.userId,
          stage: "ACTIVE",
          revokedAt: null,
          expiresAt: { gt: new Date() },
          idleExpiresAt: { gt: new Date() },
        },
        orderBy: { lastSeenAt: "desc" },
        take: 20,
        select: { id: true, createdAt: true, lastSeenAt: true, ip: true, userAgent: true },
      }),
      prisma.adminAuthEvent.findMany({
        where: { userId: identity.userId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, type: true, ip: true, createdAt: true },
      }),
      remainingRecoveryCodes(identity.userId),
    ]);

    return loginJson({
      user,
      recoveryCodesLeft,
      sessions: sessions.map((session) => ({
        ...session,
        current: session.id === identity.sessionId,
      })),
      events,
    });
  } catch (error) {
    return loginRouteError(error, "security-read");
  }
}

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("revoke-session"), sessionId: z.string().min(1).max(64) }).strict(),
  z.object({ action: z.literal("revoke-others") }).strict(),
  z
    .object({
      action: z.literal("change-password"),
      currentPassword: z.string().min(1).max(PASSWORD_MAX_LENGTH),
      newPassword: z.string().min(1).max(PASSWORD_MAX_LENGTH),
      code: z.string().trim().min(6).max(32),
    })
    .strict(),
  z
    .object({
      action: z.literal("regenerate-recovery-codes"),
      code: z.string().trim().regex(/^\d{6}$/),
    })
    .strict(),
]);

export async function POST(request: NextRequest) {
  const context = adminRequestContext(request);
  try {
    const identity = await adminIdentityFromRequest(request);
    if (!identity) return unauthorized();
    const body = await readLoginBody(request, actionSchema);

    if (body.action === "revoke-session") {
      const revoked = await revokeAdminSession(body.sessionId, "revoked-by-user", identity.userId);
      if (revoked) {
        await recordAdminAuthEvent("SESSION_REVOKED", { userId: identity.userId, context });
      }
      const response = loginJson({ ok: revoked, signedOut: body.sessionId === identity.sessionId });
      if (body.sessionId === identity.sessionId) clearAdminCookie(response, ADMIN_SESSION_COOKIE);
      return response;
    }

    if (body.action === "revoke-others") {
      const count = await revokeAllAdminSessions(identity.userId, "revoked-by-user", identity.sessionId);
      await recordAdminAuthEvent("SESSION_REVOKED", {
        userId: identity.userId,
        context,
        detail: `${count} other session(s)`,
      });
      return loginJson({ ok: true, revoked: count });
    }

    // Step-up actions below: throttle guesses at the extra proof.
    await enforceKeyedRateLimit({
      scope: "admin-step-up",
      keyValue: identity.userId,
      limit: 5,
      windowMs: 15 * 60_000,
    });
    const user = await prisma.adminUser.findUniqueOrThrow({ where: { id: identity.userId } });

    if (body.action === "regenerate-recovery-codes") {
      if (!(await verifyAuthenticatorCode(user, body.code))) {
        await recordAdminAuthEvent("MFA_FAILED", { userId: user.id, context, detail: "recovery-codes" });
        return loginJson({ error: "That code didn't work." }, 400);
      }
      const recoveryCodes = await replaceRecoveryCodes(user.id);
      await recordAdminAuthEvent("RECOVERY_CODES_REGENERATED", { userId: user.id, context });
      return loginJson({ ok: true, recoveryCodes });
    }

    // change-password
    const passwordOk = await verifyAdminPassword(user.passwordHash, body.currentPassword);
    if (!passwordOk) {
      await recordAdminAuthEvent("LOGIN_PASSWORD_FAILED", { userId: user.id, context, detail: "password-change" });
      return loginJson({ error: "Your current password or code is incorrect." }, 400);
    }
    const policyError = passwordPolicyError(body.newPassword, user.email);
    if (policyError) return loginJson({ error: policyError }, 400);
    if (await verifyAdminPassword(user.passwordHash, body.newPassword)) {
      return loginJson({ error: "Choose a password different from your current one." }, 400);
    }
    if (!(await verifySecondFactor(user, body.code))) {
      await recordAdminAuthEvent("MFA_FAILED", { userId: user.id, context, detail: "password-change" });
      return loginJson({ error: "Your current password or code is incorrect." }, 400);
    }

    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        passwordHash: await hashAdminPassword(body.newPassword),
        passwordChangedAt: new Date(),
      },
    });
    // Every session, this one included, must sign in again with the new password.
    await revokeAllAdminSessions(user.id, "password-changed");
    await recordAdminAuthEvent("PASSWORD_CHANGED", { userId: user.id, context });

    const response = loginJson({ ok: true, signedOut: true });
    clearAdminCookie(response, ADMIN_SESSION_COOKIE);
    return response;
  } catch (error) {
    return loginRouteError(error, "security-update");
  }
}
