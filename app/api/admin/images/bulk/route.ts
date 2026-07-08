import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleRouteError } from "@/lib/api";
import { isSafePublicImageUrl, upsertSiteImagesBulk } from "@/lib/image-management";

export const dynamic = "force-dynamic";

const bulkSchema = z.object({
  images: z
    .array(
      z.object({
        name: z
          .string()
          .trim()
          .min(1)
          .max(120)
          .regex(/^[a-z0-9-]+$/),
        url: z
          .string()
          .trim()
          .min(1)
          .max(2048)
          .refine(
            isSafePublicImageUrl,
            "Must be an HTTPS URL or a root-relative path",
          ),
        altText: z.string().trim().min(1).max(300),
      }),
    )
    .min(1),
});

export async function PUT(request: NextRequest) {
  try {
    const body = bulkSchema.parse(await request.json());
    const images = await upsertSiteImagesBulk(body.images);
    return NextResponse.json({ images });
  } catch (error) {
    return handleRouteError(error);
  }
}
