import type { ReactElement } from "react";
import { render } from "@react-email/render";
import { Resend } from "resend";
import AdminAlertEmail from "@/emails/AdminAlert";
import BookingConfirmedEmail from "@/emails/BookingConfirmed";
import BookingReceivedEmail from "@/emails/BookingReceived";
import {
  getEmailTemplateForSend,
  resolveEmailSubject,
} from "@/lib/email-template-send";
import type { EmailTemplateOverrides } from "@/lib/email-templates";
import { buildEmailSendTheme } from "@/lib/email-templates";
import type { BookingEmailDetails } from "@/lib/email-types";
import {
  getAdminNotificationEmail,
  getResendFromAddress,
} from "@/lib/resend-config";

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY is not set");
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

function getFromAddress(): string {
  return getResendFromAddress();
}

function getAdminEmail(): string | null {
  const email = getAdminNotificationEmail();
  if (!email) {
    console.warn("[email] ADMIN_EMAIL is not set");
  }
  return email || null;
}

async function sendEmail(input: {
  to: string;
  subject: string;
  label: string;
  renderMessage: (theme: EmailTemplateOverrides) => ReactElement;
  theme: EmailTemplateOverrides;
}) {
  const resend = getResend();
  if (!resend) {
    console.warn(`[email] skipping ${input.label} — Resend not configured`);
    return;
  }

  console.log(`[email] sending ${input.label} to ${input.to}`);
  console.log(`[email] logo: ${input.theme.logoUrl}`);
  console.log(`[email] hero: ${input.theme.heroImageUrl}`);

  const html = await render(input.renderMessage(input.theme));

  const result = await resend.emails.send({
    from: getFromAddress(),
    to: input.to,
    subject: input.subject,
    html,
  });

  if (result.error) {
    console.error(`[email] ${input.label} failed:`, result.error);
    throw new Error(result.error.message);
  }

  console.log(`[email] ${input.label} sent`, result.data?.id ?? "");
}

export async function sendBookingReceivedEmail(
  guestEmail: string,
  guestName: string,
  bookingDetails: BookingEmailDetails,
) {
  const template = await getEmailTemplateForSend("BookingReceived");
  const theme = buildEmailSendTheme(template);

  await sendEmail({
    to: guestEmail,
    subject: resolveEmailSubject(template, { guestName }),
    theme,
    renderMessage: (sendTheme) =>
      BookingReceivedEmail({
        guestName,
        details: bookingDetails,
        ...sendTheme,
      }),
    label: "booking received (guest)",
  });
}

export async function sendBookingConfirmedEmail(
  guestEmail: string,
  guestName: string,
  bookingDetails: BookingEmailDetails,
) {
  const template = await getEmailTemplateForSend("BookingConfirmed");
  const theme = buildEmailSendTheme(template);

  await sendEmail({
    to: guestEmail,
    subject: resolveEmailSubject(template, { guestName }),
    theme,
    renderMessage: (sendTheme) =>
      BookingConfirmedEmail({
        guestName,
        details: bookingDetails,
        ...sendTheme,
      }),
    label: "booking confirmed (guest)",
  });
}

export async function sendAdminAlertEmail(bookingDetails: BookingEmailDetails) {
  const adminEmail = getAdminEmail();
  if (!adminEmail) {
    console.warn("[email] skipping admin alert — ADMIN_EMAIL not configured");
    return;
  }

  const template = await getEmailTemplateForSend("AdminAlert");
  const theme = buildEmailSendTheme(template);

  await sendEmail({
    to: adminEmail,
    subject: resolveEmailSubject(template, {
      guestName: bookingDetails.guestName,
    }),
    theme,
    renderMessage: (sendTheme) =>
      AdminAlertEmail({
        details: bookingDetails,
        ...sendTheme,
      }),
    label: "admin alert",
  });
}
