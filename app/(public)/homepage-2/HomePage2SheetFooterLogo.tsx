"use client";

import { useRef, type RefObject } from "react";
import { useHomePage2SheetFooterLogo } from "./useHomePage2SheetFooterLogo";

const BACK_LOGO_SRC =
  "/branding/hathor-logo-behing-the-sheet-egypt-toors-pyramids.svg";

type HomePage2SheetFooterLogoProps = {
  transitionRef: RefObject<HTMLElement | null>;
};

/** Big logo at sheet–footer seam — rises onto cream sheet, then behind footer. */
export function HomePage2SheetFooterLogo({
  transitionRef,
}: HomePage2SheetFooterLogoProps) {
  const logoRef = useRef<HTMLDivElement>(null);

  useHomePage2SheetFooterLogo(transitionRef, logoRef);

  return (
    <div className="homepage-2-sheet-footer-zone" aria-hidden="true">
      <div ref={logoRef} className="homepage-2-footer-rise-logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={BACK_LOGO_SRC} alt="" />
      </div>
    </div>
  );
}
