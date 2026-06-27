import { NextResponse } from "next/server";
import { render } from "@react-email/render";
import { Resend } from "resend";
import BookingReceivedEmail from "@/emails/BookingReceived";
import { sampleBookingDetails, sampleGuestName } from "@/emails/sample-data";
import { buildEmailSendTheme } from "@/lib/email-templates";
import { getEmailTemplateForSend } from "@/lib/email-template-send";
import {
  getResendFromAddress,
  getTestEmailRecipient,
} from "@/lib/resend-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Admin-only email test — sends a rendered BookingReceived template.
 * Protected by middleware (HMAC session).
 */
export async function GET() {
  const hasResendKey = Boolean(process.env.RESEND_API_KEY?.trim());
  const to = getTestEmailRecipient();
  const from = getResendFromAddress();

  if (!hasResendKey) {
    return NextResponse.json(
      { ok: false, error: "Email service is not configured" },
      { status: 500 },
    );
  }

  if (!to) {
    return NextResponse.json(
      { ok: false, error: "Test recipient email is not configured" },
      { status: 500 },
    );
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY!.trim());
    const template = await getEmailTemplateForSend("BookingReceived");
    const theme = buildEmailSendTheme(template);

    const html = await render(
      BookingReceivedEmail({
        guestName: sampleGuestName,
        details: sampleBookingDetails,
        ...theme,
      }),
    );

    console.log("[admin/test-email] sending template test to", to);
    console.log("[admin/test-email] logo:", theme.logoUrl);
    console.log("[admin/test-email] hero:", theme.heroImageUrl);

    const result = await resend.emails.send({
      from,
      to,
      subject: "Hathor Booking System — template test email",
      html,
    });

    if (result.error) {
      console.error("[admin/test-email] Resend error:", result.error);
      return NextResponse.json(
        {
          ok: false,
          error: result.error.message || "Failed to send test email",
        },
        { status: 500 },
      );
    }

    console.log("[admin/test-email] sent", result.data?.id);
    return NextResponse.json({
      ok: true,
      id: result.data?.id,
      to,
      template: "BookingReceived",
      logoUrl: theme.logoUrl,
      heroImageUrl: theme.heroImageUrl,
    });
  } catch (error) {
    console.error("[admin/test-email] exception:", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Failed to send test email",
      },
      { status: 500 },
    );
  }
}
