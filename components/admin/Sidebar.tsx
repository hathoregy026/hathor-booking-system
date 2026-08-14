"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Boxes,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  Ticket,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  isAdminCmsPath,
  isAdminInventoryPath,
} from "@/lib/admin-nav";
import { HathorLogo } from "./HathorLogo";

type NavItem = { href: string; label: string; icon: LucideIcon };

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: Ticket },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/cms", label: "CMS", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

type SidebarProps = {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/admin/cms") return isAdminCmsPath(pathname);
  if (href === "/admin/inventory") return isAdminInventoryPath(pathname);
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarBrand() {
  return (
    <div className="flex h-16 shrink-0 items-center gap-3 px-5">
      <HathorLogo size="sm" className="!h-9 !w-9" />
      <div className="leading-tight">
        <p className="text-sm font-semibold tracking-tight">Hathor</p>
        <p className="text-[11px] text-muted">Admin Console</p>
      </div>
    </div>
  );
}

function NavContent({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
    onNavigate?.();
  };

  return (
    <>
      <div className="gold-hairline" />

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="admin-section-label px-3 pb-2">Menu</p>
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`group nav-item ${active ? "nav-item-active" : ""}`}
            >
              <Icon
                className="h-[18px] w-[18px] shrink-0"
                strokeWidth={1.9}
                aria-hidden
              />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3" style={{ borderTop: "1px solid var(--border)" }}>
        <button
          type="button"
          onClick={handleLogout}
          className="nav-item admin-nav-item--danger w-full"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" aria-hidden />
          Logout
        </button>
      </div>
    </>
  );
}

export function Sidebar({
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  return (
    <>
      <aside className="admin-sidebar admin-sidebar--fixed hidden min-h-0 shrink-0 flex-col lg:flex">
        <SidebarBrand />
        <NavContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            aria-label="Close menu"
            onClick={onMobileClose}
          />
          <aside
            className="admin-sidebar admin-sidebar--drawer absolute inset-y-0 left-0 flex w-[min(100vw-3rem,17rem)] max-w-full flex-col"
            style={{ borderRight: "1px solid var(--border)" }}
          >
            <div className="relative">
              <SidebarBrand />
              <button
                type="button"
                onClick={onMobileClose}
                className="btn-ghost absolute right-2 top-3 h-9 w-9 px-0"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <NavContent onNavigate={onMobileClose} />
          </aside>
        </div>
      )}
    </>
  );
}