import type { BookingAttachment } from "@/lib/booking-message-types";
import type { MailboxId, MailboxSummary } from "@/lib/email-mailboxes";
import type { MailFolder } from "@/lib/mail-folders";

export const DASHBOARD_INBOX_ADDRESS = "reservations@reply.hathorcruise.com";

export type InboxSource = "booking" | "general";
export type InboxFilter = "all" | "unread" | "received" | "sent";
export type InboxCounts = { all: number; unread: number; received: number; sent: number };
export type InboxSummary = {
  folder?: MailFolder;
  screeningReasons?: string[];
  mailboxId: MailboxId;
  id: string;
  source: InboxSource;
  bookingId: string | null;
  sender: string;
  recipient: string;
  correspondentName: string | null;
  direction: "INBOUND" | "OUTBOUND";
  status: "RECEIVED" | "PENDING" | "SENT" | "FAILED";
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
export type InboxPage = { messages: InboxSummary[]; hasOlder: boolean; unreadCount: number; counts: InboxCounts; mailboxes: MailboxSummary[] };
