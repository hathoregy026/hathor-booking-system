import type { ReactNode } from "react";
import { CalendarX2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { displayBookingStatus, isPendingBookingStatus } from "@/lib/admin-bookings";

type DataTableProps = {
  title?: string;
  description?: string;
  action?: ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  /**
   * Headline for the empty state. Previously hardcoded to "No bookings found",
   * which was wrong for every non-booking table.
   */
  emptyTitle?: string;
  emptyIcon?: LucideIcon;
  /** Number of skeleton rows while loading. */
  skeletonRows?: number;
  children: ReactNode;
};

export function DataTable({
  title,
  description,
  action,
  isLoading,
  isEmpty = false,
  emptyMessage,
  emptyTitle = "Nothing here yet",
  emptyIcon: EmptyIcon = CalendarX2,
  skeletonRows = 5,
  children,
}: DataTableProps) {
  return (
    <div className="card admin-datatable overflow-hidden">
      {(title || action) && (
        <div className="admin-datatable__head">
          <div className="min-w-0">
            {title && (
              <h2 className="admin-heading text-base sm:text-lg">{title}</h2>
            )}
            {description && (
              <p className="admin-subheading mt-0.5">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3 p-4 sm:p-6" aria-hidden>
          {Array.from({ length: skeletonRows }).map((_, index) => (
            <div key={index} className="admin-skeleton h-10 rounded-lg" />
          ))}
        </div>
      ) : isEmpty && emptyMessage ? (
        <div className="admin-empty-state">
          <EmptyIcon className="admin-empty-state__icon h-12 w-12" aria-hidden />
          <p className="text-base font-semibold">{emptyTitle}</p>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {emptyMessage}
          </p>
        </div>
      ) : (
        <div className="admin-datatable__body">{children}</div>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  let className = "admin-badge admin-badge--default";

  if (normalized === "CONFIRMED") className = "admin-badge admin-badge--confirmed";
  else if (isPendingBookingStatus(normalized))
    className = "admin-badge admin-badge--pending";
  else if (normalized === "CANCELLED")
    className = "admin-badge admin-badge--cancelled";
  else if (normalized === "EXPIRED")
    className = "admin-badge admin-badge--expired";

  return <span className={className}>{displayBookingStatus(status)}</span>;
}
