import type { BookingAttachment } from "@/lib/booking-message-types";

export const DASHBOARD_INBOX_ADDRESS = "reservations@reply.hathorcruise.com";

export type InboxSource = "booking" | "general";
export type InboxSummary = {
  id: string;
  source: InboxSource;
  bookingId: string | null;
  sender: string;
  subject: string;
  preview: string;
  attachmentCount: number;
  createdAt: string;
  readAt: string | null;
};
export type InboxDetail = InboxSummary & {
  recipient: string;
  bodyText: string;
  attachments: BookingAttachment[];
  senderMatchesGuest: boolean;
};
export type InboxPage = { messages: InboxSummary[]; hasOlder: boolean; unreadCount: number };
