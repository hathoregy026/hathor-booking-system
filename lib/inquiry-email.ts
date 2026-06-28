import { Resend } from "resend";
import { PUBLIC_CONTACT } from "@/lib/public-contact";
import { getAdminNotificationEmail, getResendFromAddress } from "@/lib/resend-config";

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export type InquiryPayload = {
  type: "contact" | "charter";
  name: string;
  email: string;
  phone?: string;
  message: string;
  address?: string;
  checkIn?: string;
  adults?: number;
  children?: number;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function sendInquiryEmail(payload: InquiryPayload): Promise<void> {
  const resend = getResend();
  const adminEmail = getAdminNotificationEmail();

  if (!resend || !adminEmail) {
    console.warn("[inquiry] email skipped — Resend or ADMIN_EMAIL not configured");
    return;
  }

  const label = payload.type === "charter" ? "Charter request" : "Contact inquiry";
  const lines = [
    `<p><strong>Type:</strong> ${escapeHtml(label)}</p>`,
    `<p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>`,
    `<p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>`,
  ];

  if (payload.phone) {
    lines.push(`<p><strong>Phone:</strong> ${escapeHtml(payload.phone)}</p>`);
  }
  if (payload.address) {
    lines.push(`<p><strong>Address:</strong> ${escapeHtml(payload.address)}</p>`);
  }
  if (payload.checkIn) {
    lines.push(`<p><strong>Check-in:</strong> ${escapeHtml(payload.checkIn)}</p>`);
  }
  if (payload.adults !== undefined) {
    lines.push(`<p><strong>Adults:</strong> ${payload.adults}</p>`);
  }
  if (payload.children !== undefined) {
    lines.push(`<p><strong>Children:</strong> ${payload.children}</p>`);
  }

  lines.push(
    `<p><strong>Message:</strong></p><p>${escapeHtml(payload.message).replaceAll("\n", "<br>")}</p>`,
  );

  const result = await resend.emails.send({
    from: getResendFromAddress(),
    to: adminEmail,
    replyTo: payload.email,
    subject: `Hathor ${label} — ${payload.name}`,
    html: lines.join("\n"),
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  console.log(`[inquiry] ${label} sent to ${adminEmail}`);
}

export function getInquiryFallbackMailto(payload: InquiryPayload): string {
  const subject = encodeURIComponent(
    `Hathor ${payload.type === "charter" ? "Charter" : "Contact"} — ${payload.name}`,
  );
  const body = encodeURIComponent(
    [
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      payload.phone ? `Phone: ${payload.phone}` : "",
      payload.address ? `Address: ${payload.address}` : "",
      payload.checkIn ? `Check-in: ${payload.checkIn}` : "",
      payload.adults !== undefined ? `Adults: ${payload.adults}` : "",
      payload.children !== undefined ? `Children: ${payload.children}` : "",
      "",
      payload.message,
    ]
      .filter(Boolean)
      .join("\n"),
  );
  return `mailto:${PUBLIC_CONTACT.email}?subject=${subject}&body=${body}`;
}
