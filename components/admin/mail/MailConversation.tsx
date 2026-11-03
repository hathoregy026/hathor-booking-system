"use client";
import { useEffect, useState, type ReactNode, type FormEvent } from "react";
import Link from "next/link";
import { adminFetch } from "@/lib/admin-fetch";
import { canAdminBookingAction } from "@/lib/admin-booking-access";
import { hasAdminPermission } from "@/lib/admin-permissions";
import type { BookingMessageDto } from "@/lib/booking-message-types";
import type { InboxDetail } from "@/lib/inbox-types";
import { useAdminAccess } from "../AdminAccessProvider";
import { EmailMessageBody } from "../EmailMessageBody";
import { ReceivedEmailAttachment } from "../ReceivedEmailAttachment";
import { ReplyAttachments, readyAttachments, type ReplyAttachment } from "../bookings/ReplyAttachments";
const time = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Cairo", dateStyle: "medium", timeStyle: "short" });
type ReplyBooking = { id: string; deletedAt?: string | null; customerEmail: string };
export function MailConversation({ detail, children, onSent, refreshPaused = false }: { detail: InboxDetail; children: ReactNode; onSent: () => void; refreshPaused?: boolean }) {
  const access = useAdminAccess();
  const bookingId = detail.bookingId;
  const allowed = hasAdminPermission(access, "bookings.view") && (detail.folder ?? "inbox") === "inbox";
  const replyPermission = canAdminBookingAction(access, "message");
  const [messages, setMessages] = useState<BookingMessageDto[] | null>(null);
  const [booking, setBooking] = useState<ReplyBooking | null>(null);
  const [failed, setFailed] = useState(false);
  const [version, setVersion] = useState(0);
  const [hasOlder, setHasOlder] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<ReplyAttachment[]>([]);
  const [busy, setBusy] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const canReply = allowed && replyPermission && booking && !booking.deletedAt && Boolean(booking.customerEmail) && booking.customerEmail !== "—";
  useEffect(() => {
    if (!allowed || !bookingId) return;
    const controller = new AbortController();
    async function load() {
      try {
        const response = await adminFetch(`/api/admin/bookings/${encodeURIComponent(bookingId!)}/messages`, { signal: controller.signal });
        if (!response.ok) throw new Error();
        const data = await response.json() as { messages: BookingMessageDto[] };
        if (!Array.isArray(data.messages)) throw new Error();
        if (!controller.signal.aborted) { setMessages(data.messages); setHasOlder(data.messages.length === 10); setFailed(false); }
      } catch { if (!controller.signal.aborted) setFailed(true); }
    }
    void load();
    // Match the booking page's contact and recycle-bin gates; fail closed if unavailable.
    if (replyPermission) void adminFetch("/api/admin/bookings", { signal: controller.signal })
      .then(async response => response.ok ? response.json() : null)
      .then((data: { bookings: ReplyBooking[] } | null) => { if (!controller.signal.aborted) setBooking(data?.bookings?.find(item => item.id === bookingId) ?? null); })
      .catch(() => { if (!controller.signal.aborted) setBooking(null); });
    return () => controller.abort();
  }, [allowed, bookingId, version, replyPermission]);
  useEffect(() => {
    if (!allowed || !bookingId || refreshPaused || busy) return;
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") setVersion(value => value + 1); }, 30000);
    return () => window.clearInterval(timer);
  }, [allowed, bookingId, refreshPaused, busy]);

  async function older() {
    const oldest = messages?.[messages.length - 1];
    if (!oldest || !bookingId || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const query = new URLSearchParams({ before: oldest.createdAt, cursorId: oldest.id });
      const response = await adminFetch(`/api/admin/bookings/${encodeURIComponent(bookingId)}/messages?${query}`);
      if (!response.ok) throw new Error();
      const data = await response.json() as { messages: BookingMessageDto[] };
      setMessages(current => [...current ?? [], ...data.messages].filter((item, index, all) => all.findIndex(row => row.id === item.id) === index));
      setHasOlder(data.messages.length === 10);
    } catch { setNotice("Older messages could not be loaded. Please try again."); }
    finally { setLoadingOlder(false); }
  }
  async function send(event: FormEvent) {
    event.preventDefault();
    if (!canReply || busy || uncertain || files.some(file => file.status !== "ready")) return;
    setBusy(true); setNotice(null);
    try {
      const response = await adminFetch(`/api/admin/bookings/${encodeURIComponent(bookingId!)}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "message", subject: subject.trim() || undefined, message: message.trim(), attachments: readyAttachments(files) }),
      });
      if (!response.ok) {
        setUncertain(response.status >= 500);
        setNotice(response.status >= 500 ? "Delivery could not be confirmed. Check the booking conversation before sending another copy." : "The reply could not be sent. Check your message, attachments and permissions, then try again.");
        return;
      }
      const result = await response.json() as { email?: { sent?: boolean } };
      if (!result.email?.sent) { setUncertain(true); setNotice("The reply was not confirmed. Open the booking and check its conversation before sending another copy."); return; }
      setMessage(""); setSubject(""); setFiles([]); setNotice("Reply sent."); setVersion(value => value + 1); onSent();
    } catch { setUncertain(true); setNotice("Delivery could not be confirmed. Open the booking and check its conversation before sending another copy."); }
    finally { setBusy(false); }
  }
  if (!bookingId || !allowed) return <>{children}</>;
  if (failed) return <><p className="email-composer__notice" role="status">Conversation could not be loaded. Showing this email. <button className="btn-outline" onClick={() => setVersion(value => value + 1)}>Retry conversation</button></p>{children}</>;
  if (messages === null) return <><p role="status">Loading conversation…</p>{children}</>;
  if (!messages.length) return <>{children}</>;
  return <section className="mail-conversation" aria-label="Booking conversation">
    <header><h3>Conversation · {messages.length}{hasOlder ? "+" : ""} messages</h3><button className="btn-outline" disabled={busy} onClick={() => setVersion(value => value + 1)}>Refresh conversation</button></header>
    {!messages.some(item => item.id === detail.id) && <div aria-label="Selected email">{children}</div>}
    <ol>{[...messages].reverse().map((item, index) => <li key={item.id} className="mail-conversation__message" data-direction={item.direction}><details open={item.id === detail.id || index === messages.length - 1}><summary>
      <header><strong>{item.direction === "INBOUND" ? "Guest" : "Hathor team"}</strong><span className="emails-status">{item.status === "RECEIVED" ? "Received" : item.status === "SENT" ? "Sent" : item.status === "FAILED" ? "Failed to send" : "Send result pending"}</span><time dateTime={item.createdAt}>{time.format(new Date(item.createdAt))}</time></header>
      <p className="mail-conversation__address">{item.sender}</p><h4>{item.subject || "(No subject)"}</h4></summary>
      {item.direction === "INBOUND" && !item.senderMatchesGuest && <p className="email-composer__notice">This sender differs from the booking contact. Verify their identity before taking action.</p>}
      <EmailMessageBody key={item.attachments.map(file => file.id).join(",")} bodyText={item.bodyText} collapseTechnicalLinks formattedUrl={item.direction === "INBOUND" ? `/api/admin/inbox/booking/${item.id}/formatted` : undefined} />
      {!!item.attachments.length && <ul className="mail-conversation__attachments">{item.attachments.map(file => <li key={file.id}>{item.direction === "INBOUND" ? <ReceivedEmailAttachment filename={file.filename} contentType={file.contentType} disabled={!hasAdminPermission(access, "inbox.manage")} transferUrl={`/api/admin/inbox/booking/${item.id}/attachments/${file.id}/transfer`} downloadOnlyHref={`/api/admin/bookings/${encodeURIComponent(bookingId)}/messages/${item.id}/attachments/${file.id}`} onRemoved={() => { setMessages(current => current?.map(row => row.id === item.id ? { ...row, attachments: row.attachments.filter(attachment => attachment.id !== file.id) } : row) ?? null); onSent(); setNotice("Attachment removed from the dashboard. The email and Zoho copy are kept. Resend’s copy remains under its retention policy."); }} /> : <a target="_blank" rel="noopener noreferrer" href={`/api/admin/bookings/${encodeURIComponent(bookingId)}/messages/${item.id}/attachments/${file.id}`}>{file.filename}</a>}</li>)}</ul>}
    </details></li>)}</ol>
    {hasOlder && <button className="btn-outline" disabled={loadingOlder} onClick={() => void older()}>{loadingOlder ? "Loading…" : "Load older messages"}</button>}
    {notice && <p role="status" className="email-composer__notice">{notice}</p>}
    {canReply && <details className="mail-reply-disclosure"><summary>Reply to guest</summary><form className="mail-reply" onSubmit={event => void send(event)}>
      <h3>Reply to guest</h3><label htmlFor="mail-reply-subject">Subject (optional)</label><input id="mail-reply-subject" className="admin-input" value={subject} maxLength={200} disabled={busy || uncertain} onChange={event => setSubject(event.target.value)} />
      <label htmlFor="mail-reply-message">Message</label><textarea id="mail-reply-message" className="admin-input" value={message} required minLength={2} maxLength={4000} rows={5} disabled={busy || uncertain} onChange={event => setMessage(event.target.value)} /><span>{message.length} / 4,000</span>
      <ReplyAttachments bookingId={bookingId} items={files} onChange={setFiles} disabled={busy || uncertain} />
      <footer className="mail-reply__actions"><Link className="btn-outline" href={`/admin/bookings/${encodeURIComponent(bookingId)}`}>Open booking</Link><button className="btn-primary" type="submit" disabled={busy || uncertain || files.some(file => file.status !== "ready")}>{busy ? "Sending…" : "Send reply"}</button></footer>
    </form></details>}
  </section>;
}
