"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { LayoutDashboard, Menu, Ship, Ticket } from "lucide-react";
import { isAdminInventoryPath } from "@/lib/admin-nav";

type AdminBottomNavProps = {
  onOpenMenu: () => void;
};

const ITEMS = [
  { href: "/admin", label: "Home", icon: LayoutDashboard, exact: true },
  { href: "/admin/bookings", label: "Bookings", icon: Ticket, exact: false },
  { href: "/admin/cruises", label: "Cruises", icon: Ship, exact: false },
] as const;

export function AdminBottomNav({ onOpenMenu }: AdminBottomNavProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    if (href === "/admin/cruises") return isAdminInventoryPath(pathname);
    return pathname.startsWith(href);
  };

  return (
    // Phones only — the 72px icon rail takes over from 768px up.
    <nav
      className="admin-bottom-nav fixed inset-x-0 bottom-0 z-40 md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="admin-bottom-nav__inner mx-auto flex max-w-lg items-stretch justify-around gap-1 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {ITEMS.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`admin-bottom-nav__item relative isolate flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[10px] font-semibold ${
                active ? "admin-bottom-nav__item--active" : ""
              }`}
            >
              {active && (
                <motion.span
                  layoutId="admin-bottom-nav-pill"
                  className="admin-bottom-nav__pill"
                  aria-hidden
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 520, damping: 42, mass: 0.9 }
                  }
                />
              )}
              <Icon className="h-5 w-5" aria-hidden />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={onOpenMenu}
          className="admin-bottom-nav__item flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[10px] font-semibold"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" aria-hidden />
          <span>Menu</span>
        </button>
      </div>
    </nav>
  );
}
