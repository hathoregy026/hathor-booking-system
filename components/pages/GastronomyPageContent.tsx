"use client";

import { useRef, type CSSProperties } from "react";
import Link from "next/link";
import "@/app/gastronomy-dining.css";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { useGastronomyDiningScroll } from "@/hooks/useGastronomyDiningScroll";
import { GASTRONOMY_PAGE } from "@/lib/page-content";
import { resolveGastronomyDiningImageSrc } from "@/lib/gastronomy-dining-image-src";
import { siteImageAnchorId } from "@/lib/site-image-preview";

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
  if (!line2.trim()) {
    return <>{line1}</>;
  }
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
}: {
  name: string;
  alt: string;
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
    />
  );
}

export function GastronomyPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  useGastronomyDiningScroll(rootRef);
  const { pages } = useWebsiteText();
  const gastronomy = pages.gastronomy;
  const hero = GASTRONOMY_PAGE.hero;
  const restaurantHeading = splitHeading(gastronomy.restaurantTitle);
  const atmosphereHeading = splitHeading(gastronomy.atmosphereTitle);
  const introHeading = splitHeading(gastronomy.intro[1] ?? "");
  const closingHeading = splitHeading(gastronomy.closing);
  const barHeading = splitHeading(gastronomy.venues[3]?.title ?? "Outdoor Bar");
  const venueLine = gastronomy.venues.map((venue) => venue.title).join(" · ");
  const venueCaption = gastronomy.venues
    .map((venue) => `${venue.title} — ${venue.description}`)
    .join(" ");

  return (
    <div ref={rootRef} className="gastronomy-dining-page">
      <div className="gastronomy-dining-progress" aria-hidden="true">
        <i data-v6-progress />
      </div>

      <section className="dining-hero" data-v6-scroll>
        <div className="dining-hero__sticky">
          <figure className="dining-hero__layer dining-hero__layer--a">
            <DiningImg name="gastronomy-hero" alt="Candlelit private dining table" previewAnchor />
          </figure>
          <figure className="dining-hero__layer dining-hero__layer--b">
            <DiningImg name="gastronomy-table" alt="Long table set for a private party" />
          </figure>
          <figure className="dining-hero__layer dining-hero__layer--c">
            <DiningImg name="gastronomy-courses" alt="Tasting menu plates overhead" />
          </figure>
          <figure className="dining-hero__layer dining-hero__layer--d">
            <DiningImg name="gastronomy-wine" alt="Wine and crystal in warm light" />
          </figure>
          <div className="dining-hero__veil" aria-hidden="true" />
          <div className="dining-hero__copy dining-hero__copy--open">
            <span>{hero.subtitle}</span>
            <h1>
              <DiningHeading line1={hero.title} line2={hero.secondTitle} />
            </h1>
            <p>{gastronomy.intro[0]}</p>
          </div>
          <div className="dining-hero__copy dining-hero__copy--mid">
            <span>{gastronomy.atmosphereTitle}</span>
            <h2>
              <DiningHeading
                line1={atmosphereHeading.line1}
                line2={atmosphereHeading.line2}
              />
            </h2>
          </div>
          <div className="dining-hero__copy dining-hero__copy--end">
            <span>{gastronomy.restaurantTitle}</span>
            <h2>
              <DiningHeading
                line1={restaurantHeading.line1}
                line2={restaurantHeading.line2}
              />
            </h2>
            <a href="#orbit">{hero.secondTitle}</a>
          </div>
          <div className="gastronomy-dining-hero__edge">GASTRONOMY 01 / 12</div>
        </div>
      </section>

      <section id="orbit" className="dining-orbit" data-v6-scroll>
        <div className="dining-orbit__sticky">
          <div className="dining-orbit__word">{hero.secondTitle}</div>
          <figure className="dining-plate dining-plate--one">
            <DiningImg name="gastronomy-plate-1" alt="Signature tasting plate" />
          </figure>
          <figure className="dining-plate dining-plate--two">
            <DiningImg name="gastronomy-plate-2" alt="Dessert plate" />
          </figure>
          <figure className="dining-plate dining-plate--three">
            <DiningImg name="gastronomy-plate-3" alt="Seafood tasting plate" />
          </figure>
          <figure className="dining-plate dining-plate--four">
            <DiningImg name="gastronomy-plate-4" alt="Seasonal plate" />
          </figure>
          <div className="dining-orbit__copy">
            <span>{venueLine}</span>
            <h2>
              <DiningHeading line1={introHeading.line1} line2={introHeading.line2} />
            </h2>
            <p>{gastronomy.intro[1]}</p>
          </div>
        </div>
      </section>

      <section className="dining-course" data-v6-scroll>
        <div className="dining-course__sticky">
          <figure className="dining-course__bg dining-course__bg--1">
            <DiningImg name="gastronomy-hero" alt="Restaurant atmosphere" />
          </figure>
          <figure className="dining-course__bg dining-course__bg--2">
            <DiningImg name="gastronomy-restaurant" alt="Table detail" />
          </figure>
          <figure className="dining-course__cutout">
            <DiningImg name="gastronomy-plate-1" alt="Opening plate" />
          </figure>
          <div className="dining-course__meta">
            <span>{gastronomy.restaurantTitle}</span>
            <h2>
              <DiningHeading
                line1={restaurantHeading.line1}
                line2={restaurantHeading.line2}
              />
            </h2>
            <p>{gastronomy.restaurantService}</p>
          </div>
        </div>
      </section>

      <section className="dining-course dining-course--sea" data-v6-scroll>
        <div className="dining-course__sticky">
          <figure className="dining-course__bg dining-course__bg--1">
            <DiningImg name="gastronomy-table" alt="Dining atmosphere" />
          </figure>
          <figure className="dining-course__bg dining-course__bg--2">
            <DiningImg name="gastronomy-wine" alt="Wine service" />
          </figure>
          <figure className="dining-course__cutout dining-course__cutout--right">
            <DiningImg name="gastronomy-plate-3" alt="Seafood plate" />
          </figure>
          <div className="dining-course__meta dining-course__meta--left">
            <span>{gastronomy.atmosphereTitle}</span>
            <h2>
              <DiningHeading
                line1={atmosphereHeading.line1}
                line2={atmosphereHeading.line2}
              />
            </h2>
            <p>{gastronomy.atmosphere}</p>
          </div>
        </div>
      </section>

      <section className="dining-cascade" data-v6-scroll>
        <div className="dining-cascade__sticky">
          <header>
            <span>{venueLine}</span>
            <h2>
              <DiningHeading
                line1={gastronomy.venues[0]?.title ?? ""}
                line2={gastronomy.venues[1]?.title ?? ""}
              />
            </h2>
          </header>
          <div className="dining-cascade__stack">
            <figure style={{ "--i": 0 } as CSSProperties}>
              <DiningImg name="gastronomy-courses" alt="Course tableau" />
            </figure>
            <figure style={{ "--i": 1 } as CSSProperties}>
              <DiningImg name="gastronomy-chef" alt="Chef finishing a plate" />
            </figure>
            <figure style={{ "--i": 2 } as CSSProperties}>
              <DiningImg name="gastronomy-service" alt="Service at the table" />
            </figure>
            <figure style={{ "--i": 3 } as CSSProperties}>
              <DiningImg name="gastronomy-restaurant" alt="Table setting" />
            </figure>
            <figure style={{ "--i": 4 } as CSSProperties}>
              <DiningImg name="gastronomy-table" alt="Dining atmosphere" />
            </figure>
            <figure style={{ "--i": 5 } as CSSProperties}>
              <DiningImg name="gastronomy-celebration" alt="Evening celebration" />
            </figure>
          </div>
        </div>
      </section>

      <section className="dining-wine" data-v6-scroll>
        <div className="dining-wine__sticky">
          <DiningImg name="gastronomy-wine" alt="Wine service" />
          <div className="dining-wine__veil" aria-hidden="true" />
          <div className="dining-wine__copy">
            <span>{gastronomy.venues[2]?.title ?? "Indoor Bar"}</span>
            <h2>
              <DiningHeading line1={barHeading.line1} line2={barHeading.line2} />
            </h2>
            <p>
              {gastronomy.venues[2]?.description} {gastronomy.venues[3]?.description}
            </p>
          </div>
        </div>
      </section>

      <section className="dining-chef" data-v6-scroll>
        <div className="dining-chef__sticky">
          <figure className="dining-chef__frame dining-chef__frame--back">
            <DiningImg name="gastronomy-table" alt="Dining room glow" />
          </figure>
          <figure className="dining-chef__frame dining-chef__frame--front">
            <DiningImg name="gastronomy-chef" alt="Private chef plating" />
          </figure>
          <div className="dining-chef__copy">
            <span>{gastronomy.restaurantTitle}</span>
            <h2>
              <DiningHeading
                line1={restaurantHeading.line1}
                line2={restaurantHeading.line2}
              />
            </h2>
            <p>{gastronomy.restaurantService}</p>
          </div>
        </div>
      </section>

      <section className="dining-course dining-course--sweet" data-v6-scroll>
        <div className="dining-course__sticky">
          <figure className="dining-course__bg dining-course__bg--1">
            <DiningImg name="gastronomy-courses" alt="Sweet course atmosphere" />
          </figure>
          <figure className="dining-course__bg dining-course__bg--2">
            <DiningImg name="gastronomy-celebration" alt="Celebration light" />
          </figure>
          <figure className="dining-course__cutout">
            <DiningImg name="gastronomy-plate-2" alt="Dessert plate" />
          </figure>
          <div className="dining-course__meta">
            <span>{gastronomy.restaurantTitle}</span>
            <h2>
              <DiningHeading
                line1={closingHeading.line1}
                line2={closingHeading.line2}
              />
            </h2>
            <p>{gastronomy.closing}</p>
          </div>
        </div>
      </section>

      <section className="dining-gallery" data-v6-scroll>
        <div className="dining-gallery__sticky">
          <header>
            <span>{venueLine}</span>
            <h2>
              <DiningHeading
                line1={gastronomy.venues[0]?.title ?? ""}
                line2={gastronomy.venues[1]?.title ?? ""}
              />
            </h2>
          </header>
          <figure className="dining-gallery__a">
            <DiningImg name="gastronomy-plate-5" alt="Plate one" />
          </figure>
          <figure className="dining-gallery__b">
            <DiningImg name="gastronomy-plate-6" alt="Plate two" />
          </figure>
          <figure className="dining-gallery__c">
            <DiningImg name="gastronomy-plate-7" alt="Plate three" />
          </figure>
          <div className="dining-gallery__caption">{venueCaption}</div>
        </div>
      </section>

      <section id="reserve" className="dining-finale" data-v6-scroll>
        <div className="dining-finale__sticky">
          <DiningImg name="gastronomy-hero" alt="Private dining at night" />
          <div className="dining-finale__veil" aria-hidden="true" />
          <div className="dining-finale__copy">
            <span>{hero.subtitle}</span>
            <h2>
              <DiningHeading line1={hero.title} line2={hero.secondTitle} />
            </h2>
            <p>{gastronomy.closing}</p>
            <div className="dining-finale__actions">
              <BookNowTrigger className="btn btn-primary">Book Now</BookNowTrigger>
              <Link className="btn btn-secondary" href="/wellness">
                Wellness
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
