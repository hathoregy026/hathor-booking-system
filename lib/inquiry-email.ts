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
  preferredRoute?: string;
  website?: string;
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
    throw new Error("Inquiry email service is not configured");
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
  if (payload.preferredRoute) {
    lines.push(
      `<p><strong>Preferred route:</strong> ${escapeHtml(payload.preferredRoute)}</p>`,
    );
  }

  lines.push(
    `<p><strong>Message:</strong></p><p>${escapeHtml(payload.message).replaceAll("\n", "<br>")}</p>`,
  );

  const adminText = [
    `Type: ${label}`,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    payload.phone ? `Phone: ${payload.phone}` : "",
    payload.address ? `Address: ${payload.address}` : "",
    payload.checkIn ? `Check-in: ${payload.checkIn}` : "",
    payload.adults !== undefined ? `Adults: ${payload.adults}` : "",
    payload.children !== undefined ? `Children: ${payload.children}` : "",
    payload.preferredRoute ? `Preferred route: ${payload.preferredRoute}` : "",
    "",
    "Message:",
    payload.message,
  ]
    .filter((line, index, all) => line || all[index - 1] !== "")
    .join("\n");

  const safeGuestName = escapeHtml(payload.name);
  const guestSubject = "We received your message | Hathor Dahabiya";
  const guestHtml = `
    <div style="margin:0;padding:40px 20px;background:#ece4da;color:#2c2824;font-family:Arial,sans-serif">
      <div style="max-width:620px;margin:0 auto;border-top:3px solid #b69f64;background:#f5eacf;padding:42px 36px">
        <p style="margin:0 0 18px;color:#806b35;font-size:12px;letter-spacing:3px;text-transform:uppercase">Message received</p>
        <h1 style="margin:0 0 22px;font-family:Georgia,serif;font-size:38px;font-weight:400;line-height:1.1">Thank you, ${safeGuestName}</h1>
        <p style="margin:0 0 16px;font-size:16px;line-height:1.7">Your message has reached the Hathor reservations team. We will reply within 24 hours.</p>
        <p style="margin:0 0 28px;font-size:16px;line-height:1.7">You can reply directly to this email if you need to add anything.</p>
        <div style="border-top:1px solid rgba(128,107,53,.28);padding-top:20px;color:#5f5749;font-size:13px;line-height:1.65">
          For your security, never send passwords or card details by email. Hathor will not request payment through an unverified link in response to a contact message.
        </div>
      </div>
    </div>`;
  const guestText = [
    `Thank you, ${payload.name}.`,
    "",
    "Your message has reached the Hathor reservations team. We will reply within 24 hours.",
    "You can reply directly to this email if you need to add anything.",
    "",
    "For your security, never send passwords or card details by email. Hathor will not request payment through an unverified link in response to a contact message.",
  ].join("\n");

  const result = await resend.batch.send([
    {
      from: getResendFromAddress(),
      to: adminEmail,
      replyTo: payload.email,
      subject: `Hathor ${label} — ${payload.name}`,
      html: lines.join("\n"),
      text: adminText,
      tags: [{ name: "message_type", value: "contact_admin" }],
    },
    {
      from: getResendFromAddress(),
      to: payload.email,
      replyTo: process.env.RESEND_REPLY_TO?.trim() || PUBLIC_CONTACT.email,
      subject: guestSubject,
      html: guestHtml,
      text: guestText,
      tags: [{ name: "message_type", value: "contact_guest" }],
    },
  ]);

  if (result.error) {
    throw new Error(result.error.message);
  }

  console.log(`[inquiry] ${label} and guest receipt accepted by email provider`);
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
      payload.preferredRoute
        ? `Preferred route: ${payload.preferredRoute}`
        : "",
      "",
      payload.message,
    ]
      .filter(Boolean)
      .join("\n"),
  );
  return `mailto:${PUBLIC_CONTACT.email}?subject=${subject}&body=${body}`;
}
