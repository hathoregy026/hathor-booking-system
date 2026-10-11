import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api";
import { logDbError, withDb } from "@/lib/db-safe";
import {
  buildDraftEmailTemplates,
  renderAllEmailTemplatePreviews,
  renderEmailTemplatePreview,


} from "@/lib/email-preview";
import {
  getDefaultEmailTemplates,
  mergeAllEmailTemplates,
} from "@/lib/email-templates";
import { loadEmailFooter } from "@/lib/email-footer-db";
import { prisma } from "@/lib/prisma";
import { readEmailPreviewDraft, isCompleteEmailPreviewDraft } from "@/lib/email-preview-draft";
import { adminApiGuard } from "@/lib/admin-server-auth";

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

/** Every preview ends with the saved footer, exactly as sent mail does. */
async function withSavedFooter<T extends object>(templates: T[]) {
  const footer = await loadEmailFooter();
  return templates.map((template) => ({ ...template, footer }));
}

/** Saved templates from the database. */
export async function GET() {
  const denied = await adminApiGuard("templates.view");
  if (denied) return denied;
  try {
    const templates = await withSavedFooter(await loadMergedTemplates());
    const previews = await renderAllEmailTemplatePreviews(templates);

    return NextResponse.json(
      { previews, generatedAt: new Date().toISOString(), source: "saved" },
      { headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    logDbError("admin.email-templates.preview.GET", error);
    const templates = await withSavedFooter(getDefaultEmailTemplates());
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
  const denied = await adminApiGuard("templates.view");
  if (denied) return denied;
  try {
    const body = await readEmailPreviewDraft(request);
    const completeDraft = isCompleteEmailPreviewDraft(body);

    let baseRows;
    try {
      baseRows = completeDraft ? getDefaultEmailTemplates() : await loadMergedTemplates();
    } catch (error) {
      logDbError("admin.email-templates.preview.POST.base", error);
      baseRows = getDefaultEmailTemplates();
    }

    const templates = buildDraftEmailTemplates(
      body.shared,
      body.templates,
      baseRows,
      body.footer,
      completeDraft ? undefined : await loadEmailFooter(),
    );
    const selected = body.name ? templates.find(template => template.name === body.name) : undefined;
    const previews = selected ? [await renderEmailTemplatePreview(selected)] : await renderAllEmailTemplatePreviews(templates);

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
