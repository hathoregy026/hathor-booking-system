"use client";

import { useCallback, useEffect, useRef } from "react";
import { slotNameFromSuitesImageUrl } from "@/lib/suites-normal-image-map";
import { SUITES_CLIP_FIX_CSS } from "@/lib/suites-typography-shared";

function applyImages(doc: Document, images: Record<string, string>) {
  const paint = () => {
    doc.querySelectorAll("img").forEach((node) => {
      const img = node as HTMLImageElement;
      const current =
        img.getAttribute("data-hathor-slot") ||
        slotNameFromSuitesImageUrl(
          img.getAttribute("src") || img.getAttribute("data-lazy-src") || "",
        );
      if (!current) return;
      const url = images[current];
      if (!url) return;
      img.setAttribute("data-hathor-slot", current);
      if (img.getAttribute("src") !== url) img.setAttribute("src", url);
      if (img.hasAttribute("data-lazy-src")) img.setAttribute("data-lazy-src", url);
      img.removeAttribute("srcset");
      img.removeAttribute("data-lazy-srcset");
    });
  };
  paint();
}

export function SuitesNormalHomepagePage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  const apply = useCallback(async () => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!doc?.head) return;

    if (!doc.getElementById("hathor-font-faces")) {
      const fonts = doc.createElement("link");
      fonts.id = "hathor-font-faces";
      fonts.rel = "stylesheet";
      fonts.href = "/hathor-fonts.css";
      doc.head.appendChild(fonts);
    }

    let live = doc.getElementById("hathor-suites-live") as HTMLStyleElement | null;
    if (!live) {
      live = doc.createElement("style");
      live.id = "hathor-suites-live";
      doc.head.appendChild(live);
    }
    live.textContent = SUITES_CLIP_FIX_CSS;

    try {
      const response = await fetch("/api/suites-config", { cache: "no-store" });
      const data = (await response.json()) as {
        css?: string;
        images?: Record<string, string>;
      };
      live.textContent = `${SUITES_CLIP_FIX_CSS}\n${data.css ?? ""}`;
      if (data.images) {
        applyImages(doc, data.images);
        observerRef.current?.disconnect();
        const observer = new MutationObserver(() => applyImages(doc, data.images ?? {}));
        observer.observe(doc.body, {
          subtree: true,
          attributes: true,
          attributeFilter: ["src", "data-lazy-src"],
        });
        observerRef.current = observer;
      }
    } catch {
      /* Clip-fix still applies if CMS is unreachable. */
    }
  }, []);

  useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <main className="suites-normal-clone" aria-label="Hathor Suites">
      <iframe
        ref={iframeRef}
        className="suites-normal-clone__frame"
        src="/suites-normal/index.html"
        title="Hathor Suites"
        onLoad={() => void apply()}
      />
    </main>
  );
}
