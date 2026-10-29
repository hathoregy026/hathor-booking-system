import { z } from "zod";

export const ADMIN_ACTIVITY_EVENT = "hathor:admin-activity";
export const notificationIdentitySchema = z.object({
  id: z.uuid(), kind: z.enum(["booking", "email"]), source: z.enum(["booking", "general"]),
}).strict().refine(item => item.kind !== "booking" || item.source === "booking", "Invalid booking notification source");
export const notificationItemSchema = z.object({
  id: z.string().min(1).max(100),
  kind: z.enum(["booking", "email"]),
  source: z.enum(["booking", "general"]),
  name: z.string(),
  description: z.string(),
  createdAt: z.iso.datetime(),
});
export const notificationSnapshotSchema = z.object({
  unreadCount: z.number().int().nonnegative(),
  bookingCount: z.number().int().nonnegative(),
  emailCount: z.number().int().nonnegative(),
  bookingSeenThrough: z.iso.datetime(),
  items: z.array(notificationItemSchema).max(20),
  activity: z.array(z.object({ key: z.string().max(120), kind: z.enum(["booking", "email"]) })).max(100),
});
export type NotificationItem = z.infer<typeof notificationItemSchema>;
export type NotificationSnapshot = z.infer<typeof notificationSnapshotSchema>;
export type AdminActivity = { bookings: boolean; emails: boolean };

export function notificationHref(item: NotificationItem): string {
  return item.kind === "booking" ? `/admin/bookings/${encodeURIComponent(item.id)}`
    : `/admin/inbox?source=${item.source}&message=${encodeURIComponent(item.id)}`;
}

export class NotificationTracker {
  private initialized = false;
  private seen = new Set<string>();

  update(activity: NotificationSnapshot["activity"]): AdminActivity {
    const changes = { bookings: false, emails: false };
    for (const item of activity) {
      if (this.initialized && !this.seen.has(item.key)) changes[item.kind === "booking" ? "bookings" : "emails"] = true;
      this.seen.add(item.key);
    }
    this.initialized = true;
    while (this.seen.size > 1000) this.seen.delete(this.seen.values().next().value!);
    return changes;
  }
}
