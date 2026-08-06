"use client";

import { useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import "@/app/gastronomy-mask-reveal.css";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { useGastronomyFixedMaskReveal } from "@/hooks/useGastronomyFixedMaskReveal";
import { GASTRONOMY_PAGE } from "@/lib/page-content";
import { resolveGastronomyDiningImageSrc } from "@/lib/gastronomy-dining-image-src";
import { siteImageAnchorId } from "@/lib/site-image-preview";

const COPY_EASE = [0.22, 1, 0.36, 1] as const;

const PLATE_SLOTS = [
  "gastronomy-plate-1",
  "gastronomy-plate-2",
  "gastronomy-plate-3",
  "gastronomy-plate-4",
  "gastronomy-plate-5",
  "gastronomy-plate-6",
  "gastronomy-plate-7",
] as const;

type ExhibitionPanel = {
  id: string;
  image: string;
  previewAnchor?: boolean;
  kicker: string;
  title: string;
  titleEm?: string;
  body: string;
};

function splitHeading(text: string): { line1: string; line2: string } {
  const words = text.trim().split(/\s+/);
  if (words.length <= 1) return { line1: text, line2: "" };
  const mid = Math.ceil(words.length / 2);
  return {
    line1: words.slice(0, mid).join(" "),
    line2: words.slice(mid).join(" "),
  };
}

function DiningHeading({
  line1,
  line2,
}: {
  line1: string;
  line2: string;
}) {
  if (!line2.trim()) return <>{line1}</>;
  return (
    <>
      {line1}
      <br />
      <em>{line2}</em>
    </>
  );
}

function DiningImg({
  name,
  alt,
  previewAnchor = false,
  className,
}: {
  name: string;
  alt: string;
  previewAnchor?: boolean;
  className?: string;
}) {
  const image = useSiteImage(name);
  const src = resolveGastronomyDiningImageSrc(name, image.src);
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      id={previewAnchor ? siteImageAnchorId(name) : undefined}
      data-site-image={name}
      draggable={false}
    />
  );
}

export function GastronomyPageContent() {
  const stageRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const { pages } = useWebsiteText();
  const gastronomy = pages.gastronomy;
  const hero = GASTRONOMY_PAGE.hero;

  const restaurantHeading = splitHeading(gastronomy.restaurantTitle);
  const atmosphereHeading = splitHeading(gastronomy.atmosphereTitle);
  const closingHeading = splitHeading(gastronomy.closing);
  const venueLine = gastronomy.venues.map((venue) => venue.title).join(" · ");
  const venueCaption = gastronomy.venues
    .map((venue) => `${venue.title} — ${venue.description}`)
    .join(" ");

  const panels = useMemo<ExhibitionPanel[]>(
    () => [
      {
        id: "hero",
        image: "gastronomy-hero",
        previewAnchor: true,
        kicker: hero.subtitle,
        title: hero.title,
        titleEm: hero.secondTitle,
        body: gastronomy.intro[0],
      },
      {
        id: "restaurant",
        image: "gastronomy-restaurant",
        kicker: gastronomy.restaurantTitle,
        title: restaurantHeading.line1,
        titleEm: restaurantHeading.line2,
        body: gastronomy.restaurantService,
      },
      {
        id: "atmosphere",
        image: "gastronomy-table",
        kicker: gastronomy.atmosphereTitle,
        title: atmosphereHeading.line1,
        titleEm: atmosphereHeading.line2,
        body: gastronomy.atmosphere,
      },
      {
        id: "venues-dining",
        image: "gastronomy-courses",
        kicker: venueLine,
        title: gastronomy.venues[0]?.title ?? "",
        titleEm: gastronomy.venues[1]?.title ?? "",
        body: `${gastronomy.venues[0]?.description ?? ""} ${gastronomy.venues[1]?.description ?? ""}`.trim(),
      },
      {
        id: "venues-bars",
        image: "gastronomy-wine",
        kicker: `${gastronomy.venues[2]?.title ?? ""} · ${gastronomy.venues[3]?.title ?? ""}`,
        title: gastronomy.venues[2]?.title ?? "",
        titleEm: gastronomy.venues[3]?.title ?? "",
        body: `${gastronomy.venues[2]?.description ?? ""} ${gastronomy.venues[3]?.description ?? ""}`.trim(),
      },
      {
        id: "journey",
        image: "gastronomy-chef",
        kicker: hero.secondTitle,
        title: hero.title,
        titleEm: hero.secondTitle,
        body: gastronomy.intro[1],
      },
      {
        id: "closing",
        image: "gastronomy-celebration",
        kicker: gastronomy.restaurantTitle,
        title: closingHeading.line1,
        titleEm: closingHeading.line2,
        body: gastronomy.closing,
      },
    ],
    [
      hero,
      gastronomy,
      restaurantHeading,
      atmosphereHeading,
      closingHeading,
      venueLine,
    ],
  );

  useGastronomyFixedMaskReveal(stageRef, progressRef, setActive);

  const current = panels[active] ?? panels[0];
  const panelCount = panels.length;

  return (
    <div
      className="gastronomy-mask-page"
      style={{ "--gm-wipes": panelCount - 1 } as CSSProperties}
    >
      <section className="gm-intro" aria-label="Gastronomy introduction">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: COPY_EASE }}
          className="gm-intro__kicker"
        >
          {hero.subtitle}
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.35, delay: 0.12, ease: COPY_EASE }}
          className="gm-intro__title"
        >
          {hero.title}
          <br />
          <em>{hero.secondTitle}</em>
        </motion.h1>
        <motion.div
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.45, ease: COPY_EASE }}
          className="gm-intro__cue"
          aria-hidden="true"
        />
      </section>

      <section
        className="gm-exhibition"
        aria-label="Gastronomy exhibition"
        data-gastronomy-exhibition
      >
        <div ref={stageRef} className="gm-stage">
          {panels.map((panel) => (
            <div
              key={panel.id}
              data-gastronomy-panel
              className="gm-panel"
              aria-hidden={panel.id !== current.id}
            >
              <DiningImg
                name={panel.image}
                alt=""
                previewAnchor={panel.previewAnchor}
              />
              <div className="gm-panel__veil" aria-hidden="true" />
            </div>
          ))}

          <div className="gm-progress" aria-hidden="true">
            <i ref={progressRef} />
          </div>

          <div className="gm-overlay">
            <AnimatePresence mode="wait">
              <motion.div
                key={`badge-${current.id}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.7, ease: COPY_EASE }}
                className="gm-badge"
              >
                <div>
                  <p className="gm-badge__kicker">
                    {hero.secondTitle} 0{active + 1}
                  </p>
                  <h2 className="gm-badge__title">{current.kicker}</h2>
                </div>
                <span className="gm-badge__count">
                  [{active + 1}/{panelCount}]
                </span>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={`copy-${current.id}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.85, ease: COPY_EASE }}
                className="gm-copy-panel"
              >
                <p className="gm-copy-panel__kicker">{current.kicker}</p>
                <h3 className="gm-copy-panel__title">
                  <DiningHeading
                    line1={current.title}
                    line2={current.titleEm ?? ""}
                  />
                </h3>
                <p className="gm-copy-panel__body">{current.body}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section className="gm-plates" aria-label="Signature plates">
        <header className="gm-plates__header">
          <span>{venueLine}</span>
          <h2>
            <DiningHeading
              line1={gastronomy.venues[0]?.title ?? ""}
              line2={gastronomy.venues[1]?.title ?? ""}
            />
          </h2>
        </header>
        <div className="gm-plates__grid">
          {PLATE_SLOTS.map((slot, index) => (
            <figure key={slot} className="gm-plates__item">
              <DiningImg
                name={slot}
                alt={`Signature plate ${index + 1}`}
                previewAnchor={index === 0}
              />
            </figure>
          ))}
        </div>
        <p className="gm-plates__caption">{venueCaption}</p>
      </section>

      <section className="gm-finale" id="reserve" aria-label="Reserve">
        <span>{hero.subtitle}</span>
        <h2>
          <DiningHeading line1={hero.title} line2={hero.secondTitle} />
        </h2>
        <p>{gastronomy.closing}</p>
        <div className="gm-finale__actions">
          <BookNowTrigger className="btn btn-primary">Book Now</BookNowTrigger>
          <Link className="btn btn-secondary" href="/wellness">
            Wellness
          </Link>
        </div>
      </section>
    </div>
  );
}
