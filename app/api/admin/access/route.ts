import { enforceKeyedRateLimit } from "@/lib/public-api-security";
import { NextRequest } from "next/server";
import { adminIdentityFromRequest } from "@/lib/admin-server-auth";
import { loginJson, loginRouteError } from "@/lib/admin-login-api";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try {
    const identity = await adminIdentityFromRequest(request);
    if (!identity) return loginJson({ error: "Unauthorized" }, 401);
    await enforceKeyedRateLimit({ scope: "admin-access-read", keyValue: identity.userId, limit: 120, windowMs: 60_000 });
    return loginJson({ userId: identity.userId, displayName: identity.displayName, isOwner: identity.isOwner,
      roleName: identity.roleName, permissions: identity.permissions, mailboxViewIds: identity.mailboxViewIds, mailboxSendIds: identity.mailboxSendIds });
  } catch (error) { return loginRouteError(error, "access"); }
}
