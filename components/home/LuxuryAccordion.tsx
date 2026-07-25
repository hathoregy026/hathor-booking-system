"use client";

import Link from "next/link";
import { useState, type KeyboardEvent, type MouseEvent } from "react";
import {
  useTypographyInlineStyle,
  useTypographySettings,
} from "@/components/public/TypographySettingsProvider";
import { ManagedImage } from "@/components/ui/ManagedImage";
import type { SiteImageName } from "@/lib/site-image-slots";
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

  if (list.length === 0) {
    return null;
  }

  const openItem = (id: string) => setActiveId(id);
  const closeItem = () => setActiveId(null);

  const handleToggle = (id: string) => {
    setActiveId((current) => (current === id ? null : id));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>, id: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleToggle(id);
    }
  };

  const stopRowClick = (event: MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <section
      className={`${styles.section} ex-content-section`}
      data-hathor-accordion
      aria-label={sectionTitle}
    >
      <div className={styles.container}>
        <header className={styles.heading}>
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

            return (
              <li
                key={item.id}
                className={`${styles.accordionItem} ${isActive ? styles.isActive : ""}`}
                onMouseEnter={() => openItem(item.id)}
                onMouseLeave={closeItem}
                onFocus={() => openItem(item.id)}
                onClick={() => handleToggle(item.id)}
                onKeyDown={(event) => handleKeyDown(event, item.id)}
                role="button"
                tabIndex={0}
                aria-expanded={isActive}
                aria-controls={`hathor-accordion-panel-${item.id}`}
              >
                <span className={styles.romanNumeral} aria-hidden="true">
                  {item.romanNumeral}
                </span>

                <ManagedImage
                  name={item.imageName}
                  alt=""
                  fill
                  sizes="100vw"
                  className={styles.backgroundImage}
                  previewAnchor
                />

                <div className={styles.vignette} aria-hidden="true" />

                <div className={styles.row}>
                  <h3
                    className={`${styles.name} ${isActive ? "typo-our-voyages-main-hover" : "typo-our-voyages-main"}`}
                    style={isActive ? nameHoverStyle : nameStyle}
                  >
                    {item.name}
                  </h3>
                  <span className={styles.icon} aria-hidden="true">
                    +
                  </span>
                </div>

                <div
                  id={`hathor-accordion-panel-${item.id}`}
                  className={styles.body}
                  role="region"
                  aria-hidden={!isActive}
                >
                  {item.meta ? (
                    <p
                      className={`${styles.meta} typo-our-voyages-indication-hover`}
                      style={metaHoverStyle}
                    >
                      {item.meta}
                    </p>
                  ) : null}
                  <p
                    className={`${styles.description} typo-our-voyages-body-hover`}
                    style={bodyHoverStyle}
                  >
                    {item.description}
                  </p>
                  <Link
                    href={href}
                    className={`btn btn-dark ${styles.cta}`}
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
