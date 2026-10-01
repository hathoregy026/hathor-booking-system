/** Limits and checks for reply attachments, shared by the dashboard dialog and the server. */

export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
export const MAX_ATTACHMENTS_TOTAL_BYTES = 25 * 1024 * 1024;
export const MAX_ATTACHMENTS = 10;

/* Programs and scripts never travel in a reservations email (inboxes reject them anyway). */
const BLOCKED_EXTENSIONS = new Set([
  "exe", "msi", "bat", "cmd", "com", "scr", "pif", "cpl", "dll", "sys", "vbs", "vbe", "js", "jse",
  "wsf", "wsh", "ps1", "psm1", "hta", "jar", "sh", "app", "apk", "lnk", "reg", "iso", "img", "dmg",
]);

export type MailAttachmentRef = { path: string; name: string };

/** A file name a guest's inbox will show: no folders, no control characters, a sensible length. */
export function cleanAttachmentName(raw: string): string {
  const base = raw.split(/[\\/]/).pop() ?? "";
  const cleaned = base.replace(/[\u0000-\u001f\u007f<>:"|?*]/g, "").replace(/\s+/g, " ").trim();
  if (!cleaned || cleaned === "." || cleaned === "..") return "attachment";
  if (cleaned.length <= 120) return cleaned;
  const dot = cleaned.lastIndexOf(".");
  const ext = dot > 0 && cleaned.length - dot <= 10 ? cleaned.slice(dot) : "";
  return cleaned.slice(0, 120 - ext.length) + ext;
}

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : "";
}

/** Why a file cannot be attached, or null when it can. Shared by the dialog and the server. */
export function attachmentProblem(file: { name: string; size: number }): string | null {
  if (BLOCKED_EXTENSIONS.has(extensionOf(file.name))) {
    return `${file.name}: program and script files cannot be attached.`;
  }
  if (!Number.isFinite(file.size) || file.size <= 0) return `${file.name} is empty.`;
  if (file.size > MAX_ATTACHMENT_BYTES) return `${file.name} is larger than 10 MB.`;
  return null;
}
