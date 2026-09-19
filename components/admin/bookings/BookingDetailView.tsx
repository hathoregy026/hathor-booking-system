"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { ArrowLeft, BedDouble, CreditCard, Mail, MailCheck, Phone, Ship, User } from "lucide-react";
import { RowActions } from "@/components/admin/RowActions";
import {
  STAGE_HINTS,
  paymentMethodLabel,
  type AdminBookingDto,
} from "@/lib/admin-bookings";
import { stageTitle, type PaymentPlanStage } from "@/lib/booking-code";
import { formatPrice } from "@/lib/client-dates";
import { BookingActionDialog, actionLabel, bookingActionsFor, type BookingActionKind } from "./BookingActions";
import { PaymentMeter, StagePill } from "./BookingCard";

type Passenger = { id: string; roomIndex: number; fullName: string; isChild: boolean };
type Payment = { id: string; kind: string; method: string; amountCents: number; reference: string; receivedAt: string };

/** Hathor works on Cairo time; a fixed zone also keeps the server and browser renders identical. */
const CAIRO_TIME = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Cairo",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const when = (iso: string | null) => (iso ? CAIRO_TIME.format(new Date(iso)) : null);

function Panel({ title, icon: Icon, children, aside }: { title: string; icon: typeof Ship; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="card overflow-hidden">
      <header className="flex items-center justify-between gap-3 border-b px-5 py-3.5" style={{ borderColor: "var(--border)" }}>
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <Icon className="h-4 w-4 text-muted" strokeWidth={1.9} aria-hidden />
          {title}
        </h2>
        {aside}
      </header>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 text-sm">
      <span className="shrink-0 text-muted">{label}</span>
      <span className="min-w-0 text-right font-medium">{children}</span>
    </div>
  );
}

function EmailState({ status }: { status: string }) {
  const tone = status === "SENT" ? "var(--success)" : status === "FAILED" ? "var(--danger)" : "var(--text-muted)";
  const label = status === "SENT" ? "Sent" : status === "FAILED" ? "Failed" : "Pending";
  return <span style={{ color: tone }}>{label}</span>;
}

/** Request → invoice → deposit → paid in full, with where this booking stopped if it did. */
function Progress({ booking }: { booking: AdminBookingDto }) {
  const stopped = booking.stage === "declined" || booking.stage === "cancelled";
  const fullyPaid = booking.totalPriceCents > 0 && booking.paidCents >= booking.totalPriceCents;
  const steps = [
    { label: "Request received", detail: when(booking.requestedAt) ?? "Guest still at checkout", done: Boolean(booking.requestedAt) },
    { label: "Invoice sent", detail: when(booking.acceptedAt) ?? "Confirm to send it", done: Boolean(booking.acceptedAt) },
    { label: "Deposit · confirmed", detail: when(booking.confirmedAt) ?? "Record the deposit when it arrives", done: Boolean(booking.confirmedAt) },
    { label: "Paid in full", detail: fullyPaid ? "Balance settled" : `${formatPrice(Math.max(0, booking.totalPriceCents - booking.paidCents))} to go`, done: fullyPaid },
  ];
  const firstOpen = steps.findIndex((step) => !step.done);
  return (
    <ol className="bk-steps">
      {steps.map((step, index) => {
        const state = step.done ? "done" : index === firstOpen ? (stopped ? "stopped" : "now") : "next";
        return (
          <li key={step.label} className="bk-step" data-state={state}>
            <strong>{state === "stopped" ? (booking.stage === "declined" ? "Declined" : "Cancelled") : step.label}</strong>
            <span className="block truncate">{state === "stopped" ? when(booking.cancelledAt) ?? "" : step.detail}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function BookingDetailView({
  booking,
  passengers,
  payments,
  plan,
  cancellationFeeCents,
  marketingOptIn,
}: {
  booking: AdminBookingDto;
  passengers: Passenger[];
  payments: Payment[];
  plan: PaymentPlanStage[];
  cancellationFeeCents: number | null;
  marketingOptIn: boolean;
}) {
  const router = useRouter();
  const [dialog, setDialog] = useState<BookingActionKind | null>(null);
  const { primary, secondary } = bookingActionsFor(booking);
  const departure = parseISO(booking.departureTime);
  const arrival = parseISO(booking.arrivalTime);
  const nights = Math.max(1, differenceInCalendarDays(arrival, departure));
  const daysAway = differenceInCalendarDays(departure, new Date());
  const inBin = Boolean(booking.deletedAt);

  return (
    <div className="space-y-5" data-stage={booking.stage}>
      <Link href="/admin/bookings" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-[var(--accent)]">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        All bookings
      </Link>

      <section className="card bk-card" data-stage={booking.stage}>
        <div className="flex flex-col gap-4 px-5 pb-5 pt-5 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3.5">
            <span className="bk-avatar" style={{ width: "3rem", height: "3rem", fontSize: "0.95rem" }} aria-hidden>
              {booking.guestName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("")}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="admin-page-title" style={{ margin: 0 }}>{booking.guestName}</h1>
                <span className="bk-code">{booking.code}</span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <StagePill stage={booking.stage} />
                <span className="text-sm text-muted">{inBin ? "In the recycle bin" : STAGE_HINTS[booking.stage]}</span>
              </div>
            </div>
          </div>
          {!inBin ? (
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              {primary.map((kind, index) => {
                const danger = kind === "decline" || kind === "cancel";
                return (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => setDialog(kind)}
                    className={`${index === 0 && !danger ? "btn-primary" : "btn-outline"} h-10 px-4 text-sm`}
                    style={danger ? { color: "var(--danger)", borderColor: "color-mix(in srgb, var(--danger) 45%, var(--border))" } : undefined}
                  >
                    {actionLabel(kind, booking)}
                  </button>
                );
              })}
              {secondary.length > 0 ? (
                <RowActions
                  label="More actions"
                  actions={secondary.map((kind) => ({
                    label: actionLabel(kind, booking),
                    tone: kind === "delete" || kind === "cancel" || kind === "decline" ? "danger" : "default",
                    separated: kind === "delete",
                    onSelect: () => setDialog(kind),
                  }))}
                />
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="border-t px-5 py-4 sm:px-6" style={{ borderColor: "var(--border)" }}>
          <Progress booking={booking} />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Panel title="Voyage" icon={Ship}>
            <p className="text-base font-semibold">{booking.cruiseName}</p>
            <p className="mt-0.5 text-sm tabular">
              {format(departure, "EEEE d MMMM")} – {format(arrival, "EEEE d MMMM yyyy")}
            </p>
            <p className="mt-0.5 text-sm text-muted">
              {nights} night{nights === 1 ? "" : "s"}
              {daysAway > 0 ? ` · departs in ${daysAway} day${daysAway === 1 ? "" : "s"}` : daysAway === 0 ? " · departs today" : " · departed"}
            </p>
          </Panel>

          <Panel title={`Cabins & passengers · ${booking.partyLabel}`} icon={BedDouble}>
            <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
              {booking.cabins.map((cabin, index) => {
                const names = passengers.filter((passenger) => passenger.roomIndex === index);
                return (
                  <li key={index} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between" style={{ borderColor: "var(--border)" }}>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">
                        Cabin {index + 1} · {cabin.type}
                      </p>
                      <p className="text-xs text-muted">
                        {cabin.adults} adult{cabin.adults === 1 ? "" : "s"}
                        {cabin.children > 0 ? `, ${cabin.children} child${cabin.children === 1 ? "" : "ren"}` : ""}
                      </p>
                      {names.length > 0 ? (
                        <ul className="mt-2 flex flex-wrap gap-1.5">
                          {names.map((passenger) => (
                            <li key={passenger.id} className="bk-code" style={{ fontFamily: "inherit", letterSpacing: 0, fontWeight: 500 }}>
                              {passenger.fullName}
                              {passenger.isChild ? <span className="text-muted"> · child</span> : null}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular">{formatPrice(cabin.unitPriceCents)}</span>
                  </li>
                );
              })}
            </ul>
          </Panel>

          {booking.specialRequests ? (
            <Panel title="Guest note" icon={User}>
              <p className="whitespace-pre-line text-sm leading-relaxed">{booking.specialRequests}</p>
            </Panel>
          ) : null}
        </div>

        <div className="space-y-5">
          <Panel title="Guest" icon={User}>
            <Row label="Name">{booking.guestName}</Row>
            <Row label="Email">
              {booking.customerEmail !== "—" ? (
                <a href={`mailto:${booking.customerEmail}`} className="break-all hover:text-[var(--accent)]">
                  <Mail className="mr-1 inline h-3.5 w-3.5 align-[-2px]" aria-hidden />
                  {booking.customerEmail}
                </a>
              ) : "—"}
            </Row>
            <Row label="Phone">
              {booking.guestPhone ? (
                <a href={`tel:${booking.guestPhone.replace(/\s/g, "")}`} className="tabular hover:text-[var(--accent)]">
                  <Phone className="mr-1 inline h-3.5 w-3.5 align-[-2px]" aria-hidden />
                  {booking.guestPhone}
                </a>
              ) : "—"}
            </Row>
            <Row label="Country">{booking.country ?? "—"}</Row>
            <Row label="Marketing emails">{marketingOptIn ? "Yes" : "No"}</Row>
          </Panel>

          <Panel title="Payment" icon={CreditCard} aside={<span className="text-xs text-muted">{paymentMethodLabel(booking.paymentMethod)}</span>}>
            <p className="text-2xl font-semibold tracking-tight tabular">{formatPrice(booking.totalPriceCents)}</p>
            <div className="mt-2">
              <PaymentMeter booking={booking} />
            </div>
            {plan.length > 0 ? (
              <ol className="mt-4 space-y-2">
                {plan.map((stage) => (
                  <li
                    key={stage.milestone}
                    className="flex items-start justify-between gap-3 rounded-lg px-3 py-2 text-sm"
                    style={{ background: stage.state === "due" ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "var(--bg-secondary)" }}
                  >
                    <span className="min-w-0">
                      <span className="block font-medium">
                        {stageTitle(stage.milestone, plan.length)}
                        {booking.totalPriceCents > 0 ? ` · ${Math.round((stage.amountCents / booking.totalPriceCents) * 100)}%` : ""}
                      </span>
                      <span className="block text-xs text-muted">
                        {stage.dueAt ? `By ${format(parseISO(stage.dueAt), "d MMM yyyy")}` : "With the invoice"}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block font-semibold tabular">{formatPrice(stage.amountCents)}</span>
                      <span
                        className="block text-[11px] font-semibold uppercase tracking-wider"
                        style={{ color: stage.state === "paid" ? "var(--success)" : stage.state === "due" ? "var(--accent)" : "var(--text-muted)" }}
                      >
                        {stage.state === "paid" ? "Received" : stage.state === "due" ? "Due now" : "Upcoming"}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            ) : null}
            {cancellationFeeCents !== null && booking.status === "CANCELLED" ? (
              <Row label="Cancellation fee">{formatPrice(cancellationFeeCents)}</Row>
            ) : null}
            <div className="mt-4 border-t pt-3" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Recorded payments</p>
              {payments.length === 0 ? (
                <p className="mt-1.5 text-sm text-muted">None yet.</p>
              ) : (
                <ul className="mt-1.5 space-y-1.5">
                  {payments.map((payment) => (
                    <li key={payment.id} className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{payment.reference}</span>
                        <span className="block text-xs text-muted">
                          {paymentMethodLabel(payment.method)} · {format(parseISO(payment.receivedAt), "d MMM yyyy")}
                        </span>
                      </span>
                      <span className="shrink-0 font-semibold tabular" style={{ color: payment.kind === "REFUND" ? "var(--danger)" : undefined }}>
                        {payment.kind === "REFUND" ? "−" : ""}
                        {formatPrice(payment.amountCents)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Panel>

          <Panel title="Emails" icon={MailCheck}>
            <Row label="Request copy to guest"><EmailState status={booking.guestEmailStatus} /></Row>
            <Row label="Alert to your team"><EmailState status={booking.adminEmailStatus} /></Row>
            <p className="mt-2 text-xs text-muted">Invoices, confirmations and replies show their result as soon as you send them.</p>
          </Panel>
        </div>
      </div>

      {dialog ? (
        <BookingActionDialog
          booking={booking}
          kind={dialog}
          onClose={() => setDialog(null)}
          onDone={(_, removed) => {
            if (removed) router.push("/admin/bookings");
            else router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}
