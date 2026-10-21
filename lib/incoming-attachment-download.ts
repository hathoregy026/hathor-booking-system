import sharp from "sharp";
import { PublicRequestError } from "@/lib/public-api-security";
import { attachmentSignatureMatches, MAX_ATTACHMENT_BYTES } from "@/lib/mail-attachment-rules";
import { incomingAttachmentDownloadName, incomingAttachmentType, INCOMING_ATTACHMENT_BLOCKED_MESSAGE } from "@/lib/incoming-attachment-policy";

// Buffered responses must stay below Vercel's 4.5 MB function payload limit.
const MAX_DOWNLOAD_RESPONSE_BYTES = 4 * 1024 * 1024;

export async function incomingAttachmentResponse(
  url: string,
  file: { filename: string; contentType: string },
  fetchFile: typeof fetch = fetch,
): Promise<Response> {
  const type = incomingAttachmentType(file.filename, file.contentType);
  if (!type) throw new PublicRequestError(INCOMING_ATTACHMENT_BLOCKED_MESSAGE, 403);
  const target = new URL(url);
  if (target.protocol !== "https:" || target.hostname !== "inbound-cdn.resend.com" || target.port || target.username || target.password) throw new Error("Invalid attachment destination");
  const response = await fetchFile(target, { redirect: "error", signal: AbortSignal.timeout(15000), cache: "no-store" });
  if (!response.ok || !response.body) throw new Error("Attachment unavailable");
  const reader = response.body.getReader();
  const chunks: Buffer[] = [];
  let size = 0;
  try {
    if (Number(response.headers.get("content-length")) > MAX_ATTACHMENT_BYTES) {
      await reader.cancel();
      throw new PublicRequestError("This attachment exceeds the 10 MB download limit.", 413);
    }
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_ATTACHMENT_BYTES) {
        await reader.cancel();
        throw new PublicRequestError("This attachment exceeds the 10 MB download limit.", 413);
      }
      chunks.push(Buffer.from(value));
    }
  } finally { reader.releaseLock(); }
  let bytes = Buffer.concat(chunks);
  if (!attachmentSignatureMatches(file.filename, bytes)) throw new PublicRequestError("The attachment contents do not match its file type.", 403);
  const name = incomingAttachmentDownloadName(file.filename, file.contentType);
  if (type === "text/plain") {
    try {
      const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text)) throw new Error("Invalid text");
    } catch { throw new PublicRequestError("This attachment is not a plain UTF-8 text file.", 403); }
  } else {
    // Decode only bounded rasters, stripping metadata/animation and embedded data.
    bytes = await sharp(bytes, { limitInputPixels: 20_000_000, animated: false, failOn: "error" })
      .timeout({ seconds: 10 }).rotate().resize(4096, 4096, { fit: "inside", withoutEnlargement: true }).png().toBuffer();
  }
  if (bytes.byteLength > MAX_DOWNLOAD_RESPONSE_BYTES) throw new PublicRequestError("This attachment exceeds the 4 MB safe download limit. Ask for a smaller copy.", 413);
  return new Response(new Uint8Array(bytes), { headers: {
    "Content-Type": "application/octet-stream",
    "Content-Disposition": `attachment; filename="attachment${type === "text/plain" ? ".txt" : ".png"}"; filename*=UTF-8''${encodeURIComponent(name).replace(/['()*]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)}`,
    "Content-Length": String(bytes.byteLength),
    "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY",
    "Content-Security-Policy": "default-src 'none'; sandbox; frame-ancestors 'none'",
  } });
}
