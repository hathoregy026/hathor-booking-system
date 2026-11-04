"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { Loader2, Search } from "lucide-react";
import { useAdminAccess } from "./AdminAccessProvider";
import { canVisitAdminPage, hasAdminPermission } from "@/lib/admin-permissions";
import { adminFetch } from "@/lib/admin-fetch";

/*
 * One search for the whole dashboard, in the header. It finds pages, bookings
 * and emails, each only where this person may look. Every page keeps its own
 * search for its own list; this one is for jumping anywhere.
 */

const PAGES: { href: string; title: string; words: string }[] = [
  { href: "/admin", title: "Dashboard", words: "home overview today" },
  { href: "/admin/analytics", title: "Analytics", words: "visitors traffic reports stats" },
  { href: "/admin/bookings", title: "Bookings", words: "reservations requests invoices payments guests" },
  { href: "/admin/inbox", title: "Emails", words: "inbox mail messages replies" },
  { href: "/admin/bulk-emails", title: "Bulk emails", words: "newsletter campaign marketing" },
  { href: "/admin/availability", title: "Availability", words: "cabins rooms close open sailings calendar" },
  { href: "/admin/cruises", title: "Cruises", words: "voyages schedules departures itinerary" },
  { href: "/admin/ship-experience", title: "Ship Experience", words: "deck map tour" },
  { href: "/admin/prices", title: "Prices & Cabins", words: "rates pricing suites" },
  { href: "/admin/website-text", title: "Website Text", words: "copy words content translations" },
  { href: "/admin/typography", title: "Typography", words: "fonts styles" },
  { href: "/admin/content", title: "Website Images", words: "photos pictures media" },
  { href: "/admin/occasions", title: "Occasions", words: "seasonal new year christmas banner" },
  { href: "/admin/cms", title: "CMS", words: "content pages" },
  { href: "/admin/blogs", title: "Blog Posts", words: "journal articles" },
  { href: "/admin/email-templates", title: "Email Templates", words: "templates confirmation invoice" },
  { href: "/admin/storage", title: "Storage", words: "files uploads" },
  { href: "/admin/people", title: "People & roles", words: "team users staff permissions" },
  { href: "/admin/settings", title: "Settings", words: "preferences security" },
];

type BookingHit = { id: string; code: string; name: string; email: string | null; status: string; departure: string | null; cruiseName: string | null };
type EmailHit = { id: string; source: string; subject: string | null; sender: string; correspondentName: string | null; createdAt: string };
type Hit = { key: string; group: "Pages" | "Bookings" | "Emails"; title: string; detail: string; href: string };

const STATUS: Record<string, string> = {
  REQUESTED: "Request", CONFIRMED: "Confirmed", PENDING_HOLD: "On hold", CANCELLED: "Cancelled", DECLINED: "Declined", EXPIRED: "Expired",
};
const shortDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" });

async function readList<T>(url: string, key: string, signal: AbortSignal): Promise<T[]> {
  try {
    const response = await adminFetch(url, { cache: "no-store", signal });
    if (!response.ok) return [];
    const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    return Array.isArray(body[key]) ? (body[key] as T[]) : [];
  } catch {
    return [];
  }
}

export function GlobalSearch({ inputRef, onNavigate, className = "" }: { inputRef?: RefObject<HTMLInputElement | null>; onNavigate?: () => void; className?: string }) {
  const router = useRouter();
  const access = useAdminAccess();
  const canBookings = hasAdminPermission(access, "bookings.view");
  const canEmails = hasAdminPermission(access, "inbox.view");
  const listId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [bookings, setBookings] = useState<BookingHit[]>([]);
  const [emails, setEmails] = useState<EmailHit[]>([]);
  const [loading, setLoading] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const text = query.trim();

  // Bookings and emails, a moment after typing stops.
  useEffect(() => {
    const controller = new AbortController();
    if (text.length < 2) {
      queueMicrotask(() => { if (!controller.signal.aborted) { setBookings([]); setEmails([]); setLoading(false); } });
      return () => controller.abort();
    }
    const timer = window.setTimeout(() => {
      setLoading(true);
      const q = encodeURIComponent(text);
      Promise.all([
        canBookings ? readList<BookingHit>(`/api/admin/search?q=${q}`, "bookings", controller.signal) : Promise.resolve([]),
        canEmails ? readList<EmailHit>(`/api/admin/inbox?q=${q}`, "messages", controller.signal) : Promise.resolve([]),
      ]).then(([bookingHits, emailHits]) => {
        if (controller.signal.aborted) return;
        setBookings(bookingHits);
        setEmails(emailHits.slice(0, 4));
        setLoading(false);
      });
    }, 250);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [text, canBookings, canEmails]);

  const hits = useMemo<Hit[]>(() => {
    if (!text) return [];
    const needle = text.toLowerCase();
    const pages = PAGES
      .filter(page => canVisitAdminPage(access, page.href) && `${page.title} ${page.words}`.toLowerCase().includes(needle))
      .slice(0, 4)
      .map(page => ({ key: `page:${page.href}`, group: "Pages" as const, title: page.title, detail: "Open page", href: page.href }));
    const bookingHits = text.length < 2 ? [] : bookings.map(hit => ({
      key: `booking:${hit.id}`, group: "Bookings" as const, title: hit.name,
      detail: [hit.code, STATUS[hit.status] ?? hit.status, hit.departure ? shortDate(hit.departure) : null].filter(Boolean).join(" · "),
      href: `/admin/bookings/${hit.id}`,
    }));
    const emailHits = text.length < 2 ? [] : emails.map(hit => ({
      key: `email:${hit.source}:${hit.id}`, group: "Emails" as const, title: hit.subject?.trim() || "(no subject)",
      detail: [hit.correspondentName || hit.sender, shortDate(hit.createdAt)].filter(Boolean).join(" · "),
      href: `/admin/inbox?source=${encodeURIComponent(hit.source)}&message=${encodeURIComponent(hit.id)}`,
    }));
    return [...pages, ...bookingHits, ...emailHits];
  }, [text, access, bookings, emails]);

  // Close when a click lands outside the search.
  useEffect(() => {
    if (!open) return;
    const away = (event: PointerEvent) => { if (!box.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  function go(hit: Hit | undefined) {
    if (!hit) return;
    setOpen(false);
    setQuery("");
    onNavigate?.();
    router.push(hit.href);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); setActive(index => Math.min(hits.length - 1, index + 1)); }
    else if (event.key === "ArrowUp") { event.preventDefault(); setActive(index => Math.max(0, index - 1)); }
    else if (event.key === "Enter") { event.preventDefault(); go(hits[Math.min(active, hits.length - 1)]); }
    else if (event.key === "Escape" && open) { event.preventDefault(); setOpen(false); }
  }

  const showPanel = open && text.length > 0;
  const current = Math.min(active, Math.max(0, hits.length - 1));

  return (
    <div ref={box} className={`admin-search admin-gsearch ${className}`} role="search">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-muted)" }} aria-hidden />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={event => { setQuery(event.target.value); setActive(0); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search the dashboard…"
        aria-label="Search the dashboard"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showPanel && hits[current] ? `${listId}-${current}` : undefined}
        className="input"
        maxLength={120}
      />
      {showPanel ? (
        <div className="admin-gsearch__panel">
          <ul id={listId} role="listbox" aria-label="Search results" className="admin-gsearch__list">
            {hits.map((hit, index) => (
              <li key={hit.key} role="presentation">
                {index === 0 || hits[index - 1]!.group !== hit.group ? <p className="admin-gsearch__group" aria-hidden>{hit.group}</p> : null}
                <div
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === current}
                  className={`admin-gsearch__hit${index === current ? " is-active" : ""}`}
                  onPointerEnter={() => setActive(index)}
                  onClick={() => go(hit)}
                >
                  <span className="admin-gsearch__title">{hit.title}</span>
                  <span className="admin-gsearch__detail">{hit.detail}</span>
                </div>
              </li>
            ))}
          </ul>
          {loading ? (
            <p className="admin-gsearch__note"><Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Searching bookings and emails…</p>
          ) : !hits.length ? (
            <p className="admin-gsearch__note">{text.length < 2 ? "Keep typing to search bookings and emails." : `Nothing matches “${text}”.`}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
