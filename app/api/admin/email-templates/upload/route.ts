import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, jsonError } from "@/lib/api";
import {
  buildEmailImagesPublicUrl,
  emailImagesObjectPathFromUrl,
} from "@/lib/email-branding-shared";
import { propagateEmailHeroAndCleanup } from "@/lib/email-template-image-db";
import {
  EMAIL_IMAGE_BUCKET,
  STORAGE_CACHE_CONTROL,
  validateEmailImageFile,
} from "@/lib/image-upload";
import { createSupabaseStorageAdminClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildHeroObjectPath(extension: string): string {
  const safeExt = extension.replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg";
  return `hero-${Date.now()}.${safeExt}`;
}

function mimeFromExtension(extension: string): string {
  switch (extension) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    default:
      return "image/jpeg";
  }
}

/**
 * POST multipart — upload hero image to Supabase email-images, replace DB URLs,
 * and delete every previous hero-* object in the bucket.
 *
 * Logo uploads are rejected (brand icon is locked).
 */
export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const field = String(form.get("field") ?? "").trim();
    const file = form.get("file");

    if (field === "logoUrl") {
      return jsonError("Email logo is locked and cannot be changed.", 400);
    }
    if (field !== "heroImageUrl") {
      return jsonError('Invalid field. Use "heroImageUrl".', 400);
    }
    if (!(file instanceof File)) {
      return jsonError("file is required", 400);
    }

    const validationError = validateEmailImageFile(file);
    if (validationError) {
      return jsonError(validationError, 400);
    }

    const extension =
      file.name.split(".").pop()?.toLowerCase() ||
      file.type.split("/")[1] ||
      "jpg";
    const objectPath = buildHeroObjectPath(extension);
    const contentType = file.type || mimeFromExtension(extension);
    const buffer = Buffer.from(await file.arrayBuffer());

    if (buffer.byteLength < 32) {
      return jsonError("Image file is empty or corrupt.", 400);
    }

    const supabase = createSupabaseStorageAdminClient();
    const { data: signed, error: signError } = await supabase.storage
      .from(EMAIL_IMAGE_BUCKET)
      .createSignedUploadUrl(objectPath);

    if (signError || !signed?.token) {
      throw new Error(signError?.message ?? "Failed to create signed upload URL");
    }

    const { error: uploadError } = await supabase.storage
      .from(EMAIL_IMAGE_BUCKET)
      .uploadToSignedUrl(objectPath, signed.token, new Uint8Array(buffer), {
        contentType,
        cacheControl: STORAGE_CACHE_CONTROL,
      });

    if (uploadError) {
      throw new Error(uploadError.message || "Storage upload failed");
    }

    const publicUrl = buildEmailImagesPublicUrl(objectPath);
    if (!publicUrl) {
      await supabase.storage.from(EMAIL_IMAGE_BUCKET).remove([objectPath]);
      return jsonError("Supabase URL is not configured", 503);
    }

    /* Verify the object is publicly readable before pointing emails at it. */
    const { data: stored, error: downloadError } = await supabase.storage
      .from(EMAIL_IMAGE_BUCKET)
      .download(objectPath);
    if (downloadError || !stored) {
      await supabase.storage.from(EMAIL_IMAGE_BUCKET).remove([objectPath]);
      throw new Error("Upload verification failed. Please try again.");
    }

    await propagateEmailHeroAndCleanup(publicUrl, objectPath);

    return NextResponse.json({
      ok: true,
      url: publicUrl,
      path: objectPath,
      field: "heroImageUrl",
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

/**
 * PUT — legacy save-by-URL path (still deletes previous Supabase heroes).
 * Prefer POST multipart for new uploads.
 */
export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      field?: string;
      publicUrl?: string;
    };

    const field = body.field?.trim();
    const publicUrl = body.publicUrl?.trim();

    if (field === "logoUrl") {
      return jsonError("Email logo is locked and cannot be changed.", 400);
    }
    if (field !== "heroImageUrl") {
      return jsonError('Invalid field. Use "heroImageUrl".', 400);
    }
    if (!publicUrl) {
      return jsonError("publicUrl is required", 400);
    }

    const objectPath = emailImagesObjectPathFromUrl(publicUrl);
    if (!objectPath) {
      return jsonError(
        "Hero image must be a Supabase email-images public URL.",
        400,
      );
    }

    await propagateEmailHeroAndCleanup(publicUrl, objectPath);

    return NextResponse.json({
      ok: true,
      url: publicUrl,
      path: objectPath,
      field: "heroImageUrl",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Save failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
