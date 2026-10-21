import { cleanAttachmentName } from "@/lib/mail-attachment-rules";

/** Received documents need a malware scanner before they can be released. */
const RECEIVED_TYPES: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
  webp: "image/webp", gif: "image/gif", txt: "text/plain",
};

export function incomingAttachmentType(name: string, contentType: string): string | null {
  if (!name || name.length > 512 || /[\\/\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/.test(name)) return null;
  const extension = name.slice(name.lastIndexOf(".") + 1).toLowerCase();
  const type = Object.hasOwn(RECEIVED_TYPES, extension) ? RECEIVED_TYPES[extension] : null;
  return type && contentType.toLowerCase().split(";")[0]?.trim() === type ? type : null;
}

/** Matches the rebuilt server response and only offers inert file extensions. */
export function incomingAttachmentDownloadName(name: string, contentType: string): string {
  const cleaned = cleanAttachmentName(name);
  const stem = cleaned.replace(/\.[^.]+$/, "").replace(/[. ]+$/, "");
  const safeStem = !stem || /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(stem) ? "attachment" : stem;
  return `${safeStem}${incomingAttachmentType(name, contentType) === "text/plain" ? ".txt" : ".png"}`;
}

export const INCOMING_ATTACHMENT_BLOCKED_MESSAGE = "This attachment is quarantined. Documents, spreadsheets, archives and executable files require malware scanning before they can be opened. Ask for a JPG, PNG or TXT copy.";
