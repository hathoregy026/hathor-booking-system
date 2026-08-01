"use client";

import Link from "next/link";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { ManagedImage } from "@/components/ui/ManagedImage";
import {
  HIGHLIGHTS_LANDMARK_META,
  type HighlightsLandmarkMeta,
} from "@/lib/highlights-content";

type Landmark = { title: string; body: string };

type HighlightsIntroductionProps = {
  intro: string[];
};

export function HighlightsIntroduction({ intro }: HighlightsIntroductionProps) {
  const lead =
    intro[0]?.split(/(?<=\.)\s+/)[0] ||
    "Immerse yourself in the mystique of the River Nile aboard a Dahabiya created for elegance, privacy and unhurried discovery.";

  return (
    <section
      id="highlight-introduction"
      className="hl-intro"
      aria-labelledby="hl-intro-heading"
      data-hl-intro=""
    >
      <div className="lx-shell hl-intro__layout">
        <h2 id="hl-intro-heading" className="lx-title hl-intro__statement">
          <span className="lx-mask" data-hl-intro-line="">
            <span>The river carries</span>
          </span>
          <span className="lx-mask" data-hl-intro-line="">
            <span>thousands of years</span>
          </span>
          <span className="lx-mask" data-hl-intro-line="">
            <span>of stories.</span>
          </span>
        </h2>
        <p className="lx-copy hl-intro__lead" data-hl-reveal="">
          {lead}
        </p>
        <div className="hl-intro__media" data-hl-intro-curtain="">
          <ManagedImage
            name="landmark-valley-kings"
            alt="Valley of the Kings from the Theban hills"
            fill
            sizes="(max-width: 1024px) 100vw, 78vw"
            className="object-cover"
            previewAnchor={false}
            style={{ objectPosition: "50% 45%" }}
          />
        </div>
      </div>
    </section>
  );
}

type HighlightsMovingStoriesProps = {
  landmarks: Landmark[];
};

const FALLBACK_LANDMARKS: Landmark[] = [
  {
    title: "The Unfinished Obelisk",
    body: "A monument frozen mid-creation in the Aswan granite — a quarry that still holds the ambition of an empire.",
  },
  {
    title: "Temple of Hatshepsut",
    body: "Terraces rising into the cliffs at Deir el-Bahari — encountered with time, silence and grace.",
  },
  {
    title: "Valley of the Kings",
    body: "The royal necropolis of the New Kingdom, held in desert hush above the west bank of Luxor.",
  },
];

export function HighlightsMovingStories({
  landmarks,
}: HighlightsMovingStoriesProps) {
  const items = landmarks.length >= 3 ? landmarks.slice(0, 3) : FALLBACK_LANDMARKS;

  return (
    <section
      id="highlight-stories"
      className="hl-timeline"
      aria-labelledby="hl-timeline-heading"
      data-hl-timeline=""
    >
      <div className="lx-shell hl-timeline__head">
        <p className="lx-label">The Nile Remembers</p>
        <h2 id="hl-timeline-heading" className="lx-title hl-timeline__heading">
          Three chapters
          <br />
          along the river.
        </h2>
      </div>

      {/* Desktop cinematic pin stage */}
      <div className="hl-timeline__desktop" data-hl-timeline-desktop="">
        <div className="hl-timeline__runway">
          <div className="hl-timeline__pin" data-hl-timeline-pin="">
            <div className="lx-shell hl-timeline__stage">
              <div className="hl-timeline__media" data-hl-timeline-media="">
                {items.map((landmark, index) => {
                  const meta =
                    HIGHLIGHTS_LANDMARK_META[index] ??
                    HIGHLIGHTS_LANDMARK_META[0]!;
                  return (
                    <div
                      key={meta.slot}
                      className="hl-timeline__slide"
                      data-hl-slide=""
                      data-index={index}
                      id={index === 0 ? `site-image-${meta.slot}` : undefined}
                      data-site-image={meta.slot}
                    >
                      <ManagedImage
                        name={meta.slot}
                        alt={meta.caption || landmark.title}
                        fill
                        sizes="64vw"
                        className="object-cover"
                        loading={index === 0 ? "eager" : "lazy"}
                        previewAnchor={false}
                        style={{ objectPosition: meta.objectPosition }}
                      />
                    </div>
                  );
                })}
                <div className="hl-timeline__progress" aria-hidden="true">
                  <span data-hl-progress="" />
                </div>
              </div>

              <div className="hl-timeline__copy">
                <div className="hl-timeline__counter" aria-hidden="true">
                  <span data-hl-counter="">01</span>
                  <span className="hl-timeline__sep">/</span>
                  <span>03</span>
                </div>
                {items.map((landmark, index) => {
                  const meta =
                    HIGHLIGHTS_LANDMARK_META[index] ??
                    HIGHLIGHTS_LANDMARK_META[0]!;
                  return (
                    <ChapterCopy
                      key={landmark.title}
                      landmark={landmark}
                      meta={meta}
                      index={index}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tablet / phone stacked chapters */}
      <div className="hl-timeline__stack lx-shell" data-hl-timeline-stack="">
        {items.map((landmark, index) => {
          const meta =
            HIGHLIGHTS_LANDMARK_META[index] ?? HIGHLIGHTS_LANDMARK_META[0]!;
          return (
            <article
              key={landmark.title}
              className="hl-chapter"
              data-hl-stack-chapter=""
              data-index={index}
              aria-labelledby={`hl-stack-title-${index}`}
            >
              <div className="hl-chapter__media" data-hl-stack-media="">
                <ManagedImage
                  name={meta.slot}
                  alt={meta.caption || landmark.title}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                  previewAnchor={false}
                  style={{ objectPosition: meta.objectPosition }}
                />
              </div>
              <div className="hl-chapter__body">
                <span className="hl-chapter__num">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="hl-chapter__loc">{meta.location}</p>
                <h3
                  id={`hl-stack-title-${index}`}
                  className="hl-chapter__title"
                >
                  <span className="lx-mask" data-hl-stack-title="">
                    <span>{landmark.title}</span>
                  </span>
                </h3>
                <p className="lx-copy">{landmark.body}</p>
                <Link href="/cruises" className="lx-link">
                  View Route
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ChapterCopy({
  landmark,
  meta,
  index,
}: {
  landmark: Landmark;
  meta: HighlightsLandmarkMeta;
  index: number;
}) {
  return (
    <div
      className="hl-timeline__chapter"
      data-hl-chapter=""
      data-index={index}
    >
      <p className="hl-timeline__loc">{meta.location}</p>
      <h3 className="hl-timeline__title">{landmark.title}</h3>
      <p className="lx-copy">{landmark.body}</p>
      <p className="hl-timeline__voyage">{meta.voyage}</p>
      <Link href="/cruises" className="lx-link">
        View Route
      </Link>
    </div>
  );
}

export function HighlightsFinalCta() {
  return (
    <section id="reserve" className="hl-close" aria-labelledby="hl-close-heading">
      <div className="hl-close__media" data-hl-close-media="">
        <ManagedImage
          name="home-collage-bg"
          alt="The Nile continues beyond the monuments"
          fill
          sizes="100vw"
          className="object-cover"
          previewAnchor={false}
        />
        <div className="hl-close__shade" aria-hidden="true" />
      </div>
      <div className="lx-shell hl-close__inner" data-hl-reveal="">
        <h2 id="hl-close-heading" className="lx-display hl-close__title">
          The journey
          <br />
          continues.
        </h2>
        <p className="lx-copy lx-copy--light">
          Reserve your voyage and meet the landmarks, river light and private
          hospitality that define Hathor.
        </p>
        <BookNowTrigger className="lx-btn lx-btn--ivory">
          Book Your Cruise
        </BookNowTrigger>
      </div>
    </section>
  );
}
