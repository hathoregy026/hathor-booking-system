import type { ReactElement } from "react";
import { Resend } from "resend";
import AdminAlertEmail from "@/emails/AdminAlert";
import BookingConfirmedEmail from "@/emails/BookingConfirmed";
import BookingReceivedEmail from "@/emails/BookingReceived";
import type { BookingEmailDetails } from "@/lib/email-types";

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
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ??
    "Hathor Dahabiya <onboarding@resend.dev>"
  );
}

function getAdminEmail(): string | null {
  const email = process.env.ADMIN_EMAIL?.trim();
  if (!email) {
    console.warn("[email] ADMIN_EMAIL is not set");
  }
  return email || null;
}

async function sendEmail(input: {
  to: string;
  subject: string;
  react: ReactElement;
  label: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.warn(`[email] skipping ${input.label} — Resend not configured`);
    return;
  }

  console.log(`[email] sending ${input.label} to ${input.to}`);

  const result = await resend.emails.send({
    from: getFromAddress(),
    to: input.to,
    subject: input.subject,
    react: input.react,
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
  await sendEmail({
    to: guestEmail,
    subject: "Your Hathor booking request has been received",
    react: BookingReceivedEmail({ guestName, details: bookingDetails }),
    label: "booking received (guest)",
  });
}

export async function sendBookingConfirmedEmail(
  guestEmail: string,
  guestName: string,
  bookingDetails: BookingEmailDetails,
) {
  await sendEmail({
    to: guestEmail,
    subject: "Your Hathor Dahabiya cruise is confirmed",
    react: BookingConfirmedEmail({ guestName, details: bookingDetails }),
    label: "booking confirmed (guest)",
  });
}

export async function sendAdminAlertEmail(bookingDetails: BookingEmailDetails) {
  const adminEmail = getAdminEmail();
  if (!adminEmail) {
    console.warn("[email] skipping admin alert — ADMIN_EMAIL not configured");
    return;
  }

  await sendEmail({
    to: adminEmail,
    subject: `New booking request — ${bookingDetails.guestName}`,
    react: AdminAlertEmail({ details: bookingDetails }),
    label: "admin alert",
  });
}
