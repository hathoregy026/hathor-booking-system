import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import {
  EMAIL_IMAGE_BUCKET,
  EMAIL_IMAGE_FOLDER,
  getPublicImageUrl,
  IMAGE_BUCKET,
  isEmailImageFolder,
} from "@/lib/image-upload";
import { toAbsolutePublicUrl } from "@/lib/public-url";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

export type UploadedImage = {
  url: string;
  path: string;
  storage: "supabase" | "local";
};

export function isSupabaseUploadConfigured(): boolean {
  const url = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return Boolean(url && serviceRoleKey);
}

function resolveBucket(folder: string, bucket?: string): string {
  if (bucket) return bucket;
  return isEmailImageFolder(folder) ? EMAIL_IMAGE_BUCKET : IMAGE_BUCKET;
}

async function uploadToSupabase(
  bucket: string,
  objectPath: string,
  buffer: Buffer,
  contentType: string,
  upsert = false,
): Promise<UploadedImage> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.from(bucket).upload(objectPath, buffer, {
    contentType,
    cacheControl: "3600",
    upsert,
  });

  if (error) {
    const message = error.message.toLowerCase();

    if (message.includes("bucket") && message.includes("not found")) {
      throw new Error(
        `Storage bucket "${bucket}" was not found in Supabase. Run: node scripts/setup-supabase-storage.mjs`,
      );
    }

    throw new Error(error.message || "Supabase upload failed");
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);

  return {
    url: toAbsolutePublicUrl(data.publicUrl) ?? data.publicUrl,
    path: objectPath,
    storage: "supabase",
  };
}

/**
 * Upload email template branding images — always Supabase `email-images` (no local fallback).
 * Uses stable object names so the public URL stays predictable across re-uploads.
 */
export async function uploadEmailTemplateImage(options: {
  field: "logoUrl" | "heroImageUrl";
  buffer: Buffer;
  contentType: string;
  extension: string;
}): Promise<UploadedImage> {
  if (!isSupabaseUploadConfigured()) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to upload email images.",
    );
  }

  const objectPath = buildStableEmailImagePath(options.field, options.extension);
  const uploaded = await uploadToSupabase(
    EMAIL_IMAGE_BUCKET,
    objectPath,
    options.buffer,
    options.contentType,
    true,
  );

  const canonicalUrl = getPublicImageUrl(uploaded.path, EMAIL_IMAGE_BUCKET);
  if (!canonicalUrl) {
    throw new Error("Failed to build public Supabase URL for email image");
  }

  const verify = await fetch(canonicalUrl, {
    method: "HEAD",
    signal: AbortSignal.timeout(15_000),
  });

  if (!verify.ok) {
    throw new Error(
      `Uploaded image is not publicly accessible (${verify.status}). Check Supabase Storage policies for bucket "${EMAIL_IMAGE_BUCKET}".`,
    );
  }

  return {
    ...uploaded,
    url: canonicalUrl,
  };
}

async function uploadToLocal(
  folder: string,
  objectPath: string,
  buffer: Buffer,
): Promise<UploadedImage> {
  const localFolder = isEmailImageFolder(folder) ? EMAIL_IMAGE_FOLDER : folder;
  const relativePath = objectPath.replace(/\\/g, "/");
  const absolutePath = path.join(
    process.cwd(),
    "public",
    "uploads",
    localFolder,
    path.basename(relativePath),
  );

  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, buffer);

  const relativeUrl = `/uploads/${localFolder}/${path.basename(relativePath)}`;

  return {
    url: toAbsolutePublicUrl(relativeUrl) ?? relativeUrl,
    path: `${localFolder}/${path.basename(relativePath)}`,
    storage: "local",
  };
}

export async function uploadImageBuffer(options: {
  folder: string;
  objectPath: string;
  buffer: Buffer;
  contentType: string;
  bucket?: string;
}): Promise<UploadedImage> {
  const { folder, objectPath, buffer, contentType } = options;
  const bucket = resolveBucket(folder, options.bucket);

  if (isSupabaseUploadConfigured()) {
    try {
      return await uploadToSupabase(bucket, objectPath, buffer, contentType);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Supabase upload failed";

      if (process.env.NODE_ENV === "production") {
        throw error instanceof Error ? error : new Error(message);
      }

      console.warn("[upload] Supabase failed, using local storage:", message);
    }
  }

  return uploadToLocal(folder, objectPath, buffer);
}

export function buildObjectPath(folder: string, extension: string): string {
  const safeFolder =
    folder.replace(/[^a-z0-9-_]/gi, "").toLowerCase() || "general";
  const safeExtension =
    extension.replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg";
  return `${safeFolder}/${Date.now()}-${randomUUID()}.${safeExtension}`;
}

const STABLE_EMAIL_IMAGE_NAMES = {
  logoUrl: "hathor-email-logo",
  heroImageUrl: "hathor-email-hero",
} as const;

export function buildStableEmailImagePath(
  field: "logoUrl" | "heroImageUrl",
  extension: string,
): string {
  const safeExtension =
    extension.replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg";
  return `${STABLE_EMAIL_IMAGE_NAMES[field]}.${safeExtension}`;
}
