"use client";

import { useState } from "react";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { LuxuryMedia } from "@/components/public/luxury-editorial/LuxuryMedia";

export type OccasionItem = {
  id: string;
  title: string;
  body: string;
  imageSlot: string;
  imageAlt: string;
};

type Props = {
  items: OccasionItem[];
};

export function CharterOccasions({ items }: Props) {
  const [active, setActive] = useState(0);
  const current = items[active];
  if (!current) return null;

  return (
    <section
      className="luxSection luxSection--ink"
      aria-labelledby="charter-occasions-heading"
    >
      <div className="luxShell luxGrid">
        <h2
          id="charter-occasions-heading"
          className="luxDisplay luxDisplay--md charterOccasions__heading"
        >
          <span className="luxLineMask">
            <span data-lux-line="">Occasions beyond</span>
          </span>
          <span className="luxLineMask">
            <span data-lux-line="">the expected</span>
          </span>
        </h2>

        <div className="charterOccasions__index" role="list">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="listitem"
              className="charterOccasions__item"
              data-active={index === active ? "true" : "false"}
              aria-current={index === active ? "true" : undefined}
              onMouseEnter={() => {
                if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
                  setActive(index);
                }
              }}
              onFocus={() => setActive(index)}
              onClick={() => setActive(index)}
            >
              {item.title}
            </button>
          ))}
        </div>

        <div className="charterOccasions__mediaCol">
          <div className="charterOccasions__media luxMedia">
            <ManagedImage
              key={current.imageSlot}
              name={current.imageSlot}
              alt={current.imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              previewAnchor={false}
            />
          </div>
        </div>

        <p className="luxBody charterOccasions__desc" data-lux-reveal="">
          {current.body}
        </p>

        <div className="charterOccasions__mobile" style={{ gridColumn: "1 / -1" }}>
          {items.map((item) => (
            <article key={item.id}>
              <h3
                className="luxDisplay"
                style={{ fontSize: "clamp(1.75rem, 6vw, 2.5rem)" }}
              >
                {item.title}
              </h3>
              <p className="luxBody" style={{ marginBlock: "0.85rem 1.25rem" }}>
                {item.body}
              </p>
              <LuxuryMedia
                name={item.imageSlot}
                alt={item.imageAlt}
                sizes="100vw"
                className="luxMedia--4x5"
                previewAnchor={false}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
