"use client";

import { useState } from "react";
import Link from "next/link";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { NAV_ACCOMMODATIONS } from "@/lib/public-nav";
import { HomePage3ScrollTransition } from "./HomePage3ScrollTransition";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Cruises", href: "/cruises" },
] as const;

const TRAILING_LINKS = [
  { label: "Experiences", href: "/highlights" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export function HomePage3Client() {
  const [accommodationOpen, setAccommodationOpen] = useState(false);

  return (
    <div className="homepage-3-root" data-homepage3-experience>
      <div className="top-book-buttons">
        <BookNowTrigger className="book-now-btn">Book Now</BookNowTrigger>
        <span className="top-bar-mark" aria-hidden="true">
          <span className="top-bar-mark__ring" />
        </span>
        <BookNowTrigger className="book-now-btn">Book Now</BookNowTrigger>
      </div>

      <nav className="homepage-3-nav" aria-label="Primary">
        <ul className="homepage-3-nav__list">
          {NAV_LINKS.map((item) => (
            <li key={item.href} className="homepage-3-nav__item">
              <Link href={item.href} className="homepage-3-nav__link">
                {item.label}
              </Link>
            </li>
          ))}

          <li
            className={`homepage-3-nav__item homepage-3-nav__item--dropdown${
              accommodationOpen ? " is-open" : ""
            }`}
            onMouseEnter={() => setAccommodationOpen(true)}
            onMouseLeave={() => setAccommodationOpen(false)}
          >
            <button
              type="button"
              className="homepage-3-nav__link homepage-3-nav__link--trigger"
              aria-expanded={accommodationOpen}
              onClick={() => setAccommodationOpen((open) => !open)}
            >
              Accommodation
            </button>

            <div className="homepage-3-dropdown" role="menu">
              {NAV_ACCOMMODATIONS.links.map((item, index) => (
                <Link
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  role="menuitem"
                  className="homepage-3-dropdown__pill"
                  style={{ transitionDelay: `${index * 60}ms` }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </li>

          {TRAILING_LINKS.map((item) => (
            <li key={item.href} className="homepage-3-nav__item">
              <Link href={item.href} className="homepage-3-nav__link">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <HomePage3ScrollTransition
        title="Hathor Dahabiya"
        imageName="home-hero-poster"
        imageAlt="Hathor Dahabiya sailing on the Nile"
      >
        <div className="homepage-3-placeholder">
          <p className="homepage-3-placeholder__eyebrow">Nile · Luxor to Aswan</p>
          <h1>A private Dahabiya, reimagined</h1>
        </div>
      </HomePage3ScrollTransition>
    </div>
  );
}
