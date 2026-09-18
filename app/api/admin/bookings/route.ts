import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertBookingAdmin, applyStaffBookingAction } from "@/lib/booking-admin-api";
import { readPublicJsonBody } from "@/lib/public-api-security";
import { handleRouteError } from "@/lib/api";
import { logDbError } from "@/lib/db-safe";
import { fetchAdminBookingsFast, fetchBookingStatus } from "@/lib/admin-bookings-fetch";
import { bookingQuery } from "@/lib/booking-database";
import { administerBooking } from "@/lib/booking-engine";

const staffListSchema = z.object({
  id: z.string().max(128).optional(),
  status: z.enum(["CONFIRMED","CANCELLED"]).optional(),
  ids: z.array(z.string().max(128)).min(1).max(100).optional(),
  action: z.enum(["soft-delete","restore","purge"]).optional(),
}).strict();

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const bin = searchParams.get("bin") === "true";
    const calendar = searchParams.get("calendar") === "true";

    const bookings = await fetchAdminBookingsFast({
      bin,
      calendar,
      statusFilter,
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    logDbError("admin.bookings.GET", error);
    return NextResponse.json(
      {
        error:
          "Could not load bookings. The database may be busy — wait a moment and refresh.",
        bookings: [],
      },
      { status: 503 },
    );
  }
}

/**
 * Moving a booking to the bin releases its cabins first. A request that was
 * never confirmed is declined (Hathor turning it down charges no fee); a
 * confirmed booking is cancelled under the cancellation policy.
 */
async function releaseForBin(id: string) {
  const status = await fetchBookingStatus(id);
  if (status === "REQUESTED" || status === "PENDING_HOLD") await administerBooking(id, { type: "decline" });
  else if (status === "CONFIRMED") await administerBooking(id, { type: "cancel" });
}

export async function PATCH(request: NextRequest) {
  try {
    assertBookingAdmin(request);
    const body = staffListSchema.parse(await readPublicJsonBody(request));
    if (body.id && body.status) {
      await applyStaffBookingAction(body.id, { status: body.status });
      return NextResponse.json({ booking: { id: body.id, status: await fetchBookingStatus(body.id) } });
    }
    if (body.action === "soft-delete" && body.ids) {
      for (const id of body.ids) {
        await releaseForBin(id);
        await bookingQuery(`UPDATE "Booking" SET "deletedAt" = timezone('utc', now()) WHERE id = $1`, [id]);
      }
      return NextResponse.json({ updated: body.ids.length });
    }
    if (body.action === "restore" && body.ids) {
      const rows = await bookingQuery(`UPDATE "Booking" SET "deletedAt" = NULL WHERE id = ANY($1::text[]) AND "deletedAt" IS NOT NULL RETURNING id`, [body.ids]);
      return NextResponse.json({ updated: rows.length });
    }
    if (body.action === "purge" && body.ids) {
      // Only bookings already in the bin, and never one with recorded money:
      // payment entries are the accounting trail and must stay.
      const rows = await bookingQuery(
        `DELETE FROM "Booking" b WHERE b.id = ANY($1::text[]) AND b."deletedAt" IS NOT NULL
           AND NOT EXISTS (SELECT 1 FROM "BookingPayment" p WHERE p."bookingId" = b.id) RETURNING b.id`,
        [body.ids],
      );
      const kept = body.ids.length - rows.length;
      return NextResponse.json({
        deleted: rows.length,
        kept,
        ...(kept > 0 ? { note: `${kept} booking(s) kept: they have recorded payments or are not in the bin.` } : {}),
      });
    }
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (error) { return handleRouteError(error); }
}
