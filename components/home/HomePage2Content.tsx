"use client";

import { useEffect } from "react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import {
  HATHOR_HERO_ICON_SRC,
  HATHOR_HERO_POSTER_SRC,
  HATHOR_HERO_VIDEO_SRC,
} from "@/lib/branding";

const BACK_LOGO_SRC =
  "/branding/hathor-logo-behing-the-sheet-egypt-toors-pyramids.svg";

export function HomePage2Content() {
  useEffect(() => {
    document.documentElement.setAttribute("data-homepage2-experience", "");
    return () => {
      document.documentElement.removeAttribute("data-homepage2-experience");
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* LAYER 1: Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={HATHOR_HERO_VIDEO_SRC}
          poster={HATHOR_HERO_POSTER_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Hathor Dahabiya sailing on the Nile"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* LAYER 2: Giant Logo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={BACK_LOGO_SRC} className="giant-logo" alt="Hathor" />

      {/* LAYER 3: Top Bar & Nav */}
      <div className="top-bar">
        <BookNowTrigger className="book-now-btn">BOOK NOW</BookNowTrigger>
        <div className="center-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={HATHOR_HERO_ICON_SRC} alt="Hathor" />
        </div>
        <BookNowTrigger className="book-now-btn">BOOK NOW</BookNowTrigger>
      </div>

      <div className="nav-container">
        <a href="/" className="nav-link">
          Home
        </a>
        <a href="/cruises" className="nav-link">
          Cruises
        </a>
        <div className="nav-item relative">
          <a href="/rooms" className="nav-link">
            Accommodation
          </a>
          <div className="dropdown">
            <a href="/rooms" className="dropdown-link">
              Luxury Rooms
            </a>
            <a href="/rooms" className="dropdown-link">
              Luxury Suites
            </a>
            <a
              href="/Luxury-Royal-Suites-Nile-Dahabiya-Cruise"
              className="dropdown-link"
            >
              Royal Suites
            </a>
          </div>
        </div>
        <a href="/highlights" className="nav-link">
          Experiences
        </a>
        <a href="/about" className="nav-link">
          About
        </a>
        <a href="/contact" className="nav-link">
          Contact
        </a>
      </div>

      {/* LAYER 4: The Cream Dome */}
      <div className="dome-container" />
    </div>
  );
}
