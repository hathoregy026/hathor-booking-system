"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent, type UIEvent } from "react";
import { useAdminActivityRefresh } from "@/hooks/useAdminActivityRefresh";
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, CheckCheck, ChevronDown, ChevronUp, FolderInput, Inbox, Mail, Paperclip, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import { EmailMessageBody } from "@/components/admin/EmailMessageBody";
import { EmailComposer, type EmailDraft } from "@/components/admin/EmailComposer";
import { correspondentInitials, correspondentLabel } from "@/lib/email-correspondent";
import { type InboxCounts, type InboxDetail, type InboxFilter, type InboxPage, type InboxSource, type InboxSummary } from "@/lib/inbox-types";
import { EMAIL_MAILBOXES, emailMailbox, type MailboxId, type MailboxSummary } from "@/lib/email-mailboxes";
import { ADMIN_ACTIVITY_EVENT } from "@/lib/admin-notification-types";
import { MAIL_REASON_LABELS, type MailFolder } from "@/lib/mail-folders";

const messageTime = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Cairo", dateStyle: "medium", timeStyle: "short" });
const keyOf = (message: { source: InboxSource; id: string }) => `${message.source}/${message.id}`;
const filters: { value: InboxFilter; label: string }[] = [{ value: "all", label: "All emails" }, { value: "unread", label: "Unread" }, { value: "received", label: "Received" }, { value: "sent", label: "Sent" }];
const toneOf = (message: InboxSummary) => message.direction === "OUTBOUND" ? "sent" : message.readAt ? "received" : "unread";
const contactOf = (message: InboxSummary) => message.direction === "OUTBOUND" ? message.recipient : message.sender;
const statusOf = (message: InboxSummary) => message.direction !== "OUTBOUND" ? message.readAt ? "Received" : "Unread" : message.status === "SENT" ? "Sent" : message.status === "FAILED" ? "Not sent" : "Sending unconfirmed";

export function DashboardInbox({ requestedEmail }: { requestedEmail?: string | null } = {}) {
  const [mailbox, setMailbox] = useState<MailboxId | "all">("all");
  const [mailboxes, setMailboxes] = useState<MailboxSummary[]>(EMAIL_MAILBOXES.map(item => ({ ...item, handlerName: "", total: 0, unread: 0 })));
  const [editingHandler, setEditingHandler] = useState(false);
  const [handlerName, setHandlerName] = useState("");
  const [savingHandler, setSavingHandler] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selection, setSelection] = useState<InboxSummary[]>([]);
  const [batching, setBatching] = useState(false);
  const [moveTarget, setMoveTarget] = useState<MailboxId | "">("");
  const [messages, setMessages] = useState<InboxSummary[]>([]);
  const [unread, setUnread] = useState(0);
  const [counts, setCounts] = useState<InboxCounts>({ all: 0, unread: 0, received: 0, sent: 0 });
  const [draft, setDraft] = useState<(EmailDraft & { key: string }) | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [hasOlder, setHasOlder] = useState(false);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [folder, setFolder] = useState<MailFolder>("inbox");
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<InboxDetail | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [marking, setMarking] = useState(false);
  const [version, setVersion] = useState(0);
  const [cursor, setCursor] = useState<InboxSummary | null>(null);
  const detailRef = useRef<HTMLElement>(null);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const [compactControls, setCompactControls] = useState(false);

  function scrollWorkspace(event: UIEvent<HTMLDivElement>) {
    if (draft || editingHandler) return;
    if (event.target !== listScrollRef.current && event.target !== detailRef.current) return;
    const top = (event.target as HTMLElement).scrollTop;
    if (top > 48) setCompactControls(true);
  }

  const refresh = useCallback(() => { setCursor(null); setVersion(current => current + 1); }, []);
  useAdminActivityRefresh("emails", refresh, batching || selection.length > 0);
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
        const params = new URLSearchParams({ q: query, filter, mailbox, folder });
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
        if (data.mailboxes) setMailboxes(data.mailboxes);
      } catch { if (!controller.signal.aborted) setError("Emails could not be loaded. Refresh to try again."); }
      finally { if (!controller.signal.aborted) setBusy(false); }
    }
    void load();
    return () => controller.abort();
  }, [query, filter, mailbox, folder, cursor, version]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible" && !batching && !selection.length) { setCursor(null); setVersion(current => current + 1); }
    }, 30000);
    return () => window.clearInterval(timer);
  }, [batching, selection.length]);

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

  async function moveToFolder(nextFolder: MailFolder) {
    if (!detail || detail.direction === "OUTBOUND" || marking || batching || draft) return;
    setMarking(true); setDetailError(null);
    try {
      const response = await adminFetch(`/api/admin/inbox/${keyOf(detail)}`, { method: "PATCH",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify({ folder: nextFolder }) });
      if (!response.ok) throw new Error();
      setSelection([]); selectMessage(null); refresh();
      window.dispatchEvent(new Event(ADMIN_ACTIVITY_EVENT));
    } catch { setDetailError("This email could not be moved. Please try again."); }
    finally { setMarking(false); }
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    if (batching) return;
    setSelection([]);
    setCursor(null);
    setQuery(search.trim());
    selectMessage(null);
    setVersion(current => current + 1);
  }

  function compose(initial: EmailDraft = { to: "", recipientName: "", subject: "" }) {
    if (draft || batching) return;
    setSelection([]);
    selectMessage(null);
    setNotice(null);
    setDraft({ ...initial, mailboxId: initial.mailboxId ?? (mailbox === "all" ? "reservations" : mailbox), key: crypto.randomUUID() });
  }

  function sent(id: string) {
    if (draft?.mailboxId) setMailbox(draft.mailboxId);
    setDraft(null);
    setSearch("");
    setQuery("");
    setFilter("sent");
    selectMessage(`general/${id}`);
    setNotice("Your email was accepted by Resend. Find this request in Sent; delivery has not yet been confirmed.");
    refresh();
  }

  function chooseMailbox(value: MailboxId | "all") {
    if (draft || savingHandler || batching) return;
    setSelection([]);
    setMoveTarget("");
    setBusy(true);
    setMailbox(value);
    setFilter("all");
    setSearch("");
    setQuery("");
    setCursor(null);
    setMessages([]);
    selectMessage(null);
    setNotice(null);
    setEditingHandler(false);
    setVersion(current => current + 1);
  }

  function chooseFilter(value: InboxFilter) {
    if (batching) return;
    setSelection([]);
    setBusy(true);
    setCursor(null);
    setFilter(value);
    setMessages([]);
    selectMessage(null);
    if (value === "all") {
      setSearch("");
      setQuery("");
    }
    setVersion(current => current + 1);
  }

  async function saveHandler(event: FormEvent) {
    event.preventDefault();
    if (mailbox === "all" || savingHandler) return;
    setSavingHandler(true);
    setError(null);
    try {
      const response = await adminFetch("/api/admin/inbox/mailboxes", {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mailboxId: mailbox, handlerName: handlerName.trim() }),
      });
      if (!response.ok) throw new Error();
      setMailboxes(current => current.map(item => item.id === mailbox ? { ...item, handlerName: handlerName.trim() } : item));
      setEditingHandler(false);
      setNotice("Mailbox handler saved. New dashboard emails will include this name in their signature.");
    } catch { setError("The handler name could not be saved. Use a name of up to 80 characters and try again."); }
    finally { setSavingHandler(false); }
  }

  async function removeMessage() {
    if (!detail || deleting || batching || !window.confirm("Remove this message from dashboard Emails? This does not delete it from Zoho or Resend. Booking conversation records are also kept.")) return;
    const key = keyOf(detail);
    setDeleting(true);
    setDetailError(null);
    try {
      const response = await adminFetch(`/api/admin/inbox/${key}`, {
        method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirm: true }),
      });
      if (!response.ok) throw new Error();
      setSelected(current => current === key ? null : current);
      setDetail(current => current && keyOf(current) === key ? null : current);
      setMessages(current => current.filter(message => keyOf(message) !== key));
      setSelection(current => current.filter(message => keyOf(message) !== key));
      setNotice("Removed from dashboard Emails. Your original mailbox history is unchanged.");
      refresh();
      window.dispatchEvent(new CustomEvent(ADMIN_ACTIVITY_EVENT, { detail: { bookings: false, emails: true } }));
    } catch { setDetailError("This message could not be removed. Refresh and try again."); }
    finally { setDeleting(false); }
  }

  function toggleSelection(message: InboxSummary) {
    if (batching || draft || message.status === "PENDING") return;
    setSelection(current => current.some(item => keyOf(item) === keyOf(message))
      ? current.filter(item => keyOf(item) !== keyOf(message)) : current.length < 100 ? [...current, message] : current);
  }

  async function manageSelection(action: "move" | "delete") {
    if (!selection.length || batching || draft || (action === "move" && !moveTarget)) return;
    const items = selection.map(({ source, id }) => ({ source, id }));
    if (action === "delete" && !window.confirm(`Remove ${items.length} selected email${items.length === 1 ? "" : "s"} from the dashboard only? Original Zoho and Resend emails and booking history will be kept.`)) return;
    setBatching(true);
    setError(null);
    setNotice(null);
    try {
      const response = await adminFetch("/api/admin/inbox/bulk", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "move" ? { action, messages: items, mailboxId: moveTarget } : { action, messages: items, confirm: true }),
      });
      if (!response.ok || (await response.json() as { affected: number }).affected !== items.length) throw new Error();
      setSelection([]);
      selectMessage(null);
      setNotice(action === "move" ? `${items.length} email${items.length === 1 ? "" : "s"} moved to ${emailMailbox(moveTarget as MailboxId).label} in the dashboard. Original mailbox history is unchanged.`
        : `${items.length} email${items.length === 1 ? "" : "s"} removed from the dashboard only. Original mailbox history is unchanged.`);
      setMoveTarget("");
      refresh();
      window.dispatchEvent(new CustomEvent(ADMIN_ACTIVITY_EVENT, { detail: { bookings: false, emails: true } }));
    } catch { setError("The selected changes could not be confirmed. Refresh to check the emails before trying again. Emails still sending cannot be moved or deleted."); }
    finally { setBatching(false); }
  }

  const activeMailbox = mailbox === "all" ? null : mailboxes.find(item => item.id === mailbox);
  const selectedKeys = new Set(selection.map(keyOf));
  const selectable = messages.filter(message => message.status !== "PENDING").slice(0, 100);
  const allLoadedSelected = selectable.length > 0 && selectable.every(message => selectedKeys.has(keyOf(message)));

  return (
    <div className="emails-page" data-compact={compactControls && !editingHandler && !draft}>
      <div className="emails-controls">
      <header className="emails-page__header">
        <div>
          <p className="emails-eyebrow">Hathor correspondence</p>
          <h1 className="admin-page-title">Emails</h1>
          <p className="admin-page-subtitle">Six mailboxes. One clear view of every conversation.</p>
          <p className="emails-page__caption" aria-live="polite">{unread} unread · Times shown in Cairo</p>
        </div>
        <div className="emails-page__actions">
        <button type="button" className="btn-outline emails-controls-toggle" aria-label={compactControls ? "Expand email controls" : "Compact email controls"} aria-expanded={!compactControls} onClick={() => setCompactControls(current => !current)}>{compactControls ? <ChevronDown size={16} aria-hidden /> : <ChevronUp size={16} aria-hidden />}<span>{compactControls ? "Expand" : "Compact"}</span></button>
        <button type="button" className="btn-outline" onClick={() => { setSelection([]); refresh(); }} disabled={busy || batching}>
          <RefreshCw className={`h-4 w-4${busy ? " animate-spin" : ""}`} aria-hidden /><span>Refresh emails</span>
        </button>
        <button type="button" className="btn-primary" onClick={() => compose()} disabled={Boolean(draft) || batching}><Plus size={17} aria-hidden />Send new email</button>
        </div>
      </header>
      <nav className="emails-folders" aria-label="Email folders">
        {(["inbox", "spam", "security"] as const).map(item => <button type="button" key={item} className="btn-outline"
          aria-pressed={folder === item} disabled={Boolean(draft) || batching || marking}
          onClick={() => { setFolder(item); setFilter("all"); setCursor(null); setSelection([]); selectMessage(null); }}>
          {item === "inbox" ? "Inbox" : item === "spam" ? "Spam" : "Security quarantine"}
        </button>)}
      </nav>
      {folder !== "inbox" ? <p className="text-sm text-muted">Held messages do not trigger normal Inbox alerts. Read the reason before restoring. Links, formatted views and attachments remain blocked until restored.</p> : null}
      <nav className="emails-mailboxes" aria-label="Choose mailbox">
        <button type="button" className="emails-mailbox" aria-pressed={mailbox === "all"} disabled={Boolean(draft) || savingHandler || batching} onClick={() => chooseMailbox("all")} style={{ "--mailbox-color": "var(--accent)" } as CSSProperties}><span className="emails-mailbox__role">ALL MAILBOXES</span><span className="emails-mailbox__handler">Administrator overview</span><span className="emails-mailbox__count">{mailboxes.reduce((sum, item) => sum + item.unread, 0)} unread</span></button>
        {mailboxes.map(item => <button type="button" key={item.id} className="emails-mailbox" data-mailbox={item.id} aria-pressed={mailbox === item.id} disabled={Boolean(draft) || savingHandler || batching} onClick={() => chooseMailbox(item.id)} style={{ "--mailbox-color": item.color } as CSSProperties}><span className="emails-mailbox__role">{item.label}</span><span className="emails-mailbox__handler">{item.handlerName || "Handler not assigned"}</span><span className="emails-mailbox__count" title={`${item.total} total`}>{item.unread} unread{compactControls && !editingHandler && !draft ? "" : ` · ${item.total} total`}</span></button>)}
      </nav>
      <div className="emails-filters" role="group" aria-label="Filter emails">{filters.map(item => <button type="button" key={item.value} data-tone={item.value} aria-pressed={filter === item.value} disabled={batching} onClick={() => chooseFilter(item.value)}><span className="emails-dot" aria-hidden />{item.label}<span className="emails-filters__count">{counts[item.value]}</span></button>)}</div>
      {selection.length ? <div className="emails-bulk-actions" role="group" aria-label="Selected email actions"><strong aria-live="polite">{selection.length} selected</strong><label className="sr-only" htmlFor="email-move-target">Move selected emails to</label><select id="email-move-target" className="admin-input" value={moveTarget} disabled={batching} onChange={event => setMoveTarget(event.target.value as MailboxId | "")}><option value="">Choose mailbox…</option>{EMAIL_MAILBOXES.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select><button type="button" className="btn-outline" disabled={batching || !moveTarget} onClick={() => void manageSelection("move")}><FolderInput size={15} aria-hidden />Move selected</button><button type="button" className="btn-outline emails-delete" disabled={batching} onClick={() => void manageSelection("delete")}><Trash2 size={15} aria-hidden />Delete selected</button><button type="button" className="btn-outline" disabled={batching} onClick={() => setSelection([])}>Clear selection</button>{batching ? <span role="status">Saving dashboard changes…</span> : null}</div> : null}
      <form onSubmit={submitSearch} className="dashboard-inbox__toolbar">
        <label className="sr-only" htmlFor="inbox-search">Search name, email, or subject</label>
        <input id="inbox-search" className="admin-input" type="search" maxLength={120} value={search} disabled={batching} onChange={event => setSearch(event.target.value)} placeholder="Search a name, email address, or subject…" />
        <button className="btn-outline" type="submit" disabled={batching}><Search className="h-4 w-4" aria-hidden />Search</button>
        <details className="emails-setup"><summary>Zoho forwarding setup</summary><div className="emails-setup__panel"><p>In each Zoho mailbox’s forwarding settings, add its matching destination below, verify it, and keep the original copy. Existing history is not imported. Do not change your main MX records.</p><ul>{EMAIL_MAILBOXES.map(item => <li key={item.id}><strong>{item.address}</strong><span>→ {item.forwardingAddress}</span></li>)}</ul></div></details>
      </form>
      {activeMailbox ? <div className="emails-handler-bar"><span className="emails-mailbox-chip" style={{ "--mailbox-color": activeMailbox.color } as CSSProperties}>{activeMailbox.label}</span><span>{activeMailbox.address}</span><button type="button" className="btn-outline" disabled={Boolean(draft)} onClick={() => { setHandlerName(activeMailbox.handlerName); setEditingHandler(current => !current); }}><Pencil size={14} aria-hidden />{activeMailbox.handlerName ? "Edit handler name" : "Add handler name"}</button></div> : null}
      {editingHandler && activeMailbox ? <form className="emails-handler-editor" onSubmit={event => void saveHandler(event)}><label htmlFor="mailbox-handler">Who handles {activeMailbox.label}?</label><input id="mailbox-handler" className="admin-input" maxLength={80} value={handlerName} onChange={event => setHandlerName(event.target.value)} placeholder="Full name (optional)" disabled={savingHandler} /><button type="submit" className="btn-primary" disabled={savingHandler}>{savingHandler ? "Saving…" : "Save name"}</button><button type="button" className="btn-outline" disabled={savingHandler} onClick={() => setEditingHandler(false)}>Cancel</button></form> : null}
      {error ? <p role="alert" className="text-sm" style={{ color: "var(--danger)" }}>{error}</p> : null}
      {notice ? <p className="emails-page__notice" role="status"><CheckCheck size={17} aria-hidden />{notice}</p> : null}
      </div>
      <div className="dashboard-inbox__workspace" data-selected={Boolean(selected || draft)} onScrollCapture={scrollWorkspace}>
        <section className="card dashboard-inbox__list" aria-label="Email list" aria-busy={busy}>
          <div ref={listScrollRef} className="emails-list-scroll" tabIndex={0} role="region" aria-label="Scrollable emails">
          <header className="emails-list-header"><label className="emails-select-all"><input type="checkbox" aria-label="Select loaded emails (up to 100)" checked={allLoadedSelected} ref={element => { if (element) element.indeterminate = !allLoadedSelected && selectable.some(message => selectedKeys.has(keyOf(message))); }} disabled={busy || batching || Boolean(draft) || !selectable.length} onChange={() => setSelection(allLoadedSelected ? [] : selectable)} /><span>Select loaded</span></label><h2>{activeMailbox?.label ?? "ALL MAILBOXES"} · {filters.find(item => item.value === filter)?.label}</h2><span>{messages.length}{hasOlder ? "+" : ""} shown</span></header>
          {!messages.length ? <div className="emails-empty"><Inbox size={30} aria-hidden /><p>{busy ? "Loading your emails…" : query ? "No emails match your search" : filter !== "all" ? `No ${filter} emails in ${activeMailbox?.label ?? "ALL MAILBOXES"}` : "No emails here yet"}</p><span>{query || filter !== "all" ? "Show all emails in this mailbox to remove search and status filters." : "Received messages and emails sent from this dashboard appear here."}</span>{!busy && (query || filter !== "all") ? <button type="button" className="btn-outline mt-4" onClick={() => chooseFilter("all")}>Show all {activeMailbox?.label ?? "mailbox"} emails</button> : null}</div> : null}
          <ol>
            {messages.map(message => {
              const address = contactOf(message);
              const name = correspondentLabel(message.correspondentName, address);
              return (
              <li key={keyOf(message)} className="emails-selectable-row" data-checked={selectedKeys.has(keyOf(message))}>
                <label className="emails-row-selector" title={message.status === "PENDING" ? "Resolve sending status before selecting this email" : "Select email"}><input type="checkbox" aria-label={`Select email: ${message.subject || "(No subject)"}`} checked={selectedKeys.has(keyOf(message))} disabled={batching || Boolean(draft) || message.status === "PENDING" || (selection.length >= 100 && !selectedKeys.has(keyOf(message)))} onChange={() => toggleSelection(message)} /></label>
                <button type="button" className="dashboard-inbox__message" data-tone={toneOf(message)} aria-pressed={selected === keyOf(message)} disabled={Boolean(draft) || batching} onClick={() => { if (selected !== keyOf(message)) selectMessage(keyOf(message)); }}>
                  <div className="emails-message__top"><span className="emails-mailbox-chip" style={{ "--mailbox-color": emailMailbox(message.mailboxId ?? "reservations").color } as CSSProperties}>{emailMailbox(message.mailboxId ?? "reservations").label}</span><span className="emails-status">{statusOf(message)}</span></div>
                  <div className="emails-message__contact"><span className="emails-avatar" aria-hidden>{correspondentInitials(name)}</span><div><p className="emails-message__name">{name}</p><p className="emails-message__address">{message.direction === "OUTBOUND" ? "TO" : "FROM"} · {address}</p></div></div>
                  <p className="emails-message__subject">{message.subject || "(No subject)"}</p>
                  <p className="emails-message__preview">{message.preview || "(No message text)"}</p>
                  <div className="emails-message__meta"><span className="emails-status" data-failed={message.status === "FAILED"}>{message.direction === "OUTBOUND" ? <ArrowUpRight size={13} aria-hidden /> : <ArrowDownLeft size={13} aria-hidden />}{statusOf(message)}</span><span>{message.source === "booking" ? "Booking" : "Personal"}</span>{message.attachmentCount ? <span><Paperclip size={12} aria-hidden />{message.attachmentCount}</span> : null}</div>
                  <time className="emails-message__time" dateTime={message.createdAt}>{messageTime.format(new Date(message.createdAt))}</time>
                </button>
              </li>
            ); })}
          </ol>
          {hasOlder ? <div className="p-4"><button type="button" className="btn-outline w-full" disabled={busy || batching} onClick={() => setCursor(messages[messages.length - 1] ?? null)}>Load older emails</button></div> : null}
          </div>
        </section>
        <section ref={detailRef} tabIndex={-1} className="card dashboard-inbox__detail" aria-label="Email details">
          {draft ? <EmailComposer key={draft.key} initial={draft} handlerName={mailboxes.find(item => item.id === draft.mailboxId)?.handlerName} onClose={() => setDraft(null)} onSent={sent} /> : <div className="emails-detail-content">
          {selected ? <button type="button" className="btn-outline mb-5" onClick={() => selectMessage(null)}><ArrowLeft className="h-4 w-4" aria-hidden />Back to emails</button> : null}
          {detailError ? <p role="alert" className="mb-4 text-sm" style={{ color: "var(--danger)" }}>{detailError}</p> : null}
          {!detail ? <div className="emails-detail-empty"><span><Mail size={32} aria-hidden /></span><h2>{selected ? detailError ? "Unable to open email" : "Opening email…" : "Every conversation, in focus"}</h2><p>{selected ? "Your message will appear here." : "Choose a message to read its details, or write a personal note in Hathor’s signature style."}</p>{!selected ? <button type="button" className="btn-outline" onClick={() => compose()}><Plus size={16} aria-hidden />Write a new email</button> : null}</div> : (
            <article className="min-w-0">
              <div className="emails-detail-contact" data-tone={toneOf(detail)}><span className="emails-avatar" aria-hidden>{correspondentInitials(correspondentLabel(detail.correspondentName, contactOf(detail)))}</span><div><p>{correspondentLabel(detail.correspondentName, contactOf(detail))}</p><span className="emails-status">{statusOf(detail)}{detail.direction === "OUTBOUND" ? " · From Hathor" : " · Received by Hathor"}</span></div><span className="emails-mailbox-chip" style={{ "--mailbox-color": emailMailbox(detail.mailboxId ?? "reservations").color } as CSSProperties}>{emailMailbox(detail.mailboxId ?? "reservations").label}</span></div>
              <h2 className="break-words text-xl font-semibold">{detail.subject || "(No subject)"}</h2>
              <dl className="emails-detail-metadata"><div><dt>From</dt><dd>{detail.sender}</dd></div><div><dt>To</dt><dd>{detail.recipient}</dd></div><div><dt>{detail.direction === "OUTBOUND" ? "Recorded" : "Received"}</dt><dd><time dateTime={detail.createdAt}>{messageTime.format(new Date(detail.createdAt))}</time></dd></div><div><dt>Handled by</dt><dd>{mailboxes.find(item => item.id === detail.mailboxId)?.handlerName || "Not assigned"}</dd></div></dl>
              {!detail.senderMatchesGuest ? <p className="mt-4 text-sm text-muted">This sender differs from the booking’s guest email. Verify their identity before taking action.</p> : null}
              {detail.screeningReasons?.length ? <aside className="emails-screening" aria-label="Screening reasons"><p className="font-semibold">{(detail.folder ?? "inbox") === "inbox" ? "Review history" : detail.folder === "spam" ? "Why this is in Spam" : "Why this is quarantined"}</p><ul>{detail.screeningReasons.map(reason => <li key={reason}>{MAIL_REASON_LABELS[reason] ?? "Held for review."}</li>)}</ul></aside> : null}
              <div className="my-6 flex flex-wrap gap-3">
                {detail.direction !== "OUTBOUND" ? <button type="button" className="btn-outline" disabled={marking} onClick={() => void markRead()}>{marking ? "Saving…" : detail.readAt ? "Mark unread" : "Mark read"}</button> : null}
                {(detail.folder ?? "inbox") !== "inbox" ? <button type="button" className="btn-primary" disabled={marking || batching} onClick={() => void moveToFolder("inbox")}>{detail.folder === "spam" ? "Not spam · Move to Inbox" : "Restore to Inbox"}</button> : detail.bookingId ? <Link className="btn-primary" href={`/admin/bookings/${encodeURIComponent(detail.bookingId)}`}>Open booking & reply</Link> : <button type="button" className="btn-primary" onClick={() => compose({ to: contactOf(detail), recipientName: detail.correspondentName ?? "", mailboxId: detail.mailboxId ?? "reservations", subject: /^re:/i.test(detail.subject) ? detail.subject : `Re: ${detail.subject}`.slice(0, 180) })}>{detail.direction === "OUTBOUND" ? "Send another email" : "Reply from dashboard"}</button>}
                {detail.direction === "INBOUND" && detail.folder !== "spam" ? <button type="button" className="btn-outline" disabled={marking || batching} onClick={() => void moveToFolder("spam")}>Mark as spam</button> : null}
                {detail.direction === "INBOUND" && detail.folder !== "security" ? <button type="button" className="btn-outline" disabled={marking || batching} onClick={() => void moveToFolder("security")}>Flag security threat</button> : null}
                <button type="button" className="btn-outline emails-delete" disabled={deleting || batching || detail.status === "PENDING"} onClick={() => void removeMessage()}><Trash2 size={15} aria-hidden />{deleting ? "Removing…" : "Delete from dashboard"}</button>
              </div>
              {detail.direction === "OUTBOUND" && detail.status !== "SENT" ? <p className="email-composer__notice">{detail.status === "FAILED" ? "The provider did not accept this email." : "Sending has not been confirmed. Check the original send request before creating a second copy."}</p> : null}
              <div className="border-t pt-6 text-sm" style={{ borderColor: "var(--border)" }}><EmailMessageBody key={`${keyOf(detail)}/${detail.folder}`} bodyText={detail.bodyText} formattedUrl={(detail.folder ?? "inbox") === "inbox" && (detail.source === "general" || detail.direction !== "OUTBOUND") ? `/api/admin/inbox/${keyOf(detail)}/formatted` : undefined} /></div>
              {detail.attachments.length && (detail.folder ?? "inbox") === "inbox" ? <div className="mt-7 border-t pt-5" style={{ borderColor: "var(--border)" }}><h3 className="mb-3 text-sm font-semibold">Attachments</h3><ul className="space-y-2">{detail.attachments.map(file => (
                <li key={file.id}><a className="inline-flex max-w-full items-center gap-2 break-all text-sm underline underline-offset-4" target="_blank" rel="noopener noreferrer" href={detail.bookingId ? `/api/admin/bookings/${encodeURIComponent(detail.bookingId)}/messages/${detail.id}/attachments/${file.id}` : `/api/admin/inbox/general/${detail.id}/attachments/${file.id}`}><Paperclip className="h-4 w-4 shrink-0" aria-hidden />{file.filename}</a></li>
              ))}</ul><p className="mt-3 text-xs text-muted">Open only files you trust. Attachment availability follows Resend’s retention policy.</p></div> : null}
              {detail.attachments.length && (detail.folder ?? "inbox") !== "inbox" ? <p className="mt-6 text-sm text-muted">Attachments are held until this message is restored.</p> : null}
            </article>
          )}
          </div>}
        </section>
      </div>
    </div>
  );
}
