"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock3,
  Eye,
  Globe2,
  MonitorSmartphone,
  MousePointerClick,
  RefreshCw,
  Share2,
  Users,
} from "lucide-react";
import {
  Area,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ActionButton } from "@/components/admin/ActionButton";
import { DataTable } from "@/components/admin/DataTable";
import { StatCard } from "@/components/admin/StatCard";
import { adminFetch, isTransientFetchError } from "@/lib/admin-fetch";
import type {
  GaAdminDeviceSlice,
  GaAdminRankedItem,
  GaAdminReport,
  GaAdminReportResponse,
} from "@/lib/ga-admin-report";

type Cubic = [number, number, number, number];
const EASE_SMOOTH: Cubic = [0.32, 0.72, 0, 1];

const numberFmt = new Intl.NumberFormat("en-GB");
const percentFmt = new Intl.NumberFormat("en-GB", {
  maximumFractionDigits: 1,
});

const DEVICE_COLORS: Record<string, string> = {
  desktop: "#b69f64",
  mobile: "#8b6914",
  tablet: "#c9a96e",
  smarttv: "#d4c4a0",
  other: "#6e6450",
};

function formatCount(value: number): string {
  return numberFmt.format(value);
}

function formatPercent(value: number): string {
  return `${percentFmt.format(value)}%`;
}

function formatDuration(seconds: number): string {
  if (seconds < 1) return "0s";
  const total = Math.round(seconds);
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  if (minutes === 0) return `${rest}s`;
  return `${minutes}m ${String(rest).padStart(2, "0")}s`;
}

function deviceFill(key: string): string {
  return DEVICE_COLORS[key] ?? DEVICE_COLORS.other;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey?: string; value?: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const visitors = payload.find((item) => item.dataKey === "visitors")?.value ?? 0;
  const pageViews = payload.find((item) => item.dataKey === "pageViews")?.value ?? 0;
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs shadow-lg"
      style={{
        background: "var(--bg-glass)",
        border: "1px solid var(--border)",
        color: "var(--text-primary)",
      }}
    >
      <p className="font-semibold">{label}</p>
      <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
        Visitors · {formatCount(visitors)}
      </p>
      <p style={{ color: "var(--accent)" }}>
        Page views · {formatCount(pageViews)}
      </p>
    </div>
  );
}

function RankedBars({
  items,
  empty,
}: {
  items: GaAdminRankedItem[];
  empty: string;
}) {
  const peak = Math.max(1, ...items.map((item) => item.value));
  if (items.length === 0) {
    return (
      <p className="mt-5 text-sm" style={{ color: "var(--text-muted)" }}>
        {empty}
      </p>
    );
  }

  return (
    <ul className="mt-5 space-y-3">
      {items.map((item) => {
        const width = Math.max(6, Math.round((item.value / peak) * 100));
        return (
          <li key={item.label}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate font-medium">{item.label}</span>
              <span className="shrink-0 tabular-nums" style={{ color: "var(--text-muted)" }}>
                {formatCount(item.value)}
              </span>
            </div>
            <div
              className="mt-1.5 h-1.5 overflow-hidden rounded-full"
              style={{ background: "color-mix(in srgb, var(--accent) 16%, var(--border))" }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${width}%`, background: "var(--accent)" }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function DevicePie({
  devices,
  reduceMotion,
}: {
  devices: GaAdminDeviceSlice[];
  reduceMotion: boolean | null;
}) {
  const data = devices.map((slice) => ({
    ...slice,
    fill: deviceFill(slice.key),
  }));

  if (data.length === 0) {
    return (
      <p className="mt-5 text-sm" style={{ color: "var(--text-muted)" }}>
        Device mix will appear after the first sessions land.
      </p>
    );
  }

  return (
    <div className="mt-2 h-[220px] w-full min-w-0 sm:h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius="52%"
            outerRadius="78%"
            paddingAngle={2}
            stroke="none"
            isAnimationActive={!reduceMotion}
          >
            {data.map((slice) => (
              <Cell key={slice.key} fill={slice.fill} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatCount(Number(value ?? 0))}
            contentStyle={{
              background: "var(--bg-glass)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              color: "var(--text-primary)",
            }}
          />
          <Legend
            verticalAlign="bottom"
            formatter={(value) => (
              <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AnalyticsDashboard() {
  const reduceMotion = useReducedMotion();
  const [report, setReport] = useState<GaAdminReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setupHint, setSetupHint] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);
    setSetupHint(null);
    try {
      const response = await adminFetch("/api/admin/analytics", { signal });
      const body = (await response.json()) as GaAdminReportResponse;
      if (!body.ok) {
        setReport(null);
        setError(body.error);
        setSetupHint(body.setupHint ?? null);
        return;
      }
      setReport(body.report);
    } catch (caught) {
      if (signal?.aborted) return;
      setReport(null);
      setError(
        isTransientFetchError(caught)
          ? "Request timed out. Try again in a moment."
          : "Could not load analytics.",
      );
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    // Mount-triggered load has nowhere else to live in a client component.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial analytics fetch on mount
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const series = useMemo(() => report?.series ?? [], [report]);
  const peakViews = useMemo(
    () => Math.max(0, ...series.map((point) => point.pageViews)),
    [series],
  );
  const pageViewTotal = report?.totals.pageViews ?? 0;

  const gridMotion = reduceMotion
    ? {}
    : {
        initial: "hidden" as const,
        animate: "shown" as const,
        variants: {
          hidden: {},
          shown: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
        },
      };

  const tileMotion = reduceMotion
    ? {}
    : {
        variants: {
          hidden: { opacity: 0, y: 12 },
          shown: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.34, ease: EASE_SMOOTH },
          },
        },
      };

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="admin-page-title">Analytics</h1>
          <p className="admin-page-subtitle">
            Live site traffic from Google Analytics — last 7 days
          </p>
        </div>
        <ActionButton
          variant="outline"
          icon={RefreshCw}
          onClick={() => void load()}
          disabled={isLoading}
          className="shrink-0 px-4 py-2"
        >
          {isLoading ? "Refreshing…" : "Refresh"}
        </ActionButton>
      </div>

      {error && (
        <div className="admin-alert admin-alert--danger" role="alert">
          <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Couldn&rsquo;t load analytics</p>
            <p className="mt-0.5 text-sm opacity-90">{error}</p>
            {setupHint && (
              <p className="mt-2 text-sm opacity-90">{setupHint}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="btn-outline shrink-0 px-4 py-2 text-xs"
          >
            Retry
          </button>
        </div>
      )}

      <motion.section className="admin-bento" aria-label="Traffic summary" {...gridMotion}>
        <motion.div {...tileMotion}>
          <StatCard
            label="Live now"
            value={formatCount(report?.realtimeActiveUsers ?? 0)}
            icon={Activity}
            hint="Active users in the last 30 minutes"
            isLoading={isLoading}
            className="h-full"
          />
        </motion.div>
        <motion.div {...tileMotion}>
          <StatCard
            label="Visitors"
            value={formatCount(report?.totals.visitors ?? 0)}
            icon={Users}
            hint="Unique visitors · last 7 days"
            isLoading={isLoading}
            className="h-full"
          />
        </motion.div>
        <motion.div {...tileMotion}>
          <StatCard
            label="Bounce rate"
            value={formatPercent(report?.totals.bounceRate ?? 0)}
            icon={MousePointerClick}
            hint="Sessions that were not engaged"
            isLoading={isLoading}
            className="h-full"
          />
        </motion.div>
        <motion.div {...tileMotion}>
          <StatCard
            label="Avg. session"
            value={formatDuration(report?.totals.averageSessionDurationSeconds ?? 0)}
            icon={Clock3}
            hint="Average time on the site"
            isLoading={isLoading}
            className="h-full"
          />
        </motion.div>
        <motion.div className="col-span-2" {...tileMotion}>
          <StatCard
            label="Page views"
            value={formatCount(report?.totals.pageViews ?? 0)}
            icon={Eye}
            hint={
              peakViews > 0
                ? `Peak day ${formatCount(peakViews)} views`
                : "Last 7 days"
            }
            isLoading={isLoading}
            className="h-full"
          />
        </motion.div>
      </motion.section>

      <section className="card p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="admin-heading text-base sm:text-lg">Traffic trend</h2>
            <p className="admin-subheading mt-1">
              Visitors and page views by day
            </p>
          </div>
          <BarChart3
            className="h-5 w-5 shrink-0"
            style={{ color: "var(--accent)" }}
            aria-hidden
          />
        </div>
        <div className="mt-5 h-[220px] w-full min-w-0 sm:h-[280px] lg:h-[320px]">
          {isLoading ? (
            <div className="admin-skeleton h-full w-full rounded-2xl" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={series} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="gaPageViewsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#b69f64" stopOpacity={0.38} />
                    <stop offset="100%" stopColor="#b69f64" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="var(--border)"
                  strokeDasharray="3 6"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ stroke: "var(--accent)", strokeOpacity: 0.35 }}
                />
                <Area
                  type="monotone"
                  dataKey="pageViews"
                  name="Page views"
                  stroke="#b69f64"
                  strokeWidth={2}
                  fill="url(#gaPageViewsFill)"
                  isAnimationActive={!reduceMotion}
                />
                <Line
                  type="monotone"
                  dataKey="visitors"
                  name="Visitors"
                  stroke="var(--text-primary)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={!reduceMotion}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
        <div
          className="mt-4 flex flex-wrap gap-4 text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          <span className="inline-flex items-center gap-2">
            <span
              className="h-2 w-4 rounded-full"
              style={{ background: "var(--text-primary)" }}
            />
            Visitors
          </span>
          <span className="inline-flex items-center gap-2">
            <span
              className="h-2 w-4 rounded-full"
              style={{ background: "#b69f64" }}
            />
            Page views
          </span>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="admin-heading text-base sm:text-lg">Device breakdown</h2>
              <p className="admin-subheading mt-1">Desktop, mobile, and tablet sessions</p>
            </div>
            <MonitorSmartphone
              className="h-5 w-5 shrink-0"
              style={{ color: "var(--accent)" }}
              aria-hidden
            />
          </div>
          {isLoading ? (
            <div className="admin-skeleton mt-5 h-[220px] w-full rounded-2xl" />
          ) : (
            <DevicePie devices={report?.devices ?? []} reduceMotion={reduceMotion} />
          )}
        </section>

        <section className="card p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="admin-heading text-base sm:text-lg">Top traffic sources</h2>
              <p className="admin-subheading mt-1">Source / medium by sessions</p>
            </div>
            <Share2
              className="h-5 w-5 shrink-0"
              style={{ color: "var(--accent)" }}
              aria-hidden
            />
          </div>
          {isLoading ? (
            <div className="mt-5 space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="admin-skeleton h-8 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <RankedBars
              items={report?.sources ?? []}
              empty="No referral sources yet."
            />
          )}
        </section>

        <section className="card p-4 sm:p-6 lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="admin-heading text-base sm:text-lg">Top countries</h2>
              <p className="admin-subheading mt-1">Where sessions originated</p>
            </div>
            <Globe2
              className="h-5 w-5 shrink-0"
              style={{ color: "var(--accent)" }}
              aria-hidden
            />
          </div>
          {isLoading ? (
            <div className="mt-5 space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="admin-skeleton h-8 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <RankedBars
              items={report?.countries ?? []}
              empty="No country data yet."
            />
          )}
        </section>
      </div>

      <DataTable
        title="Top performing pages"
        description="Most visited paths this week, ranked by page views"
        isLoading={isLoading}
        isEmpty={!isLoading && !(report?.topPages.length)}
        emptyTitle="No page views yet"
        emptyMessage="Once visitors land, paths will appear here."
        emptyIcon={Eye}
        skeletonRows={6}
      >
        <div className="admin-table-scroll">
          <table className="admin-table min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left sm:px-6">Page</th>
                <th className="px-4 py-3 text-left sm:px-6">Path</th>
                <th className="px-4 py-3 text-right sm:px-6">Views</th>
                <th className="hidden px-4 py-3 text-right sm:table-cell sm:px-6">
                  Share
                </th>
              </tr>
            </thead>
            <tbody>
              {(report?.topPages ?? []).map((page) => {
                const share =
                  pageViewTotal > 0 ? (page.pageViews / pageViewTotal) * 100 : 0;
                return (
                  <tr key={page.path}>
                    <td className="max-w-[14rem] truncate px-4 py-3 font-medium sm:px-6">
                      {page.title}
                    </td>
                    <td
                      className="max-w-[16rem] truncate px-4 py-3 font-mono text-[11px] sm:px-6"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {page.path}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums sm:px-6">
                      {formatCount(page.pageViews)}
                    </td>
                    <td className="hidden px-4 py-3 text-right tabular-nums sm:table-cell sm:px-6">
                      {formatPercent(share)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DataTable>
    </div>
  );
}
