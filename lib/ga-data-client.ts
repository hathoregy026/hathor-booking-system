import { JWT } from "google-auth-library";
import { z } from "zod";
import { format, parse } from "date-fns";
import type { GaAdminReport, GaAdminTopPage } from "@/lib/ga-admin-report";

const GA_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
const ANALYTICS_DATA_BASE = "https://analyticsdata.googleapis.com/v1beta";
const REPORT_TTL_MS = 60_000;
const FETCH_TIMEOUT_MS = 12_000;
const PROPERTY_ID_PATTERN = /^\d{6,20}$/;

const serviceAccountSchema = z.object({
  type: z.literal("service_account"),
  project_id: z
    .string()
    .min(1)
    .max(128)
    .regex(/^[a-z0-9-]+$/),
  private_key: z
    .string()
    .min(32)
    .max(16_384)
    .refine((value) => value.includes("BEGIN PRIVATE KEY"), {
      message: "Invalid service account key",
    }),
  client_email: z
    .string()
    .email()
    .max(320)
    .refine((value) => value.endsWith(".iam.gserviceaccount.com"), {
      message: "Invalid service account email",
    }),
  token_uri: z.string().url().max(256).optional(),
});

const gaRowSchema = z.object({
  dimensionValues: z
    .array(z.object({ value: z.string().max(2000).optional() }))
    .optional(),
  metricValues: z
    .array(z.object({ value: z.string().max(32).optional() }))
    .optional(),
});

const gaReportSchema = z.object({
  rows: z.array(gaRowSchema).max(400).optional(),
  totals: z.array(gaRowSchema).max(8).optional(),
});

export class GaConfigError extends Error {
  constructor(message = "Analytics is not configured.") {
    super(message);
    this.name = "GaConfigError";
  }
}

export class GaAccessError extends Error {
  constructor(
    message: string,
    readonly setupHint?: string,
  ) {
    super(message);
    this.name = "GaAccessError";
  }
}

type ServiceAccount = z.infer<typeof serviceAccountSchema>;

type TokenCache = {
  token: string;
  expiresAt: number;
};

type ReportCache = {
  report: GaAdminReport;
  expiresAt: number;
};

let tokenCache: TokenCache | null = null;
let reportCache: ReportCache | null = null;

function parseMetric(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "0", 10);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
}

function readPropertyId(): string {
  const raw = process.env.GA_PROPERTY_ID?.trim() ?? "";
  const id = raw.replace(/^properties\//, "");
  if (!PROPERTY_ID_PATTERN.test(id)) {
    throw new GaConfigError();
  }
  return id;
}

function readServiceAccount(): ServiceAccount {
  const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON?.trim();
  if (!raw) throw new GaConfigError();

  let parsed: unknown;
  try {
    if (raw.startsWith("{")) {
      parsed = JSON.parse(raw) as unknown;
    } else {
      parsed = JSON.parse(Buffer.from(raw, "base64").toString("utf8")) as unknown;
    }
  } catch {
    throw new GaConfigError();
  }

  const account = serviceAccountSchema.parse(parsed);
  return {
    ...account,
    private_key: account.private_key.replace(/\\n/g, "\n"),
  };
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new GaAccessError("Google Analytics timed out. Try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function getAccessToken(account: ServiceAccount): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 30_000) {
    return tokenCache.token;
  }

  try {
    const client = new JWT({
      email: account.client_email,
      key: account.private_key,
      scopes: [GA_SCOPE],
    });
    const token = await client.authorize();
    if (!token.access_token) {
      throw new GaAccessError("Could not authenticate with Google Analytics.");
    }
    const expiresAt =
      typeof token.expiry_date === "number" && token.expiry_date > 0
        ? token.expiry_date
        : Date.now() + 3600 * 1000;
    tokenCache = { token: token.access_token, expiresAt };
    return tokenCache.token;
  } catch (error) {
    if (error instanceof GaAccessError) throw error;
    console.error("GA token exchange failed");
    throw new GaAccessError("Could not authenticate with Google Analytics.");
  }
}

function lastSevenUtcDates(): { compact: string; iso: string; label: string }[] {
  const days: { compact: string; iso: string; label: string }[] = [];
  const now = new Date();
  for (let offset = 6; offset >= 0; offset -= 1) {
    const day = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - offset),
    );
    const iso = day.toISOString().slice(0, 10);
    days.push({
      compact: iso.replaceAll("-", ""),
      iso,
      label: format(parse(iso, "yyyy-MM-dd", new Date()), "d MMM"),
    });
  }
  return days;
}

function sanitizePath(value: string | undefined): string {
  const path = (value ?? "/").trim() || "/";
  if (path.length > 180) return `${path.slice(0, 177)}…`;
  return path;
}

function sanitizeTitle(value: string | undefined, fallback: string): string {
  const title = (value ?? "").trim();
  if (!title) return fallback;
  if (title.length > 80) return `${title.slice(0, 77)}…`;
  return title;
}

async function runGaRequest(
  token: string,
  propertyId: string,
  method: "runReport" | "runRealtimeReport",
  body: Record<string, unknown>,
  accountEmail: string,
): Promise<z.infer<typeof gaReportSchema>> {
  const response = await fetchWithTimeout(
    `${ANALYTICS_DATA_BASE}/properties/${propertyId}:${method}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  if (response.status === 403 || response.status === 401) {
    throw new GaAccessError(
      "Google Analytics denied access.",
      `Add ${accountEmail} as a Viewer on this GA4 property, and enable the Analytics Data API on the Google Cloud project.`,
    );
  }

  if (!response.ok) {
    console.error("GA Data API request failed", {
      status: response.status,
      method,
    });
    throw new GaAccessError("Could not load Google Analytics data.");
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new GaAccessError("Could not load Google Analytics data.");
  }

  const parsed = gaReportSchema.safeParse(payload);
  if (!parsed.success) {
    throw new GaAccessError("Could not load Google Analytics data.");
  }
  return parsed.data;
}

export async function fetchGaAdminReport(): Promise<GaAdminReport> {
  if (reportCache && reportCache.expiresAt > Date.now()) {
    return reportCache.report;
  }

  const propertyId = readPropertyId();
  const account = readServiceAccount();
  const token = await getAccessToken(account);
  const days = lastSevenUtcDates();

  const [realtime, daily, totals, pages] = await Promise.all([
    runGaRequest(
      token,
      propertyId,
      "runRealtimeReport",
      { metrics: [{ name: "activeUsers" }] },
      account.client_email,
    ),
    runGaRequest(
      token,
      propertyId,
      "runReport",
      {
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        dimensions: [{ name: "date" }],
        metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
        orderBys: [{ dimension: { dimensionName: "date" } }],
        limit: 14,
      },
      account.client_email,
    ),
    runGaRequest(
      token,
      propertyId,
      "runReport",
      {
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
      },
      account.client_email,
    ),
    runGaRequest(
      token,
      propertyId,
      "runReport",
      {
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 8,
      },
      account.client_email,
    ),
  ]);

  const byDate = new Map<string, { visitors: number; pageViews: number }>();
  for (const row of daily.rows ?? []) {
    const compact = row.dimensionValues?.[0]?.value ?? "";
    if (!/^\d{8}$/.test(compact)) continue;
    byDate.set(compact, {
      visitors: parseMetric(row.metricValues?.[0]?.value),
      pageViews: parseMetric(row.metricValues?.[1]?.value),
    });
  }

  const series = days.map((day) => {
    const point = byDate.get(day.compact);
    return {
      date: day.iso,
      label: day.label,
      visitors: point?.visitors ?? 0,
      pageViews: point?.pageViews ?? 0,
    };
  });

  const topPages: GaAdminTopPage[] = (pages.rows ?? []).map((row) => {
    const path = sanitizePath(row.dimensionValues?.[0]?.value);
    return {
      path,
      title: sanitizeTitle(row.dimensionValues?.[1]?.value, path),
      pageViews: parseMetric(row.metricValues?.[0]?.value),
    };
  });

  const report: GaAdminReport = {
    range: {
      startDate: days[0]?.iso ?? "",
      endDate: days[days.length - 1]?.iso ?? "",
    },
    realtimeActiveUsers: parseMetric(realtime.rows?.[0]?.metricValues?.[0]?.value),
    totals: {
      visitors: parseMetric(totals.rows?.[0]?.metricValues?.[0]?.value),
      pageViews: parseMetric(totals.rows?.[0]?.metricValues?.[1]?.value),
    },
    series,
    topPages,
  };

  reportCache = { report, expiresAt: Date.now() + REPORT_TTL_MS };
  return report;
}
