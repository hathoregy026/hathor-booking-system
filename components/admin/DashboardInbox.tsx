"use client";

import { FloatingEmailComposer } from "./mail/FloatingEmailComposer";
import { MailConversation } from "./mail/MailConversation";
import { useAdminAccess } from "./AdminAccessProvider";
import { allowedMailboxIds } from "@/lib/admin-mailbox-access";
import { hasAdminPermission } from "@/lib/admin-permissions";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { useAdminActivityRefresh } from "@/hooks/useAdminActivityRefresh";
import { Ban, ShieldAlert, Menu, X, Maximize2, Minimize2, ArrowDownLeft, ArrowLeft, ArrowUpRight, CheckCheck, ChevronDown, ChevronUp, FolderInput, Inbox, Mail, Paperclip, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import { EmailMessageBody } from "@/components/admin/EmailMessageBody";
import { ReceivedEmailAttachment } from "@/components/admin/ReceivedEmailAttachment";
import { type EmailDraft } from "@/components/admin/EmailComposer";
import { correspondentInitials, correspondentLabel } from "@/lib/email-correspondent";
import { type InboxCounts, type InboxDetail, type InboxFilter, type InboxPage, type InboxSource, type InboxSummary } from "@/lib/inbox-types";
import { EMAIL_MAILBOXES, emailMailbox, type MailboxId, type MailboxSummary } from "@/lib/email-mailboxes";
import { ADMIN_ACTIVITY_EVENT } from "@/lib/admin-notification-types";
import { MAIL_REASON_LABELS, type MailFolder } from "@/lib/mail-folders";

const rowTime = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Cairo", month: "short", day: "numeric" });
const messageTime = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Cairo", dateStyle: "medium", timeStyle: "short" });
const keyOf = (message: { source: InboxSource; id: string }) => `${message.source}/${message.id}`;
const filters: { value: InboxFilter; label: string }[] = [{ value: "all", label: "All emails" }, { value: "unread", label: "Unread" }, { value: "received", label: "Received" }, { value: "sent", label: "Sent" }];
const toneOf = (message: InboxSummary) => message.direction === "OUTBOUND" ? "sent" : message.readAt ? "received" : "unread";
const contactOf = (message: InboxSummary) => message.direction === "OUTBOUND" ? message.recipient : message.sender;
const statusOf = (message: InboxSummary) => message.direction !== "OUTBOUND" ? message.readAt ? "Received" : "Unread" : message.status === "SENT" ? "Sent" : message.status === "FAILED" ? "Not sent" : "Sending unconfirmed";

export function DashboardInbox({ requestedEmail }: { requestedEmail?: string | null } = {}) {
  const access = useAdminAccess();
  const visibleIds = allowedMailboxIds(access);
  const sendIds = allowedMailboxIds(access, "send");
  const canManage = hasAdminPermission(access, "inbox.manage");
  const canSend = sendIds.length > 0;
  const [mailbox, setMailbox] = useState<MailboxId | "all">("all");
  const [mailboxes, setMailboxes] = useState<MailboxSummary[]>(EMAIL_MAILBOXES.filter(item => visibleIds.includes(item.id)).map(item => ({ ...item, handlerName: "", total: 0, unread: 0 })));
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
  const [attachmentNotice, setAttachmentNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [marking, setMarking] = useState(false);
  const [version, setVersion] = useState(0);
  const [cursor, setCursor] = useState<InboxSummary | null>(null);
  const detailRef = useRef<HTMLElement>(null);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const revealPhoneList = useRef(false);
  const moveDialog = useRef<HTMLDialogElement>(null);
  const navigationRef = useRef<HTMLElement>(null);
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [readerExpanded, setReaderExpanded] = useState(false);
  useEffect(() => {
    if (!navigationOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = navigationRef.current;
    panel?.querySelector<HTMLButtonElement>("button")?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setNavigationOpen(false); }
      if (event.key !== "Tab" || !panel) return;
      const items = [...panel.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], summary, input:not(:disabled)')].filter(item => item.getClientRects().length);
      const first = items[0], last = items.at(-1);
      if (!panel.contains(document.activeElement)) { event.preventDefault(); first?.focus(); }
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", keydown);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", keydown); previous?.focus({ preventScroll: true }); };
  }, [navigationOpen]);
  const [compactControls, setCompactControls] = useState(false);


  const refresh = useCallback(() => { setCursor(null); setVersion(current => current + 1); }, [setCursor, setVersion]);
  useAdminActivityRefresh("emails", refresh, batching || selection.length > 0);
  function selectMessage(key: string | null) { setDetail(null); setDetailError(null); setAttachmentNotice(null); setSelected(key); }
  function attachmentRemoved(message: InboxDetail, attachmentId: string) {
    const key = keyOf(message);
    setDetail(current => current && keyOf(current) === key ? { ...current,
      attachments: current.attachments.filter(file => file.id !== attachmentId),
      attachmentCount: current.attachments.filter(file => file.id !== attachmentId).length } : current);
    setMessages(current => current.map(item => keyOf(item) === key ? { ...item, attachmentCount: Math.max(0, item.attachmentCount - 1) } : item));
    setAttachmentNotice(key); refresh();
  }

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
    detailRef.current?.focus({ preventScroll: true });
    return () => controller.abort();
  }, [selected]);

  useEffect(() => {
    if (!selected || draft?.key || !window.matchMedia("(max-width: 1023px)").matches) return;
    const panel = detailRef.current;
    panel?.focus({ preventScroll: true });
    panel?.scrollIntoView({ block: "start" });
  }, [selected, draft?.key]);

  useEffect(() => {
    if (!revealPhoneList.current || busy) return;
    revealPhoneList.current = false;
    if (error || selected || draft?.key || !window.matchMedia("(max-width: 480px)").matches) return;
    const panel = listScrollRef.current;
    panel?.focus({ preventScroll: true });
    panel?.scrollIntoView({ block: "start" });
  }, [busy, version, error, selected, draft?.key]);

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
    const sender = initial.mailboxId ?? (mailbox !== "all" && sendIds.includes(mailbox) ? mailbox : sendIds[0]);
    if (draft || batching || !sender || !sendIds.includes(sender)) return;
    setSelection([]);
    setNotice(null);
    setDraft({ ...initial, mailboxId: sender, key: crypto.randomUUID() });
  }

  function sent(id: string, senderId?: MailboxId) {
    if (senderId || draft?.mailboxId) setMailbox(senderId ?? draft!.mailboxId!);
    setDraft(null);
    setSearch("");
    setQuery("");
    setFilter("sent");
    selectMessage(`general/${id}`);
    setNotice("Your email was accepted by Resend. Find this request in Sent; delivery has not yet been confirmed.");
    refresh();
  }

  function chooseMailbox(value: MailboxId | "all") {
    if (savingHandler || batching) return;
    revealPhoneList.current = true;
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

  function clearMailFilter(kind: "mailbox" | "folder" | "status" | "search" | "all") {
    if (batching || savingHandler) return;
    if (kind === "mailbox" || kind === "all") { setMailbox("all"); setEditingHandler(false); }
    if (kind === "folder" || kind === "all") setFolder("inbox");
    if (kind === "status" || kind === "all") setFilter("all");
    if (kind === "search" || kind === "all") { setSearch(""); setQuery(""); }
    setSelection([]); setCursor(null); setMessages([]); setBusy(true); selectMessage(null);
    setVersion(current => current + 1);
  }

  function chooseFilter(value: InboxFilter) {
    if (batching) return;
    revealPhoneList.current = true;
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

  async function manageSelection(action: "move" | "delete", target = moveTarget) {
    if (!selection.length || batching || draft || (action === "move" && !target)) return;
    const items = selection.map(({ source, id }) => ({ source, id }));
    if (action === "delete" && !window.confirm(`Remove ${items.length} selected email${items.length === 1 ? "" : "s"} from the dashboard only? Original Zoho and Resend emails and booking history will be kept.`)) return;
    setBatching(true);
    setError(null);
    setNotice(null);
    try {
      const response = await adminFetch("/api/admin/inbox/bulk", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "move" ? { action, messages: items, mailboxId: target } : { action, messages: items, confirm: true }),
      });
      if (!response.ok || (await response.json() as { affected: number }).affected !== items.length) throw new Error();
      setSelection([]);
      selectMessage(null);
      setNotice(action === "move" ? `${items.length} email${items.length === 1 ? "" : "s"} moved to ${emailMailbox(target as MailboxId).label} in the dashboard. Original mailbox history is unchanged.`
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
    <div className="emails-page mail-workbench" data-navigation-open={navigationOpen} data-reader-expanded={readerExpanded} data-reading={Boolean(selected)} data-compact={compactControls && !editingHandler && !draft}>
      <header className="emails-page__header">
        <div>
          <p className="emails-eyebrow">Hathor correspondence</p>
          <h1 className="admin-page-title">Emails</h1>
          <p className="admin-page-subtitle">Six mailboxes. One clear view of every conversation.</p>
          <p className="emails-page__caption" aria-live="polite">{unread} unread · Times shown in Cairo</p>
        </div>
        <div className="emails-page__actions"><button type="button" className="email-icon-button mail-navigation-toggle" aria-label="Open mail navigation" aria-expanded={navigationOpen} onClick={() => setNavigationOpen(true)}><Menu size={18} /></button>
        <button type="button" className="btn-outline emails-controls-toggle" aria-label={compactControls ? "Expand email controls" : "Compact email controls"} aria-expanded={!compactControls} onClick={() => setCompactControls(current => !current)}>{compactControls ? <ChevronDown size={16} aria-hidden /> : <ChevronUp size={16} aria-hidden />}<span>{compactControls ? "Expand" : "Compact"}</span></button>
        <button type="button" className="btn-outline" aria-label="Refresh emails" title="Refresh emails" onClick={() => { setSelection([]); refresh(); }} disabled={busy || batching}>
          <RefreshCw className={`h-4 w-4${busy ? " animate-spin" : ""}`} aria-hidden /><span>Refresh emails</span>
        </button>
        <button type="button" className="btn-primary" aria-label="Compose" onClick={() => { compose(); setNavigationOpen(false); }} disabled={!canSend || Boolean(draft) || batching}><Pencil size={17} aria-hidden /><span>Compose</span></button>
        </div>
      <form onSubmit={submitSearch} className="dashboard-inbox__toolbar">
        <label className="sr-only" htmlFor="inbox-search">Search name, email, or subject</label>
        <input id="inbox-search" className="admin-input" type="search" maxLength={120} value={search} disabled={batching} onChange={event => setSearch(event.target.value)} placeholder="Search a name, email address, or subject…" />
        <button className="btn-outline" type="submit" disabled={batching}><Search className="h-4 w-4" aria-hidden />Search</button>

      </form>
      </header>
      <div className="mail-phone-filters" aria-label="Quick email filters">{filters.map(item => <button type="button" key={item.value} aria-pressed={filter === item.value} disabled={Boolean(draft) || batching} onClick={() => chooseFilter(item.value)}>{item.label === "All emails" ? "All mail" : item.label}{counts[item.value] > 0 && <span>{counts[item.value]}</span>}</button>)}</div>
      <div className="emails-layout">
        <aside ref={navigationRef} role={navigationOpen ? "dialog" : undefined} aria-modal={navigationOpen || undefined} className="emails-rail" aria-label="Mail navigation"><header className="mail-drawer-heading"><strong>Hathor mail</strong><button type="button" aria-label="Close mail navigation" className="email-icon-button" onClick={() => setNavigationOpen(false)}><X size={18} /></button></header><button type="button" className="btn-primary mail-rail-compose" onClick={() => { compose(); setNavigationOpen(false); }} disabled={!canSend || Boolean(draft) || batching}><Pencil size={18} />Compose</button>      <div className="emails-filters" role="group" aria-label="Filter emails">{filters.map(item => <button type="button" key={item.value} data-tone={item.value} aria-pressed={filter === item.value} disabled={batching} onClick={() => { chooseFilter(item.value); setNavigationOpen(false); }}><span className="emails-dot" aria-hidden />{item.label}<span className="emails-filters__count">{counts[item.value]}</span></button>)}</div><p className="mail-section-label">Held for review</p>      <nav className="emails-folders" aria-label="Email folders">
        {(["inbox", "spam", "security"] as const).map(item => <button type="button" key={item} className="btn-outline"
          aria-pressed={folder === item} disabled={Boolean(draft) || batching || marking}
          onClick={() => { setNavigationOpen(false); setFolder(item); setFilter("all"); setCursor(null); setSelection([]); selectMessage(null); }}>
          {item === "inbox" ? "Inbox" : item === "spam" ? "Spam" : "Security quarantine"}
        </button>)}
      </nav>
      {folder !== "inbox" ? <p className="text-sm text-muted">Held messages do not trigger normal Inbox alerts. Read the reason before restoring. Links, formatted views and attachments remain blocked until restored.</p> : null}
      <p className="mail-section-label">Mailboxes</p><nav className="emails-mailboxes" aria-label="Choose mailbox">
        <button type="button" className="emails-mailbox" aria-pressed={mailbox === "all"} disabled={savingHandler || batching} onClick={() => { chooseMailbox("all"); setNavigationOpen(false); }} style={{ "--mailbox-color": "var(--accent)" } as CSSProperties}><span className="emails-mailbox__role">All mailboxes</span><span className="emails-mailbox__handler">Accessible mailboxes</span><span className="emails-mailbox__count" title={`${mailboxes.reduce((sum, item) => sum + item.total, 0)} total`} aria-label={`${mailboxes.reduce((sum, item) => sum + item.unread, 0)} unread, ${mailboxes.reduce((sum, item) => sum + item.total, 0)} total`}>{mailboxes.reduce((sum, item) => sum + item.unread, 0)}</span></button>
        {mailboxes.map(item => <button type="button" key={item.id} className="emails-mailbox" data-mailbox={item.id} aria-pressed={mailbox === item.id} disabled={savingHandler || batching} onClick={() => { chooseMailbox(item.id); setNavigationOpen(false); }} style={{ "--mailbox-color": item.color } as CSSProperties}><span className="emails-mailbox__role">{item.label}</span><span className="emails-mailbox__handler">{item.handlerName || "Handler not assigned"}</span><span className="emails-mailbox__count" title={`${item.total} total`} aria-label={`${item.unread} unread, ${item.total} total`}>{item.unread}</span></button>)}
      </nav>
        <details className="emails-setup"><summary>Zoho forwarding setup</summary><div className="emails-setup__panel"><p>In each Zoho mailbox’s forwarding settings, add its matching destination below, verify it, and keep the original copy. Existing history is not imported. Do not change your main MX records.</p><ul>{EMAIL_MAILBOXES.filter(item => visibleIds.includes(item.id)).map(item => <li key={item.id}><strong>{item.address}</strong><span>→ {item.forwardingAddress}</span></li>)}</ul></div></details></aside>
      <div className="dashboard-inbox__workspace" data-selected={Boolean(selected)}>
        <section className="card dashboard-inbox__list" aria-label="Email list" aria-busy={busy}>
      <div className="emails-controls">
      {(mailbox !== "all" || folder !== "inbox" || filter !== "all" || query) && <div className="mail-active-filters" aria-label="Active mail filters">
        {mailbox !== "all" && <button type="button" disabled={batching} onClick={() => clearMailFilter("mailbox")} aria-label="Clear mailbox filter">{emailMailbox(mailbox).label}<X size={12} /></button>}
        {folder !== "inbox" && <button type="button" disabled={batching} onClick={() => clearMailFilter("folder")} aria-label="Clear folder filter">{folder === "spam" ? "Spam" : "Security quarantine"}<X size={12} /></button>}
        {filter !== "all" && <button type="button" disabled={batching} onClick={() => clearMailFilter("status")} aria-label="Clear status filter">{filters.find(item => item.value === filter)?.label}<X size={12} /></button>}
        {query && <button type="button" disabled={batching} onClick={() => clearMailFilter("search")} aria-label="Clear search filter">{query}<X size={12} /></button>}
        <button type="button" className="mail-active-filters__clear" disabled={batching} onClick={() => clearMailFilter("all")}>Clear all</button>
      </div>}



      {selection.length ? <div className="emails-bulk-actions" role="group" aria-label="Selected email actions"><strong aria-live="polite">{selection.length} selected</strong><button type="button" className="btn-outline mail-phone-move" disabled={!canManage || batching} onClick={() => moveDialog.current?.showModal()}><FolderInput size={17} />Move selected</button><label className="sr-only" htmlFor="email-move-target">Move selected emails to</label><select id="email-move-target" className="admin-input" value={moveTarget} disabled={batching} onChange={event => setMoveTarget(event.target.value as MailboxId | "")}><option value="">Choose mailbox…</option>{EMAIL_MAILBOXES.filter(item => visibleIds.includes(item.id)).map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select><button type="button" className="btn-outline" disabled={!canManage || batching || !moveTarget} onClick={() => void manageSelection("move")}><FolderInput size={15} aria-hidden />Move selected</button><button type="button" className="btn-outline emails-delete" disabled={!canManage || batching} onClick={() => void manageSelection("delete")}><Trash2 size={15} aria-hidden />Delete selected</button><button type="button" className="btn-outline" disabled={batching} onClick={() => setSelection([])}>Clear selection</button>{batching ? <span role="status">Saving dashboard changes…</span> : null}</div> : null}

      {activeMailbox ? <div className="emails-handler-bar"><span className="emails-mailbox-chip" style={{ "--mailbox-color": activeMailbox.color } as CSSProperties}>{activeMailbox.label}</span><span>{activeMailbox.address}</span><button type="button" className="btn-outline" disabled={!canManage || Boolean(draft)} onClick={() => { setHandlerName(activeMailbox.handlerName); setEditingHandler(current => !current); }}><Pencil size={14} aria-hidden />{activeMailbox.handlerName ? "Edit handler name" : "Add handler name"}</button></div> : null}
      {editingHandler && activeMailbox ? <form className="emails-handler-editor" onSubmit={event => void saveHandler(event)}><label htmlFor="mailbox-handler">Who handles {activeMailbox.label}?</label><input id="mailbox-handler" className="admin-input" maxLength={80} value={handlerName} onChange={event => setHandlerName(event.target.value)} placeholder="Full name (optional)" disabled={savingHandler} /><button type="submit" className="btn-primary" disabled={savingHandler}>{savingHandler ? "Saving…" : "Save name"}</button><button type="button" className="btn-outline" disabled={savingHandler} onClick={() => setEditingHandler(false)}>Cancel</button></form> : null}
      {error ? <p role="alert" className="text-sm" style={{ color: "var(--danger)" }}>{error}</p> : null}
      {notice ? <p className="emails-page__notice" role="status"><CheckCheck size={17} aria-hidden />{notice}</p> : null}
      </div>
          <div ref={listScrollRef} className="emails-list-scroll" tabIndex={0} role="region" aria-label="Loaded emails">
          <header className="emails-list-header"><label className="emails-select-all"><input type="checkbox" aria-label="Select loaded emails (up to 100)" checked={allLoadedSelected} ref={element => { if (element) element.indeterminate = !allLoadedSelected && selectable.some(message => selectedKeys.has(keyOf(message))); }} disabled={busy || batching || Boolean(draft) || !selectable.length} onChange={() => setSelection(allLoadedSelected ? [] : selectable)} /><span>Select loaded</span></label><h2>{activeMailbox?.label ?? "ALL MAILBOXES"} · {filters.find(item => item.value === filter)?.label}</h2><span>{messages.length}{hasOlder ? "+" : ""} shown</span></header>
          {!messages.length ? <div className="emails-empty"><Inbox size={30} aria-hidden /><p>{busy ? "Loading your emails…" : query ? "No emails match your search" : filter !== "all" ? `No ${filter} emails in ${activeMailbox?.label ?? "ALL MAILBOXES"}` : "No emails here yet"}</p><span>{query || filter !== "all" ? "Show all emails in this mailbox to remove search and status filters." : "Received messages and emails sent from this dashboard appear here."}</span>{!busy && (query || filter !== "all") ? <button type="button" className="btn-outline mt-4" onClick={() => chooseFilter("all")}>Show all {activeMailbox?.label ?? "mailbox"} emails</button> : null}</div> : null}
          <ol>
            {messages.map(message => {
              const address = contactOf(message);
              const name = correspondentLabel(message.correspondentName, address);
              return (
              <li key={keyOf(message)} className="emails-selectable-row" data-checked={selectedKeys.has(keyOf(message))}>
                <label className="emails-row-selector" title={message.status === "PENDING" ? "Resolve sending status before selecting this email" : "Select email"}><input type="checkbox" aria-label={`Select email: ${message.subject || "(No subject)"}`} checked={selectedKeys.has(keyOf(message))} disabled={batching || Boolean(draft) || message.status === "PENDING" || (selection.length >= 100 && !selectedKeys.has(keyOf(message)))} onChange={() => toggleSelection(message)} /></label>
                <button type="button" className="dashboard-inbox__message" data-tone={toneOf(message)} aria-pressed={selected === keyOf(message)} disabled={batching} onClick={() => { if (selected !== keyOf(message)) selectMessage(keyOf(message)); }}>
                  <div className="emails-message__top"><span className="emails-mailbox-chip" style={{ "--mailbox-color": emailMailbox(message.mailboxId ?? "reservations").color } as CSSProperties}>{emailMailbox(message.mailboxId ?? "reservations").label}</span><span className="emails-status" data-failed={message.status === "FAILED"}>{statusOf(message)}</span></div>
                  <div className="emails-message__contact" title={address}><span className="emails-avatar" aria-hidden>{correspondentInitials(name)}</span><div><p className="emails-message__name">{name}</p><p className="emails-message__address">{message.direction === "OUTBOUND" ? "TO" : "FROM"} · {address}</p></div></div>
                  <p className="emails-message__subject">{message.subject || "(No subject)"}</p>
                  <p className="emails-message__preview">{message.preview || "(No message text)"}</p>
                  <div className="emails-message__meta"><span className="emails-status" data-failed={message.status === "FAILED"}>{message.direction === "OUTBOUND" ? <ArrowUpRight size={13} aria-hidden /> : <ArrowDownLeft size={13} aria-hidden />}{statusOf(message)}</span><span>{message.source === "booking" ? "Booking" : "Personal"}</span>{message.attachmentCount ? <span><Paperclip size={12} aria-hidden />{message.attachmentCount}</span> : null}</div>
                  <time className="emails-message__time" dateTime={message.createdAt} title={messageTime.format(new Date(message.createdAt))}>{rowTime.format(new Date(message.createdAt))}</time>
                </button>
              </li>
            ); })}
          </ol>
          {hasOlder ? <div className="p-4"><button type="button" className="btn-outline w-full" disabled={busy || batching} onClick={() => setCursor(messages[messages.length - 1] ?? null)}>Load older emails</button></div> : null}
          </div>
        </section>
        <section ref={detailRef} tabIndex={-1} className="card dashboard-inbox__detail" aria-label="Email details"><button type="button" className="email-icon-button mail-reader-toggle" aria-label={readerExpanded ? "Restore split view" : "Expand email"} onClick={() => setReaderExpanded(value => !value)}>{readerExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}</button>
          <div className="emails-detail-content">
          {selected ? <button type="button" className="btn-outline mb-5" onClick={() => selectMessage(null)}><ArrowLeft className="h-4 w-4" aria-hidden />Back to emails</button> : null}
          {detailError ? <p role="alert" className="mb-4 text-sm" style={{ color: "var(--danger)" }}>{detailError}</p> : null}
          {!detail ? <div className="emails-detail-empty"><span><Mail size={32} aria-hidden /></span><h2>{selected ? detailError ? "Unable to open email" : "Opening email…" : "Every conversation, in focus"}</h2><p>{selected ? "Your message will appear here." : "Choose a message to read its details, or write a personal note in Hathor’s signature style."}</p>{!selected ? <button type="button" className="btn-outline" disabled={!canSend} onClick={() => compose()}><Plus size={16} aria-hidden />Write a new email</button> : null}</div> : (
            <article className="min-w-0 mail-reader-content">
              <div className="emails-detail-contact" data-tone={toneOf(detail)}><span className="emails-avatar" aria-hidden>{correspondentInitials(correspondentLabel(detail.correspondentName, contactOf(detail)))}</span><div><p>{correspondentLabel(detail.correspondentName, contactOf(detail))}</p><span className="emails-status">{statusOf(detail)}{detail.direction === "OUTBOUND" ? " · From Hathor" : " · Received by Hathor"}</span></div><span className="emails-mailbox-chip" style={{ "--mailbox-color": emailMailbox(detail.mailboxId ?? "reservations").color } as CSSProperties}>{emailMailbox(detail.mailboxId ?? "reservations").label}</span></div>
              <h2 className="break-words text-xl font-semibold">{detail.subject || "(No subject)"}</h2>
              <details className="mail-message-details"><summary>Message details</summary><dl className="emails-detail-metadata"><div><dt>From</dt><dd>{detail.sender}</dd></div><div><dt>To</dt><dd>{detail.recipient}</dd></div><div><dt>{detail.direction === "OUTBOUND" ? "Recorded" : "Received"}</dt><dd><time dateTime={detail.createdAt}>{messageTime.format(new Date(detail.createdAt))}</time></dd></div><div><dt>Handled by</dt><dd>{mailboxes.find(item => item.id === detail.mailboxId)?.handlerName || "Not assigned"}</dd></div></dl></details>
              {!detail.senderMatchesGuest ? <p className="mt-4 text-sm text-muted">This sender differs from the booking’s guest email. Verify their identity before taking action.</p> : null}
              {detail.screeningReasons?.length ? <aside className="emails-screening" aria-label="Screening reasons"><p className="font-semibold">{(detail.folder ?? "inbox") === "inbox" ? "Review history" : detail.folder === "spam" ? "Why this is in Spam" : "Why this is quarantined"}</p><ul>{detail.screeningReasons.map(reason => <li key={reason}>{MAIL_REASON_LABELS[reason] ?? "Held for review."}</li>)}</ul></aside> : null}
              <div className="emails-detail-actions my-6 flex flex-wrap gap-3">
                {detail.direction !== "OUTBOUND" ? <button type="button" className="btn-outline" aria-label={detail.readAt ? "Mark unread" : "Mark read"} title={detail.readAt ? "Mark unread" : "Mark read"} disabled={!canManage || marking} onClick={() => void markRead()}><Mail size={17} aria-hidden /><span>{marking ? "Saving…" : detail.readAt ? "Mark unread" : "Mark read"}</span></button> : null}
                {(detail.folder ?? "inbox") !== "inbox" ? <button type="button" className="btn-primary" disabled={!canManage || marking || batching} onClick={() => void moveToFolder("inbox")}>{detail.folder === "spam" ? "Not spam · Move to Inbox" : "Restore to Inbox"}</button> : detail.bookingId && hasAdminPermission(access, "bookings.view") ? <Link className="btn-primary" href={`/admin/bookings/${encodeURIComponent(detail.bookingId)}`}>Open booking & reply</Link> : <button type="button" className="btn-primary" disabled={!sendIds.includes(detail.mailboxId)} onClick={() => compose({ to: contactOf(detail), recipientName: detail.correspondentName ?? "", mailboxId: detail.mailboxId ?? "reservations", subject: /^re:/i.test(detail.subject) ? detail.subject : `Re: ${detail.subject}`.slice(0, 180) })}>{detail.direction === "OUTBOUND" ? "Send another email" : "Reply from dashboard"}</button>}
                {detail.direction === "INBOUND" && detail.folder !== "spam" ? <button type="button" className="btn-outline" aria-label="Mark as spam" title="Mark as spam" disabled={!canManage || marking || batching} onClick={() => void moveToFolder("spam")}><Ban size={17} aria-hidden /><span>Mark as spam</span></button> : null}
                {detail.direction === "INBOUND" && detail.folder !== "security" ? <button type="button" className="btn-outline" aria-label="Flag security threat" title="Flag security threat" disabled={!canManage || marking || batching} onClick={() => void moveToFolder("security")}><ShieldAlert size={17} aria-hidden /><span>Flag security threat</span></button> : null}
                <button type="button" className="btn-outline emails-delete" aria-label="Delete from dashboard" title="Delete from dashboard" disabled={!canManage || deleting || batching || detail.status === "PENDING"} onClick={() => void removeMessage()}><Trash2 size={15} aria-hidden /><span>{deleting ? "Removing…" : "Delete from dashboard"}</span></button>
              </div>
              {detail.direction === "OUTBOUND" && detail.status !== "SENT" ? <p className="email-composer__notice">{detail.status === "FAILED" ? "The provider did not accept this email." : "Sending has not been confirmed. Check the original send request before creating a second copy."}</p> : null}
              <MailConversation key={`${detail.bookingId}/${detail.folder}`} detail={detail} onSent={refresh} refreshPaused={batching || selection.length > 0}>
              <div className="border-t pt-6 text-sm" style={{ borderColor: "var(--border)" }}><EmailMessageBody key={`${keyOf(detail)}/${detail.folder}/${detail.attachments.map(file => file.id).join(",")}`} bodyText={detail.bodyText} formattedUrl={(detail.folder ?? "inbox") === "inbox" && (detail.source === "general" || detail.direction !== "OUTBOUND") ? `/api/admin/inbox/${keyOf(detail)}/formatted` : undefined} /></div>
              {attachmentNotice === keyOf(detail) ? <p role="status" className="mt-5 text-sm text-muted">Attachment removed from the dashboard. The email and Zoho copy are kept. Resend’s copy remains under its retention policy.</p> : null}
              {detail.attachments.length && (detail.folder ?? "inbox") === "inbox" ? <div className="mt-7 border-t pt-5" style={{ borderColor: "var(--border)" }}><h3 className="mb-3 text-sm font-semibold">Attachments</h3><ul className="space-y-2">{detail.attachments.map(file => (
                <li key={file.id}>{detail.direction === "OUTBOUND" ? <a className="inline-flex max-w-full items-center gap-2 break-all text-sm underline underline-offset-4" target="_blank" rel="noopener noreferrer" href={`/api/admin/inbox/${detail.source}/${detail.id}/attachments/${file.id}`}><Paperclip className="h-4 w-4 shrink-0" aria-hidden />{file.filename}</a> : <ReceivedEmailAttachment filename={file.filename} contentType={file.contentType}
                  transferUrl={`/api/admin/inbox/${keyOf(detail)}/attachments/${file.id}/transfer`} disabled={!canManage}
                  downloadOnlyHref={`/api/admin/inbox/${keyOf(detail)}/attachments/${file.id}`} onRemoved={() => attachmentRemoved(detail, file.id)} />}</li>
              ))}</ul><p className="mt-3 text-xs text-muted">Open only files you trust. Attachment availability follows Resend’s retention policy.</p></div> : null}
              {detail.attachments.length && (detail.folder ?? "inbox") !== "inbox" ? <p className="mt-6 text-sm text-muted">Attachments are held until this message is restored.</p> : null}
              </MailConversation>
            </article>
          )}
          </div>
        </section>
      </div>
      </div>
      <dialog ref={moveDialog} className="mail-move-sheet" aria-labelledby="mail-move-title"><h2 id="mail-move-title">Move {selection.length} emails to…</h2><p>Only the dashboard changes. Your Zoho mailboxes stay as they are.</p><div>{EMAIL_MAILBOXES.filter(item => visibleIds.includes(item.id)).map(item => <button type="button" key={item.id} disabled={!canManage || batching || Boolean(draft)} onClick={() => { setMoveTarget(item.id); moveDialog.current?.close(); void manageSelection("move", item.id); }}><span style={{ backgroundColor: item.color }} />{item.label}</button>)}</div><button type="button" className="btn-outline" onClick={() => moveDialog.current?.close()}>Cancel</button></dialog>
      {draft && <FloatingEmailComposer mailboxes={mailboxes} key={draft.key} initial={draft} handlerName={mailboxes.find(item => item.id === draft.mailboxId)?.handlerName} onClose={() => setDraft(null)} onSent={sent} />}
      {navigationOpen && <button type="button" className="mail-drawer-shade" aria-label="Dismiss mail navigation" onClick={() => setNavigationOpen(false)} />}
    </div>
  );
}
