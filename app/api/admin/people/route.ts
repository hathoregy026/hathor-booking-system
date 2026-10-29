import { NextRequest } from "next/server";
import { adminApiGuard, adminIdentityFromRequest } from "@/lib/admin-server-auth";
import { managementActionSchema, administerPeople, readAdminPeople } from "@/lib/admin-management";
import { loginJson, loginRouteError, readLoginBody } from "@/lib/admin-login-api";
import { enforceKeyedRateLimit } from "@/lib/public-api-security";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try {
    const denied = await adminApiGuard("administrator");
    if (denied) return denied;
    const identity = await adminIdentityFromRequest(request);
    if (!identity) return loginJson({ error: "Unauthorized" }, 401);
    await enforceKeyedRateLimit({ scope: "admin-people-read", keyValue: identity.userId, limit: 120, windowMs: 60_000 });
    return loginJson(await readAdminPeople());
  } catch (error) { return loginRouteError(error, "people-read"); }
}
export async function POST(request: NextRequest) {
  try {
    const denied = await adminApiGuard("administrator");
    if (denied) return denied;
    const identity = await adminIdentityFromRequest(request);
    if (!identity) return loginJson({ error: "Unauthorized" }, 401);
    const body = await readLoginBody(request, managementActionSchema);
    return loginJson(await administerPeople(identity, request, body));
  } catch (error) { return loginRouteError(error, "people-update"); }
}
