import type { ReactNode } from "react";
import { CalendarX2 } from "lucide-react";
import { displayBookingStatus, isPendingBookingStatus } from "@/lib/admin-bookings";

type DataTableProps = {
  title?: string;
  description?: string;
  action?: ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: ReactNode;
};

export function DataTable({
  title,
  description,
  action,
  isLoading,
  isEmpty = false,
  emptyMessage,
  children,
}: DataTableProps) {
  return (
    <div className="admin-card overflow-hidden">
      {(title || action) && (
        <div
          className="flex flex-col gap-3 px-4 py-4 sm:px-6 sm:py-5 md:flex-row md:items-center md:justify-between"
          style={{
            borderBottom:
              "1px solid color-mix(in srgb, var(--border) 50%, transparent)",
          }}
        >
          <div>
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
        <div className="space-y-3 p-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-10 animate-pulse rounded-lg"
              style={{ background: "var(--border)", opacity: 0.4 }}
            />
          ))}
        </div>
      ) : isEmpty && emptyMessage ? (
        <div className="admin-empty-state">
          <CalendarX2 className="admin-empty-state__icon h-12 w-12" aria-hidden />
          <p className="text-base font-semibold">No bookings found</p>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {emptyMessage}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">{children}</div>
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
