"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { PublicThemeToggle } from "@/components/public/PublicThemeToggle";
import {
  HATHOR_BRAND_NAME,
  HATHOR_HERO_ICON_DARK_SRC,
  HATHOR_HERO_ICON_SRC,
} from "@/lib/branding";
import {
  EXPLORE_LINKS,
  HEADER_NAV_ITEMS,
  NAV_GROUPS,
  type HeaderNavItem,
  type NavGroup,
} from "@/lib/public-nav";
import { PUBLIC_CONTACT } from "@/lib/public-contact";
import { isHeroRoute } from "@/lib/public-theme";

function ExplorePanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
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
          {NAV_GROUPS.map((group: NavGroup) => (
            <div key={group.id} className="hathor-explore__group">
              <p className="hathor-explore__group-label">{group.label}</p>
              <ul className="hathor-explore__links">
                {group.links.map((link) => (
                  <li key={`${group.id}-${link.href}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="hathor-explore__link cursor-hover"
                      onClick={onClose}
                    >
                      <span>{link.label}</span>
                      {link.description && (
                        <span className="hathor-explore__link-desc">
                          {link.description}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="hathor-explore__group">
            <p className="hathor-explore__group-label">Quick Links</p>
            <ul className="hathor-explore__links">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hathor-explore__link cursor-hover"
                    onClick={onClose}
                  >
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="hathor-explore__footer">
          <p className="hathor-explore__follow">Follow Us</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <a
              href={`mailto:${PUBLIC_CONTACT.email}`}
              className="hathor-explore__contact cursor-hover"
            >
              {PUBLIC_CONTACT.email}
            </a>
            <a
              href={`tel:${PUBLIC_CONTACT.phone}`}
              className="hathor-explore__contact cursor-hover"
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
    if (item.href === "/") return pathname === "/";
    if (item.href === "/homepage-2") return pathname === "/homepage-2";
    return (
      pathname === item.href || pathname.startsWith(`${item.href}/`)
    );
  }

  return (
    pathname === item.href ||
    pathname.startsWith(`${item.href}/`) ||
    item.links.some(
      (link) =>
        pathname === link.href || pathname.startsWith(`${link.href}/`),
    )
  );
}

function isPastPageHero(): boolean {
  const hero = document.querySelector(".hathor-page-hero");
  if (!hero) {
    return window.scrollY > window.innerHeight * 0.9;
  }
  return hero.getBoundingClientRect().bottom <= 0;
}

export function Header() {
  const pathname = usePathname();
  const isHomepage = isHeroRoute(pathname);
  const usePagesHeaderTransition = !isHomepage;
  const [exploreOpen, setExploreOpen] = useState(false);
  const [menuHovered, setMenuHovered] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollHidden, setScrollHidden] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const menuHoveredRef = useRef(false);
  const isScrollingRef = useRef(false);

  const menuBarVisible = menuHovered || isScrolling;

  useEffect(() => {
    menuHoveredRef.current = menuHovered;
    isScrollingRef.current = isScrolling;
    if (menuBarVisible) {
      setScrollHidden(false);
    }
  }, [menuHovered, isScrolling, menuBarVisible]);

  useEffect(() => {
    setScrollHidden(false);
    setMenuHovered(false);
    setIsScrolling(false);
    setOpenDropdown(null);
  }, [pathname]);

  useEffect(() => {
    let scrollEndTimer: ReturnType<typeof setTimeout>;

    const onHeroScroll = () => {
      setIsScrolling(true);
      setScrollHidden(false);

      clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(() => {
        setIsScrolling(false);
        if (
          usePagesHeaderTransition &&
          isPastPageHero() &&
          !menuHoveredRef.current
        ) {
          setScrollHidden(true);
        }
      }, 200);
    };

    window.addEventListener("scroll", onHeroScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onHeroScroll);
      clearTimeout(scrollEndTimer);
    };
  }, [pathname, usePagesHeaderTransition]);

  const handleMenuZoneEnter = () => {
    setMenuHovered(true);
    setScrollHidden(false);
  };

  const handleMenuZoneLeave = () => {
    setMenuHovered(false);
    setOpenDropdown(null);
    if (
      usePagesHeaderTransition &&
      !isScrollingRef.current &&
      isPastPageHero()
    ) {
      setScrollHidden(true);
    }
  };

  useEffect(() => {
    document.body.style.overflow = exploreOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [exploreOpen]);

  const headerClass = [
    "hathor-header",
    "hathor-header--transparent",
    "hathor-header--over-hero",
    "hathor-header--owo-hero-layout",
    menuBarVisible && "hathor-header--menu-active",
    menuHovered && "hathor-header--menu-hovered",
    isScrolling && "hathor-header--scrolling",
    scrollHidden && !menuBarVisible && "hathor-header--scroll-hidden",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <header className={headerClass}>
        <div className="hathor-header__inner hathor-header__inner--owo">
          <div
            className="hathor-header__menu-zone"
            onMouseEnter={handleMenuZoneEnter}
            onMouseLeave={handleMenuZoneLeave}
          >
            <div className="hathor-header__col hathor-header__col--left">
              <Link href="/" className="hathor-header__brand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    menuHovered ? HATHOR_HERO_ICON_DARK_SRC : HATHOR_HERO_ICON_SRC
                  }
                  alt={HATHOR_BRAND_NAME}
                  className="hathor-header__logo hathor-header__logo--icon"
                />
              </Link>
            </div>

            <nav
              className="hathor-header__col hathor-header__col--center"
              aria-label="Primary navigation"
            >
              <ul className="hathor-header__nav">
                {HEADER_NAV_ITEMS.map((item) => {
                  const isActive = isNavItemActive(pathname, item);

                  if (item.type === "link") {
                    return (
                      <li key={item.href} className="hathor-header__nav-item">
                        <Link
                          href={item.href}
                          className={`hathor-header__nav-link cursor-hover ${isActive ? "hathor-header__nav-link--active" : ""}`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  }

                  return (
                    <li
                      key={item.id}
                      className="hathor-header__nav-item hathor-header__nav-item--dropdown"
                      onMouseEnter={() => setOpenDropdown(item.id)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      <Link
                        href={item.href}
                        className={`hathor-header__nav-link cursor-hover ${isActive ? "hathor-header__nav-link--active" : ""}`}
                        aria-haspopup="menu"
                        aria-expanded={openDropdown === item.id}
                      >
                        {item.label}
                      </Link>
                      <div
                        className={`hathor-header__dropdown${openDropdown === item.id ? " is-open" : ""}`}
                        role="menu"
                        aria-label={`${item.label} pages`}
                      >
                        <ul className="hathor-header__dropdown-list">
                          {item.links.map((link) => (
                            <li key={`${item.id}-${link.href}-${link.label}`}>
                              <Link
                                href={link.href}
                                className="hathor-header__dropdown-link cursor-hover"
                                role="menuitem"
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          <div className="hathor-header__col hathor-header__col--right">
            <button
              type="button"
              className="hathor-header__menu-btn cursor-hover md:hidden"
              onClick={() => setExploreOpen(true)}
              aria-expanded={exploreOpen}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>

            <PublicThemeToggle />
          </div>
        </div>
      </header>

      <ExplorePanel open={exploreOpen} onClose={() => setExploreOpen(false)} />
    </>
  );
}
