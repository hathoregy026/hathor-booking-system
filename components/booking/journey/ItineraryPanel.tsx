"use client";

import { useState } from "react";
import { HATHOR_VOYAGES, itineraryFor, type ItineraryCopy } from "@/lib/booking-itineraries";
import type { StayDurationValue } from "@/lib/booking-search-config";
import { IconRoute, IconSail, IconTemple } from "./icons";

const VOYAGE_ICON: Record<StayDurationValue, React.ComponentType<{ className?: string }>> = {
  "3-nights-aswan-luxor": IconTemple,
  "4-nights-luxor-aswan": IconSail,
  "7-nights-luxor-aswan-luxor": IconRoute,
};

export function VoyagePicker({
  value,
  onChange,
}: {
  value: StayDurationValue;
  onChange: (duration: StayDurationValue) => void;
}) {
  return (
    <div className="hj-voyages" role="radiogroup" aria-label="Choose your itinerary">
      {HATHOR_VOYAGES.map(voyage => {
        const Icon = VOYAGE_ICON[voyage.duration];
        const on = value === voyage.duration;
        return (
          <button
            key={voyage.duration}
            type="button"
            role="radio"
            aria-checked={on}
            className={`hj-voyage${on ? " hj-voyage--on" : ""}`}
            onClick={() => onChange(voyage.duration)}
          >
            <span className="hj-voyage__dot" aria-hidden />
            <span className="hj-voyage__icon" aria-hidden><Icon /></span>
            <span className="hj-voyage__name">{voyage.title}</span>
            <span className="hj-voyage__meta hj-voyage__meta--route">{voyage.route}</span>
            <span className="hj-voyage__meta hj-voyage__meta--day">{voyage.departureDay}</span>
          </button>
        );
      })}
    </div>
  );
}

function Copy({ copy }: { copy: ItineraryCopy }) {
  return (
    <p className="hj-day__copy">
      {copy.map((part, index) =>
        typeof part === "string" ? (
          <span key={index}>{part}</span>
        ) : (
          // Opens in its own tab so reading about a stop never disturbs the booking.
          <a key={index} href={part.href} target="_blank" rel="noopener noreferrer">
            {part.label}
          </a>
        ),
      )}
    </p>
  );
}

/**
 * The itinerary belongs to the voyage: changing the voyage swaps the days
 * immediately and collapses them again. Cabin choice never changes it.
 */
export function ItineraryAccordion({ duration }: { duration: StayDurationValue }) {
  const voyage = itineraryFor(duration);
  // Expanded days are tied to the voyage, so switching itinerary collapses
  // them again without an extra render pass.
  const [expanded, setExpanded] = useState<{ duration: StayDurationValue; days: number[] }>({ duration, days: [] });
  const open = expanded.duration === duration ? expanded.days : [];
  const setOpen = (days: number[]) => setExpanded({ duration, days });
  const allOpen = open.length === voyage.days_.length;

  return (
    <div className="hj-itinerary">
      <div className="hj-itinerary__top">
        <p className="hj-itinerary__route">{voyage.route} · {voyage.days} days</p>
        <button
          type="button"
          className="hj-linkbtn"
          onClick={() => setOpen(allOpen ? [] : voyage.days_.map(day => day.day))}
        >
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>

      <div className="hj-daylist">
        {voyage.days_.map(day => {
          const isOpen = open.includes(day.day);
          return (
            <div key={day.day} className={`hj-day${isOpen ? " hj-day--open" : ""}`}>
              <h3>
                <button
                  type="button"
                  className="hj-day__button"
                  aria-expanded={isOpen}
                  aria-controls={`hj-day-${duration}-${day.day}`}
                  onClick={() => setOpen(isOpen ? open.filter(entry => entry !== day.day) : [...open, day.day])}
                >
                  <span className="hj-day__num">Day {day.day}</span>
                  <span className="hj-day__title">{day.title}</span>
                  <span className="hj-day__chev" aria-hidden>›</span>
                </button>
              </h3>
              {isOpen ? (
                <div className="hj-day__body" id={`hj-day-${duration}-${day.day}`}>
                  <p className="hj-day__path">{day.path}</p>
                  <Copy copy={day.copy} />
                  <ul className="hj-reading">
                    {day.reading.map(link => (
                      <li key={link.href + link.label}>
                        <a href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
