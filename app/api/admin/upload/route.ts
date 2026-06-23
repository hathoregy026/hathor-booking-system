import { NextRequest, NextResponse } from "next/server";
import {
  ALLOWED_IMAGE_EXTENSIONS,
  validateImageFile,
} from "@/lib/image-upload";
import { buildObjectPath, uploadImageBuffer } from "@/lib/upload-image";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = (formData.get("folder") as string | null)?.trim() || "general";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    const validationError = validateImageFile(file);
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

    const objectPath = buildObjectPath(folder, extension);
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadImageBuffer({
      objectPath,
      buffer,
      contentType: file.type,
    });

    return NextResponse.json({
      url: result.url,
      path: result.path,
      storage: result.storage,
    });
  } catch (error) {
    console.error("[admin.upload]", error);

    const message =
      error instanceof Error ? error.message : "Failed to upload image";

    if (
      message.includes("Supabase is not configured") ||
      message.includes("Storage bucket")
    ) {
      return NextResponse.json({ error: message }, { status: 503 });
    }

    return NextResponse.json(
      { error: message || "Failed to upload image" },
      { status: 500 },
    );
  }
}
