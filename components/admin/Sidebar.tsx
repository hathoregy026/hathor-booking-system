"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  FileText,
  ImageIcon,
  LayoutDashboard,
  Layers,
  LogOut,
  Settings,
  Ship,
  Ticket,
  Type,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { isAdminInventoryPath } from "@/lib/admin-nav";
import { HathorLogo } from "./HathorLogo";

type Cubic = [number, number, number, number];

/** Shared easing curves — mirrors --ease-smooth in app/admin-shell.css. */
const EASE_SMOOTH: Cubic = [0.32, 0.72, 0, 1];

type NavItem = { href: string; label: string; icon: LucideIcon };

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: Ticket },
  { href: "/admin/cruises", label: "Cruises", icon: Ship },
  { href: "/admin/website-text", label: "Website Text", icon: FileText },
  { href: "/admin/typography", label: "Typography", icon: Type },
  { href: "/admin/content", label: "Website Images", icon: ImageIcon },
  { href: "/admin/cms", label: "CMS", icon: Layers },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

type SidebarProps = {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/admin/cruises") return isAdminInventoryPath(pathname);
  if (href === "/admin/cms") return pathname === "/admin/cms";
  if (href === "/admin/content") {
    return pathname === "/admin/content" || pathname.startsWith("/admin/images");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarBrand() {
  return (
    <div className="admin-brand flex h-16 shrink-0 items-center gap-3 px-5">
      <HathorLogo size="sm" className="!h-9 !w-9" />
      <div className="admin-brand__text leading-tight">
        <p className="text-sm font-semibold tracking-tight">Hathor</p>
        <p className="text-[11px] text-muted">Admin Console</p>
      </div>
    </div>
  );
}

/**
 * `indicatorId` scopes the shared-layout animation. The persistent sidebar and
 * the mobile drawer can be mounted at the same time, so they must not share a
 * layoutId or the gold pill will fly between them.
 */
function NavContent({
  indicatorId,
  onNavigate,
}: {
  indicatorId: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
    onNavigate?.();
  };

  return (
    <>
      <div className="gold-hairline" />

      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-visible px-3 py-4">
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
              {active && (
                <motion.span
                  layoutId={`${indicatorId}-nav-pill`}
                  className="admin-nav__pill"
                  aria-hidden
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 520, damping: 42, mass: 0.9 }
                  }
                />
              )}
              <Icon
                className="h-[18px] w-[18px] shrink-0"
                strokeWidth={1.9}
                aria-hidden
              />
              <span className="admin-nav__label truncate">{label}</span>
              {/* Rail-mode tooltip; hidden by CSS at every other breakpoint. */}
              <span className="admin-nav__tip hidden" aria-hidden>
                {label}
              </span>
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
          <span className="admin-nav__label">Logout</span>
          <span className="admin-nav__tip hidden" aria-hidden>
            Logout
          </span>
        </button>
      </div>
    </>
  );
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const reduceMotion = useReducedMotion();

  const drawerTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.34, ease: EASE_SMOOTH };

  return (
    <>
      {/* Tablet icon rail (>=768px) and desktop sidebar (>=1024px).
          Width + label collapsing are handled in admin-shell.css. */}
      <aside className="admin-sidebar admin-sidebar--fixed hidden min-h-0 shrink-0 flex-col md:flex">
        <SidebarBrand />
        <NavContent indicatorId="rail" />
      </aside>

      {/* Phone drawer (<768px) */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
            <motion.button
              type="button"
              className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
              aria-label="Close menu"
              onClick={onMobileClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={
                reduceMotion ? { duration: 0 } : { duration: 0.24, ease: "easeOut" }
              }
            />
            <motion.aside
              className="admin-sidebar admin-sidebar--drawer flex w-[min(100vw-3rem,17rem)] max-w-full flex-col"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={drawerTransition}
            >
              <div className="relative">
                <SidebarBrand />
                <button
                  type="button"
                  onClick={onMobileClose}
                  className="btn-ghost absolute right-2 top-3 h-11 w-11 px-0"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>
              <NavContent indicatorId="drawer" onNavigate={onMobileClose} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
