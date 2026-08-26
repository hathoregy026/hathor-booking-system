import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, jsonError } from "@/lib/api";
import { logDbError, withDb } from "@/lib/db-safe";
import {
  buildDraftEmailTemplates,
  renderAllEmailTemplatePreviews,
  type EmailPreviewDraftCopy,
  type EmailPreviewDraftShared,
} from "@/lib/email-preview";
import {
  getDefaultEmailTemplates,
  mergeAllEmailTemplates,
} from "@/lib/email-templates";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
  Pragma: "no-cache",
};

async function loadMergedTemplates() {
  const rows = await withDb(() =>
    prisma.emailTemplate.findMany({ orderBy: { name: "asc" } }),
  );
  return mergeAllEmailTemplates(rows);
}

/** Saved templates from the database. */
export async function GET() {
  try {
    const templates = await loadMergedTemplates();
    const previews = await renderAllEmailTemplatePreviews(templates);

    return NextResponse.json(
      { previews, generatedAt: new Date().toISOString(), source: "saved" },
      { headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    logDbError("admin.email-templates.preview.GET", error);
    const templates = getDefaultEmailTemplates();
    const previews = await renderAllEmailTemplatePreviews(templates);

    return NextResponse.json(
      {
        previews,
        generatedAt: new Date().toISOString(),
        source: "defaults",
        warning: "Using default templates — database unavailable.",
      },
      { headers: NO_STORE_HEADERS },
    );
  }
}

/**
 * Live dashboard draft — renders the form’s current (possibly unsaved) edits
 * on top of the latest saved branding/copy from the database.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      shared?: EmailPreviewDraftShared;
      templates?: EmailPreviewDraftCopy[];
    };

    if (body.templates !== undefined && !Array.isArray(body.templates)) {
      return jsonError("templates must be an array", 400);
    }

    let baseRows;
    try {
      baseRows = await loadMergedTemplates();
    } catch (error) {
      logDbError("admin.email-templates.preview.POST.base", error);
      baseRows = getDefaultEmailTemplates();
    }

    const templates = buildDraftEmailTemplates(
      body.shared,
      body.templates,
      baseRows,
    );
    const previews = await renderAllEmailTemplatePreviews(templates);

    return NextResponse.json(
      {
        previews,
        generatedAt: new Date().toISOString(),
        source: "draft",
      },
      { headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
