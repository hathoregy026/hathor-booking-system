import { NextRequest } from "next/server";
import QRCode from "qrcode";
import { z } from "zod";
import {
  ADMIN_CHALLENGE_COOKIE,
  ADMIN_SESSION_COOKIE,
  adminRequestContext,
  clearAdminCookie,
  completeAuthenticatorEnrollment,
  loadAdminChallenge,
  pendingAuthenticatorSecret,
  promoteAdminChallenge,
  recordAdminAuthEvent,
  setAdminCookie,
  spendCodeAttempt,
} from "@/lib/admin-auth";
import { assertAdminAuthConfigured } from "@/lib/admin-auth-crypto";
import {
  loginJson,
  loginRouteError,
  readLoginBody,
  SIGN_IN_EXPIRED,
} from "@/lib/admin-login-api";
import { formatSecretForDisplay, totpKeyUri } from "@/lib/admin-totp";
import { enforcePublicRateLimit } from "@/lib/public-api-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
 * First sign-in only: the password was right but the account has no
 * authenticator yet. GET shows the QR code; POST confirms it with a first
 * code, stores the secret (encrypted) and hands back recovery codes once.
 * Both require the challenge cookie from a correct password a moment ago.
 */

function expired() {
  const response = loginJson({ error: SIGN_IN_EXPIRED, restart: true }, 401);
  clearAdminCookie(response, ADMIN_CHALLENGE_COOKIE);
  return response;
}

export async function GET(request: NextRequest) {
  try {
    assertAdminAuthConfigured();
    const challenge = await loadAdminChallenge(
      request.cookies.get(ADMIN_CHALLENGE_COOKIE)?.value,
    );
    if (!challenge || challenge.stage !== "ENROLL_PENDING") return expired();

    const secret = await pendingAuthenticatorSecret(challenge.user);
    const svg = await QRCode.toString(totpKeyUri(secret, challenge.user.email), {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 1,
      color: { dark: "#1f1a14", light: "#ffffff" },
    });

    return loginJson({
      account: challenge.user.email,
      // An <img> data URL, never inline markup: the browser cannot run it.
      qrCode: `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`,
      manualKey: formatSecretForDisplay(secret),
    });
  } catch (error) {
    return loginRouteError(error, "enroll-start");
  }
}

const confirmSchema = z.object({ code: z.string().trim().regex(/^\d{6}$/) }).strict();

export async function POST(request: NextRequest) {
  const context = adminRequestContext(request);
  try {
    assertAdminAuthConfigured();
    const { code } = await readLoginBody(request, confirmSchema);
    await enforcePublicRateLimit({
      request,
      scope: "admin-login-code-ip",
      limit: 20,
      windowMs: 15 * 60_000,
    });

    const challenge = await loadAdminChallenge(
      request.cookies.get(ADMIN_CHALLENGE_COOKIE)?.value,
    );
    if (!challenge || challenge.stage !== "ENROLL_PENDING") return expired();
    if (!(await spendCodeAttempt(challenge.id))) return expired();

    const recoveryCodes = await completeAuthenticatorEnrollment(challenge.user, code);
    if (!recoveryCodes) {
      await recordAdminAuthEvent("MFA_FAILED", { userId: challenge.user.id, context, detail: "enrolment" });
      return loginJson(
        { error: "That code didn't match. Make sure your phone's clock is set automatically and try the newest code." },
        401,
      );
    }

    const session = await promoteAdminChallenge(challenge, context);
    if (!session) return expired();
    await recordAdminAuthEvent("MFA_ENROLLED", { userId: challenge.user.id, context });

    const response = loginJson({ ok: true, recoveryCodes });
    setAdminCookie(response, ADMIN_SESSION_COOKIE, session.token, session.expiresAt);
    clearAdminCookie(response, ADMIN_CHALLENGE_COOKIE);
    return response;
  } catch (error) {
    return loginRouteError(error, "enroll-confirm");
  }
}
