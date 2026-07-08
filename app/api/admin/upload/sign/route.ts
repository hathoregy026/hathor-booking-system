import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import {
  getPublicImageUrl,
  IMAGE_BUCKET,
  validateImageFile,
} from "@/lib/image-upload";
import { toAbsolutePublicUrl } from "@/lib/public-url";
import { createSupabaseStorageAdminClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sanitizeFolder(folder: string | null | undefined): string {
  return folder?.replace(/[^a-z0-9-_]/gi, "").toLowerCase() || "general";
}

function sanitizeExtension(fileName: string | undefined, contentType: string): string {
  return (
    fileName?.split(".").pop()?.replace(/[^a-z0-9]/gi, "").toLowerCase() ||
    contentType.split("/")[1]?.replace(/[^a-z0-9]/gi, "").toLowerCase() ||
    "jpg"
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      folder?: string;
      fileName?: string;
      contentType?: string;
      fileSize?: number;
    };

    const fileName = body.fileName ?? "image.jpg";
    const contentType = body.contentType ?? "";
    const fileSize = body.fileSize ?? 0;

    const validationError = validateImageFile({
      name: fileName,
      type: contentType,
      size: fileSize,
    });

    if (validationError) {
      return jsonError(validationError, 400);
    }

    const safeFolder = sanitizeFolder(body.folder);
    const extension = sanitizeExtension(fileName, contentType);
    const objectPath = `${safeFolder}/${Date.now()}-${randomUUID()}.${extension}`;
    const supabase = createSupabaseStorageAdminClient();

    const { data, error } = await supabase.storage
      .from(IMAGE_BUCKET)
      .createSignedUploadUrl(objectPath);

    if (error || !data) {
      throw new Error(error?.message ?? "Failed to create signed upload URL");
    }

    const publicUrl = getPublicImageUrl(objectPath, IMAGE_BUCKET);
    if (!publicUrl) {
      return jsonError("Supabase URL is not configured", 503);
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
      token: data.token,
      path: objectPath,
      publicUrl: toAbsolutePublicUrl(publicUrl) ?? publicUrl,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not start upload";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
