"use client";

import { useRef, useState } from "react";
import { incomingAttachmentType, INCOMING_ATTACHMENT_BLOCKED_MESSAGE } from "@/lib/incoming-attachment-policy";
import { AttachmentTransferError, removeSavedAttachment, saveReceivedAttachment, type AttachmentSave } from "@/lib/received-attachment-client";

export function ReceivedEmailAttachment({ filename, contentType, transferUrl, disabled = false, downloadOnlyHref, onRemoved }: {
  filename: string; contentType: string; transferUrl: string; disabled?: boolean; downloadOnlyHref?: string; onRemoved?: () => void;
}) {
  const [phase, setPhase] = useState<"idle" | "saving" | "confirm" | "removing" | "retry" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<AttachmentSave | null>(null);
  const working = useRef(false);

  async function remove(confirmation: AttachmentSave) {
    setPhase("removing"); setError(null);
    try {
      await removeSavedAttachment(transferUrl, confirmation);
      setPhase("done"); onRemoved?.();
    } catch (failure) {
      setPhase("retry");
      setError(failure instanceof AttachmentTransferError ? failure.message : "Your file was saved, but dashboard removal could not be confirmed. Keep your copy and retry removal.");
    }
  }

  async function download() {
    if (working.current || disabled) return;
    working.current = true; setError(null); setPhase("saving");
    try {
      const confirmation = await saveReceivedAttachment({ filename, contentType, transferUrl });
      setSaved(confirmation);
      if (confirmation.saveMethod === "file-system") await remove(confirmation);
      else setPhase("confirm");
    } catch (failure) {
      setPhase("idle");
      setError(failure instanceof Error && failure.name === "AbortError" ? "Save cancelled. The attachment was kept."
        : failure instanceof AttachmentTransferError ? failure.message : "The file could not be saved. The attachment was kept; please try again.");
    } finally { working.current = false; }
  }

  async function confirmRemoval() {
    if (working.current || !saved) return;
    working.current = true;
    try { await remove(saved); } finally { working.current = false; }
  }

  if (phase === "done") return <p role="status" className="text-sm text-muted">Attachment removed from the dashboard. Email kept. Resend retention still applies.</p>;
  if (!incomingAttachmentType(filename, contentType)) return (
    <div className="text-sm">
      <p className="break-all font-medium">{filename} · Quarantined</p>
      <p className="mt-1 text-xs leading-relaxed text-muted">{INCOMING_ATTACHMENT_BLOCKED_MESSAGE}</p>
    </div>
  );
  if (disabled && downloadOnlyHref) return <div className="text-sm">
    <a className="btn-outline min-h-11 max-w-full whitespace-normal break-all" href={downloadOnlyHref} referrerPolicy="no-referrer">Download {filename}</a>
    <p className="mt-2 text-xs text-muted">Read-only access keeps the dashboard attachment. Editing permission is required to remove it.</p>
  </div>;
  return (
    <div className="max-w-full text-sm">
      <p className="break-all font-medium">{filename}</p>
      <p className="my-2 max-w-xl text-xs leading-relaxed text-muted">Download only files you expected. Images are rebuilt as PNGs; text is checked. Maximum 4 MB. After saving, this attachment is removed from the dashboard. The email and Zoho copy stay; Resend keeps its copy under its retention policy.</p>
      {phase === "idle" ? <button type="button" className="btn-outline min-h-11 max-w-full whitespace-normal break-all" disabled={disabled} onClick={() => void download()}>Download & remove {filename}</button> : null}
      {phase === "saving" || phase === "removing" ? <p role="status" className="py-2 text-muted">{phase === "saving" ? "Saving attachment…" : "Removing saved attachment from dashboard…"}</p> : null}
      {phase === "confirm" ? <div className="space-y-2">
        <p role="status" className="max-w-xl text-xs text-muted">Check that the download finished and the file is on your machine. Only then confirm removal.</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-outline min-h-11" onClick={() => void confirmRemoval()}>I saved it — remove from dashboard</button>
          <button type="button" className="btn-outline min-h-11" onClick={() => { setSaved(null); setPhase("idle"); }}>Keep attachment in dashboard</button>
        </div>
      </div> : null}
      {phase === "retry" ? <button type="button" className="btn-outline min-h-11" onClick={() => void confirmRemoval()}>Retry dashboard removal</button> : null}
      {error ? <p role="alert" className="mt-2 max-w-xl text-xs" style={{ color: "var(--danger)" }}>{error}</p> : null}
    </div>
  );
}
