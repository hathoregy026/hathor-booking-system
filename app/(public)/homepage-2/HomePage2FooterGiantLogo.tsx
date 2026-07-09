"use client";

import { useRef } from "react";
import { useHomePage2FooterGiantLogo } from "./useHomePage2FooterGiantLogo";

const BACK_LOGO_SRC =
  "/branding/hathor-logo-behing-the-sheet-egypt-toors-pyramids.svg";

/** Second huge logo — rises at footer seam, in front of sheet, behind footer. */
export function HomePage2FooterGiantLogo() {
  const logoRef = useRef<HTMLDivElement>(null);

  useHomePage2FooterGiantLogo(logoRef);

  return (
    <div className="homepage-2-footer-logo-stage" aria-hidden="true">
      <div ref={logoRef} className="homepage-2-footer-giant-logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={BACK_LOGO_SRC} alt="" />
      </div>
    </div>
  );
}
