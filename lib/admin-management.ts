import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { adminRequestContext, verifySecondFactor, type AdminIdentity } from "@/lib/admin-auth";
import { verifyAdminPassword, hashAdminPassword } from "@/lib/admin-password";
import { enforceKeyedRateLimit, PublicRequestError } from "@/lib/public-api-security";
import { mailboxIdSchema } from "@/lib/email-mailboxes";
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions";

const id = z.string().min(1).max(64);
const credentials = { currentPassword: z.string().min(1).max(128), code: z.string().trim().min(6).max(32) };
const permissions = z.array(z.enum(ADMIN_PERMISSIONS as [string, ...string[]])).max(ADMIN_PERMISSIONS.length)
  .refine(values => new Set(values).size === values.length, "Duplicate permissions");
const mailboxIds = z.array(mailboxIdSchema).max(6).refine(values => new Set(values).size === values.length, "Duplicate mailboxes");
const individualAccess = { permissions: permissions.default([]), mailboxViewIds: mailboxIds.default([]), mailboxSendIds: mailboxIds.default([]) };
const role = { name: z.string().trim().min(2).max(64).refine(value => value.toLowerCase() !== "administrator"), permissions };
export const managementActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("create-role"), ...role, ...credentials }).strict(),
  z.object({ action: z.literal("update-role"), id, ...role, ...credentials }).strict(),
  z.object({ action: z.literal("delete-role"), id, ...credentials }).strict(),
  z.object({ action: z.literal("invite"), email: z.email().max(254).transform(value => value.toLowerCase()),
    displayName: z.string().trim().min(1).max(80), roleId: id.nullable(), isOwner: z.boolean(), ...individualAccess, ...credentials }).strict(),
  z.object({ action: z.literal("set-access"), id, roleId: id.nullable(), isOwner: z.boolean(), ...individualAccess, ...credentials }).strict(),
  z.object({ action: z.literal("set-enabled"), id, enabled: z.boolean(), ...credentials }).strict(),
  z.object({ action: z.literal("password-link"), id, ...credentials }).strict(),
  z.object({ action: z.literal("reset-mfa"), id, ...credentials }).strict(),
  z.object({ action: z.literal("revoke-sessions"), id, ...credentials }).strict(),
  z.object({ action: z.literal("unlock"), id, ...credentials }).strict(),
]).superRefine((body, context) => {
  if (body.action !== "invite" && body.action !== "set-access") return;
  if (body.mailboxSendIds.some(id => !body.mailboxViewIds.includes(id))) context.addIssue({ code: "custom", message: "Sending requires mailbox viewing", path: ["mailboxSendIds"] });
  if (body.roleId && body.permissions.length) context.addIssue({ code: "custom", message: "Choose a role or individual permissions", path: ["permissions"] });
});
type Transaction = Prisma.TransactionClient;
/** All membership changes (including the CLI) share this transaction lock. */
export async function lockAdminMembership(tx: Transaction) {
  await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(18423, 7321)`;
}
export async function protectLastAdministrator(tx: Transaction, userId: string) {
  const other = await tx.adminUser.count({ where: {
    id: { not: userId }, isOwner: true, disabledAt: null, mfaEnrolledAt: { not: null },
  } });
  if (!other) throw new PublicRequestError("Keep another enabled administrator with an authenticator before removing this access.", 409);
}
export const invitationFingerprint = (token: string) => createHash("sha256").update(token).digest("hex");
async function passwordLink(tx: Transaction, userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 48 * 60 * 60_000);
  await tx.adminInvitation.upsert({ where: { userId },
    create: { userId, tokenHash: invitationFingerprint(token), expiresAt },
    update: { tokenHash: invitationFingerprint(token), expiresAt, createdAt: new Date() },
  });
  return { setupPath: "/admin/accept-invite#token=" + token, expiresAt };
}
const userSelection = {
  id: true, email: true, displayName: true, isOwner: true, roleId: true, permissions: true, mailboxViewIds: true, mailboxSendIds: true,
  disabledAt: true, mfaEnrolledAt: true, lastLoginAt: true, createdAt: true,
  invitation: { select: { expiresAt: true } },
} as const;
export async function readAdminPeople() {
  const [users, roles, events] = await Promise.all([
    prisma.adminUser.findMany({ select: userSelection, orderBy: { createdAt: "asc" }, take: 200 }),
    prisma.adminRole.findMany({ orderBy: { name: "asc" }, take: 100, include: { _count: { select: { users: true } } } }),
    prisma.adminAuthEvent.findMany({ where: { type: { startsWith: "MANAGEMENT_" } },
      select: { id: true, userId: true, type: true, detail: true, createdAt: true },
      orderBy: { createdAt: "desc" }, take: 30 }),
  ]);
  return { users, roles, events };
}
export async function administerPeople(identity: AdminIdentity, request: Request, body: z.infer<typeof managementActionSchema>) {
  await enforceKeyedRateLimit({ scope: "admin-management-proof", keyValue: identity.userId, limit: 10, windowMs: 15 * 60_000 });
  const actor = await prisma.adminUser.findUnique({ where: { id: identity.userId } });
  if (!actor?.isOwner || actor.disabledAt || !actor.mfaEnrolledAt) throw new PublicRequestError("Access denied", 403);
  if (!(await verifyAdminPassword(actor.passwordHash, body.currentPassword)) ||
      !(await verifySecondFactor(actor, body.code))) {
    throw new PublicRequestError("Your password or code is incorrect.", 400);
  }
  // A random unusable password prevents sign-in until the single-use link is accepted.
  const replacementHash = ["invite", "password-link"].includes(body.action)
    ? await hashAdminPassword(randomBytes(32).toString("base64url")) : null;
  return prisma.$transaction(async tx => {
    await lockAdminMembership(tx);
    const now = new Date();
    const session = await tx.adminSession.findUnique({ where: { id: identity.sessionId }, include: { user: true } });
    if (!session || session.userId !== identity.userId || session.stage !== "ACTIVE" || session.revokedAt ||
        session.expiresAt <= now || session.idleExpiresAt <= now ||
        !session.user.isOwner || session.user.disabledAt || !session.user.mfaEnrolledAt ||
        session.createdAt < session.user.passwordChangedAt) throw new PublicRequestError("Access denied", 403);
    const audit = async (target: string) => {
      const context = adminRequestContext(request);
      await tx.adminAuthEvent.create({ data: { userId: identity.userId,
        type: "MANAGEMENT_" + body.action.toUpperCase().replaceAll("-", "_"),
        detail: target, ...context } });
    };
    const revoke = async (userId: string) => {
      await tx.adminSession.updateMany({ where: { userId, revokedAt: null },
        data: { revokedAt: now, revokedReason: "administrator-change" } });
    };
    const validateRole = async (roleId: string | null, isOwner: boolean) => {
      if (isOwner && roleId) throw new PublicRequestError("Administrators use full access, not a staff role.", 400);
      if (roleId && !(await tx.adminRole.findUnique({ where: { id: roleId } }))) throw new PublicRequestError("Role not found.", 404);
    };
    if (body.action === "create-role") {
      if (await tx.adminRole.count() >= 100) throw new PublicRequestError("Role limit reached.", 409);
      const result = await tx.adminRole.create({ data: { name: body.name, permissions: body.permissions } });
      await audit(result.id); return { ok: true };
    }
    if (body.action === "update-role" || body.action === "delete-role") {
      const existing = await tx.adminRole.findUnique({ where: { id: body.id } });
      if (!existing) throw new PublicRequestError("Role not found.", 404);
      if (body.action === "delete-role") {
        if (await tx.adminUser.count({ where: { roleId: body.id } })) throw new PublicRequestError("Reassign everyone in this role before deleting it.", 409);
        await tx.adminRole.delete({ where: { id: body.id } });
      } else {
        await tx.adminRole.update({ where: { id: body.id }, data: { name: body.name, permissions: body.permissions } });
        await tx.adminSession.updateMany({ where: { user: { roleId: body.id }, revokedAt: null },
          data: { revokedAt: now, revokedReason: "role-changed" } });
      }
      await audit(body.id); return { ok: true };
    }
    if (body.action === "invite") {
      await validateRole(body.roleId, body.isOwner);
      if (await tx.adminUser.count() >= 200) throw new PublicRequestError("Account limit reached.", 409);
      if (await tx.adminUser.findUnique({ where: { email: body.email } })) throw new PublicRequestError("An account already uses that email.", 409);
      const target = await tx.adminUser.create({ data: { email: body.email, displayName: body.displayName,
        passwordHash: replacementHash!, roleId: body.roleId, isOwner: body.isOwner, permissions: body.permissions, mailboxViewIds: body.mailboxViewIds, mailboxSendIds: body.mailboxSendIds } });
      const link = await passwordLink(tx, target.id);
      await audit(target.id); return { ok: true, ...link };
    }
    const target = await tx.adminUser.findUnique({ where: { id: body.id } });
    if (!target) throw new PublicRequestError("Account not found.", 404);
    if (target.id === identity.userId) throw new PublicRequestError("Use your own Security settings. Administrators cannot change their own access here.", 409);
    if (body.action === "set-access") {
      await validateRole(body.roleId, body.isOwner);
      if (target.isOwner && !body.isOwner && !target.disabledAt && target.mfaEnrolledAt) await protectLastAdministrator(tx, target.id);
      await tx.adminUser.update({ where: { id: target.id }, data: { roleId: body.roleId, isOwner: body.isOwner, permissions: body.permissions, mailboxViewIds: body.mailboxViewIds, mailboxSendIds: body.mailboxSendIds } });
      await revoke(target.id);
    } else if (body.action === "set-enabled") {
      if (!body.enabled && target.isOwner && !target.disabledAt && target.mfaEnrolledAt) await protectLastAdministrator(tx, target.id);
      await tx.adminUser.update({ where: { id: target.id }, data: { disabledAt: body.enabled ? null : now } });
      await revoke(target.id);
      if (!body.enabled) await tx.adminInvitation.deleteMany({ where: { userId: target.id } });
    } else if (body.action === "password-link") {
      if (target.disabledAt) throw new PublicRequestError("Enable the account before issuing a setup link.", 409);
      await tx.adminUser.update({ where: { id: target.id }, data: { passwordHash: replacementHash!, passwordChangedAt: now } });
      await revoke(target.id);
      const link = await passwordLink(tx, target.id);
      await audit(target.id); return { ok: true, ...link };
    } else if (body.action === "reset-mfa") {
      if (target.isOwner && !target.disabledAt && target.mfaEnrolledAt) await protectLastAdministrator(tx, target.id);
      await tx.adminRecoveryCode.deleteMany({ where: { userId: target.id } });
      await tx.adminUser.update({ where: { id: target.id },
        data: { totpSecretEnc: null, totpPendingEnc: null, totpLastStep: null, mfaEnrolledAt: null } });
      await revoke(target.id);
    } else if (body.action === "revoke-sessions") {
      await revoke(target.id);
    } else if (body.action === "unlock") {
      // Same durable buckets as the CLI, removed within the membership transaction.
      const keys = [["admin-login-account", target.email], ["admin-login-code-account", target.id],
        ["admin-step-up", target.id]].map(([scope, value]) => createHash("sha256").update(scope + ":" + value).digest("hex"));
      await tx.apiRateLimit.deleteMany({ where: { key: { in: keys } } });
    }
    await audit(target.id);
    return { ok: true };
  });
}
