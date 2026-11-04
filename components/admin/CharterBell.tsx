"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Anchor, Loader2 } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import { ADMIN_ACTIVITY_EVENT } from "@/lib/admin-notification-types";
import { charterRequestHref, type ChartersSnapshot } from "@/lib/admin-charters";

/*
 * Header alert for charters: requests from the website's charter form and
 * whole-ship charters closed by hand on Availability. The badge counts what
 * arrived since you last opened this panel on this device.
 */

const POLL_MS = 60_000;
const SEEN_KEY = "hathor-admin-charters-seen-at";
const FIRST_LOOK_DAYS = 7;
const COLOR = "var(--info)";

type Item = { key: string; kind: "request" | "manual"; name: string; detail: string; createdAt: string; href: string; unread: boolean };

function readSeenAt(): number {
  try {
    const value = Number(window.localStorage.getItem(SEEN_KEY));
    if (Number.isFinite(value) && value > 0) return value;
  } catch { /* storage unavailable */ }
  return Date.now() - FIRST_LOOK_DAYS * 86_400_000;
}

function writeSeenAt(value: number) {
  try { window.localStorage.setItem(SEEN_KEY, String(value)); } catch { /* storage unavailable */ }
}

const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" });

export function CharterBell() {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<ChartersSnapshot | null>(null);
  const [failed, setFailed] = useState(false);
  const [seenAt, setSeenAt] = useState<number | null>(null);
  /** What counted as new when the panel opened, so its highlights survive the badge clearing. */
  const [highlightSince, setHighlightSince] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const busy = useRef(false);

  const load = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      const response = await adminFetch("/api/admin/charters", { cache: "no-store" });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error();
      setSnapshot({ requests: Array.isArray(body.requests) ? body.requests : [], manual: Array.isArray(body.manual) ? body.manual : [] });
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      busy.current = false;
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => setSeenAt(readSeenAt()));
    const first = window.setTimeout(() => void load(), 0);
    const interval = window.setInterval(() => { if (document.visibilityState === "visible") void load(); }, POLL_MS);
    const wake = () => void load();
    window.addEventListener(ADMIN_ACTIVITY_EVENT, wake);
    window.addEventListener("focus", wake);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(interval);
      window.removeEventListener(ADMIN_ACTIVITY_EVENT, wake);
      window.removeEventListener("focus", wake);
    };
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: MouseEvent) => { if (panelRef.current && !panelRef.current.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("mousedown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);

  const since = seenAt ?? Number.POSITIVE_INFINITY;
  const items: Item[] = [
    ...(snapshot?.requests ?? []).map(request => ({
      key: `request:${request.id}`, kind: "request" as const, name: request.name,
      detail: request.subject, createdAt: request.createdAt, href: charterRequestHref(request.id),
      unread: !request.read,
    })),
    ...(snapshot?.manual ?? []).map(charter => ({
      key: `manual:${charter.blockKey}`, kind: "manual" as const, name: charter.name,
      detail: [charter.voyage, `${day(charter.startsAt)} – ${day(charter.endsAt)}`].filter(Boolean).join(" · "),
      createdAt: charter.createdAt, href: "/admin/bookings?list=charter",
      unread: true,
    })),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 20);
  const isNew = (item: Item, after: number) => item.unread && Date.parse(item.createdAt) > after;
  const count = items.filter(item => isNew(item, since)).length;
  const panelSince = highlightSince ?? since;

  function toggle() {
    setOpen(current => {
      if (!current) {
        const now = Date.now();
        writeSeenAt(now);
        setHighlightSince(seenAt);
        setSeenAt(now);
        void load();
      }
      return !current;
    });
  }

  return (
    <div className="relative flex shrink-0 items-center" ref={panelRef}>
      <button
        type="button"
        onClick={toggle}
        className="admin-header-icon-btn relative transition-colors"
        title="Charter notifications"
        style={{ borderColor: open ? COLOR : "var(--border)", background: open ? "var(--bg-glass-hover)" : "var(--bg-glass)", color: failed ? "var(--warning)" : COLOR }}
        aria-label={count ? `${count} new charter notifications` : "Charter notifications"}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-haspopup="dialog"
      >
        <Anchor className="h-4 w-4" aria-hidden />
        {count > 0 ? <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold" style={{ background: COLOR, color: "var(--bg-primary)", border: "1px solid var(--border)" }}>{count > 9 ? "9+" : count}</span> : null}
      </button>
      {open ? (
        <div id={panelId} className="admin-notification-panel fixed inset-x-4 top-[4.5rem] z-[60] mx-auto max-h-[min(70vh,32rem)] w-auto overflow-hidden p-0 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[min(100vw-2rem,24rem)]" role="dialog" aria-label="Charter notifications">
          <div className="admin-notification-panel__header px-4 py-3">
            <p className="text-sm font-semibold">Charters</p>
            <p className="mt-1 text-xs text-muted">Website charter requests and charters closed on Availability</p>
          </div>
          <div className="flex flex-wrap gap-4 border-t px-4 py-3 text-xs" style={{ borderColor: "var(--border)", color: "var(--accent)" }}>
            <Link href="/admin/bookings?list=charter" onClick={() => setOpen(false)}>View charters</Link>
          </div>
          {failed ? <p className="px-4 py-3 text-xs" role="status" style={{ color: "var(--warning)" }}>Charters are temporarily unavailable. Retrying automatically.</p> : null}
          <div className="admin-notification-panel__list max-h-72 overflow-y-auto">
            {!snapshot && !failed ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted"><Loader2 className="h-4 w-4 animate-spin" aria-hidden />Loading…</div>
            ) : !items.length ? (
              <div className="px-4 py-8 text-center">
                <Anchor className="mx-auto mb-2 h-7 w-7 text-muted" aria-hidden />
                <p className="text-sm font-medium">No charters yet</p>
                <p className="mt-1 text-xs text-muted">Charter requests from the website and charters you close on Availability appear here.</p>
              </div>
            ) : (
              <ul>
                {items.map(item => (
                  <li key={item.key} style={{ borderTop: "1px solid var(--border)" }}>
                    <Link href={item.href} onClick={() => setOpen(false)} className="flex gap-3 px-4 py-3 transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_6%,transparent)]">
                      <Anchor className="mt-1 h-4 w-4 shrink-0" style={{ color: COLOR }} aria-hidden />
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted">
                          {item.kind === "request" ? "Website charter request" : "Charter closed on Availability"}
                          {isNew(item, panelSince) ? <span className="ml-1.5 font-semibold" style={{ color: COLOR }}>New</span> : null}
                        </p>
                        <p className="break-words text-sm font-medium">{item.name}</p>
                        <p className="mt-0.5 break-words text-xs text-muted">{item.detail}</p>
                        <p className="mt-1 text-[11px] text-muted">{formatDistanceToNow(parseISO(item.createdAt), { addSuffix: true })}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
