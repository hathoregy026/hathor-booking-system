"use client";

import { useState } from "react";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { LuxMedia } from "@/components/public/luxury-editorial/LuxMedia";

export type DirectionChapter = {
  id: string;
  title: string;
  body: string;
  imageSlot: string;
  imageAlt: string;
  objectPosition?: string;
};

type Props = {
  chapters: DirectionChapter[];
  enquiryHref?: string;
};

export function CharterDirectionChapters({
  chapters,
  enquiryHref = "#charter-request",
}: Props) {
  const [active, setActive] = useState(0);
  const count = chapters.length;
  if (!count) return null;

  return (
    <section
      className="ch-lux-direction lux-section--dark"
      aria-labelledby="ch-direction-heading"
    >
      <div className="lux-shell" style={{ paddingBlock: "3rem 1rem" }}>
        <p className="lux-kicker">01 / 05 · DIRECTION</p>
        <h2 id="ch-direction-heading" className="lux-editorialTitle">
          <span className="lux-lineMask">
            <span data-lux-line="">A vessel under</span>
          </span>
          <span className="lux-lineMask">
            <span data-lux-line="">your direction</span>
          </span>
        </h2>
      </div>

      <div className="ch-lux-direction__stage">
        <div className="ch-lux-direction__panel">
          {chapters.map((chapter, index) => (
            <button
              key={chapter.id}
              type="button"
              className="ch-lux-direction__tab"
              data-active={index === active ? "true" : "false"}
              onClick={() => setActive(index)}
              aria-pressed={index === active}
            >
              <span className="ch-lux-direction__num">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="ch-lux-direction__tabTitle">{chapter.title}</p>
              <p className="ch-lux-direction__tabBody">{chapter.body}</p>
            </button>
          ))}
          <div className="ch-lux-direction__progress" aria-hidden="true">
            <span style={{ transform: `scaleX(${(active + 1) / count})` }} />
          </div>
          <a className="lux-textLink" href={enquiryHref} style={{ marginTop: "1.25rem" }}>
            <span>Enquire privately</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div className="ch-lux-direction__media" aria-live="polite">
          {chapters.map((chapter, index) => (
            <div
              key={chapter.id}
              className="ch-lux-direction__slide"
              data-active={index === active ? "true" : "false"}
            >
              <ManagedImage
                name={chapter.imageSlot}
                alt={chapter.imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
                previewAnchor={index === 0}
                style={
                  chapter.objectPosition
                    ? { objectPosition: chapter.objectPosition }
                    : undefined
                }
              />
            </div>
          ))}
        </div>
      </div>

      <div className="ch-lux-direction__stack">
        {chapters.map((chapter, index) => (
          <article key={chapter.id}>
            <p className="lux-kicker">
              {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </p>
            <h3 className="lux-editorialTitle" style={{ fontSize: "clamp(2rem, 6vw, 3.2rem)" }}>
              {chapter.title}
            </h3>
            <p className="lux-body" style={{ marginBlock: "1rem 1.5rem" }}>
              {chapter.body}
            </p>
            <LuxMedia
              name={chapter.imageSlot}
              alt={chapter.imageAlt}
              sizes="100vw"
              direction={index % 2 === 0 ? "left" : "right"}
              className="ch-lux-direction__stackMedia"
              objectPosition={chapter.objectPosition}
              previewAnchor={false}
            />
          </article>
        ))}
      </div>
    </section>
  );
}
