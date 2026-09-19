"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { HATHOR_VOYAGES, itineraryFor, type ItineraryCopy } from "@/lib/booking-itineraries";
import type { StayDurationValue } from "@/lib/booking-search-config";

const ITINERARY_THUMBS = [
  "/media/hathor/optimized/home-voyage-3n-aswan-luxor.webp",
  "/media/hathor/optimized/cruises-hero.webp",
  "/media/hathor/optimized/about-hero.webp",
  "/media/hathor/optimized/home-voyage-4n-luxor-aswan.webp",
  "/media/hathor/optimized/home-story-legacy-large.webp",
  "/media/hathor/optimized/home-voyage-7n-roundtrip.webp",
  "/media/hathor/optimized/home-split-courtyard.webp",
  "/media/hathor/optimized/home-call-to-action.webp",
] as const;

function dayThumb(day: number) {
  return ITINERARY_THUMBS[(day - 1) % ITINERARY_THUMBS.length];
}

function placeFromPath(path: string) {
  const first = path.split("→")[0]?.trim() ?? path;
  return first
    .replace(/^optional\s+/i, "")
    .replace(/\s*(embarkation|disembarkation|breakfast\/check-out|breakfast|checkout).*$/i, "")
    .trim();
}

export function VoyagePicker({
  value,
  onChange,
}: {
  value: StayDurationValue;
  onChange: (duration: StayDurationValue) => void;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(() => Math.max(0, HATHOR_VOYAGES.findIndex(voyage => voyage.duration === value)));

  // Phone: the voyages are a swipe row. Open it on the chosen voyage, and keep
  // the dots under it on the card in view.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || track.scrollWidth <= track.clientWidth + 2) return;
    const card = track.children[HATHOR_VOYAGES.findIndex(voyage => voyage.duration === value)] as HTMLElement | undefined;
    if (card) track.scrollLeft = card.offsetLeft - track.offsetLeft;
    // Only on first paint: later choices are made by tapping a card in view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onScroll() {
    const track = trackRef.current;
    if (!track) return;
    const cards = [...track.children] as HTMLElement[];
    const middle = track.scrollLeft + track.clientWidth / 2;
    let nearest = 0;
    cards.forEach((card, index) => {
      const centre = card.offsetLeft - track.offsetLeft + card.offsetWidth / 2;
      const best = cards[nearest].offsetLeft - track.offsetLeft + cards[nearest].offsetWidth / 2;
      if (Math.abs(centre - middle) < Math.abs(best - middle)) nearest = index;
    });
    setInView(nearest);
  }

  function showCard(index: number) {
    const track = trackRef.current;
    const card = track?.children[index] as HTMLElement | undefined;
    if (!track || !card) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: reduced ? "auto" : "smooth" });
  }

  return (
    <>
      <div className="hj-voyages" role="radiogroup" aria-label="Choose your itinerary" ref={trackRef} onScroll={onScroll}>
        {HATHOR_VOYAGES.map(voyage => {
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
              <Image
                className="hj-voyage__img"
                src={voyage.image}
                alt=""
                width={480}
                height={200}
                sizes="(max-width: 720px) 100vw, 280px"
              />
              <span className="hj-voyage__name">{voyage.title}</span>
              <span className="hj-voyage__meta hj-voyage__meta--route">{voyage.route}</span>
              <span className="hj-voyage__caption">{voyage.departureDay}</span>
            </button>
          );
        })}
      </div>
      <div className="hj-voyages__dots" aria-hidden>
        {HATHOR_VOYAGES.map((voyage, index) => (
          <button
            key={voyage.duration}
            type="button"
            tabIndex={-1}
            className={`hj-voyages__pip${index === inView ? " hj-voyages__pip--on" : ""}`}
            onClick={() => showCard(index)}
          />
        ))}
      </div>
    </>
  );
}

function Copy({ copy }: { copy: ItineraryCopy }) {
  return (
    <p className="hj-day__copy">
      {copy.map((part, index) =>
        typeof part === "string" ? (
          <span key={index}>{part}</span>
        ) : (
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
  const [expanded, setExpanded] = useState<{ duration: StayDurationValue; days: number[] }>({ duration, days: [] });
  const open = expanded.duration === duration ? expanded.days : [];
  const setOpen = (days: number[]) => setExpanded({ duration, days });
  const allOpen = open.length === voyage.days_.length;

  return (
    <div className="hj-itinerary">
      <div className="hj-itinerary__top">
        <p className="hj-itinerary__route">Itinerary · {voyage.title}</p>
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
                  <Image className="hj-day__thumb" src={dayThumb(day.day)} alt="" width={88} height={88} sizes="44px" />
                  <span>
                    <span className="hj-day__num">Day {day.day}</span>
                    <span className="hj-day__place">{placeFromPath(day.path)}</span>
                    <span className="hj-day__title">{day.title}</span>
                  </span>
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
