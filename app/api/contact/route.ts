import { NextResponse } from "next/server";
import { z } from "zod";
import { sendInquiryEmail } from "@/lib/inquiry-email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const inquirySchema = z.object({
  type: z.enum(["contact", "charter"]),
  name: z
    .string()
    .trim()
    .min(2, "Name is required")
    .max(120, "Name is too long"),
  email: z.string().trim().email("Valid email is required").max(254),
  phone: z.string().trim().max(30).optional(),
  message: z
    .string()
    .trim()
    .min(10, "Message is required")
    .max(4000, "Message is too long"),
  address: z.string().trim().max(300).optional(),
  checkIn: z.string().trim().max(30).optional(),
  adults: z.coerce.number().int().min(0).max(50).optional(),
  children: z.coerce.number().int().min(0).max(50).optional(),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`inquiry:${ip}`, 5, 60_000);

  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfterSeconds) },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check your form and try again." },
      { status: 400 },
    );
  }

  try {
    await sendInquiryEmail(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[inquiry] send failed:", error);
    return NextResponse.json(
      { error: "Unable to send your message. Please try again later." },
      { status: 500 },
    );
  }
}
