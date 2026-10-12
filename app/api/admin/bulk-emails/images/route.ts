import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { bulkHeaders, bulkRouteError, readBulkBody, requireBulkAdmin } from "@/lib/bulk-email-api";
import { PublicRequestError } from "@/lib/public-api-security";
import { buildEmailImagesPublicUrl } from "@/lib/email-branding-shared";
import { EMAIL_IMAGE_BUCKET, validateEmailImageFile } from "@/lib/image-upload";
import { createSupabaseStorageAdminClient } from "@/lib/supabase-server";
import { isBulkEmailBannerUrl } from "@/lib/bulk-email-images";

export const runtime = "nodejs";
export const maxDuration = 30;

/** Campaign images never change EmailTemplate/SiteSetting or delete shared images. */
export async function POST(request: NextRequest) {
  try {
    await requireBulkAdmin(request, "import");
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.startsWith("multipart/form-data; boundary=")) throw new PublicRequestError("Choose a banner image.", 415);
    const bytes = await readBulkBody(request, 2 * 1024 * 1024 + 16 * 1024);
    const form = await new Request(request.url, { method: "POST", headers: { "Content-Type": contentType }, body: Buffer.from(bytes) }).formData();
    if ([...form.keys()].some(key => key !== "file") || form.getAll("file").length !== 1) throw new PublicRequestError("Choose one banner image.", 400);
    const file = form.get("file");
    if (!(file instanceof File) || file.size > 2 * 1024 * 1024 || validateEmailImageFile(file)) throw new PublicRequestError("Choose a JPG, PNG or WebP image smaller than 2 MB.", 400);
    let image: Buffer;
    try {
      const decoded = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 40000000, failOn: "warning" });
      const metadata = await decoded.metadata();
      if (!["jpeg", "png", "webp"].includes(metadata.format || "") || (metadata.pages || 1) > 1) throw new Error("Unsupported image");
      image = await decoded.rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 88 }).toBuffer();
    } catch { throw new PublicRequestError("This image could not be read. Choose another JPG, PNG or WebP.", 400); }
    const object = `bulk-campaigns/${randomUUID()}/${randomUUID()}.jpg`;
    const url = buildEmailImagesPublicUrl(object);
    if (!url || !isBulkEmailBannerUrl(url)) throw new PublicRequestError("Bulk banner uploads are not configured.", 503);
    const { error } = await createSupabaseStorageAdminClient().storage.from(EMAIL_IMAGE_BUCKET).upload(object, new Uint8Array(image), { contentType: "image/jpeg", cacheControl: "31536000", upsert: false });
    if (error) throw new PublicRequestError("Could not upload the banner. Please try again.", 503);
    return NextResponse.json({ url }, { headers: bulkHeaders });
  } catch (error) { return bulkRouteError(error); }
}
