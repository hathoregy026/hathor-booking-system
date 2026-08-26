"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, ChevronRight, Eye, Menu, Search, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { isAdminCmsPath, isAdminInventoryPath } from "@/lib/admin-nav";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";

const PAGE_META: Record<string, { section: string; title: string }> = {
  "/admin": { section: "Overview", title: "Dashboard" },
  "/admin/analytics": { section: "Overview", title: "Analytics" },
  "/admin/bookings": { section: "Manage", title: "Bookings" },
  "/admin/cruises": { section: "Manage", title: "Cruises" },
  "/admin/inventory": { section: "Manage", title: "Cruises" },
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

/** Sections that have a real landing page worth linking to in the trail. */
const SECTION_HREF: Record<string, string> = {
  CMS: "/admin/cms",
};

type Cubic = [number, number, number, number];

/** Mirrors --ease-out-quart in app/admin-shell.css. */
const EASE_OUT_QUART: Cubic = [0.25, 1, 0.5, 1];

type HeaderProps = {
  onMenuToggle?: () => void;
};

function pageMeta(pathname: string) {
  if (PAGE_META[pathname]) return PAGE_META[pathname];
  if (isAdminCmsPath(pathname)) return { section: "CMS", title: "CMS" };
  if (isAdminInventoryPath(pathname)) return { section: "Manage", title: "Cruises" };
  if (pathname.startsWith("/admin")) return { section: "Admin", title: "Panel" };
  return { section: "Overview", title: "Dashboard" };
}

/**
 * Breadcrumb trail derived from PAGE_META, so it stays in sync with the header
 * titles automatically. Nested routes (e.g. /admin/blogs/[id]) append a final
 * "Detail" crumb under their parent.
 */
function buildCrumbs(pathname: string) {
  const page = pageMeta(pathname);
  const crumbs: { label: string; href?: string }[] = [
    { label: "Admin", href: "/admin" },
  ];

  if (pathname !== "/admin") {
    crumbs.push({ label: page.section, href: SECTION_HREF[page.section] });

    const parentEntry = Object.keys(PAGE_META).find(
      (href) => href !== "/admin" && pathname.startsWith(`${href}/`),
    );

    if (parentEntry) {
      crumbs.push({ label: PAGE_META[parentEntry].title, href: parentEntry });
      crumbs.push({ label: "Detail" });
    } else {
      crumbs.push({ label: page.title });
    }
  } else {
    crumbs.push({ label: page.title });
  }

  return crumbs;
}

function bookingsSearchHref(query: string) {
  const next = query.trim();
  return next
    ? `/admin/bookings?q=${encodeURIComponent(next)}`
    : "/admin/bookings";
}

export function Header({ onMenuToggle }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const urlQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(urlQuery);
  const onBookingsPage = pathname === "/admin/bookings";
  const crumbs = buildCrumbs(pathname);
  const currentTitle = crumbs[crumbs.length - 1]?.label ?? "Dashboard";

  useEffect(() => {
    setQuery(urlQuery); // eslint-disable-line react-hooks/set-state-in-effect -- sync header draft with ?q=
  }, [urlQuery]);

  // Elevate the glass header once content scrolls beneath it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) mobileSearchRef.current?.focus();
  }, [searchOpen]);

  const handlePreview = () => {
    window.open("/", "_blank", "noopener,noreferrer");
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const applyBookingsQuery = (value: string) => {
    const href = bookingsSearchHref(value);
    if (onBookingsPage) {
      router.replace(href);
      return;
    }
    router.push(href);
  };

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    applyBookingsQuery(query.trim());
    setSearchOpen(false);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (onBookingsPage) {
      const href = value
        ? `/admin/bookings?q=${encodeURIComponent(value)}`
        : "/admin/bookings";
      router.replace(href);
    }
  };

  const searchField = (
    <>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
        style={{ color: "var(--text-muted)" }}
        aria-hidden
      />
      <input
        type="search"
        value={query}
        onChange={(event) => handleQueryChange(event.target.value)}
        placeholder="Search bookings…"
        aria-label="Search bookings"
        className="input"
      />
    </>
  );

  return (
    <header
      className="admin-header flex shrink-0 items-center gap-2 px-4 sm:gap-3 sm:px-6"
      data-scrolled={scrolled ? "true" : "false"}
    >
      <button
        type="button"
        onClick={onMenuToggle}
        aria-label="Open navigation"
        className="btn-ghost -ml-2 h-11 w-11 px-0 md:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>

      {/* Breadcrumbs (>=640px) — full trail, leads the bar. */}
      <nav aria-label="Breadcrumb" className="admin-crumbs hidden min-w-0 flex-1 sm:flex">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <span key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
              {index > 0 && (
                <ChevronRight className="admin-crumbs__sep h-3.5 w-3.5" aria-hidden />
              )}
              {isLast ? (
                <span className="admin-crumbs__current text-sm" aria-current="page">
                  {crumb.label}
                </span>
              ) : crumb.href ? (
                <Link href={crumb.href} className="admin-crumbs__link truncate">
                  {crumb.label}
                </Link>
              ) : (
                <span className="truncate">{crumb.label}</span>
              )}
            </span>
          );
        })}
      </nav>

      {/* Mobile (<640px): current page title only, so you always know where you are. */}
      <p className="admin-crumbs__current min-w-0 flex-1 text-sm sm:hidden">
        {currentTitle}
      </p>

      {/* Desktop search (>=1024px) — no longer competes for the whole bar. */}
      <form
        onSubmit={handleSearch}
        className="admin-search hidden w-full max-w-xs lg:block"
      >
        {searchField}
      </form>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={() => setSearchOpen((open) => !open)}
          className="btn-ghost h-11 w-11 px-0 lg:hidden"
          aria-label="Search bookings"
          aria-expanded={searchOpen}
        >
          {searchOpen ? (
            <X className="h-5 w-5" aria-hidden />
          ) : (
            <Search className="h-5 w-5" aria-hidden />
          )}
        </button>

        <ThemeToggle compact />
        <button
          type="button"
          onClick={handlePreview}
          className="btn-ghost hidden h-11 w-11 px-0 sm:inline-flex"
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

          <AnimatePresence>
            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setProfileOpen(false)}
                  aria-hidden
                />
                <motion.div
                  role="menu"
                  className="card absolute right-0 z-20 mt-2 w-52 origin-top-right p-1.5"
                  initial={{ opacity: 0, scale: 0.96, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -6 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.18, ease: EASE_OUT_QUART }
                  }
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
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Expanding search sheet for mobile/tablet. */}
      <AnimatePresence>
        {searchOpen && (
          <motion.form
            onSubmit={handleSearch}
            className="admin-search absolute inset-x-0 top-full mx-4 mt-2 lg:hidden"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={
              reduceMotion ? { duration: 0 } : { duration: 0.2, ease: EASE_OUT_QUART }
            }
          >
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
              aria-hidden
            />
            <input
              ref={mobileSearchRef}
              type="search"
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
              placeholder="Search bookings…"
              aria-label="Search bookings"
              className="input shadow-lg"
            />
          </motion.form>
        )}
      </AnimatePresence>
    </header>
  );
}
