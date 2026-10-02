import { randomBytes } from "node:crypto";
import { z } from "zod";

export const BOOKING_MAIL_ORIGIN = "https://hathorcruise.com";
export const BOOKING_REPLY_DOMAIN = "reply.hathorcruise.com";

export function inboundBookingEmailEnabled(): boolean {
  return process.env.RESEND_INBOUND_ENABLED === "true" && Boolean(process.env.RESEND_WEBHOOK_SECRET?.trim());
}

export function newBookingReplyToken(): string {
  return randomBytes(24).toString("hex");
}

export function bookingReplyAddress(token: string): string {
  if (!/^[a-f0-9]{48}$/.test(token)) throw new Error("Invalid booking reply token");
  return `r-${token}@${BOOKING_REPLY_DOMAIN}`;
}

export function mailboxAddress(value: string): string | null {
  if (/[\r\n]/.test(value)) return null;
  const address = value.match(/<([^<>]+)>\s*$/)?.[1] ?? value.trim();
  const parsed = z.email().safeParse(address);
  return parsed.success ? parsed.data.toLowerCase() : null;
}

export function bookingReplyToken(addresses: string[]): string | null {
  const tokens = new Set(addresses.map(mailboxAddress).filter(Boolean).flatMap(address => {
    const match = address!.match(/^r-([a-f0-9]{48})@reply\.hathorcruise\.com$/);
    return match ? [match[1]!] : [];
  }));
  return tokens.size === 1 ? [...tokens][0]! : null;
}

export function bookingReplyInbox(): string {
  const address = mailboxAddress(process.env.BOOKING_REPLY_NOTIFICATION_EMAIL?.trim() || "reservations@hathorcruise.com");
  if (!address) throw new Error("Invalid booking reply notification mailbox");
  return address;
}
