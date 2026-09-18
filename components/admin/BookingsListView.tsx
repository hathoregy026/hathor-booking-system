"use client";

import { ActionButton } from "@/components/admin/ActionButton";
import { BookingCard } from "@/components/admin/bookings/BookingCard";
import type { BookingActionKind } from "@/components/admin/bookings/BookingActions";
import type { AdminBookingDto } from "@/lib/admin-bookings";

type BookingsListViewProps = {
  bookings: AdminBookingDto[];
  viewMode: "active" | "bin";
  emptyMessage: string;
  isLoading: boolean;
  loadFailed: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onRetry: () => void;
  onAction: (booking: AdminBookingDto, kind: BookingActionKind) => void;
};

export function BookingsListView({
  bookings,
  viewMode,
  emptyMessage,
  isLoading,
  loadFailed,
  selectedIds,
  onToggleSelect,
  onRetry,
  onAction,
}: BookingsListViewProps) {
  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="card h-52 animate-pulse" style={{ opacity: 0.55 }} />
        ))}
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div className="card flex flex-col items-center gap-3 px-4 py-16 text-center">
        <p className="text-sm text-muted">Could not load bookings. The database connection may have timed out.</p>
        <ActionButton onClick={onRetry} className="w-full px-4 py-3 text-sm sm:w-auto">
          Try again
        </ActionButton>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center gap-2 px-4 py-16 text-center">
        <p className="text-sm font-medium">No bookings here</p>
        <p className="text-sm text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {bookings.map((booking) => (
        <li key={booking.id}>
          <BookingCard
            booking={booking}
            viewMode={viewMode}
            selected={selectedIds.has(booking.id)}
            onToggleSelect={onToggleSelect}
            onAction={onAction}
          />
        </li>
      ))}
    </ul>
  );
}
