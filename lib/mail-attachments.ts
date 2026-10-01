/**
 * Files the team attaches to a reply to a guest.
 *
 * The browser uploads each file straight to a private storage bucket through
 * a one-time signed link (the site's own API only accepts ~4.5 MB a request),
 * and the email service then fetches the files from short-lived signed links
 * when it sends. Nothing in the bucket is public.
 */

import { randomUUID } from "crypto";
import { PublicRequestError } from "@/lib/public-api-security";
import { createSupabaseStorageAdminClient } from "@/lib/supabase-server";

import {
  MAX_ATTACHMENTS,
  MAX_ATTACHMENTS_TOTAL_BYTES,
  MAX_ATTACHMENT_BYTES,
  attachmentProblem,
  cleanAttachmentName,
  type MailAttachmentRef,
} from "@/lib/mail-attachment-rules";

export const MAIL_ATTACHMENT_BUCKET = "mail-attachments";

/** Long enough for the email service to collect the files; the links are never shown to anyone. */
const DOWNLOAD_LINK_SECONDS = 60 * 60;

export type ResendAttachment = { filename: string; path: string };

function bookingFolder(bookingId: string): string {
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(bookingId)) throw new PublicRequestError("Invalid booking", 400);
  return `bookings/${bookingId}`;
}

let bucketReady: Promise<void> | null = null;

/** Creates the private bucket the first time it is needed. */
function ensureBucket(): Promise<void> {
  bucketReady ??= (async () => {
    const supabase = createSupabaseStorageAdminClient();
    const { data } = await supabase.storage.getBucket(MAIL_ATTACHMENT_BUCKET);
    if (data) return;
    const { error } = await supabase.storage.createBucket(MAIL_ATTACHMENT_BUCKET, {
      public: false,
      fileSizeLimit: MAX_ATTACHMENT_BYTES,
    });
    if (error && !/already exists/i.test(error.message)) throw new Error(error.message);
  })().catch((error) => {
    bucketReady = null;
    throw error;
  });
  return bucketReady;
}

/** A one-time link the dashboard uploads one file to, inside this booking's folder. */
export async function createAttachmentUpload(
  bookingId: string,
  file: { name: string; size: number },
): Promise<{ path: string; signedUrl: string; name: string }> {
  const name = cleanAttachmentName(file.name);
  const problem = attachmentProblem({ name, size: file.size });
  if (problem) throw new PublicRequestError(problem, 400);

  await ensureBucket();
  const storageName = name.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "file";
  const path = `${bookingFolder(bookingId)}/${randomUUID()}-${storageName}`;
  const supabase = createSupabaseStorageAdminClient();
  const { data, error } = await supabase.storage.from(MAIL_ATTACHMENT_BUCKET).createSignedUploadUrl(path);
  if (error || !data?.signedUrl) throw new Error(error?.message ?? "Could not start the upload.");
  return { path, signedUrl: data.signedUrl, name };
}

/**
 * Checks the files really were uploaded to this booking's folder and fit the
 * limits, then returns them as the email service expects (name + signed link).
 */
export async function resolveAttachments(
  bookingId: string,
  refs: MailAttachmentRef[],
): Promise<ResendAttachment[]> {
  if (!refs.length) return [];
  if (refs.length > MAX_ATTACHMENTS) throw new PublicRequestError(`Attach at most ${MAX_ATTACHMENTS} files.`, 400);

  const folder = bookingFolder(bookingId);
  const supabase = createSupabaseStorageAdminClient();
  const { data: listed, error } = await supabase.storage
    .from(MAIL_ATTACHMENT_BUCKET)
    .list(folder, { limit: 1000 });
  if (error) throw new Error(error.message);
  const sizes = new Map((listed ?? []).map((item) => [`${folder}/${item.name}`, Number(item.metadata?.size ?? 0)]));

  let total = 0;
  for (const ref of refs) {
    const size = sizes.get(ref.path);
    if (!ref.path.startsWith(`${folder}/`) || size == null) {
      throw new PublicRequestError(`${cleanAttachmentName(ref.name)} did not finish uploading. Remove it and attach it again.`, 400);
    }
    const problem = attachmentProblem({ name: cleanAttachmentName(ref.name), size });
    if (problem) throw new PublicRequestError(problem, 400);
    total += size;
  }
  if (total > MAX_ATTACHMENTS_TOTAL_BYTES) {
    throw new PublicRequestError("The attachments add up to more than 25 MB. Remove some and try again.", 400);
  }

  const { data: links, error: linkError } = await supabase.storage
    .from(MAIL_ATTACHMENT_BUCKET)
    .createSignedUrls(refs.map((ref) => ref.path), DOWNLOAD_LINK_SECONDS);
  if (linkError || !links) throw new Error(linkError?.message ?? "Could not prepare the attachments.");

  return refs.map((ref, index) => {
    const url = links[index]?.signedUrl;
    if (!url) throw new Error(`Could not prepare ${cleanAttachmentName(ref.name)}.`);
    return { filename: cleanAttachmentName(ref.name), path: url };
  });
}
