import { z } from "zod";
import { adminIdentityFromRequest } from "@/lib/admin-server-auth";
import { hasAdminPermission } from "@/lib/admin-permissions";
import { assertTrustedPublicJsonRequest, readPublicJsonBody, PublicRequestError } from "@/lib/public-api-security";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ContentSection } from "@/app/generated/prisma/enums";
import { handleRouteError } from "@/lib/api";
import { logDbError, withDb } from "@/lib/db-safe";
import { prisma } from "@/lib/prisma";
import { adminSiteContentSelect } from "@/lib/query-selects";
import { SITE_CONTENT_SECTIONS } from "@/lib/site-content";
import { purgeReplacedWebsiteImage } from "@/lib/website-image-storage";
import { adminApiGuard } from "@/lib/admin-server-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const payloadSchema = z.object({ sections: z.array(z.object({
  section: z.enum(ContentSection).refine(value => SITE_CONTENT_SECTIONS.includes(value)),
  title: z.string().max(1000), subtitle: z.string().max(4000).nullable().optional(),
  bodyText: z.string().max(20000).nullable().optional(),
  imageUrl: z.string().max(2048).refine(value => {
    if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return true;
    try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; }
  }).nullable().optional(),
}).strict()).min(1).max(SITE_CONTENT_SECTIONS.length).refine(rows => new Set(rows.map(row => row.section)).size === rows.length) }).strict();

export async function GET() {
  const denied = await adminApiGuard("website.view");
  if (denied) return denied;

  try {
    const content = await withDb(() =>
      prisma.siteContent.findMany({
        where: {
          section: { in: SITE_CONTENT_SECTIONS },
        },
        orderBy: { section: "asc" },
        select: adminSiteContentSelect,
      }),
    );

    return NextResponse.json({ content });
  } catch (error) {
    logDbError("admin.content.GET", error);
    return NextResponse.json(
      { error: "Could not load website content.", content: [] },
      { status: 503 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const denied = await adminApiGuard("website.view");
  if (denied) return denied;

  try {
    const identity = await adminIdentityFromRequest(request);
    if (!identity) throw new PublicRequestError("Access denied", 403);
    assertTrustedPublicJsonRequest(request);
    const body = payloadSchema.parse(await readPublicJsonBody(request));
    const replacements: { previousUrl: string | null; nextUrl: string | null }[] = [];
    const updates = await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(18423, 7322)`;
      const previous = await tx.siteContent.findMany({ where: { section: { in: body.sections.map(row => row.section) } } });
      const previousBySection = new Map(previous.map(row => [row.section, row]));
      const results = [];
      for (const row of body.sections) {
        const old = previousBySection.get(row.section);
        const textChanged = !old || row.title !== old.title || (row.subtitle ?? null) !== old.subtitle || (row.bodyText ?? null) !== old.bodyText;
        const imageChanged = (row.imageUrl ?? null) !== (old?.imageUrl ?? null);
        if (textChanged && !hasAdminPermission(identity, "website.text")) throw new PublicRequestError("Text editing is not permitted", 403);
        if (imageChanged && !hasAdminPermission(identity, "website.images")) throw new PublicRequestError("Image editing is not permitted", 403);
        const update = { ...(textChanged ? { title: row.title, subtitle: row.subtitle ?? null, bodyText: row.bodyText ?? null } : {}), ...(imageChanged ? { imageUrl: row.imageUrl ?? null } : {}) };
        results.push(await tx.siteContent.upsert({ where: { section: row.section }, create: { section: row.section, title: row.title, subtitle: row.subtitle ?? null, bodyText: row.bodyText ?? null, imageUrl: row.imageUrl ?? null }, update, select: adminSiteContentSelect }));
        if (imageChanged) replacements.push({ previousUrl: old?.imageUrl ?? null, nextUrl: row.imageUrl ?? null });
      }
      return results;
    });
    for (const replacement of replacements) await purgeReplacedWebsiteImage(replacement);

    revalidatePath("/", "layout");
    return NextResponse.json({ content: updates });
  } catch (error) {
    return handleRouteError(error);
  }
}
