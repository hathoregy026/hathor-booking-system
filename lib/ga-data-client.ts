import { JWT } from "google-auth-library";
import { z } from "zod";
import { format, parse } from "date-fns";
import { BookingStatus } from "@/app/generated/prisma/enums";
import { withDb } from "@/lib/db-safe";
import {
  GA_ADMIN_RANGES,
  type GaAdminDeviceSlice,
  type GaAdminRangeId,
  type GaAdminRankedItem,
  type GaAdminReport,
  type GaAdminTopPage,
  type GaRealtimeMinute,
  type GaRealtimeReport,
} from "@/lib/ga-admin-report";
import { prisma } from "@/lib/prisma";

const GA_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
const ANALYTICS_DATA_BASE = "https://analyticsdata.googleapis.com/v1beta";
const REPORT_TTL_MS = 8 * 60 * 1000;
const REALTIME_TTL_MS = 30_000;
const FETCH_TIMEOUT_MS = 18_000;
const PROPERTY_ID_PATTERN = /^\d{6,20}$/;
const CONVERSION_EVENTS = [
  "purchase",
  "begin_checkout",
  "generate_lead",
  "booking_confirmed",
] as const;

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
    .array(z.object({ value: z.string().max(48).optional() }))
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

type RealtimeCache = {
  report: GaRealtimeReport;
  expiresAt: number;
};

let tokenCache: TokenCache | null = null;
const reportCache = new Map<GaAdminRangeId, ReportCache>();
const reportInflight = new Map<GaAdminRangeId, Promise<GaAdminReport>>();
let realtimeCache: RealtimeCache | null = null;
let realtimeInflight: Promise<GaRealtimeReport> | null = null;

function parseCount(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "0", 10);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
}

function parseDecimal(value: string | undefined): number {
  const parsed = Number.parseFloat(value ?? "0");
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
}

function parseBounceRate(value: string | undefined): number {
  const parsed = parseDecimal(value);
  const percent = parsed <= 1 ? parsed * 100 : parsed;
  return Math.min(100, percent);
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

function utcDayMs(now: Date, offsetDays: number): number {
  return Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + offsetDays,
  );
}

function dayPoint(ms: number): { compact: string; iso: string; label: string } {
  const iso = new Date(ms).toISOString().slice(0, 10);
  return {
    compact: iso.replaceAll("-", ""),
    iso,
    label: format(parse(iso, "yyyy-MM-dd", new Date()), "d MMM"),
  };
}

function seriesDaysForRange(
  rangeId: GaAdminRangeId,
): { compact: string; iso: string; label: string }[] {
  const now = new Date();
  const todayMs = utcDayMs(now, 0);
  if (rangeId === "today") return [dayPoint(todayMs)];
  if (rangeId === "yesterday") return [dayPoint(utcDayMs(now, -1))];
  const count = GA_ADMIN_RANGES[rangeId].dayCount;
  const days: { compact: string; iso: string; label: string }[] = [];
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    days.push(dayPoint(utcDayMs(now, -offset)));
  }
  return days;
}

function bookingBoundsForRange(rangeId: GaAdminRangeId): { gte: Date; lt: Date } {
  const now = new Date();
  const todayStart = new Date(utcDayMs(now, 0));
  const tomorrow = new Date(utcDayMs(now, 1));
  if (rangeId === "today") return { gte: todayStart, lt: tomorrow };
  if (rangeId === "yesterday") {
    return { gte: new Date(utcDayMs(now, -1)), lt: todayStart };
  }
  const count = GA_ADMIN_RANGES[rangeId].dayCount;
  return {
    gte: new Date(utcDayMs(now, -(count - 1))),
    lt: tomorrow,
  };
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

function sanitizeLabel(value: string | undefined, fallback = "Unknown"): string {
  const cleaned = (value ?? "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned || cleaned === "(not set)") return fallback;
  if (cleaned.length > 80) return `${cleaned.slice(0, 77)}…`;
  return cleaned;
}

function formatSource(source: string | undefined, medium: string | undefined): string {
  const src = sanitizeLabel(source, "(direct)");
  const med = sanitizeLabel(medium, "(none)");
  if (med === "(none)" || med === "(not set)") return src;
  return `${src} / ${med}`;
}

const DEVICE_LABELS: Record<string, string> = {
  desktop: "Desktop",
  mobile: "Mobile",
  tablet: "Tablet",
  smarttv: "Smart TV",
};

function parseDevice(value: string | undefined): GaAdminDeviceSlice["key"] {
  const key = sanitizeLabel(value, "other")
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
  if (key === "desktop" || key === "mobile" || key === "tablet") return key;
  if (key === "smarttv") return "smarttv";
  return "other";
}

async function runOptionalReport(
  token: string,
  propertyId: string,
  body: Record<string, unknown>,
  accountEmail: string,
  method: "runReport" | "runRealtimeReport" = "runReport",
): Promise<z.infer<typeof gaReportSchema> | null> {
  try {
    return await runGaRequest(
      token,
      propertyId,
      method,
      body,
      accountEmail,
    );
  } catch (error) {
    if (error instanceof GaAccessError && error.setupHint) throw error;
    console.error("Optional GA report skipped");
    return null;
  }
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

async function countConfirmedBookings(rangeId: GaAdminRangeId): Promise<number> {
  try {
    const bounds = bookingBoundsForRange(rangeId);
    return await withDb(() =>
      prisma.booking.count({
        where: {
          deletedAt: null,
          status: BookingStatus.CONFIRMED,
          createdAt: { gte: bounds.gte, lt: bounds.lt },
        },
      }),
    );
  } catch {
    return 0;
  }
}

function parseEventCounts(
  rows: z.infer<typeof gaReportSchema>["rows"],
): { checkoutStarts: number; purchases: number; leads: number; bookingEvents: number } {
  const counts = {
    checkoutStarts: 0,
    purchases: 0,
    leads: 0,
    bookingEvents: 0,
  };
  for (const row of rows ?? []) {
    const name = (row.dimensionValues?.[0]?.value ?? "").trim();
    const count = parseCount(row.metricValues?.[0]?.value);
    if (name === "begin_checkout") counts.checkoutStarts = count;
    else if (name === "purchase") counts.purchases = count;
    else if (name === "generate_lead") counts.leads = count;
    else if (name === "booking_confirmed") counts.bookingEvents = count;
  }
  return counts;
}

async function loadGaAdminReport(rangeId: GaAdminRangeId): Promise<GaAdminReport> {
  const propertyId = readPropertyId();
  const account = readServiceAccount();
  const token = await getAccessToken(account);
  const range = GA_ADMIN_RANGES[rangeId];
  const dateRanges = [{ startDate: range.startDate, endDate: range.endDate }];
  const days = seriesDaysForRange(rangeId);

  const [daily, totals, pages, sources, countries, devices, events, bookings] =
    await Promise.all([
    runGaRequest(
      token,
      propertyId,
      "runReport",
      {
        dateRanges,
        dimensions: [{ name: "date" }],
        metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
        orderBys: [{ dimension: { dimensionName: "date" } }],
        limit: Math.min(100, Math.max(14, days.length)),
      },
      account.client_email,
    ),
    runGaRequest(
      token,
      propertyId,
      "runReport",
      {
        dateRanges,
        metrics: [
          { name: "activeUsers" },
          { name: "screenPageViews" },
          { name: "sessions" },
          { name: "bounceRate" },
          { name: "averageSessionDuration" },
        ],
      },
      account.client_email,
    ),
    runGaRequest(
      token,
      propertyId,
      "runReport",
      {
        dateRanges,
        dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 10,
      },
      account.client_email,
    ),
    runOptionalReport(
      token,
      propertyId,
      {
        dateRanges,
        dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 8,
      },
      account.client_email,
    ),
    runOptionalReport(
      token,
      propertyId,
      {
        dateRanges,
        dimensions: [{ name: "country" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 8,
      },
      account.client_email,
    ),
    runOptionalReport(
      token,
      propertyId,
      {
        dateRanges,
        dimensions: [{ name: "deviceCategory" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 6,
      },
      account.client_email,
    ),
    runOptionalReport(
      token,
      propertyId,
      {
        dateRanges,
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: {
          filter: {
            fieldName: "eventName",
            inListFilter: { values: [...CONVERSION_EVENTS] },
          },
        },
        limit: 12,
      },
      account.client_email,
    ),
    countConfirmedBookings(rangeId),
  ]);

  const byDate = new Map<string, { visitors: number; pageViews: number }>();
  for (const row of daily.rows ?? []) {
    const compact = row.dimensionValues?.[0]?.value ?? "";
    if (!/^\d{8}$/.test(compact)) continue;
    byDate.set(compact, {
      visitors: parseCount(row.metricValues?.[0]?.value),
      pageViews: parseCount(row.metricValues?.[1]?.value),
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
      pageViews: parseCount(row.metricValues?.[0]?.value),
    };
  });

  const sourceRows: GaAdminRankedItem[] = (sources?.rows ?? []).map((row) => ({
    label: formatSource(
      row.dimensionValues?.[0]?.value,
      row.dimensionValues?.[1]?.value,
    ),
    value: parseCount(row.metricValues?.[0]?.value),
  }));

  const countryRows: GaAdminRankedItem[] = (countries?.rows ?? []).map((row) => ({
    label: sanitizeLabel(row.dimensionValues?.[0]?.value, "Unknown"),
    value: parseCount(row.metricValues?.[0]?.value),
  }));

  const deviceTotals = new Map<string, number>();
  for (const row of devices?.rows ?? []) {
    const key = parseDevice(row.dimensionValues?.[0]?.value);
    deviceTotals.set(
      key,
      (deviceTotals.get(key) ?? 0) + parseCount(row.metricValues?.[0]?.value),
    );
  }
  const deviceRows: GaAdminDeviceSlice[] = [...deviceTotals.entries()]
    .map(([key, value]) => ({
      key,
      label: DEVICE_LABELS[key] ?? "Other",
      value,
    }))
    .filter((slice) => slice.value > 0)
    .sort((left, right) => right.value - left.value);

  const totalsRow =
    totals.rows?.[0]?.metricValues ?? totals.totals?.[0]?.metricValues;
  const visitors = parseCount(totalsRow?.[0]?.value);
  const eventCounts = parseEventCounts(events?.rows);
  const bookingCount = Math.max(bookings, eventCounts.purchases, eventCounts.bookingEvents);
  const rate = visitors > 0 ? Math.min(100, (bookingCount / visitors) * 100) : 0;

  return {
    range: {
      id: rangeId,
      label: range.label,
      startDate: range.startDate,
      endDate: range.endDate,
      startIso: days[0]?.iso ?? "",
      endIso: days[days.length - 1]?.iso ?? "",
    },
    generatedAt: new Date().toISOString(),
    totals: {
      visitors,
      pageViews: parseCount(totalsRow?.[1]?.value),
      sessions: parseCount(totalsRow?.[2]?.value),
      bounceRate: parseBounceRate(totalsRow?.[3]?.value),
      averageSessionDurationSeconds: parseDecimal(totalsRow?.[4]?.value),
    },
    conversions: {
      bookings: bookingCount,
      checkoutStarts: eventCounts.checkoutStarts,
      purchases: eventCounts.purchases,
      leads: eventCounts.leads,
      rate,
    },
    series,
    topPages,
    sources: sourceRows,
    countries: countryRows,
    devices: deviceRows,
  };
}

export async function fetchGaAdminReport(
  rangeId: GaAdminRangeId,
): Promise<GaAdminReport> {
  const cached = reportCache.get(rangeId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.report;
  }

  const pending = reportInflight.get(rangeId);
  if (pending) return pending;

  const load = loadGaAdminReport(rangeId)
    .then((report) => {
      reportCache.set(rangeId, {
        report,
        expiresAt: Date.now() + REPORT_TTL_MS,
      });
      return report;
    })
    .finally(() => {
      reportInflight.delete(rangeId);
    });

  reportInflight.set(rangeId, load);
  return load;
}

async function loadGaRealtimeReport(): Promise<GaRealtimeReport> {
  const propertyId = readPropertyId();
  const account = readServiceAccount();
  const token = await getAccessToken(account);

  const [totals, byMinute] = await Promise.all([
    runGaRequest(
      token,
      propertyId,
      "runRealtimeReport",
      { metrics: [{ name: "activeUsers" }] },
      account.client_email,
    ),
    runOptionalReport(
      token,
      propertyId,
      {
        metrics: [{ name: "activeUsers" }],
        dimensions: [{ name: "minutesAgo" }],
        orderBys: [{ dimension: { dimensionName: "minutesAgo" } }],
        limit: 30,
      },
      account.client_email,
      "runRealtimeReport",
    ),
  ]);

  const minuteMap = new Map<number, number>();
  for (const row of byMinute?.rows ?? []) {
    const ago = parseCount(row.dimensionValues?.[0]?.value);
    if (ago > 29) continue;
    minuteMap.set(ago, parseCount(row.metricValues?.[0]?.value));
  }

  const minutes: GaRealtimeMinute[] = [];
  for (let ago = 29; ago >= 0; ago -= 1) {
    minutes.push({ minutesAgo: ago, users: minuteMap.get(ago) ?? 0 });
  }

  return {
    activeUsers: parseCount(totals.rows?.[0]?.metricValues?.[0]?.value),
    minutes,
    generatedAt: new Date().toISOString(),
  };
}

export async function fetchGaRealtimeReport(): Promise<GaRealtimeReport> {
  if (realtimeCache && realtimeCache.expiresAt > Date.now()) {
    return realtimeCache.report;
  }
  if (realtimeInflight) return realtimeInflight;

  const load = loadGaRealtimeReport()
    .then((report) => {
      realtimeCache = { report, expiresAt: Date.now() + REALTIME_TTL_MS };
      return report;
    })
    .finally(() => {
      realtimeInflight = null;
    });

  realtimeInflight = load;
  return load;
}
