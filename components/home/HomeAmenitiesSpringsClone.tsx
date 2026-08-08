"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ensurePublicScrollController } from "@/lib/public-scroll-controller";

type HomeAmenitiesSpringsCloneProps = {
  /** Hathor content that follows the Springs clone (Our Voyages, etc.) */
  voyages?: ReactNode;
};

/**
 * 100% Springs amenities clone on the homepage.
 * Document: /home-amenities-springs (built from public/springs-layout).
 * No Hathor colours, images, or copy — pure Springs until we restyle later
 * from archive/home-amenities-hathor-backup.
 */
export function HomeAmenitiesSpringsClone({
  voyages,
}: HomeAmenitiesSpringsCloneProps) {
  const runwayRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastY = useRef(-1);
  const [frameReady, setFrameReady] = useState(false);
  const [runwayPx, setRunwayPx] = useState(0);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "hathor-am-boot" || data.type === "hathor-am-ready") {
        setFrameReady(true);
        const height = Number(data.height);
        if (Number.isFinite(height) && height > 0) {
          setRunwayPx((prev) => Math.max(prev, Math.ceil(height)));
        }
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    const runway = runwayRef.current;
    const iframe = iframeRef.current;
    if (!runway || !iframe || !frameReady) return;

    let raf = 0;
    const sync = () => {
      raf = 0;
      const win = iframe.contentWindow;
      if (!win) return;
      const vh = window.innerHeight || 1;
      const max = Math.max(0, runway.offsetHeight - vh);
      const top = runway.getBoundingClientRect().top;
      const y = Math.round(Math.min(max, Math.max(0, -top)));
      if (y === lastY.current) return;
      lastY.current = y;
      win.postMessage({ type: "hathor-am-scroll", y }, "*");
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(sync);
    };

    const scroll = ensurePublicScrollController();
    const offLenis = scroll.lenis?.on("scroll", onScroll);

    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (typeof offLenis === "function") offLenis();
      else scroll.lenis?.off("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [frameReady, runwayPx]);

  return (
    <>
      <div
        ref={runwayRef}
        className="home-am-springs-runway"
        style={runwayPx > 0 ? { height: runwayPx } : undefined}
        data-home-amenities-springs
      >
        <section className="home-am-springs-host" aria-label="Amenities">
          <iframe
            ref={iframeRef}
            className="home-am-springs-frame"
            src="/home-amenities-springs"
            title="Amenities"
            loading="eager"
            scrolling="no"
            allow="autoplay; fullscreen"
            onLoad={() => setFrameReady(true)}
          />
        </section>
      </div>
      {voyages ? (
        <div className="home-am-voyages" data-am-voyages id="home-am-voyages">
          <div className="home-am-voyages__stage">{voyages}</div>
        </div>
      ) : null}
    </>
  );
}

export default HomeAmenitiesSpringsClone;
