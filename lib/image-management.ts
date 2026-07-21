import { z } from "zod";
import { IMAGE_CATEGORIES } from "@/lib/image-categories";
import { prisma } from "@/lib/prisma";
import { withDb } from "@/lib/db-safe";
import { getSiteImageSlot } from "@/lib/site-image-slots";
import { deleteWebsiteImageByUrl } from "@/lib/website-image-storage";

const siteImageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(120, "Name must be 120 characters or fewer")
    .regex(/^[a-z0-9-]+$/, "Name must be lowercase letters, numbers, and hyphens"),
  altText: z
    .string()
    .trim()
    .min(1, "Alt text is required")
    .max(300, "Alt text must be 300 characters or fewer"),
  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .max(2048)
    .refine(isSafePublicImageUrl, "Must be an HTTPS URL or a root-relative path"),
  category: z.enum(IMAGE_CATEGORIES),
  pagePath: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^\/[a-zA-Z0-9/_-]*$/, "Page path must start with /"),
  displayOrder: z.number().int().min(0).max(9999).default(0),
  isActive: z.boolean().default(true),
});

export function isSafePublicImageUrl(value: string): boolean {
  const url = value.trim();
  if (!url) return false;

  if (url.startsWith("/")) {
    return !url.startsWith("//") && !/[\u0000-\u001f]/.test(url);
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export type SiteImageInput = z.infer<typeof siteImageSchema>;

export type SiteImageUpdateInput = Partial<SiteImageInput>;

export function parseSiteImageInput(data: unknown): SiteImageInput {
  return siteImageSchema.parse(data);
}

export function parseSiteImageUpdate(data: unknown): SiteImageUpdateInput {
  return siteImageSchema.partial().parse(data);
}

export async function listSiteImages(pagePath?: string) {
  return withDb(() =>
    prisma.siteImage.findMany({
      where: pagePath ? { pagePath } : undefined,
      orderBy: [{ pagePath: "asc" }, { displayOrder: "asc" }, { name: "asc" }],
    }),
  );
}

export async function getSiteImageByName(name: string) {
  return withDb(() =>
    prisma.siteImage.findFirst({
      where: { name, isActive: true },
    }),
  );
}

export async function getActiveSiteImages(pagePath: string, category?: string) {
  return withDb(() =>
    prisma.siteImage.findMany({
      where: {
        pagePath,
        isActive: true,
        ...(category ? { category } : {}),
      },
      orderBy: { displayOrder: "asc" },
    }),
  );
}

export async function createSiteImage(input: SiteImageInput) {
  const data = parseSiteImageInput(input);
  return withDb(() => prisma.siteImage.create({ data }));
}

export async function updateSiteImage(id: string, input: SiteImageUpdateInput) {
  const data = parseSiteImageUpdate(input);

  if (data.url !== undefined) {
    const existing = await withDb(() =>
      prisma.siteImage.findUnique({ where: { id } }),
    );
    if (existing && existing.url !== data.url) {
      void deleteWebsiteImageByUrl(existing.url);
    }
  }

  return withDb(() =>
    prisma.siteImage.update({
      where: { id },
      data,
    }),
  );
}

export async function deleteSiteImage(id: string) {
  const existing = await withDb(() =>
    prisma.siteImage.findUnique({ where: { id } }),
  );
  if (existing) {
    void deleteWebsiteImageByUrl(existing.url);
  }
  return withDb(() => prisma.siteImage.delete({ where: { id } }));
}

export type SiteImageBulkItem = {
  name: string;
  /** Empty / whitespace → reset slot to seeded default and delete prior upload. */
  url: string;
  altText: string;
};

/**
 * Upsert CMS site images. When the URL changes (or is cleared), the previous
 * Supabase Storage object is removed so replaces do not leave orphans.
 */
export async function upsertSiteImagesBulk(items: SiteImageBulkItem[]) {
  const results = [];

  for (const item of items) {
    const slot = getSiteImageSlot(item.name);
    if (!slot) continue;

    const existing = await withDb(() =>
      prisma.siteImage.findFirst({ where: { name: item.name } }),
    );

    const nextUrl = item.url.trim();
    const nextAlt = item.altText.trim() || slot.altText;

    /* Clear / reset → default slot asset + delete prior upload */
    if (!nextUrl) {
      if (existing) {
        /* Don't block the response on storage cleanup */
        void deleteWebsiteImageByUrl(existing.url);
        const updated = await withDb(() =>
          prisma.siteImage.update({
            where: { id: existing.id },
            data: {
              url: slot.url,
              altText: nextAlt,
              isActive: true,
            },
          }),
        );
        results.push(updated);
      }
      continue;
    }

    if (existing) {
      if (existing.url !== nextUrl) {
        void deleteWebsiteImageByUrl(existing.url);
      }
      const updated = await withDb(() =>
        prisma.siteImage.update({
          where: { id: existing.id },
          data: {
            url: nextUrl,
            altText: nextAlt,
            isActive: true,
          },
        }),
      );
      results.push(updated);
    } else {
      const created = await withDb(() =>
        prisma.siteImage.create({
          data: {
            name: slot.name,
            altText: nextAlt,
            url: nextUrl,
            category: slot.category,
            pagePath: slot.pagePath,
            displayOrder: slot.displayOrder,
            isActive: true,
          },
        }),
      );
      results.push(created);
    }
  }

  return results;
}

export { IMAGE_CATEGORIES } from "@/lib/image-categories";
