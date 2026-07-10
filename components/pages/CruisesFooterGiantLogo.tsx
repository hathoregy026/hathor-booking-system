"use client";

import { useRef } from "react";
import { useHomePage2FooterGiantLogo } from "@/app/(public)/homepage-2/useHomePage2FooterGiantLogo";

const BACK_LOGO_SRC =
  "/branding/hathor-logo-behing-the-sheet-egypt-toors-pyramids.svg";

export function CruisesFooterGiantLogo() {
  const logoRef = useRef<HTMLDivElement>(null);

  useHomePage2FooterGiantLogo(logoRef);

  return (
    <div className="cruises-footer-logo-stage" aria-hidden="true">
      <div ref={logoRef} className="cruises-footer-giant-logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={BACK_LOGO_SRC} alt="" />
      </div>
    </div>
  );
}
