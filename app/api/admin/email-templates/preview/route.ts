import { NextResponse } from "next/server";
import { logDbError, withDb } from "@/lib/db-safe";
import { renderAllEmailTemplatePreviews } from "@/lib/email-preview";
import {
  getDefaultEmailTemplates,
  mergeAllEmailTemplates,
} from "@/lib/email-templates";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const rows = await withDb(() =>
      prisma.emailTemplate.findMany({ orderBy: { name: "asc" } }),
    );
    const templates = mergeAllEmailTemplates(rows);
    const previews = await renderAllEmailTemplatePreviews(templates);

    return NextResponse.json({ previews });
  } catch (error) {
    logDbError("admin.email-templates.preview.GET", error);
    const templates = getDefaultEmailTemplates();
    const previews = await renderAllEmailTemplatePreviews(templates);

    return NextResponse.json({
      previews,
      warning: "Using default templates — database unavailable.",
    });
  }
}
