"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import type { RoomFolioPanels } from "@/lib/room-folio-panels";
import { useLocalizedHref, usePublicLocale } from "@/hooks/usePublicLocale";
import { ROOMS_COPY, roomFolioPanels, type RoomsCopy } from "@/lib/i18n/rooms-copy";
import type { RoomCollectionVariant } from "@/lib/room-collection-editorial";

type RoomFolioAccordionProps = {
  variant: RoomCollectionVariant;
  className?: string;
};

function Panel({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <details className="ac-folio__panel">
      <summary className="ac-folio__summary">
        <span className="ac-folio__label">{title}</span>
        <span className="ac-folio__mark" aria-hidden="true" />
      </summary>
      <div className="ac-folio__body" id={id}>
        {children}
      </div>
    </details>
  );
}

function OverviewBlock({ panels }: { panels: RoomFolioPanels }) {
  return (
    <>
      <p className="ac-folio__lead">{panels.overview.lead}</p>
      {panels.overview.paragraphs.map((paragraph) => (
        <p key={paragraph.slice(0, 48)}>{paragraph}</p>
      ))}
      <ul className="ac-folio__facts">
        {panels.overview.facts.map((fact) => (
          <li key={fact}>{fact}</li>
        ))}
      </ul>
    </>
  );
}

function ItineraryBlock({ panels }: { panels: RoomFolioPanels }) {
  const localHref = useLocalizedHref();
  return (
    <div className="ac-folio__routes">
      {panels.itineraries.map((route) => (
        <details key={route.id} className="ac-folio__route">
          <summary>
            <span className="ac-folio__route-title">{route.title}</span>
            <span className="ac-folio__route-meta">
              {route.meta} · {route.departs}
            </span>
          </summary>
          <p className="ac-folio__occupancy">{route.occupancy}</p>
          <ol className="ac-folio__days">
            {route.days.map((day) => (
              <li key={day.title}>
                <h4>{day.title}</h4>
                <p>{day.body}</p>
              </li>
            ))}
          </ol>
          <Link href={localHref(route.href)} className="ac-folio__text-link">
            {route.hrefLabel}
          </Link>
        </details>
      ))}
    </div>
  );
}

function IncludeBlock({ panels, t }: { panels: RoomFolioPanels; t: RoomsCopy["folio"] }) {
  return (
    <div className="ac-folio__split">
      <div>
        <h3>{t.included}</h3>
        <ul>
          {panels.include.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3>{t.notIncluded}</h3>
        <ul>
          {panels.exclude.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function AvailabilityBlock({ panels, t }: { panels: RoomFolioPanels; t: RoomsCopy["folio"] }) {
  const localHref = useLocalizedHref();
  return (
    <>
      <p>{panels.availability.note}</p>
      <ul className="ac-folio__sailings">
        {panels.availability.sailings.map((sailing) => (
          <li key={sailing.title}>
            <strong>{sailing.title}</strong>
            <span>{sailing.meta}</span>
            <span>{sailing.occupancy}</span>
          </li>
        ))}
      </ul>
      <div className="ac-folio__actions">
        <BookNowTrigger className="ac-pill ac-pill--fill">
          <span>{t.checkAvailability}</span>
        </BookNowTrigger>
        <Link href={localHref("/cruises-list")} className="ac-folio__text-link">
          {t.scheduledSailings}
        </Link>
      </div>
    </>
  );
}

export function RoomFolioAccordion({
  variant,
  className = "",
}: RoomFolioAccordionProps) {
  const locale = usePublicLocale();
  const panels = roomFolioPanels(variant, locale);
  const t = ROOMS_COPY[locale].folio;

  return (
    <section
      className={`ac-folio ${className}`.trim()}
      aria-label={t.label}
      id="stay-notes"
    >
      <p className="ac-kicker">{t.label}</p>
      <h2 className="ac-folio__title">{t.title}</h2>
      <div className="ac-folio__stack">
        <Panel id="folio-overview" title={t.overview}>
          <OverviewBlock panels={panels} />
        </Panel>
        <Panel id="folio-itinerary" title={t.itinerary}>
          <ItineraryBlock panels={panels} />
        </Panel>
        <Panel id="folio-include" title={t.includeExclude}>
          <IncludeBlock panels={panels} t={t} />
        </Panel>
        <Panel id="folio-availability" title={t.availability}>
          <AvailabilityBlock panels={panels} t={t} />
        </Panel>
      </div>
    </section>
  );
}
