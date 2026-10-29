import { hasAdminPermission, type AdminAccess } from "@/lib/admin-permissions";
import { allowedMailboxIds } from "@/lib/admin-mailbox-access";
export function canAdminBookingAction(access: AdminAccess, action: string): boolean {
  const permission = action === "accept" || action === "confirm" ? "bookings.accept" : "bookings.manage";
  if (!hasAdminPermission(access, permission)) return false;
  return !["reply", "message", "send-confirmation"].includes(action) || allowedMailboxIds(access, "send").includes("reservations");
}
