"use client";

import Link from "next/link";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import {
  HATHOR_BRAND_NAME,
  HATHOR_HERO_ICON_DARK_SRC,
  HATHOR_HERO_ICON_SRC,
} from "@/lib/branding";

/** Gold BOOK NOW bars + centered ring logo — site-wide primary nav tier. */
export function SiteBookBar() {
  return (
    <div className="homepage-2-book-bar" aria-label="Booking shortcuts">
      <BookNowTrigger className="homepage-2-book-bar__pill homepage-2-book-bar__pill--left">
        BOOK NOW
      </BookNowTrigger>

      <Link href="/" className="homepage-2-book-bar__logo" aria-label={HATHOR_BRAND_NAME}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HATHOR_HERO_ICON_SRC}
          alt=""
          className="homepage-2-book-bar__logo-img homepage-2-book-bar__logo-img--light"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HATHOR_HERO_ICON_DARK_SRC}
          alt=""
          className="homepage-2-book-bar__logo-img homepage-2-book-bar__logo-img--dark"
          aria-hidden="true"
        />
      </Link>

      <BookNowTrigger className="homepage-2-book-bar__pill homepage-2-book-bar__pill--right">
        BOOK NOW
      </BookNowTrigger>
    </div>
  );
}
