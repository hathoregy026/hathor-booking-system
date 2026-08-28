"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import dynamic from "next/dynamic";
import { PublicThemeToggle } from "@/components/public/PublicThemeToggle";
import { SelectionHeaderControls } from "@/components/selection/SelectionHeaderControls";

const EditorialNavOverlay = dynamic(
  () =>
    import("@/components/layout/EditorialNavOverlay").then(
      (mod) => mod.EditorialNavOverlay,
    ),
  { ssr: false },
);
import {
  HATHOR_BRAND_NAME,
  HATHOR_HERO_ICON_DARK_SRC,
  HATHOR_HERO_ICON_SRC,
} from "@/lib/branding";
import {
  HEADER_NAV_ITEMS,
  navHrefMatches,
  splitHeaderNavItems,
  usesEditorialOverlayNav,
  type HeaderNavItem,
} from "@/lib/public-nav";
import {
  forceUnlockBodyScroll,
  lockBodyScroll,
  unlockBodyScroll,
} from "@/lib/body-scroll-lock";
import { PUBLIC_CONTACT } from "@/lib/public-contact";

const EXPLORE_LOCK_OWNER = "explore-panel" as const;

function ExplorePanel({
  open,
  onClose,
  onNavigate,
  navItems,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: (href: string) => void;
  navItems: HeaderNavItem[];
}) {
  if (!open) return null;

  return (
    <div className="hathor-explore" role="dialog" aria-modal="true" aria-label="Explore menu">
      <button
        type="button"
        className="hathor-explore__backdrop"
        aria-label="Close explore menu"
        onClick={onClose}
      />
      <div className="hathor-explore__panel">
        <div className="hathor-explore__header">
          <p className="hathor-explore__label">Explore</p>
          <button
            type="button"
            className="hathor-header-icon-btn"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="hathor-explore__grid">
          {navItems.map((item) => {
            if (item.type === "link") {
              return (
                <div key={item.href} className="hathor-explore__group">
                  <ul className="hathor-explore__links">
                    <li>
                      <Link
                        href={item.href}
                        className="hathor-explore__link"
                        onClick={(event) => {
                          event.preventDefault();
                          onNavigate(item.href);
                        }}
                      >
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              );
            }

            return (
              <div key={item.id} className="hathor-explore__group">
                <p className="hathor-explore__group-label">{item.label}</p>
                <ul className="hathor-explore__links">
                  {item.links.map((link) => (
                    <li key={`${item.id}-${link.href}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="hathor-explore__link"
                        onClick={(event) => {
                          event.preventDefault();
                          onNavigate(link.href);
                        }}
                      >
                        <span>{link.label}</span>
                        {link.description ? (
                          <span className="hathor-explore__link-desc">
                            {link.description}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="hathor-explore__footer">
          <p className="hathor-explore__follow">Follow Us</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <a
              href={`mailto:${PUBLIC_CONTACT.email}`}
              className="hathor-explore__contact"
            >
              {PUBLIC_CONTACT.email}
            </a>
            <a
              href={`tel:${PUBLIC_CONTACT.phone}`}
              className="hathor-explore__contact"
            >
              {PUBLIC_CONTACT.phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function isNavItemActive(pathname: string, item: HeaderNavItem): boolean {
  if (item.type === "link") {
    return navHrefMatches(pathname, item.href);
  }

  return (
    navHrefMatches(pathname, item.href) ||
    item.links.some((link) => navHrefMatches(pathname, link.href))
  );
}

/** Primary site header — part of unified PublicNavbar (EX style on all routes). */
export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = HEADER_NAV_ITEMS;
  const { left: navLeft, right: navRight } = useMemo(
    () => splitHeaderNavItems(navItems),
    [navItems],
  );
  const editorialNav = usesEditorialOverlayNav(pathname);
  const isHome =
    pathname === "/" || pathname === "/home-2" || pathname === "/ex";
  const [exploreOpen, setExploreOpen] = useState(false);
  const chromeNav = true;
  const phoneViewportRef = useRef(false);
  const [menuHovered, setMenuHovered] = useState(false);
  const [navCompact, setNavCompact] = useState(false);
  const [suitesNavTone, setSuitesNavTone] = useState<"ivory" | "ink" | null>(
    null,
  );
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const closeDropdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [navPathname, setNavPathname] = useState(pathname);

  const closeExploreSync = useCallback(() => {
    unlockBodyScroll(EXPLORE_LOCK_OWNER);
    setExploreOpen(false);
  }, []);

  const toggleExplore = useCallback(() => {
    setExploreOpen((current) => {
      if (current) {
        unlockBodyScroll(EXPLORE_LOCK_OWNER);
        return false;
      }
      return true;
    });
  }, []);

  const navigateFromExplore = useCallback(
    (href: string) => {
      unlockBodyScroll(EXPLORE_LOCK_OWNER);
      setExploreOpen(false);
      router.push(href);
    },
    [router],
  );

  /* Reset ephemeral nav UI when the route changes (render-time adjust, not an effect). */
  if (pathname !== navPathname) {
    setNavPathname(pathname);
    setMenuHovered(false);
    setOpenDropdown(null);
    if (exploreOpen) {
      setExploreOpen(false);
    }
  }

  const cancelDropdownClose = () => {
    if (closeDropdownTimerRef.current) {
      clearTimeout(closeDropdownTimerRef.current);
      closeDropdownTimerRef.current = null;
    }
  };

  const scheduleDropdownClose = () => {
    cancelDropdownClose();
    closeDropdownTimerRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 140);
  };

  useEffect(() => {
    const media = window.matchMedia("(max-width: 480px)");
    const sync = () => {
      const next = media.matches;
      if (phoneViewportRef.current !== next) {
        phoneViewportRef.current = next;
        unlockBodyScroll(EXPLORE_LOCK_OWNER);
        setExploreOpen(false);
      }
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    return () => {
      cancelDropdownClose();
      forceUnlockBodyScroll();
    };
  }, []);

  useEffect(() => {
    cancelDropdownClose();
  }, [navPathname]);

  /* Pathname safety: always drop explore lock on route change. */
  useLayoutEffect(() => {
    unlockBodyScroll(EXPLORE_LOCK_OWNER);
  }, [pathname]);

  useLayoutEffect(() => {
    if (!exploreOpen) {
      unlockBodyScroll(EXPLORE_LOCK_OWNER);
      return;
    }

    lockBodyScroll(EXPLORE_LOCK_OWNER);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeExploreSync();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      unlockBodyScroll(EXPLORE_LOCK_OWNER);
    };
  }, [exploreOpen, closeExploreSync]);

  useEffect(() => {
    const NAV_SCROLL_ROOT = "iframe[data-public-nav-scroll-root]";
    const cleanups: Array<() => void> = [];

    const readScrollY = () => {
      let y = window.scrollY || 0;
      document.querySelectorAll<HTMLIFrameElement>(NAV_SCROLL_ROOT).forEach((frame) => {
        try {
          const win = frame.contentWindow;
          if (!win) return;
          const doc = win.document;
          const frameY =
            win.scrollY ||
            doc.documentElement?.scrollTop ||
            doc.body?.scrollTop ||
            0;
          if (frameY > y) y = frameY;
        } catch {
          /* cross-origin — ignore */
        }
      });
      return y;
    };

    const updateCompact = () => {
      setNavCompact(readScrollY() > 40);
    };

    updateCompact();
    window.addEventListener("scroll", updateCompact, { passive: true });
    cleanups.push(() =>
      window.removeEventListener("scroll", updateCompact),
    );

    const onSuitesNavTone = (event: MessageEvent) => {
      if (event.data?.type !== "hathor-suites-nav-tone") return;
      const tone = event.data.tone;
      if (tone === "ink" || tone === "ivory") setSuitesNavTone(tone);
    };
    window.addEventListener("message", onSuitesNavTone);
    cleanups.push(() => window.removeEventListener("message", onSuitesNavTone));
    if (!(pathname === "/suites" || pathname.startsWith("/suites/"))) {
      setSuitesNavTone(null);
    }

    const bindFrame = (frame: HTMLIFrameElement) => {
      const attach = () => {
        try {
          const win = frame.contentWindow;
          if (!win) return;
          win.addEventListener("scroll", updateCompact, { passive: true });
          cleanups.push(() =>
            win.removeEventListener("scroll", updateCompact),
          );
          updateCompact();
        } catch {
          /* cross-origin — ignore */
        }
      };

      if (frame.contentDocument?.readyState === "complete") {
        attach();
      } else {
        frame.addEventListener("load", attach);
        cleanups.push(() => frame.removeEventListener("load", attach));
      }
    };

    const bindExistingFrames = () => {
      document
        .querySelectorAll<HTMLIFrameElement>(NAV_SCROLL_ROOT)
        .forEach(bindFrame);
    };
    bindExistingFrames();
    const retry = window.setTimeout(bindExistingFrames, 400);
    cleanups.push(() => window.clearTimeout(retry));

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [pathname]);

  useEffect(() => {
    if (!openDropdown) return;

    const closeDropdown = () => setOpenDropdown(null);
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(".hathor-header__dropdown-zone")) return;
      if (target.closest(".hathor-header__nav")) return;
      closeDropdown();
    };

    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [openDropdown]);

  const handleDropdownTriggerClick = () => {
    /* Navigate to the group landing page; close any open dropdown. */
    cancelDropdownClose();
    setOpenDropdown(null);
  };

  const openDropdownMenu = (id: string) => {
    cancelDropdownClose();
    setOpenDropdown(id);
  };

  const renderNavItem = (item: HeaderNavItem) => {
    const isActive = isNavItemActive(pathname, item);

    if (item.type === "link") {
      return (
        <li key={item.href} className="hathor-header__nav-item">
          <Link
            href={item.href}
            className={`hathor-header__nav-link ${isActive ? "hathor-header__nav-link--active" : ""}`}
          >
            {item.label}
          </Link>
        </li>
      );
    }

    const dropdownOpen = openDropdown === item.id;

    return (
      <li
        key={item.id}
        className="hathor-header__nav-item hathor-header__nav-item--dropdown"
      >
        <div
          className="hathor-header__dropdown-zone"
          onMouseEnter={() => openDropdownMenu(item.id)}
          onMouseLeave={scheduleDropdownClose}
        >
          <div className="hathor-header__dropdown-trigger">
            <Link
              href={item.href}
              className={`hathor-header__nav-link ${isActive ? "hathor-header__nav-link--active" : ""}`}
              aria-haspopup="menu"
              aria-expanded={dropdownOpen}
              onClick={handleDropdownTriggerClick}
            >
              <span className="hathor-header__nav-link-label">{item.label}</span>
              <span className="hathor-header__nav-pyramid" aria-hidden="true" />
            </Link>
            <button
              type="button"
              className="hathor-header__dropdown-toggle"
              aria-label={`Show ${item.label} pages`}
              aria-expanded={dropdownOpen}
              onClick={() => {
                cancelDropdownClose();
                setOpenDropdown((current) =>
                  current === item.id ? null : item.id,
                );
              }}
            />
          </div>
          <div
            className={`hathor-header__dropdown${dropdownOpen ? " is-open" : ""}`}
            role="menu"
            aria-label={`${item.label} pages`}
          >
            <ul className="hathor-header__dropdown-list">
              {item.links.map((link) => {
                const linkActive = navHrefMatches(pathname, link.href);
                return (
                  <li key={`${item.id}-${link.href}-${link.label}`}>
                    <Link
                      href={link.href}
                      className={`hathor-header__dropdown-link${linkActive ? " hathor-header__dropdown-link--active" : ""}`}
                      role="menuitem"
                      onClick={() => setOpenDropdown(null)}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </li>
    );
  };

  const headerClass = [
    "hathor-header",
    "hathor-header--transparent",
    "hathor-header--over-hero",
    "hathor-header--owo-hero-layout",
    "hathor-header--menu-active",
    menuHovered && "hathor-header--menu-hovered",
    navCompact && "hathor-header--nav-compact",
    editorialNav && "hathor-header--editorial-nav",
    chromeNav && "hathor-header--chrome",
    chromeNav && isHome && "hathor-header--home",
    exploreOpen &&
      (chromeNav
        ? "hathor-header--editorial-open"
        : "hathor-header--explore-open"),
    suitesNavTone === "ink" && "hathor-header--suites-ink",
    suitesNavTone === "ivory" && "hathor-header--suites-ivory",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <header className={headerClass}>
        <div className="hathor-header__inner hathor-header__inner--owo">
          {chromeNav ? (
            <button
              type="button"
              className="hathor-header__menu-btn hathor-header__menu-btn--left"
              onClick={toggleExplore}
              aria-expanded={exploreOpen}
              aria-label={exploreOpen ? "Close menu" : "Open menu"}
            >
              <Menu className="h-10 w-10" aria-hidden />
            </button>
          ) : null}
          <div
            className="hathor-header__menu-zone"
            onMouseEnter={() => {
              if (!chromeNav) setMenuHovered(true);
            }}
            onMouseLeave={() => setMenuHovered(false)}
          >
            {chromeNav ? null : (
              <nav
                className="hathor-header__col hathor-header__col--nav-left"
                aria-label="Primary navigation left"
              >
                <ul className="hathor-header__nav hathor-header__nav--left">
                  {navLeft.map(renderNavItem)}
                </ul>
              </nav>
            )}

            <div className="hathor-header__col hathor-header__col--logo">
              <Link href="/" prefetch={false} className="hathor-header__brand">
                <Image
                  src={
                    chromeNav || menuHovered
                      ? HATHOR_HERO_ICON_DARK_SRC
                      : HATHOR_HERO_ICON_SRC
                  }
                  alt={HATHOR_BRAND_NAME}
                  width={46}
                  height={46}
                  sizes="46px"
                  className="hathor-header__logo hathor-header__logo--icon"
                />
              </Link>
            </div>

            {chromeNav ? null : (
              <nav
                className="hathor-header__col hathor-header__col--nav-right"
                aria-label="Primary navigation right"
              >
                <ul className="hathor-header__nav hathor-header__nav--right">
                  {navRight.map(renderNavItem)}
                </ul>
              </nav>
            )}
          </div>

          <div className="hathor-header__col hathor-header__col--right">
            {chromeNav ? null : (
              <button
                type="button"
                className="hathor-header__menu-btn"
                onClick={toggleExplore}
                aria-expanded={exploreOpen}
                aria-label={exploreOpen ? "Close menu" : "Open menu"}
              >
                <Menu className="h-5 w-5" aria-hidden />
              </button>
            )}
            <SelectionHeaderControls />
            <PublicThemeToggle />
          </div>
        </div>
      </header>

      {chromeNav ? (
        <EditorialNavOverlay
          open={exploreOpen}
          onClose={closeExploreSync}
          onNavigate={navigateFromExplore}
          navItems={navItems}
        />
      ) : (
        <ExplorePanel
          open={exploreOpen}
          onClose={closeExploreSync}
          onNavigate={navigateFromExplore}
          navItems={navItems}
        />
      )}
    </>
  );
}
