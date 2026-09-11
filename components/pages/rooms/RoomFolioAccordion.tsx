"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import {
  ROOM_FOLIO_PANELS,
  type RoomFolioPanels,
} from "@/lib/room-folio-panels";
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
          <Link href={route.href} className="ac-folio__text-link">
            {route.hrefLabel}
          </Link>
        </details>
      ))}
    </div>
  );
}

function IncludeBlock({ panels }: { panels: RoomFolioPanels }) {
  return (
    <div className="ac-folio__split">
      <div>
        <h3>Included</h3>
        <ul>
          {panels.include.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Not included</h3>
        <ul>
          {panels.exclude.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function AvailabilityBlock({ panels }: { panels: RoomFolioPanels }) {
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
          <span>Check availability</span>
        </BookNowTrigger>
        <Link href="/cruises-list" className="ac-folio__text-link">
          View scheduled sailings
        </Link>
      </div>
    </>
  );
}

export function RoomFolioAccordion({
  variant,
  className = "",
}: RoomFolioAccordionProps) {
  const panels = ROOM_FOLIO_PANELS[variant];

  return (
    <section
      className={`ac-folio ${className}`.trim()}
      aria-label="Stay notes"
      id="stay-notes"
    >
      <p className="ac-kicker">Stay notes</p>
      <h2 className="ac-folio__title">The voyage, in full</h2>
      <div className="ac-folio__stack">
        <Panel id="folio-overview" title="Overview">
          <OverviewBlock panels={panels} />
        </Panel>
        <Panel id="folio-itinerary" title="Itinerary">
          <ItineraryBlock panels={panels} />
        </Panel>
        <Panel id="folio-include" title="Include & Exclude">
          <IncludeBlock panels={panels} />
        </Panel>
        <Panel id="folio-availability" title="Cruise Availability">
          <AvailabilityBlock panels={panels} />
        </Panel>
      </div>
    </section>
  );
}
