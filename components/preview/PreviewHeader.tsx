"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useBookNowModal } from "@/components/booking/BookingModalProvider";
import { PublicThemeToggle } from "@/components/public/PublicThemeToggle";
import { usePublicTheme } from "@/components/public/PublicThemeProvider";
import {
  HATHOR_BRAND_NAME,
  HATHOR_LOGO_DAY_SRC,
  HATHOR_LOGO_SRC,
} from "@/lib/branding";
import { getPublicHeaderClassName, isHeroRoute } from "@/lib/public-theme";

const PREVIEW_NAV_LINKS = [
  { href: "/cruises", label: "Cruises" },
  { href: "/rooms", label: "Accommodations" },
  { href: "/highlights", label: "Experiences" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function PreviewHeader() {
  const pathname = usePathname();
  const { openBooking } = useBookNowModal();
  const { theme } = usePublicTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const overHero = !scrolled && isHeroRoute(pathname);
  const headerClass = getPublicHeaderClassName({
    theme,
    scrolled,
    overHero,
    baseClass: "preview-header",
  });

  return (
    <>
      <header className={headerClass}>
        <div className="preview-header__inner">
          <div className="preview-header__col preview-header__col--left">
            <Link href="/" className="preview-header__brand cursor-hover">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HATHOR_LOGO_SRC}
                alt={HATHOR_BRAND_NAME}
                className="preview-header__logo hathor-brand-logo hathor-brand-logo--night"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HATHOR_LOGO_DAY_SRC}
                alt=""
                aria-hidden
                className="preview-header__logo hathor-brand-logo hathor-brand-logo--day"
              />
              <span className="preview-header__wordmark">Hathor</span>
            </Link>
          </div>

          <nav
            className="preview-header__col preview-header__col--center"
            aria-label="Primary navigation"
          >
            <ul className="preview-header__nav">
              {PREVIEW_NAV_LINKS.map((link) => {
                const isActive =
                  pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`preview-header__nav-link cursor-hover ${isActive ? "preview-header__nav-link--active" : ""}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="preview-header__col preview-header__col--right">
            <button
              type="button"
              className="preview-header__menu-btn cursor-hover lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
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

      {menuOpen ? (
        <div className="preview-mobile-nav" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            className="preview-mobile-nav__backdrop"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <div className="preview-mobile-nav__panel">
            <div className="preview-mobile-nav__header">
              <p className="preview-mobile-nav__label">Menu</p>
              <button
                type="button"
                className="preview-header__menu-btn"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <ul className="preview-mobile-nav__links">
              {PREVIEW_NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="preview-mobile-nav__link cursor-hover"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
