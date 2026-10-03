"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Loader2, Mail, Ticket } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import { parseBookingCustomerName } from "@/lib/booking-guest-details";
import { ADMIN_ACTIVITY_EVENT, NotificationTracker, notificationHref, notificationSnapshotSchema, type NotificationSnapshot } from "@/lib/admin-notification-types";
import { useToast } from "./ToastProvider";

const POLL_VISIBLE_MS = 15_000;
const POLL_HIDDEN_MS = 60_000;

export function NotificationBell() {
  const { showToast } = useToast();
  const [open, setOpen] = useState<"booking" | "email" | null>(null);
  const panelId = useId();
  const [snapshot, setSnapshot] = useState<NotificationSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const trackerRef = useRef(new NotificationTracker());
  const versionRef = useRef(0);
  const retryAtRef = useRef(0);
  const expiredRef = useRef(false);

  const loadNotifications = useCallback(async () => {
    if (requestRef.current || expiredRef.current || Date.now() < retryAtRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    const version = versionRef.current;
    try {
      const response = await adminFetch("/api/admin/notifications", { signal: controller.signal, cache: "no-store" });
      if (response.status === 401) {
        expiredRef.current = true;
        setError("Your session has expired. Sign in again to receive alerts.");
        return;
      }
      if (response.status === 429) {
        const delay = Number(response.headers.get("Retry-After"));
        retryAtRef.current = Date.now() + Math.min(300, Math.max(15, Number.isFinite(delay) ? delay : 60)) * 1000;
      }
      if (!response.ok) throw new Error("Notifications unavailable");
      const data = notificationSnapshotSchema.parse(await response.json());
      if (controller.signal.aborted || version !== versionRef.current) return;
      setSnapshot(data);
      setError(null);
      retryAtRef.current = 0;
      const changes = trackerRef.current.update(data.activity);
      if (changes.bookings || changes.emails) {
        window.dispatchEvent(new CustomEvent(ADMIN_ACTIVITY_EVENT, { detail: changes }));
        showToast("info", changes.bookings && changes.emails ? "New booking requests and emails received. Open Bookings or Emails notifications to view them."
          : changes.bookings ? "New booking request received. Open Bookings notifications to view it." : "New email received. Open Emails notifications to read it.");
      }
    } catch {
      if (!controller.signal.aborted && version === versionRef.current) {
        retryAtRef.current = Math.max(retryAtRef.current, Date.now() + POLL_VISIBLE_MS);
        setError("Alerts are temporarily unavailable. Retrying automatically.");
      }
    } finally {
      if (requestRef.current === controller) requestRef.current = null;
      if (!controller.signal.aborted) setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const initial = window.setTimeout(() => void loadNotifications(), 0);
    let interval: number;
    const schedule = () => {
      window.clearInterval(interval);
      interval = window.setInterval(() => void loadNotifications(), document.visibilityState === "visible" ? POLL_VISIBLE_MS : POLL_HIDDEN_MS);
    };
    const wake = () => { if (document.visibilityState === "visible") void loadNotifications(); };
    const visibility = () => { schedule(); wake(); };
    schedule();
    window.addEventListener("focus", wake);
    window.addEventListener("online", wake);
    window.addEventListener(ADMIN_ACTIVITY_EVENT, wake);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
      requestRef.current?.abort();
      window.removeEventListener("focus", wake);
      window.removeEventListener("online", wake);
      window.removeEventListener(ADMIN_ACTIVITY_EVENT, wake);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [loadNotifications]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: MouseEvent) => { if (panelRef.current && !panelRef.current.contains(event.target as Node)) setOpen(null); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(null); };
    document.addEventListener("mousedown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("mousedown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);

  async function markBookingsSeen() {
    if (!snapshot || marking || !snapshot.bookingCount) return;
    setMarking(true);
    versionRef.current += 1;
    try {
      const response = await adminFetch("/api/admin/notifications", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ seenThrough: snapshot.bookingSeenThrough }),
      });
      if (!response.ok) throw new Error();
      setSnapshot(current => current ? { ...current, bookingCount: 0, unreadCount: current.emailCount, items: current.items.filter(item => item.kind === "email") } : current);
      setError(null);
      void loadNotifications();
    } catch { setError("Booking alerts could not be cleared. Please try again."); }
    finally { setMarking(false); }
  }

  const items = snapshot?.items.filter(item => item.kind === open) ?? [];
  return (
    <div className="relative flex shrink-0 items-center gap-2" ref={panelRef} role="group" aria-label="Booking and email notifications">
      {(["booking", "email"] as const).map(kind => {
        const count = (kind === "booking" ? snapshot?.bookingCount : snapshot?.emailCount) ?? 0;
        const label = kind === "booking" ? "Booking notifications" : "Email notifications";
        const color = kind === "booking" ? "var(--accent)" : "var(--success)";
        const Icon = kind === "booking" ? Ticket : Mail;
        return <button key={kind} type="button" onClick={() => { setOpen(current => current === kind ? null : kind); void loadNotifications(); }}
          className="admin-header-icon-btn relative transition-colors" title={label}
          style={{ borderColor: open === kind ? color : "var(--border)", background: open === kind ? "var(--bg-glass-hover)" : "var(--bg-glass)", color: error ? "var(--warning)" : color }}
          aria-label={count ? `${count} unread ${kind} notifications` : error ? `${label} unavailable` : label} aria-expanded={open === kind} aria-controls={open === kind ? panelId : undefined} aria-haspopup="dialog">
          <Icon className="h-4 w-4" aria-hidden />
          {count > 0 ? <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold" style={{ background: color, color: "var(--bg-primary)", border: "1px solid var(--border)" }}>{count > 9 ? "9+" : count}</span> : null}
        </button>;
      })}
      {open ? <div id={panelId} className="admin-notification-panel fixed inset-x-4 top-[4.5rem] z-[60] mx-auto max-h-[min(70vh,32rem)] w-auto overflow-hidden p-0 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[min(100vw-2rem,24rem)]" role="dialog" aria-label={open === "booking" ? "Booking notifications" : "Email notifications"}>
        <div className="admin-notification-panel__header px-4 py-3"><p className="text-sm font-semibold">{open === "booking" ? "Bookings" : "Emails"}</p><p className="mt-1 text-xs text-muted" aria-live="polite">{open === "booking" ? `${snapshot?.bookingCount ?? 0} new requests` : `${snapshot?.emailCount ?? 0} unread emails`}</p></div>
        <div className="flex flex-wrap gap-4 border-t px-4 py-3 text-xs" style={{ borderColor: "var(--border)", color: "var(--accent)" }}><Link href={open === "booking" ? "/admin/bookings" : "/admin/inbox"} onClick={() => setOpen(null)}>{open === "booking" ? "View bookings" : "View emails"}</Link>{open === "booking" && snapshot?.bookingCount ? <button type="button" disabled={marking} onClick={() => void markBookingsSeen()}>{marking ? "Clearing…" : "Clear booking alerts"}</button> : null}</div>
        {error ? <p className="px-4 py-3 text-xs" role="status" style={{ color: "var(--warning)" }}>{error}</p> : null}
        <div className="admin-notification-panel__list max-h-72 overflow-y-auto">
          {isLoading ? <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted"><Loader2 className="h-4 w-4 animate-spin" aria-hidden />Loading…</div>
            : !items.length ? <div className="px-4 py-8 text-center">{open === "booking" ? <Ticket className="mx-auto mb-2 h-7 w-7 text-muted" aria-hidden /> : <Mail className="mx-auto mb-2 h-7 w-7 text-muted" aria-hidden />}<p className="text-sm font-medium">{error ? "Waiting for connection" : "You’re up to date"}</p><p className="mt-1 text-xs text-muted">{open === "booking" ? "New booking requests appear here automatically." : "Unread received emails appear here automatically."}</p></div>
            : <ul>{items.map(item => <li key={`${item.kind}/${item.source}/${item.id}`} style={{ borderTop: "1px solid var(--border)" }}><Link href={notificationHref(item)} onClick={() => setOpen(null)} className="flex gap-3 px-4 py-3 transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_6%,transparent)]">
              {item.kind === "booking" ? <Ticket className="mt-1 h-4 w-4 shrink-0" style={{ color: "var(--accent)" }} aria-hidden /> : <Mail className="mt-1 h-4 w-4 shrink-0" style={{ color: "var(--success)" }} aria-hidden />}
              <div className="min-w-0"><p className="text-[10px] text-muted">{item.kind === "booking" ? "Booking request" : item.source === "booking" ? "Booking reply" : "Received email"}</p><p className="break-words text-sm font-medium">{item.kind === "booking" ? parseBookingCustomerName(item.name).guestName : item.name}</p><p className="mt-0.5 break-words text-xs text-muted">{item.description || "(No subject)"}</p><p className="mt-1 text-[11px] text-muted">{formatDistanceToNow(parseISO(item.createdAt), { addSuffix: true })}</p></div>
            </Link></li>)}</ul>}
        </div>
        <p className="border-t px-4 py-3 text-[11px] text-muted" style={{ borderColor: "var(--border)" }}>Checks every 15 seconds while visible. Emails stay unread until you mark them read.</p>
      </div> : null}
    </div>
  );
}
