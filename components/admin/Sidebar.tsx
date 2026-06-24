"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Globe,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings,
  Ship,
  Ticket,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { HATHOR_BRAND_NAME } from "@/lib/branding";
import { HathorLogo } from "./HathorLogo";

type NavItem = { href: string; label: string; icon: LucideIcon };

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Manage",
    items: [
      { href: "/admin/bookings", label: "Bookings", icon: Ticket },
      { href: "/admin/cruises", label: "Cruises & Rooms", icon: Ship },
      { href: "/admin/content", label: "Website Content", icon: Globe },
      { href: "/admin/email-templates", label: "Email Templates", icon: Mail },
    ],
  },
  {
    title: "System",
    items: [{ href: "/admin/settings", label: "Settings", icon: Settings }],
  },
];

type SidebarProps = {
  collapsed?: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

function NavContent({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) =>
    pathname === href ||
    (href !== "/admin" && pathname.startsWith(href));

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
    onNavigate?.();
  };

  return (
    <>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="admin-section-label mb-2 px-3">{section.title}</p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    onClick={onNavigate}
                    className={`admin-nav-item ${active ? "admin-nav-item--active" : ""}`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3" style={{ borderTop: "1px solid var(--border)" }}>
        <button
          type="button"
          onClick={handleLogout}
          className="admin-nav-item w-full"
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden />
          {!collapsed && "Logout"}
        </button>
      </div>
    </>
  );
}

export function Sidebar({
  collapsed = false,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  return (
    <>
      <aside
        className={`admin-sidebar hidden shrink-0 flex-col md:flex ${
          collapsed ? "w-[72px]" : "w-[260px]"
        }`}
        style={{
          background: "var(--bg-primary)",
          borderRight: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Link href="/admin" className="flex min-w-0 items-center gap-3">
            <HathorLogo size="md" />
            {!collapsed && (
              <div className="min-w-0">
                <p
                  className="truncate text-base font-bold tracking-tight"
                  style={{ color: "var(--sidebar-fg)" }}
                >
                  {HATHOR_BRAND_NAME}
                </p>
                <p
                  className="truncate text-xs"
                  style={{ color: "var(--sidebar-fg-muted)" }}
                >
                  Admin Panel
                </p>
              </div>
            )}
          </Link>
          {!collapsed && (
            <button
              type="button"
              className="hidden rounded-lg p-1 lg:flex"
              style={{ color: "var(--sidebar-fg-muted)" }}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>

        <NavContent collapsed={collapsed} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            aria-label="Close menu"
            onClick={onMobileClose}
          />
          <aside
            className="admin-sidebar admin-sidebar--drawer absolute inset-y-0 left-0 flex w-[min(100vw-3rem,280px)] max-w-full flex-col shadow-2xl"
            style={{
              background: "var(--bg-primary)",
              borderRight: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center justify-between px-5 py-5">
              <Link
                href="/admin"
                className="flex min-w-0 items-center gap-3"
                onClick={onMobileClose}
              >
                <HathorLogo size="md" />
                <div className="min-w-0">
                  <p
                    className="truncate text-base font-bold tracking-tight"
                    style={{ color: "var(--sidebar-fg)" }}
                  >
                    {HATHOR_BRAND_NAME}
                  </p>
                  <p
                    className="truncate text-xs"
                    style={{ color: "var(--sidebar-fg-muted)" }}
                  >
                    Admin Panel
                  </p>
                </div>
              </Link>
              <button
                type="button"
                onClick={onMobileClose}
                className="admin-header-icon-btn"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <NavContent onNavigate={onMobileClose} />
          </aside>
        </div>
      )}
    </>
  );
}
