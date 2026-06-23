"use client";

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
    <header
      className="sticky top-0 z-30 px-4 py-3 backdrop-blur-xl sm:px-5 sm:py-4 md:px-6 lg:px-8"
      style={{
        background: "var(--header-bg)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-5">
        <button
          type="button"
          onClick={onMenuToggle}
          className="admin-header-icon-btn shrink-0 md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>

        <div className="min-w-0 flex-1">
          <div
            className="hidden items-center gap-1.5 text-xs font-medium sm:flex"
            style={{ color: "var(--text-muted)" }}
          >
            <span>{page.section}</span>
            <ChevronRight className="h-3 w-3" aria-hidden />
            <span style={{ color: "var(--text-secondary)" }}>{page.title}</span>
          </div>
          <h1 className="admin-heading mt-0 truncate text-lg sm:mt-0.5 sm:text-xl md:text-2xl">
            {page.title}
          </h1>
        </div>

        <div className="hidden flex-1 justify-center px-4 lg:flex">
          <div className="relative w-full max-w-lg">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search bookings, cruises..."
              className="admin-input w-full py-2.5 pl-11 pr-4 text-sm"
              aria-label="Search"
            />
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3">
          <ThemeToggle />

          <ActionButton
            variant="primary"
            icon={Eye}
            onClick={handlePreview}
            className="hidden text-xs sm:inline-flex"
          >
            Preview
          </ActionButton>

          <NotificationBell />

          <HathorLogo size="sm" className="hidden sm:block" />
        </div>
      </div>
    </header>
  );
}
