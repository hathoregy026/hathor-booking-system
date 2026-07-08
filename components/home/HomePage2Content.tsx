"use client";

import Link from "next/link";
import { useEffect } from "react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { PublicThemeToggle } from "@/components/public/PublicThemeToggle";
import {
  HATHOR_BRAND_NAME,
  HATHOR_HERO_ICON_SRC,
  HATHOR_HERO_POSTER_SRC,
  HATHOR_HERO_VIDEO_SRC,
} from "@/lib/branding";
import { NAV_ACCOMMODATIONS, NAV_EXPERIENCES } from "@/lib/public-nav";
import styles from "./HomePage2Layers.module.css";

const BACK_LOGO_SRC =
  "/branding/hathor-logo-behing-the-sheet-egypt-toors-pyramids.svg";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/cruises", label: "Cruises" },
  {
    href: "/rooms",
    label: "Accommodation",
    links: NAV_ACCOMMODATIONS.links,
  },
  {
    href: "/highlights",
    label: "Experiences",
    links: NAV_EXPERIENCES.links,
  },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

/**
 * Homepage 2 — strict 4-layer architecture (no GSAP scroll).
 * L1 video z0 → L2 logo z10 → L4 cream dome z20 → L3 nav z50
 */
export function HomePage2Content() {
  useEffect(() => {
    document.documentElement.setAttribute("data-homepage2-experience", "");
    return () => {
      document.documentElement.removeAttribute("data-homepage2-experience");
    };
  }, []);

  return (
    <div className={styles.root}>
      {/* LAYER 1 — Hero background (z-0) */}
      <div className={styles.layerHero} aria-hidden={false}>
        <video
          className={styles.heroVideo}
          src={HATHOR_HERO_VIDEO_SRC}
          poster={HATHOR_HERO_POSTER_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Hathor Dahabiya sailing on the Nile"
        />
        <div className={styles.heroShade} aria-hidden />
        <div className={styles.heroStripes} aria-hidden />
      </div>

      {/* LAYER 2 — Giant HATHOR logo (z-10), behind cream sheet */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={BACK_LOGO_SRC}
        alt={HATHOR_BRAND_NAME}
        className={styles.layerLogo}
        fetchPriority="high"
        decoding="async"
      />

      {/* LAYER 4 — Cream dome sheet (z-20), covers logo bottom */}
      <div className={styles.layerDome}>
        <div className={styles.domeContent} />
      </div>

      {/* LAYER 3 — Navigation (z-50), always on top */}
      <header className={styles.layerNav}>
        <div className={styles.topBar}>
          <BookNowTrigger className={styles.bookNow}>Book Now</BookNowTrigger>
          <Link href="/" className={styles.iconBrand}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={HATHOR_HERO_ICON_SRC}
              alt={HATHOR_BRAND_NAME}
              className={styles.iconLogo}
            />
          </Link>
          <BookNowTrigger className={styles.bookNow}>Book Now</BookNowTrigger>
        </div>

        <nav className={styles.nav} aria-label="Homepage 2 navigation">
          <ul className={styles.navList}>
            {NAV_LINKS.map((item) => {
              const hasDropdown = "links" in item && item.links;

              return (
                <li
                  key={item.label}
                  className={
                    hasDropdown ? styles.navItemDropdown : styles.navItem
                  }
                >
                  <Link href={item.href} className={styles.navLink}>
                    {item.label}
                  </Link>
                  {hasDropdown ? (
                    <div className={styles.dropdown} role="menu">
                      {item.links.map((link) => (
                        <Link
                          key={`${item.label}-${link.label}`}
                          href={link.href}
                          className={styles.dropdownLink}
                          role="menuitem"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.themeSlot}>
          <PublicThemeToggle />
        </div>
      </header>
    </div>
  );
}
