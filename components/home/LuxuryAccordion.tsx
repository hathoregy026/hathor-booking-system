"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  useTypographyInlineStyle,
  useTypographySettings,
} from "@/components/public/TypographySettingsProvider";
import { ManagedImage } from "@/components/ui/ManagedImage";
import type { SiteImageName } from "@/lib/site-image-slots";
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
};

export type LuxuryAccordionProps = {
  /** Optional override; defaults to Typography → Our Voyages title copy */
  title?: string;
  items?: LuxuryAccordionItem[];
};

export default function LuxuryAccordion({
  title,
  items = [],
}: LuxuryAccordionProps) {
  const list = items;
  const rootRef = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { our_voyages_copy: voyagesCopy } = useTypographySettings();
  const titleStyle = useTypographyInlineStyle("our_voyages_title");
  const indicationStyle = useTypographyInlineStyle("our_voyages_indication");
  const nameStyle = useTypographyInlineStyle("our_voyages_main");
  const nameHoverStyle = useTypographyInlineStyle("our_voyages_main_hover");
  const metaHoverStyle = useTypographyInlineStyle(
    "our_voyages_indication_hover",
  );
  const bodyHoverStyle = useTypographyInlineStyle("our_voyages_body_hover");

  const sectionTitle = (title ?? voyagesCopy.title).trim() || "Our Voyages";
  const indication = voyagesCopy.indication.trim();

  /*
   * Dedicated scrubbed reveal — each column gets its own scroll beat.
   * (Stack-exit timeline packed them into one short release, so they popped together.)
   */
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
        /* Clear sequential slots so scrub reveals one row at a time */
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

  if (list.length === 0) {
    return null;
  }

  const handleToggle = (id: string) => {
    setActiveId((current) => (current === id ? null : id));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>, id: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleToggle(id);
      return;
    }
    if (event.key === "Escape" && activeId === id) {
      event.preventDefault();
      setActiveId(null);
    }
  };

  const stopRowClick = (event: MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <section
      ref={rootRef}
      className={`${styles.section} ex-content-section`}
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
            const href = item.href ?? "/cruises";
            const ctaLabel = item.ctaLabel ?? "Check Voyages";
            const meta = item.meta?.trim() ?? "";

            return (
              <li
                key={item.id}
                data-voyage-row
                className={`${styles.accordionItem} ${isActive ? styles.isActive : ""}`}
                onClick={() => handleToggle(item.id)}
                onKeyDown={(event) => handleKeyDown(event, item.id)}
                role="button"
                tabIndex={0}
                aria-expanded={isActive}
                aria-controls={`hathor-accordion-panel-${item.id}`}
                aria-label={
                  isActive
                    ? `${item.name}, expanded. Click to close.`
                    : `${item.name}. Click to view details.`
                }
              >
                <span className={styles.flare} aria-hidden="true" />

                <span
                  className={`${styles.romanNumeral} ${isActive ? styles.romanNumeralHidden : ""}`}
                  aria-hidden="true"
                >
                  {item.romanNumeral}
                </span>

                <ManagedImage
                  name={item.imageName}
                  alt=""
                  fill
                  sizes="100vw"
                  unoptimized={false}
                  className={styles.backgroundImage}
                  previewAnchor
                />

                <div className={styles.vignette} aria-hidden="true" />

                <div className={styles.row}>
                  <span className={styles.divider} aria-hidden="true" />
                  <div className={styles.copy}>
                    <h3
                      className={`${styles.name} ${isActive ? "typo-our-voyages-main-hover" : "typo-our-voyages-main"}`}
                      style={isActive ? nameHoverStyle : nameStyle}
                    >
                      {item.name}
                    </h3>
                    {meta ? (
                      <p
                        className={`${styles.rowMeta} ${isActive ? styles.rowMetaHidden : ""}`}
                      >
                        {meta}
                      </p>
                    ) : null}
                  </div>
                  <span className={styles.icon} aria-hidden="true">
                    <span className={styles.iconMark}>+</span>
                  </span>
                </div>

                <div
                  id={`hathor-accordion-panel-${item.id}`}
                  className={styles.body}
                  role="region"
                  aria-hidden={!isActive}
                >
                  <div className={styles.bodyCopy}>
                    <p
                      className={`${styles.meta} typo-our-voyages-indication-hover`}
                      style={metaHoverStyle}
                    >
                      {meta || "\u00A0"}
                    </p>
                    <p
                      className={`${styles.description} typo-our-voyages-body-hover`}
                      style={bodyHoverStyle}
                    >
                      {item.description}
                    </p>
                  </div>
                  <Link
                    href={href}
                    className={`btn ${styles.cta}`}
                    onClick={stopRowClick}
                  >
                    {ctaLabel}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
