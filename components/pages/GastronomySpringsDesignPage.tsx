"use client";

import { useCallback, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import "@/app/gastronomy-springs-design.css";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { useGastronomySpringsScroll } from "@/hooks/useGastronomySpringsScroll";
import { GASTRONOMY_PAGE } from "@/lib/page-content";
import { resolveGastronomyDiningImageSrc } from "@/lib/gastronomy-dining-image-src";
import { siteImageAnchorId } from "@/lib/site-image-preview";

const PLATE_SLOTS = [
  "gastronomy-plate-1",
  "gastronomy-plate-2",
  "gastronomy-plate-3",
  "gastronomy-plate-4",
  "gastronomy-plate-5",
  "gastronomy-plate-6",
  "gastronomy-plate-7",
] as const;

function DiningImg({
  name,
  alt = "",
  previewAnchor = false,
}: {
  name: string;
  alt?: string;
  previewAnchor?: boolean;
}) {
  const image = useSiteImage(name);
  const src = resolveGastronomyDiningImageSrc(name, image.src);
  return (
    <img
      src={src}
      alt={alt}
      id={previewAnchor ? siteImageAnchorId(name) : undefined}
      data-site-image={name}
      draggable={false}
    />
  );
}

function ArrowDownIcon() {
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true">
      <path d="M7 1v12M2.5 9.5 7 14l4.5-4.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function GastronomySpringsDesignPage() {
  const pageRef = useRef<HTMLElement>(null);
  const { pages } = useWebsiteText();
  const gastronomy = pages.gastronomy;
  const hero = GASTRONOMY_PAGE.hero;
  const [maskActive, setMaskActive] = useState(0);
  const [pinOn, setPinOn] = useState<number | null>(null);

  const onMaskActive = useCallback((i: number) => setMaskActive(i), []);
  useGastronomySpringsScroll(pageRef, onMaskActive);

  const maskPanels = useMemo(
    () => [
      {
        image: "gastronomy-hero",
        preview: true,
        kicker: hero.subtitle,
        title: hero.title,
        titleEm: hero.secondTitle,
        body: gastronomy.intro[0],
      },
      {
        image: "gastronomy-restaurant",
        kicker: gastronomy.restaurantTitle,
        title: gastronomy.restaurantTitle,
        body: gastronomy.restaurantService,
      },
      {
        image: "gastronomy-table",
        kicker: gastronomy.atmosphereTitle,
        title: gastronomy.atmosphereTitle,
        body: gastronomy.atmosphere,
      },
      {
        image: "gastronomy-courses",
        kicker: gastronomy.venues[0]?.title ?? "",
        title: gastronomy.venues[0]?.title ?? "",
        titleEm: gastronomy.venues[1]?.title ?? "",
        body: `${gastronomy.venues[0]?.description ?? ""} ${gastronomy.venues[1]?.description ?? ""}`.trim(),
      },
      {
        image: "gastronomy-wine",
        kicker: gastronomy.venues[2]?.title ?? "",
        title: gastronomy.venues[2]?.title ?? "",
        titleEm: gastronomy.venues[3]?.title ?? "",
        body: `${gastronomy.venues[2]?.description ?? ""} ${gastronomy.venues[3]?.description ?? ""}`.trim(),
      },
      {
        image: "gastronomy-chef",
        kicker: hero.secondTitle,
        title: hero.title,
        titleEm: hero.secondTitle,
        body: gastronomy.intro[1],
      },
    ],
    [gastronomy, hero],
  );

  const current = maskPanels[maskActive] ?? maskPanels[0];
  const venueCaption = gastronomy.venues
    .map((v) => `${v.title} — ${v.description}`)
    .join(" ");

  const pins = useMemo(
    () =>
      gastronomy.venues.map((venue, i) => ({
        ...venue,
        left: ["28%", "48%", "64%", "40%"][i] ?? "50%",
        top: ["24%", "48%", "66%", "38%"][i] ?? "50%",
      })),
    [gastronomy.venues],
  );

  return (
    <article
      ref={pageRef}
      className="gs-page"
      style={{ "--gs-mask-wipes": maskPanels.length - 1 } as CSSProperties}
    >
      {/* ── INTRO — Springs design hero clone ── */}
      <section className="gs-intro" id="gs-intro" aria-label="Gastronomy introduction">
        <div className="gs-intro__stage">
          <div className="gs-intro__bg">
            <DiningImg name="gastronomy-hero" previewAnchor />
          </div>
          <div className="gs-intro__veil" aria-hidden="true" />

          <div className="gs-intro__caption">
            <h1 className="gs-intro__title">{hero.title}</h1>
            <p className="gs-intro__subtitle">
              {hero.secondTitle}
              <br />
              {hero.subtitle}
            </p>
          </div>

          <a className="gs-intro__scroll" href="#gs-spiral" aria-label="Scroll to continue">
            <ArrowDownIcon />
          </a>

          <div className="gs-intro__panel">
            <p>{gastronomy.intro[0]}</p>
          </div>
        </div>
      </section>

      {/* ── SPIRAL — editorial statement ── */}
      <section className="gs-spiral" id="gs-spiral" aria-label={gastronomy.atmosphereTitle}>
        <div className="gs-spiral__stage">
          <div className="gs-spiral__orbs" aria-hidden="true">
            <span /><span />
          </div>
          <div className="gs-spiral__bg">
            <DiningImg name="gastronomy-table" />
          </div>
          <div className="gs-spiral__copy">
            <span className="gs-spiral__kicker">{gastronomy.atmosphereTitle}</span>
            <h2>{gastronomy.atmosphere}</h2>
          </div>
        </div>
      </section>

      {/* ── MASK REVEAL — Fixed-Background clip wipes ── */}
      <section className="gs-mask" id="gs-mask" aria-label="Gastronomy exhibition">
        <div className="gs-mask__stage">
          {maskPanels.map((panel) => (
            <div key={panel.image} data-gs-mask-panel className="gs-mask__panel">
              <DiningImg name={panel.image} previewAnchor={panel.preview} />
              <div className="gs-mask__veil" aria-hidden="true" />
            </div>
          ))}

          <div className="gs-mask__progress" aria-hidden="true">
            <i data-gs-progress />
          </div>

          <div className="gs-mask__overlay">
            <div className="gs-mask__badge">
              <span>
                {hero.secondTitle} 0{maskActive + 1} / 0{maskPanels.length}
              </span>
              <strong>{current.kicker}</strong>
            </div>
            <div className="gs-mask__copy">
              <span>{current.kicker}</span>
              <h3>
                {current.title}
                {current.titleEm ? (
                  <>
                    <br />
                    <em>{current.titleEm}</em>
                  </>
                ) : null}
              </h3>
              <p>{current.body}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── VENUES ── */}
      <section className="gs-venues" id="gs-venues" aria-label="Dining venues">
        <h2 className="gs-venues__title">{gastronomy.restaurantTitle}</h2>
        <p className="gs-venues__lead">{gastronomy.intro[1]}</p>
        <div className="gs-venues__frame">
          <DiningImg name="gastronomy-courses" />
          {pins.map((pin, i) => (
            <div
              key={pin.title}
              className={`gs-venues__pin${pinOn === i ? " is-on" : ""}`}
              style={{ "--left": pin.left, "--top": pin.top } as CSSProperties}
              onMouseEnter={() => setPinOn(i)}
              onMouseLeave={() => setPinOn(null)}
            >
              <button
                type="button"
                className="gs-venues__pin-btn"
                aria-label={pin.title}
                onFocus={() => setPinOn(i)}
                onBlur={() => setPinOn(null)}
              >
                {i + 1}
              </button>
              <div className="gs-venues__tip">
                <strong>{pin.title}</strong>
                <br />
                {pin.description}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FLOATING PLATES (PNG rise freely — never backgrounds) ── */}
      <section className="gs-plates" id="gs-plates" aria-label="Signature plates">
        <div className="gs-plates__stage">
          {PLATE_SLOTS.map((slot, i) => (
            <figure
              key={slot}
              data-gs-floating-plate
              className={`gs-plates__plate gs-plates__plate--${i + 1}`}
            >
              <DiningImg name={slot} alt={`Signature plate ${i + 1}`} previewAnchor={i === 0} />
            </figure>
          ))}
          <div className="gs-plates__copy">
            <span>{gastronomy.venues[0]?.title}</span>
            <h3>{venueCaption}</h3>
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section className="gs-gallery" id="gs-gallery" aria-label="Dining gallery">
        <h2 className="gs-gallery__title">{gastronomy.closing}</h2>
        <div className="gs-gallery__grid">
          <figure className="gs-gallery__item">
            <DiningImg name="gastronomy-celebration" />
            <p>{gastronomy.venues[0]?.description}</p>
          </figure>
          <figure className="gs-gallery__item">
            <DiningImg name="gastronomy-wine" />
            <p>{gastronomy.venues[1]?.description}</p>
          </figure>
        </div>
      </section>

      {/* ── FINALE ── */}
      <section className="gs-finale" id="reserve" aria-label="Reserve">
        <div className="gs-finale__bg">
          <DiningImg name="gastronomy-chef" />
        </div>
        <div className="gs-finale__veil" aria-hidden="true" />
        <div className="gs-finale__copy">
          <span>{hero.subtitle}</span>
          <h2>
            {hero.title}
            <br />
            {hero.secondTitle}
          </h2>
          <p>{gastronomy.closing}</p>
          <div className="gs-finale__actions">
            <BookNowTrigger className="btn btn-primary">Book Now</BookNowTrigger>
            <Link className="btn btn-secondary" href="/wellness">
              Wellness
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
