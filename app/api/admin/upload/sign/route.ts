import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import {
  getPublicImageUrl,
  IMAGE_BUCKET,
  validateImageFile,
} from "@/lib/image-upload";
import { toAbsolutePublicUrl } from "@/lib/public-url";
import {
  buildSeoImageStorageName,
  resolveImageTitle,
  sanitizeFileExtension,
  sanitizeStorageFolder,
} from "@/lib/seo-image-filename";
import { createSupabaseStorageAdminClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      folder?: string;
      fileName?: string;
      contentType?: string;
      fileSize?: number;
      pageName?: string;
      imageTitle?: string;
      imageName?: string;
      imageLabel?: string;
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

    const safeFolder = sanitizeStorageFolder(body.folder);
    const extension = sanitizeFileExtension(fileName, contentType);
    const pageName = body.pageName?.trim() || safeFolder;
    const imageTitle = resolveImageTitle({
      title: body.imageTitle,
      name: body.imageName,
      label: body.imageLabel,
    });

    const { objectPath, filename, slugBase, suggestedAltText } =
      buildSeoImageStorageName({
        folder: safeFolder,
        pageName,
        imageTitle,
        extension,
      });

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
      filename,
      slugBase,
      suggestedAltText,
      publicUrl: toAbsolutePublicUrl(publicUrl) ?? publicUrl,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not start upload";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
