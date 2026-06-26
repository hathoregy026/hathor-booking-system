import { NextRequest, NextResponse } from "next/server";
import {
  ALLOWED_IMAGE_EXTENSIONS,
  validateEmailTemplateImageFile,
} from "@/lib/image-upload";
import { handleRouteError } from "@/lib/api";
import { withDb } from "@/lib/db-safe";
import {
  isEmailTemplateImageField,
  isEmailTemplateImageFieldName,
  propagateEmailImageToAllTemplates,
} from "@/lib/email-template-image-db";
import { mergeAllEmailTemplates } from "@/lib/email-templates";
import { uploadEmailTemplateImage } from "@/lib/upload-image";
import { prisma } from "@/lib/prisma";

/**
 * Upload an email template image to Supabase Storage and persist the public URL
 * on all EmailTemplate rows (shared logo/hero across Booking Received, Confirmed, Admin).
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const templateName = (formData.get("templateName") as string | null)?.trim();
    const imageField = (formData.get("imageField") as string | null)?.trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    if (!templateName || !isEmailTemplateImageFieldName(templateName)) {
      return NextResponse.json({ error: "Invalid template name" }, { status: 400 });
    }

    if (!imageField || !isEmailTemplateImageField(imageField)) {
      return NextResponse.json(
        { error: 'Invalid image field. Use "logoUrl" or "heroImageUrl".' },
        { status: 400 },
      );
    }

    const validationError = validateEmailTemplateImageFile(file, imageField);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const extension =
      file.name.split(".").pop()?.toLowerCase() ??
      file.type.split("/")[1] ??
      "jpg";

    if (!ALLOWED_IMAGE_EXTENSIONS.has(extension)) {
      return NextResponse.json(
        { error: "Invalid file extension. Use .jpg, .png, or .webp." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadEmailTemplateImage({
      field: imageField,
      buffer,
    });

    await withDb(() =>
      propagateEmailImageToAllTemplates(imageField, uploaded.url),
    );

    const rows = await withDb(() =>
      prisma.emailTemplate.findMany({ orderBy: { name: "asc" } }),
    );

    return NextResponse.json({
      url: uploaded.url,
      path: uploaded.path,
      storage: uploaded.storage,
      imageField,
      templateName,
      templates: mergeAllEmailTemplates(rows),
    });
  } catch (error) {
    console.error("[admin.email-templates.image]", error);

    const message =
      error instanceof Error ? error.message : "Failed to upload email image";

    if (
      message.includes("Supabase is not configured") ||
      message.includes("Storage bucket")
    ) {
      return NextResponse.json({ error: message }, { status: 503 });
    }

    return handleRouteError(error);
  }
}
