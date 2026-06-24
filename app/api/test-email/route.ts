import { NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const config = {
    hasResendKey: Boolean(process.env.RESEND_API_KEY?.trim()),
    hasAdminEmail: Boolean(process.env.ADMIN_EMAIL?.trim()),
    from:
      process.env.RESEND_FROM_EMAIL?.trim() ??
      "Hathor Dahabiya <onboarding@resend.dev>",
  };

  if (!config.hasResendKey) {
    return NextResponse.json(
      { ok: false, error: "RESEND_API_KEY is not set", config },
      { status: 500 },
    );
  }

  const to = process.env.ADMIN_EMAIL?.trim();
  if (!to) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_EMAIL is not set", config },
      { status: 500 },
    );
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY!.trim());
    console.log("[test-email] sending test email to", to);

    const result = await resend.emails.send({
      from: config.from,
      to,
      subject: "Hathor Booking System — test email",
      html: "<p>If you received this, Resend is configured correctly on Vercel.</p>",
    });

    if (result.error) {
      console.error("[test-email] Resend error:", result.error);
      return NextResponse.json(
        { ok: false, error: result.error, config },
        { status: 500 },
      );
    }

    console.log("[test-email] sent", result.data?.id);
    return NextResponse.json({
      ok: true,
      id: result.data?.id,
      to,
      from: config.from,
      config,
    });
  } catch (error) {
    console.error("[test-email] exception:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
        config,
      },
      { status: 500 },
    );
  }
}
