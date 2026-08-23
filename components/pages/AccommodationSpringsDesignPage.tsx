"use client";

import { useCallback, useEffect, useRef } from "react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { usePublicTheme } from "@/components/public/PublicThemeProvider";
import { EMBEDDED_PUBLIC_THEME_CSS } from "@/lib/embedded-public-theme";

type AccommodationSpringsDesignPageProps = {
  frameSrc: string;
  title: string;
};

/**
 * Isolated Springs Design document for accommodation storytelling.
 *
 * Springs owns its own document, scroll container and script lifecycle; the
 * Hathor public shell only supplies the shared navbar above the iframe.
 */
export function AccommodationSpringsDesignPage({
  frameSrc,
  title,
}: AccommodationSpringsDesignPageProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const { theme } = usePublicTheme();

  const applyTheme = useCallback(() => {
    const doc = frameRef.current?.contentDocument;
    if (!doc?.head) return;

    doc.documentElement.dataset.publicTheme = theme;
    let style = doc.getElementById("hathor-public-theme") as HTMLStyleElement | null;
    if (!style) {
      style = doc.createElement("style");
      style.id = "hathor-public-theme";
      doc.head.appendChild(style);
    }
    style.textContent = EMBEDDED_PUBLIC_THEME_CSS;
  }, [theme]);

  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  return (
    <>
      <div className="public-site">
        <PublicNavbar />
      </div>
      <iframe
        ref={frameRef}
        className="accommodation-springs-frame"
        src={frameSrc}
        title={title}
        scrolling="auto"
        data-public-nav-scroll-root=""
        onLoad={applyTheme}
        style={{
          border: 0,
          display: "block",
          height: "100dvh",
          inset: 0,
          position: "fixed",
          width: "100vw",
          zIndex: 1000,
        }}
      />
    </>
  );
}
