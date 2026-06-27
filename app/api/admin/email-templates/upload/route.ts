import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, jsonError } from "@/lib/api";
import { propagateEmailImageToAllTemplates } from "@/lib/email-template-image-db";
import {
  EMAIL_IMAGE_BUCKET,
  getPublicImageUrl,
  validateEmailImageFile,
} from "@/lib/image-upload";
import { createSupabaseStorageAdminClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildObjectPath(field: "logoUrl" | "heroImageUrl", extension: string): string {
  const safeExt = extension.replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg";
  const prefix = field === "logoUrl" ? "logo" : "hero";
  return `${prefix}-${Date.now()}.${safeExt}`;
}

/**
 * POST — issue a signed upload URL (browser uploads directly to Supabase).
 * PUT  — persist the public URL on all email templates after upload succeeds.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      field?: string;
      fileName?: string;
      contentType?: string;
      fileSize?: number;
    };

    const field = body.field?.trim();
    if (field !== "logoUrl" && field !== "heroImageUrl") {
      return jsonError('Invalid field. Use "logoUrl" or "heroImageUrl".', 400);
    }

    const validationError = validateEmailImageFile({
      name: body.fileName ?? "image.jpg",
      type: body.contentType ?? "",
      size: body.fileSize ?? 0,
    });

    if (validationError) {
      return jsonError(validationError, 400);
    }

    const extension =
      body.fileName?.split(".").pop()?.toLowerCase() ??
      body.contentType?.split("/")[1] ??
      "jpg";

    const objectPath = buildObjectPath(field, extension);
    const supabase = createSupabaseStorageAdminClient();

    const { data, error } = await supabase.storage
      .from(EMAIL_IMAGE_BUCKET)
      .createSignedUploadUrl(objectPath);

    if (error || !data) {
      throw new Error(error?.message ?? "Failed to create signed upload URL");
    }

    const publicUrl = getPublicImageUrl(objectPath, EMAIL_IMAGE_BUCKET);
    if (!publicUrl) {
      return jsonError("Supabase URL is not configured", 503);
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
      token: data.token,
      path: objectPath,
      publicUrl,
      field,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      field?: string;
      publicUrl?: string;
    };

    const field = body.field?.trim();
    const publicUrl = body.publicUrl?.trim();

    if (field !== "logoUrl" && field !== "heroImageUrl") {
      return jsonError('Invalid field. Use "logoUrl" or "heroImageUrl".', 400);
    }

    if (!publicUrl) {
      return jsonError("publicUrl is required", 400);
    }

    await propagateEmailImageToAllTemplates(field, publicUrl);

    return NextResponse.json({ ok: true, url: publicUrl, field });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Save failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
