import { randomUUID } from "crypto";
import type { ReactElement } from "react";
import { render } from "@react-email/render";
import { Resend } from "resend";
import AdminAlertEmail from "@/emails/AdminAlert";
import BookingConfirmedEmail from "@/emails/BookingConfirmed";
import BookingDeclinedEmail from "@/emails/BookingDeclined";
import BookingInvoiceEmail from "@/emails/BookingInvoice";
import BookingMessageEmail from "@/emails/BookingMessage";
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

/** Each attempt gets this long, so a stalled connection cannot hang a staff action. */
const SEND_TIMEOUT_MS = 15_000;

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
    throw new Error("Email is not configured (RESEND_API_KEY is missing)");
  }

  /* Hosted HTTPS <img> only — never CID attachments (Gmail lists those as files). */
  console.log(
    `[email] sending ${input.label}`,
    `logo=${input.theme.logoUrl ? "hosted" : "none"}`,
    `hero=${input.theme.heroImageUrl ? "hosted" : "none"}`,
  );

  const message = input.renderMessage(input.theme);
  const [html, text] = await Promise.all([
    render(message),
    render(message, { plainText: true }),
  ]);

  const payload = {
    from: getFromAddress(),
    to: input.to,
    subject: input.subject,
    html,
    text,
    replyTo: process.env.RESEND_REPLY_TO?.trim() || undefined,
  };
  // Retry only when the connection dropped before Resend answered; the shared
  // idempotency key makes Resend deliver the message at most once.
  const idempotencyKey = randomUUID();
  const attempt = () =>
    Promise.race([
      resend.emails.send(payload, { idempotencyKey }),
      new Promise<{ data: null; error: { message: string } }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: { message: "Unable to fetch data: the email service did not answer in time." } }), SEND_TIMEOUT_MS),
      ),
    ]);
  let result = await attempt();
  for (let tries = 1; tries < 3 && result.error && /unable to fetch|could not be resolved|fetch failed/i.test(result.error.message); tries += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1000 * tries));
    result = await attempt();
  }

  if (result.error) {
    console.error(`[email] ${input.label} failed:`, result.error);
    throw new Error(result.error.message);
  }

  console.log(`[email] ${input.label} sent`, result.data?.id ?? "");
}

function subjectVars(guestName: string, details: BookingEmailDetails) {
  return { guestName, bookingCode: details.bookingCode ?? details.bookingId };
}

export async function sendBookingInvoiceEmail(
  guestEmail: string,
  guestName: string,
  bookingDetails: BookingEmailDetails,
  instructions: string,
) {
  const template = await getEmailTemplateForSend("BookingInvoice");
  await sendEmail({
    to: guestEmail,
    subject: resolveEmailSubject(template, subjectVars(guestName, bookingDetails)),
    theme: buildEmailSendTheme(template),
    renderMessage: (sendTheme) =>
      BookingInvoiceEmail({ guestName, details: bookingDetails, instructions, ...sendTheme }),
    label: "booking invoice (guest)",
  });
}

export async function sendBookingDeclinedEmail(
  guestEmail: string,
  guestName: string,
  bookingDetails: BookingEmailDetails,
  message?: string,
) {
  const template = await getEmailTemplateForSend("BookingDeclined");
  await sendEmail({
    to: guestEmail,
    subject: resolveEmailSubject(template, subjectVars(guestName, bookingDetails)),
    theme: buildEmailSendTheme(template),
    renderMessage: (sendTheme) =>
      BookingDeclinedEmail({ guestName, details: bookingDetails, message, ...sendTheme }),
    label: "booking declined (guest)",
  });
}

/** A reply written by the team, framed in the branded layout. An empty subject uses the template's. */
export async function sendBookingMessageEmail(
  guestEmail: string,
  guestName: string,
  bookingDetails: BookingEmailDetails,
  message: string,
  subject?: string,
) {
  const template = await getEmailTemplateForSend("BookingMessage");
  await sendEmail({
    to: guestEmail,
    subject: subject?.trim() || resolveEmailSubject(template, subjectVars(guestName, bookingDetails)),
    theme: buildEmailSendTheme(template),
    renderMessage: (sendTheme) =>
      BookingMessageEmail({ guestName, details: bookingDetails, message, ...sendTheme }),
    label: "team reply (guest)",
  });
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
    subject: resolveEmailSubject(template, subjectVars(guestName, bookingDetails)),
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
    subject: resolveEmailSubject(template, subjectVars(guestName, bookingDetails)),
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
    throw new Error("Admin notification is not configured");
  }

  const template = await getEmailTemplateForSend("AdminAlert");
  const theme = buildEmailSendTheme(template);

  await sendEmail({
    to: adminEmail,
    subject: resolveEmailSubject(template, subjectVars(bookingDetails.guestName, bookingDetails)),
    theme,
    renderMessage: (sendTheme) =>
      AdminAlertEmail({
        details: bookingDetails,
        ...sendTheme,
      }),
    label: "admin alert",
  });
}
