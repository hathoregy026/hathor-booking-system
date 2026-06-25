"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Eye, Menu, Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { ActionButton } from "./ActionButton";
import { HathorLogo } from "./HathorLogo";
import { NotificationBell } from "./NotificationBell";

const PAGE_META: Record<string, { section: string; title: string }> = {
  "/admin": { section: "Overview", title: "Dashboard" },
  "/admin/bookings": { section: "Manage", title: "Bookings" },
  "/admin/cruises": { section: "Manage", title: "Cruises & Rooms" },
  "/admin/content": { section: "Manage", title: "Website Content" },
  "/admin/email-templates": { section: "Manage", title: "Email Templates" },
  "/admin/settings": { section: "System", title: "Settings" },
};

type HeaderProps = {
  onMenuToggle?: () => void;
};

export function Header({ onMenuToggle }: HeaderProps) {
  const pathname = usePathname();
  const page =
    PAGE_META[pathname] ??
    (pathname.startsWith("/admin")
      ? { section: "Admin", title: "Panel" }
      : { section: "Overview", title: "Dashboard" });

  const handlePreview = () => {
    window.open("/", "_blank", "noopener,noreferrer");
  };

  return (
    <header className="admin-header sticky top-0 z-30">
      <div className="flex h-[70px] items-center gap-2 px-4 sm:gap-3 sm:px-5 md:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuToggle}
          className="admin-header-icon-btn shrink-0 md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>

        <Link
          href="/admin"
          className="flex min-w-0 shrink-0 items-center gap-2.5 sm:gap-3"
        >
          <HathorLogo size="md" className="!h-10 !w-10" />
          <span
            className="hidden truncate text-base font-semibold sm:inline"
            style={{ color: "var(--accent)" }}
          >
            Hathor Admin
          </span>
        </Link>

        <nav
          className="admin-breadcrumb hidden min-w-0 flex-1 justify-center md:flex"
          aria-label="Breadcrumb"
        >
          <span>{page.section}</span>
          <ChevronRight
            className="admin-breadcrumb__sep h-3.5 w-3.5 shrink-0"
            aria-hidden
          />
          <span className="admin-breadcrumb__current truncate">{page.title}</span>
        </nav>

        <div className="hidden flex-1 justify-center px-4 lg:flex">
          <div className="relative w-full max-w-md">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search bookings, cruises..."
              className="admin-input w-full py-2 pl-10 pr-4 text-sm"
              aria-label="Search"
            />
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3">
          <ThemeToggle />

          <ActionButton
            variant="outline"
            icon={Eye}
            onClick={handlePreview}
            className="hidden text-xs sm:inline-flex"
          >
            Preview
          </ActionButton>

          <NotificationBell />

          <div className="admin-user-avatar" aria-label="Admin user" title="Admin">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
