"use client";

import { useCallback, useEffect, useState } from "react";
import { Mail, Paperclip, RefreshCw } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import type { BookingMessageDto } from "@/lib/booking-message-types";

const messageTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Cairo", dateStyle: "medium", timeStyle: "short",
});

export function BookingConversation({ bookingId, onReply, canReply }: { bookingId: string; onReply: () => void; canReply: boolean }) {
  const [messages, setMessages] = useState<BookingMessageDto[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasOlder, setHasOlder] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);

  const refresh = useCallback(() => setRefreshVersion(version => version + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    async function loadMessages() {
      setBusy(true);
      try {
        const response = await adminFetch(`/api/admin/bookings/${encodeURIComponent(bookingId)}/messages`, { signal: controller.signal });
        if (!response.ok) throw new Error("Messages could not be loaded.");
        const data = await response.json() as { messages: BookingMessageDto[] };
        if (controller.signal.aborted) return;
        setMessages(data.messages);
        setHasOlder(data.messages.length === 10);
        setError(null);
      } catch {
        if (!controller.signal.aborted) setError("Messages could not be loaded. Refresh to try again.");
      } finally { if (!controller.signal.aborted) setBusy(false); }
    }
    void loadMessages();
    return () => controller.abort();
  }, [bookingId, refreshVersion]);

  useEffect(() => {
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") refresh(); }, 30000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  async function loadOlder() {
    const oldest = messages[messages.length - 1];
    if (!oldest) return;
    setBusy(true);
    try {
      const query = new URLSearchParams({ before: oldest.createdAt, cursorId: oldest.id });
      const response = await adminFetch(`/api/admin/bookings/${encodeURIComponent(bookingId)}/messages?${query}`);
      if (!response.ok) throw new Error("Messages could not be loaded.");
      const data = await response.json() as { messages: BookingMessageDto[] };
      setMessages(current => [...current, ...data.messages].filter((message, index, all) => all.findIndex(item => item.id === message.id) === index));
      setHasOlder(data.messages.length === 10);
      setError(null);
    } catch { setError("Older messages could not be loaded. Please try again."); }
    finally { setBusy(false); }
  }

  return (
    <section className="card overflow-hidden" aria-label="Booking conversation">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5" style={{ borderColor: "var(--border)" }}>
        <h2 className="flex items-center gap-2 text-sm font-semibold"><Mail className="h-4 w-4 text-muted" aria-hidden />Conversation</h2>
        <div className="flex items-center gap-2">
          <button type="button" className="btn-outline h-9 px-3 text-xs" onClick={refresh} disabled={busy} aria-label="Refresh messages">
            <RefreshCw className={`h-3.5 w-3.5${busy ? " animate-spin" : ""}`} aria-hidden />Refresh
          </button>
          {canReply ? <button type="button" className="btn-primary h-9 px-3 text-xs" onClick={onReply}>Reply to guest</button> : null}
        </div>
      </header>
      <div className="px-5 py-4" aria-busy={busy}>
        {error ? <p role="alert" className="mb-3 text-sm" style={{ color: "var(--danger)" }}>{error}</p> : null}
        {!messages.length ? <p className="text-sm text-muted">{busy ? "Loading messages…" : "No messages recorded yet. New booking emails and guest replies appear here once email receiving is activated."}</p> : null}
        <ol className="space-y-4">
          {messages.map(message => (
            <li key={message.id} className="border-l-2 pl-4" style={{ borderColor: message.direction === "INBOUND" ? "var(--accent)" : "var(--border)" }}>
              <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
                <span className="font-semibold">{message.direction === "INBOUND" ? "Guest" : "Hathor team"} · {message.status === "RECEIVED" ? "Received" : message.status === "SENT" ? "Sent" : message.status === "FAILED" ? "Failed to send" : "Send result pending"}</span>
                <time className="text-muted" dateTime={message.createdAt}>{messageTime.format(new Date(message.createdAt))}</time>
              </div>
              <p className="mt-1 break-all text-xs text-muted">{message.sender}</p>
              {message.direction === "INBOUND" && !message.senderMatchesGuest ? <p className="mt-1 text-xs" style={{ color: "var(--accent)" }}>Sent from a different address than the booking contact.</p> : null}
              <h3 className="mt-2 break-words text-sm font-semibold">{message.subject || "No subject"}</h3>
              <details className="mt-2 text-sm">
                <summary className="cursor-pointer text-muted">Read message</summary>
                <p className="mt-2 max-h-96 overflow-y-auto whitespace-pre-wrap break-words leading-relaxed">{message.bodyText || "No text content."}</p>
              </details>
              {message.attachments.length ? <ul className="mt-2 flex flex-wrap gap-2">{message.attachments.map(attachment => (
                <li key={attachment.id}><a className="inline-flex max-w-full items-center gap-1 break-all text-xs hover:underline" style={{ color: "var(--accent)" }} target="_blank" rel="noopener noreferrer"
                  href={`/api/admin/bookings/${encodeURIComponent(bookingId)}/messages/${encodeURIComponent(message.id)}/attachments/${encodeURIComponent(attachment.id)}`}>
                  <Paperclip className="h-3 w-3 shrink-0" aria-hidden />{attachment.filename}
                </a></li>
              ))}</ul> : null}
            </li>
          ))}
        </ol>
        {hasOlder ? <button type="button" className="btn-outline mt-4 h-9 px-3 text-xs" disabled={busy} onClick={() => void loadOlder()}>Load older messages</button> : null}
      </div>
    </section>
  );
}
