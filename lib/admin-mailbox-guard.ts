import { allowedMailboxIds } from "@/lib/admin-mailbox-access";
import type { AdminAccess } from "@/lib/admin-permissions";
import { PublicRequestError } from "@/lib/public-api-security";
export function assertMailboxAccess(access: AdminAccess, mailboxId: string, action: "view" | "send" = "view") {
  if (!allowedMailboxIds(access, action).some(id => id === mailboxId)) throw new PublicRequestError("Access denied", 403);
}
