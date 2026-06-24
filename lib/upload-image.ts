import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { toAbsolutePublicUrl } from "@/lib/public-url";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { IMAGE_BUCKET } from "@/lib/image-upload";

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

async function uploadToSupabase(
  objectPath: string,
  buffer: Buffer,
  contentType: string,
): Promise<UploadedImage> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(objectPath, buffer, {
    contentType,
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    const message = error.message.toLowerCase();

    if (message.includes("bucket") && message.includes("not found")) {
      throw new Error(
        `Storage bucket "${IMAGE_BUCKET}" was not found in Supabase. Create a public bucket with that name under Storage.`,
      );
    }

    throw new Error(error.message || "Supabase upload failed");
  }

  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(objectPath);

  return {
    url: toAbsolutePublicUrl(data.publicUrl) ?? data.publicUrl,
    path: objectPath,
    storage: "supabase",
  };
}

async function uploadToLocal(
  objectPath: string,
  buffer: Buffer,
): Promise<UploadedImage> {
  const relativePath = objectPath.replace(/\\/g, "/");
  const absolutePath = path.join(process.cwd(), "public", "uploads", relativePath);

  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, buffer);

  const relativeUrl = `/uploads/${relativePath}`;

  return {
    url: toAbsolutePublicUrl(relativeUrl) ?? relativeUrl,
    path: relativePath,
    storage: "local",
  };
}

export async function uploadImageBuffer(options: {
  objectPath: string;
  buffer: Buffer;
  contentType: string;
}): Promise<UploadedImage> {
  const { objectPath, buffer, contentType } = options;

  if (isSupabaseUploadConfigured()) {
    try {
      return await uploadToSupabase(objectPath, buffer, contentType);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Supabase upload failed";

      if (process.env.NODE_ENV === "production") {
        throw error instanceof Error ? error : new Error(message);
      }

      console.warn("[upload] Supabase failed, using local storage:", message);
    }
  }

  return uploadToLocal(objectPath, buffer);
}

export function buildObjectPath(folder: string, extension: string): string {
  const safeFolder = folder.replace(/[^a-z0-9-_]/gi, "").toLowerCase() || "general";
  const safeExtension = extension.replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg";
  return `${safeFolder}/${Date.now()}-${randomUUID()}.${safeExtension}`;
}
