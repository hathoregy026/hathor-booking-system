"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { ActionButton } from "@/components/admin/ActionButton";
import { BookingRow } from "@/components/admin/bookings/BookingCard";
import type { BookingActionKind } from "@/components/admin/bookings/BookingActions";
import type { AdminBookingDto } from "@/lib/admin-bookings";

export type BookingGroup = { id: string; title: string; hint: string; bookings: AdminBookingDto[] };

/** A titled, collapsible part of the list; bookings and Availability sales share it. */
export function BookingsGroup({ title, hint, count, children }: { title: string; hint: string; count: number; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <section className="card bk-group" aria-label={title}>
      <button type="button" className="bk-group__head" aria-expanded={open} onClick={() => setOpen(value => !value)}>
        <h2>{title}</h2>
        <span className="bk-group__count tabular">{count}</span>
        <span className="bk-group__hint">{hint}</span>
        <ChevronDown className="bk-group__chevron h-4 w-4" aria-hidden />
      </button>
      {open ? children : null}
    </section>
  );
}

export function BookingsColumns() {
  return (
    <div className="bk-cols" aria-hidden>
      <span />
      <span>Guest</span>
      <span>Voyage</span>
      <span>Cabin</span>
      <span>Payment</span>
      <span />
    </div>
  );
}

type BookingsListViewProps = {
  groups: BookingGroup[];
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
  groups,
  viewMode,
  emptyMessage,
  isLoading,
  loadFailed,
  selectedIds,
  onToggleSelect,
  onRetry,
  onAction,
}: BookingsListViewProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const toggleExpanded = (id: string) =>
    setExpandedIds(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (isLoading) {
    return (
      <div className="space-y-3" aria-busy="true">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="card h-32 animate-pulse" style={{ opacity: 0.55 }} />
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

  const shown = groups.filter(group => group.bookings.length > 0);
  if (shown.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center gap-2 px-4 py-16 text-center">
        <p className="text-sm font-medium">No bookings here</p>
        <p className="text-sm text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <BookingsColumns />
      {shown.map(group => (
        <BookingsGroup key={group.id} title={group.title} hint={group.hint} count={group.bookings.length}>
          {group.bookings.map(booking => (
            <BookingRow
              key={booking.id}
              booking={booking}
              viewMode={viewMode}
              selected={selectedIds.has(booking.id)}
              expanded={expandedIds.has(booking.id)}
              onToggleExpanded={toggleExpanded}
              onToggleSelect={onToggleSelect}
              onAction={onAction}
            />
          ))}
        </BookingsGroup>
      ))}
    </div>
  );
}
