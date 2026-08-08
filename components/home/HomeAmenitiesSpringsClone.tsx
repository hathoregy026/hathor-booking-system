"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ensurePublicScrollController } from "@/lib/public-scroll-controller";

type HomeAmenitiesSpringsCloneProps = {
  /** Hathor content that follows the Springs clone (Our Voyages, etc.) */
  voyages?: ReactNode;
};

type PinMode = "before" | "pin" | "after";

/**
 * 100% Springs amenities clone on the homepage.
 * Document: /home-amenities-springs (same source as /test-slide).
 *
 * Lenis applies transforms that break CSS sticky, so the iframe host is
 * JS-pinned (fixed) while the runway is scrubbing — otherwise the frame
 * scrolls away and the section looks like a static green void.
 */
export function HomeAmenitiesSpringsClone({
  voyages,
}: HomeAmenitiesSpringsCloneProps) {
  const runwayRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastY = useRef(-1);
  const lastPin = useRef<PinMode | null>(null);
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
    const host = hostRef.current;
    const iframe = iframeRef.current;
    if (!runway || !host || !iframe || !frameReady) return;

    let raf = 0;
    const sync = () => {
      raf = 0;
      const win = iframe.contentWindow;
      if (!win) return;

      const vh = window.innerHeight || 1;
      const runwayH = runway.offsetHeight;
      const max = Math.max(0, runwayH - vh);
      const rect = runway.getBoundingClientRect();

      let pin: PinMode = "before";
      if (rect.top <= 0 && rect.bottom > vh) pin = "pin";
      else if (rect.bottom <= vh) pin = "after";

      if (pin !== lastPin.current) {
        lastPin.current = pin;
        if (pin === "pin") {
          host.style.position = "fixed";
          host.style.top = "0";
          host.style.left = "0";
          host.style.right = "0";
          host.style.bottom = "auto";
          host.style.width = "100%";
          host.style.height = "100vh";
          host.style.height = "100svh";
        } else if (pin === "before") {
          host.style.position = "absolute";
          host.style.top = "0";
          host.style.left = "0";
          host.style.right = "0";
          host.style.bottom = "auto";
          host.style.width = "100%";
          host.style.height = "100vh";
          host.style.height = "100svh";
        } else {
          host.style.position = "absolute";
          host.style.top = "auto";
          host.style.bottom = "0";
          host.style.left = "0";
          host.style.right = "0";
          host.style.width = "100%";
          host.style.height = "100vh";
          host.style.height = "100svh";
        }
      }

      const y = Math.round(Math.min(max, Math.max(0, -rect.top)));
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
      lastPin.current = null;
      host.style.position = "";
      host.style.top = "";
      host.style.left = "";
      host.style.right = "";
      host.style.bottom = "";
      host.style.width = "";
      host.style.height = "";
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
        <section
          ref={hostRef}
          className="home-am-springs-host"
          aria-label="Amenities"
        >
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
