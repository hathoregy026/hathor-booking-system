"use client";

import type { ReactNode } from "react";
import { differenceInDays, format, formatDistanceToNow, parseISO } from "date-fns";
import { Check, Loader2, Phone, Users, X } from "lucide-react";
import { BookingStatus } from "@/app/generated/prisma/enums";
import { ActionButton } from "@/components/admin/ActionButton";
import { StatusBadge } from "@/components/admin/DataTable";
import type { AdminBookingDto } from "@/lib/admin-bookings";
import { isPendingBookingStatus } from "@/lib/admin-bookings";
import { getPermanentDeleteDate } from "@/lib/booking-retention";
import { formatPrice } from "@/lib/client-dates";

type BookingsListViewProps = {
  bookings: AdminBookingDto[];
  viewMode: "active" | "bin";
  statusFilter: string;
  isLoading: boolean;
  loadFailed: boolean;
  selectedIds: Set<string>;
  updatingId: string | null;
  allSelected: boolean;
  tableTitle: string;
  tableDescription: string;
  onToggleSelectAll: () => void;
  onToggleSelect: (id: string) => void;
  onRetry: () => void;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
};

function getInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

function getTripDays(departure: string, arrival: string) {
  const days = differenceInDays(parseISO(arrival), parseISO(departure));
  return Math.max(1, days);
}

function IconButton({
  label,
  onClick,
  disabled,
  tone = "default",
  children,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  tone?: "default" | "success" | "danger";
  children: ReactNode;
}) {
  const tones = {
    default: "text-muted hover:bg-[var(--bg-glass-hover)] hover:text-[var(--text-primary)]",
    success: "hover:opacity-90",
    danger: "hover:opacity-90",
  };
  const color =
    tone === "success"
      ? "var(--success)"
      : tone === "danger"
        ? "var(--danger)"
        : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-50 ${tones[tone]}`}
      style={color ? { color } : undefined}
    >
      {children}
    </button>
  );
}

function BookingMobileCard({
  booking,
  viewMode,
  selected,
  isUpdating,
  onToggleSelect,
  onConfirm,
  onCancel,
}: {
  booking: AdminBookingDto;
  viewMode: "active" | "bin";
  selected: boolean;
  isUpdating: boolean;
  onToggleSelect: (id: string) => void;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  const purgeDate = booking.deletedAt
    ? getPermanentDeleteDate(parseISO(booking.deletedAt))
    : null;
  const canConfirm = isPendingBookingStatus(booking.status);
  const canCancel =
    isPendingBookingStatus(booking.status) ||
    booking.status === BookingStatus.CONFIRMED;

  return (
    <li className="p-4">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(booking.id)}
          aria-label={`Select ${booking.guestName}`}
          className="mt-1 h-5 w-5 shrink-0 rounded border"
          style={{ accentColor: "var(--accent)" }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-medium">{booking.guestName}</p>
              <p className="truncate text-xs text-muted">
                {booking.cruiseName}
                {booking.customerEmail !== "—" ? ` · ${booking.customerEmail}` : ""}
              </p>
            </div>
            <StatusBadge status={booking.status} />
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center gap-1.5 text-muted">
              <Phone className="h-3.5 w-3.5 shrink-0" strokeWidth={1.9} />
              <dd className="tabular truncate">{booking.guestPhone ?? "—"}</dd>
            </div>
            <div className="flex items-center gap-1.5 text-muted">
              <Users className="h-3.5 w-3.5 shrink-0" strokeWidth={1.9} />
              <dd className="tabular truncate">
                {booking.partySize != null
                  ? `${booking.partySize} guests`
                  : booking.partyLabel}
              </dd>
            </div>
            <div className="col-span-2 text-muted">
              <dt className="sr-only">Dates</dt>
              <dd>
                {format(parseISO(booking.departureTime), "MMM d")} –{" "}
                {format(parseISO(booking.arrivalTime), "MMM d, yyyy")}
              </dd>
            </div>
            {booking.specialRequests && (
              <div className="col-span-2 text-sm">
                <dt className="text-xs text-muted">Special requests</dt>
                <dd className="mt-0.5">{booking.specialRequests}</dd>
              </div>
            )}
            {viewMode === "bin" && purgeDate && (
              <div className="col-span-2 text-xs text-muted">
                Deletes {formatDistanceToNow(purgeDate, { addSuffix: true })}
              </div>
            )}
          </dl>

          {viewMode === "active" && (canConfirm || canCancel) && (
            <div className="mt-3 flex items-center gap-2">
              {canConfirm && (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onConfirm(booking.id)}
                  className="btn-primary h-9 flex-1 text-xs disabled:opacity-60"
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4" strokeWidth={2.2} />
                      Confirm
                    </>
                  )}
                </button>
              )}
              {canCancel && (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onCancel(booking.id)}
                  className="btn-outline h-9 flex-1 text-xs disabled:opacity-60"
                  style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export function BookingsListView({
  bookings,
  viewMode,
  statusFilter,
  isLoading,
  loadFailed,
  selectedIds,
  updatingId,
  allSelected,
  tableTitle,
  tableDescription,
  onToggleSelectAll,
  onToggleSelect,
  onRetry,
  onConfirm,
  onCancel,
}: BookingsListViewProps) {
  return (
    <section className="card overflow-hidden">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight">{tableTitle}</h2>
          <p className="mt-0.5 text-sm text-muted">{tableDescription}</p>
        </div>
        {!isLoading && bookings.length > 0 ? (
          <button
            type="button"
            onClick={onToggleSelectAll}
            className="btn-outline h-9 px-3 text-sm"
          >
            {allSelected ? "Deselect all" : "Select all"}
          </button>
        ) : null}
      </div>

      {isLoading ? (
        <div className="space-y-3 border-t px-4 py-6" style={{ borderColor: "var(--border)" }}>
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-10 animate-pulse rounded-lg"
              style={{ background: "var(--border)", opacity: 0.4 }}
            />
          ))}
        </div>
      ) : loadFailed ? (
        <div className="flex flex-col items-center gap-3 border-t px-4 py-16 text-center" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm text-muted">
            Could not load bookings. The database connection may have timed out.
          </p>
          <ActionButton onClick={onRetry} className="w-full px-4 py-3 text-sm sm:w-auto">
            Try again
          </ActionButton>
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 border-t px-4 py-16 text-center" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm font-medium">No bookings found</p>
          <p className="text-sm text-muted">
            {viewMode === "bin"
              ? "Recycle bin is empty."
              : statusFilter === "all"
                ? "No bookings yet. They will appear here once customers start booking."
                : `No ${statusFilter} bookings. Try the All or Expired filter.`}
          </p>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-[var(--border)] border-t border-[var(--border)] lg:hidden">
            {bookings.map((booking) => (
              <BookingMobileCard
                key={booking.id}
                booking={booking}
                viewMode={viewMode}
                selected={selectedIds.has(booking.id)}
                isUpdating={updatingId === booking.id}
                onToggleSelect={onToggleSelect}
                onConfirm={onConfirm}
                onCancel={onCancel}
              />
            ))}
          </ul>

          <div className="admin-table-scroll hidden lg:block">
            <table className="admin-table-sticky w-full text-sm">
              <thead>
                <tr
                  className="border-y text-left"
                  style={{
                    borderColor: "var(--border)",
                    background: "color-mix(in srgb, var(--border) 35%, transparent)",
                  }}
                >
                  <th className="w-10 px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={onToggleSelectAll}
                      disabled={bookings.length === 0}
                      aria-label="Select all bookings"
                      className="h-4 w-4 rounded border"
                      style={{ accentColor: "var(--accent)" }}
                    />
                  </th>
                  {[
                    "Guest name",
                    "Email",
                    "Phone",
                    "Party size",
                    "Special requests",
                    "Date",
                    "Status",
                    viewMode === "bin" ? "Deletes in" : null,
                    viewMode === "active" ? "Actions" : null,
                  ]
                    .filter((heading): heading is string => Boolean(heading))
                    .map((heading) => (
                      <th
                        key={heading}
                        className={`whitespace-nowrap px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted ${
                          heading === "Actions" ? "text-right" : ""
                        }`}
                      >
                        {heading}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {bookings.map((booking) => {
                  const purgeDate = booking.deletedAt
                    ? getPermanentDeleteDate(parseISO(booking.deletedAt))
                    : null;
                  const isUpdating = updatingId === booking.id;
                  const canConfirm = isPendingBookingStatus(booking.status);
                  const canCancel =
                    isPendingBookingStatus(booking.status) ||
                    booking.status === BookingStatus.CONFIRMED;
                  const tripDays = getTripDays(
                    booking.departureTime,
                    booking.arrivalTime,
                  );

                  return (
                    <tr
                      key={booking.id}
                      className="group transition-colors hover:bg-[var(--bg-glass-hover)]"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(booking.id)}
                          onChange={() => onToggleSelect(booking.id)}
                          aria-label={`Select ${booking.guestName}`}
                          className="h-4 w-4 rounded border"
                          style={{ accentColor: "var(--accent)" }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex min-w-[200px] items-center gap-3">
                          <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                            style={{
                              background: "hsl(var(--gold-100))",
                              color: "hsl(var(--gold-700))",
                            }}
                          >
                            {getInitials(booking.guestName)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium">{booking.guestName}</p>
                            <p className="truncate text-xs text-muted">
                              {booking.cruiseName}
                              {booking.rooms.length > 0
                                ? ` · ${booking.rooms.join(", ")}`
                                : ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-[14rem] px-4 py-3">
                        {booking.customerEmail && booking.customerEmail !== "—" ? (
                          <a
                            href={`mailto:${booking.customerEmail}`}
                            className="block truncate text-muted transition-colors hover:text-[var(--accent)]"
                            title={booking.customerEmail}
                          >
                            {booking.customerEmail}
                          </a>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {booking.guestPhone ? (
                          <a
                            href={`tel:${booking.guestPhone.replace(/\s/g, "")}`}
                            className="tabular text-muted transition-colors hover:text-[var(--accent)]"
                          >
                            {booking.guestPhone}
                          </a>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="tabular inline-flex items-center gap-1.5">
                          <Users
                            className="h-3.5 w-3.5 text-muted"
                            strokeWidth={1.9}
                          />
                          {booking.partySize ?? "—"}
                        </span>
                        {booking.partyLabel !== "—" && (
                          <p className="mt-0.5 text-xs text-muted">{booking.partyLabel}</p>
                        )}
                      </td>
                      <td className="max-w-[16rem] px-4 py-3">
                        {booking.specialRequests ? (
                          <p className="line-clamp-2" title={booking.specialRequests}>
                            {booking.specialRequests}
                          </p>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <p className="tabular">
                          {format(parseISO(booking.departureTime), "d MMM yyyy")}
                        </p>
                        <p className="tabular text-xs text-muted">
                          {tripDays} day{tripDays === 1 ? "" : "s"} ·{" "}
                          {formatPrice(booking.totalPriceCents)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={booking.status} />
                      </td>
                      {viewMode === "bin" && (
                        <td className="whitespace-nowrap px-4 py-3">
                          {purgeDate ? (
                            <span title={format(purgeDate, "MMM d, yyyy HH:mm")}>
                              <p className="text-[0.8125rem]">
                                {format(purgeDate, "MMM d, yyyy HH:mm")}
                              </p>
                              <p className="text-xs text-muted">
                                {formatDistanceToNow(purgeDate, { addSuffix: true })}
                              </p>
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                      )}
                      {viewMode === "active" && (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {canConfirm && (
                              <IconButton
                                label={`Confirm ${booking.guestName}`}
                                tone="success"
                                disabled={isUpdating}
                                onClick={() => onConfirm(booking.id)}
                              >
                                {isUpdating ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4" strokeWidth={2.2} />
                                )}
                              </IconButton>
                            )}
                            {canCancel && (
                              <IconButton
                                label={`Cancel ${booking.guestName}`}
                                tone="danger"
                                disabled={isUpdating}
                                onClick={() => onCancel(booking.id)}
                              >
                                <X className="h-4 w-4" strokeWidth={2.2} />
                              </IconButton>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}