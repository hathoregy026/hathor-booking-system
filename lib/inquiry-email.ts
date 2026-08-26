import { Resend } from "resend";
import { render } from "@react-email/render";
import ContactReceivedEmail from "@/emails/ContactReceived";
import { PUBLIC_CONTACT } from "@/lib/public-contact";
import { getSiteBaseUrl } from "@/lib/public-url";
import {
  getEmailTemplateForSend,
  resolveEmailSubject,
} from "@/lib/email-template-send";
import {
  buildEmailSendTheme,
  interpolateEmailText,
} from "@/lib/email-templates";
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

  const siteUrl = getSiteBaseUrl().replace(/\/$/, "");
  const template = await getEmailTemplateForSend("ContactReceived");
  const theme = buildEmailSendTheme(template);
  const guestSubject = resolveEmailSubject(template, {
    guestName: payload.name,
  });
  const guestMessage = ContactReceivedEmail({
    guestName: payload.name,
    ...theme,
  });
  const [guestHtml, guestPlain] = await Promise.all([
    render(guestMessage),
    render(guestMessage, { plainText: true }),
  ]);
  const guestText =
    guestPlain.trim() ||
    [
      interpolateEmailText(
        template.heroHeading || "Thank you, {guestName}",
        { guestName: payload.name },
      ),
      "",
      interpolateEmailText(
        template.bodyText ||
          "Your note has reached the Hathor reservations desk. We will reply within 24 hours.",
        { guestName: payload.name },
      ),
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
