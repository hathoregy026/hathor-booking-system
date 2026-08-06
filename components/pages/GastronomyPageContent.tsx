"use client";

import { useRef, type CSSProperties } from "react";
import Link from "next/link";
import "@/app/gastronomy-dining.css";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { useGastronomyDiningScroll } from "@/hooks/useGastronomyDiningScroll";
import { GASTRONOMY_PAGE } from "@/lib/page-content";

function splitHeading(text: string): { line1: string; line2: string } {
  const words = text.trim().split(/\s+/);
  if (words.length <= 1) {
    return { line1: text, line2: "" };
  }
  const mid = Math.ceil(words.length / 2);
  return {
    line1: words.slice(0, mid).join(" "),
    line2: words.slice(mid).join(" "),
  };
}

function firstSentence(text: string): string {
  const match = text.match(/^[^.!?]+[.!?]?/);
  return match?.[0]?.trim() ?? text;
}

function DiningHeading({
  line1,
  line2,
}: {
  line1: string;
  line2: string;
}) {
  return (
    <>
      {line1}
      <br />
      <em>{line2}</em>
    </>
  );
}

function DiningFillImage({
  name,
  alt,
  previewAnchor = true,
}: {
  name: string;
  alt: string;
  previewAnchor?: boolean;
}) {
  return (
    <ManagedImage
      name={name}
      alt={alt}
      fill
      className="object-cover"
      sizes="100vw"
      previewAnchor={previewAnchor}
    />
  );
}

function DiningPlateImage({
  name,
  alt,
  previewAnchor = false,
}: {
  name: string;
  alt: string;
  previewAnchor?: boolean;
}) {
  return (
    <ManagedImage
      name={name}
      alt={alt}
      width={800}
      height={800}
      className="h-auto w-full object-contain"
      sizes="(max-width: 480px) 78vw, 40vw"
      previewAnchor={previewAnchor}
    />
  );
}

export function GastronomyPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  useGastronomyDiningScroll(rootRef);
  const { pages } = useWebsiteText();
  const gastronomy = pages.gastronomy;
  const hero = GASTRONOMY_PAGE.hero;
  const atmosphereHeading = splitHeading(gastronomy.atmosphereTitle);
  const restaurantHeading = splitHeading(gastronomy.restaurantTitle);
  const introLead = splitHeading(firstSentence(gastronomy.intro[1] ?? ""));
  const closingHeading = splitHeading(firstSentence(gastronomy.closing));
  const indoorBar = gastronomy.venues[2];
  const outdoorBar = gastronomy.venues[3];
  const barHeading = splitHeading(
    `${indoorBar?.title ?? ""} ${outdoorBar?.title ?? ""}`.trim(),
  );
  const venueLine = gastronomy.venues.map((venue) => venue.title).join(" · ");
  const venueCaption = gastronomy.venues
    .map((venue) => `${venue.title} — ${venue.description}`)
    .join(" ");

  return (
    <div ref={rootRef} className="gastronomy-dining-page">
      <div className="gastronomy-dining-progress" aria-hidden="true">
        <i data-gd-progress />
      </div>

      <section className="dining-hero" data-gd-scroll>
        <div className="dining-hero__sticky">
          <figure className="dining-hero__layer dining-hero__layer--a">
            <DiningFillImage name="gastronomy-hero" alt={hero.title} />
          </figure>
          <figure className="dining-hero__layer dining-hero__layer--b">
            <DiningFillImage
              name="gastronomy-table"
              alt={gastronomy.venues[0]?.title ?? "Indoor Restaurant"}
              previewAnchor={false}
            />
          </figure>
          <figure className="dining-hero__layer dining-hero__layer--c">
            <DiningFillImage
              name="gastronomy-courses"
              alt={gastronomy.venues[1]?.title ?? "Outdoor Restaurant"}
              previewAnchor={false}
            />
          </figure>
          <figure className="dining-hero__layer dining-hero__layer--d">
            <DiningFillImage
              name="gastronomy-wine"
              alt={gastronomy.venues[2]?.title ?? "Indoor Bar"}
              previewAnchor={false}
            />
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
            <p>{gastronomy.atmosphere}</p>
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

      <section id="orbit" className="dining-orbit" data-gd-scroll>
        <div className="dining-orbit__sticky">
          <div className="dining-orbit__word">{hero.secondTitle}</div>
          <figure className="dining-plate dining-plate--one">
            <DiningPlateImage
              name="gastronomy-plate-1"
              alt={gastronomy.restaurantTitle}
              previewAnchor
            />
          </figure>
          <figure className="dining-plate dining-plate--two">
            <DiningPlateImage name="gastronomy-plate-2" alt={gastronomy.venues[0]?.title ?? "Indoor Restaurant"} />
          </figure>
          <figure className="dining-plate dining-plate--three">
            <DiningPlateImage name="gastronomy-plate-3" alt={gastronomy.venues[1]?.title ?? "Outdoor Restaurant"} />
          </figure>
          <figure className="dining-plate dining-plate--four">
            <DiningPlateImage name="gastronomy-plate-4" alt={gastronomy.venues[2]?.title ?? "Indoor Bar"} />
          </figure>
          <div className="dining-orbit__copy">
            <span>{venueLine}</span>
            <h2>
              <DiningHeading
                line1={introLead.line1}
                line2={introLead.line2}
              />
            </h2>
            <p>{gastronomy.intro[1]}</p>
          </div>
        </div>
      </section>

      <section className="dining-course" data-gd-scroll>
        <div className="dining-course__sticky">
          <figure className="dining-course__bg dining-course__bg--1">
            <DiningFillImage name="gastronomy-hero" alt={gastronomy.restaurantTitle} previewAnchor={false} />
          </figure>
          <figure className="dining-course__bg dining-course__bg--2">
            <DiningFillImage name="gastronomy-restaurant" alt={gastronomy.restaurantTitle} />
          </figure>
          <figure className="dining-course__cutout">
            <DiningPlateImage name="gastronomy-plate-1" alt={gastronomy.restaurantTitle} previewAnchor={false} />
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

      <section className="dining-course dining-course--sea" data-gd-scroll>
        <div className="dining-course__sticky">
          <figure className="dining-course__bg dining-course__bg--1">
            <DiningFillImage name="gastronomy-table" alt={gastronomy.atmosphereTitle} previewAnchor={false} />
          </figure>
          <figure className="dining-course__bg dining-course__bg--2">
            <DiningFillImage name="gastronomy-wine" alt={gastronomy.atmosphereTitle} previewAnchor={false} />
          </figure>
          <figure className="dining-course__cutout dining-course__cutout--right">
            <DiningPlateImage name="gastronomy-plate-3" alt={gastronomy.atmosphereTitle} previewAnchor={false} />
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

      <section className="dining-cascade" data-gd-scroll>
        <div className="dining-cascade__sticky">
          <header>
            <span>{venueLine}</span>
            <h2>
              <DiningHeading
                line1={gastronomy.venues[0]?.title ?? "Indoor Restaurant"}
                line2={gastronomy.venues[1]?.title ?? "Outdoor Restaurant"}
              />
            </h2>
          </header>
          <div className="dining-cascade__stack">
            <figure style={{ "--i": 0 } as CSSProperties}>
              <DiningFillImage name="gastronomy-courses" alt={gastronomy.venues[0]?.description ?? "Indoor Restaurant"} />
            </figure>
            <figure style={{ "--i": 1 } as CSSProperties}>
              <DiningFillImage name="gastronomy-chef" alt={gastronomy.venues[1]?.description ?? "Outdoor Restaurant"} />
            </figure>
            <figure style={{ "--i": 2 } as CSSProperties}>
              <DiningFillImage name="gastronomy-service" alt={gastronomy.venues[2]?.description ?? "Indoor Bar"} />
            </figure>
            <figure style={{ "--i": 3 } as CSSProperties}>
              <DiningFillImage name="gastronomy-restaurant" alt={gastronomy.venues[3]?.description ?? "Outdoor Bar"} previewAnchor={false} />
            </figure>
            <figure style={{ "--i": 4 } as CSSProperties}>
              <DiningFillImage name="gastronomy-table" alt={gastronomy.restaurantTitle} previewAnchor={false} />
            </figure>
            <figure style={{ "--i": 5 } as CSSProperties}>
              <DiningFillImage name="gastronomy-celebration" alt={gastronomy.closing} />
            </figure>
          </div>
        </div>
      </section>

      <section className="dining-wine" data-gd-scroll>
        <div className="dining-wine__sticky">
          <div className="dining-wine__media">
            <DiningFillImage name="gastronomy-wine" alt={indoorBar?.title ?? "Indoor Bar"} />
          </div>
          <div className="dining-wine__veil" aria-hidden="true" />
          <div className="dining-wine__copy">
            <span>{gastronomy.venues[2]?.title ?? "Indoor Bar"}</span>
            <h2>
              <DiningHeading
                line1={barHeading.line1}
                line2={barHeading.line2}
              />
            </h2>
            <p>
              {gastronomy.venues[2]?.description} {gastronomy.venues[3]?.description}
            </p>
          </div>
        </div>
      </section>

      <section className="dining-chef" data-gd-scroll>
        <div className="dining-chef__sticky">
          <figure className="dining-chef__frame dining-chef__frame--back">
            <DiningFillImage name="gastronomy-table" alt={gastronomy.restaurantTitle} previewAnchor={false} />
          </figure>
          <figure className="dining-chef__frame dining-chef__frame--front">
            <DiningFillImage name="gastronomy-chef" alt={gastronomy.restaurantTitle} previewAnchor={false} />
          </figure>
          <div className="dining-chef__copy">
            <span>{gastronomy.restaurantTitle}</span>
            <h2>
              <DiningHeading
                line1={restaurantHeading.line1}
                line2={restaurantHeading.line2}
              />
            </h2>
            <p>{gastronomy.atmosphere}</p>
          </div>
        </div>
      </section>

      <section className="dining-course dining-course--sweet" data-gd-scroll>
        <div className="dining-course__sticky">
          <figure className="dining-course__bg dining-course__bg--1">
            <DiningFillImage name="gastronomy-courses" alt={gastronomy.closing} previewAnchor={false} />
          </figure>
          <figure className="dining-course__bg dining-course__bg--2">
            <DiningFillImage name="gastronomy-celebration" alt={gastronomy.closing} previewAnchor={false} />
          </figure>
          <figure className="dining-course__cutout">
            <DiningPlateImage name="gastronomy-plate-2" alt={gastronomy.closing} previewAnchor={false} />
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

      <section className="dining-gallery" data-gd-scroll>
        <div className="dining-gallery__sticky">
          <header>
            <span>{venueLine}</span>
            <h2>
              <DiningHeading
                line1={gastronomy.venues[0]?.title ?? "Indoor Restaurant"}
                line2={gastronomy.venues[1]?.title ?? "Outdoor Restaurant"}
              />
            </h2>
          </header>
          <figure className="dining-gallery__a">
            <DiningPlateImage name="gastronomy-plate-5" alt={gastronomy.venues[0]?.title ?? "Indoor Restaurant"} previewAnchor />
          </figure>
          <figure className="dining-gallery__b">
            <DiningPlateImage name="gastronomy-plate-6" alt={gastronomy.venues[2]?.title ?? "Indoor Bar"} />
          </figure>
          <figure className="dining-gallery__c">
            <DiningPlateImage name="gastronomy-plate-7" alt={gastronomy.venues[3]?.title ?? "Outdoor Bar"} />
          </figure>
          <div className="dining-gallery__caption">{venueCaption}</div>
        </div>
      </section>

      <section id="reserve" className="dining-finale" data-gd-scroll>
        <div className="dining-finale__sticky">
          <div className="dining-finale__media">
            <DiningFillImage name="gastronomy-hero" alt={hero.title} previewAnchor={false} />
          </div>
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
