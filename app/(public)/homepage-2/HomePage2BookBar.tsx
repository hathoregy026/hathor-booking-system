"use client";

import Link from "next/link";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import {
  HATHOR_BRAND_NAME,
  HATHOR_HERO_ICON_SRC,
} from "@/lib/branding";

/** Frame 9 top tier — gold BOOK NOW bars + centered logo (homepage-2 only). */
export function HomePage2BookBar() {
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
          className="homepage-2-book-bar__logo-img"
        />
      </Link>

      <BookNowTrigger className="homepage-2-book-bar__pill homepage-2-book-bar__pill--right">
        BOOK NOW
      </BookNowTrigger>
    </div>
  );
}
