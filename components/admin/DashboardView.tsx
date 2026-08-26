"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  DollarSign,
  Globe,
  LayoutGrid,
  List,
  RefreshCw,
  Ship,
  Sparkles,
  Ticket,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ActionButton } from "@/components/admin/ActionButton";
import { DataTable, StatusBadge } from "@/components/admin/DataTable";
import { StatCard } from "@/components/admin/StatCard";
import { adminFetch, isTransientFetchError } from "@/lib/admin-fetch";
import { parseBookingCustomerName } from "@/lib/booking-guest-details";
import { formatPrice } from "@/lib/client-dates";

type DashboardStats = {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  totalCruises: number;
};

type RecentBooking = {
  id: string;
  customerName: string;
  cruiseName: string;
  departureTime: string;
  status: string;
  totalPriceCents: number;
};

type Cubic = [number, number, number, number];

/** Mirrors the motion tokens in app/admin-shell.css. */
const EASE_SMOOTH: Cubic = [0.32, 0.72, 0, 1];

type QuickAction = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Only the first action is emphasised; the rest are outline buttons. */
  primary?: boolean;
};

const QUICK_ACTIONS: QuickAction[] = [
  { href: "/admin/cruises", label: "Add New Cruise", icon: Ship, primary: true },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/bookings", label: "View All Bookings", icon: List },
  { href: "/admin/pages", label: "Pages", icon: LayoutGrid },
  { href: "/admin/preload-screen", label: "Preload Screen", icon: Sparkles },
  { href: "/admin/website-text", label: "Edit Website Text", icon: Globe },
  { href: "/admin/content", label: "Edit Website Images", icon: Globe },
];

/**
 * Composition bar for the feature tile. Every segment is derived from the
 * `stats` payload already returned by /api/admin/dashboard — no fake data.
 */
function BookingMix({ stats }: { stats: DashboardStats }) {
  const { totalBookings, confirmedBookings, pendingBookings } = stats;
  if (totalBookings === 0) {
    return (
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        No bookings recorded yet.
      </p>
    );
  }

  const other = Math.max(0, totalBookings - confirmedBookings - pendingBookings);
  const segments = [
    { key: "confirmed", count: confirmedBookings, color: "var(--success)", label: "Confirmed" },
    { key: "pending", count: pendingBookings, color: "var(--warning)", label: "Pending" },
    { key: "other", count: other, color: "var(--text-muted)", label: "Other" },
  ].filter((segment) => segment.count > 0);

  return (
    <div>
      <div className="admin-mixbar" role="img" aria-label="Booking status mix">
        {segments.map((segment) => (
          <span
            key={segment.key}
            style={{
              width: `${(segment.count / totalBookings) * 100}%`,
              background: segment.color,
            }}
          />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((segment) => (
          <li
            key={segment.key}
            className="flex items-center gap-1.5 text-xs"
            style={{ color: "var(--text-secondary)" }}
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: segment.color }}
              aria-hidden
            />
            {segment.label}
            <span className="tabular-nums font-semibold">{segment.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DashboardView() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadIdRef = useRef(0);
  const reduceMotion = useReducedMotion();

  // ---------------------------------------------------------------------
  // Data fetching — unchanged from the original implementation.
  // ---------------------------------------------------------------------
  const loadDashboard = useCallback(async () => {
    const loadId = ++loadIdRef.current;

    setIsLoading(true);
    setError(null);

    try {
      // Same policy as before: one retry, 800ms apart, transient errors only.
      // Written as a loop rather than self-recursion so the callback never
      // references itself (react-hooks/immutability).
      for (let attempt = 0; ; attempt += 1) {
        try {
          const response = await adminFetch("/api/admin/dashboard");
          if (loadId !== loadIdRef.current) return;

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error ?? "Failed to load dashboard");
          }

          setStats(data.stats);
          setRecentBookings(data.recentBookings);
          setError(null);
          return;
        } catch (err) {
          // A newer load superseded this one — drop it silently.
          if (loadId !== loadIdRef.current) return;

          if (attempt < 1 && isTransientFetchError(err)) {
            await new Promise((resolve) => setTimeout(resolve, 800));
            continue;
          }

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load dashboard. Please try again.",
          );
          return;
        }
      }
    } finally {
      if (loadId === loadIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    // Initial client-side fetch. loadDashboard() sets isLoading/error
    // synchronously before awaiting, which this rule flags — but a
    // mount-triggered load has nowhere else to live in a client component.
    // Same convention as the ?q= sync in Header.tsx.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial dashboard fetch on mount
    loadDashboard();
  }, [loadDashboard]);

  // NOTE: this sums only the CONFIRMED rows inside `recentBookings`, which the
  // API caps at the latest few. It is deliberately labelled "Recent Revenue"
  // rather than "Revenue" so the tile does not overstate what it measures.
  const recentRevenueCents = useMemo(
    () =>
      recentBookings
        .filter((booking) => booking.status === "CONFIRMED")
        .reduce((sum, booking) => sum + booking.totalPriceCents, 0),
    [recentBookings],
  );

  const confirmedRecentCount = useMemo(
    () => recentBookings.filter((booking) => booking.status === "CONFIRMED").length,
    [recentBookings],
  );

  const confirmedRate = useMemo(() => {
    if (!stats || stats.totalBookings === 0) return null;
    return Math.round((stats.confirmedBookings / stats.totalBookings) * 100);
  }, [stats]);

  const needsAttention = Boolean(stats && stats.pendingBookings > 0);

  // Staggered entrance for the bento grid.
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
      {/* ---------------------------------------------------------------- */}
      {/* Page head                                                         */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">
            Track reservations, revenue, and fleet status
          </p>
        </div>
        <ActionButton
          variant="outline"
          icon={RefreshCw}
          onClick={() => loadDashboard()}
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
            <p className="font-semibold">Couldn&rsquo;t load the dashboard</p>
            <p className="mt-0.5 text-sm opacity-90">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => loadDashboard()}
            className="btn-outline shrink-0 px-4 py-2 text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Bento stat grid                                                   */}
      {/* 2-up on phones, 2x2 + feature on tablet, 4-col bento on desktop.  */}
      {/* ---------------------------------------------------------------- */}
      <motion.section className="admin-bento" aria-label="Key metrics" {...gridMotion}>
        {/* Feature tile: double width everywhere, double height on desktop. */}
        <motion.div className="col-span-2 lg:row-span-2" {...tileMotion}>
          <StatCard
            feature
            label="Recent Revenue"
            value={formatPrice(recentRevenueCents)}
            icon={DollarSign}
            hint={
              confirmedRecentCount > 0
                ? `From ${confirmedRecentCount} confirmed booking${confirmedRecentCount === 1 ? "" : "s"} in the latest batch`
                : "No confirmed bookings in the latest batch"
            }
            isLoading={isLoading}
            className="h-full"
          >
            {stats && <BookingMix stats={stats} />}
          </StatCard>
        </motion.div>

        <motion.div {...tileMotion}>
          <StatCard
            label="Total Bookings"
            value={stats?.totalBookings ?? 0}
            icon={Ticket}
            hint="All time"
            isLoading={isLoading}
            href="/admin/bookings"
            className="h-full"
          />
        </motion.div>

        <motion.div {...tileMotion}>
          <StatCard
            label="Confirmed"
            value={stats?.confirmedBookings ?? 0}
            icon={CheckCircle2}
            change={confirmedRate !== null ? `${confirmedRate}%` : undefined}
            changeType="positive"
            hint="Of all bookings"
            isLoading={isLoading}
            className="h-full"
          />
        </motion.div>

        <motion.div {...tileMotion}>
          <StatCard
            label="Pending Review"
            value={stats?.pendingBookings ?? 0}
            icon={RefreshCw}
            change={needsAttention ? "Action needed" : "All clear"}
            changeType={needsAttention ? "negative" : "positive"}
            hint={needsAttention ? "Awaiting your decision" : "Nothing waiting"}
            isLoading={isLoading}
            href="/admin/bookings"
            className="h-full"
          />
        </motion.div>

        {/* Was orphaned in a one-child 2-column grid below the table. */}
        <motion.div {...tileMotion}>
          <StatCard
            label="Active Cruises"
            value={stats?.totalCruises ?? 0}
            icon={Ship}
            hint="In catalog"
            isLoading={isLoading}
            href="/admin/cruises"
            className="h-full"
          />
        </motion.div>
      </motion.section>

      {/* ---------------------------------------------------------------- */}
      {/* Quick actions — horizontal rail on phones, grid from sm up.       */}
      {/* ---------------------------------------------------------------- */}
      <section className="card p-4 sm:p-6">
        <h2 className="admin-heading text-base sm:text-lg">Quick Actions</h2>
        <p className="admin-subheading mt-1">
          Common tasks to manage your cruise business
        </p>
        <div className="admin-quick-rail mt-5">
          {QUICK_ACTIONS.map((action) => (
            <ActionButton
              key={action.href}
              href={action.href}
              icon={action.icon}
              variant={action.primary ? "primary" : "outline"}
              className="admin-quick-rail__item w-full justify-center py-3"
            >
              {action.label}
            </ActionButton>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Recent bookings                                                   */}
      {/* ---------------------------------------------------------------- */}
      <DataTable
        title="Recent Bookings"
        description="Latest reservations across all cruises"
        isLoading={isLoading}
        isEmpty={!error && recentBookings.length === 0}
        emptyMessage="No bookings yet. They will appear here once customers start booking."
        action={
          <Link href="/admin/bookings" className="btn-primary px-4 py-2 text-sm">
            View All
          </Link>
        }
      >
        {/* Phones + small tablets: stacked cards, never a sideways scroll. */}
        <div className="space-y-3 p-4 md:hidden">
          {recentBookings.map((booking) => {
            const guest = parseBookingCustomerName(booking.customerName);
            return (
              <article key={booking.id} className="card card-hover space-y-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{guest.guestName}</p>
                    <p
                      className="mt-0.5 text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {guest.guestPhone ?? "—"}
                      {" · "}
                      {guest.partySize != null
                        ? `${guest.partySize} guests`
                        : guest.partyLabel}
                    </p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {booking.cruiseName}
                </p>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span style={{ color: "var(--text-muted)" }}>
                    {format(parseISO(booking.departureTime), "MMM d, yyyy")}
                  </span>
                  <span
                    className="font-semibold tabular-nums"
                    style={{ color: "var(--accent)" }}
                  >
                    {formatPrice(booking.totalPriceCents)}
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        <table className="admin-table hidden min-w-full text-sm md:table">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left">Customer</th>
              <th className="px-6 py-3 text-left">Phone</th>
              <th className="px-6 py-3 text-left">Party</th>
              <th className="px-6 py-3 text-left">Cruise</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {recentBookings.map((booking) => {
              const guest = parseBookingCustomerName(booking.customerName);
              return (
                <tr key={booking.id}>
                  <td className="px-6 py-4 font-medium">{guest.guestName}</td>
                  <td
                    className="whitespace-nowrap px-6 py-4"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {guest.guestPhone ?? "—"}
                  </td>
                  <td
                    className="whitespace-nowrap px-6 py-4"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {guest.partySize != null ? guest.partySize : guest.partyLabel}
                  </td>
                  <td className="px-6 py-4" style={{ color: "var(--text-secondary)" }}>
                    {booking.cruiseName}
                  </td>
                  <td
                    className="whitespace-nowrap px-6 py-4"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {format(parseISO(booking.departureTime), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td
                    className="whitespace-nowrap px-6 py-4 text-right font-semibold tabular-nums"
                    style={{ color: "var(--accent)" }}
                  >
                    {formatPrice(booking.totalPriceCents)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </DataTable>
    </div>
  );
}
