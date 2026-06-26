import { NextResponse } from "next/server";
import { render } from "@react-email/render";
import { Resend } from "resend";
import BookingReceivedEmail from "@/emails/BookingReceived";
import { sampleBookingDetails, sampleGuestName } from "@/emails/sample-data";
import { getEmailTemplateForSend } from "@/lib/email-template-send";
import { prepareEmailSendImages } from "@/lib/email-send-images";
import { toEmailThemeOverridesForSend } from "@/lib/email-theme-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Admin-only email test — sends a rendered BookingReceived template.
 * Protected by middleware (HMAC session).
 */
export async function GET() {
  const hasResendKey = Boolean(process.env.RESEND_API_KEY?.trim());
  const to = process.env.ADMIN_EMAIL?.trim();
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ??
    "Hathor Dahabiya <onboarding@resend.dev>";

  if (!hasResendKey) {
    return NextResponse.json(
      { ok: false, error: "Email service is not configured" },
      { status: 500 },
    );
  }

  if (!to) {
    return NextResponse.json(
      { ok: false, error: "Admin notification email is not configured" },
      { status: 500 },
    );
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY!.trim());
    const template = await getEmailTemplateForSend("BookingReceived");
    const theme = toEmailThemeOverridesForSend(template);
    const { theme: sendTheme, attachments } = await prepareEmailSendImages(theme);

    const html = await render(
      BookingReceivedEmail({
        guestName: sampleGuestName,
        details: sampleBookingDetails,
        ...sendTheme,
      }),
    );

    console.log("[admin/test-email] sending template test to", to);

    const result = await resend.emails.send({
      from,
      to,
      subject: "Hathor Booking System — template test email",
      html,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    if (result.error) {
      console.error("[admin/test-email] Resend error:", result.error);
      return NextResponse.json(
        { ok: false, error: "Failed to send test email" },
        { status: 500 },
      );
    }

    console.log("[admin/test-email] sent", result.data?.id);
    return NextResponse.json({
      ok: true,
      id: result.data?.id,
      to,
      template: "BookingReceived",
    });
  } catch (error) {
    console.error("[admin/test-email] exception:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to send test email" },
      { status: 500 },
    );
  }
}
