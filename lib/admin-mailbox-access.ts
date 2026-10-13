import { EMAIL_MAILBOXES, type MailboxId } from "@/lib/email-mailboxes";
import { hasAdminPermission, type AdminAccess } from "@/lib/admin-permissions";
export function allowedMailboxIds(access: AdminAccess, action: "view" | "send" = "view"): MailboxId[] {
  if (!hasAdminPermission(access, action === "send" ? "inbox.send" : "inbox.view")) return [];
  return EMAIL_MAILBOXES.filter(mailbox => access.isOwner || (access.mailboxViewIds?.includes(mailbox.id) && (action === "view" || access.mailboxSendIds?.includes(mailbox.id)))).map(mailbox => mailbox.id);
}
