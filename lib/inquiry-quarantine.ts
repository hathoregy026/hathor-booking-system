import { randomUUID } from "node:crypto";
import { bookingQuery } from "@/lib/booking-database";
import { recordInquiryInbox } from "@/lib/inquiry-inbox";
import { resolveSelectionSummary } from "@/lib/selection-enquiry";
import type { InquiryPayload } from "@/lib/inquiry-email";
import type { MailScreening } from "@/lib/mail-folders";

export async function quarantineInquiry(payload: InquiryPayload, screening: MailScreening, query = bookingQuery): Promise<void> {
  if (screening.folder === "inbox") throw new Error("Cannot quarantine an accepted inquiry");
  const bodyText = [`Name: ${payload.name}`, `Email: ${payload.email}`,
    payload.phone ? `Phone: ${payload.phone}` : "", payload.address ? `Address: ${payload.address}` : "",
    payload.checkIn ? `Preferred date: ${payload.checkIn}` : "",
    payload.adults !== undefined ? `Adults: ${payload.adults}` : "", payload.children !== undefined ? `Children: ${payload.children}` : "",
    payload.preferredRoute ? `Preferred route: ${payload.preferredRoute}` : "",
    ...resolveSelectionSummary(payload.selection).map(line => `${line.label}: ${line.value}`),
  ].filter(Boolean).concat("", "Message:", payload.message).join("\n");
  const escape = (text: string) => text.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
  await recordInquiryInbox({ id: randomUUID(), type: payload.type, name: payload.name, email: payload.email,
    subject: `${payload.type === "charter" ? "Charter request" : "Contact inquiry"} — ${payload.name}`,
    text: bodyText, html: `<pre>${escape(bodyText)}</pre>`, createdAt: new Date(),
    folder: screening.folder, screeningReasons: screening.reasons }, query);
}
