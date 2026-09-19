import { Resend } from "resend";
import { render } from "@react-email/render";
import ContactReceivedEmail from "@/emails/ContactReceived";
import ContactAlertEmail, { type ContactAlertLine } from "@/emails/ContactAlert";
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
import {
  resolveSelectionSummary,
  type SelectionEnquiry,
} from "@/lib/selection-enquiry";

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
  /** Bounded My Voyage selection. Slugs and integers only — never a price. */
  selection?: SelectionEnquiry;
};

export async function sendInquiryEmail(payload: InquiryPayload): Promise<void> {
  const resend = getResend();
  const adminEmail = getAdminNotificationEmail();

  if (!resend || !adminEmail) {
    throw new Error("Inquiry email service is not configured");
  }

  const label = payload.type === "charter" ? "Charter request" : "Contact inquiry";
  /*
   * Selection lines are resolved server-side from trusted catalog data. No
   * client-supplied price, name or route reaches this block.
   */
  const selectionLines = resolveSelectionSummary(payload.selection);
  const detailLines: ContactAlertLine[] = [
    payload.phone ? { label: "Phone", value: payload.phone } : null,
    payload.address ? { label: "Address", value: payload.address } : null,
    payload.checkIn ? { label: "Check-in", value: payload.checkIn } : null,
    payload.adults !== undefined ? { label: "Adults", value: String(payload.adults) } : null,
    payload.children !== undefined ? { label: "Children", value: String(payload.children) } : null,
    payload.preferredRoute ? { label: "Preferred route", value: payload.preferredRoute } : null,
    ...selectionLines.map(line => ({ label: `Voyage selection · ${line.label}`, value: line.value })),
  ].filter((line): line is ContactAlertLine => line !== null);

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
    ...(selectionLines.length > 0
      ? [
          "",
          "HATHOR VOYAGE SELECTION",
          ...selectionLines.map((line) => `${line.label}: ${line.value}`),
        ]
      : []),
    "",
    "Message:",
    payload.message,
  ]
    .filter((line, index, all) => line || all[index - 1] !== "")
    .join("\n");

  const siteUrl = getSiteBaseUrl().replace(/\/$/, "");
  // The team's copy: Dashboard → Email Templates → Contact Alert.
  const alertTemplate = await getEmailTemplateForSend("ContactAlert");
  const alertVars = { guestName: payload.name, inquiryType: label };
  const adminHtml = await render(
    ContactAlertEmail({
      guestName: payload.name,
      guestEmail: payload.email,
      inquiryType: label,
      lines: detailLines,
      message: payload.message,
      ...buildEmailSendTheme(alertTemplate),
    }),
  );

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
      subject: resolveEmailSubject(alertTemplate, alertVars),
      html: adminHtml,
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
