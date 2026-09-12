"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type CSSProperties } from "react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { HATHOR_FOOTER_VIDEO_SRC } from "@/lib/branding";
import { ensurePublicScrollController } from "@/lib/public-scroll-controller";
import { PUBLIC_CONTACT } from "@/lib/public-contact";
import { PUBLIC_SOCIAL_LINKS } from "@/lib/public-social";
import { SEO_SITE_ORIGIN, seoAbsoluteUrl } from "@/lib/seo/site";

/**
 * The site footer. One composition, every route, every viewport.
 *
 * Editorial order is the read order: the invitation and the reservations desk
 * first, then the map of the site, then the legal line. Everything is real
 * markup in flow — the video and the wordmark ghost are the only absolutely
 * positioned layers, and neither carries meaning.
 *
 * The reel is decorative and lazy: nothing is fetched until the footer is
 * within a viewport of the fold, and reduced-motion holds it on its first
 * frame rather than hiding the river entirely.
 */

const FOUNDED_YEAR = 2019;

/** Column one — what a guest can book. */
const EXPLORE_LINKS = [
  { href: "/cruises-list", label: "Cruises" },
  { href: "/suites", label: "Suites" },
  { href: "/luxury-cabins-Nile-Cruise", label: "Cabins" },
  { href: "/charter", label: "Private Charter" },
] as const;

/** Column two — what happens on board. */
const ABOARD_LINKS = [
  { href: "/gastronomy", label: "Gastronomy" },
  { href: "/wellness", label: "Seneb Spa" },
  { href: "/royal-suites", label: "Royal Suites" },
  { href: "/about", label: "About" },
] as const;

/** Column three — where the boat actually goes. */
const ROUTE_LINKS = [
  { href: "/voyages", label: "All Voyages" },
  { href: "/voyages/luxor-to-aswan", label: "Luxor to Aswan" },
  { href: "/voyages/aswan-to-luxor", label: "Aswan to Luxor" },
  { href: "/highlights", label: "Highlights" },
] as const;

const UTILITY_LINKS = [
  { href: "/contact", label: "Contact" },
  { href: "/blogs", label: "Journal" },
  { href: "/partners", label: "Partners" },
  { href: "/terms-and-conditions", label: "Terms" },
] as const;

const NAV_COLUMNS = [
  { id: "explore", title: "Explore", links: EXPLORE_LINKS },
  { id: "aboard", title: "Aboard", links: ABOARD_LINKS },
  { id: "route", title: "Route", links: ROUTE_LINKS },
] as const;

/** HATHOR only — the viewBox trims the subtitle band off the brand mark. */
function WordmarkGhost() {
  return (
    <svg viewBox="0 4 250 56" xmlns="http://www.w3.org/2000/svg" aria-hidden focusable="false">
      <path
        fill="currentColor"
        d="M158.42,56.79l-6.04-.02c-.27-.49-.23-1.06-.12-1.62.38-.06.66-.07.99-.28v-17.75s-21.23.02-21.23.02l-.08,16.68,1.47,3.05-7.45-.08,1.74-2.99V21.52s4.29,1.19,4.29,1.19l.02,12.99,21.21.04.05-10.26c0-1.19,1.68-.19,4.05-1.15l.05,30.62,1.17.18c.1.53.13.99-.11,1.65Z"
      />
      <path
        fill="currentColor"
        d="M105.6,56.84l-7.74.03,1.9-2.89v-31.12s-10.56-.01-10.56-.01c-.49.62-.74,1.18-1.5,1.69v-4.56s29.47-.01,29.47-.01v4.68s-1.62-1.81-1.62-1.81l-11.45.03-.02,31.14,1.51,2.83Z"
      />
      <path
        fill="currentColor"
        d="M201.86,28.83c-2.42-4.17-6.25-6.86-10.69-8.08-.11-.46.32-.76.76-.73,3.33.2,6.35,1.48,8.99,3.44,5.45,4.03,8.22,10.38,7.57,17.12-.7,7.32-5.44,13.35-12.42,15.82-7.75,2.74-16.61.64-22.25-5.39-2.43-2.6-3.81-5.7-4.44-9.13-1.84-10.03,4.23-19.57,14.13-22.04.35-.09.62.12.64.37.02.18-.03.59-.32.71-5.63,2.27-9.72,7.08-10.91,13.12-1.12,5.72.39,11.67,4.25,16.04,2.82,3.19,6.65,4.78,10.84,4.97,5.6.26,10.67-2.36,13.63-7.14,3.58-5.77,3.69-13.11.22-19.08Z"
      />
      <path
        fill="currentColor"
        d="M193.87,14.12c-1.91.92-3.82.77-5.49-.32l-2.51-1.63-2.25-.38c-.17-.03-.37-.17-.44-.29-.3-.5,1.86-1.82,3.92-.34,2.64,1.89,5.87,1.82,8.36-.28.3-.25.87-.25,1.19-.15.3.09.78.58.47,1.04-.72,1.11-2.02,1.75-3.26,2.35Z"
      />
      <circle fill="currentColor" cx="190.3" cy="8.8" r="1.92" />
      <path
        fill="currentColor"
        d="M228.68,40.59c4.67.07,8.49-3.01,9.48-7.58.83-3.82-.57-7.44-3.87-9.62-2.64-1.74-5.89-2.2-8.97-1.45v31.84s1.58,3.07,1.58,3.07h-7.73s2.03-3.01,2.03-3.01v-31.22s-1.8-2.37-1.8-2.37l7.09-.11c6.6-.1,13.44,1.03,15.58,7.88,1.8,5.74-1.52,11.75-7.27,13.59.76,1.53,1.74,2.52,2.67,3.74,3.35,4.37,7.2,7.97,11.85,11.46-2.9.72-5.71-.41-8-2.2-3.82-2.97-6.94-6.58-9.94-10.37l-2.7-3.67Z"
      />
      <path
        fill="currentColor"
        d="M34.02,56.81l-7.53.1,1.91-2.88.02-16.9H6.81s-.06,5.44-.06,5.44c-.04,3.85-.2,7.62.09,11.44l1.4,2.85-7.57.03,1.82-2.88.03-31.55-1.71-2.24h6.91c.18-.01.22.68.08.8-.17.14-.55.2-1,.27-.26,4.8-.06,9.59-.01,14.44h21.62s-.05-13.14-.05-13.14c0-.92-1.24-1.36-1.61-2.36l6.69-.02c.27,0,.34.46.27.64-.19.49-1.14.27-1.14,1.14v31.94s1.44,2.88,1.44,2.88Z"
      />
      <path
        fill="currentColor"
        d="M60.48,42.7c-1.66,1.17-3.14,2.4-4.45,3.86-2.22,2.49-4.31,4.96-5.83,7.97-.25.49.25,1.46-.39,1.95l-7.33.03c4.46-5.23,9.12-9.95,14.17-14.45,3.13-2.85,6.59-5.08,10.69-6.25l-4.81-11.14-7.62,16.23c-.48,1.12-1.34,1.91-2.54,2.29l11.78-27.51,12.11,26.46,4.05,8.94c.95,2.1,1.98,4,3.5,5.83-1.4.5-2.6.04-3.77-.63-4.1-2.36-6.15-8-7.93-12.44l3.54-.14c.63-.8-.24-2.15-1.26-2.32-4.69-.78-9.96-1.45-13.91,1.33Z"
      />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
      <path
        d="M12 19V5M12 5l-6 6M12 5l6 6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Entity graph for the footer. The @id matches the homepage organisation node,
 * so a crawler merges the two rather than seeing a second company: this adds
 * the profiles, logo and reservations channel that every page can assert.
 */
function FooterStructuredData() {
  const graph = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${SEO_SITE_ORIGIN}/#organization`,
    name: "Hathor Dahabiya",
    url: `${SEO_SITE_ORIGIN}/`,
    logo: seoAbsoluteUrl("/branding/hathor-logo-nile-cruise-favicon.webp"),
    email: PUBLIC_CONTACT.email,
    telephone: PUBLIC_CONTACT.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: "One Kattamiya, Tower 211, Floor 11, Flat 111, Ring Road",
      addressLocality: "Cairo",
      addressCountry: "EG",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "reservations",
      email: PUBLIC_CONTACT.email,
      telephone: PUBLIC_CONTACT.phone,
      availableLanguage: ["en", "ar"],
    },
    sameAs: PUBLIC_SOCIAL_LINKS.map((link) => link.href),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graph).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export function Footer() {
  const pathname = usePathname();
  const rootRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const year = new Date().getFullYear();

  /*
   * The footer is a sibling of <main>, so it stands on the site shell's ground
   * while the page above it stands on its own — and every route picks its own
   * paper (#ded4c6 on the homepage, #ece4da on About, …). Left alone that draws
   * a hard tonal line across the top edge of the footer.
   *
   * A stylesheet cannot read the page's colour, so this does: it takes the
   * ground the route actually painted and hands it to the footer as --hf-seam.
   * Re-read on navigation and on a theme flip; if the page paints nothing, the
   * footer stays transparent, which is seamless for a different reason.
   */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const opaque = (value: string) =>
      value && value !== "transparent" && !/rgba\(\s*0,\s*0,\s*0,\s*0\s*\)/.test(value);

    /*
     * Start at the last thing rendered inside <main> — that is what the footer's
     * top edge actually butts against — and walk back up to <main>, keeping the
     * OUTERMOST opaque background on the way. Outermost, not innermost: the
     * innermost is whatever panel the closing scene happens to use, while the
     * outermost is the route's own paper, which is the colour to match.
     */
    const readGround = () => {
      const main = root.previousElementSibling as HTMLElement | null;
      if (!main) return;

      const rendered = (el: Element): el is HTMLElement =>
        el instanceof HTMLElement &&
        !/^(STYLE|SCRIPT|LINK|TEMPLATE|NOSCRIPT|META)$/.test(el.tagName) &&
        getComputedStyle(el).display !== "none";

      let leaf: HTMLElement = main;
      for (let depth = 0; depth < 12; depth += 1) {
        const children = Array.from(leaf.children).filter(rendered);
        if (!children.length) break;
        leaf = children[children.length - 1];
      }

      let ground = "";
      for (
        let el: HTMLElement | null = leaf;
        el && el !== main.parentElement;
        el = el.parentElement
      ) {
        const bg = getComputedStyle(el).backgroundColor;
        if (opaque(bg)) ground = bg;
      }

      if (ground) root.style.setProperty("--hf-seam", ground);
      else root.style.removeProperty("--hf-seam");
    };

    readGround();
    /* The page's own stylesheet can land a frame late on a client navigation. */
    const frame = requestAnimationFrame(readGround);
    const settle = window.setTimeout(readGround, 400);
    const themeWatch = new MutationObserver(readGround);
    themeWatch.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-public-theme"],
    });

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      themeWatch.disconnect();
    };
  }, [pathname]);

  /* Reveal + lazy reel share one observer: both fire off the same approach. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    /*
     * Arm the pre-reveal state from here rather than in the stylesheet: the
     * footer must be readable when this effect never runs, and the observer
     * itself never delivers in a background tab.
     */
    if (!reduceMotion && typeof IntersectionObserver !== "undefined") {
      root.dataset.hfArmed = "true";
    }

    const video = videoRef.current;
    /* Data-saver and 2G visitors get the still ground, never the download. */
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    const lightweight =
      connection?.saveData === true ||
      /2g/.test(connection?.effectiveType ?? "");

    const startVideo = () => {
      if (!video || lightweight) return;
      if (!video.src) video.src = HATHOR_FOOTER_VIDEO_SRC;
      if (reduceMotion) {
        /* Hold the first frame: the river is present, nothing moves. */
        video.load();
        return;
      }
      void video.play().catch(() => {});
    };

    /*
     * The legal bar sits on open river, so it is set light — but only once
     * there is actually a river under it. Until the first frame paints (and
     * never, on a data-saver connection) it stays ink on the page's ground.
     */
    const onFirstFrame = () => root.classList.add("is-on-water");
    video?.addEventListener("loadeddata", onFirstFrame, { once: true });

    if (typeof IntersectionObserver === "undefined") {
      startVideo();
      return () => video?.removeEventListener("loadeddata", onFirstFrame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            root.classList.add("is-revealed");
            startVideo();
          } else if (video && !video.paused) {
            video.pause();
          }
        }
      },
      { rootMargin: "20% 0px 0px", threshold: 0 },
    );

    observer.observe(root);
    return () => {
      observer.disconnect();
      video?.removeEventListener("loadeddata", onFirstFrame);
      delete root.dataset.hfArmed;
    };
  }, []);

  /*
   * The shared controller drives Lenis where it runs and falls back to the
   * native scroller where it does not — calling window.scrollTo as well would
   * put two animations on the same axis.
   */
  const scrollToTop = () => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    try {
      ensurePublicScrollController().scrollTo(0, {
        immediate: reduceMotion,
        force: true,
      });
    } catch {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    }
  };

  return (
    <footer ref={rootRef} className="hf" role="contentinfo">
      <FooterStructuredData />

      <div className="hf__ghost" aria-hidden>
        <WordmarkGhost />
      </div>

      <div className="hf__media" aria-hidden>
        <video
          ref={videoRef}
          className="hf__video"
          muted
          loop
          playsInline
          preload="none"
          tabIndex={-1}
          disablePictureInPicture
          aria-hidden
        />
      </div>

      <div className="hf__inner">
        <div className="hf__lede">
          <div className="hf__reveal">
            <h2 className="hf__title">
              <span className="hf__title-line">YOUR NILE STORY</span>
              <span className="hf__title-line">BEGINS HERE</span>
            </h2>
            <p className="hf__script">Adventures the Nile</p>
          </div>

          {/*
            The reservations desk: the two actions, then the four facts a guest
            actually needs to reach a person. This is the only place on the site
            that carries them outside /contact — the homepage scene that used to
            repeat them directly above this footer is gone.
          */}
          <div
            className="hf__desk hf__reveal"
            style={{ "--hf-delay": "120ms" } as CSSProperties}
          >
            <p className="hf__eyebrow">Private Reservations</p>
            <div className="hf__actions">
              <BookNowTrigger className="hf__cta">Book Now</BookNowTrigger>
              <Link className="hf__cta hf__cta--line" href="/charter">
                <span>Charter the Boat</span>
              </Link>
            </div>

            <address className="hf__facts">
              <a className="hf__fact-link" href={`tel:${PUBLIC_CONTACT.phone}`}>
                {PUBLIC_CONTACT.phoneDisplay}
              </a>
              <a
                className="hf__fact-link"
                href={`mailto:${PUBLIC_CONTACT.email}`}
              >
                {PUBLIC_CONTACT.email}
              </a>
              <span className="hf__fact">{PUBLIC_CONTACT.address}</span>
              <span className="hf__fact">{PUBLIC_CONTACT.workingHours}</span>
            </address>
          </div>
        </div>

        <div
          className="hf__nav hf__reveal"
          style={{ "--hf-delay": "200ms" } as CSSProperties}
        >
          {NAV_COLUMNS.map((column) => (
            <nav
              key={column.id}
              className="hf__col"
              aria-labelledby={`hf-col-${column.id}`}
            >
              <h3 className="hf__col-title" id={`hf-col-${column.id}`}>
                {column.title}
              </h3>
              <ul className="hf__links">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link className="hf__link cursor-hover" href={link.href}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="hf__base">
          <p className="hf__legal">
            © {FOUNDED_YEAR}–{year} Hathor Dahabiya · Egypt
          </p>

          <nav className="hf__utility" aria-label="Legal and contact">
            {UTILITY_LINKS.map((link) => (
              <Link
                key={link.href}
                className="hf__base-link cursor-hover"
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="hf__top cursor-hover"
            onClick={scrollToTop}
            aria-label="Back to top of page"
          >
            <ArrowUpIcon />
          </button>
        </div>
      </div>
    </footer>
  );
}
