import { NextRequest } from "next/server";
import {
  ADMIN_CHALLENGE_COOKIE,
  ADMIN_SESSION_COOKIE,
  adminRequestContext,
  clearAdminCookie,
  recordAdminAuthEvent,
  sessionTokenHash,
} from "@/lib/admin-auth";
import { loginJson } from "@/lib/admin-login-api";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Ends the session on the server, not just in this browser: the database row
 * is revoked, so a copied cookie stops working too. Always clears both
 * cookies, even when the session had already expired.
 */
export async function POST(request: NextRequest) {
  const response = loginJson({ success: true });
  try {
    const tokenHash = sessionTokenHash(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
    if (tokenHash) {
      const session = await prisma.adminSession.findUnique({
        where: { tokenHash },
        select: { id: true, userId: true, revokedAt: true },
      });
      if (session && !session.revokedAt) {
        await prisma.adminSession.update({
          where: { id: session.id },
          data: { revokedAt: new Date(), revokedReason: "logout" },
        });
        await recordAdminAuthEvent("LOGOUT", {
          userId: session.userId,
          context: adminRequestContext(request),
        });
      }
    }
  } catch {
    console.error("[admin-auth] logout could not revoke the session row");
  }

  clearAdminCookie(response, ADMIN_SESSION_COOKIE);
  clearAdminCookie(response, ADMIN_CHALLENGE_COOKIE);
  // Drop cached dashboard pages so Back cannot show them after sign-out.
  response.headers.set("Clear-Site-Data", '"cache"');
  return response;
}
