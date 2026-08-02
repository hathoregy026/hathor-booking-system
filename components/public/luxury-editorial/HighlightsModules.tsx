"use client";

import { useState } from "react";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { ensurePublicScrollController } from "@/lib/public-scroll-controller";
import { LuxuryMedia } from "@/components/public/luxury-editorial/LuxuryMedia";

export type IndexChapter = {
  id: string;
  title: string;
  imageSlot: string;
  imageAlt: string;
};

type Props = {
  chapters: IndexChapter[];
};

export function HighlightsEditorialIndex({ chapters }: Props) {
  const [active, setActive] = useState(0);
  const current = chapters[active];
  if (!current) return null;

  const go = (id: string, index: number) => {
    setActive(index);
    const el = document.getElementById(id);
    if (el) ensurePublicScrollController().scrollTo(el, { offset: -72 });
  };

  return (
    <section className="luxSection luxSection--paper" aria-labelledby="hl-index-heading">
      <div className="luxShell luxGrid">
        <p className="luxMeta hlIndex__meta" id="hl-index-heading">
          01—{String(chapters.length).padStart(2, "0")}
        </p>

        <div className="hlIndex__list">
          {chapters.map((chapter, index) => (
            <button
              key={chapter.id}
              type="button"
              className="hlIndex__row"
              data-active={index === active ? "true" : "false"}
              onMouseEnter={() => {
                if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
                  setActive(index);
                }
              }}
              onFocus={() => setActive(index)}
              onClick={() => go(chapter.id, index)}
            >
              <span className="luxMeta">{String(index + 1).padStart(2, "0")}</span>
              <p className="hlIndex__title">{chapter.title}</p>
            </button>
          ))}
        </div>

        <div className="hlIndex__preview luxMedia">
          <ManagedImage
            key={current.imageSlot}
            name={current.imageSlot}
            alt={current.imageAlt}
            fill
            sizes="(max-width: 1024px) 0px, 24vw"
            className="object-cover"
            previewAnchor={false}
          />
        </div>

        {/* Touch: same rows act as anchors via click/scroll above; duplicate rail unused */}
      </div>
    </section>
  );
}

export function HighlightsRituals({
  rows,
}: {
  rows: { id: string; title: string; body: string; imageSlot: string; imageAlt: string }[];
}) {
  const [active, setActive] = useState(0);
  const current = rows[active];
  if (!current) return null;

  return (
    <section className="luxSection" aria-labelledby="hl-rituals-heading">
      <div className="luxShell luxGrid">
        <div className="hlRituals__intro">
          <p className="luxMeta">05 / RITUALS</p>
          <h2
            id="hl-rituals-heading"
            className="luxDisplay luxDisplay--md"
            style={{ marginTop: "1rem", maxWidth: "12ch" }}
          >
            <span className="luxLineMask">
              <span data-lux-line="">Details become</span>
            </span>
            <span className="luxLineMask">
              <span data-lux-line="">rituals</span>
            </span>
          </h2>
          <p className="luxLead" style={{ marginTop: "1.5rem" }} data-lux-reveal="">
            Service arrives as quiet ceremony — never as interruption.
          </p>
          <div className="hlRituals__preview luxMedia" data-lux-media="">
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

        <ul className="hlRituals__list">
          {rows.map((row, index) => (
            <li key={row.id}>
              <button
                type="button"
                className="hlRituals__row"
                data-active={index === active ? "true" : "false"}
                onMouseEnter={() => {
                  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
                    setActive(index);
                  }
                }}
                onFocus={() => setActive(index)}
                onClick={() => setActive(index)}
              >
                <div>
                  <p className="hlRituals__name">{row.title}</p>
                  <p className="hlRituals__detail">{row.body}</p>
                </div>
                <span className="luxMeta">{String(index + 1).padStart(2, "0")}</span>
              </button>
              {index === active ? (
                <div className="hlRituals__inlineMedia" style={{ display: "none" }} />
              ) : null}
            </li>
          ))}
        </ul>

        {/* Touch inline media */}
        <div className="hlRituals__touchMedia" style={{ gridColumn: "1 / -1", marginTop: "1rem" }}>
          <style>{`@media (max-width: 1024px){ .hlRituals__touchMedia{display:block} .hlRituals__touchMedia .luxMedia{aspect-ratio:4/3} } @media (min-width: 1025px){ .hlRituals__touchMedia{display:none} }`}</style>
          <LuxuryMedia
            name={current.imageSlot}
            alt={current.imageAlt}
            sizes="100vw"
            className="luxMedia--4x3"
            previewAnchor={false}
          />
        </div>
      </div>
    </section>
  );
}

export function HighlightsGallery({
  slides,
}: {
  slides: { id: string; label: string; imageSlot: string; imageAlt: string }[];
}) {
  const [active, setActive] = useState(0);
  const count = slides.length;
  if (!count) return null;

  const go = (index: number) => setActive((index + count) % count);

  return (
    <section className="luxSection luxSection--paper" aria-labelledby="hl-gallery-heading">
      <div className="luxShell">
        <p className="luxMeta">06 / GALLERY</p>
        <h2
          id="hl-gallery-heading"
          className="luxDisplay luxDisplay--md"
          style={{ marginTop: "1rem", maxWidth: "12ch" }}
        >
          Cinematic frames
        </h2>
      </div>

      <div className="luxShell luxGrid" style={{ marginTop: "2.5rem" }}>
        <div className="hlGallery__stage luxMedia" aria-live="polite">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="hlGallery__slide"
              data-active={index === active ? "true" : "false"}
            >
              <ManagedImage
                name={slide.imageSlot}
                alt={slide.imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 90vw"
                className="object-cover"
                previewAnchor={index === 0}
              />
            </div>
          ))}
        </div>

        <div className="hlGallery__controls">
          <div className="hlGallery__thumbs" role="tablist" aria-label="Gallery frames">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                className="hlGallery__thumb"
                role="tab"
                aria-current={index === active ? "true" : undefined}
                onClick={() => go(index)}
              >
                {String(index + 1).padStart(2, "0")} · {slide.label}
              </button>
            ))}
          </div>
          <div className="hlGallery__arrows">
            <button type="button" aria-label="Previous frame" onClick={() => go(active - 1)}>
              ←
            </button>
            <button type="button" aria-label="Next frame" onClick={() => go(active + 1)}>
              →
            </button>
          </div>
        </div>

        <div className="hlGallery__mobile" aria-label="Gallery">
          {slides.map((slide) => (
            <div key={slide.id} className="hlGallery__mobileSlide luxMedia">
              <ManagedImage
                name={slide.imageSlot}
                alt={slide.imageAlt}
                fill
                sizes="86vw"
                className="object-cover"
                previewAnchor={false}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
