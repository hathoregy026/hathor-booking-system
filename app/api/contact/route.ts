import { NextResponse } from "next/server";
import { z } from "zod";
import { sendInquiryEmail } from "@/lib/inquiry-email";
import { CHARTER_PAGE } from "@/lib/page-content";
import {
  assertTrustedPublicJsonRequest,
  enforcePublicRateLimit,
  PublicRequestError,
  RateLimitExceededError,
  readPublicJsonBody,
} from "@/lib/public-api-security";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CHARTER_ROUTES = new Set<string>(CHARTER_PAGE.overview.routes);

const inquirySchema = z.object({
  type: z.enum(["contact", "charter"]),
  name: z
    .string()
    .trim()
    .min(2, "Name is required")
    .max(120, "Name is too long")
    .regex(
      /^[\p{L}\p{M}][\p{L}\p{M}\p{N} .,'’\-]{1,119}$/u,
      "Name contains unsupported characters",
    ),
  email: z.string().trim().email("Valid email is required").max(254),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[0-9+() .\-]*$/, "Phone contains unsupported characters")
    .optional(),
  message: z
    .string()
    .trim()
    .min(3, "Message is required")
    .max(4000, "Message is too long")
    .refine((value) => !/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value), {
      message: "Message contains unsupported characters",
    }),
  address: z.string().trim().max(300).optional(),
  checkIn: z.string().trim().max(30).optional(),
  adults: z.coerce.number().int().min(0).max(50).optional(),
  children: z.coerce.number().int().min(0).max(50).optional(),
  preferredRoute: z.preprocess(
    (value) => {
      if (value === undefined || value === null) return undefined;
      if (typeof value !== "string") return value;
      const trimmed = value.trim();
      return trimmed.length === 0 ? undefined : trimmed;
    },
    z
      .string()
      .max(120)
      .optional()
      .refine(
        (value) => !value || CHARTER_ROUTES.has(value),
        "Invalid preferred route",
      ),
  ),
  // Hidden honeypot. Real visitors never fill this; simple form bots usually do.
  website: z.literal("").optional(),
});

export async function POST(request: Request) {
  try {
    assertTrustedPublicJsonRequest(request);
    await enforcePublicRateLimit({
      request,
      scope: "contact-inquiry",
      limit: 5,
      windowMs: 10 * 60_000,
    });

    const body = await readPublicJsonBody(request);
    const parsed = inquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check your form and try again." },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    await sendInquiryEmail(parsed.data);
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof RateLimitExceededError) {
      return NextResponse.json(
        { error: "Too many messages. Please wait and try again." },
        {
          status: 429,
          headers: {
            "Cache-Control": "no-store",
            "Retry-After": String(error.retryAfterSeconds),
          },
        },
      );
    }

    if (error instanceof PublicRequestError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status, headers: { "Cache-Control": "no-store" } },
      );
    }

    // Do not log guest details or provider responses that may contain addresses.
    console.error(
      `[inquiry] send failed (${error instanceof Error ? error.name : "unknown"})`,
    );
    return NextResponse.json(
      { error: "Unable to send your message. Please try again later." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
