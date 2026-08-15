"use client";

import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  LayoutList,
  Loader2,
  RotateCcw,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { BookingStatus } from "@/app/generated/prisma/enums";
import { BookingCalendar } from "@/components/admin/BookingCalendar";
import { BookingsListView } from "@/components/admin/BookingsListView";
import { useToast } from "@/components/admin/ToastProvider";
import type { AdminBookingDto } from "@/lib/admin-bookings";
import { isPendingBookingStatus } from "@/lib/admin-bookings";
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
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <h1 className="admin-page-title">Bookings</h1>
            <p className="admin-page-subtitle">
              Manage reservations, confirm requests and track party sizes.
            </p>
          </div>
          <div className="card space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-10 animate-pulse rounded-lg"
                style={{ background: "var(--border)", opacity: 0.4 }}
              />
            ))}
          </div>
        </div>
      }
    >
      <AdminBookingsPageInner />
    </Suspense>
  );
}

function AdminBookingsPageInner() {
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
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

  const setQuery = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("q", value);
    else params.delete("q");
    const qs = params.toString();
    router.replace(qs ? `/admin/bookings?${qs}` : "/admin/bookings");
  };

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
      let attempt = options?.attempt ?? 0;

      for (;;) {
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
          return;
        } catch (err) {
          if (loadId !== loadIdRef.current) return;

          if (attempt < 1 && isTransientFetchError(err)) {
            await new Promise((resolve) =>
              setTimeout(resolve, 800 * (attempt + 1)),
            );
            attempt += 1;
            continue;
          }

          setLoadFailed(true);
          showToast(
            "error",
            err instanceof Error ? err.message : "Failed to load bookings",
          );
          if (loadId === loadIdRef.current) {
            setIsLoading(false);
          }
          return;
        }
      }
    },
    [showToast, statusFilter, viewMode, layoutView],
  );

  useEffect(() => {
    // Admin list mount/filter fetch — loading flags are intentional.
    void loadBookings(); // eslint-disable-line react-hooks/set-state-in-effect -- dashboard data load
  }, [loadBookings]);

  const filteredBookings = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return bookings;
    return bookings.filter((booking) => {
      const haystack = [
        booking.guestName,
        booking.guestPhone,
        booking.customerEmail,
        booking.cruiseName,
        booking.partyLabel,
        booking.specialRequests,
        booking.id,
        booking.rooms.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [bookings, query]);

  const summary = useMemo(() => {
    const pending = bookings.filter((booking) =>
      isPendingBookingStatus(booking.status),
    ).length;
    const confirmed = bookings.filter(
      (booking) => booking.status === "CONFIRMED",
    ).length;
    const guests = bookings.reduce((total, booking) => {
      if (booking.status === "CANCELLED") return total;
      return total + (booking.partySize ?? 0);
    }, 0);
    return { pending, confirmed, guests };
  }, [bookings]);

  const visibleIds = useMemo(
    () => filteredBookings.map((booking) => booking.id),
    [filteredBookings],
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
      ? `${filteredBookings.length} deleted — auto-removed after 7 days`
      : `${filteredBookings.length} reservation${filteredBookings.length === 1 ? "" : "s"}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="admin-page-title">Bookings</h1>
        <p className="admin-page-subtitle">
          Manage reservations, confirm requests and track party sizes.
        </p>
      </div>

      {viewMode === "active" && layoutView === "list" && (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="card p-4">
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{
                  background: "var(--warning-bg)",
                  color: "var(--warning)",
                }}
              >
                <Clock3 className="h-4 w-4" strokeWidth={1.9} />
              </span>
              <p className="text-sm font-medium text-muted">Awaiting confirmation</p>
            </div>
            <p className="mt-3 text-2xl font-semibold leading-none tracking-[-0.02em]">
              {summary.pending}
            </p>
            <p className="mt-1.5 text-xs text-muted">Pending holds in this list</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{
                  background: "var(--success-bg)",
                  color: "var(--success)",
                }}
              >
                <CheckCircle2 className="h-4 w-4" strokeWidth={1.9} />
              </span>
              <p className="text-sm font-medium text-muted">Confirmed</p>
            </div>
            <p className="mt-3 text-2xl font-semibold leading-none tracking-[-0.02em]">
              {summary.confirmed}
            </p>
            <p className="mt-1.5 text-xs text-muted">In the current filter</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{
                  background: "hsl(var(--gold-100))",
                  color: "hsl(var(--gold-700))",
                }}
              >
                <Users className="h-4 w-4" strokeWidth={1.9} />
              </span>
              <p className="text-sm font-medium text-muted">Guests booked</p>
            </div>
            <p className="mt-3 text-2xl font-semibold leading-none tracking-[-0.02em]">
              {summary.guests}
            </p>
            <p className="mt-1.5 text-xs text-muted">Party size excluding cancelled</p>
          </div>
        </section>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-4 flex overflow-x-auto px-4 pb-1 sm:mx-0 sm:overflow-visible sm:px-0 sm:pb-0">
            <div className="flex min-w-max flex-wrap items-center gap-2">
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

          {layoutView === "list" && (
            <div className="relative w-full sm:max-w-xs">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                strokeWidth={1.9}
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search guest, phone, cruise…"
                aria-label="Search bookings"
                className="input h-10 pl-9"
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {layoutView === "list" && (
            <button
              type="button"
              onClick={toggleSelectAll}
              disabled={isLoading || filteredBookings.length === 0}
              className="btn-outline h-10 px-4 text-sm disabled:opacity-50"
            >
              {allSelected ? "Deselect all" : "Select all"}
            </button>
          )}

          {viewMode === "active" ? (
            layoutView === "list" && (
              <button
                type="button"
                onClick={() =>
                  runBulkAction(
                    "soft-delete",
                    `Move ${selectedIds.size} booking(s) to the recycle bin? They will be permanently deleted after 7 days.`,
                  )
                }
                disabled={!someSelected || isBulkWorking}
                className="btn-outline h-10 px-4 text-sm disabled:opacity-50"
              >
                {isBulkWorking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Move to bin
              </button>
            )
          ) : (
            <>
              <button
                type="button"
                onClick={() => runBulkAction("restore")}
                disabled={!someSelected || isBulkWorking}
                className="btn-outline h-10 px-4 text-sm disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                Restore
              </button>
              <button
                type="button"
                onClick={() =>
                  runBulkAction(
                    "purge",
                    `Permanently delete ${selectedIds.size} booking(s)? This cannot be undone.`,
                  )
                }
                disabled={!someSelected || isBulkWorking}
                className="btn-primary h-10 px-4 text-sm disabled:opacity-50"
                style={{
                  background: "var(--danger)",
                  borderColor: "var(--danger)",
                  color: "#fff",
                }}
              >
                Delete permanently
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => loadBookings()}
            disabled={isLoading}
            className="btn-outline h-10 px-4 text-sm disabled:opacity-50"
          >
            Refresh
          </button>
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
        <BookingCalendar bookings={filteredBookings} isLoading={isLoading} />
      ) : (
        <BookingsListView
          bookings={filteredBookings}
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