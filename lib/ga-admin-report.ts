export const GA_ADMIN_RANGE_IDS = [
  "today",
  "yesterday",
  "7d",
  "30d",
  "90d",
] as const;

export type GaAdminRangeId = (typeof GA_ADMIN_RANGE_IDS)[number];

/** First day the public gtag snippet was live. Conversion bookings use this floor. */
export const GA_TRACKING_START_ISO = "2026-08-26";

export const GA_ADMIN_RANGES: Record<
  GaAdminRangeId,
  { label: string; startDate: string; endDate: string; dayCount: number }
> = {
  today: {
    label: "Today",
    startDate: "today",
    endDate: "today",
    dayCount: 1,
  },
  yesterday: {
    label: "Yesterday",
    startDate: "yesterday",
    endDate: "yesterday",
    dayCount: 1,
  },
  "7d": {
    label: "Last 7 Days",
    startDate: "6daysAgo",
    endDate: "today",
    dayCount: 7,
  },
  "30d": {
    label: "Last 30 Days",
    startDate: "29daysAgo",
    endDate: "today",
    dayCount: 30,
  },
  "90d": {
    label: "Last 90 Days",
    startDate: "89daysAgo",
    endDate: "today",
    dayCount: 90,
  },
};

export const GA_ADMIN_PREVIOUS_RANGES: Record<
  GaAdminRangeId,
  { label: string; startDate: string; endDate: string }
> = {
  today: {
    label: "vs yesterday",
    startDate: "yesterday",
    endDate: "yesterday",
  },
  yesterday: {
    label: "vs prior day",
    startDate: "2daysAgo",
    endDate: "2daysAgo",
  },
  "7d": {
    label: "vs prior 7 days",
    startDate: "13daysAgo",
    endDate: "7daysAgo",
  },
  "30d": {
    label: "vs prior 30 days",
    startDate: "59daysAgo",
    endDate: "30daysAgo",
  },
  "90d": {
    label: "vs prior 90 days",
    startDate: "179daysAgo",
    endDate: "90daysAgo",
  },
};

export function isGaAdminRangeId(value: string): value is GaAdminRangeId {
  return (GA_ADMIN_RANGE_IDS as readonly string[]).includes(value);
}

export type GaAdminDayPoint = {
  date: string;
  label: string;
  visitors: number;
  pageViews: number;
};

export type GaAdminTopPage = {
  path: string;
  title: string;
  pageViews: number;
};

export type GaAdminRankedItem = {
  label: string;
  value: number;
};

export type GaAdminDeviceSlice = {
  key: string;
  label: string;
  value: number;
  conversions: number;
};

export type GaAdminFunnelStep = {
  id: string;
  label: string;
  count: number;
};

export type GaAdminDelta = {
  current: number;
  previous: number;
  changePct: number | null;
};

export type GaAdminConversions = {
  bookings: number;
  checkoutStarts: number;
  purchases: number;
  leads: number;
  abandonedCheckouts: number;
  rate: number;
  revenueCents: number;
  averageBookingCents: number;
  revenuePerVisitorCents: number;
};

export type GaAdminCompare = {
  label: string;
  visitors: GaAdminDelta;
  pageViews: GaAdminDelta;
  bounceRate: GaAdminDelta;
  bookings: GaAdminDelta;
  revenueCents: GaAdminDelta;
};

export type GaAdminAlert = {
  id: string;
  message: string;
};

export type GaAdminReport = {
  range: {
    id: GaAdminRangeId;
    label: string;
    startDate: string;
    endDate: string;
    startIso: string;
    endIso: string;
  };
  generatedAt: string;
  conversionClipped: boolean;
  totals: {
    visitors: number;
    pageViews: number;
    sessions: number;
    bounceRate: number;
    averageSessionDurationSeconds: number;
    newUsers: number;
    returningUsers: number;
  };
  conversions: GaAdminConversions;
  compare: GaAdminCompare;
  alerts: GaAdminAlert[];
  funnel: GaAdminFunnelStep[];
  series: GaAdminDayPoint[];
  hours: GaAdminRankedItem[];
  topPages: GaAdminTopPage[];
  landingPages: GaAdminRankedItem[];
  sources: GaAdminRankedItem[];
  campaigns: GaAdminRankedItem[];
  bookingSources: GaAdminRankedItem[];
  countries: GaAdminRankedItem[];
  cities: GaAdminRankedItem[];
  devices: GaAdminDeviceSlice[];
};

export type GaAdminReportResponse =
  | { ok: true; report: GaAdminReport }
  | {
      ok: false;
      error: string;
      setupHint?: string;
    };

export type GaRealtimeMinute = {
  minutesAgo: number;
  users: number;
};

export type GaRealtimeReport = {
  activeUsers: number;
  minutes: GaRealtimeMinute[];
  generatedAt: string;
};

export type GaRealtimeResponse =
  | { ok: true; report: GaRealtimeReport }
  | {
      ok: false;
      error: string;
      setupHint?: string;
    };
