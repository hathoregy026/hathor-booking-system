"use client";

import { useState, type KeyboardEvent } from "react";
import styles from "./LuxuryAccordion.module.css";

export type LuxuryAccordionItem = {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  romanNumeral: string;
};

export type LuxuryAccordionProps = {
  title?: string;
  items?: LuxuryAccordionItem[];
};

const defaultItems: LuxuryAccordionItem[] = [
  {
    id: 1,
    name: "The Hathor Suite",
    description:
      "Our flagship suite with panoramic Nile views, private terrace, and exclusive butler service. 45 sqm of pure elegance.",
    imageUrl: "/images/suites/hathor-suite.jpg",
    romanNumeral: "I",
  },
  {
    id: 2,
    name: "Deluxe Cabin",
    description:
      "Spacious comfort with floor-to-ceiling windows, private balcony, and luxurious en-suite bathroom. 28 sqm.",
    imageUrl: "/images/suites/deluxe-cabin.jpg",
    romanNumeral: "II",
  },
  {
    id: 3,
    name: "Standard Cabin",
    description:
      "Elegant simplicity with Nile-facing windows, premium linens, and dedicated housekeeping. 22 sqm.",
    imageUrl: "/images/suites/standard-cabin.jpg",
    romanNumeral: "III",
  },
];

export default function LuxuryAccordion({
  title = "Our Suites",
  items = defaultItems,
}: LuxuryAccordionProps) {
  const [activeId, setActiveId] = useState<number | null>(null);

  const handleToggle = (id: number) => {
    setActiveId((current) => (current === id ? null : id));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>, id: number) => {
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
          {items.map((item) => {
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

                {/* eslint-disable-next-line @next/next/no-img-element -- isolated placeholder; swap for next/image when assets exist */}
                <img
                  className={styles.backgroundImage}
                  src={item.imageUrl}
                  alt=""
                  aria-hidden="true"
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
