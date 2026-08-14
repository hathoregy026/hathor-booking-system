"use client";

import Link from "next/link";
import { useRef, type CSSProperties } from "react";
import {
  useTypographyInlineStyle,
  useTypographySettings,
} from "@/components/public/TypographySettingsProvider";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useAmenitiesFixedMaskReveal } from "@/hooks/useAmenitiesFixedMaskReveal";
import { amenitiesWipeAngleForIndex } from "@/lib/fixed-mask-reveal";
import type { SiteImageName } from "@/lib/site-image-slots";
import { resolveVoyagePanelContent } from "@/lib/voyage-accordion-panels";
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

function familyAndColor(style: CSSProperties): CSSProperties {
  return { fontFamily: style.fontFamily, color: style.color };
}

export default function LuxuryAccordion({
  title,
  items = [],
  embedded = false,
}: LuxuryAccordionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { our_voyages_copy: voyagesCopy } = useTypographySettings();
  const titleStyle = useTypographyInlineStyle("our_voyages_title");
  const indicationStyle = useTypographyInlineStyle("our_voyages_indication");
  const nameStyle = useTypographyInlineStyle("our_voyages_main_hover");
  const metaStyle = useTypographyInlineStyle("our_voyages_indication_hover");
  const bodyStyle = useTypographyInlineStyle("our_voyages_body_hover");

  const sectionTitle = (title ?? voyagesCopy.title).trim() || "Our Voyages";
  const indication = voyagesCopy.indication.trim();

  useAmenitiesFixedMaskReveal(sectionRef, items.length);

  if (items.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className={`${styles.section} ${embedded ? styles.embedded : ""} ex-content-section`}
      aria-label={sectionTitle}
      data-hathor-voyages
      data-amenities-mask-id="home-voyages-mask"
      data-amenities-start-open="true"
      style={{ "--voyage-runway": `${(items.length + 1) * 100}svh` } as CSSProperties}
    >
      <div className={styles.sticky}>
        <div className={styles.stage}>
          <div className={styles.images} data-amenities-images-col aria-hidden="true">
            {items.map((item, index) => (
              <div
                key={`${item.id}-image`}
                className={styles.panel}
                data-amenities-panel
                data-amenities-wipe={amenitiesWipeAngleForIndex(index)}
                aria-hidden={index === 0 ? "false" : "true"}
              >
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
            ))}
          </div>

          <div className={styles.photoWash} aria-hidden="true" />
          <span className={styles.horizon} aria-hidden="true" />

          <div className={styles.captionColumn} data-amenities-caption-col>
            <div className={styles.captionStack}>
              {items.map((item, index) => {
        const panel = resolveVoyagePanelContent({
          slug: item.slug ?? "",
          name: item.name,
          description: item.description,
          href: item.href,
        });
        const isFirst = index === 0;

        return (
              <article
                key={item.id}
                className={styles.caption}
                data-amenities-caption
                aria-hidden={index === 0 ? "false" : "true"}
              >
              <div className={styles.chapterNumber} aria-label={`Voyage ${index + 1} of ${items.length}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span className={styles.chapterNumberTotal}>/ {String(items.length).padStart(2, "0")}</span>
              </div>

              <div className={styles.copy}>
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
              </article>
                );
              })}
            </div>
            <div className={styles.scrollbar} aria-hidden="true">
              <span className={styles.scrollbarProgress} data-amenities-progress />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
