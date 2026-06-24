"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Bell, Loader2, Ticket } from "lucide-react";
import { adminFetch, isTransientFetchError } from "@/lib/admin-fetch";
import { formatPrice } from "@/lib/client-dates";

type NotificationItem = {
  id: string;
  customerName: string;
  cruiseName: string;
  createdAt: string;
  totalPriceCents: number;
};

const POLL_VISIBLE_MS = 300_000;
const POLL_HIDDEN_MS = 600_000;
const INITIAL_DELAY_MS = 5_000;

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const inFlightRef = useRef(false);
  const intervalRef = useRef<number | null>(null);

  const loadNotifications = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    try {
      const response = await adminFetch("/api/admin/notifications");
      if (!response.ok) return;

      const data = (await response.json()) as {
        unreadCount: number;
        items: NotificationItem[];
      };
      setUnreadCount(data.unreadCount);
      setItems(data.items);
    } catch (error) {
      if (!isTransientFetchError(error)) {
        console.error("Failed to load notifications:", error);
      }
    } finally {
      inFlightRef.current = false;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialTimer = window.setTimeout(loadNotifications, INITIAL_DELAY_MS);

    const schedulePoll = () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }

      const intervalMs =
        document.visibilityState === "visible"
          ? POLL_VISIBLE_MS
          : POLL_HIDDEN_MS;

      intervalRef.current = window.setInterval(loadNotifications, intervalMs);
    };

    schedulePoll();

    const handleVisibility = () => {
      schedulePoll();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.clearTimeout(initialTimer);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [loadNotifications]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleToggle = async () => {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen && unreadCount > 0) {
      try {
        const response = await adminFetch("/api/admin/notifications", {
          method: "POST",
        });
        if (response.ok) {
          setUnreadCount(0);
        }
      } catch {
        // Keep badge count if mark-read fails
      }
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="admin-header-icon-btn relative transition-colors"
        style={{
          borderColor: open ? "var(--glass-accent-border)" : "var(--border)",
          background: open ? "var(--bg-glass-hover)" : "var(--bg-glass)",
          color: "var(--text-secondary)",
        }}
        aria-label={
          unreadCount > 0
            ? `${unreadCount} new booking notifications`
            : "Notifications"
        }
        aria-expanded={open}
      >
        <Bell className="h-4 w-4" aria-hidden />
        {unreadCount > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
            style={{
              background: "var(--glass-accent-bg)",
              border: "1px solid var(--glass-accent-border)",
              boxShadow: "var(--glass-accent-shadow)",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="admin-notification-panel fixed inset-x-4 top-[4.5rem] z-[60] mx-auto max-h-[min(70vh,32rem)] w-auto overflow-hidden p-0 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[min(100vw-2rem,22rem)]"
          role="dialog"
          aria-label="Booking notifications"
        >
          <div className="admin-notification-panel__header flex items-center justify-between px-4 py-3">
            <p className="text-sm font-semibold">New bookings</p>
            <Link
              href="/admin/bookings"
              className="text-xs font-medium"
              style={{ color: "var(--accent)" }}
              onClick={() => setOpen(false)}
            >
              View all
            </Link>
          </div>

          <div className="admin-notification-panel__list max-h-80 overflow-y-auto">
            {isLoading ? (
              <div
                className="flex items-center justify-center gap-2 py-10 text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Loading...
              </div>
            ) : items.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Ticket
                  className="mx-auto mb-2 h-8 w-8"
                  style={{ color: "var(--text-muted)" }}
                  aria-hidden
                />
                <p className="text-sm font-medium">No new bookings</p>
                <p
                  className="mt-1 text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  Confirmed reservations will appear here
                </p>
              </div>
            ) : (
              <ul>
                {items.map((item) => (
                  <li
                    key={item.id}
                    style={{ borderTop: "1px solid var(--border)" }}
                  >
                    <Link
                      href="/admin/bookings"
                      className="block px-4 py-3 transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_6%,transparent)]"
                      onClick={() => setOpen(false)}
                    >
                      <p className="text-sm font-medium">{item.customerName}</p>
                      <p
                        className="mt-0.5 text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {item.cruiseName} · {formatPrice(item.totalPriceCents)}
                      </p>
                      <p
                        className="mt-1 text-[11px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {formatDistanceToNow(parseISO(item.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
