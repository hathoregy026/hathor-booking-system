import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { displayNameError, hashAdminPassword, normalizeDisplayName, passwordPolicyError } from "@/lib/admin-password";
import { invitationFingerprint, lockAdminMembership } from "@/lib/admin-management";
import { loginJson, loginRouteError, readLoginBody } from "@/lib/admin-login-api";
import { enforcePublicRateLimit, enforceKeyedRateLimit, PublicRequestError } from "@/lib/public-api-security";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const token = z.string().regex(/^[a-f0-9]{64}$/);
const schema = z.union([
  z.object({ token, intent: z.literal("lookup") }).strict(),
  z.object({
    token,
    displayName: z.string().min(1).max(80),
    password: z.string().min(14).max(128),
  }).strict(),
]);
export async function POST(request: NextRequest) {
  try {
    await enforcePublicRateLimit({ request, scope: "admin-invitation", limit: 20, windowMs: 15 * 60_000 });
    const body = await readLoginBody(request, schema);
    const fingerprint = invitationFingerprint(body.token);
    await enforceKeyedRateLimit({ scope: "admin-invitation-token", keyValue: fingerprint, limit: 10, windowMs: 15 * 60_000 });
    const invitation = await prisma.adminInvitation.findUnique({ where: { tokenHash: fingerprint }, include: { user: true } });
    if (!invitation || invitation.expiresAt <= new Date() || invitation.user.disabledAt) {
      throw new PublicRequestError("This setup link has expired or was already used. Ask your administrator for a new one.", 400);
    }
    if ("intent" in body) {
      return loginJson({ email: invitation.user.email, displayName: invitation.user.displayName });
    }
    const nameError = displayNameError(body.displayName);
    if (nameError) throw new PublicRequestError(nameError, 400);
    const policyError = passwordPolicyError(body.password, invitation.user.email);
    if (policyError) throw new PublicRequestError(policyError, 400);
    const displayName = normalizeDisplayName(body.displayName);
    const passwordHash = await hashAdminPassword(body.password);
    await prisma.$transaction(async tx => {
      await lockAdminMembership(tx);
      const current = await tx.adminInvitation.findUnique({ where: { id: invitation.id }, include: { user: true } });
      if (!current || current.tokenHash !== fingerprint || current.expiresAt <= new Date() || current.user.disabledAt) {
        throw new PublicRequestError("This setup link has expired or was already used. Ask your administrator for a new one.", 400);
      }
      await tx.adminInvitation.delete({ where: { id: current.id } });
      await tx.adminUser.update({ where: { id: current.userId }, data: { displayName, passwordHash, passwordChangedAt: new Date() } });
      await tx.adminSession.updateMany({ where: { userId: current.userId, revokedAt: null },
        data: { revokedAt: new Date(), revokedReason: "password-set" } });
      await tx.adminAuthEvent.create({ data: { userId: current.userId, type: "PASSWORD_SET_BY_LINK" } });
    });
    return loginJson({ ok: true });
  } catch (error) { return loginRouteError(error, "invitation"); }
}
