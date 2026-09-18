"use client";

import Link from "next/link";
import { differenceInCalendarDays, format, formatDistanceToNow, parseISO } from "date-fns";
import {
  Ban,
  BedDouble,
  Check,
  CreditCard,
  ExternalLink,
  Mail,
  MessageSquare,
  Phone,
  Receipt,
  Send,
  Ship,
  Trash2,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { RowActions } from "@/components/admin/RowActions";
import {
  STAGE_HINTS,
  STAGE_LABELS,
  paymentMethodLabel,
  type AdminBookingDto,
  type AdminBookingStage,
} from "@/lib/admin-bookings";
import { getPermanentDeleteDate } from "@/lib/booking-retention";
import { formatPrice } from "@/lib/client-dates";
import { actionLabel, bookingActionsFor, type BookingActionKind } from "./BookingActions";

const ACTION_ICONS: Record<BookingActionKind, LucideIcon> = {
  confirm: Send,
  decline: X,
  reply: MessageSquare,
  payment: Receipt,
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

function initials(name: string) {
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

function Cell({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: React.ReactNode }) {
  return (
    <div className="bk-cell">
      <p className="bk-cell__label">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.9} aria-hidden />
        {label}
      </p>
      <div className="mt-1.5 min-w-0">{children}</div>
    </div>
  );
}

export function BookingCard({
  booking,
  viewMode,
  selected,
  onToggleSelect,
  onAction,
}: {
  booking: AdminBookingDto;
  viewMode: "active" | "bin";
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onAction: (booking: AdminBookingDto, kind: BookingActionKind) => void;
}) {
  const departure = parseISO(booking.departureTime);
  const arrival = parseISO(booking.arrivalTime);
  const nights = Math.max(1, differenceInCalendarDays(arrival, departure));
  const daysAway = differenceInCalendarDays(departure, new Date());
  const receivedAt = parseISO(booking.requestedAt ?? booking.createdAt);
  const { primary, secondary } = bookingActionsFor(booking);
  const href = `/admin/bookings/${encodeURIComponent(booking.id)}`;
  const purgeDate = booking.deletedAt ? getPermanentDeleteDate(parseISO(booking.deletedAt)) : null;

  return (
    <article className="card bk-card" data-stage={booking.stage}>
      <header className="flex items-start gap-3 px-4 pb-3 pt-4 sm:px-5">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(booking.id)}
          aria-label={`Select ${booking.guestName}`}
          className="mt-3 h-4 w-4 shrink-0 rounded border"
          style={{ accentColor: "var(--accent)" }}
        />
        <span className="bk-avatar" aria-hidden>{initials(booking.guestName)}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <Link href={href} className="truncate text-base font-semibold tracking-tight hover:underline">
              {booking.guestName}
            </Link>
            <span className="bk-code">{booking.code}</span>
          </div>
          <p className="mt-0.5 text-xs text-muted">
            <span title={format(receivedAt, "d MMM yyyy, HH:mm")}>Received {formatDistanceToNow(receivedAt, { addSuffix: true })}</span>
            {booking.country ? ` · ${booking.country}` : ""}
          </p>
        </div>
        <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
          <StagePill stage={booking.stage} />
          <span className="max-w-[16rem] text-right text-[11px] text-muted">{STAGE_HINTS[booking.stage]}</span>
        </div>
      </header>
      <div className="flex items-center gap-2 px-4 pb-3 sm:hidden">
        <StagePill stage={booking.stage} />
        <span className="text-[11px] text-muted">{STAGE_HINTS[booking.stage]}</span>
      </div>

      <div className="bk-cells">
        <Cell icon={Ship} label="Voyage">
          <p className="truncate text-sm font-medium" title={booking.cruiseName}>{booking.cruiseName}</p>
          <p className="text-sm tabular">{format(departure, "d MMM")} – {format(arrival, "d MMM yyyy")}</p>
          <p className="text-xs text-muted">
            {nights} night{nights === 1 ? "" : "s"}
            {daysAway > 0 ? ` · departs in ${daysAway} day${daysAway === 1 ? "" : "s"}` : daysAway === 0 ? " · departs today" : " · departed"}
          </p>
        </Cell>
        <Cell icon={BedDouble} label={booking.cabins.length === 1 ? "Cabin" : `${booking.cabins.length || booking.rooms.length} cabins`}>
          {booking.cabins.length > 0 ? (
            <ul className="space-y-0.5">
              {booking.cabins.slice(0, 3).map((cabin, index) => {
                const line = cabinLine(cabin);
                return (
                  <li key={index} className="text-sm">
                    <span className="font-medium">{line.name}</span>
                    <span className="text-muted"> · {line.people}</span>
                  </li>
                );
              })}
              {booking.cabins.length > 3 ? <li className="text-xs text-muted">+{booking.cabins.length - 3} more</li> : null}
            </ul>
          ) : (
            <p className="text-sm">{booking.roomTypes.join(", ") || "—"}</p>
          )}
        </Cell>
        <Cell icon={Users} label="Guest">
          <p className="text-sm">{booking.partyLabel !== "—" ? booking.partyLabel : `${booking.partySize ?? "—"} guests`}</p>
          {booking.customerEmail !== "—" ? (
            <a href={`mailto:${booking.customerEmail}`} className="flex min-w-0 items-center gap-1.5 text-xs text-muted hover:text-[var(--accent)]" title={booking.customerEmail}>
              <Mail className="h-3 w-3 shrink-0" aria-hidden />
              <span className="truncate">{booking.customerEmail}</span>
            </a>
          ) : null}
          {booking.guestPhone ? (
            <a href={`tel:${booking.guestPhone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 text-xs text-muted tabular hover:text-[var(--accent)]">
              <Phone className="h-3 w-3 shrink-0" aria-hidden />
              {booking.guestPhone}
            </a>
          ) : null}
        </Cell>
        <Cell icon={CreditCard} label={`Payment · ${paymentMethodLabel(booking.paymentMethod)}`}>
          <p className="text-lg font-semibold leading-tight tracking-tight tabular">{formatPrice(booking.totalPriceCents)}</p>
          <div className="mt-1.5">
            <PaymentMeter booking={booking} />
          </div>
        </Cell>
      </div>

      {booking.specialRequests ? (
        <p className="bk-note">
          <span className="bk-note__label">Guest note</span>
          <span className="line-clamp-2" title={booking.specialRequests}>{booking.specialRequests}</span>
        </p>
      ) : null}

      <footer className="bk-actions">
        {viewMode === "bin" ? (
          <p className="text-xs text-muted">
            In the recycle bin
            {purgeDate ? ` · removed ${formatDistanceToNow(purgeDate, { addSuffix: true })}` : ""}. Select it to restore or delete forever.
          </p>
        ) : (
          <>
            {primary.map((kind, index) => {
              const Icon = ACTION_ICONS[kind];
              const tone = kind === "decline" || kind === "cancel" ? "danger" : undefined;
              return (
                <button
                  key={kind}
                  type="button"
                  onClick={() => onAction(booking, kind)}
                  className={`${index === 0 && !tone ? "btn-primary" : "btn-outline"} h-9 px-3.5 text-[13px]`}
                  style={tone ? { color: "var(--danger)", borderColor: "color-mix(in srgb, var(--danger) 45%, var(--border))" } : undefined}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
                  {actionLabel(kind, booking)}
                </button>
              );
            })}
            <span className="flex-1" />
            <Link href={href} className="btn-ghost h-9 px-3 text-[13px]">
              <ExternalLink className="h-4 w-4" aria-hidden />
              Open
            </Link>
            {secondary.length > 0 ? (
              <RowActions
                label={`More actions for ${booking.guestName}`}
                actions={secondary.map((kind, index) => ({
                  label: actionLabel(kind, booking),
                  icon: ACTION_ICONS[kind],
                  tone: kind === "delete" || kind === "cancel" || kind === "decline" ? "danger" : "default",
                  separated: (kind === "delete" || kind === "cancel") && index > 0 && secondary[index - 1] !== "cancel",
                  onSelect: () => onAction(booking, kind),
                }))}
              />
            ) : null}
          </>
        )}
      </footer>
    </article>
  );
}
