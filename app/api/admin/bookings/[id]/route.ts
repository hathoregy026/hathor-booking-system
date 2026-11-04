import { adminApiGuard } from "@/lib/admin-server-auth";
import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api";
import { applyStaffBookingAction, assertBookingAdmin } from "@/lib/booking-admin-api";
import { readPublicJsonBody } from "@/lib/public-api-security";
import { fetchAdminBookingById } from "@/lib/admin-bookings-fetch";
import { bookingQuery } from "@/lib/booking-database";
import { bookingCode } from "@/lib/booking-code";

type GuestRow = {
  id: string; status: string; firstName: string | null; lastName: string | null; customerName: string | null;
  customerEmail: string | null; customerPhone: string | null; country: string | null; specialRequests: string | null;
  adultCount: number | null; childCount: number | null; departureTime: Date; arrivalTime: Date; cruiseName: string;
};

/** The guest on one booking, for the details dialog on Availability. */
export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const denied = await adminApiGuard("bookings.view");
  if (denied) return denied;
  try {
    const { id } = await context.params;
    const [row] = await bookingQuery<GuestRow>(`
      SELECT b.id, b.status, b."firstName", b."lastName", b."customerName", b."customerEmail", b."customerPhone", b.country,
             b."specialRequests", b."adultCount", b."childCount", cs."departureTime", cs."arrivalTime", c.name AS "cruiseName"
        FROM "Booking" b
        JOIN "CruiseSchedule" cs ON cs.id = b."cruiseScheduleId"
        JOIN "Cruise" c ON c.id = cs."cruiseId"
       WHERE b.id = $1 AND b."deletedAt" IS NULL`, [id]);
    if (!row) return NextResponse.json({ error: "Booking not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
    return NextResponse.json({
      guest: {
        id: row.id, code: bookingCode(row.id), status: row.status,
        firstName: row.firstName ?? "", lastName: row.lastName ?? "", name: row.customerName ?? "",
        email: row.customerEmail ?? "", phone: row.customerPhone ?? "", country: row.country ?? "",
        specialRequests: row.specialRequests ?? "", adults: row.adultCount, children: row.childCount,
        departure: row.departureTime.toISOString(), arrival: row.arrivalTime.toISOString(), cruiseName: row.cruiseName,
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return handleRouteError(error); }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const denied = await adminApiGuard("bookings.view");
  if (denied) return denied;
  try {
    const admin = await assertBookingAdmin(request);
    const { id } = await context.params;
    const result = await applyStaffBookingAction(id, await readPublicJsonBody(request), admin.sessionId, {}, admin);
    const booking = await fetchAdminBookingById(id);
    return NextResponse.json({ booking, email: result.email ?? null });
  } catch (error) { return handleRouteError(error); }
}
