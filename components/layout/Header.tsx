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
  HEADER_NAV_ITEMS,
  navHrefMatches,
  type HeaderNavItem,
} from "@/lib/public-nav";
import { PUBLIC_CONTACT } from "@/lib/public-contact";

const HEADER_NAV_LEFT = HEADER_NAV_ITEMS.slice(
  0,
  Math.ceil(HEADER_NAV_ITEMS.length / 2),
);
const HEADER_NAV_RIGHT = HEADER_NAV_ITEMS.slice(
  Math.ceil(HEADER_NAV_ITEMS.length / 2),
);

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
          {HEADER_NAV_ITEMS.map((item) => {
            if (item.type === "link") {
              return (
                <div key={item.href} className="hathor-explore__group">
                  <ul className="hathor-explore__links">
                    <li>
                      <Link
                        href={item.href}
                        className="hathor-explore__link"
                        onClick={onClose}
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
                        onClick={onClose}
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
  const [exploreOpen, setExploreOpen] = useState(false);
  const [menuHovered, setMenuHovered] = useState(false);
  const [navCompact, setNavCompact] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const closeDropdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

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
    setMenuHovered(false);
    setOpenDropdown(null);
    setExploreOpen(false);
    cancelDropdownClose();
  }, [pathname]);

  useEffect(() => {
    return () => cancelDropdownClose();
  }, []);

  useEffect(() => {
    document.body.style.overflow = exploreOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [exploreOpen]);

  useEffect(() => {
    const updateCompact = () => {
      setNavCompact(window.scrollY > 40);
    };
    updateCompact();
    window.addEventListener("scroll", updateCompact, { passive: true });
    return () => window.removeEventListener("scroll", updateCompact);
  }, []);

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

  const handleDropdownTriggerClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    event.preventDefault();
    cancelDropdownClose();
    setOpenDropdown((current) => (current === id ? null : id));
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
              onClick={(event) => handleDropdownTriggerClick(event, item.id)}
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
              {item.links.map((link) => (
                <li key={`${item.id}-${link.href}-${link.label}`}>
                  <Link
                    href={link.href}
                    className="hathor-header__dropdown-link"
                    role="menuitem"
                    onClick={() => setOpenDropdown(null)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
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
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <header className={headerClass}>
        <div className="hathor-header__inner hathor-header__inner--owo">
          <div
            className="hathor-header__menu-zone"
            onMouseEnter={() => setMenuHovered(true)}
            onMouseLeave={() => setMenuHovered(false)}
          >
            <nav
              className="hathor-header__col hathor-header__col--nav-left"
              aria-label="Primary navigation left"
            >
              <ul className="hathor-header__nav hathor-header__nav--left">
                {HEADER_NAV_LEFT.map(renderNavItem)}
              </ul>
            </nav>

            <div className="hathor-header__col hathor-header__col--logo">
              <Link href="/" className="hathor-header__brand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    menuHovered
                      ? HATHOR_HERO_ICON_DARK_SRC
                      : HATHOR_HERO_ICON_SRC
                  }
                  alt={HATHOR_BRAND_NAME}
                  className="hathor-header__logo hathor-header__logo--icon"
                />
              </Link>
            </div>

            <nav
              className="hathor-header__col hathor-header__col--nav-right"
              aria-label="Primary navigation right"
            >
              <ul className="hathor-header__nav hathor-header__nav--right">
                {HEADER_NAV_RIGHT.map(renderNavItem)}
              </ul>
            </nav>
          </div>

          <div className="hathor-header__col hathor-header__col--right">
            <button
              type="button"
              className="hathor-header__menu-btn md:hidden"
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
