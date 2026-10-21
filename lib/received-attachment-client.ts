import { adminFetch } from "@/lib/admin-fetch";
import { incomingAttachmentDownloadName, incomingAttachmentType } from "@/lib/incoming-attachment-policy";

type WritableFile = { write: (data: Blob) => Promise<void>; close: () => Promise<void>; abort: () => Promise<void> };
type FileHandle = { createWritable: () => Promise<WritableFile> };
type SavePicker = (options: {
  suggestedName: string; excludeAcceptAllOption: boolean;
  types: Array<{ description: string; accept: Record<string, string[]> }>;
}) => Promise<FileHandle>;
export type AttachmentSave = { receiptId: string; saveMethod: "file-system" | "employee-confirmation" };
type Dependencies = {
  request?: typeof adminFetch; picker?: SavePicker | null;
  download?: (blob: Blob, name: string) => void;
};

export class AttachmentTransferError extends Error {}

async function assertOk(response: Response): Promise<void> {
  if (response.ok) return;
  // Only display bounded API errors, escaped by React. Never expose a raw response body.
  const data = await response.json().catch(() => null) as { error?: unknown } | null;
  throw new AttachmentTransferError(typeof data?.error === "string" && data.error.length <= 300
    ? data.error : "Attachment is unavailable. Refresh the email and try again.");
}

function browserDownload(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = name; anchor.rel = "noopener";
  document.body.appendChild(anchor);
  try { anchor.click(); } finally {
    anchor.remove();
    // Give the browser time to acquire the blob, then release its memory.
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
}

export async function saveReceivedAttachment(
  input: { transferUrl: string; filename: string; contentType: string }, dependencies: Dependencies = {},
): Promise<AttachmentSave> {
  if (!incomingAttachmentType(input.filename, input.contentType)) throw new AttachmentTransferError("This attachment is quarantined.");
  const name = incomingAttachmentDownloadName(input.filename, input.contentType);
  const text = name.endsWith(".txt");
  const picker = dependencies.picker === undefined
    ? (window as Window & { showSaveFilePicker?: SavePicker }).showSaveFilePicker?.bind(window)
    : dependencies.picker;
  // Ask within the original click's activation, before any network await.
  const handle = picker ? await picker({
    suggestedName: name, excludeAcceptAllOption: true,
    types: [{ description: text ? "Plain text" : "Rebuilt image", accept: text ? { "text/plain": [".txt"] } : { "image/png": [".png"] } }],
  }) : null;
  const response = await (dependencies.request ?? adminFetch)(input.transferUrl, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: "{}",
    credentials: "same-origin", cache: "no-store", redirect: "error",
  }, 60000);
  await assertOk(response);
  const receiptId = response.headers.get("X-Attachment-Receipt");
  if (!receiptId || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(receiptId)
    || response.headers.get("Content-Type") !== "application/octet-stream") {
    throw new AttachmentTransferError("The download could not be verified. The attachment was kept.");
  }
  const blob = await response.blob();
  if (!blob.size || blob.size > 4 * 1024 * 1024) throw new AttachmentTransferError("The download size is invalid. The attachment was kept.");
  if (handle) {
    const writable = await handle.createWritable();
    try { await writable.write(blob); await writable.close(); }
    catch (error) { await writable.abort().catch(() => {}); throw error; }
    return { receiptId, saveMethod: "file-system" };
  }
  (dependencies.download ?? browserDownload)(blob, name);
  return { receiptId, saveMethod: "employee-confirmation" };
}

export async function removeSavedAttachment(transferUrl: string, saved: AttachmentSave, request = adminFetch): Promise<void> {
  const response = await request(transferUrl, {
    method: "DELETE", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...saved, saved: true }), credentials: "same-origin", cache: "no-store", redirect: "error",
  });
  await assertOk(response);
  const result = await response.json() as { removed?: boolean };
  if (result.removed !== true) throw new AttachmentTransferError("Removal could not be confirmed. Keep your saved copy and retry removal.");
}
