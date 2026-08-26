export const GA_ADMIN_RANGE_IDS = [
  "today",
  "yesterday",
  "7d",
  "30d",
  "90d",
] as const;

export type GaAdminRangeId = (typeof GA_ADMIN_RANGE_IDS)[number];

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
};

export type GaAdminConversions = {
  bookings: number;
  checkoutStarts: number;
  purchases: number;
  leads: number;
  rate: number;
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
  totals: {
    visitors: number;
    pageViews: number;
    sessions: number;
    bounceRate: number;
    averageSessionDurationSeconds: number;
  };
  conversions: GaAdminConversions;
  series: GaAdminDayPoint[];
  topPages: GaAdminTopPage[];
  sources: GaAdminRankedItem[];
  countries: GaAdminRankedItem[];
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
