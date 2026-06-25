"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { HATHOR_BRAND_NAME, HATHOR_LOGO_SRC } from "@/lib/branding";
import { PUBLIC_NAV_LINKS } from "@/lib/public-contact";

const HERO_PATHS = new Set(["/"]);

export function PublicHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHeroPage = HERO_PATHS.has(pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const headerClass = isHeroPage
    ? scrolled
      ? "public-header public-header--solid"
      : "public-header public-header--transparent"
    : scrolled
      ? "public-header public-header--light"
      : "public-header public-header--light";

  return (
    <header className={headerClass}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 sm:gap-3"
          onClick={closeMenu}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HATHOR_LOGO_SRC}
            alt={HATHOR_BRAND_NAME}
            className="h-9 w-auto shrink-0 object-contain sm:h-11"
          />
          <span className="public-brand-text hidden text-xl font-medium tracking-tight sm:inline sm:text-2xl">
            Hathor
          </span>
        </Link>

        <nav
          className="hidden items-center gap-8 lg:flex"
          aria-label="Main navigation"
        >
          {PUBLIC_NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`public-nav-link ${isActive ? "public-nav-link--active" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/book"
            className="public-btn-gold min-h-11 px-4 py-2 text-xs sm:px-8 sm:py-3 sm:text-sm"
          >
            Book Now
          </Link>

          <button
            type="button"
            className="public-header-menu-btn lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? (
              <X className="h-6 w-6" aria-hidden />
            ) : (
              <Menu className="h-6 w-6" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="public-mobile-nav" role="dialog" aria-modal="true">
          <button
            type="button"
            className="public-mobile-nav__backdrop"
            aria-label="Close menu"
            onClick={closeMenu}
          />
          <nav className="public-mobile-nav__panel" aria-label="Mobile navigation">
            <div className="flex items-center justify-between border-b border-[rgb(201_169_110/0.2)] px-5 py-4">
              <span className="public-serif text-lg text-[var(--lux-gold-cream)]">
                Menu
              </span>
              <button
                type="button"
                className="public-header-menu-btn"
                onClick={closeMenu}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="flex flex-col gap-1 p-4">
              {PUBLIC_NAV_LINKS.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-3.5 text-sm font-medium tracking-wide uppercase transition-colors ${
                      isActive
                        ? "text-[var(--lux-gold)]"
                        : "text-[var(--lux-text-light)] hover:text-[var(--lux-gold)]"
                    }`}
                    onClick={closeMenu}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/book"
                className="public-btn-gold mt-4 w-full py-3.5 text-center"
                onClick={closeMenu}
              >
                Book Now
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export function HeroScrollIndicator() {
  return (
    <a href="#discover" className="lux-hero__scroll" aria-label="Scroll to content">
      <span>Discover</span>
      <ChevronDown className="h-5 w-5" aria-hidden />
    </a>
  );
}
