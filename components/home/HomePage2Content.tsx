"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { PublicThemeToggle } from "@/components/public/PublicThemeToggle";
import { ParallaxHeroVideo } from "@/components/ui/ParallaxHeroVideo";
import {
  HATHOR_HERO_ICON_SRC,
  HATHOR_HERO_VIDEO_SRC,
  HATHOR_HERO_POSTER_SRC,
} from "@/lib/branding";
import {
  NAV_ACCOMMODATIONS,
  NAV_EXPERIENCES,
  type NavGroup,
} from "@/lib/public-nav";
import { usePageScrollTransition } from "@/components/pages/pageScrollTransitionEngine";
import styles from "./HomePage2Experience.module.css";

const PIN_VH = 4.2;
const BACK_LOGO_SRC =
  "/branding/hathor-logo-behing-the-sheet-egypt-toors-pyramids.svg";

const NAV_ITEMS: Array<
  | { type: "link"; href: string; label: string }
  | { type: "group"; href: string; label: string; group: NavGroup }
> = [
  { type: "link", href: "/", label: "Homepage" },
  { type: "link", href: "/homepage-2", label: "Homepage 2" },
  { type: "link", href: "/cruises", label: "Cruises" },
  {
    type: "group",
    href: "/rooms",
    label: "Accommodation",
    group: NAV_ACCOMMODATIONS,
  },
  {
    type: "group",
    href: "/highlights",
    label: "Experiences",
    group: NAV_EXPERIENCES,
  },
  { type: "link", href: "/about", label: "About" },
  { type: "link", href: "/contact", label: "Contact" },
];

function HomePage2Header() {
  return (
    <header className={styles.header}>
      <div className={styles.bookingRail} aria-label="Booking shortcuts">
        <Link href="/booking" className={styles.bookingPill}>
          Book Now
        </Link>
        <Link href="/booking" className={styles.bookingPill}>
          Book Now
        </Link>
      </div>

      <div className={styles.logoWrap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={HATHOR_HERO_ICON_SRC} alt="Hathor" className={styles.iconLogo} />
      </div>

      <nav className={styles.nav} aria-label="Homepage 2 navigation">
        <ul className={styles.navList}>
          {NAV_ITEMS.map((item) => (
            <li
              key={`${item.type}-${item.label}`}
              className={item.type === "group" ? styles.navGroup : styles.navItem}
            >
              <Link href={item.href} className={styles.navLink}>
                {item.label}
              </Link>
              {item.type === "group" ? (
                <div className={styles.dropdown} role="menu">
                  {item.group.links.map((link) => (
                    <Link
                      key={`${item.group.id}-${link.label}`}
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
          ))}
        </ul>
      </nav>
    </header>
  );
}

export function HomePage2Content() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const heroCopyRef = useRef<HTMLDivElement>(null);

  usePageScrollTransition({
    root: rootRef,
    stage: stageRef,
    mask: maskRef,
    sheet: sheetRef,
    heroCopy: heroCopyRef,
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-homepage2-experience", "");

    return () => {
      document.documentElement.removeAttribute("data-homepage2-experience");
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const syncMediaVisibility = () => {
      const vh = window.innerHeight;
      const top = root.getBoundingClientRect().top + window.scrollY;
      const scroll = window.scrollY;
      const pinProgress = Math.max(0, (scroll - top) / (vh * PIN_VH));

      const inHeroZone = pinProgress < 0.12;
      const hideMedia = !inHeroZone && pinProgress > 0.82;
      const pastPin = pinProgress >= 0.92;

      root.classList.toggle("hathor-page-scroll--media-gone", hideMedia);
      root.classList.toggle("hathor-page-scroll--past-pin", pastPin);
    };

    syncMediaVisibility();
    window.addEventListener("scroll", syncMediaVisibility, { passive: true });
    window.addEventListener("resize", syncMediaVisibility);

    return () => {
      window.removeEventListener("scroll", syncMediaVisibility);
      window.removeEventListener("resize", syncMediaVisibility);
    };
  }, []);

  return (
    <section
      ref={rootRef}
      data-page-transition
      data-homepage2-transition
      className={`hathor-page-scroll-transition hathor-page-hero ${styles.root}`}
    >
      <div ref={stageRef} className={`pt-stage ${styles.stage}`}>
        <div className={`pt-hero ${styles.hero}`}>
          <div className={`pt-hero__media ${styles.heroMedia}`}>
            <ParallaxHeroVideo
              src={HATHOR_HERO_VIDEO_SRC}
              poster={HATHOR_HERO_POSTER_SRC}
              ariaLabel="Hathor Dahabiya sailing on the Nile"
              className={styles.heroVideo}
            />
            <div className={styles.heroShade} aria-hidden />
          </div>

          <HomePage2Header />
          <PublicThemeToggle />

          <div ref={maskRef} className="pt-mask" aria-hidden="true" />
          <div ref={heroCopyRef} className={styles.heroCopy} aria-hidden="true" />

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={BACK_LOGO_SRC}
            alt=""
            className={styles.backLogo}
            aria-hidden
          />
        </div>

        <div ref={sheetRef} className={`pt-sheet ${styles.sheet}`}>
          <div className={styles.sheetCap} aria-hidden />
          <div className="pt-sheet__content">
            <div className={styles.sheetBody} />
          </div>
        </div>
      </div>
    </section>
  );
}
