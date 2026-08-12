"use client";

import Link from "next/link";
import { useEffect, useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  useTypographyInlineStyle,
  useTypographySettings,
} from "@/components/public/TypographySettingsProvider";
import { ManagedImage } from "@/components/ui/ManagedImage";
import type { SiteImageName } from "@/lib/site-image-slots";
import { resolveVoyagePanelContent } from "@/lib/voyage-accordion-panels";
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
  embedded?: boolean;
};

function familyAndColor(style: CSSProperties): CSSProperties {
  return { fontFamily: style.fontFamily, color: style.color };
}

export default function LuxuryAccordion({
  title,
  items = [],
  embedded = false,
}: LuxuryAccordionProps) {
  const rootRef = useRef<HTMLElement>(null);
  const { our_voyages_copy: voyagesCopy } = useTypographySettings();
  const titleStyle = useTypographyInlineStyle("our_voyages_title");
  const indicationStyle = useTypographyInlineStyle("our_voyages_indication");
  const nameStyle = useTypographyInlineStyle("our_voyages_main_hover");
  const metaStyle = useTypographyInlineStyle("our_voyages_indication_hover");
  const bodyStyle = useTypographyInlineStyle("our_voyages_body_hover");

  const sectionTitle = (title ?? voyagesCopy.title).trim() || "Our Voyages";
  const indication = voyagesCopy.indication.trim();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || items.length === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const chapters = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll("[data-voyage-chapter]"),
    );
    if (reduced) {
      chapters.forEach((chapter) => chapter.style.setProperty("--voyage-progress", "0.5"));
      return;
    }

    const triggers = chapters.map((chapter) => {
      const frame = chapter.querySelector<HTMLElement>("[data-voyage-frame]");
      const media = chapter.querySelector<HTMLElement>("[data-voyage-media]");
      const veil = chapter.querySelector<HTMLElement>("[data-voyage-veil]");
      const copy = chapter.querySelector<HTMLElement>("[data-voyage-copy]");

      const timeline = gsap.timeline({ paused: true });
      if (media) {
        timeline.fromTo(
          media,
          { scale: 1.075, yPercent: 3.5 },
          { scale: 1.015, yPercent: -2.5, ease: "none", duration: 1 },
          0,
        );
      }
      if (veil) {
        timeline.fromTo(
          veil,
          { xPercent: -7, opacity: 0.72 },
          { xPercent: 2, opacity: 1, ease: "none", duration: 0.72 },
          0.05,
        );
      }
      if (copy) {
        timeline.fromTo(
          copy,
          { autoAlpha: 0, y: 54 },
          { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.2 },
          0.14,
        );
        timeline.to(
          copy,
          { autoAlpha: 0.28, y: -38, ease: "power1.in", duration: 0.18 },
          0.82,
        );
      }

      return ScrollTrigger.create({
        trigger: chapter,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.7,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          timeline.progress(self.progress);
          frame?.style.setProperty("--voyage-progress", String(self.progress));
        },
      });
    });

    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 160);
    return () => {
      window.clearTimeout(refresh);
      triggers.forEach((trigger) => trigger.kill());
    };
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <section
      ref={rootRef}
      className={`${styles.section} ${embedded ? styles.embedded : ""} ex-content-section`}
      aria-label={sectionTitle}
      data-hathor-voyages
    >
      {items.map((item, index) => {
        const panel = resolveVoyagePanelContent({
          slug: item.slug ?? "",
          name: item.name,
          description: item.description,
          href: item.href,
        });
        const isFirst = index === 0;
        const isLast = index === items.length - 1;

        return (
          <article
            key={item.id}
            className={`${styles.chapter} ${isFirst ? styles.firstChapter : ""} ${isLast ? styles.lastChapter : ""}`}
            data-voyage-chapter
          >
            <div className={styles.frame} data-voyage-frame>
              <div className={styles.media} data-voyage-media aria-hidden="true">
                <ManagedImage
                  name={item.imageName}
                  alt=""
                  fill
                  sizes="100vw"
                  loading={index < 2 ? "eager" : "lazy"}
                  className={styles.backgroundImage}
                  previewAnchor
                />
              </div>
              <div className={styles.photoWash} aria-hidden="true" />
              <div className={styles.veil} data-voyage-veil aria-hidden="true" />
              <div className={styles.filmGrain} aria-hidden="true" />
              <span className={styles.horizon} aria-hidden="true" />

              <div className={styles.romanWrap} aria-hidden="true">
                <span className={styles.roman}>{item.romanNumeral}</span>
              </div>

              <div className={styles.copy} data-voyage-copy>
                {isFirst ? (
                  <header className={styles.sectionHeading}>
                    <p
                      className={`${styles.sectionTitle} typo-our-voyages-title`}
                      style={familyAndColor(titleStyle)}
                    >
                      {sectionTitle}
                    </p>
                    {indication ? (
                      <p
                        className={`${styles.sectionIndication} typo-our-voyages-indication`}
                        style={familyAndColor(indicationStyle)}
                      >
                        {indication}
                      </p>
                    ) : null}
                  </header>
                ) : null}

                <h2
                  className={`${styles.name} typo-our-voyages-main-hover`}
                  style={familyAndColor(nameStyle)}
                >
                  {item.name}
                </h2>
                {item.meta?.trim() ? (
                  <p
                    className={`${styles.meta} typo-our-voyages-indication-hover`}
                    style={familyAndColor(metaStyle)}
                  >
                    {item.meta}
                  </p>
                ) : null}
                <p
                  className={`${styles.summary} typo-our-voyages-body-hover`}
                  style={familyAndColor(bodyStyle)}
                >
                  {panel.summary || item.description}
                </p>
                <Link href={panel.detailsHref} className={styles.cta}>
                  <span>{item.ctaLabel || panel.detailsLabel}</span>
                  <span className={styles.ctaArrow} aria-hidden="true">→</span>
                </Link>
              </div>

              <div className={styles.progress} aria-hidden="true">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span className={styles.progressLine} />
                <span>{String(items.length).padStart(2, "0")}</span>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
