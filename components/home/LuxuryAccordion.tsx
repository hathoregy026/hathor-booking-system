"use client";

import { useState, type KeyboardEvent } from "react";
import styles from "./LuxuryAccordion.module.css";

export type LuxuryAccordionItem = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  romanNumeral: string;
  meta?: string;
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
  const [activeId, setActiveId] = useState<string | null>(
    () => list[0]?.id ?? null,
  );

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

                {/* eslint-disable-next-line @next/next/no-img-element -- CMS cruise imageUrl from Admin → Cruises */}
                <img
                  className={styles.backgroundImage}
                  src={item.imageUrl}
                  alt=""
                  aria-hidden="true"
                />

                <div className={styles.vignette} aria-hidden="true" />

                <div className={styles.collapsedLabel} aria-hidden={isActive}>
                  <h3 className={styles.collapsedName}>{item.name}</h3>
                </div>

                <div
                  id={`hathor-accordion-panel-${item.id}`}
                  className={styles.expandedContent}
                  role="region"
                  aria-hidden={!isActive}
                >
                  <div className={styles.row}>
                    <h3 className={styles.name}>{item.name}</h3>
                    <span className={styles.icon} aria-hidden="true">
                      +
                    </span>
                  </div>
                  {item.meta ? (
                    <p className={styles.meta}>{item.meta}</p>
                  ) : null}
                  <p className={styles.description}>{item.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
