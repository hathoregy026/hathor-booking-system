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

export type GaAdminReport = {
  range: {
    startDate: string;
    endDate: string;
  };
  realtimeActiveUsers: number;
  totals: {
    visitors: number;
    pageViews: number;
  };
  series: GaAdminDayPoint[];
  topPages: GaAdminTopPage[];
};

export type GaAdminReportResponse =
  | { ok: true; report: GaAdminReport }
  | {
      ok: false;
      error: string;
      setupHint?: string;
    };
