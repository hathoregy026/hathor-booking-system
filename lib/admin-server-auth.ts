import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { cache } from "react";
import {
  ADMIN_SESSION_COOKIE,
  getAdminIdentity,
  type AdminIdentity,
} from "@/lib/admin-auth";

export type { AdminIdentity };

export class AdminAuthError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AdminAuthError";
  }
}

const UNAUTHORIZED_HEADERS = { "Cache-Control": "no-store" };

/**
 * Second lock for /api/admin route handlers. Middleware only checks the
 * cookie's signature; this checks the session itself in the database, so a
 * logged-out, revoked, idle or disabled session is refused here even though
 * its cookie still looks valid. It also keeps endpoints shut if middleware is
 * ever bypassed (the CVE-2025-29927 class).
 */
export async function adminApiGuard(): Promise<Response | null> {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (await getAdminIdentity(token)) return null;
  return Response.json(
    { error: "Unauthorized" },
    { status: 401, headers: UNAUTHORIZED_HEADERS },
  );
}

/** Signed-in person for a route handler request, or null. */
export async function adminIdentityFromRequest(
  request: NextRequest,
): Promise<AdminIdentity | null> {
  return getAdminIdentity(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

/** Verify the admin session — use in Server Actions and server-only loaders. */
export async function assertAdminSession(): Promise<AdminIdentity> {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  const identity = await getAdminIdentity(token);
  if (!identity) throw new AdminAuthError();
  return identity;
}

/**
 * For server components: the signed-in person, or a redirect to the login
 * page. Memoised per render so the layout and page share one lookup.
 */
export const requireAdminPage = cache(async (): Promise<AdminIdentity> => {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  const identity = await getAdminIdentity(token);
  if (!identity) redirect("/admin/login");
  return identity;
});
