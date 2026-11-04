"use client";

import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, LayoutList, Loader2, Plus, RefreshCw, RotateCcw, Search, Trash2 } from "lucide-react";
import { BookingCalendar } from "@/components/admin/BookingCalendar";
import { BookingsListView, type BookingGroup } from "@/components/admin/BookingsListView";
import { BookingActionDialog, type BookingActionKind } from "@/components/admin/bookings/BookingActions";
import { ClosureBookingsList } from "@/components/admin/bookings/ClosureBookings";
import { ManualBookingDialog } from "@/components/admin/bookings/ManualBooking";
import { useAdminPermission } from "@/components/admin/AdminAccessProvider";
import { useToast } from "@/components/admin/ToastProvider";
import type { AdminBookingDto, AdminBookingStage, AdminClosureBooking } from "@/lib/admin-bookings";
import { formatPrice } from "@/lib/client-dates";
import { ADMIN_BOOKINGS_TIMEOUT_MS, adminFetch, isTransientFetchError } from "@/lib/admin-fetch";
import { useAdminActivityRefresh } from "@/hooks/useAdminActivityRefresh";

type StageFilter = "all" | "new" | "invoiced" | "confirmed" | "availability" | "closed" | "other";
type ViewMode = "active" | "bin";
type LayoutView = "list" | "calendar";

const ACTIVE_STAGES: AdminBookingStage[] = ["new", "invoiced", "confirmed", "paid"];

/** The lists. Cancelled and declined bookings never mix with active ones; checkout holds keep their own list. */
const FILTERS: { id: StageFilter; label: string; hint: string; stages: AdminBookingStage[]; empty: string }[] = [
  { id: "all", label: "All active", hint: "New, awaiting and confirmed", stages: ACTIVE_STAGES, empty: "No active bookings. They appear here as soon as a guest sends a request." },
  { id: "new", label: "New requests", hint: "Confirm to send the invoice", stages: ["new"], empty: "No new requests waiting for you." },
  { id: "invoiced", label: "Awaiting payment", hint: "Invoice sent, deposit not in", stages: ["invoiced"], empty: "No invoices waiting for payment." },
  { id: "confirmed", label: "Confirmed", hint: "Deposit or more received", stages: ["confirmed", "paid"], empty: "No confirmed bookings yet." },
  { id: "availability", label: "Via Availability", hint: "Sold outside the website", stages: [], empty: "" },
  { id: "closed", label: "Cancelled", hint: "Cancelled and declined", stages: ["declined", "cancelled"], empty: "Nothing cancelled or declined." },
  { id: "other", label: "Holds & expired", hint: "", stages: ["hold", "expired"], empty: "No checkout holds or expired attempts." },
];

const STAGE_GROUPS: Record<Exclude<StageFilter, "availability">, { id: string; title: string; hint: string; stages: AdminBookingStage[] }[]> = {
  all: [
    { id: "new", title: "New requests", hint: "Review, then confirm to send the invoice", stages: ["new"] },
    { id: "invoiced", title: "Awaiting payment", hint: "Invoice sent, deposit not in yet", stages: ["invoiced"] },
    { id: "confirmed", title: "Confirmed", hint: "Soonest departure first", stages: ["confirmed", "paid"] },
  ],
  new: [{ id: "new", title: "New requests", hint: "Review, then confirm to send the invoice", stages: ["new"] }],
  invoiced: [{ id: "invoiced", title: "Awaiting payment", hint: "Invoice sent, deposit not in yet", stages: ["invoiced"] }],
  confirmed: [
    { id: "balance", title: "Balance still due", hint: "Soonest departure first", stages: ["confirmed"] },
    { id: "paid", title: "Paid in full", hint: "Nothing left to collect", stages: ["paid"] },
  ],
  closed: [
    { id: "cancelled", title: "Cancelled", hint: "Cancelled by the guest or by Hathor", stages: ["cancelled"] },
    { id: "declined", title: "Declined", hint: "Turned down, no fee charged", stages: ["declined"] },
  ],
  other: [
    { id: "hold", title: "Checkout holds", hint: "Guest is still at checkout", stages: ["hold"] },
    { id: "expired", title: "Expired", hint: "Checkout was never finished", stages: ["expired"] },
  ],
};

const byDeparture = (a: AdminBookingDto, b: AdminBookingDto) => a.departureTime.localeCompare(b.departureTime);

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
  const [closures, setClosures] = useState<AdminClosureBooking[]>([]);
  const [closuresFailed, setClosuresFailed] = useState(false);
  const [addingBooking, setAddingBooking] = useState(false);
  const canManageBookings = useAdminPermission("bookings.manage");
  const canManageAvailability = useAdminPermission("availability.manage");
  const canAddBooking = canManageBookings && canManageAvailability;

  const loadIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const setQuery = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("q", value);
    else params.delete("q");
    const qs = params.toString();
    router.replace(qs ? `/admin/bookings?${qs}` : "/admin/bookings");
  };

  const loadBookings = useCallback(async (silent = false) => {
    const loadId = ++loadIdRef.current;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    if (!silent) { setIsLoading(true); setLoadFailed(false); }

    for (let attempt = 0; ; attempt += 1) {
      try {
        const params = new URLSearchParams({ bin: viewMode === "bin" ? "true" : "false", status: "all" });
        const response = await adminFetch(`/api/admin/bookings?${params}`, { signal: controller.signal }, ADMIN_BOOKINGS_TIMEOUT_MS);
        if (loadId !== loadIdRef.current) return;
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Failed to load bookings");
        const nextBookings: AdminBookingDto[] = Array.isArray(data.bookings) ? data.bookings : [];
        setBookings(nextBookings);
        setLoadFailed(false);
        setLoadedAt(Date.now());
        if (silent) setSelectedIds(current => new Set([...current].filter(id => nextBookings.some(booking => booking.id === id))));
        else setSelectedIds(new Set());
        setIsLoading(false);
        return;
      } catch (err) {
        if (loadId !== loadIdRef.current) return;
        if (attempt < 1 && isTransientFetchError(err)) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          continue;
        }
        if (!silent) setLoadFailed(true);
        setIsLoading(false);
        if (!silent) showToast("error", err instanceof Error ? err.message : "Failed to load bookings");
        return;
      }
    }
  }, [showToast, viewMode]);

  const loadClosures = useCallback(async () => {
    try {
      const response = await adminFetch("/api/admin/closure-bookings", {}, ADMIN_BOOKINGS_TIMEOUT_MS);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to load");
      setClosures(Array.isArray(data.closures) ? data.closures : []);
      setClosuresFailed(false);
    } catch {
      setClosuresFailed(true);
    }
  }, []);

  useEffect(() => {
    void loadBookings(); // eslint-disable-line react-hooks/set-state-in-effect -- dashboard data load
  }, [loadBookings]);

  useEffect(() => {
    void loadClosures(); // eslint-disable-line react-hooks/set-state-in-effect -- dashboard data load
  }, [loadClosures]);

  const refreshActivity = useCallback(() => {
    void loadBookings(loadedAt > 0);
    void loadClosures();
  }, [loadBookings, loadClosures, loadedAt]);
  useAdminActivityRefresh("bookings", refreshActivity, Boolean(dialog) || addingBooking || isBulkWorking || isLoading);

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

  const searchedClosures = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return closures;
    return closures.filter((closure) =>
      [closure.note, closure.voyage, closure.roomNames.join(" "), closure.sale?.guestName, closure.sale?.customerEmail, closure.sale?.customerPhone, closure.sale?.source]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [closures, query]);

  const counts = useMemo(() => {
    const map = new Map<StageFilter, number>();
    for (const entry of FILTERS) {
      map.set(entry.id, entry.id === "availability" ? searchedClosures.length : searched.filter((booking) => entry.stages.includes(booking.stage)).length);
    }
    return map;
  }, [searched, searchedClosures]);

  const activeFilter = FILTERS.find((entry) => entry.id === filter) ?? FILTERS[0]!;
  const showingClosures = viewMode === "active" && filter === "availability";

  const groups = useMemo<BookingGroup[]>(() => {
    if (viewMode === "bin") return [{ id: "bin", title: "Recycle bin", hint: "Removed after 7 days", bookings: searched }];
    if (filter === "availability") return [];
    return STAGE_GROUPS[filter].map((group) => ({
      id: group.id,
      title: group.title,
      hint: group.hint,
      bookings: searched.filter((booking) => group.stages.includes(booking.stage)).sort(byDeparture),
    }));
  }, [searched, filter, viewMode]);

  const visible = useMemo(() => groups.flatMap((group) => group.bookings), [groups]);

  const { upcomingGuests, toCollectCents } = useMemo(() => {
    const live = bookings.filter((booking) => (booking.stage === "confirmed" || booking.stage === "paid") && Date.parse(booking.departureTime) > loadedAt);
    return {
      upcomingGuests: live.reduce((total, booking) => total + (booking.partySize ?? 0), 0),
      toCollectCents:
        live.reduce((total, booking) => total + Math.max(0, booking.totalPriceCents - booking.paidCents), 0) +
        closures.reduce((total, closure) => total + (closure.sale ? closure.sale.totalPriceCents - closure.sale.receivedCents : 0), 0),
    };
  }, [bookings, closures, loadedAt]);

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

  const openList = (id: StageFilter) => {
    setLayoutView("list");
    setFilter(id);
    setSelectedIds(new Set());
  };

  const leaveBin = () => {
    loadIdRef.current += 1;
    setViewMode("active");
    setLayoutView("list");
    setFilter("all");
  };

  return (
    <div className="space-y-6">
      <div className="bk-pagehead">
        <div>
          <h1 className="admin-page-title">Bookings</h1>
          <p className="admin-page-subtitle">Confirm requests, send invoices, record payments and reply to guests.</p>
        </div>
        <div className="bk-pulse">
          <div><strong className="tabular">{isLoading ? "–" : upcomingGuests}</strong><span>guests sailing</span></div>
          <div><strong className="tabular">{isLoading ? "–" : formatPrice(toCollectCents)}</strong><span>still to collect</span></div>
        </div>
      </div>

      {viewMode === "active" && (
        <section className="bk-tiles" aria-label="Booking lists">
          {FILTERS.filter((entry) => entry.id !== "other").map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => openList(entry.id)}
              aria-pressed={filter === entry.id && layoutView === "list"}
              className="card bk-tile"
            >
              <span className="bk-tile__label">{entry.label}</span>
              <span className="bk-tile__value tabular">{isLoading ? "–" : counts.get(entry.id) ?? 0}</span>
              <span className="bk-tile__hint">{entry.hint}</span>
            </button>
          ))}
        </section>
      )}

      <div className="bk-tools">
        {viewMode === "active" && (
          <div className="flex shrink-0 rounded-xl border p-1" style={{ borderColor: "var(--border)" }}>
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
        <span className="flex-1" />
        {viewMode === "active" && canAddBooking ? (
          <button type="button" onClick={() => setAddingBooking(true)} className="btn-primary h-9 px-3.5 text-sm">
            <Plus className="h-4 w-4" aria-hidden />
            Add booking
          </button>
        ) : null}
        {viewMode === "active" ? (
          <button
            type="button"
            onClick={() => openList("other")}
            className={`admin-filter-tab ${filter === "other" && layoutView === "list" ? "admin-filter-tab--active" : ""}`}
          >
            Holds &amp; expired
            {!isLoading ? <span className="ml-1.5 tabular opacity-70">{counts.get("other") ?? 0}</span> : null}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => {
            if (viewMode === "bin") {
              leaveBin();
              return;
            }
            loadIdRef.current += 1;
            setViewMode("bin");
            setLayoutView("list");
            setFilter("all");
          }}
          className={`admin-filter-tab ${viewMode === "bin" ? "admin-filter-tab--danger-active" : "admin-filter-tab--danger"}`}
        >
          {viewMode === "bin" ? "Back to bookings" : "Recycle bin"}
        </button>
        <button
          type="button"
          onClick={() => {
            void loadBookings();
            void loadClosures();
          }}
          disabled={isLoading}
          className="btn-ghost h-9 px-3 text-sm disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {layoutView === "list" && !showingClosures && (
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
      ) : showingClosures ? (
        <ClosureBookingsList closures={searchedClosures} loadFailed={closuresFailed} onChanged={() => void loadClosures()} />
      ) : (
        <BookingsListView
          groups={groups}
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

      {addingBooking ? (
        <ManualBookingDialog
          onClose={() => setAddingBooking(false)}
          onSaved={() => {
            setAddingBooking(false);
            void loadClosures();
            openList("availability");
          }}
        />
      ) : null}

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
