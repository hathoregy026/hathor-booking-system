import { render } from "@react-email/render";
import { NextRequest, NextResponse } from "next/server";
import BookingReceivedEmail from "@/emails/BookingReceived";
import { sampleBookingDetails, sampleGuestName } from "@/emails/sample-data";
import {
  ADMIN_SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/admin-auth";
import {
  HATHOR_EMAIL_HERO_URL,
  HATHOR_EMAIL_LOGO_URL,
} from "@/lib/email-branding-urls";
import {
  extractImageSrcUrls,
  probeImageUrl,
  urlsMatch,
  type ImageUrlProbe,
} from "@/lib/email-debug-probe";
import { getEmailTemplateForSend } from "@/lib/email-template-send";
import {
  EMAIL_TEMPLATE_NAMES,
  isEmailTemplateName,
  type EmailTemplateName,
} from "@/lib/email-templates";
import {
  resolveAccessibleEmailImageUrl,
  toEmailThemeOverridesForSend,
} from "@/lib/email-theme-server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function parseTemplateName(value: string | null): EmailTemplateName {
  if (value && isEmailTemplateName(value)) {
    return value;
  }
  return "BookingReceived";
}

function buildDiagnosis(input: {
  dbLogoUrl: string | null;
  dbHeroUrl: string | null;
  sendLogoUrl: string | undefined;
  sendHeroUrl: string | undefined;
  htmlLogoUrl: string | undefined;
  htmlHeroUrl: string | undefined;
  probes: ImageUrlProbe[];
  htmlImageUrls: string[];
}): string[] {
  const notes: string[] = [];

  if (!input.dbLogoUrl?.trim()) {
    notes.push("Database logoUrl is empty on the selected template row.");
  }
  if (!input.dbHeroUrl?.trim()) {
    notes.push("Database heroImageUrl is empty on the selected template row.");
  }

  for (const probe of input.probes) {
    if (!probe.url) continue;

    if (!probe.isReliableHostedUrl) {
      notes.push(`${probe.label}: URL is not a trusted Supabase email-images HTTPS URL.`);
    }
    if (probe.head.error) {
      notes.push(`${probe.label}: HEAD check failed — ${probe.head.error}.`);
    } else if (probe.head.contentLength && probe.head.contentLength > 1.5 * 1024 * 1024) {
      notes.push(
        `${probe.label}: Image is ${(probe.head.contentLength / 1024 / 1024).toFixed(1)} MB — send path rejects images over 1.5 MB.`,
      );
    }
    if (probe.bytes.error) {
      notes.push(`${probe.label}: Byte probe failed — ${probe.bytes.error}.`);
    } else if (probe.bytes.sampleSize > 0 && !probe.bytes.validMagic) {
      notes.push(
        `${probe.label}: File exists but magic bytes are invalid (corrupt upload). Hex: ${probe.bytes.magicHex}`,
      );
    }
  }

  if (
    input.sendLogoUrl &&
    input.dbLogoUrl?.trim() &&
    !urlsMatch(input.sendLogoUrl, input.dbLogoUrl) &&
    urlsMatch(input.sendLogoUrl, HATHOR_EMAIL_LOGO_URL)
  ) {
    notes.push(
      "Send pipeline fell back to default logo URL (DB logo failed reachability or size checks).",
    );
  }

  if (
    input.sendHeroUrl &&
    input.dbHeroUrl?.trim() &&
    !urlsMatch(input.sendHeroUrl, input.dbHeroUrl) &&
    urlsMatch(input.sendHeroUrl, HATHOR_EMAIL_HERO_URL)
  ) {
    notes.push(
      "Send pipeline fell back to default hero URL (DB hero failed reachability or size checks).",
    );
  }

  if (input.htmlLogoUrl && input.sendLogoUrl && !urlsMatch(input.htmlLogoUrl, input.sendLogoUrl)) {
    notes.push("Rendered HTML logo src does not match the send theme logoUrl.");
  }

  if (input.htmlHeroUrl && input.sendHeroUrl && !urlsMatch(input.htmlHeroUrl, input.sendHeroUrl)) {
    notes.push("Rendered HTML hero src does not match the send theme heroImageUrl.");
  }

  if (input.htmlImageUrls.length === 0) {
    notes.push("No <img src> tags found in rendered HTML.");
  }

  if (notes.length === 0) {
    notes.push("No obvious issues detected — URLs, probes, and HTML appear consistent.");
  }

  return notes;
}

/**
 * Admin-only email image debugger.
 * Log in at /admin/login first, then open GET /api/debug-email
 */
export async function GET(request: NextRequest) {
  const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifySessionToken(session)) {
    return NextResponse.json(
      {
        error: "Unauthorized. Log in at /admin/login first.",
      },
      { status: 401 },
    );
  }

  const templateName = parseTemplateName(
    request.nextUrl.searchParams.get("template"),
  );
  const includeHtml = request.nextUrl.searchParams.get("includeHtml") !== "false";

  try {
    const rows = await prisma.emailTemplate.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        heroImageUrl: true,
        updatedAt: true,
      },
    });

    const selectedRow = rows.find((row) => row.name === templateName) ?? null;
    const templateForSend = await getEmailTemplateForSend(templateName);

    const defaults = {
      logoUrl: HATHOR_EMAIL_LOGO_URL,
      heroImageUrl: HATHOR_EMAIL_HERO_URL,
    };

    const cacheVersion = templateForSend.updatedAt ?? new Date().toISOString();

    const [resolvedLogoUrl, resolvedHeroUrl, theme] = await Promise.all([
      resolveAccessibleEmailImageUrl(
        cacheVersion,
        templateForSend.logoUrl,
        defaults.logoUrl,
      ),
      resolveAccessibleEmailImageUrl(
        cacheVersion,
        templateForSend.heroImageUrl,
        defaults.heroImageUrl,
      ),
      toEmailThemeOverridesForSend(templateForSend, defaults),
    ]);

    const html = await render(
      BookingReceivedEmail({
        guestName: sampleGuestName,
        details: sampleBookingDetails,
        ...theme,
      }),
    );

    const htmlImageUrls = extractImageSrcUrls(html);
    const htmlLogoUrl = htmlImageUrls[0];
    const htmlHeroUrl = htmlImageUrls[1];

    const probes = await Promise.all([
      probeImageUrl("database.logoUrl (selected template)", selectedRow?.logoUrl),
      probeImageUrl("database.heroImageUrl (selected template)", selectedRow?.heroImageUrl),
      probeImageUrl("mergedForSend.logoUrl", templateForSend.logoUrl),
      probeImageUrl("mergedForSend.heroImageUrl", templateForSend.heroImageUrl),
      probeImageUrl("defaults.logoUrl", defaults.logoUrl),
      probeImageUrl("defaults.heroImageUrl", defaults.heroImageUrl),
      probeImageUrl("sendTheme.logoUrl", theme?.logoUrl),
      probeImageUrl("sendTheme.heroImageUrl", theme?.heroImageUrl),
      ...(htmlLogoUrl ? [probeImageUrl("html.logoSrc", htmlLogoUrl)] : []),
      ...(htmlHeroUrl ? [probeImageUrl("html.heroSrc", htmlHeroUrl)] : []),
    ]);

    const diagnosis = buildDiagnosis({
      dbLogoUrl: selectedRow?.logoUrl ?? null,
      dbHeroUrl: selectedRow?.heroImageUrl ?? null,
      sendLogoUrl: theme?.logoUrl ?? undefined,
      sendHeroUrl: theme?.heroImageUrl ?? undefined,
      htmlLogoUrl,
      htmlHeroUrl,
      probes,
      htmlImageUrls,
    });

    return NextResponse.json({
      ok: true,
      generatedAt: new Date().toISOString(),
      template: templateName,
      availableTemplates: EMAIL_TEMPLATE_NAMES,
      database: {
        allTemplates: rows.map((row) => ({
          name: row.name,
          id: row.id,
          logoUrl: row.logoUrl,
          heroImageUrl: row.heroImageUrl,
          updatedAt: row.updatedAt.toISOString(),
        })),
        selectedTemplate: selectedRow
          ? {
              name: selectedRow.name,
              logoUrl: selectedRow.logoUrl,
              heroImageUrl: selectedRow.heroImageUrl,
            }
          : null,
        mergedForSend: {
          logoUrl: templateForSend.logoUrl,
          heroImageUrl: templateForSend.heroImageUrl,
        },
      },
      defaults,
      sendResolution: {
        resolveAccessibleEmailImageUrl: {
          logoUrl: resolvedLogoUrl,
          heroImageUrl: resolvedHeroUrl,
        },
        themeUsedInEmail: theme ?? null,
        usedDefaultLogo:
          Boolean(theme?.logoUrl) &&
          Boolean(templateForSend.logoUrl?.trim()) &&
          !urlsMatch(theme?.logoUrl, templateForSend.logoUrl),
        usedDefaultHero:
          Boolean(theme?.heroImageUrl) &&
          Boolean(templateForSend.heroImageUrl?.trim()) &&
          !urlsMatch(theme?.heroImageUrl, templateForSend.heroImageUrl),
      },
      urlChecks: probes,
      htmlAnalysis: {
        imageUrlsInHtml: htmlImageUrls,
        logoInHtml: htmlLogoUrl ?? null,
        heroInHtml: htmlHeroUrl ?? null,
        matches: {
          logoMatchesDatabase: urlsMatch(htmlLogoUrl, selectedRow?.logoUrl),
          heroMatchesDatabase: urlsMatch(htmlHeroUrl, selectedRow?.heroImageUrl),
          logoMatchesSendTheme: urlsMatch(htmlLogoUrl, theme?.logoUrl),
          heroMatchesSendTheme: urlsMatch(htmlHeroUrl, theme?.heroImageUrl),
          logoMatchesMergedForSend: urlsMatch(htmlLogoUrl, templateForSend.logoUrl),
          heroMatchesMergedForSend: urlsMatch(htmlHeroUrl, templateForSend.heroImageUrl),
        },
      },
      diagnosis,
      ...(includeHtml ? { html } : { htmlOmitted: true }),
    });
  } catch (error) {
    console.error("[debug-email]", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Debug check failed",
      },
      { status: 500 },
    );
  }
}
