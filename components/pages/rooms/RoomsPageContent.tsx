"use client";

import { useRef } from "react";
import Link from "next/link";
import { PageScrollTransition } from "@/components/pages/PageScrollTransition";
import { useAccommodationMotion } from "@/hooks/useAccommodationMotion";
import { ROOMS_PAGE } from "@/lib/page-content";

const IMG = {
  suite1: "/pages-redesign/suite-1.webp",
  suite2: "/pages-redesign/suite-2.webp",
  suite3: "/pages-redesign/suite-3.webp",
  suite4: "/pages-redesign/suite-4.webp",
  suite5: "/pages-redesign/suite-5.webp",
  suite6: "/pages-redesign/suite-6.webp",
  window: "/pages-redesign/suite-window.webp",
  escape: "/pages-redesign/escape.webp",
} as const;

const RESIDENCES = [
  {
    id: "1",
    label: "Residence 01",
    title: "Luxury Rooms",
    meta: "22 m² · Nile view · Smart cabin",
    desc: "Refined cabins with panoramic Nile light — handcrafted calm for an elegant Dahabiya voyage.",
    href: "/luxury-cabins-Nile-Cruise",
    slides: [IMG.suite1, IMG.window, IMG.suite3, IMG.suite6],
  },
  {
    id: "2",
    label: "Residence 02",
    title: "Luxury Suites",
    meta: "46 m² · Jacuzzi · Dual baths",
    desc: "Spacious suite sanctuary on the Lower Deck — privacy, Nile glass, and suite-level quiet.",
    href: "/rooms#suites",
    slides: [IMG.suite2, IMG.suite5, IMG.escape, IMG.suite4],
  },
  {
    id: "3",
    label: "Residence 03",
    title: "Royal Suites",
    meta: "56 m² · Main Deck · Royal glass",
    desc: "The crown of Hathor Dahabiya — panoramic Nile views and the highest level of comfort.",
    href: "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise",
    slides: [IMG.suite4, IMG.suite2, IMG.suite5, IMG.suite1],
  },
] as const;

export function RoomsPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  useAccommodationMotion(rootRef);

  return (
    <PageScrollTransition
      title={ROOMS_PAGE.hero.title}
      subtitle={ROOMS_PAGE.hero.subtitle}
      breadcrumb="Accommodations"
      imageName="room-luxury"
      imageAlt="Luxury cabin aboard Hathor Dahabiya"
    >
      <div ref={rootRef} className="venetian-page page-accommodation">
        <section className="about-section acc-intro-block" id="intro">
          <div className="section-inner acc-intro-inner">
            <p className="acc-eyebrow acc-reveal">The Collection</p>
            <h2 className="acc-intro-title">
              <span className="acc-intro-line">Three residences.</span>
              <span className="acc-intro-line">Four views each.</span>
            </h2>
            <p className="acc-intro-copy acc-reveal">
              Enter a suite. Scroll to move through its rooms of light. Then the next
              residence stacks over — no empty scroll, only cinema.
            </p>
          </div>
        </section>

        <div className="room-stack" id="rooms">
          {RESIDENCES.map((room) => (
            <section
              key={room.id}
              className="room-fs"
              data-room={room.id}
              aria-label={room.title}
            >
              <div className="room-fs-slides">
                {room.slides.map((src, i) => (
                  <div
                    key={src + i}
                    className={`room-fs-slide${i === 0 ? " is-first" : ""}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`${room.title} view ${i + 1}`} />
                  </div>
                ))}
              </div>
              <div className="room-fs-shade" aria-hidden="true" />
              <div className="room-fs-ui">
                <div className="room-fs-top">
                  <span className="room-fs-count">
                    <i className="room-fs-current">01</i> / 04
                  </span>
                  <span className="room-fs-label">{room.label}</span>
                </div>
                <div className="room-fs-copy">
                  <h2 className="room-fs-title">{room.title}</h2>
                  <p className="room-fs-meta">{room.meta}</p>
                  <p className="room-fs-desc">{room.desc}</p>
                  <Link className="btn btn-light room-fs-cta" href={room.href}>
                    Discover
                  </Link>
                </div>
                <div className="room-fs-progress" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </section>
          ))}
        </div>

        <section className="cta-section" id="reserve">
          <div className="cta-inner">
            <h2>Reserve your suite</h2>
            <p>
              Share your voyage dates. Our suite concierge will confirm availability and
              hold your preferred residence aboard Hathor Dahabiya.
            </p>
            <Link className="btn btn-filled" href="/cruises">
              View Voyages
            </Link>
          </div>
        </section>
      </div>
    </PageScrollTransition>
  );
}
