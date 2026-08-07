"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useBookNowModal } from "@/components/booking/BookingModalProvider";
import {
  useTypographyInlineStyle,
  useTypographySettings,
} from "@/components/public/TypographySettingsProvider";
import { ManagedImage } from "@/components/ui/ManagedImage";
import type { SiteImageName } from "@/lib/site-image-slots";
import {
  formatVoyageFromPrice,
  resolveVoyagePanelContent,
  type VoyageFeatureId,
} from "@/lib/voyage-accordion-panels";
import styles from "./LuxuryAccordion.module.css";

gsap.registerPlugin(ScrollTrigger);

export type LuxuryAccordionItem = {
  id: string;
  name: string;
  description: string;
  imageName: SiteImageName;
  romanNumeral: string;
  meta?: string;
  href?: string;
  ctaLabel?: string;
  slug?: string;
  basePriceCents?: number;
};

export type LuxuryAccordionProps = {
  title?: string;
  items?: LuxuryAccordionItem[];
  /** Render inside home-am-voyages sticky stage (Springs i-nature) */
  embedded?: boolean;
};

/** CMS family/color only — CSS owns closed-row scale. */
function pickTypeColorFamily(style: CSSProperties): CSSProperties {
  return {
    fontFamily: style.fontFamily,
    color: style.color,
  };
}

function FeatureIcon({ id }: { id: VoyageFeatureId }) {
  const common = {
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.25,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (id) {
    case "inclusive":
      /* Lotus / all-inclusive mark */
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <path
            {...common}
            d="M20 30c-4.5-3.2-7.5-7.2-7.5-11.2C12.5 13.5 16 10 20 10s7.5 3.5 7.5 8.8C27.5 22.8 24.5 26.8 20 30Z"
          />
          <path {...common} d="M20 10v20" />
          <path {...common} d="M13.2 16.5h13.6M14.5 21.5h11" />
        </svg>
      );
    case "excursions":
      /* Compass / private shore */
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <circle {...common} cx="20" cy="20" r="10" />
          <circle {...common} cx="20" cy="20" r="2" />
          <path {...common} d="M20 10v3.5M20 26.5V30M10 20h3.5M26.5 20H30" />
          <path {...common} d="M20 20 24.8 13.8M20 20 15.2 26.2" />
        </svg>
      );
    case "dining":
      /* Cloche / dining */
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <path {...common} d="M11 24h18" />
          <path {...common} d="M12 24c0-6.2 3.5-10 8-10s8 3.8 8 10" />
          <path {...common} d="M20 14V11.5" />
          <circle {...common} cx="20" cy="10.2" r="1.1" />
          <path {...common} d="M13 27.5h14" />
        </svg>
      );
    case "butler":
      /* Ankh-inspired service mark */
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <circle {...common} cx="20" cy="12.5" r="4.2" />
          <path {...common} d="M20 16.8V30" />
          <path {...common} d="M14.5 21.5h11" />
        </svg>
      );
    default:
      return null;
  }
}

function WatchPlayIcon() {
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true" className={styles.watchPlayIcon}>
      <circle
        cx="14"
        cy="14"
        r="12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path d="M11.5 9.5v9l8-4.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function LuxuryAccordion({
  title,
  items = [],
  embedded = false,
}: LuxuryAccordionProps) {
  const list = items;
  const rootRef = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { openBooking } = useBookNowModal();
  const { our_voyages_copy: voyagesCopy } = useTypographySettings();
  const titleStyle = useTypographyInlineStyle("our_voyages_title");
  const indicationStyle = useTypographyInlineStyle("our_voyages_indication");
  const nameStyle = useTypographyInlineStyle("our_voyages_main");
  const bodyStyle = useTypographyInlineStyle("body_text");

  const sectionTitle = (title ?? voyagesCopy.title).trim() || "Our Voyages";
  const indication = voyagesCopy.indication.trim();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || list.length === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const heading = root.querySelector<HTMLElement>("[data-voyage-heading]");
    const rows = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll("[data-voyage-row]"),
    );
    if (!rows.length) return;

    if (reduced) {
      gsap.set([heading, ...rows].filter(Boolean), { autoAlpha: 1, y: 0 });
      root.classList.add("is-voyages-revealed");
      return;
    }

    gsap.set([heading, ...rows].filter(Boolean), { autoAlpha: 0, y: 56 });
    root.classList.add("is-voyages-motion");

    const beat = 1;
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        id: "hathor-voyages-stagger",
        trigger: root,
        start: "top 82%",
        end: () => `+=${Math.max(520, (rows.length + 1) * 160)}`,
        scrub: 0.65,
        invalidateOnRefresh: true,
      },
    });

    if (heading) {
      tl.fromTo(
        heading,
        { autoAlpha: 0, y: 40 },
        { autoAlpha: 1, y: 0, duration: beat },
        0,
      );
    }

    rows.forEach((row, index) => {
      tl.fromTo(
        row,
        { autoAlpha: 0, y: 64 },
        { autoAlpha: 1, y: 0, duration: beat },
        (heading ? beat * 0.85 : 0) + index * (beat * 1.05),
      );
    });

    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 120);

    return () => {
      window.clearTimeout(refresh);
      tl.scrollTrigger?.kill();
      tl.kill();
      root.classList.remove("is-voyages-motion");
    };
  }, [list.length]);

  useEffect(() => {
    if (!activeId) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setActiveId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeId]);

  useEffect(() => {
    if (!activeId) return;
    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 420);
    return () => window.clearTimeout(refresh);
  }, [activeId]);

  if (list.length === 0) {
    return null;
  }

  const handleOpen = (id: string) => setActiveId(id);
  const handleClose = () => setActiveId(null);

  const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>, id: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (activeId === id) handleClose();
      else handleOpen(id);
    }
  };

  const stopRowClick = (event: MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <section
      ref={rootRef}
      className={`${styles.section} ${embedded ? styles.embedded : ""} ex-content-section`}
      data-hathor-accordion
      aria-label={sectionTitle}
    >
      <div className={styles.container}>
        <header className={styles.heading} data-voyage-heading>
          <h2
            className={`${styles.title} typo-our-voyages-title`}
            style={titleStyle}
          >
            {sectionTitle}
          </h2>
          {indication ? (
            <p
              className={`${styles.indication} typo-our-voyages-indication`}
              style={indicationStyle}
            >
              {indication}
            </p>
          ) : null}
        </header>
        <ul className={styles.accordionList}>
          {list.map((item) => {
            const isActive = activeId === item.id;
            const meta = item.meta?.trim() ?? "";
            const panel = resolveVoyagePanelContent({
              slug: item.slug ?? "",
              name: item.name,
              description: item.description,
              href: item.href,
            });
            const priceLabel =
              typeof item.basePriceCents === "number"
                ? formatVoyageFromPrice(item.basePriceCents)
                : null;

            return (
              <li
                key={item.id}
                data-voyage-row
                className={`${styles.accordionItem} ${isActive ? styles.isActive : ""}`}
                onClick={() => {
                  if (!isActive) handleOpen(item.id);
                }}
                onKeyDown={(event) => handleKeyDown(event, item.id)}
                role={isActive ? undefined : "button"}
                tabIndex={isActive ? -1 : 0}
                aria-expanded={isActive}
                aria-controls={`hathor-accordion-panel-${item.id}`}
                aria-label={
                  isActive ? undefined : `${item.name}. Click to view details.`
                }
              >
                <span className={styles.flare} aria-hidden="true" />

                <span
                  className={`${styles.romanNumeral} ${isActive ? styles.romanNumeralHidden : ""}`}
                  aria-hidden="true"
                >
                  {item.romanNumeral}
                </span>

                {/* Opacity lives on the shell so Next/Image fill inline styles
                    cannot pin the photo at opacity 0 or a 1px clipped strip. */}
                <div className={styles.media} aria-hidden="true">
                  <ManagedImage
                    name={item.imageName}
                    alt=""
                    fill
                    sizes="100vw"
                    loading="eager"
                    unoptimized={false}
                    className={styles.backgroundImage}
                    previewAnchor
                  />
                </div>

                <div className={styles.vignette} aria-hidden="true" />

                <div
                  className={`${styles.row} ${isActive ? styles.rowHidden : ""}`}
                  onClick={() => {
                    if (!isActive) handleOpen(item.id);
                  }}
                >
                  <span className={styles.divider} aria-hidden="true" />
                  <div className={styles.copy}>
                    <h3
                      className={`${styles.name} typo-our-voyages-main`}
                      style={pickTypeColorFamily(nameStyle)}
                    >
                      {item.name}
                    </h3>
                    {meta ? (
                      <p
                        className={styles.rowMeta}
                        style={{ color: bodyStyle.color }}
                      >
                        {meta}
                      </p>
                    ) : null}
                  </div>
                  <span className={styles.icon} aria-hidden="true">
                    <span className={styles.iconMark}>+</span>
                  </span>
                </div>

                {/* Full open design — rail + copy + features + CTAs + highlights card */}
                <div
                  id={`hathor-accordion-panel-${item.id}`}
                  className={styles.panel}
                  role="region"
                  aria-hidden={!isActive}
                  onClick={stopRowClick}
                >
                  <aside className={styles.rail} aria-hidden="true">
                    <div className={styles.railBottom}>
                      <p className={styles.railQuoteText}>{panel.railQuote}</p>
                      <span className={styles.railLotus} aria-hidden="true">
                        ✦
                      </span>
                    </div>
                  </aside>

                  <div className={styles.stage}>
                    <button
                      type="button"
                      className={styles.close}
                      onClick={handleClose}
                      aria-label={`Close ${item.name}`}
                    >
                      <span aria-hidden="true">×</span>
                    </button>

                    <div className={styles.stageMain}>
                      <p className={styles.duration}>{panel.durationLabel}</p>
                      <h3 className={styles.routeTitle}>{panel.routeTitle}</h3>
                      <span className={styles.diamondRule} aria-hidden="true" />
                      <p className={styles.summary}>{panel.summary}</p>

                      <ul className={styles.features}>
                        {panel.features.map((feature) => (
                          <li key={feature.id} className={styles.feature}>
                            <span className={styles.featureIcon}>
                              <FeatureIcon id={feature.id} />
                            </span>
                            <span className={styles.featureLabel}>
                              {feature.label}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <div className={styles.actions}>
                        <Link
                          href={panel.detailsHref}
                          className={`btn btn-dark ${styles.detailsCta}`}
                          onClick={stopRowClick}
                        >
                          {panel.detailsLabel}
                        </Link>
                        <a
                          href={panel.watchHref}
                          className={styles.watchCta}
                          onClick={stopRowClick}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <WatchPlayIcon />
                          {panel.watchLabel}
                        </a>
                      </div>
                    </div>

                    <aside className={styles.infoCard}>
                      {priceLabel ? (
                        <p className={styles.price}>
                          <span className={styles.priceFrom}>FROM</span>
                          <span className={styles.priceValue}>{priceLabel}</span>
                          <span className={styles.priceCaption}>
                            {panel.priceCaption}
                          </span>
                        </p>
                      ) : null}

                      <h4 className={styles.highlightsTitle}>
                        Journey Highlights
                      </h4>
                      <ul className={styles.highlights}>
                        {panel.highlights.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>

                      <button
                        type="button"
                        className={`btn btn-dark ${styles.enquireCta}`}
                        onClick={(event) => {
                          stopRowClick(event);
                          openBooking();
                        }}
                      >
                        {panel.enquireLabel}
                      </button>
                    </aside>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
