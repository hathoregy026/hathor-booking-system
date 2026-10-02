"use client";

import { useRef, useState, type DragEvent } from "react";
import { AlertCircle, Loader2, Paperclip, X } from "lucide-react";
import { ADMIN_UPLOAD_TIMEOUT_MS, adminFetch } from "@/lib/admin-fetch";
import {
  MAX_ATTACHMENTS,
  MAX_ATTACHMENTS_TOTAL_BYTES,
  ATTACHMENT_ACCEPT,
  attachmentProblem,
  type MailAttachmentRef,
} from "@/lib/mail-attachment-rules";

export type ReplyAttachment = {
  key: string;
  name: string;
  size: number;
  status: "uploading" | "ready" | "failed";
  path?: string;
  error?: string;
};

export function readyAttachments(items: ReplyAttachment[]): MailAttachmentRef[] {
  return items.filter((item) => item.status === "ready" && item.path).map((item) => ({ path: item.path!, name: item.name }));
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function uploadAttachment(bookingId: string, file: File): Promise<{ path: string; name: string }> {
  const start = await adminFetch(`/api/admin/bookings/${encodeURIComponent(bookingId)}/attachments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: file.name, size: file.size }),
  });
  const ticket = (await start.json().catch(() => ({}))) as { path?: string; signedUrl?: string; name?: string; contentType?: string; error?: string };
  if (!start.ok || !ticket.path || !ticket.signedUrl || !ticket.contentType) throw new Error(ticket.error ?? "The upload could not start.");

  const put = await adminFetch(
    ticket.signedUrl,
    { method: "PUT", credentials: "omit", headers: { "Content-Type": ticket.contentType, "x-upsert": "false" }, body: file },
    ADMIN_UPLOAD_TIMEOUT_MS,
  );
  if (!put.ok) throw new Error("The upload did not finish.");
  return { path: ticket.path, name: ticket.name ?? file.name };
}

export function ReplyAttachments({
  bookingId,
  items,
  onChange,
  disabled = false,
}: {
  bookingId: string;
  items: ReplyAttachment[];
  onChange: (update: (items: ReplyAttachment[]) => ReplyAttachment[]) => void;
  disabled?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function add(files: FileList | File[]) {
    if (disabled) return;
    setNotice(null);
    const kept = items.filter((item) => item.status !== "failed");
    let count = kept.length;
    let total = kept.reduce((sum, item) => sum + item.size, 0);
    const problems: string[] = [];

    for (const file of Array.from(files)) {
      const problem = attachmentProblem(file);
      if (problem) { problems.push(problem); continue; }
      if (count >= MAX_ATTACHMENTS) { problems.push(`Attach at most ${MAX_ATTACHMENTS} files.`); break; }
      if (total + file.size > MAX_ATTACHMENTS_TOTAL_BYTES) { problems.push(`${file.name}: the attachments would add up to more than 25 MB.`); continue; }
      count += 1;
      total += file.size;

      const key = crypto.randomUUID();
      onChange((current) => [...current, { key, name: file.name, size: file.size, status: "uploading" }]);
      uploadAttachment(bookingId, file).then(
        ({ path, name }) => onChange((current) => current.map((item) => (item.key === key ? { ...item, name, path, status: "ready" } : item))),
        (error: unknown) =>
          onChange((current) =>
            current.map((item) =>
              item.key === key ? { ...item, status: "failed", error: error instanceof Error ? error.message : "The upload failed." } : item,
            ),
          ),
      );
    }
    if (problems.length) setNotice(problems.join(" "));
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length) add(event.dataTransfer.files);
  }

  return (
    <div>
      <div
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed px-3 py-3 text-sm"
        style={{ borderColor: dragging ? "var(--accent)" : "var(--border)" }}
      >
        <button type="button" className="btn-outline h-9 px-3 text-sm" disabled={disabled} onClick={() => input.current?.click()}>
          <Paperclip className="h-4 w-4" aria-hidden />
          Attach files
        </button>
        <span className="text-muted text-xs">or drop them here · up to 10 MB each, 25 MB in total</span>
        <input
          ref={input}
          type="file"
          multiple
          accept={ATTACHMENT_ACCEPT}
          disabled={disabled}
          hidden
          onChange={(event) => {
            if (event.target.files?.length) add(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {items.length ? (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Attachments">
          {items.map((item) => (
            <li
              key={item.key}
              className="flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-xs"
              style={{ borderColor: item.status === "failed" ? "var(--danger)" : "var(--border)" }}
              title={item.error}
            >
              {item.status === "uploading" ? <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-label="Uploading" /> : null}
              {item.status === "failed" ? <AlertCircle className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--danger)" }} aria-label="Upload failed" /> : null}
              {item.status === "ready" ? <Paperclip className="h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
              <span className="truncate">{item.name}</span>
              <span className="text-muted shrink-0">{item.status === "failed" ? "failed" : formatSize(item.size)}</span>
              <button
                type="button"
                disabled={disabled}
                className="shrink-0 rounded-full p-0.5 hover:opacity-70"
                aria-label={`Remove ${item.name}`}
                onClick={() => onChange((current) => current.filter((other) => other.key !== item.key))}
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {notice ? <p className="mt-2 text-xs" style={{ color: "var(--danger)" }}>{notice}</p> : null}
    </div>
  );
}
