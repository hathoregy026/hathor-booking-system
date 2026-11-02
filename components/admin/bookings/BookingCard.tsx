"use client";

import Link from "next/link";
import { useAdminAccess } from "../AdminAccessProvider";
import { canAdminBookingAction } from "@/lib/admin-booking-access";
import { differenceInCalendarDays, format, formatDistanceToNow, parseISO } from "date-fns";
import {
  Ban,
  Check,
  ChevronDown,
  ExternalLink,
  Mail,
  MessageSquare,
  Phone,
  Receipt,
  ReceiptText,
  Send,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  STAGE_LABELS,
  cancellationReasonLabel,
  paymentMethodLabel,
  type AdminBookingDto,
  type AdminBookingStage,
} from "@/lib/admin-bookings";
import { paymentPlan, stageTitle } from "@/lib/booking-code";
import { getPermanentDeleteDate } from "@/lib/booking-retention";
import { formatPrice } from "@/lib/client-dates";
import { actionLabel, bookingActionsFor, type BookingActionKind } from "./BookingActions";

const ACTION_ICONS: Record<BookingActionKind, LucideIcon> = {
  confirm: Send,
  decline: X,
  reply: MessageSquare,
  payment: Receipt,
  plan: ReceiptText,
  cancel: Ban,
  delete: Trash2,
  "send-confirmation": Check,
};

export function StagePill({ stage }: { stage: AdminBookingStage }) {
  return (
    <span className="bk-pill" data-stage={stage}>
      <span className="bk-pill__dot" aria-hidden />
      {STAGE_LABELS[stage]}
    </span>
  );
}

export function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
}

function cabinLine(cabin: AdminBookingDto["cabins"][number]) {
  const people = [
    `${cabin.adults} adult${cabin.adults === 1 ? "" : "s"}`,
    cabin.children > 0 ? `${cabin.children} child${cabin.children === 1 ? "" : "ren"}` : null,
  ].filter(Boolean).join(", ");
  return { name: cabin.type.replace(/^Luxury /, ""), people };
}

/** Paid so far against the total, with the deposit that confirms the booking marked on the bar. */
export function PaymentMeter({ booking }: { booking: AdminBookingDto }) {
  const total = Math.max(1, booking.totalPriceCents);
  const paidShare = Math.min(100, (booking.paidCents / total) * 100);
  const deposit = booking.depositCents ?? booking.totalPriceCents;
  const depositShare = Math.min(100, (deposit / total) * 100);
  return (
    <div>
      <div className="bk-meter" role="img" aria-label={`${formatPrice(booking.paidCents)} of ${formatPrice(booking.totalPriceCents)} received`}>
        <span className="bk-meter__fill" style={{ width: `${paidShare}%` }} />
        {depositShare < 100 ? <span className="bk-meter__mark" style={{ left: `${depositShare}%` }} /> : null}
      </div>
      <p className="mt-1.5 text-xs text-muted tabular">
        {booking.paidCents > 0 ? `${formatPrice(booking.paidCents)} received` : "Nothing received yet"}
        {booking.paidCents < deposit ? ` · deposit ${formatPrice(deposit)}` : booking.paidCents < booking.totalPriceCents ? ` · balance ${formatPrice(booking.totalPriceCents - booking.paidCents)}` : ""}
      </p>
    </div>
  );
}

/** "23 – 26 Dec 2026", "28 Nov – 5 Dec 2026", or across a new year in full. */
export function voyageDates(departureTime: string, arrivalTime: string) {
  const departure = parseISO(departureTime);
  const arrival = parseISO(arrivalTime);
  if (departure.getFullYear() !== arrival.getFullYear()) return `${format(departure, "d MMM yyyy")} – ${format(arrival, "d MMM yyyy")}`;
  if (departure.getMonth() !== arrival.getMonth()) return `${format(departure, "d MMM")} – ${format(arrival, "d MMM yyyy")}`;
  return `${format(departure, "d")} – ${format(arrival, "d MMM yyyy")}`;
}

export function voyageTiming(departureTime: string, arrivalTime: string) {
  const departure = parseISO(departureTime);
  const nights = Math.max(1, differenceInCalendarDays(parseISO(arrivalTime), departure));
  const daysAway = differenceInCalendarDays(departure, new Date());
  const when = daysAway > 0 ? `in ${daysAway} day${daysAway === 1 ? "" : "s"}` : daysAway === 0 ? "today" : "departed";
  return `${nights} night${nights === 1 ? "" : "s"} · ${when}`;
}

/** What the team needs to know about this booking's money, in one line. */
function moneyLine(booking: AdminBookingDto): { text: string; tone?: "warn" | "good" } {
  if (booking.stage === "declined" || booking.stage === "cancelled") {
    const fee = booking.cancellationFeeCents ?? 0;
    const refundDue = Math.max(0, booking.paidCents - fee);
    const feeText = fee > 0 ? `Fee ${formatPrice(fee)}` : "No fee";
    return refundDue > 0 ? { text: `${feeText} · refund due ${formatPrice(refundDue)}`, tone: "warn" } : { text: feeText };
  }
  if (booking.stage === "hold") return { text: "Nothing sent yet" };
  if (booking.stage === "expired") return { text: "Never became a request" };
  if (booking.totalPriceCents > 0 && booking.paidCents >= booking.totalPriceCents) return { text: "Paid in full", tone: "good" };
  const due = paymentPlan(booking.paymentSchedule, booking.paidCents).find(stage => stage.state === "due");
  if (!due) return { text: `${formatPrice(booking.totalPriceCents - booking.paidCents)} to pay` };
  const amount = formatPrice(due.cumulativeCents - booking.paidCents);
  if (!due.dueAt) return { text: `${amount} with the invoice` };
  const dueDay = parseISO(due.dueAt);
  if (differenceInCalendarDays(dueDay, new Date()) < 0) return { text: `${amount} overdue · was due ${format(dueDay, "d MMM")}`, tone: "warn" };
  return { text: `${amount} by ${format(dueDay, "d MMM")}` };
}

/** One piece per payment, filled as money arrives. */
function PlanPieces({ booking }: { booking: AdminBookingDto }) {
  const plan = paymentPlan(booking.paymentSchedule, booking.paidCents);
  if (plan.length === 0 || booking.stage === "declined" || booking.stage === "cancelled") return null;
  return (
    <div className="bk-pieces" role="img" aria-label={`${formatPrice(booking.paidCents)} of ${formatPrice(booking.totalPriceCents)} received`}>
      {plan.map(stage => {
        const covered = Math.max(0, Math.min(stage.amountCents, booking.paidCents - (stage.cumulativeCents - stage.amountCents)));
        const late = stage.state !== "paid" && stage.dueAt !== null && differenceInCalendarDays(parseISO(stage.dueAt), new Date()) < 0;
        return (
          <span key={stage.milestone} className="bk-piece" data-late={late ? "true" : undefined} style={{ flexGrow: Math.max(1, stage.amountCents) }}>
            <i style={{ width: `${stage.amountCents > 0 ? (covered / stage.amountCents) * 100 : 0}%` }} />
          </span>
        );
      })}
    </div>
  );
}

function ActionButton({ kind, booking, primary, onAction }: { kind: BookingActionKind; booking: AdminBookingDto; primary?: boolean; onAction: (booking: AdminBookingDto, kind: BookingActionKind) => void }) {
  const Icon = ACTION_ICONS[kind];
  const danger = kind === "decline" || kind === "cancel" || kind === "delete";
  return (
    <button
      type="button"
      onClick={() => onAction(booking, kind)}
      className={`${primary && !danger ? "btn-primary" : "btn-outline"} h-9 px-3 text-[13px]`}
      style={danger ? { color: "var(--danger)", borderColor: "color-mix(in srgb, var(--danger) 45%, var(--border))" } : undefined}
    >
      <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
      {actionLabel(kind, booking)}
    </button>
  );
}

export function BookingRow({
  booking,
  viewMode,
  selected,
  expanded,
  onToggleExpanded,
  onToggleSelect,
  onAction,
}: {
  booking: AdminBookingDto;
  viewMode: "active" | "bin";
  selected: boolean;
  expanded: boolean;
  onToggleExpanded: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onAction: (booking: AdminBookingDto, kind: BookingActionKind) => void;
}) {
  const receivedAt = parseISO(booking.requestedAt ?? booking.createdAt);
  const access = useAdminAccess();
  const available = bookingActionsFor(booking);
  const primary = available.primary.filter(kind => canAdminBookingAction(access, kind));
  const secondary = available.secondary.filter(kind => canAdminBookingAction(access, kind));
  const href = `/admin/bookings/${encodeURIComponent(booking.id)}`;
  const purgeDate = booking.deletedAt ? getPermanentDeleteDate(parseISO(booking.deletedAt)) : null;
  const money = moneyLine(booking);
  const plan = paymentPlan(booking.paymentSchedule, booking.paidCents);
  const cabins = booking.cabins.map(cabinLine);
  const firstCabin = cabins[0];
  const closed = booking.stage === "declined" || booking.stage === "cancelled";
  // A refund still owed is the next thing to do on a cancelled booking.
  const refundOwed = closed && booking.paidCents > (booking.cancellationFeeCents ?? 0) && secondary.includes("payment");
  const lead = refundOwed ? "payment" : primary[0];

  return (
    <article className="bk-entry" data-stage={booking.stage} data-open={expanded ? "true" : undefined}>
      <div className="bk-row">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(booking.id)}
          aria-label={`Select ${booking.guestName}`}
          className="h-4 w-4 rounded border"
          style={{ accentColor: "var(--accent)" }}
        />
        <div className="bk-row__guest">
          <span className="bk-avatar" aria-hidden>{initials(booking.guestName)}</span>
          <div className="min-w-0">
            <Link href={href} className="block truncate font-semibold hover:underline">{booking.guestName}</Link>
            <p className="truncate text-xs text-muted">{booking.code}{booking.country ? ` · ${booking.country}` : ""}</p>
          </div>
        </div>
        <div className="bk-row__cell">
          <p className="truncate font-medium tabular">{voyageDates(booking.departureTime, booking.arrivalTime)}</p>
          <p className="truncate text-xs text-muted" title={booking.cruiseName}>{voyageTiming(booking.departureTime, booking.arrivalTime)}</p>
        </div>
        <div className="bk-row__cell">
          <p className="truncate font-medium">{firstCabin ? firstCabin.name : booking.roomTypes.join(", ") || "—"}{cabins.length > 1 ? ` +${cabins.length - 1}` : ""}</p>
          <p className="truncate text-xs text-muted">{booking.partyLabel !== "—" ? booking.partyLabel : `${booking.partySize ?? "—"} guests`}</p>
        </div>
        <div className="bk-row__cell">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold tabular">{formatPrice(booking.totalPriceCents)}</span>
            <span className="truncate text-[11.5px] text-muted">{paymentMethodLabel(booking.paymentMethod)}</span>
            {booking.planCustomised && !closed ? <span className="bk-tag">Custom plan</span> : null}
          </div>
          <PlanPieces booking={booking} />
          <p className="bk-row__money truncate text-xs tabular" data-tone={money.tone}>{money.text}</p>
        </div>
        <div className="bk-row__actions">
          {viewMode === "active" && lead ? <ActionButton kind={lead} booking={booking} primary onAction={onAction} /> : <span />}
          <button
            type="button"
            className="bk-row__toggle"
            aria-expanded={expanded}
            aria-label={`${expanded ? "Hide" : "Show"} details for ${booking.guestName}`}
            onClick={() => onToggleExpanded(booking.id)}
          >
            <ChevronDown className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="bk-more">
          <div className="bk-more__grid">
            <div>
              <p className="bk-more__label">Guest</p>
              <div className="bk-more__info">
                {booking.customerEmail !== "—" ? (
                  <a href={`mailto:${booking.customerEmail}`} className="flex min-w-0 items-center gap-1.5 hover:text-[var(--accent)]">
                    <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span className="truncate">{booking.customerEmail}</span>
                  </a>
                ) : null}
                {booking.guestPhone ? (
                  <a href={`tel:${booking.guestPhone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 tabular hover:text-[var(--accent)]">
                    <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {booking.guestPhone}
                  </a>
                ) : null}
                <span title={format(receivedAt, "d MMM yyyy, HH:mm")}>Received {formatDistanceToNow(receivedAt, { addSuffix: true })}</span>
                {closed ? <span>{cancellationReasonLabel(booking.cancellationReason)}</span> : null}
              </div>
              {booking.specialRequests ? <p className="bk-more__note"><strong>Guest note:</strong> {booking.specialRequests}</p> : null}
            </div>
            <div>
              <p className="bk-more__label">Voyage</p>
              <div className="bk-more__info">
                <strong>{booking.cruiseName}</strong>
                <span>{voyageDates(booking.departureTime, booking.arrivalTime)}</span>
                {cabins.map((cabin, index) => <span key={index}>{cabin.name} · {cabin.people}</span>)}
              </div>
            </div>
            <div>
              <div className="bk-more__head">
                <p className="bk-more__label">Payment plan</p>
                {viewMode === "active" && canAdminBookingAction(access, "plan") && available.secondary.includes("plan") ? (
                  <button type="button" className="btn-outline h-8 px-2.5 text-xs" onClick={() => onAction(booking, "plan")}>Edit plan</button>
                ) : null}
              </div>
              {booking.cardSurchargeCents > 0 ? <p className="mb-1 text-xs text-muted tabular">Includes {formatPrice(booking.cardSurchargeCents)} card surcharge</p> : null}
              {plan.length > 0 ? (
                <ol>
                  {plan.map(stage => {
                    const late = stage.state !== "paid" && stage.dueAt !== null && differenceInCalendarDays(parseISO(stage.dueAt), new Date()) < 0;
                    return (
                      <li key={stage.milestone} className="bk-ledger">
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{stageTitle(stage.milestone, plan.length)}</span>
                          <span className="block text-xs text-muted">
                            {stage.state === "paid" ? "Received" : stage.dueAt ? `${late ? "Was due" : "By"} ${format(parseISO(stage.dueAt), "d MMM yyyy")}` : "With the invoice"}
                          </span>
                        </span>
                        <span className="tabular">{formatPrice(stage.amountCents)}</span>
                        <span className="bk-chip" data-state={stage.state === "paid" ? "paid" : late ? "late" : undefined}>
                          {stage.state === "paid" ? "Paid" : late ? "Overdue" : "To pay"}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <p className="text-sm text-muted">No payment plan on this booking.</p>
              )}
            </div>
          </div>
          <footer className="bk-more__actions">
            {viewMode === "bin" ? (
              <p className="text-xs text-muted">
                In the recycle bin
                {purgeDate ? ` · removed ${formatDistanceToNow(purgeDate, { addSuffix: true })}` : ""}. Select it to restore or delete forever.
              </p>
            ) : (
              <>
                {[...primary, ...secondary].filter(kind => kind !== lead && kind !== "plan").map(kind => (
                  <ActionButton key={kind} kind={kind} booking={booking} onAction={onAction} />
                ))}
                <Link href={href} className="btn-ghost h-9 px-3 text-[13px]">
                  <ExternalLink className="h-4 w-4" aria-hidden />
                  Open
                </Link>
              </>
            )}
          </footer>
        </div>
      ) : null}
    </article>
  );
}
