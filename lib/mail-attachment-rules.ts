export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
export const MAX_ATTACHMENTS_TOTAL_BYTES = 25 * 1024 * 1024;
export const MAX_ATTACHMENTS = 10;

export const ATTACHMENT_CONTENT_TYPES: Record<string, string> = {
  pdf: "application/pdf", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
  webp: "image/webp", gif: "image/gif", txt: "text/plain", csv: "text/csv",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};
export const ATTACHMENT_ACCEPT = Object.keys(ATTACHMENT_CONTENT_TYPES).map(extension => `.${extension}`).join(",");

export type MailAttachmentRef = { path: string; name: string };

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

export function attachmentContentType(name: string): string | null {
  return Object.hasOwn(ATTACHMENT_CONTENT_TYPES, extensionOf(name)) ? ATTACHMENT_CONTENT_TYPES[extensionOf(name)]! : null;
}

export function attachmentProblem(file: { name: string; size: number }): string | null {
  if (!attachmentContentType(file.name)) return "Attach PDF, JPG, PNG, WebP, GIF, TXT, CSV, DOCX, XLSX or PPTX files.";
  if (!Number.isSafeInteger(file.size) || file.size <= 0) return "The attachment is empty or its size is invalid.";
  if (file.size > MAX_ATTACHMENT_BYTES) return `${file.name} is larger than 10 MB.`;
  return null;
}

export function attachmentSignatureMatches(name: string, bytes: Uint8Array): boolean {
  const starts = (prefix: number[]) => prefix.every((value, index) => bytes[index] === value);
  const text = String.fromCharCode(...bytes.slice(0, 64));
  switch (extensionOf(name)) {
    case "pdf": return text.startsWith("%PDF-");
    case "jpg": case "jpeg": return starts([255, 216, 255]);
    case "png": return starts([137, 80, 78, 71, 13, 10, 26, 10]);
    case "gif": return text.startsWith("GIF87a") || text.startsWith("GIF89a");
    case "webp": return text.startsWith("RIFF") && text.slice(8, 12) === "WEBP";
    case "docx": case "xlsx": case "pptx": return starts([80, 75, 3, 4]);
    case "txt": case "csv": return bytes.length > 0 && !bytes.includes(0) && !starts([77, 90]) && !starts([127, 69, 76, 70]);
    default: return false;
  }
}
