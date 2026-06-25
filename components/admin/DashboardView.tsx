"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  DollarSign,
  Globe,
  List,
  RefreshCw,
  Ship,
  Ticket,
  Users,
} from "lucide-react";
import { ActionButton } from "@/components/admin/ActionButton";
import { DataTable, StatusBadge } from "@/components/admin/DataTable";
import { StatCard } from "@/components/admin/StatCard";
import { adminFetch, isTransientFetchError } from "@/lib/admin-fetch";
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

export function DashboardView() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadIdRef = useRef(0);

  const loadDashboard = useCallback(
    async (options?: { attempt?: number; loadId?: number }) => {
      const loadId = options?.loadId ?? ++loadIdRef.current;
      const attempt = options?.attempt ?? 0;

      if (attempt === 0) {
        setIsLoading(true);
        setError(null);
      }

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
      } catch (err) {
        if (loadId !== loadIdRef.current) return;

        if (attempt < 1 && isTransientFetchError(err)) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          return loadDashboard({ attempt: attempt + 1, loadId });
        }

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard. Please try again.",
        );
      } finally {
        if (loadId === loadIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const totalRevenueCents = useMemo(
    () =>
      recentBookings
        .filter((booking) => booking.status === "CONFIRMED")
        .reduce((sum, booking) => sum + booking.totalPriceCents, 0),
    [recentBookings],
  );

  const confirmedRate = useMemo(() => {
    if (!stats || stats.totalBookings === 0) return null;
    return Math.round((stats.confirmedBookings / stats.totalBookings) * 100);
  }, [stats]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">
            Track reservations, revenue, and fleet status
          </p>
        </div>
        {!isLoading && (
          <ActionButton
            variant="outline"
            icon={RefreshCw}
            onClick={() => loadDashboard()}
            className="px-4 py-2 shrink-0"
          >
            Refresh
          </ActionButton>
        )}
      </div>

      {error && (
        <div
          className="admin-card px-5 py-4 text-sm"
          style={{
            borderColor: "var(--danger)",
            color: "var(--danger)",
          }}
        >
          <p className="font-medium">{error}</p>
          <button
            type="button"
            onClick={() => loadDashboard()}
            className="admin-btn-primary mt-3 px-4 py-2 text-xs"
          >
            Retry
          </button>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Bookings"
          value={stats?.totalBookings ?? 0}
          icon={Ticket}
          change={stats ? `${stats.totalBookings} total` : undefined}
          changeType="neutral"
          isLoading={isLoading}
        />
        <StatCard
          label="Confirmed Bookings"
          value={stats?.confirmedBookings ?? 0}
          icon={Users}
          change={confirmedRate !== null ? `${confirmedRate}% rate` : undefined}
          changeType="positive"
          isLoading={isLoading}
        />
        <StatCard
          label="Pending Review"
          value={stats?.pendingBookings ?? 0}
          icon={RefreshCw}
          change={
            stats && stats.pendingBookings > 0
              ? "Needs attention"
              : "All clear"
          }
          changeType={stats && stats.pendingBookings > 0 ? "negative" : "positive"}
          isLoading={isLoading}
        />
        <StatCard
          label="Revenue"
          value={formatPrice(totalRevenueCents)}
          icon={DollarSign}
          change={recentBookings.length > 0 ? "Last 5 confirmed" : undefined}
          changeType="positive"
          isLoading={isLoading}
        />
      </section>

      <section className="admin-card p-6">
        <h2 className="admin-heading text-lg">Quick Actions</h2>
        <p className="admin-subheading mt-1">
          Common tasks to manage your cruise business
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <ActionButton href="/admin/cruises" icon={Ship} variant="primary" className="w-full justify-center py-3">
            Add New Cruise
          </ActionButton>
          <ActionButton href="/admin/bookings" icon={List} variant="outline" className="w-full justify-center py-3">
            View All Bookings
          </ActionButton>
          <ActionButton href="/admin/content" icon={Globe} variant="outline" className="w-full justify-center py-3">
            Edit Website Content
          </ActionButton>
        </div>
      </section>

      <DataTable
        title="Recent Bookings"
        description="Latest reservations across all cruises"
        isLoading={isLoading}
        isEmpty={!error && recentBookings.length === 0}
        emptyMessage="No bookings yet. They will appear here once customers start booking."
        action={
          <Link
            href="/admin/bookings"
            className="admin-btn-primary px-4 py-2 text-sm"
          >
            View All
          </Link>
        }
      >
        <div className="space-y-3 p-4 md:hidden">
          {recentBookings.map((booking) => (
            <article key={booking.id} className="admin-card space-y-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold">{booking.customerName}</p>
                <StatusBadge status={booking.status} />
              </div>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {booking.cruiseName}
              </p>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span style={{ color: "var(--text-muted)" }}>
                  {format(parseISO(booking.departureTime), "MMM d, yyyy")}
                </span>
                <span className="font-semibold tabular-nums" style={{ color: "var(--accent)" }}>
                  {formatPrice(booking.totalPriceCents)}
                </span>
              </div>
            </article>
          ))}
        </div>

        <table className="admin-table hidden min-w-full text-sm md:table">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left">Customer</th>
              <th className="px-6 py-3 text-left">Cruise</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Amount</th>
            </tr>
          </thead>
          <tbody>
            {recentBookings.map((booking) => (
              <tr key={booking.id}>
                <td className="px-6 py-4 font-medium">{booking.customerName}</td>
                <td
                  className="px-6 py-4"
                  style={{ color: "var(--text-secondary)" }}
                >
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
                  className="px-6 py-4 font-semibold tabular-nums"
                  style={{ color: "var(--accent)" }}
                >
                  {formatPrice(booking.totalPriceCents)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTable>

      {!isLoading && stats && (
        <div
          className="grid gap-4 sm:grid-cols-2"
          style={{ color: "var(--text-secondary)" }}
        >
          <div className="admin-card flex items-center gap-4 p-5">
            <Ship className="h-8 w-8" style={{ color: "var(--accent)" }} />
            <div>
              <p className="text-2xl font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
                {stats.totalCruises}
              </p>
              <p className="text-sm">Active cruises in catalog</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
