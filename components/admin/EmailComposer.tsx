"use client";

import { useState, type FormEvent } from "react";
import { Eye, Send, X } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import { emailMailbox, type MailboxId } from "@/lib/email-mailboxes";
import { ReplyAttachments, readyAttachments, type ReplyAttachment } from "@/components/admin/bookings/ReplyAttachments";

export type EmailDraft = { to: string; recipientName: string; subject: string; mailboxId?: MailboxId };
type SendResult = { id: string; status: "SENT" | "PENDING" | "FAILED" };

export function EmailComposer({ initial, handlerName = "", onClose, onSent }: { initial: EmailDraft; handlerName?: string; onClose: () => void; onSent: (id: string) => void }) {
  const mailbox = emailMailbox(initial.mailboxId ?? "reservations");
  const [to, setTo] = useState(initial.to);
  const [recipientName, setRecipientName] = useState(initial.recipientName);
  const [subject, setSubject] = useState(initial.subject);
  const [message, setMessage] = useState("");
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const [draftId] = useState(() => crypto.randomUUID());
  const [files, setFiles] = useState<ReplyAttachment[]>([]);
  const [busy, setBusy] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const locked = busy || pending || previewing;
  const uploading = files.some(file => file.status === "uploading");

  function edit(change: () => void) { change(); setRequestId(crypto.randomUUID()); setPreview(null); setError(null); }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || previewing) return;
    const showPreview = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value") === "preview";
    setError(null);
    if (uploading || files.some(file => file.status === "failed")) {
      setError(uploading ? "Wait for the attachments to finish uploading." : "Remove failed attachments or attach them again.");
      return;
    }
    if (showPreview) setPreviewing(true); else setBusy(true);
    try {
      const content = { to: to.trim(), recipientName: recipientName.trim(), subject: subject.trim(), message: message.trim(), mailboxId: mailbox.id, draftId, attachments: readyAttachments(files) };
      const response = await adminFetch(showPreview ? "/api/admin/inbox/preview" : "/api/admin/inbox/send", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(showPreview ? content : { ...content, requestId }),
      });
      if (!response.ok) {
        if (!showPreview && response.status >= 500) setPending(true);
        throw new Error(response.status === 429 ? "Please wait before sending again. Your message is still here." : response.status === 400 || response.status === 413 ? "Check the address, subject, message length and attachments, then try again." : "Your request could not be completed. Your message is still here.");
      }
      if (showPreview) { setPreview(await response.text()); return; }
      const result = await response.json() as SendResult;
      if (result.status === "SENT") { onSent(result.id); return; }
      if (result.status === "PENDING") {
        setPending(true);
        setError("Sending is not confirmed yet. Wait one minute, then check using the same request below. Do not send a second copy.");
      } else {
        setPending(false);
        setRequestId(crypto.randomUUID());
        setError("This email was not sent. Check your sending configuration or recipient, then try again.");
      }
    } catch (issue) {
      if (!showPreview && !(issue instanceof Error && /Check the address|Please wait|Your request/.test(issue.message))) setPending(true);
      setError(issue instanceof Error && /Check the address|Please wait|Your request/.test(issue.message) ? issue.message : "Sending could not be confirmed. Keep this message and check its status before sending another copy.");
    } finally { setBusy(false); setPreviewing(false); }
  }

  function close() {
    if (busy || previewing) return;
    if ((message || files.length || pending) && !window.confirm(pending ? "The email may have been sent. Closing does not cancel delivery. Check Sent before writing a new copy. Close this draft?" : "Discard this unsent draft?")) return;
    onClose();
  }

  return (
    <section className="email-composer" aria-label="New email">
      <header className="email-composer__header"><div><p className="emails-eyebrow">Hathor correspondence</p><h2>New email</h2></div><button type="button" className="email-icon-button" aria-label="Close new email" onClick={close} disabled={busy}><X size={18} aria-hidden /></button></header>
      <div className="email-composer__brand"><span className="emails-mailbox-chip" style={{ "--mailbox-color": mailbox.color } as React.CSSProperties}>{mailbox.label}</span><p>From <strong>{mailbox.address}</strong>{handlerName ? ` · ${handlerName}` : ""}</p></div>
      <form onSubmit={event => void submit(event)}>
        <div className="email-composer__fields">
          <label>To<input className="admin-input" name="to" type="email" required maxLength={254} autoComplete="off" placeholder="guest@example.com" value={to} disabled={locked} onChange={event => edit(() => setTo(event.target.value))} /></label>
          <label>Recipient name <span>(optional)</span><input className="admin-input" name="recipientName" maxLength={160} autoComplete="off" placeholder="Guest or company name" value={recipientName} disabled={locked} onChange={event => edit(() => setRecipientName(event.target.value))} /></label>
          <label className="email-composer__wide">Subject<input className="admin-input" name="subject" required maxLength={180} placeholder="A personal note from Hathor" value={subject} disabled={locked} onChange={event => edit(() => setSubject(event.target.value))} /></label>
          <label className="email-composer__wide">Message<textarea className="admin-input" name="message" aria-label="Message" required maxLength={6000} rows={9} placeholder="Write your personal message. Hathor’s branded layout and signature are added automatically." value={message} disabled={locked} onChange={event => edit(() => setMessage(event.target.value))} /><span className="email-composer__counter">{message.length.toLocaleString()} / 6,000</span></label>
          <div className="email-composer__wide"><p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Attachments</p><ReplyAttachments draftId={draftId} items={files} onChange={update => edit(() => setFiles(update))} disabled={locked} /><p className="mt-2 text-xs text-muted">PDFs, photos, screenshots, text files and Office documents. Sent with your email and saved in its dashboard history.</p></div>
        </div>
        {error ? <p className="email-composer__notice" role="alert">{error}</p> : null}
        <footer className="email-composer__footer"><p>One private recipient. Includes Hathor’s branding and this mailbox’s signature. Replies reach {mailbox.address}; Zoho forwarding also brings them here.</p><div><button type="submit" value="preview" className="btn-outline" disabled={busy || previewing || pending || uploading}><Eye size={16} aria-hidden />{previewing ? "Preparing…" : "Preview branding"}</button><button type="submit" value="send" className="btn-primary" disabled={busy || previewing || uploading}><Send size={16} aria-hidden />{busy ? "Sending…" : pending ? "Check sending status" : "Send email"}</button></div></footer>
      </form>
      {preview ? <div className="email-composer__preview"><div><h3>Branded preview</h3><button type="button" className="email-icon-button" aria-label="Close branded preview" onClick={() => setPreview(null)}><X size={16} aria-hidden /></button></div><p>Images are blocked in this protected preview. The delivered email includes your usual branded images.</p><iframe title="Branded email preview" srcDoc={preview} sandbox="allow-popups allow-popups-to-escape-sandbox" referrerPolicy="no-referrer" /></div> : null}
    </section>
  );
}
