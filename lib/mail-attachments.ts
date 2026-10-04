import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import { PublicRequestError } from "@/lib/public-api-security";
import { createSupabaseStorageAdminClient } from "@/lib/supabase-server";
import {
  ATTACHMENT_CONTENT_TYPES, MAX_ATTACHMENTS, MAX_ATTACHMENTS_TOTAL_BYTES, MAX_ATTACHMENT_BYTES,
  attachmentProblem, attachmentContentType, attachmentSignatureMatches, cleanAttachmentName, type MailAttachmentRef,
} from "@/lib/mail-attachment-rules";

export const MAIL_ATTACHMENT_BUCKET = "mail-attachments";
export type ResendAttachment = { filename: string; path: string; storagePath: string; id: string; contentType: string };
export type PrivateEmailAttachment = ResendAttachment & { content: string; contentHash: string };

export function privateEmailAttachmentScope(sessionId: string, draftId: string): string {
  if (!sessionId || !z.uuid().safeParse(draftId).success) throw new PublicRequestError("Invalid email draft", 400);
  return `mail-${createHash("sha256").update(JSON.stringify([sessionId, draftId])).digest("hex").slice(0, 56)}`;
}

export async function privateEmailAttachmentDownloadUrl(path: string): Promise<string> {
  const scope = /^bookings\/(mail-[a-f0-9]{56})\//.exec(path)?.[1];
  if (!scope) throw new PublicRequestError("Invalid email attachment", 400);
  return attachmentDownloadUrl(scope, path);
}
export const mailAttachmentRefsSchema = z.array(z.object({
  path: z.string().min(1).max(400), name: z.string().trim().min(1).max(255),
}).strict()).max(MAX_ATTACHMENTS).refine(refs => new Set(refs.map(ref => ref.path)).size === refs.length, "An attachment cannot be added twice.");

function bookingFolder(bookingId: string): string {
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(bookingId)) throw new PublicRequestError("Invalid booking", 400);
  return `bookings/${bookingId}`;
}

export function attachmentStorageId(bookingId: string, path: string): string {
  const folder = `${bookingFolder(bookingId)}/`;
  const object = path.startsWith(folder) ? path.slice(folder.length) : "";
  if (!/^[a-f0-9-]{36}-[A-Za-z0-9._-]+$/.test(object) || !z.uuid().safeParse(object.slice(0, 36)).success) {
    throw new PublicRequestError("Invalid attachment for this booking", 400);
  }
  return object.slice(0, 36);
}

export function validateAttachmentMetadata(bookingId: string, ref: MailAttachmentRef, size: number, storedType: string): { id: string; name: string; contentType: string } {
  const id = attachmentStorageId(bookingId, ref.path);
  const name = cleanAttachmentName(ref.name);
  const problem = attachmentProblem({ name, size });
  if (problem) throw new PublicRequestError(problem, 400);
  const contentType = attachmentContentType(name)!;
  if (contentType !== attachmentContentType(ref.path) || storedType.split(";")[0]?.trim() !== contentType) throw new PublicRequestError("The attachment type does not match its filename.", 400);
  return { id, name, contentType };
}

let bucketReady: Promise<void> | null = null;
function ensureBucket(): Promise<void> {
  bucketReady ??= (async () => {
    const storage = createSupabaseStorageAdminClient().storage;
    const { data, error } = await storage.getBucket(MAIL_ATTACHMENT_BUCKET);
    if (data) {
      if (data.public) throw new Error("Attachment storage must be private");
      return;
    }
    if (error && !/not found/i.test(error.message)) throw new Error("Attachment storage is unavailable");
    const result = await storage.createBucket(MAIL_ATTACHMENT_BUCKET, {
      public: false, fileSizeLimit: MAX_ATTACHMENT_BYTES, allowedMimeTypes: Object.values(ATTACHMENT_CONTENT_TYPES),
    });
    if (result.error) {
      const existing = await storage.getBucket(MAIL_ATTACHMENT_BUCKET);
      if (!existing.data || existing.data.public) throw new Error("Attachment storage is unavailable");
    }
  })().catch(() => { bucketReady = null; throw new Error("Attachment storage is unavailable"); });
  return bucketReady;
}

export async function createAttachmentUpload(bookingId: string, file: { name: string; size: number }) {
  const name = cleanAttachmentName(file.name);
  const problem = attachmentProblem({ name, size: file.size });
  if (problem) throw new PublicRequestError(problem, 400);
  const folder = bookingFolder(bookingId);
  await ensureBucket();
  const storageName = name.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  const path = `${folder}/${randomUUID()}-${storageName}`;
  const { data, error } = await createSupabaseStorageAdminClient().storage.from(MAIL_ATTACHMENT_BUCKET).createSignedUploadUrl(path, { upsert: false });
  if (error || !data?.signedUrl) throw new Error("Could not start the attachment upload");
  return { path, signedUrl: data.signedUrl, name, contentType: attachmentContentType(name)! };
}

export async function attachmentDownloadUrl(bookingId: string, path: string): Promise<string> {
  attachmentStorageId(bookingId, path);
  await ensureBucket();
  const { data, error } = await createSupabaseStorageAdminClient().storage.from(MAIL_ATTACHMENT_BUCKET).createSignedUrl(path, 3600, { download: true });
  if (error || !data?.signedUrl) throw new Error("Attachment is unavailable");
  const target = new URL(data.signedUrl);
  if (target.protocol !== "https:" || target.origin !== new URL(process.env.SUPABASE_URL!).origin || target.username || target.password) throw new Error("Invalid attachment destination");
  return target.href;
}

async function attachmentPrefix(url: string): Promise<Uint8Array> {
  const response = await fetch(url, { headers: { Range: "bytes=0-63" }, redirect: "error", cache: "no-store", signal: AbortSignal.timeout(15000) });
  if (!response.ok || !response.body) throw new Error("Attachment is unavailable");
  const reader = response.body.getReader();
  try {
    const bytes = new Uint8Array(64);
    let length = 0;
    while (length < 64) {
      const chunk = await reader.read();
      if (chunk.done) break;
      const copied = chunk.value.slice(0, 64 - length);
      bytes.set(copied, length);
      length += copied.length;
    }
    return bytes.slice(0, length);
  } finally { await reader.cancel(); reader.releaseLock(); }
}

export async function resolveAttachments(bookingId: string, input: MailAttachmentRef[]): Promise<ResendAttachment[]> {
  const refs = mailAttachmentRefsSchema.parse(input);
  if (!refs.length) return [];
  await ensureBucket();
  const storage = createSupabaseStorageAdminClient().storage.from(MAIL_ATTACHMENT_BUCKET);
  let total = 0;
  const attachments: ResendAttachment[] = [];
  for (const ref of refs) {
    attachmentStorageId(bookingId, ref.path);
    const { data, error } = await storage.info(ref.path);
    if (error || !data) throw new PublicRequestError("An attachment did not finish uploading. Remove it and attach it again.", 400);
    const size = Number(data.size ?? data.metadata?.size ?? 0);
    const { id, name, contentType } = validateAttachmentMetadata(bookingId, ref, size, data.contentType ?? data.metadata?.mimetype ?? "");
    total += size;
    if (total > MAX_ATTACHMENTS_TOTAL_BYTES) throw new PublicRequestError("The attachments add up to more than 25 MB.", 400);
    const url = await attachmentDownloadUrl(bookingId, ref.path);
    if (!attachmentSignatureMatches(name, await attachmentPrefix(url))) throw new PublicRequestError("The attachment content does not match its file type.", 400);
    attachments.push({ filename: name, path: url, storagePath: ref.path, id, contentType });
  }
  return attachments;
}

export async function resolvePrivateEmailAttachments(scope: string, input: MailAttachmentRef[]): Promise<PrivateEmailAttachment[]> {
  if (!/^mail-[a-f0-9]{56}$/.test(scope)) throw new PublicRequestError("Invalid email draft", 400);
  const files = await resolveAttachments(scope, input);
  const result: PrivateEmailAttachment[] = [];
  let total = 0;
  for (const file of files) {
    const response = await fetch(file.path, { redirect: "error", cache: "no-store", signal: AbortSignal.timeout(15000) });
    if (!response.ok || !response.body) throw new PublicRequestError("An attachment is unavailable. Please attach it again.", 400);
    const reader = response.body.getReader();
    const chunks: Buffer[] = [];
    let size = 0;
    try {
      for (;;) {
        const chunk = await reader.read();
        if (chunk.done) break;
        size += chunk.value.length;
        total += chunk.value.length;
        if (size > MAX_ATTACHMENT_BYTES || total > MAX_ATTACHMENTS_TOTAL_BYTES) throw new PublicRequestError("Attachments exceed the allowed size.", 400);
        chunks.push(Buffer.from(chunk.value));
      }
    } finally { await reader.cancel(); reader.releaseLock(); }
    const bytes = Buffer.concat(chunks);
    if (!size || !attachmentSignatureMatches(file.filename, bytes.subarray(0, 64))) throw new PublicRequestError("The attachment content does not match its file type.", 400);
    result.push({ ...file, content: bytes.toString("base64"), contentHash: createHash("sha256").update(bytes).digest("hex") });
  }
  return result;
}
