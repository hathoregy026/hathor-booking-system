"use client";

import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, LayoutList, Loader2, RefreshCw, RotateCcw, Search, Trash2 } from "lucide-react";
import { BookingCalendar } from "@/components/admin/BookingCalendar";
import { BookingsListView } from "@/components/admin/BookingsListView";
import { BookingActionDialog, type BookingActionKind } from "@/components/admin/bookings/BookingActions";
import { useToast } from "@/components/admin/ToastProvider";
import type { AdminBookingDto, AdminBookingStage } from "@/lib/admin-bookings";
import { ADMIN_BOOKINGS_TIMEOUT_MS, adminFetch, isTransientFetchError } from "@/lib/admin-fetch";

type StageFilter = "all" | "new" | "invoiced" | "confirmed" | "closed" | "other";
type ViewMode = "active" | "bin";
type LayoutView = "list" | "calendar";

const FILTERS: { id: StageFilter; label: string; stages: AdminBookingStage[]; empty: string }[] = [
  // Checkout holds that never became a request are noise here; they keep their own tab.
  { id: "all", label: "All bookings", stages: ["new", "invoiced", "confirmed", "paid", "declined", "cancelled"], empty: "No bookings yet. They appear here as soon as a guest sends a request." },
  { id: "new", label: "New requests", stages: ["new"], empty: "No new requests waiting for you." },
  { id: "invoiced", label: "Awaiting payment", stages: ["invoiced"], empty: "No invoices waiting for payment." },
  { id: "confirmed", label: "Confirmed", stages: ["confirmed", "paid"], empty: "No confirmed bookings yet." },
  { id: "closed", label: "Declined & cancelled", stages: ["declined", "cancelled"], empty: "Nothing declined or cancelled." },
  { id: "other", label: "Holds & expired", stages: ["hold", "expired"], empty: "No checkout holds or expired attempts." },
];

export default function AdminBookingsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <h1 className="admin-page-title">Bookings</h1>
            <p className="admin-page-subtitle">Confirm requests, send invoices, record payments and reply to guests.</p>
          </div>
          <div className="card h-40 animate-pulse" style={{ opacity: 0.55 }} />
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
  const [loadedAt, setLoadedAt] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [isBulkWorking, setIsBulkWorking] = useState(false);
  const [filter, setFilter] = useState<StageFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("active");
  const [layoutView, setLayoutView] = useState<LayoutView>("list");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState<{ booking: AdminBookingDto; kind: BookingActionKind } | null>(null);

  const loadIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const setQuery = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("q", value);
    else params.delete("q");
    const qs = params.toString();
    router.replace(qs ? `/admin/bookings?${qs}` : "/admin/bookings");
  };

  const loadBookings = useCallback(async () => {
    const loadId = ++loadIdRef.current;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);
    setLoadFailed(false);

    for (let attempt = 0; ; attempt += 1) {
      try {
        const params = new URLSearchParams({ bin: viewMode === "bin" ? "true" : "false", status: "all" });
        const response = await adminFetch(`/api/admin/bookings?${params}`, { signal: controller.signal }, ADMIN_BOOKINGS_TIMEOUT_MS);
        if (loadId !== loadIdRef.current) return;
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Failed to load bookings");
        setBookings(Array.isArray(data.bookings) ? data.bookings : []);
        setLoadedAt(Date.now());
        setSelectedIds(new Set());
        setIsLoading(false);
        return;
      } catch (err) {
        if (loadId !== loadIdRef.current) return;
        if (attempt < 1 && isTransientFetchError(err)) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          continue;
        }
        setLoadFailed(true);
        setIsLoading(false);
        showToast("error", err instanceof Error ? err.message : "Failed to load bookings");
        return;
      }
    }
  }, [showToast, viewMode]);

  useEffect(() => {
    void loadBookings(); // eslint-disable-line react-hooks/set-state-in-effect -- dashboard data load
  }, [loadBookings]);

  const searched = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return bookings;
    return bookings.filter((booking) =>
      [
        booking.guestName,
        booking.guestPhone,
        booking.customerEmail,
        booking.cruiseName,
        booking.code,
        booking.country,
        booking.specialRequests,
        booking.id,
        booking.roomTypes.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [bookings, query]);

  const counts = useMemo(() => {
    const map = new Map<StageFilter, number>();
    for (const entry of FILTERS) {
      map.set(entry.id, searched.filter((booking) => entry.stages.includes(booking.stage)).length);
    }
    return map;
  }, [searched]);

  const activeFilter = FILTERS.find((entry) => entry.id === filter) ?? FILTERS[0]!;
  const visible = useMemo(
    () => (viewMode === "bin" ? searched : searched.filter((booking) => activeFilter.stages.includes(booking.stage))),
    [searched, activeFilter, viewMode],
  );

  const upcomingGuests = useMemo(
    () =>
      bookings
        .filter((booking) => (booking.stage === "confirmed" || booking.stage === "paid") && Date.parse(booking.departureTime) > loadedAt)
        .reduce((total, booking) => total + (booking.partySize ?? 0), 0),
    [bookings, loadedAt],
  );

  const calendarBookings = useMemo(() => searched.filter((booking) => booking.status === "REQUESTED" || booking.status === "CONFIRMED"), [searched]);

  const allSelected = visible.length > 0 && visible.every((booking) => selectedIds.has(booking.id));

  const toggleSelectAll = () => setSelectedIds(allSelected ? new Set() : new Set(visible.map((booking) => booking.id)));
  const toggleSelect = (id: string) =>
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const runBulkAction = async (action: "soft-delete" | "restore" | "purge", confirmMessage?: string) => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    setIsBulkWorking(true);
    try {
      const response = await adminFetch(
        "/api/admin/bookings",
        { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ids }) },
        ADMIN_BOOKINGS_TIMEOUT_MS,
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Action failed");
      const count = data.updated ?? data.deleted ?? ids.length;
      const message = {
        "soft-delete": `${count} booking(s) moved to the recycle bin`,
        restore: `${count} booking(s) restored`,
        purge: `${count} booking(s) permanently deleted`,
      }[action];
      showToast(data.note ? "warning" : "success", data.note ? `${message}. ${data.note}` : message);
      await loadBookings();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Bulk action failed");
    } finally {
      setIsBulkWorking(false);
    }
  };

  const onDialogDone = (updated: AdminBookingDto | null, removed?: boolean) => {
    const id = dialog?.booking.id;
    if (!id) return;
    if (removed) {
      setBookings((current) => current.filter((booking) => booking.id !== id));
      setSelectedIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    } else if (updated) {
      setBookings((current) => current.map((booking) => (booking.id === id ? updated : booking)));
    }
  };

  const statTiles: { id: StageFilter; label: string; tone: string; hint: string }[] = [
    { id: "new", label: "New requests", tone: "var(--accent)", hint: "Confirm to send the invoice" },
    { id: "invoiced", label: "Awaiting payment", tone: "var(--info)", hint: "Invoice sent, deposit not yet in" },
    { id: "confirmed", label: "Confirmed", tone: "var(--success)", hint: "Deposit received" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="admin-page-title">Bookings</h1>
        <p className="admin-page-subtitle">Confirm requests, send invoices, record payments and reply to guests.</p>
      </div>

      {viewMode === "active" && (
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {statTiles.map((tile) => (
            <button
              key={tile.id}
              type="button"
              onClick={() => {
                setLayoutView("list");
                setFilter(filter === tile.id ? "all" : tile.id);
              }}
              aria-pressed={filter === tile.id && layoutView === "list"}
              className="card bk-stat"
              style={{ ["--bk-tone" as string]: tile.tone }}
            >
              <span className="bk-stat__label">{tile.label}</span>
              <span className="bk-stat__value">{isLoading ? "–" : counts.get(tile.id) ?? 0}</span>
              <span className="text-xs text-muted">{tile.hint}</span>
            </button>
          ))}
          <div className="card bk-stat" style={{ ["--bk-tone" as string]: "var(--text-muted)" }}>
            <span className="bk-stat__label">Guests sailing</span>
            <span className="bk-stat__value">{isLoading ? "–" : upcomingGuests}</span>
            <span className="text-xs text-muted">On upcoming confirmed voyages</span>
          </div>
        </section>
      )}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-4 flex overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 sm:pb-0">
          <div className="flex min-w-max items-center gap-2">
            {viewMode === "active" && (
              <div className="mr-1 flex shrink-0 rounded-xl border p-1" style={{ borderColor: "var(--border)" }}>
                <button
                  type="button"
                  onClick={() => setLayoutView("list")}
                  className={`admin-filter-tab flex items-center gap-1.5 ${layoutView === "list" ? "admin-filter-tab--active" : ""}`}
                >
                  <LayoutList className="h-4 w-4" />
                  List
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutView("calendar")}
                  className={`admin-filter-tab flex items-center gap-1.5 ${layoutView === "calendar" ? "admin-filter-tab--active" : ""}`}
                >
                  <CalendarDays className="h-4 w-4" />
                  Calendar
                </button>
              </div>
            )}
            {viewMode === "active" && layoutView === "list" &&
              FILTERS.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setFilter(entry.id)}
                  className={`admin-filter-tab ${filter === entry.id ? "admin-filter-tab--active" : ""}`}
                >
                  {entry.label}
                  {!isLoading ? <span className="ml-1.5 tabular opacity-70">{counts.get(entry.id) ?? 0}</span> : null}
                </button>
              ))}
            <button
              type="button"
              onClick={() => {
                loadIdRef.current += 1;
                setViewMode(viewMode === "bin" ? "active" : "bin");
                setLayoutView("list");
                setFilter("all");
              }}
              className={`admin-filter-tab ${viewMode === "bin" ? "admin-filter-tab--danger-active" : "admin-filter-tab--danger"}`}
            >
              {viewMode === "bin" ? "Back to bookings" : "Recycle bin"}
            </button>
          </div>
        </div>

        {layoutView === "list" && (
          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" strokeWidth={1.9} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search guest, code, email, cruise…"
              aria-label="Search bookings"
              className="input h-10 pl-9"
            />
          </div>
        )}
      </div>

      {layoutView === "list" && (
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={toggleSelectAll} disabled={isLoading || visible.length === 0} className="btn-outline h-9 px-3.5 text-sm disabled:opacity-50">
            {allSelected ? "Deselect all" : "Select all"}
          </button>
          {viewMode === "active" ? (
            <button
              type="button"
              onClick={() =>
                runBulkAction(
                  "soft-delete",
                  `Delete ${selectedIds.size} booking(s)? Open requests are declined without a fee, confirmed bookings are cancelled under your policy, cabins are released, and they move to the recycle bin.`,
                )
              }
              disabled={selectedIds.size === 0 || isBulkWorking}
              className="btn-outline h-9 px-3.5 text-sm disabled:opacity-50"
            >
              {isBulkWorking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete selected
            </button>
          ) : (
            <>
              <button type="button" onClick={() => runBulkAction("restore")} disabled={selectedIds.size === 0 || isBulkWorking} className="btn-outline h-9 px-3.5 text-sm disabled:opacity-50">
                <RotateCcw className="h-4 w-4" />
                Restore
              </button>
              <button
                type="button"
                onClick={() => runBulkAction("purge", `Permanently delete ${selectedIds.size} booking(s)? This cannot be undone. Bookings with recorded payments are kept for your accounts.`)}
                disabled={selectedIds.size === 0 || isBulkWorking}
                className="btn-primary h-9 px-3.5 text-sm disabled:opacity-50"
                style={{ background: "var(--danger)", borderColor: "var(--danger)", color: "#fff" }}
              >
                Delete forever
              </button>
            </>
          )}
          <span className="text-sm text-muted">
            {selectedIds.size > 0 ? `${selectedIds.size} selected` : `${visible.length} booking${visible.length === 1 ? "" : "s"}`}
          </span>
          <span className="flex-1" />
          <button type="button" onClick={() => void loadBookings()} disabled={isLoading} className="btn-ghost h-9 px-3 text-sm disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      )}

      {viewMode === "bin" && (
        <p
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            background: "color-mix(in srgb, var(--warning) 12%, transparent)",
            color: "var(--text-secondary)",
            border: "1px solid color-mix(in srgb, var(--warning) 30%, transparent)",
          }}
        >
          Deleted bookings stay here for 7 days. Restore them, or use “Delete forever” to remove them now. Bookings with recorded payments are always kept for your accounts.
        </p>
      )}

      {layoutView === "calendar" && viewMode === "active" ? (
        <BookingCalendar bookings={calendarBookings} isLoading={isLoading} />
      ) : (
        <BookingsListView
          bookings={visible}
          viewMode={viewMode}
          emptyMessage={viewMode === "bin" ? "The recycle bin is empty." : query ? "Nothing matches your search." : activeFilter.empty}
          isLoading={isLoading}
          loadFailed={loadFailed}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onRetry={() => void loadBookings()}
          onAction={(booking, kind) => setDialog({ booking, kind })}
        />
      )}

      {dialog ? (
        <BookingActionDialog
          key={`${dialog.booking.id}-${dialog.kind}`}
          booking={dialog.booking}
          kind={dialog.kind}
          onClose={() => setDialog(null)}
          onDone={onDialogDone}
        />
      ) : null}
    </div>
  );
}
