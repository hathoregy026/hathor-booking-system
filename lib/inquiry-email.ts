import { Resend } from "resend";
import { HATHOR_EMAIL_LOGO_URL } from "@/lib/email-branding-urls";
import { PUBLIC_CONTACT } from "@/lib/public-contact";
import { getSiteBaseUrl } from "@/lib/public-url";
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

function buildGuestReceiptHtml(safeGuestName: string): string {
  const siteUrl = getSiteBaseUrl().replace(/\/$/, "");
  const logoUrl = HATHOR_EMAIL_LOGO_URL;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>We received your message</title>
</head>
<body style="margin:0;padding:0;background:#ece4da;color:#14120e;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ece4da;padding:36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#f5eacf;border-top:3px solid #b69f64;">
          <tr>
            <td align="center" style="padding:36px 36px 8px;">
              <img src="${logoUrl}" width="64" height="64" alt="Hathor Dahabiya" style="display:block;width:64px;height:64px;border:0;outline:none;" />
            </td>
          </tr>
          <tr>
            <td style="padding:12px 40px 8px;text-align:center;">
              <p style="margin:0;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:11px;font-weight:500;letter-spacing:0.28em;text-transform:uppercase;color:#806b35;">Message received</p>
            </td>
          </tr>
          <tr>
            <td style="padding:6px 40px 18px;text-align:center;">
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:42px;font-weight:400;line-height:1.05;letter-spacing:-0.03em;color:#14120e;">Thank you, ${safeGuestName}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 48px 8px;text-align:center;">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:17px;font-style:italic;line-height:1.7;color:#4a453c;">Your note has reached the Hathor reservations desk. We will reply within 24 hours.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 48px 28px;text-align:center;">
              <p style="margin:0;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.65;color:#4a453c;">You may reply directly to this email if you wish to add anything to your request.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:4px 40px 36px;">
              <a href="${siteUrl}/" style="display:inline-block;padding:14px 34px;border:1px solid #14120e;border-radius:999px;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:11px;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;text-decoration:none;color:#14120e;background:#f5eacf;">Visit Dahabiya</a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 36px;">
              <div style="border-top:1px solid rgba(128,107,53,.28);padding-top:20px;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.65;color:#6b6560;text-align:center;">
                For your security, never send passwords or card details by email. Hathor will not request payment through an unverified link in response to a contact message.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
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
  const siteUrl = getSiteBaseUrl().replace(/\/$/, "");
  const guestSubject = "We received your message | Hathor Dahabiya";
  const guestHtml = buildGuestReceiptHtml(safeGuestName);
  const guestText = [
    `Thank you, ${payload.name}.`,
    "",
    "Your message has reached the Hathor reservations team. We will reply within 24 hours.",
    "You can reply directly to this email if you need to add anything.",
    "",
    `Visit Dahabiya: ${siteUrl}/`,
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
