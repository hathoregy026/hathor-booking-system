import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { cache } from "react";
import { ADMIN_SESSION_COOKIE, getAdminIdentity, type AdminIdentity } from "@/lib/admin-auth";
import { adminApiRequirement, hasAdminPermission, type AdminRequirement } from "@/lib/admin-permissions";
export type { AdminIdentity };
export class AdminAuthError extends Error {
  constructor(message = "Unauthorized") { super(message); this.name = "AdminAuthError"; }
}
export class AdminPermissionError extends AdminAuthError {
  constructor() { super("Access denied"); this.name = "AdminPermissionError"; }
}
const NO_STORE = { "Cache-Control": "private, no-store" };

async function sessionCookie(): Promise<string | undefined> {
  try {
    return (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  } catch (error) {
    if (error instanceof Error && error.message.includes("outside a request scope")) return undefined;
    throw error;
  }
}

/** Required explicit permission: omitting it is a compile error and denies at runtime. */
export async function adminApiGuard(requirement: AdminRequirement): Promise<Response | null> {
  const token = await sessionCookie();
  const identity = await getAdminIdentity(token);
  if (!identity) return Response.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  if (!requirement || !hasAdminPermission(identity, requirement)) {
    return Response.json({ error: "Access denied" }, { status: 403, headers: NO_STORE });
  }
  return null;
}
/** Request-based legacy guards also enforce the central, fail-closed route map. */
export async function adminIdentityFromRequest(request: NextRequest): Promise<AdminIdentity | null> {
  const requirement = adminApiRequirement(request.nextUrl.pathname, request.method);
  if (!requirement) return null;
  const identity = await getAdminIdentity(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
  return identity && hasAdminPermission(identity, requirement) ? identity : null;
}
export async function assertAdminSession(requirement: AdminRequirement): Promise<AdminIdentity> {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  const identity = await getAdminIdentity(token);
  if (!identity) throw new AdminAuthError();
  if (!requirement || !hasAdminPermission(identity, requirement)) throw new AdminPermissionError();
  return identity;
}
/** Each page checks its own permission; layouts alone do not protect client navigation. */
export const requireAdminPage = cache(async (requirement: AdminRequirement = "signed-in"): Promise<AdminIdentity> => {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  const identity = await getAdminIdentity(token);
  if (!identity) redirect("/admin/login");
  if (!hasAdminPermission(identity, requirement)) redirect("/admin/access");
  return identity;
});
