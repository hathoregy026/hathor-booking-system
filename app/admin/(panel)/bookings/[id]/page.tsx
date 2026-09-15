import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { reservationInclude, paymentSchedule, netPaid } from "@/lib/booking-engine";
import { ReservationOperations } from "@/components/admin/ReservationOperations";
import { formatPrice } from "@/lib/client-dates";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{id:string}> }) {
 if (!verifySessionToken((await cookies()).get(ADMIN_SESSION_COOKIE)?.value)) redirect("/admin/login");
 const {id}=await params;
 const b=await prisma.booking.findUnique({where:{id},include:reservationInclude}); if(!b) notFound();
 const paid=netPaid(b.payments); const required=paymentSchedule(b.totalPriceCents!,b.cruiseSchedule.departureTime).requiredCents;
 return <main className="space-y-5 p-6"><Link href="/admin/bookings">Back to reservations</Link><h1>Reservation {b.id}</h1>
 <p>{b.customerName} · {b.customerEmail} · {b.customerPhone}</p><p>{b.status} · {b.acceptedAt ? "Accepted by Hathor" : "Not yet accepted"}</p>
 <p>{b.cruiseSchedule.cruise.name} · {b.cruiseSchedule.departureTime.toISOString().slice(0,10)} — {b.cruiseSchedule.arrivalTime.toISOString().slice(0,10)}</p>
 {b.bookingRooms.map(r=><p key={r.id}>Room {r.roomIndex+1}: {r.room.roomNumber} · {r.room.roomType} · {r.adults} adults / {r.children} children</p>)}
 <p>Preferred method: {b.paymentMethod ?? "Not selected"}</p><p>Total {formatPrice(b.totalPriceCents!)} · Received {formatPrice(paid)} · Balance {formatPrice(b.totalPriceCents!-paid)} · Required for confirmation {formatPrice(required)}</p>
 <p>Request email: {b.guestEmailStatus} · Team notification: {b.adminEmailStatus}</p>
 {b.payments.map(p=><p key={p.id}>{p.kind} · {p.method} · {formatPrice(p.amountCents)} · {p.reference}</p>)}
 <ReservationOperations id={id} status={b.status} />
 </main>;
}
