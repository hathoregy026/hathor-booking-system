import { NextResponse } from "next/server";
import { AdminSessionStage } from "@/app/generated/prisma/enums";
import {
  ADMIN_CHALLENGE_COOKIE,
  ADMIN_SESSION_COOKIE,
} from "@/lib/admin-auth-edge";
import {
  decryptMfaSecret,
  encryptMfaSecret,
  generateRecoveryCodes,
  hashRecoveryCode,
  issueAdminToken,
  looksLikeRecoveryCode,
  readAdminToken,
} from "@/lib/admin-auth-crypto";
import { generateTotpSecret, verifyTotp } from "@/lib/admin-totp";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/rate-limit";

export { ADMIN_CHALLENGE_COOKIE, ADMIN_SESSION_COOKIE };

/*
 * Dashboard sign-in
 * ---------------------------------------------------------------------------
 *   1. Email + password (Argon2id)        → short-lived challenge cookie
 *   2. Authenticator code or recovery code → full session cookie
 *      (first sign-in: scan a QR code and confirm a code instead)
 *
 * Sessions live in the database. The cookie only carries a random secret;
 * the table stores its SHA-256, so logout, "sign out everywhere", a password
 * change, a disabled account or an idle timeout take effect on the very next
 * request. Each stage gets a brand-new token, so a token seen before sign-in
 * finished is worthless afterwards (no session fixation).
 */

export const ADMIN_SESSION_IDLE_SECONDS = 30 * 60;
export const ADMIN_SESSION_ABSOLUTE_SECONDS = 12 * 60 * 60;
export const ADMIN_CHALLENGE_SECONDS = 5 * 60;
export const ADMIN_ENROLL_SECONDS = 10 * 60;
/** Wrong codes allowed per password sign-in before it must start over. */
export const ADMIN_MAX_CODE_ATTEMPTS = 5;
/** Only write lastSeenAt this often, not on every request. */
const SESSION_TOUCH_INTERVAL_MS = 60_000;

export type AdminRequestContext = {
  ip: string | null;
  userAgent: string | null;
};

export function adminRequestContext(request: Request): AdminRequestContext {
  const ip = getClientIp(request);
  return {
    ip: ip === "unknown" ? null : ip.slice(0, 64),
    userAgent: request.headers.get("user-agent")?.slice(0, 256) ?? null,
  };
}

export function normalizeAdminEmail(email: string): string {
  return email.trim().toLowerCase();
}

// ---------------------------------------------------------------------------
// Audit trail
// ---------------------------------------------------------------------------

export type AdminAuthEventType =
  | "LOGIN_PASSWORD_OK"
  | "LOGIN_PASSWORD_FAILED"
  | "LOGIN_RATE_LIMITED"
  | "LOGIN_DISABLED_ACCOUNT"
  | "MFA_OK"
  | "MFA_FAILED"
  | "MFA_ATTEMPTS_EXHAUSTED"
  | "RECOVERY_CODE_USED"
  | "MFA_ENROLLED"
  | "LOGOUT"
  | "SESSION_REVOKED"
  | "PASSWORD_CHANGED"
  | "RECOVERY_CODES_REGENERATED";

/** Never pass secrets in `detail`. Failures to write are logged, not thrown. */
export async function recordAdminAuthEvent(
  type: AdminAuthEventType,
  input: { userId?: string | null; context?: AdminRequestContext; detail?: string },
): Promise<void> {
  try {
    await prisma.adminAuthEvent.create({
      data: {
        type,
        userId: input.userId ?? null,
        ip: input.context?.ip ?? null,
        userAgent: input.context?.userAgent ?? null,
        detail: input.detail?.slice(0, 200) ?? null,
      },
    });
  } catch {
    console.error(`[admin-auth] could not record ${type} event`);
  }
}

// ---------------------------------------------------------------------------
// Cookies
// ---------------------------------------------------------------------------

function cookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    /*
     * Strict: the browser never attaches these cookies to a request started
     * by another site, which shuts out cross-site request forgery outright.
     * Middleware bounces cross-site links into /admin once so they still work.
     */
    sameSite: "strict" as const,
    path: "/",
    maxAge: Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000)),
  };
}

export function setAdminCookie(
  response: NextResponse,
  name: typeof ADMIN_SESSION_COOKIE | typeof ADMIN_CHALLENGE_COOKIE,
  token: string,
  expiresAt: Date,
): void {
  response.cookies.set(name, token, cookieOptions(expiresAt));
}

export function clearAdminCookie(
  response: NextResponse,
  name: typeof ADMIN_SESSION_COOKIE | typeof ADMIN_CHALLENGE_COOKIE,
): void {
  response.cookies.set(name, "", { ...cookieOptions(new Date(0)), maxAge: 0 });
}

// ---------------------------------------------------------------------------
// Challenge (half-finished sign-in)
// ---------------------------------------------------------------------------

export type AdminChallengeStage = "MFA_PENDING" | "ENROLL_PENDING";

export async function createAdminChallenge(
  userId: string,
  stage: AdminChallengeStage,
  context: AdminRequestContext,
): Promise<{ token: string; expiresAt: Date }> {
  const now = Date.now();
  const expiresAt = new Date(
    now + (stage === "ENROLL_PENDING" ? ADMIN_ENROLL_SECONDS : ADMIN_CHALLENGE_SECONDS) * 1000,
  );
  const { token, tokenHash } = issueAdminToken("c", expiresAt);

  await prisma.$transaction([
    // One live challenge per account: a new password sign-in retires the old.
    prisma.adminSession.updateMany({
      where: { userId, stage: { not: AdminSessionStage.ACTIVE }, revokedAt: null },
      data: { revokedAt: new Date(now), revokedReason: "superseded" },
    }),
    prisma.adminSession.create({
      data: {
        tokenHash,
        userId,
        stage,
        idleExpiresAt: expiresAt,
        expiresAt,
        ip: context.ip,
        userAgent: context.userAgent,
      },
    }),
  ]);

  return { token, expiresAt };
}

export type AdminChallenge = {
  id: string;
  stage: AdminChallengeStage;
  user: {
    id: string;
    email: string;
    displayName: string;
    totpSecretEnc: string | null;
    totpPendingEnc: string | null;
  };
};

export async function loadAdminChallenge(
  token: string | undefined,
): Promise<AdminChallenge | null> {
  const tokenHash = readAdminToken(token, "c");
  if (!tokenHash) return null;

  const row = await prisma.adminSession.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
  const now = new Date();
  if (
    !row ||
    row.stage === AdminSessionStage.ACTIVE ||
    row.revokedAt ||
    row.expiresAt <= now ||
    row.mfaAttempts >= ADMIN_MAX_CODE_ATTEMPTS ||
    row.user.disabledAt
  ) {
    return null;
  }

  return {
    id: row.id,
    stage: row.stage,
    user: {
      id: row.user.id,
      email: row.user.email,
      displayName: row.user.displayName,
      totpSecretEnc: row.user.totpSecretEnc,
      totpPendingEnc: row.user.totpPendingEnc,
    },
  };
}

/**
 * Spend one code attempt on the challenge, atomically, before checking the
 * code. Returns false once the allowance is used up (parallel requests cannot
 * overspend it); the challenge is then dead and the password is needed again.
 */
export async function spendCodeAttempt(challengeId: string): Promise<boolean> {
  const { count } = await prisma.adminSession.updateMany({
    where: {
      id: challengeId,
      revokedAt: null,
      expiresAt: { gt: new Date() },
      mfaAttempts: { lt: ADMIN_MAX_CODE_ATTEMPTS },
    },
    data: { mfaAttempts: { increment: 1 } },
  });
  return count === 1;
}

/**
 * Exchange a verified challenge for a full session. The challenge is retired
 * in the same transaction, so it can be redeemed exactly once.
 */
export async function promoteAdminChallenge(
  challenge: AdminChallenge,
  context: AdminRequestContext,
): Promise<{ token: string; expiresAt: Date; sessionId: string } | null> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ADMIN_SESSION_ABSOLUTE_SECONDS * 1000);
  const idleExpiresAt = new Date(now.getTime() + ADMIN_SESSION_IDLE_SECONDS * 1000);
  const { token, tokenHash } = issueAdminToken("s", expiresAt);

  return prisma.$transaction(async (tx) => {
    const retired = await tx.adminSession.updateMany({
      where: { id: challenge.id, revokedAt: null, expiresAt: { gt: now } },
      data: { revokedAt: now, revokedReason: "completed" },
    });
    if (retired.count !== 1) return null;

    const session = await tx.adminSession.create({
      data: {
        tokenHash,
        userId: challenge.user.id,
        stage: AdminSessionStage.ACTIVE,
        idleExpiresAt,
        expiresAt,
        ip: context.ip,
        userAgent: context.userAgent,
      },
    });
    await tx.adminUser.update({
      where: { id: challenge.user.id },
      data: { lastLoginAt: now },
    });
    return { token, expiresAt, sessionId: session.id };
  });
}

// ---------------------------------------------------------------------------
// Second factor
// ---------------------------------------------------------------------------

/**
 * Accepts a code only if its time step is newer than the last one this
 * account used — a code read over someone's shoulder, or replayed from a
 * captured request, is refused even inside its 30-second window.
 */
async function acceptTotpStep(userId: string, step: number): Promise<boolean> {
  const { count } = await prisma.adminUser.updateMany({
    where: {
      id: userId,
      OR: [{ totpLastStep: null }, { totpLastStep: { lt: step } }],
    },
    data: { totpLastStep: step },
  });
  return count === 1;
}

export async function verifyAuthenticatorCode(
  user: { id: string; totpSecretEnc: string | null },
  code: string,
): Promise<boolean> {
  if (!user.totpSecretEnc) return false;
  const step = verifyTotp(decryptMfaSecret(user.totpSecretEnc, user.id), code);
  return step !== null && acceptTotpStep(user.id, step);
}

async function consumeRecoveryCode(userId: string, code: string): Promise<boolean> {
  const { count } = await prisma.adminRecoveryCode.updateMany({
    where: { userId, codeHash: hashRecoveryCode(code, userId), usedAt: null },
    data: { usedAt: new Date() },
  });
  return count === 1;
}

/** Six digits → authenticator; xxxxx-xxxxx → single-use recovery code. */
export async function verifySecondFactor(
  user: { id: string; totpSecretEnc: string | null },
  rawCode: string,
): Promise<"totp" | "recovery" | null> {
  const code = rawCode.replace(/\s+/g, "");
  if (/^\d{6}$/.test(code)) {
    return (await verifyAuthenticatorCode(user, code)) ? "totp" : null;
  }
  if (looksLikeRecoveryCode(code)) {
    return (await consumeRecoveryCode(user.id, code)) ? "recovery" : null;
  }
  return null;
}

export async function remainingRecoveryCodes(userId: string): Promise<number> {
  return prisma.adminRecoveryCode.count({ where: { userId, usedAt: null } });
}

/** Replaces every recovery code. The plain codes are returned once, here. */
export async function replaceRecoveryCodes(userId: string): Promise<string[]> {
  const codes = generateRecoveryCodes();
  await prisma.$transaction([
    prisma.adminRecoveryCode.deleteMany({ where: { userId } }),
    prisma.adminRecoveryCode.createMany({
      data: codes.map((code) => ({ userId, codeHash: hashRecoveryCode(code, userId) })),
    }),
  ]);
  return codes;
}

/**
 * The secret offered while setting up the authenticator. Kept until a code
 * confirms it, so reloading the page shows the same QR code.
 */
export async function pendingAuthenticatorSecret(
  user: AdminChallenge["user"],
): Promise<string> {
  if (user.totpPendingEnc) {
    try {
      return decryptMfaSecret(user.totpPendingEnc, user.id);
    } catch {
      // Unreadable (e.g. the key changed) — issue a fresh one below.
    }
  }
  const secret = generateTotpSecret();
  await prisma.adminUser.update({
    where: { id: user.id },
    data: { totpPendingEnc: encryptMfaSecret(secret, user.id) },
  });
  return secret;
}

/** Confirms set-up with a first code; returns the new recovery codes. */
export async function completeAuthenticatorEnrollment(
  user: AdminChallenge["user"],
  code: string,
): Promise<string[] | null> {
  if (!user.totpPendingEnc || !/^\d{6}$/.test(code)) return null;
  const secret = decryptMfaSecret(user.totpPendingEnc, user.id);
  const step = verifyTotp(secret, code);
  if (step === null) return null;

  const { count } = await prisma.adminUser.updateMany({
    where: { id: user.id, totpPendingEnc: user.totpPendingEnc, mfaEnrolledAt: null },
    data: {
      totpSecretEnc: encryptMfaSecret(secret, user.id),
      totpPendingEnc: null,
      totpLastStep: step,
      mfaEnrolledAt: new Date(),
    },
  });
  if (count !== 1) return null;
  return replaceRecoveryCodes(user.id);
}

// ---------------------------------------------------------------------------
// Signed-in sessions
// ---------------------------------------------------------------------------

export type AdminIdentity = {
  /** Public session id — safe for audit columns. Not a credential. */
  sessionId: string;
  userId: string;
  email: string;
  displayName: string;
  expiresAt: Date;
};

/**
 * The authoritative check. Returns the signed-in person, or null when the
 * cookie is missing, forged, expired, idle too long, revoked, or belongs to a
 * disabled account or a session older than the latest password change.
 */
export async function getAdminIdentity(
  token: string | undefined,
): Promise<AdminIdentity | null> {
  const tokenHash = readAdminToken(token, "s");
  if (!tokenHash) return null;

  const row = await prisma.adminSession.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
  if (!row || row.stage !== AdminSessionStage.ACTIVE || row.revokedAt) return null;

  const now = new Date();
  if (row.expiresAt <= now || row.idleExpiresAt <= now) {
    await prisma.adminSession
      .updateMany({
        where: { id: row.id, revokedAt: null },
        data: { revokedAt: now, revokedReason: row.expiresAt <= now ? "expired" : "idle" },
      })
      .catch(() => undefined);
    return null;
  }
  if (
    row.user.disabledAt ||
    !row.user.mfaEnrolledAt ||
    row.createdAt < row.user.passwordChangedAt
  ) {
    return null;
  }

  if (now.getTime() - row.lastSeenAt.getTime() > SESSION_TOUCH_INTERVAL_MS) {
    const idleExpiresAt = new Date(
      Math.min(now.getTime() + ADMIN_SESSION_IDLE_SECONDS * 1000, row.expiresAt.getTime()),
    );
    await prisma.adminSession
      .update({ where: { id: row.id }, data: { lastSeenAt: now, idleExpiresAt } })
      .catch(() => undefined);
  }

  return {
    sessionId: row.id,
    userId: row.user.id,
    email: row.user.email,
    displayName: row.user.displayName,
    expiresAt: row.expiresAt,
  };
}

export async function revokeAdminSession(
  sessionId: string,
  reason: string,
  userId?: string,
): Promise<boolean> {
  const { count } = await prisma.adminSession.updateMany({
    where: { id: sessionId, revokedAt: null, ...(userId ? { userId } : {}) },
    data: { revokedAt: new Date(), revokedReason: reason },
  });
  return count === 1;
}

export async function revokeAllAdminSessions(
  userId: string,
  reason: string,
  exceptSessionId?: string,
): Promise<number> {
  const { count } = await prisma.adminSession.updateMany({
    where: {
      userId,
      revokedAt: null,
      ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}),
    },
    data: { revokedAt: new Date(), revokedReason: reason },
  });
  return count;
}

/** Session token from a cookie header, for logout of a possibly-dead session. */
export function sessionTokenHash(token: string | undefined): string | null {
  return readAdminToken(token, "s");
}
