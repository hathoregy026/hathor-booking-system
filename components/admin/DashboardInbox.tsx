"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, Inbox, Paperclip, RefreshCw, Search } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import { EmailMessageBody } from "@/components/admin/EmailMessageBody";
import { DASHBOARD_INBOX_ADDRESS, type InboxDetail, type InboxPage, type InboxSource, type InboxSummary } from "@/lib/inbox-types";

const messageTime = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Cairo", dateStyle: "medium", timeStyle: "short" });
const keyOf = (message: { source: InboxSource; id: string }) => `${message.source}/${message.id}`;

export function DashboardInbox() {
  const [messages, setMessages] = useState<InboxSummary[]>([]);
  const [unread, setUnread] = useState(0);
  const [hasOlder, setHasOlder] = useState(false);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<InboxDetail | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [marking, setMarking] = useState(false);
  const [version, setVersion] = useState(0);
  const [cursor, setCursor] = useState<InboxSummary | null>(null);
  const detailRef = useRef<HTMLElement>(null);

  function refresh() { setCursor(null); setVersion(current => current + 1); }
  function selectMessage(key: string | null) { setDetail(null); setDetailError(null); setSelected(key); }

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setBusy(true);
      setError(null);
      try {
        const params = new URLSearchParams({ q: query, filter });
        if (cursor) {
          params.set("before", cursor.createdAt);
          params.set("cursorId", cursor.id);
          params.set("cursorSource", cursor.source);
        }
        const response = await adminFetch(`/api/admin/inbox?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error();
        const data = await response.json() as InboxPage;
        if (controller.signal.aborted) return;
        setMessages(current => cursor ? [...current, ...data.messages].filter((message, index, all) => all.findIndex(item => keyOf(item) === keyOf(message)) === index) : data.messages);
        setHasOlder(data.hasOlder);
        setUnread(data.unreadCount);
      } catch { if (!controller.signal.aborted) setError("Emails could not be loaded. Refresh to try again."); }
      finally { if (!controller.signal.aborted) setBusy(false); }
    }
    void load();
    return () => controller.abort();
  }, [query, filter, cursor, version]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") { setCursor(null); setVersion(current => current + 1); }
    }, 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!selected) return;
    const controller = new AbortController();
    async function load() {
      try {
        const response = await adminFetch(`/api/admin/inbox/${selected}`, { signal: controller.signal });
        if (!response.ok) throw new Error();
        const data = await response.json() as { message: InboxDetail };
        if (!controller.signal.aborted) setDetail(data.message);
      } catch { if (!controller.signal.aborted) setDetailError("This email could not be opened. Return to Emails and try again."); }
    }
    void load();
    detailRef.current?.focus();
    return () => controller.abort();
  }, [selected]);

  async function markRead() {
    if (!detail || marking) return;
    const currentKey = keyOf(detail);
    const read = !detail.readAt;
    setMarking(true);
    setDetailError(null);
    try {
      const response = await adminFetch(`/api/admin/inbox/${currentKey}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ read }),
      });
      if (!response.ok) throw new Error();
      setDetail(current => current && keyOf(current) === currentKey ? { ...current, readAt: read ? new Date().toISOString() : null } : current);
      refresh();
    } catch { setDetailError("Read status could not be saved. Please try again."); }
    finally { setMarking(false); }
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    setCursor(null);
    setQuery(search.trim());
    selectMessage(null);
    setVersion(current => current + 1);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="admin-page-title">Emails</h1>
          <p className="admin-page-subtitle">Customer emails and booking replies, together in your dashboard.</p>
          <p className="mt-2 text-sm text-muted" aria-live="polite">{unread} unread · Times shown in Cairo</p>
        </div>
        <button type="button" className="btn-outline" onClick={refresh} disabled={busy}>
          <RefreshCw className={`h-4 w-4${busy ? " animate-spin" : ""}`} aria-hidden />Refresh emails
        </button>
      </header>
      <details className="text-sm text-muted">
        <summary className="cursor-pointer">Receiving address & mailbox setup</summary>
        <p className="mt-2 max-w-3xl break-words leading-relaxed">Booking replies arrive automatically through your reply address. To include new emails sent directly to reservations@hathorcruise.com, configure Bluehost to forward a copy to {DASHBOARD_INBOX_ADDRESS}, keeping the original in your mailbox. Existing mailbox history is not imported. Do not change your main domain’s MX records.</p>
      </details>
      <form onSubmit={submitSearch} className="dashboard-inbox__toolbar">
        <label className="sr-only" htmlFor="inbox-search">Search sender or subject</label>
        <input id="inbox-search" className="admin-input" type="search" maxLength={120} value={search} onChange={event => setSearch(event.target.value)} placeholder="Search sender or subject…" />
        <button className="btn-outline" type="submit"><Search className="h-4 w-4" aria-hidden />Search</button>
        <label className="sr-only" htmlFor="inbox-filter">Filter emails</label>
        <select id="inbox-filter" className="admin-input" value={filter} onChange={event => { setCursor(null); setFilter(event.target.value); selectMessage(null); }}>
          <option value="all">All received</option><option value="unread">Unread</option>
        </select>
      </form>
      {error ? <p role="alert" className="text-sm" style={{ color: "var(--danger)" }}>{error}</p> : null}
      <div className="dashboard-inbox__workspace" data-selected={Boolean(selected)}>
        <section className="card dashboard-inbox__list" aria-label="Received emails" aria-busy={busy}>
          {!messages.length ? <div className="px-6 py-12 text-center"><Inbox className="mx-auto mb-4 h-8 w-8 text-muted" aria-hidden /><p className="font-semibold">{busy ? "Loading your emails…" : "No emails here yet"}</p><p className="mt-2 text-sm text-muted">{query || filter === "unread" ? "Try a different search or select All received." : "New customer emails appear here once Resend receives them."}</p></div> : null}
          <ol>
            {messages.map(message => (
              <li key={keyOf(message)}>
                <button type="button" className="dashboard-inbox__message" aria-pressed={selected === keyOf(message)} onClick={() => { if (selected !== keyOf(message)) selectMessage(keyOf(message)); }}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs text-muted"><span>{message.source === "booking" ? "Booking reply" : "General email"}{message.readAt ? "" : " · Unread"}</span>{message.attachmentCount ? <span className="flex items-center gap-1"><Paperclip className="h-3 w-3" aria-hidden />{message.attachmentCount}</span> : null}</div>
                  <p className={`text-sm${message.readAt ? "" : " font-semibold"}`}>{message.sender}</p>
                  <p className="mt-1 text-sm font-semibold">{message.subject || "(No subject)"}</p>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">{message.preview || "(No message text)"}</p>
                  <time className="mt-3 block text-xs text-muted" dateTime={message.createdAt}>{messageTime.format(new Date(message.createdAt))}</time>
                </button>
              </li>
            ))}
          </ol>
          {hasOlder ? <div className="p-4"><button type="button" className="btn-outline w-full" disabled={busy} onClick={() => setCursor(messages[messages.length - 1] ?? null)}>Load older emails</button></div> : null}
        </section>
        <section ref={detailRef} tabIndex={-1} className="card dashboard-inbox__detail p-5 sm:p-7" aria-label="Email details">
          {selected ? <button type="button" className="btn-outline mb-5" onClick={() => selectMessage(null)}><ArrowLeft className="h-4 w-4" aria-hidden />Back to emails</button> : null}
          {detailError ? <p role="alert" className="mb-4 text-sm" style={{ color: "var(--danger)" }}>{detailError}</p> : null}
          {!detail ? <p className="py-10 text-center text-sm text-muted">{selected ? detailError ? "Unable to open email." : "Opening email…" : "Select an email to read its message and attachments."}</p> : (
            <article className="min-w-0">
              <h2 className="break-words text-xl font-semibold">{detail.subject || "(No subject)"}</h2>
              <dl className="mt-5 space-y-2 break-words text-sm"><div><dt className="inline text-muted">From: </dt><dd className="inline">{detail.sender}</dd></div><div><dt className="inline text-muted">To: </dt><dd className="inline">{detail.recipient}</dd></div><div><dt className="inline text-muted">Received: </dt><dd className="inline"><time dateTime={detail.createdAt}>{messageTime.format(new Date(detail.createdAt))}</time></dd></div></dl>
              {!detail.senderMatchesGuest ? <p className="mt-4 text-sm text-muted">This sender differs from the booking’s guest email. Verify their identity before taking action.</p> : null}
              <div className="my-6 flex flex-wrap gap-3">
                <button type="button" className="btn-outline" disabled={marking} onClick={() => void markRead()}>{marking ? "Saving…" : detail.readAt ? "Mark unread" : "Mark read"}</button>
                {detail.bookingId ? <Link className="btn-primary" href={`/admin/bookings/${encodeURIComponent(detail.bookingId)}`}>Open booking & reply</Link> : <a className="btn-primary" href={`mailto:${encodeURIComponent(detail.sender)}?subject=${encodeURIComponent(`Re: ${detail.subject}`)}`}>Reply in your mail app</a>}
              </div>
              {detail.source === "general" ? <p className="mb-6 text-xs text-muted">Replies sent from your mail app stay in that mailbox, not in this dashboard.</p> : null}
              <div className="border-t pt-6 text-sm" style={{ borderColor: "var(--border)" }}><EmailMessageBody key={keyOf(detail)} bodyText={detail.bodyText} formattedUrl={`/api/admin/inbox/${keyOf(detail)}/formatted`} /></div>
              {detail.attachments.length ? <div className="mt-7 border-t pt-5" style={{ borderColor: "var(--border)" }}><h3 className="mb-3 text-sm font-semibold">Attachments</h3><ul className="space-y-2">{detail.attachments.map(file => (
                <li key={file.id}><a className="inline-flex max-w-full items-center gap-2 break-all text-sm underline underline-offset-4" target="_blank" rel="noopener noreferrer" href={detail.bookingId ? `/api/admin/bookings/${encodeURIComponent(detail.bookingId)}/messages/${detail.id}/attachments/${file.id}` : `/api/admin/inbox/general/${detail.id}/attachments/${file.id}`}><Paperclip className="h-4 w-4 shrink-0" aria-hidden />{file.filename}</a></li>
              ))}</ul><p className="mt-3 text-xs text-muted">Open only files you trust. Attachment availability follows Resend’s retention policy.</p></div> : null}
            </article>
          )}
        </section>
      </div>
    </div>
  );
}
