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

export type GaAdminReport = {
  range: {
    startDate: string;
    endDate: string;
  };
  realtimeActiveUsers: number;
  totals: {
    visitors: number;
    pageViews: number;
    sessions: number;
    bounceRate: number;
    averageSessionDurationSeconds: number;
  };
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
