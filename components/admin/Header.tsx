"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Eye, Menu, Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import { isAdminCmsPath, isAdminInventoryPath } from "@/lib/admin-nav";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";

const PAGE_META: Record<string, { section: string; title: string }> = {
  "/admin": { section: "Overview", title: "Dashboard" },
  "/admin/bookings": { section: "Manage", title: "Bookings" },
  "/admin/cruises": { section: "Manage", title: "Inventory" },
  "/admin/inventory": { section: "Manage", title: "Inventory" },
  "/admin/cms": { section: "Manage", title: "CMS" },
  "/admin/website-text": { section: "CMS", title: "Website Text" },
  "/admin/content": { section: "CMS", title: "Website Images" },
  "/admin/pages": { section: "CMS", title: "Pages" },
  "/admin/live-site": { section: "CMS", title: "Live Site" },
  "/admin/preload-screen": { section: "CMS", title: "Preload Screen" },
  "/admin/hero-logo-tune": { section: "CMS", title: "Hero Logo Tune" },
  "/admin/hieroglyph-tune": { section: "CMS", title: "Background Glyphs" },
  "/admin/typography": { section: "CMS", title: "Typography & Styles" },
  "/admin/email-templates": { section: "CMS", title: "Email Templates" },
  "/admin/storage": { section: "CMS", title: "Storage" },
  "/admin/blogs": { section: "CMS", title: "Blog Posts" },
  "/admin/settings": { section: "System", title: "Settings" },
};

type HeaderProps = {
  onMenuToggle?: () => void;
};

function pageMeta(pathname: string) {
  if (PAGE_META[pathname]) return PAGE_META[pathname];
  if (isAdminCmsPath(pathname)) return { section: "CMS", title: "CMS" };
  if (isAdminInventoryPath(pathname)) return { section: "Manage", title: "Inventory" };
  if (pathname.startsWith("/admin")) return { section: "Admin", title: "Panel" };
  return { section: "Overview", title: "Dashboard" };
}

export function Header({ onMenuToggle }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const page = pageMeta(pathname);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState("");

  const handlePreview = () => {
    window.open("/", "_blank", "noopener,noreferrer");
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const next = query.trim();
    const href = next
      ? `/admin/bookings?q=${encodeURIComponent(next)}`
      : "/admin/bookings";
    router.push(href);
  };

  return (
    <header className="admin-header sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 px-4 sm:px-6">
      <button
        type="button"
        onClick={onMenuToggle}
        aria-label="Open navigation"
        className="btn-ghost -ml-2 h-10 w-10 px-0 lg:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>

      <form onSubmit={handleSearch} className="relative min-w-0 flex-1 sm:max-w-md">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
          style={{ color: "var(--text-muted)" }}
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search bookings…"
          aria-label="Search bookings"
          className="input h-10 pl-9"
        />
      </form>

      <div className="hidden min-w-0 flex-col leading-tight lg:flex">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          {page.section}
        </p>
        <p className="truncate text-sm font-semibold">{page.title}</p>
      </div>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <ThemeToggle compact />
        <button
          type="button"
          onClick={handlePreview}
          className="btn-ghost h-10 w-10 px-0"
          aria-label="Preview public site"
        >
          <Eye className="h-5 w-5" aria-hidden />
        </button>
        <NotificationBell />

        <div className="relative hidden sm:block">
          <button
            type="button"
            onClick={() => setProfileOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={profileOpen}
            className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-[var(--bg-glass-hover)]"
          >
            <span className="admin-user-avatar !h-8 !w-8 text-[11px]">H</span>
            <span className="hidden text-left leading-tight lg:block">
              <span className="block text-sm font-medium">Admin</span>
              <span className="block text-[11px] text-muted">Hathor</span>
            </span>
            <ChevronDown
              className={`hidden h-4 w-4 text-muted transition-transform lg:block ${
                profileOpen ? "rotate-180" : ""
              }`}
              aria-hidden
            />
          </button>

          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setProfileOpen(false)}
                aria-hidden
              />
              <div
                role="menu"
                className="card absolute right-0 z-20 mt-2 w-52 p-1.5"
              >
                <Link
                  href="/admin/settings"
                  role="menuitem"
                  className="block rounded-md px-3 py-2 text-sm hover:bg-[var(--bg-glass-hover)]"
                  onClick={() => setProfileOpen(false)}
                >
                  Settings
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-[var(--bg-glass-hover)]"
                  onClick={() => {
                    setProfileOpen(false);
                    handlePreview();
                  }}
                >
                  Preview site
                </button>
                <div className="divider my-1" />
                <button
                  type="button"
                  role="menuitem"
                  className="w-full rounded-md px-3 py-2 text-left text-sm"
                  style={{ color: "var(--danger)" }}
                  onClick={() => {
                    setProfileOpen(false);
                    void handleLogout();
                  }}
                >
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}