"use client";

import { format, formatDistanceToNow, parseISO } from "date-fns";
import { Loader2 } from "lucide-react";
import { BookingStatus } from "@/app/generated/prisma/enums";
import { ActionButton } from "@/components/admin/ActionButton";
import { DataTable, StatusBadge } from "@/components/admin/DataTable";
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
    <article
      className="admin-card space-y-3 p-4"
      style={{
        borderColor: selected
          ? "color-mix(in srgb, var(--accent) 40%, var(--border))"
          : undefined,
      }}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(booking.id)}
          aria-label={`Select ${booking.customerName}`}
          className="mt-1 h-5 w-5 shrink-0 rounded border"
          style={{ accentColor: "var(--accent)" }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="font-semibold">{booking.customerName}</p>
            <StatusBadge status={booking.status} />
          </div>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            {booking.customerEmail}
          </p>
        </div>
      </div>

      <dl className="grid gap-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt style={{ color: "var(--text-muted)" }}>Cruise</dt>
          <dd className="text-right font-medium">{booking.cruiseName}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt style={{ color: "var(--text-muted)" }}>Dates</dt>
          <dd className="text-right" style={{ color: "var(--text-secondary)" }}>
            {format(parseISO(booking.departureTime), "MMM d")} –{" "}
            {format(parseISO(booking.arrivalTime), "MMM d, yyyy")}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt style={{ color: "var(--text-muted)" }}>Rooms</dt>
          <dd className="text-right" style={{ color: "var(--text-secondary)" }}>
            {booking.rooms.length > 0 ? booking.rooms.join(", ") : "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt style={{ color: "var(--text-muted)" }}>Total</dt>
          <dd className="font-semibold tabular-nums">
            {formatPrice(booking.totalPriceCents)}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt style={{ color: "var(--text-muted)" }}>
            {viewMode === "bin" ? "Deletes in" : "Booked"}
          </dt>
          <dd className="text-right" style={{ color: "var(--text-secondary)" }}>
            {viewMode === "bin" && purgeDate ? (
              formatDistanceToNow(purgeDate, { addSuffix: true })
            ) : (
              format(parseISO(booking.createdAt), "MMM d, yyyy")
            )}
          </dd>
        </div>
      </dl>

      {viewMode === "active" && (canConfirm || canCancel) && (
        <div className="flex flex-wrap gap-2 border-t pt-3" style={{ borderColor: "var(--border)" }}>
          {canConfirm && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onConfirm(booking.id)}
              className="min-h-11 flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: "var(--success)" }}
            >
              {isUpdating ? (
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
              ) : (
                "Confirm"
              )}
            </button>
          )}
          {canCancel && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onCancel(booking.id)}
              className="min-h-11 flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
              style={{
                borderColor: "var(--danger)",
                color: "var(--danger)",
              }}
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </article>
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
    <DataTable
      title={tableTitle}
      description={tableDescription}
      isLoading={isLoading}
      isEmpty={!loadFailed && bookings.length === 0}
      emptyMessage={
        loadFailed
          ? undefined
          : viewMode === "bin"
            ? "Recycle bin is empty."
            : statusFilter === "all"
              ? "No bookings yet. They will appear here once customers start booking."
              : `No ${statusFilter} bookings. Try the All or Expired filter.`
      }
      action={
        !isLoading && bookings.length > 0 ? (
          <button
            type="button"
            onClick={onToggleSelectAll}
            className="admin-btn-outline w-full px-4 py-2.5 text-sm sm:w-auto"
          >
            {allSelected ? "Deselect all" : "Select all"}
          </button>
        ) : undefined
      }
    >
      {loadFailed ? (
        <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Could not load bookings. The database connection may have timed out.
          </p>
          <ActionButton onClick={onRetry} className="w-full px-4 py-3 text-sm sm:w-auto">
            Try again
          </ActionButton>
        </div>
      ) : (
        <>
          <div className="space-y-3 p-4 md:hidden">
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
          </div>

          <table className="admin-table hidden min-w-full text-sm md:table">
            <thead>
              <tr>
                <th className="w-10 px-4 py-3">
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
                  "Customer",
                  "Email",
                  "Cruise",
                  "Dates",
                  "Rooms",
                  "Total",
                  "Status",
                  viewMode === "bin" ? "Deletes in" : "Booked",
                  ...(viewMode === "active" ? ["Actions"] : []),
                ].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-left">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const purgeDate = booking.deletedAt
                  ? getPermanentDeleteDate(parseISO(booking.deletedAt))
                  : null;
                const isUpdating = updatingId === booking.id;
                const canConfirm = isPendingBookingStatus(booking.status);
                const canCancel =
                  isPendingBookingStatus(booking.status) ||
                  booking.status === BookingStatus.CONFIRMED;

                return (
                  <tr key={booking.id}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(booking.id)}
                        onChange={() => onToggleSelect(booking.id)}
                        aria-label={`Select ${booking.customerName}`}
                        className="h-4 w-4 rounded border"
                        style={{ accentColor: "var(--accent)" }}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {booking.customerName}
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {booking.customerEmail}
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {booking.cruiseName}
                    </td>
                    <td
                      className="whitespace-nowrap px-4 py-3"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {format(parseISO(booking.departureTime), "MMM d, yyyy")}
                      {" – "}
                      {format(parseISO(booking.arrivalTime), "MMM d, yyyy")}
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {booking.rooms.length > 0 ? booking.rooms.join(", ") : "—"}
                    </td>
                    <td className="px-4 py-3 font-semibold tabular-nums">
                      {formatPrice(booking.totalPriceCents)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td
                      className="whitespace-nowrap px-4 py-3"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {viewMode === "bin" && purgeDate ? (
                        <span title={format(purgeDate, "MMM d, yyyy HH:mm")}>
                          {formatDistanceToNow(purgeDate, { addSuffix: true })}
                        </span>
                      ) : (
                        format(parseISO(booking.createdAt), "MMM d, yyyy HH:mm")
                      )}
                    </td>
                    {viewMode === "active" && (
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {canConfirm && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => onConfirm(booking.id)}
                              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                              style={{ background: "var(--success)" }}
                            >
                              {isUpdating ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                "Confirm"
                              )}
                            </button>
                          )}
                          {canCancel && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => onCancel(booking.id)}
                              className="rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
                              style={{
                                borderColor: "var(--danger)",
                                color: "var(--danger)",
                              }}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </DataTable>
  );
}
