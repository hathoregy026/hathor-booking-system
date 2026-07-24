"use client";

import Link from "next/link";
import { useState, type KeyboardEvent, type MouseEvent } from "react";
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
  title?: string;
  items?: LuxuryAccordionItem[];
};

export default function LuxuryAccordion({
  title = "Our Voyages",
  items = [],
}: LuxuryAccordionProps) {
  const list = items;
  const [activeId, setActiveId] = useState<string | null>(null);

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
    }
  };

  const stopRowClick = (event: MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <section
      className={styles.section}
      data-hathor-accordion
      aria-label={title}
    >
      <div className={styles.container}>
        <h2 className={styles.title}>{title}</h2>
        <ul className={styles.accordionList}>
          {list.map((item) => {
            const isActive = activeId === item.id;
            const href = item.href ?? "/cruises";
            const ctaLabel = item.ctaLabel ?? "Check Voyages";

            return (
              <li
                key={item.id}
                className={`${styles.accordionItem} ${isActive ? styles.isActive : ""}`}
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
                  <h3 className={styles.name}>{item.name}</h3>
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
                    <p className={styles.meta}>{item.meta}</p>
                  ) : null}
                  <p className={styles.description}>{item.description}</p>
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
