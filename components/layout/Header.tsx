"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useBookNowModal } from "@/components/booking/BookingModalProvider";
import { PublicThemeToggle } from "@/components/public/PublicThemeToggle";
import {
  HATHOR_BRAND_NAME,
  HATHOR_LOGO_DAY_SRC,
  HATHOR_LOGO_SRC,
} from "@/lib/branding";
import {
  getPublicHeaderClassName,
  isHeroRoute,
} from "@/lib/public-theme";
import {
  EXPLORE_LINKS,
  HEADER_NAV_LINKS,
  NAV_GROUPS,
  type NavGroup,
} from "@/lib/public-nav";
import { PUBLIC_CONTACT } from "@/lib/public-contact";
import { usePublicTheme } from "@/components/public/PublicThemeProvider";

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

export function Header() {
  const pathname = usePathname();
  const { openBooking } = useBookNowModal();
  const { theme } = usePublicTheme();
  const [exploreOpen, setExploreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = exploreOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [exploreOpen]);

  const overHero = !scrolled && isHeroRoute(pathname);
  const headerClass = getPublicHeaderClassName({
    theme,
    scrolled,
    overHero,
  });

  return (
    <>
      <header className={headerClass}>
        <div className="hathor-header__inner hathor-header__inner--owo">
          <div className="hathor-header__col hathor-header__col--left">
            <Link href="/" className="hathor-header__brand cursor-hover">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HATHOR_LOGO_SRC}
                alt={HATHOR_BRAND_NAME}
                className="hathor-header__logo hathor-brand-logo hathor-brand-logo--night"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HATHOR_LOGO_DAY_SRC}
                alt=""
                aria-hidden
                className="hathor-header__logo hathor-brand-logo hathor-brand-logo--day"
              />
              <span className="hathor-header__wordmark">Hathor</span>
            </Link>
          </div>

          <nav
            className="hathor-header__col hathor-header__col--center"
            aria-label="Primary navigation"
          >
            <ul className="hathor-header__nav">
              {HEADER_NAV_LINKS.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`hathor-header__nav-link cursor-hover ${isActive ? "hathor-header__nav-link--active" : ""}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="hathor-header__col hathor-header__col--right">
            <button
              type="button"
              className="hathor-header__menu-btn cursor-hover lg:hidden"
              onClick={() => setExploreOpen(true)}
              aria-expanded={exploreOpen}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>

            <PublicThemeToggle />

            <button
              type="button"
              className="public-btn-gold cursor-hover min-h-11 px-5 py-2.5 text-xs sm:px-8 sm:text-sm"
              onClick={openBooking}
            >
              Book Now
            </button>
          </div>
        </div>
      </header>

      <ExplorePanel open={exploreOpen} onClose={() => setExploreOpen(false)} />
    </>
  );
}
