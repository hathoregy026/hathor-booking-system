"use client";

import { useState } from "react";
import { ManagedImage } from "@/components/ui/ManagedImage";

export type HighlightsIndexItem = {
  id: string;
  title: string;
  descriptor: string;
  imageSlot: string;
  imageAlt: string;
};

type Props = {
  items: HighlightsIndexItem[];
};

export function HighlightsChapterIndex({ items }: Props) {
  const [active, setActive] = useState(0);
  const current = items[active] ?? items[0];
  if (!current) return null;

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="lux-section" aria-labelledby="hl-index-heading">
      <div className="lux-shell lux-grid">
        <div className="hl-lux-index__list">
          <p className="lux-kicker">CONTENTS</p>
          <h2 id="hl-index-heading" className="lux-editorialTitle" style={{ marginBottom: "2rem" }}>
            <span className="lux-lineMask">
              <span data-lux-line="">Chapters of</span>
            </span>
            <span className="lux-lineMask">
              <span data-lux-line="">the voyage</span>
            </span>
          </h2>

          <div role="list">
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                role="listitem"
                className="hl-lux-index__row"
                data-active={index === active ? "true" : "false"}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onClick={() => {
                  setActive(index);
                  scrollTo(item.id);
                }}
              >
                <span className="lux-kicker">{String(index + 1).padStart(2, "0")}</span>
                <p className="hl-lux-index__title">{item.title}</p>
                <span className="hl-lux-index__line" aria-hidden="true" />
                <span className="lux-kicker" style={{ gridColumn: "1 / -1", opacity: 0.65 }}>
                  {item.descriptor}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="hl-lux-index__mediaCol">
          <div className="hl-lux-index__preview lux-mediaFrame">
            <ManagedImage
              key={current.imageSlot}
              name={current.imageSlot}
              alt={current.imageAlt}
              fill
              sizes="(max-width: 1024px) 0px, 40vw"
              className="object-cover"
              previewAnchor={false}
            />
          </div>
        </div>

        <div className="hl-lux-index__rail" aria-label="Chapter index">
          {items.map((item) => (
            <a key={item.id} href={`#${item.id}`}>
              <div className="hl-lux-index__railThumb lux-mediaFrame">
                <ManagedImage
                  name={item.imageSlot}
                  alt={item.imageAlt}
                  fill
                  sizes="70vw"
                  className="object-cover"
                  previewAnchor={false}
                />
              </div>
              <p className="hl-lux-index__title" style={{ fontSize: "1.35rem" }}>
                {item.title}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
