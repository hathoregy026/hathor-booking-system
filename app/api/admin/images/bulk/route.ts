import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleRouteError } from "@/lib/api";
import { isSafePublicImageUrl, upsertSiteImagesBulk } from "@/lib/image-management";
import { revalidateSiteImagePages } from "@/lib/revalidate-site-images";

export const dynamic = "force-dynamic";

const bulkItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/),
  /* Empty string clears / resets the slot to the seeded default. */
  url: z
    .string()
    .trim()
    .max(2048)
    .refine(
      (value) => value === "" || isSafePublicImageUrl(value),
      "Must be an HTTPS URL, a root-relative path, or empty to reset",
    ),
  altText: z.string().trim().max(300),
});

const bulkSchema = z.object({
  images: z.array(bulkItemSchema).min(1),
});

export async function PUT(request: NextRequest) {
  try {
    const body = bulkSchema.parse(await request.json());
    const images = await upsertSiteImagesBulk(body.images);
    revalidateSiteImagePages(body.images.map((item) => item.name));
    return NextResponse.json({ images });
  } catch (error) {
    return handleRouteError(error);
  }
}
