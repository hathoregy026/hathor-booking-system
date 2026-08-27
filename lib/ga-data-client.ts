import { JWT } from "google-auth-library";
import { z } from "zod";
import { format, parse } from "date-fns";
import { BookingStatus } from "@/app/generated/prisma/enums";
import { withDb } from "@/lib/db-safe";
import {
  GA_ADMIN_PREVIOUS_RANGES,
  GA_ADMIN_RANGES,
  GA_TRACKING_START_ISO,
  type GaAdminAlert,
  type GaAdminCompare,
  type GaAdminDelta,
  type GaAdminDeviceSlice,
  type GaAdminFunnelStep,
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
const FETCH_TIMEOUT_MS = 22_000;
const PROPERTY_ID_PATTERN = /^\d{6,20}$/;
const CONVERSION_EVENTS = [
  "purchase",
  "begin_checkout",
  "generate_lead",
  "booking_confirmed",
  "booking_itinerary",
  "booking_dates",
  "booking_suite",
] as const;
const GA_TRACKING_START = new Date(`${GA_TRACKING_START_ISO}T00:00:00.000Z`);

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

function previousBookingBounds(rangeId: GaAdminRangeId): { gte: Date; lt: Date } {
  const current = bookingBoundsForRange(rangeId);
  const durationMs = current.lt.getTime() - current.gte.getTime();
  return {
    gte: new Date(current.gte.getTime() - durationMs),
    lt: current.gte,
  };
}

function clipToTrackingStart(bounds: { gte: Date; lt: Date }): {
  gte: Date;
  lt: Date;
  clipped: boolean;
} {
  const clipped = bounds.gte < GA_TRACKING_START;
  const gte = clipped ? GA_TRACKING_START : bounds.gte;
  return { gte, lt: bounds.lt, clipped };
}

type BookingWindowStats = {
  count: number;
  revenueCents: number;
  clipped: boolean;
};

async function getBookingStats(
  bounds: { gte: Date; lt: Date },
): Promise<BookingWindowStats> {
  const window = clipToTrackingStart(bounds);
  if (window.gte >= window.lt) {
    return { count: 0, revenueCents: 0, clipped: window.clipped };
  }

  try {
    const aggregate = await withDb(() =>
      prisma.booking.aggregate({
        where: {
          deletedAt: null,
          status: BookingStatus.CONFIRMED,
          createdAt: { gte: window.gte, lt: window.lt },
        },
        _count: { _all: true },
        _sum: { totalPriceCents: true },
      }),
    );
    return {
      count: aggregate._count?._all ?? 0,
      revenueCents: aggregate._sum.totalPriceCents ?? 0,
      clipped: window.clipped,
    };
  } catch {
    return { count: 0, revenueCents: 0, clipped: window.clipped };
  }
}

function parseEventCounts(rows: z.infer<typeof gaReportSchema>["rows"]): {
  checkoutStarts: number;
  purchases: number;
  leads: number;
  bookingEvents: number;
  itinerary: number;
  dates: number;
  suite: number;
} {
  const counts = {
    checkoutStarts: 0,
    purchases: 0,
    leads: 0,
    bookingEvents: 0,
    itinerary: 0,
    dates: 0,
    suite: 0,
  };
  for (const row of rows ?? []) {
    const name = (row.dimensionValues?.[0]?.value ?? "").trim();
    const count = parseCount(row.metricValues?.[0]?.value);
    if (name === "begin_checkout") counts.checkoutStarts = count;
    else if (name === "purchase") counts.purchases = count;
    else if (name === "generate_lead") counts.leads = count;
    else if (name === "booking_confirmed") counts.bookingEvents = count;
    else if (name === "booking_itinerary") counts.itinerary = count;
    else if (name === "booking_dates") counts.dates = count;
    else if (name === "booking_suite") counts.suite = count;
  }
  return counts;
}

function toDelta(current: number, previous: number): GaAdminDelta {
  if (previous <= 0) {
    return { current, previous, changePct: current === 0 ? 0 : null };
  }
  return {
    current,
    previous,
    changePct: ((current - previous) / previous) * 100,
  };
}

function buildCompare(
  rangeId: GaAdminRangeId,
  current: {
    visitors: number;
    pageViews: number;
    bounceRate: number;
    bookings: number;
    revenueCents: number;
  },
  previous: {
    visitors: number;
    pageViews: number;
    bounceRate: number;
    bookings: number;
    revenueCents: number;
  },
): GaAdminCompare {
  return {
    label: GA_ADMIN_PREVIOUS_RANGES[rangeId].label,
    visitors: toDelta(current.visitors, previous.visitors),
    pageViews: toDelta(current.pageViews, previous.pageViews),
    bounceRate: toDelta(current.bounceRate, previous.bounceRate),
    bookings: toDelta(current.bookings, previous.bookings),
    revenueCents: toDelta(current.revenueCents, previous.revenueCents),
  };
}

function buildAlerts(compare: GaAdminCompare): GaAdminAlert[] {
  const alerts: GaAdminAlert[] = [];
  const visitors = compare.visitors;
  if (
    visitors.previous > 5 &&
    visitors.current < visitors.previous * 0.6
  ) {
    alerts.push({
      id: "traffic_drop",
      message: `Visitors dropped ${Math.abs(visitors.changePct ?? 0).toFixed(0)}% versus the previous period.`,
    });
  }
  const bounce = compare.bounceRate;
  if (bounce.current - bounce.previous > 15) {
    alerts.push({
      id: "bounce_up",
      message: `Bounce rate rose ${Math.round(bounce.current - bounce.previous)} points versus the previous period.`,
    });
  }
  const bookings = compare.bookings;
  if (bookings.previous > 0 && bookings.current < bookings.previous * 0.5) {
    alerts.push({
      id: "bookings_drop",
      message: `Confirmed bookings dropped ${Math.abs(bookings.changePct ?? 0).toFixed(0)}% versus the previous period.`,
    });
  }
  return alerts;
}

function rankedRows(
  rows: z.infer<typeof gaReportSchema>["rows"],
  labelFor: (row: z.infer<typeof gaRowSchema>) => string,
): GaAdminRankedItem[] {
  const merged = new Map<string, number>();
  for (const row of rows ?? []) {
    const label = labelFor(row);
    merged.set(label, (merged.get(label) ?? 0) + parseCount(row.metricValues?.[0]?.value));
  }
  return [...merged.entries()]
    .map(([label, value]) => ({ label, value }))
    .filter((item) => item.value > 0)
    .sort((left, right) => right.value - left.value);
}

async function loadGaAdminReport(rangeId: GaAdminRangeId): Promise<GaAdminReport> {
  const propertyId = readPropertyId();
  const account = readServiceAccount();
  const token = await getAccessToken(account);
  const range = GA_ADMIN_RANGES[rangeId];
  const previous = GA_ADMIN_PREVIOUS_RANGES[rangeId];
  const dateRanges = [{ startDate: range.startDate, endDate: range.endDate }];
  const prevDateRanges = [{ startDate: previous.startDate, endDate: previous.endDate }];
  const days = seriesDaysForRange(rangeId);
  const purchaseFilter = {
    filter: {
      fieldName: "eventName",
      stringFilter: { value: "purchase", matchType: "EXACT" as const },
    },
  };

  const [
    daily,
    totals,
    prevTotals,
    pages,
    events,
    currentBookings,
    previousBookings,
  ] = await Promise.all([
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
    runOptionalReport(
      token,
      propertyId,
      {
        dateRanges: prevDateRanges,
        metrics: [
          { name: "activeUsers" },
          { name: "screenPageViews" },
          { name: "bounceRate" },
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
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: {
          filter: {
            fieldName: "eventName",
            inListFilter: { values: [...CONVERSION_EVENTS] },
          },
        },
        limit: 16,
      },
      account.client_email,
    ),
    getBookingStats(bookingBoundsForRange(rangeId)),
    getBookingStats(previousBookingBounds(rangeId)),
  ]);

  const [sources, countries, devices, landing, campaigns] = await Promise.all([
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
        dimensions: [{ name: "landingPage" }],
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
        dimensions: [
          { name: "sessionCampaignName" },
          { name: "sessionSource" },
          { name: "sessionMedium" },
        ],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 8,
      },
      account.client_email,
    ),
  ]);

  const [cities, audience, hours, purchaseSources, devicePurchases] =
    await Promise.all([
      runOptionalReport(
        token,
        propertyId,
        {
          dateRanges,
          dimensions: [{ name: "city" }],
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
          dimensions: [{ name: "newVsReturning" }],
          metrics: [{ name: "activeUsers" }],
          limit: 4,
        },
        account.client_email,
      ),
      runOptionalReport(
        token,
        propertyId,
        {
          dateRanges,
          dimensions: [{ name: "hour" }],
          metrics: [{ name: "sessions" }],
          orderBys: [{ dimension: { dimensionName: "hour" } }],
          limit: 24,
        },
        account.client_email,
      ),
      runOptionalReport(
        token,
        propertyId,
        {
          dateRanges,
          dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }],
          metrics: [{ name: "eventCount" }],
          dimensionFilter: purchaseFilter,
          orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
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
          metrics: [{ name: "eventCount" }],
          dimensionFilter: purchaseFilter,
          limit: 6,
        },
        account.client_email,
      ),
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

  const sourceRows = rankedRows(sources?.rows, (row) =>
    formatSource(row.dimensionValues?.[0]?.value, row.dimensionValues?.[1]?.value),
  ).slice(0, 8);

  const countryRows = rankedRows(countries?.rows, (row) =>
    sanitizeLabel(row.dimensionValues?.[0]?.value, "Unknown"),
  ).slice(0, 8);

  const cityRows = rankedRows(cities?.rows, (row) =>
    sanitizeLabel(row.dimensionValues?.[0]?.value, "Unknown"),
  ).slice(0, 8);

  const landingRows = rankedRows(landing?.rows, (row) =>
    sanitizePath(row.dimensionValues?.[0]?.value),
  ).slice(0, 8);

  const campaignRows = rankedRows(campaigns?.rows, (row) => {
    const campaign = (row.dimensionValues?.[0]?.value ?? "").trim();
    const source = formatSource(
      row.dimensionValues?.[1]?.value,
      row.dimensionValues?.[2]?.value,
    );
    if (!campaign || campaign === "(not set)") return source;
    return `${sanitizeLabel(campaign)} · ${source}`;
  }).slice(0, 8);

  const bookingSourceRows = rankedRows(purchaseSources?.rows, (row) =>
    formatSource(row.dimensionValues?.[0]?.value, row.dimensionValues?.[1]?.value),
  ).slice(0, 8);

  const purchaseByDevice = new Map<string, number>();
  for (const row of devicePurchases?.rows ?? []) {
    const key = parseDevice(row.dimensionValues?.[0]?.value);
    purchaseByDevice.set(
      key,
      (purchaseByDevice.get(key) ?? 0) + parseCount(row.metricValues?.[0]?.value),
    );
  }

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
      conversions: purchaseByDevice.get(key) ?? 0,
    }))
    .filter((slice) => slice.value > 0)
    .sort((left, right) => right.value - left.value);

  const hourMap = new Map<number, number>();
  for (const row of hours?.rows ?? []) {
    const hour = parseCount(row.dimensionValues?.[0]?.value);
    if (hour > 23) continue;
    hourMap.set(hour, parseCount(row.metricValues?.[0]?.value));
  }
  const hourRows: GaAdminRankedItem[] = Array.from({ length: 24 }, (_, hour) => ({
    label: `${String(hour).padStart(2, "0")}:00`,
    value: hourMap.get(hour) ?? 0,
  }));

  let newUsers = 0;
  let returningUsers = 0;
  for (const row of audience?.rows ?? []) {
    const kind = (row.dimensionValues?.[0]?.value ?? "").toLowerCase();
    const count = parseCount(row.metricValues?.[0]?.value);
    if (kind.includes("new")) newUsers += count;
    else if (kind.includes("return")) returningUsers += count;
  }

  const totalsRow =
    totals.rows?.[0]?.metricValues ?? totals.totals?.[0]?.metricValues;
  const prevTotalsRow =
    prevTotals?.rows?.[0]?.metricValues ?? prevTotals?.totals?.[0]?.metricValues;
  const visitors = parseCount(totalsRow?.[0]?.value);
  const pageViews = parseCount(totalsRow?.[1]?.value);
  const bounceRate = parseBounceRate(totalsRow?.[3]?.value);
  const eventCounts = parseEventCounts(events?.rows);
  const bookingCount = currentBookings.count;
  const revenueCents = currentBookings.revenueCents;
  const rate = visitors > 0 ? Math.min(100, (bookingCount / visitors) * 100) : 0;
  const abandonedCheckouts = Math.max(
    0,
    eventCounts.checkoutStarts - bookingCount,
  );
  const averageBookingCents =
    bookingCount > 0 ? Math.round(revenueCents / bookingCount) : 0;
  const revenuePerVisitorCents =
    visitors > 0 ? Math.round(revenueCents / visitors) : 0;

  const funnel: GaAdminFunnelStep[] = [
    { id: "itinerary", label: "Itinerary", count: eventCounts.itinerary },
    { id: "dates", label: "Dates", count: eventCounts.dates },
    { id: "suite", label: "Suite", count: eventCounts.suite },
    { id: "checkout", label: "Checkout", count: eventCounts.checkoutStarts },
    { id: "confirmed", label: "Confirmed", count: bookingCount },
  ];

  const compare = buildCompare(
    rangeId,
    {
      visitors,
      pageViews,
      bounceRate,
      bookings: bookingCount,
      revenueCents,
    },
    {
      visitors: parseCount(prevTotalsRow?.[0]?.value),
      pageViews: parseCount(prevTotalsRow?.[1]?.value),
      bounceRate: parseBounceRate(prevTotalsRow?.[2]?.value),
      bookings: previousBookings.count,
      revenueCents: previousBookings.revenueCents,
    },
  );

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
    conversionClipped: currentBookings.clipped,
    totals: {
      visitors,
      pageViews,
      sessions: parseCount(totalsRow?.[2]?.value),
      bounceRate,
      averageSessionDurationSeconds: parseDecimal(totalsRow?.[4]?.value),
      newUsers,
      returningUsers,
    },
    conversions: {
      bookings: bookingCount,
      checkoutStarts: eventCounts.checkoutStarts,
      purchases: eventCounts.purchases,
      leads: eventCounts.leads,
      abandonedCheckouts,
      rate,
      revenueCents,
      averageBookingCents,
      revenuePerVisitorCents,
    },
    compare,
    alerts: buildAlerts(compare),
    funnel,
    series,
    hours: hourRows,
    topPages,
    landingPages: landingRows,
    sources: sourceRows,
    campaigns: campaignRows,
    bookingSources: bookingSourceRows,
    countries: countryRows,
    cities: cityRows,
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
