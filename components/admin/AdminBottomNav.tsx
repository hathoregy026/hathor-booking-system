"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Menu,
  Ship,
  Ticket,
} from "lucide-react";

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

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
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
              className={`admin-bottom-nav__item flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[10px] font-semibold transition-colors ${
                active ? "admin-bottom-nav__item--active" : ""
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={onOpenMenu}
          className="admin-bottom-nav__item flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[10px] font-semibold transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" aria-hidden />
          <span>Menu</span>
        </button>
      </div>
    </nav>
  );
}
