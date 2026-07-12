"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HATHOR_BRAND_NAME,
  HATHOR_HERO_ICON_DARK_SRC,
  HATHOR_HERO_ICON_SRC,
} from "@/lib/branding";

/** Gold BOOK NOW bars + centered ring logo — site-wide primary nav tier. */
export function SiteBookBar() {
  const pathname = usePathname();

  // Homepage 2 keeps its original, page-local book bar so its proven
  // transition and stacking structure remain completely unchanged.
  if (pathname === "/homepage-2") return null;

  return (
    <div className="homepage-2-book-bar" aria-label="Site logo">
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
    </div>
  );
}
