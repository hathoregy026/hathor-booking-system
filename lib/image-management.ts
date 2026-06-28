import { z } from "zod";
import { IMAGE_CATEGORIES } from "@/lib/image-categories";
import { prisma } from "@/lib/prisma";
import { withDb } from "@/lib/db-safe";

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
  url: z.string().trim().url("Must be a valid URL").max(2048),
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
  return withDb(() =>
    prisma.siteImage.update({
      where: { id },
      data,
    }),
  );
}

export async function deleteSiteImage(id: string) {
  return withDb(() => prisma.siteImage.delete({ where: { id } }));
}

export { IMAGE_CATEGORIES } from "@/lib/image-categories";
