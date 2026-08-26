"use client";

import Link from "next/link";
import {
  useTypographyInlineStyle,
  useTypographySettings,
} from "@/components/public/TypographySettingsProvider";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { ManagedImage } from "@/components/ui/ManagedImage";
import type { SiteImageName } from "@/lib/site-image-slots";
import { resolveVoyagePanelContent } from "@/lib/voyage-accordion-panels";
import { resolveVoyagesItineraryCms } from "@/lib/voyages-page-content";
import { resolveCmsText } from "@/lib/website-text-shared";
import styles from "./LuxuryAccordion.module.css";

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

export default function LuxuryAccordion({
  title,
  items = [],
  embedded = false,
}: LuxuryAccordionProps) {
  const { our_voyages_copy: voyagesCopy } = useTypographySettings();
  const { pages } = useWebsiteText();
  const titleStyle = useTypographyInlineStyle("our_voyages_title");
  const indicationStyle = useTypographyInlineStyle("our_voyages_indication");
  const nameStyle = useTypographyInlineStyle("our_voyages_main_hover");
  const metaStyle = useTypographyInlineStyle("our_voyages_indication_hover");
  const bodyStyle = useTypographyInlineStyle("our_voyages_body_hover");

  const sectionTitle = (title ?? voyagesCopy.title).trim() || "Our Voyages";
  const indication = voyagesCopy.indication.trim();

  if (items.length === 0) return null;

  return (
    <section
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
        const cms = resolveVoyagesItineraryCms(
          pages.voyages.itineraries,
          item.slug ?? "",
          index,
        );
        const summary = resolveCmsText(
          cms.body,
          panel.summary || item.description,
        );
        const ctaLabel = resolveCmsText(
          cms.cta,
          item.ctaLabel || panel.detailsLabel,
        );
        const isFirst = index === 0;
        const isLast = index === items.length - 1;

        return (
          <article
            key={item.id}
            className={`${styles.chapter} ${isFirst ? styles.firstChapter : ""} ${isLast ? styles.lastChapter : ""}`}
          >
            <div className={styles.frame}>
              <div className={styles.media} aria-hidden="true">
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
              <div className={styles.veil} aria-hidden="true" />
              <span className={styles.horizon} aria-hidden="true" />

              <div className={styles.chapterNumber} aria-label={`Voyage ${index + 1} of ${items.length}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span className={styles.chapterNumberTotal}>/ {String(items.length).padStart(2, "0")}</span>
              </div>

              <div className={styles.copy}>
                {isFirst ? (
                  <header className={styles.sectionHeading}>
                    <p
                      className={`${styles.sectionTitle} typo-our-voyages-title`}
                      style={titleStyle}
                    >
                      {sectionTitle}
                    </p>
                    {indication ? (
                      <p
                        className={`${styles.sectionIndication} typo-our-voyages-indication`}
                        style={indicationStyle}
                      >
                        {indication}
                      </p>
                    ) : null}
                  </header>
                ) : null}

                <h2
                  className={`${styles.name} typo-our-voyages-main-hover`}
                  style={nameStyle}
                >
                  {item.name}
                </h2>
                {item.meta?.trim() ? (
                  <p
                    className={`${styles.meta} typo-our-voyages-indication-hover`}
                    style={metaStyle}
                  >
                    {item.meta}
                  </p>
                ) : null}
                <p
                  className={`${styles.summary} typo-our-voyages-body-hover`}
                  style={bodyStyle}
                >
                  {summary}
                </p>
                <Link href={panel.detailsHref} className={styles.cta}>
                  <span>{ctaLabel}</span>
                  <span className={styles.ctaArrow} aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
