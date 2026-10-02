import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleRouteError } from "@/lib/api";
import { assertBookingAdmin } from "@/lib/booking-admin-api";
import { readPublicJsonBody } from "@/lib/public-api-security";
import { fetchBookingStatus } from "@/lib/admin-bookings-fetch";
import { createAttachmentUpload } from "@/lib/mail-attachments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const uploadSchema = z.object({ name: z.string().trim().min(1).max(255), size: z.number().int().positive() }).strict();

/** Starts one attachment upload for a reply to this booking's guest; the browser sends the file to the returned link. */
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    assertBookingAdmin(request);
    const { id } = await context.params;
    const file = uploadSchema.parse(await readPublicJsonBody(request));
    await fetchBookingStatus(id);
    return NextResponse.json(await createAttachmentUpload(id, file));
  } catch (error) { return handleRouteError(error); }
}
