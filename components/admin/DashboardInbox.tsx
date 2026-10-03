"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useAdminActivityRefresh } from "@/hooks/useAdminActivityRefresh";
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, CheckCheck, Inbox, Mail, Paperclip, Plus, RefreshCw, Search } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import { EmailMessageBody } from "@/components/admin/EmailMessageBody";
import { EmailComposer, type EmailDraft } from "@/components/admin/EmailComposer";
import { correspondentInitials, correspondentLabel } from "@/lib/email-correspondent";
import { DASHBOARD_INBOX_ADDRESS, type InboxCounts, type InboxDetail, type InboxFilter, type InboxPage, type InboxSource, type InboxSummary } from "@/lib/inbox-types";

const messageTime = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Cairo", dateStyle: "medium", timeStyle: "short" });
const keyOf = (message: { source: InboxSource; id: string }) => `${message.source}/${message.id}`;
const filters: { value: InboxFilter; label: string }[] = [{ value: "all", label: "All emails" }, { value: "unread", label: "Unread" }, { value: "received", label: "Received" }, { value: "sent", label: "Sent" }];
const toneOf = (message: InboxSummary) => message.direction === "OUTBOUND" ? "sent" : message.readAt ? "received" : "unread";
const contactOf = (message: InboxSummary) => message.direction === "OUTBOUND" ? message.recipient : message.sender;
const statusOf = (message: InboxSummary) => message.direction !== "OUTBOUND" ? message.readAt ? "Received" : "Unread" : message.status === "SENT" ? "Sent" : message.status === "FAILED" ? "Not sent" : "Sending unconfirmed";

export function DashboardInbox({ requestedEmail }: { requestedEmail?: string | null } = {}) {
  const [messages, setMessages] = useState<InboxSummary[]>([]);
  const [unread, setUnread] = useState(0);
  const [counts, setCounts] = useState<InboxCounts>({ all: 0, unread: 0, received: 0, sent: 0 });
  const [draft, setDraft] = useState<(EmailDraft & { key: string }) | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [hasOlder, setHasOlder] = useState(false);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<InboxDetail | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [marking, setMarking] = useState(false);
  const [version, setVersion] = useState(0);
  const [cursor, setCursor] = useState<InboxSummary | null>(null);
  const detailRef = useRef<HTMLElement>(null);

  const refresh = useCallback(() => { setCursor(null); setVersion(current => current + 1); }, []);
  useAdminActivityRefresh("emails", refresh);
  function selectMessage(key: string | null) { setDetail(null); setDetailError(null); setSelected(key); }

  useEffect(() => {
    const [source, id] = requestedEmail?.split("/") ?? [];
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) || (source !== "booking" && source !== "general")) return;
    const timer = window.setTimeout(() => { setDetail(null); setDetailError(null); setSelected(`${source}/${id}`); }, 0);
    return () => window.clearTimeout(timer);
  }, [requestedEmail]);

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
        setCounts(data.counts ?? { all: data.messages.length, unread: data.unreadCount, received: data.messages.length, sent: 0 });
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
    if (!detail || detail.direction === "OUTBOUND" || marking) return;
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

  function compose(initial: EmailDraft = { to: "", recipientName: "", subject: "" }) {
    if (draft) return;
    selectMessage(null);
    setNotice(null);
    setDraft({ ...initial, key: crypto.randomUUID() });
  }

  function sent(id: string) {
    setDraft(null);
    setSearch("");
    setQuery("");
    setFilter("sent");
    selectMessage(`general/${id}`);
    setNotice("Your email was accepted by Resend. Find this request in Sent; delivery has not yet been confirmed.");
    refresh();
  }

  return (
    <div className="emails-page">
      <header className="emails-page__header">
        <div>
          <p className="emails-eyebrow">Hathor correspondence</p>
          <h1 className="admin-page-title">Emails</h1>
          <p className="admin-page-subtitle">Guest conversations and personal messages, in one place.</p>
          <p className="emails-page__caption" aria-live="polite">{unread} unread · Times shown in Cairo</p>
        </div>
        <div className="emails-page__actions">
        <button type="button" className="btn-outline" onClick={refresh} disabled={busy}>
          <RefreshCw className={`h-4 w-4${busy ? " animate-spin" : ""}`} aria-hidden /><span>Refresh emails</span>
        </button>
        <button type="button" className="btn-primary" onClick={() => compose()} disabled={Boolean(draft)}><Plus size={17} aria-hidden />Send new email</button>
        </div>
      </header>
      <div className="emails-filters" role="group" aria-label="Filter emails">{filters.map(item => <button type="button" key={item.value} data-tone={item.value} aria-pressed={filter === item.value} onClick={() => { setCursor(null); setFilter(item.value); selectMessage(null); }}><span className="emails-dot" aria-hidden />{item.label}<span className="emails-filters__count">{counts[item.value]}</span></button>)}</div>
      <form onSubmit={submitSearch} className="dashboard-inbox__toolbar">
        <label className="sr-only" htmlFor="inbox-search">Search name, email, or subject</label>
        <input id="inbox-search" className="admin-input" type="search" maxLength={120} value={search} onChange={event => setSearch(event.target.value)} placeholder="Search a name, email address, or subject…" />
        <button className="btn-outline" type="submit"><Search className="h-4 w-4" aria-hidden />Search</button>
        <details className="emails-setup"><summary>Mailbox setup</summary><p>Booking replies arrive automatically. New private messages use your normal reservations@hathorcruise.com reply address. To show those replies and other direct emails here too, Bluehost must forward a copy to {DASHBOARD_INBOX_ADDRESS}, keeping the original. Existing history is not imported. Keep the main domain’s MX records unchanged.</p></details>
      </form>
      {error ? <p role="alert" className="text-sm" style={{ color: "var(--danger)" }}>{error}</p> : null}
      {notice ? <p className="emails-page__notice" role="status"><CheckCheck size={17} aria-hidden />{notice}</p> : null}
      <div className="dashboard-inbox__workspace" data-selected={Boolean(selected || draft)}>
        <section className="card dashboard-inbox__list" aria-label="Email list" aria-busy={busy}>
          <header className="emails-list-header"><h2>{filters.find(item => item.value === filter)?.label}</h2><span>{messages.length}{hasOlder ? "+" : ""} shown</span></header>
          {!messages.length ? <div className="emails-empty"><Inbox size={30} aria-hidden /><p>{busy ? "Loading your emails…" : "No emails here yet"}</p><span>{query || filter !== "all" ? "Try a different search or choose All emails." : "Received messages and emails sent from this dashboard appear here."}</span></div> : null}
          <ol>
            {messages.map(message => {
              const address = contactOf(message);
              const name = correspondentLabel(message.correspondentName, address);
              return (
              <li key={keyOf(message)}>
                <button type="button" className="dashboard-inbox__message" data-tone={toneOf(message)} aria-pressed={selected === keyOf(message)} disabled={Boolean(draft)} onClick={() => { if (selected !== keyOf(message)) selectMessage(keyOf(message)); }}>
                  <div className="emails-message__contact"><span className="emails-avatar" aria-hidden>{correspondentInitials(name)}</span><div><p className="emails-message__name">{name}</p><p className="emails-message__address">{message.direction === "OUTBOUND" ? "To: " : ""}{address}</p></div></div>
                  <p className="emails-message__subject">{message.subject || "(No subject)"}</p>
                  <p className="emails-message__preview">{message.preview || "(No message text)"}</p>
                  <div className="emails-message__meta"><span className="emails-status" data-failed={message.status === "FAILED"}>{message.direction === "OUTBOUND" ? <ArrowUpRight size={13} aria-hidden /> : <ArrowDownLeft size={13} aria-hidden />}{statusOf(message)}</span><span>{message.source === "booking" ? "Booking" : "Personal"}</span>{message.attachmentCount ? <span><Paperclip size={12} aria-hidden />{message.attachmentCount}</span> : null}</div>
                  <time className="emails-message__time" dateTime={message.createdAt}>{messageTime.format(new Date(message.createdAt))}</time>
                </button>
              </li>
            ); })}
          </ol>
          {hasOlder ? <div className="p-4"><button type="button" className="btn-outline w-full" disabled={busy} onClick={() => setCursor(messages[messages.length - 1] ?? null)}>Load older emails</button></div> : null}
        </section>
        <section ref={detailRef} tabIndex={-1} className="card dashboard-inbox__detail" aria-label="Email details">
          {draft ? <EmailComposer key={draft.key} initial={draft} onClose={() => setDraft(null)} onSent={sent} /> : <div className="emails-detail-content">
          {selected ? <button type="button" className="btn-outline mb-5" onClick={() => selectMessage(null)}><ArrowLeft className="h-4 w-4" aria-hidden />Back to emails</button> : null}
          {detailError ? <p role="alert" className="mb-4 text-sm" style={{ color: "var(--danger)" }}>{detailError}</p> : null}
          {!detail ? <div className="emails-detail-empty"><span><Mail size={32} aria-hidden /></span><h2>{selected ? detailError ? "Unable to open email" : "Opening email…" : "Every conversation, in focus"}</h2><p>{selected ? "Your message will appear here." : "Choose a message to read its details, or write a personal note in Hathor’s signature style."}</p>{!selected ? <button type="button" className="btn-outline" onClick={() => compose()}><Plus size={16} aria-hidden />Write a new email</button> : null}</div> : (
            <article className="min-w-0">
              <div className="emails-detail-contact" data-tone={toneOf(detail)}><span className="emails-avatar" aria-hidden>{correspondentInitials(correspondentLabel(detail.correspondentName, contactOf(detail)))}</span><div><p>{correspondentLabel(detail.correspondentName, contactOf(detail))}</p><span className="emails-status">{statusOf(detail)}{detail.direction === "OUTBOUND" ? " · From Hathor" : " · Received by Hathor"}</span></div></div>
              <h2 className="break-words text-xl font-semibold">{detail.subject || "(No subject)"}</h2>
              <dl className="emails-detail-metadata"><div><dt>From</dt><dd>{detail.sender}</dd></div><div><dt>To</dt><dd>{detail.recipient}</dd></div><div><dt>{detail.direction === "OUTBOUND" ? "Recorded" : "Received"}</dt><dd><time dateTime={detail.createdAt}>{messageTime.format(new Date(detail.createdAt))}</time></dd></div></dl>
              {!detail.senderMatchesGuest ? <p className="mt-4 text-sm text-muted">This sender differs from the booking’s guest email. Verify their identity before taking action.</p> : null}
              <div className="my-6 flex flex-wrap gap-3">
                {detail.direction !== "OUTBOUND" ? <button type="button" className="btn-outline" disabled={marking} onClick={() => void markRead()}>{marking ? "Saving…" : detail.readAt ? "Mark unread" : "Mark read"}</button> : null}
                {detail.bookingId ? <Link className="btn-primary" href={`/admin/bookings/${encodeURIComponent(detail.bookingId)}`}>Open booking & reply</Link> : <button type="button" className="btn-primary" onClick={() => compose({ to: contactOf(detail), recipientName: detail.correspondentName ?? "", subject: /^re:/i.test(detail.subject) ? detail.subject : `Re: ${detail.subject}`.slice(0, 180) })}>{detail.direction === "OUTBOUND" ? "Send another email" : "Reply from dashboard"}</button>}
              </div>
              {detail.direction === "OUTBOUND" && detail.status !== "SENT" ? <p className="email-composer__notice">{detail.status === "FAILED" ? "The provider did not accept this email." : "Sending has not been confirmed. Check the original send request before creating a second copy."}</p> : null}
              <div className="border-t pt-6 text-sm" style={{ borderColor: "var(--border)" }}><EmailMessageBody key={keyOf(detail)} bodyText={detail.bodyText} formattedUrl={detail.source === "general" || detail.direction !== "OUTBOUND" ? `/api/admin/inbox/${keyOf(detail)}/formatted` : undefined} /></div>
              {detail.attachments.length ? <div className="mt-7 border-t pt-5" style={{ borderColor: "var(--border)" }}><h3 className="mb-3 text-sm font-semibold">Attachments</h3><ul className="space-y-2">{detail.attachments.map(file => (
                <li key={file.id}><a className="inline-flex max-w-full items-center gap-2 break-all text-sm underline underline-offset-4" target="_blank" rel="noopener noreferrer" href={detail.bookingId ? `/api/admin/bookings/${encodeURIComponent(detail.bookingId)}/messages/${detail.id}/attachments/${file.id}` : `/api/admin/inbox/general/${detail.id}/attachments/${file.id}`}><Paperclip className="h-4 w-4 shrink-0" aria-hidden />{file.filename}</a></li>
              ))}</ul><p className="mt-3 text-xs text-muted">Open only files you trust. Attachment availability follows Resend’s retention policy.</p></div> : null}
            </article>
          )}
          </div>}
        </section>
      </div>
    </div>
  );
}
