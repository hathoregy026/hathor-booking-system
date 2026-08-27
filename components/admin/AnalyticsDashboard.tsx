"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  Clock3,
  Download,
  Eye,
  Filter,
  Globe2,
  Landmark,
  MapPin,
  Megaphone,
  MonitorSmartphone,
  MousePointerClick,
  Percent,
  RefreshCw,
  Share2,
  Ticket,
  UserPlus,
  Users,
  Wallet,
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
import { formatPrice } from "@/lib/client-dates";
import { buildAnalyticsCsv } from "@/lib/ga-admin-csv";
import type {
  GaAdminDelta,
  GaAdminDeviceSlice,
  GaAdminFunnelStep,
  GaAdminRangeId,
  GaAdminRankedItem,
  GaAdminReport,
  GaAdminReportResponse,
  GaRealtimeReport,
  GaRealtimeResponse,
} from "@/lib/ga-admin-report";
import {
  GA_ADMIN_RANGE_IDS,
  GA_ADMIN_RANGES,
  GA_TRACKING_START_ISO,
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

function deltaProps(
  delta: GaAdminDelta | undefined,
  invert = false,
): { change?: string; changeType?: "positive" | "negative" | "neutral" } {
  if (!delta) return {};
  if (delta.changePct === null) {
    if (delta.current > 0) {
      return { change: "New", changeType: invert ? "negative" : "positive" };
    }
    return {};
  }
  const rounded = Math.round(delta.changePct);
  const change = `${rounded > 0 ? "+" : ""}${rounded}%`;
  const effective = invert ? -delta.changePct : delta.changePct;
  const changeType =
    effective > 1 ? "positive" : effective < -1 ? "negative" : "neutral";
  return { change, changeType };
}

function downloadCsv(report: GaAdminReport) {
  const blob = new Blob([buildAnalyticsCsv(report)], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `hathor-analytics-${report.range.id}-${report.range.endIso}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function FunnelSteps({ steps }: { steps: GaAdminFunnelStep[] }) {
  const peak = Math.max(1, ...steps.map((step) => step.count));
  if (steps.every((step) => step.count === 0)) {
    return (
      <p className="mt-5 text-sm" style={{ color: "var(--text-muted)" }}>
        Funnel events will appear after guests move through itinerary, dates,
        suite, checkout, and confirmation.
      </p>
    );
  }

  return (
    <ol className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {steps.map((step, index) => {
        const previous = index === 0 ? step.count : steps[index - 1]?.count ?? 0;
        const retained = previous > 0 ? Math.round((step.count / previous) * 100) : 0;
        const width = Math.max(8, Math.round((step.count / peak) * 100));
        return (
          <li
            key={step.id}
            className="rounded-2xl p-3"
            style={{ border: "1px solid var(--border)" }}
          >
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: "var(--text-muted)" }}
            >
              {step.label}
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
              {formatCount(step.count)}
            </p>
            {index > 0 && (
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                {retained}% of previous
              </p>
            )}
            <div
              className="mt-2 h-1 overflow-hidden rounded-full"
              style={{ background: "var(--border)" }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${width}%`, background: "var(--accent)" }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function HourHeat({ hours }: { hours: GaAdminRankedItem[] }) {
  const peak = Math.max(1, ...hours.map((item) => item.value));
  return (
    <div className="mt-5 flex h-24 items-end gap-px" aria-hidden>
      {hours.map((item) => (
        <span
          key={item.label}
          title={`${item.label} · ${formatCount(item.value)} sessions`}
          className="min-w-0 flex-1 rounded-sm"
          style={{
            height: `${Math.max(6, Math.round((item.value / peak) * 100))}%`,
            background: item.value > 0 ? "var(--accent)" : "var(--border)",
            opacity: item.value > 0 ? 0.9 : 0.4,
          }}
        />
      ))}
    </div>
  );
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
    <div className="mt-2">
      <div className="h-[220px] w-full min-w-0 sm:h-[260px]">
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
      {data.some((slice) => slice.conversions > 0) && (
        <ul className="mt-3 space-y-1 text-xs" style={{ color: "var(--text-muted)" }}>
          {data.map((slice) => (
            <li key={`${slice.key}-conv`}>
              {slice.label}: {formatCount(slice.value)} sessions
              {" · "}
              {formatCount(slice.conversions)} purchases
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LiveMonitor({
  live,
  isLoading,
}: {
  live: GaRealtimeReport | null;
  isLoading: boolean;
}) {
  const peak = Math.max(1, ...(live?.minutes.map((point) => point.users) ?? [1]));

  return (
    <section
      className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <span className="ga-live-dot shrink-0" aria-hidden />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>
            Live active users
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight">
            {isLoading && !live ? "—" : formatCount(live?.activeUsers ?? 0)}
          </p>
          <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
            Right now · last 30 minutes
          </p>
        </div>
      </div>
      <div
        className="flex h-12 w-full max-w-md items-end gap-px sm:h-14"
        aria-hidden
      >
        {(live?.minutes ?? Array.from({ length: 30 }, (_, index) => ({
          minutesAgo: 29 - index,
          users: 0,
        }))).map((point) => (
          <span
            key={point.minutesAgo}
            className="min-w-0 flex-1 rounded-sm"
            style={{
              height: `${Math.max(8, Math.round((point.users / peak) * 100))}%`,
              background: point.users > 0 ? "#22c55e" : "var(--border)",
              opacity: point.users > 0 ? 0.85 : 0.45,
            }}
          />
        ))}
      </div>
    </section>
  );
}

export function AnalyticsDashboard() {
  const reduceMotion = useReducedMotion();
  const [rangeId, setRangeId] = useState<GaAdminRangeId>("7d");
  const [report, setReport] = useState<GaAdminReport | null>(null);
  const [live, setLive] = useState<GaRealtimeReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [liveLoading, setLiveLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setupHint, setSetupHint] = useState<string | null>(null);

  const load = useCallback(async (nextRange: GaAdminRangeId, signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);
    setSetupHint(null);
    try {
      const response = await adminFetch(
        `/api/admin/analytics?range=${encodeURIComponent(nextRange)}`,
        { signal },
      );
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

  const loadLive = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await adminFetch("/api/admin/analytics/realtime", { signal });
      const body = (await response.json()) as GaRealtimeResponse;
      if (signal?.aborted) return;
      if (body.ok) setLive(body.report);
    } catch {
      /* live card fails independently of the main report */
    } finally {
      if (!signal?.aborted) setLiveLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial analytics fetch on mount
    void load(rangeId, controller.signal);
    return () => controller.abort();
  }, [load, rangeId]);

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- live users poll on mount
    void loadLive(controller.signal);
    const timer = window.setInterval(() => {
      void loadLive();
    }, 30_000);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [loadLive]);

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
            Site traffic and bookings · {report?.range.label ?? GA_ADMIN_RANGES[rangeId].label}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sr-only" htmlFor="ga-range">
            Date range
          </label>
          <select
            id="ga-range"
            className="admin-input min-h-11 min-w-[12.5rem] px-3"
            value={rangeId}
            onChange={(event) => {
              const next = event.target.value;
              if ((GA_ADMIN_RANGE_IDS as readonly string[]).includes(next)) {
                setRangeId(next as GaAdminRangeId);
              }
            }}
          >
            {GA_ADMIN_RANGE_IDS.map((id) => (
              <option key={id} value={id}>
                {GA_ADMIN_RANGES[id].label}
              </option>
            ))}
          </select>
          <ActionButton
            variant="outline"
            icon={Download}
            onClick={() => {
              if (report) downloadCsv(report);
            }}
            disabled={!report}
            className="shrink-0 px-4 py-2"
          >
            CSV
          </ActionButton>
          <ActionButton
            variant="outline"
            icon={RefreshCw}
            onClick={() => void load(rangeId)}
            disabled={isLoading}
            className="shrink-0 px-4 py-2"
          >
            {isLoading ? "Refreshing…" : "Refresh"}
          </ActionButton>
        </div>
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
            onClick={() => void load(rangeId)}
            className="btn-outline shrink-0 px-4 py-2 text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {report?.conversionClipped && (
        <div
          className="card p-4 text-sm"
          style={{ borderColor: "color-mix(in srgb, var(--accent) 45%, var(--border))" }}
        >
          Bookings in this conversion rate only count from {GA_TRACKING_START_ISO},
          when site tracking went live — earlier reservations are excluded so the
          rate stays honest.
        </div>
      )}

      {(report?.alerts.length ?? 0) > 0 && (
        <div className="space-y-3">
          {report?.alerts.map((alert) => (
            <div key={alert.id} className="admin-alert admin-alert--danger" role="status">
              <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
              <p className="text-sm">{alert.message}</p>
            </div>
          ))}
        </div>
      )}

      <LiveMonitor live={live} isLoading={liveLoading} />

      <motion.section className="admin-bento" aria-label="Traffic summary" {...gridMotion}>
        <motion.div className="col-span-2" {...tileMotion}>
          <StatCard
            feature
            label="Conversion rate"
            value={formatPercent(report?.conversions.rate ?? 0)}
            icon={Percent}
            hint={
              report
                ? `${formatCount(report.conversions.bookings)} bookings / ${formatCount(report.totals.visitors)} visitors`
                : "Confirmed bookings ÷ visitors"
            }
            isLoading={isLoading}
            className="h-full"
          >
            {report && (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Checkouts {formatCount(report.conversions.checkoutStarts)}
                {" · "}
                Abandoned {formatCount(report.conversions.abandonedCheckouts)}
                {" · "}
                Purchases {formatCount(report.conversions.purchases)}
              </p>
            )}
          </StatCard>
        </motion.div>
        <motion.div {...tileMotion}>
          <StatCard
            label="Bookings"
            value={formatCount(report?.conversions.bookings ?? 0)}
            icon={Ticket}
            hint={report?.compare.label ?? "Confirmed reservations in this range"}
            isLoading={isLoading}
            href="/admin/bookings"
            className="h-full"
            {...deltaProps(report?.compare.bookings)}
          />
        </motion.div>
        <motion.div {...tileMotion}>
          <StatCard
            label="Visitors"
            value={formatCount(report?.totals.visitors ?? 0)}
            icon={Users}
            hint={report?.compare.label ?? report?.range.label ?? "Selected range"}
            isLoading={isLoading}
            className="h-full"
            {...deltaProps(report?.compare.visitors)}
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
            {...deltaProps(report?.compare.bounceRate, true)}
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
                : report?.range.label ?? "Selected range"
            }
            isLoading={isLoading}
            className="h-full"
            {...deltaProps(report?.compare.pageViews)}
          />
        </motion.div>
      </motion.section>

      <motion.section className="admin-bento" aria-label="Revenue and audience" {...gridMotion}>
        <motion.div {...tileMotion}>
          <StatCard
            label="Revenue"
            value={formatPrice(report?.conversions.revenueCents ?? 0)}
            icon={Wallet}
            hint={report?.compare.label ?? "Confirmed booking value"}
            isLoading={isLoading}
            className="h-full"
            {...deltaProps(report?.compare.revenueCents)}
          />
        </motion.div>
        <motion.div {...tileMotion}>
          <StatCard
            label="Avg. booking"
            value={formatPrice(report?.conversions.averageBookingCents ?? 0)}
            icon={Ticket}
            hint="Mean confirmed booking value"
            isLoading={isLoading}
            className="h-full"
          />
        </motion.div>
        <motion.div {...tileMotion}>
          <StatCard
            label="Per visitor"
            value={formatPrice(report?.conversions.revenuePerVisitorCents ?? 0)}
            icon={Wallet}
            hint="Revenue divided by visitors"
            isLoading={isLoading}
            className="h-full"
          />
        </motion.div>
        <motion.div {...tileMotion}>
          <StatCard
            label="Leads"
            value={formatCount(report?.conversions.leads ?? 0)}
            icon={Filter}
            hint="Contact and charter form submissions"
            isLoading={isLoading}
            className="h-full"
          />
        </motion.div>
        <motion.div {...tileMotion}>
          <StatCard
            label="Abandoned checkouts"
            value={formatCount(report?.conversions.abandonedCheckouts ?? 0)}
            icon={AlertTriangle}
            hint="Checkout starts minus confirmed bookings"
            isLoading={isLoading}
            className="h-full"
          />
        </motion.div>
        <motion.div className="col-span-2" {...tileMotion}>
          <StatCard
            label="New vs returning"
            value={`${formatCount(report?.totals.newUsers ?? 0)} / ${formatCount(report?.totals.returningUsers ?? 0)}`}
            icon={UserPlus}
            hint="New users / returning users"
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
                  interval={series.length > 14 ? Math.ceil(series.length / 8) : 0}
                  minTickGap={16}
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
              <p className="admin-subheading mt-1">
                Sessions by device
                {report?.devices.some((device) => device.conversions > 0)
                  ? " · purchases shown in the legend"
                  : ""}
              </p>
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

        <section className="card p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="admin-heading text-base sm:text-lg">Cities</h2>
              <p className="admin-subheading mt-1">Top cities by sessions</p>
            </div>
            <MapPin
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
            <RankedBars items={report?.cities ?? []} empty="No city data yet." />
          )}
        </section>

        <section className="card p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="admin-heading text-base sm:text-lg">Campaigns</h2>
              <p className="admin-subheading mt-1">UTM campaign · source / medium</p>
            </div>
            <Megaphone
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
              items={report?.campaigns ?? []}
              empty="No campaign tags yet. Add utm_campaign to ads and emails."
            />
          )}
        </section>

        <section className="card p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="admin-heading text-base sm:text-lg">Landing pages</h2>
              <p className="admin-subheading mt-1">First page of the session</p>
            </div>
            <Landmark
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
              items={report?.landingPages ?? []}
              empty="Landing pages will appear after sessions land."
            />
          )}
        </section>

        <section className="card p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="admin-heading text-base sm:text-lg">Paid-trip sources</h2>
              <p className="admin-subheading mt-1">
                Source of purchase events (not stored on the booking itself)
              </p>
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
              items={report?.bookingSources ?? []}
              empty="Purchase-by-source appears after confirmed checkout events."
            />
          )}
        </section>
      </div>

      <section className="card p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="admin-heading text-base sm:text-lg">Booking funnel</h2>
            <p className="admin-subheading mt-1">
              Itinerary → dates → suite → checkout → confirmed
            </p>
          </div>
          <Filter
            className="h-5 w-5 shrink-0"
            style={{ color: "var(--accent)" }}
            aria-hidden
          />
        </div>
        {isLoading ? (
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="admin-skeleton h-24 rounded-2xl" />
            ))}
          </div>
        ) : (
          <FunnelSteps steps={report?.funnel ?? []} />
        )}
      </section>

      <section className="card p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="admin-heading text-base sm:text-lg">Hour of day</h2>
            <p className="admin-subheading mt-1">Sessions by hour (00:00–23:00)</p>
          </div>
          <Clock3
            className="h-5 w-5 shrink-0"
            style={{ color: "var(--accent)" }}
            aria-hidden
          />
        </div>
        {isLoading ? (
          <div className="admin-skeleton mt-5 h-24 w-full rounded-2xl" />
        ) : (
          <>
            <HourHeat hours={report?.hours ?? []} />
            <div
              className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.14em]"
              style={{ color: "var(--text-muted)" }}
            >
              <span>00</span>
              <span>06</span>
              <span>12</span>
              <span>18</span>
              <span>23</span>
            </div>
          </>
        )}
      </section>

      <DataTable
        title="Top performing pages"
        description="Most visited paths in this range, ranked by page views"
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

      <section className="card p-4 sm:p-6 text-sm" style={{ color: "var(--text-secondary)" }}>
        <h2 className="admin-heading text-base sm:text-lg">Google-side setup</h2>
        <p className="admin-subheading mt-1">These cannot be switched from this dashboard.</p>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>
            In GA4 Admin → Events, mark as key events:{" "}
            <span className="font-mono text-xs">purchase</span>,{" "}
            <span className="font-mono text-xs">begin_checkout</span>,{" "}
            <span className="font-mono text-xs">generate_lead</span>,{" "}
            <span className="font-mono text-xs">booking_confirmed</span>,{" "}
            <span className="font-mono text-xs">booking_itinerary</span>,{" "}
            <span className="font-mono text-xs">booking_dates</span>,{" "}
            <span className="font-mono text-xs">booking_suite</span>.
          </li>
          <li>
            Link Search Console under GA4 Admin → Product links to see Google
            search queries in the Google UI (not in this page).
          </li>
          <li>
            Filter staff office traffic in GA4 Admin → Data streams → Configure
            tag settings → Define internal traffic.
          </li>
        </ul>
      </section>
    </div>
  );
}
