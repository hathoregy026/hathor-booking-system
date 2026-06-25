"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  LayoutList,
  Loader2,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { BookingStatus } from "@/app/generated/prisma/enums";
import { ActionButton } from "@/components/admin/ActionButton";
import { BookingCalendar } from "@/components/admin/BookingCalendar";
import { BookingsListView } from "@/components/admin/BookingsListView";
import { useToast } from "@/components/admin/ToastProvider";
import type { AdminBookingDto } from "@/lib/admin-bookings";
import {
  ADMIN_BOOKINGS_TIMEOUT_MS,
  adminFetch,
  isTransientFetchError,
} from "@/lib/admin-fetch";

type StatusFilter = "all" | "pending" | "confirmed" | "expired" | "cancelled";
type ViewMode = "active" | "bin";
type LayoutView = "list" | "calendar";

const FILTER_TABS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "confirmed", label: "Confirmed" },
  { id: "expired", label: "Expired" },
  { id: "cancelled", label: "Cancelled" },
];

export default function AdminBookingsPage() {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<AdminBookingDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isBulkWorking, setIsBulkWorking] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("active");
  const [layoutView, setLayoutView] = useState<LayoutView>("list");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const loadIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const switchViewMode = (mode: ViewMode) => {
    loadIdRef.current += 1;
    setViewMode(mode);
    if (mode === "bin") {
      setLayoutView("list");
    }
  };

  const loadBookings = useCallback(
    async (options?: { attempt?: number; loadId?: number }) => {
      const loadId = options?.loadId ?? ++loadIdRef.current;
      const attempt = options?.attempt ?? 0;

      if (attempt === 0) {
        abortRef.current?.abort();
        abortRef.current = new AbortController();
        setIsLoading(true);
        setLoadFailed(false);
      }

      const controller = abortRef.current;
      if (!controller) return;

      try {
        const params = new URLSearchParams({
          bin: viewMode === "bin" ? "true" : "false",
        });

        if (layoutView === "calendar" && viewMode === "active") {
          params.set("calendar", "true");
        } else {
          params.set("status", statusFilter);
        }

        const response = await adminFetch(
          `/api/admin/bookings?${params.toString()}`,
          { signal: controller.signal },
          ADMIN_BOOKINGS_TIMEOUT_MS,
        );
        if (loadId !== loadIdRef.current) return;

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load bookings");
        }

        setBookings(Array.isArray(data.bookings) ? data.bookings : []);
        setSelectedIds(new Set());
        setLoadFailed(false);
        if (loadId === loadIdRef.current) {
          setIsLoading(false);
        }
      } catch (err) {
        if (loadId !== loadIdRef.current) return;

        if (attempt < 1 && isTransientFetchError(err)) {
          await new Promise((resolve) =>
            setTimeout(resolve, 800 * (attempt + 1)),
          );
          return loadBookings({ attempt: attempt + 1, loadId });
        }

        setLoadFailed(true);
        showToast(
          "error",
          err instanceof Error ? err.message : "Failed to load bookings",
        );
        if (loadId === loadIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [showToast, statusFilter, viewMode, layoutView],
  );

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const visibleIds = useMemo(
    () => bookings.map((booking) => booking.id),
    [bookings],
  );
  const allSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
  const someSelected = selectedIds.size > 0;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(visibleIds));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const runBulkAction = async (
    action: "soft-delete" | "restore" | "purge",
    confirmMessage?: string,
  ) => {
    const ids = [...selectedIds];
    if (ids.length === 0) {
      showToast("error", "Select at least one booking");
      return;
    }

    if (confirmMessage && !window.confirm(confirmMessage)) return;

    setIsBulkWorking(true);
    try {
      const response = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Action failed");

      const count = data.updated ?? data.deleted ?? ids.length;

      const messages = {
        "soft-delete": `${count} booking(s) moved to recycle bin`,
        restore: `${count} booking(s) restored`,
        purge: `${count} booking(s) permanently deleted`,
      };
      showToast("success", messages[action]);
      await loadBookings();
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Bulk action failed",
      );
    } finally {
      setIsBulkWorking(false);
    }
  };

  const updateBookingStatus = async (
    id: string,
    status: "CONFIRMED" | "CANCELLED",
  ) => {
    const previous = bookings.find((booking) => booking.id === id);
    if (!previous) return;

    setUpdatingId(id);
    setBookings((current) =>
      current.map((booking) =>
        booking.id === id ? { ...booking, status } : booking,
      ),
    );

    try {
      const response = await adminFetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Update failed");
      }

      setBookings((current) =>
        current.map((booking) =>
          booking.id === id ? { ...booking, ...data.booking } : booking,
        ),
      );
      showToast(
        "success",
        status === BookingStatus.CONFIRMED
          ? "Booking confirmed"
          : "Booking cancelled",
      );
    } catch (err) {
      setBookings((current) =>
        current.map((booking) =>
          booking.id === id ? previous : booking,
        ),
      );
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to update booking status",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirm = (id: string) => {
    void updateBookingStatus(id, BookingStatus.CONFIRMED);
  };

  const handleCancel = (id: string) => {
    if (!window.confirm("Cancel this booking?")) return;
    void updateBookingStatus(id, BookingStatus.CANCELLED);
  };

  const tableTitle = viewMode === "bin" ? "Recycle Bin" : "All Bookings";

  const tableDescription =
    viewMode === "bin"
      ? `${bookings.length} deleted — auto-removed after 7 days`
      : `${bookings.length} reservation${bookings.length === 1 ? "" : "s"}`;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="admin-page-title">Bookings</h1>
          <p className="admin-page-subtitle">Manage reservations</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="-mx-4 flex overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          <div className="flex min-w-max flex-wrap items-center gap-2 sm:min-w-0">
            {viewMode === "active" && (
              <div
                className="mr-1 flex shrink-0 rounded-xl border p-1 sm:mr-2"
                style={{ borderColor: "var(--border)" }}
              >
                <button
                  type="button"
                  onClick={() => setLayoutView("list")}
                  className={`admin-filter-tab flex items-center gap-1.5 ${
                    layoutView === "list" ? "admin-filter-tab--active" : ""
                  }`}
                >
                  <LayoutList className="h-4 w-4" />
                  List
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutView("calendar")}
                  className={`admin-filter-tab flex items-center gap-1.5 ${
                    layoutView === "calendar" ? "admin-filter-tab--active" : ""
                  }`}
                >
                  <CalendarDays className="h-4 w-4" />
                  Calendar
                </button>
              </div>
            )}

            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                disabled={viewMode === "bin" || layoutView === "calendar"}
                onClick={() => setStatusFilter(tab.id)}
                className={`admin-filter-tab disabled:opacity-40 ${
                  statusFilter === tab.id && viewMode === "active"
                    ? "admin-filter-tab--active"
                    : ""
                }`}
              >
                {tab.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                switchViewMode(viewMode === "bin" ? "active" : "bin");
                setStatusFilter("all");
              }}
              className={`admin-filter-tab ${
                viewMode === "bin"
                  ? "admin-filter-tab--danger-active"
                  : "admin-filter-tab--danger"
              }`}
            >
              Recycle Bin
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {layoutView === "list" && (
            <ActionButton
              variant="outline"
              onClick={toggleSelectAll}
              disabled={isLoading || bookings.length === 0}
              className="w-full px-4 py-2.5 text-sm sm:w-auto"
            >
              {allSelected ? "Deselect all" : "Select all"}
            </ActionButton>
          )}

          {viewMode === "active" ? (
            layoutView === "list" && (
              <ActionButton
                variant="outline"
                icon={Trash2}
                onClick={() =>
                  runBulkAction(
                    "soft-delete",
                    `Move ${selectedIds.size} booking(s) to the recycle bin? They will be permanently deleted after 7 days.`,
                  )
                }
                disabled={!someSelected || isBulkWorking}
                className="w-full px-4 py-2.5 text-sm sm:w-auto"
              >
                {isBulkWorking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Move to bin"
                )}
              </ActionButton>
            )
          ) : (
            <>
              <ActionButton
                variant="outline"
                icon={RotateCcw}
                onClick={() => runBulkAction("restore")}
                disabled={!someSelected || isBulkWorking}
                className="w-full px-4 py-2.5 text-sm sm:w-auto"
              >
                Restore
              </ActionButton>
              <ActionButton
                onClick={() =>
                  runBulkAction(
                    "purge",
                    `Permanently delete ${selectedIds.size} booking(s)? This cannot be undone.`,
                  )
                }
                disabled={!someSelected || isBulkWorking}
                className="px-4 py-2 text-sm [background:var(--danger)] hover:opacity-90"
              >
                Delete permanently
              </ActionButton>
            </>
          )}

          <ActionButton
            variant="outline"
            onClick={() => loadBookings()}
            disabled={isLoading}
            className="px-4 py-2 text-sm"
          >
            Refresh
          </ActionButton>
        </div>
      </div>

      {viewMode === "bin" && (
        <p
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            background: "color-mix(in srgb, var(--warning) 12%, transparent)",
            color: "var(--text-secondary)",
            border:
              "1px solid color-mix(in srgb, var(--warning) 30%, transparent)",
          }}
        >
          Deleted bookings stay here for 7 days, then are removed automatically.
          Use &quot;Delete permanently&quot; to remove them immediately.
        </p>
      )}

      {layoutView === "calendar" && viewMode === "active" ? (
        <BookingCalendar bookings={bookings} isLoading={isLoading} />
      ) : (
        <BookingsListView
          bookings={bookings}
          viewMode={viewMode}
          statusFilter={statusFilter}
          isLoading={isLoading}
          loadFailed={loadFailed}
          selectedIds={selectedIds}
          updatingId={updatingId}
          allSelected={allSelected}
          tableTitle={tableTitle}
          tableDescription={tableDescription}
          onToggleSelectAll={toggleSelectAll}
          onToggleSelect={toggleSelect}
          onRetry={() => loadBookings()}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
