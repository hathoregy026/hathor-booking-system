import { NextRequest, NextResponse } from "next/server";
import { processImageToWebp, processVideoToMp4 } from "@/lib/media-process";
import {
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_VIDEO_EXTENSIONS,
  validateImageFile,
  validateVideoFile,
} from "@/lib/image-upload";
import { uploadWebsiteImage } from "@/lib/admin-storage";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = (formData.get("folder") as string | null)?.trim() || "general";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const isVideo = file.type.startsWith("video/");

    if (isVideo) {
      const validationError = validateVideoFile(file);
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 });
      }

      const extension =
        file.name.split(".").pop()?.toLowerCase() ??
        file.type.split("/")[1] ??
        "mp4";

      if (!ALLOWED_VIDEO_EXTENSIONS.has(extension)) {
        return NextResponse.json(
          { error: "Invalid video extension. Use .mp4 or .webm." },
          { status: 400 },
        );
      }

      const inputBuffer = Buffer.from(await file.arrayBuffer());
      const processed = await processVideoToMp4(inputBuffer, file.name);

      const result = await uploadWebsiteImage({
        folder,
        buffer: processed.buffer,
        contentType: processed.contentType,
        extension: processed.extension,
      });

      return NextResponse.json({
        url: result.url,
        path: result.path,
        storage: "supabase",
        type: "video",
      });
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

    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const processed = await processImageToWebp(inputBuffer);

    const result = await uploadWebsiteImage({
      folder,
      buffer: processed.buffer,
      contentType: processed.contentType,
      extension: processed.extension,
    });

    return NextResponse.json({
      url: result.url,
      path: result.path,
      storage: "supabase",
      type: "image",
    });
  } catch (error) {
    console.error("[admin.upload]", error);

    const message =
      error instanceof Error ? error.message : "Failed to upload file";

    if (
      message.includes("Supabase is not configured") ||
      message.includes("Storage bucket")
    ) {
      return NextResponse.json({ error: message }, { status: 503 });
    }

    return NextResponse.json(
      { error: message || "Failed to upload file" },
      { status: 500 },
    );
  }
}
