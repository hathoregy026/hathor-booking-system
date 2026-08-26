"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Eye,
  RefreshCw,
  Users,
} from "lucide-react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ActionButton } from "@/components/admin/ActionButton";
import { StatCard } from "@/components/admin/StatCard";
import { adminFetch, isTransientFetchError } from "@/lib/admin-fetch";
import type {
  GaAdminReport,
  GaAdminReportResponse,
} from "@/lib/ga-admin-report";

type Cubic = [number, number, number, number];
const EASE_SMOOTH: Cubic = [0.32, 0.72, 0, 1];

const numberFmt = new Intl.NumberFormat("en-GB");

function formatCount(value: number): string {
  return numberFmt.format(value);
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

      <section className="card p-4 sm:p-6">
        <h2 className="admin-heading text-base sm:text-lg">Top pages</h2>
        <p className="admin-subheading mt-1">Most viewed paths this week</p>
        {isLoading ? (
          <div className="mt-5 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="admin-skeleton h-10 w-full rounded-xl" />
            ))}
          </div>
        ) : !report?.topPages.length ? (
          <p className="mt-5 text-sm" style={{ color: "var(--text-muted)" }}>
            No page views yet. Once visitors land, paths will appear here.
          </p>
        ) : (
          <ul className="mt-5 divide-y" style={{ borderColor: "var(--border)" }}>
            {report.topPages.map((page) => (
              <li
                key={page.path}
                className="flex items-baseline justify-between gap-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{page.title}</p>
                  <p
                    className="truncate font-mono text-[11px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {page.path}
                  </p>
                </div>
                <p className="shrink-0 tabular-nums text-sm font-semibold">
                  {formatCount(page.pageViews)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
