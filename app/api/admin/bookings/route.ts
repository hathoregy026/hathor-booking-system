import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertBookingAdmin, applyStaffBookingAction } from "@/lib/booking-admin-api";
import { readPublicJsonBody } from "@/lib/public-api-security";
const staffListSchema = z.object({ id: z.string().max(128).optional(), status: z.enum(["CONFIRMED","CANCELLED"]).optional(), ids: z.array(z.string().max(128)).min(1).max(100).optional(), action: z.enum(["soft-delete","restore","purge"]).optional() }).strict();
import { handleRouteError } from "@/lib/api";
import { logDbError } from "@/lib/db-safe";
import { fetchAdminBookingsFast } from "@/lib/admin-bookings-fetch";
import { prisma } from "@/lib/prisma";

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

export async function PATCH(request: NextRequest) {
  try {
    assertBookingAdmin(request);
    const body = staffListSchema.parse(await readPublicJsonBody(request));
    if (body.id && body.status) {
      const booking = await applyStaffBookingAction(body.id, { status: body.status });
      return NextResponse.json({ booking: { id: booking.id, status: booking.status } });
    }
    if (body.action === "soft-delete" && body.ids) {
      for (const id of body.ids) {
        await applyStaffBookingAction(id, { type: "cancel" });
        await prisma.booking.update({ where: { id }, data: { deletedAt: new Date() } });
      }
      return NextResponse.json({ updated: body.ids.length });
    }
    if (body.action === "restore" && body.ids) {
      const result = await prisma.booking.updateMany({ where: { id: { in: body.ids }, status: "CANCELLED" }, data: { deletedAt: null } });
      return NextResponse.json({ updated: result.count });
    }
    return NextResponse.json({ error: "Permanent deletion of reservation records is disabled." }, { status: 400 });
  } catch (error) { return handleRouteError(error); }
}
