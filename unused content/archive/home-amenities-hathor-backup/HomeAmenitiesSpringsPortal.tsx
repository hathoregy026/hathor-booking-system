"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { AMENITIES_SEQUENCE_IMAGE_NAMES } from "@/lib/amenities-sequence-images";
import type {
  AmenitiesLandmarkSlide,
  AmenitiesStorySlide,
} from "@/components/home/HomeAmenitiesSequence";
import { ensurePublicScrollController } from "@/lib/public-scroll-controller";

type HomeAmenitiesSpringsPortalProps = {
  landmarks: AmenitiesLandmarkSlide[];
  stories: AmenitiesStorySlide[];
  titleStyle?: CSSProperties;
  indicationStyle?: CSSProperties;
  bodyStyle?: CSSProperties;
  voyages?: ReactNode;
};

function linesToHtml(lines: string[] | undefined, fallback = ""): string {
  if (!lines?.length) return fallback;
  return lines.map((l) => escapeHtml(l)).join("<br>");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shortCardLabel(raw: string): string {
  const lines = raw
    .split(/\n/)
    .map((line) => line.trim().replace(/\.$/, ""))
    .filter(Boolean);
  if (!lines.length) return raw.trim();
  return [...lines].sort((a, b) => a.length - b.length)[0] || lines[0];
}

/**
 * Literal Springs amenities document (/test-slide → /home-amenities-springs).
 * Springs owns layout + loco + sticky + 50vw joins. Hathor only:
 *  - sizes a parent runway from bridge height
 *  - sticky-pins a 100svh iframe window
 *  - maps parent scroll through the runway → loco setScroll
 *  - injects CMS images/copy
 */
export function HomeAmenitiesSpringsPortal({
  landmarks,
  stories,
  voyages,
}: HomeAmenitiesSpringsPortalProps) {
  const runwayRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastY = useRef(-1);
  const [frameReady, setFrameReady] = useState(false);
  const [runwayPx, setRunwayPx] = useState(0);

  const img1 = useSiteImage("home-amenities-1");
  const img2 = useSiteImage("home-amenities-2");
  const img3 = useSiteImage("home-amenities-3");
  const img4 = useSiteImage("home-amenities-4");
  const img5 = useSiteImage("home-amenities-5");
  const img6 = useSiteImage("home-amenities-6");
  const img7 = useSiteImage("home-amenities-7");
  const img8 = useSiteImage("home-amenities-8");
  const img9 = useSiteImage("home-amenities-9");
  const img10 = useSiteImage("home-amenities-10");
  const img11 = useSiteImage("home-amenities-11");
  const img12 = useSiteImage("home-amenities-12");

  const images = {
    "home-amenities-1": img1.src,
    "home-amenities-2": img2.src,
    "home-amenities-3": img3.src,
    "home-amenities-4": img4.src,
    "home-amenities-5": img5.src,
    "home-amenities-6": img6.src,
    "home-amenities-7": img7.src,
    "home-amenities-8": img8.src,
    "home-amenities-9": img9.src,
    "home-amenities-10": img10.src,
    "home-amenities-11": img11.src,
    "home-amenities-12": img12.src,
  };

  const intro = landmarks[0];
  const videoMain = landmarks[1] ?? landmarks[0];
  const videoInset = landmarks[2] ?? landmarks[1] ?? landmarks[0];

  const text = {
    introTitle: linesToHtml(intro?.titleLines, "Amenities"),
    introBody: escapeHtml(intro?.body || ""),
    videoTitle: linesToHtml(videoMain?.titleLines, ""),
    videoBody: escapeHtml(intro?.body || videoMain?.body || ""),
    videoCaptionTitle: escapeHtml(
      videoInset?.titleLines?.join(" ") || videoMain?.indication || "",
    ),
    videoCaptionBody: escapeHtml(videoInset?.body || videoMain?.body || ""),
    sliderCaptions: [
      landmarks[2]
        ? {
            title: linesToHtml(landmarks[2].titleLines),
            body: escapeHtml(landmarks[2].body),
          }
        : null,
      landmarks[3]
        ? {
            title: linesToHtml(landmarks[3].titleLines),
            body: escapeHtml(landmarks[3].body),
          }
        : null,
      stories[0]
        ? {
            title: escapeHtml(stories[0].title).replace(/\n/g, "<br>"),
            body: escapeHtml(stories[0].body),
          }
        : null,
      stories[1]
        ? {
            title: escapeHtml(stories[1].title).replace(/\n/g, "<br>"),
            body: escapeHtml(stories[1].body),
          }
        : null,
    ].filter(Boolean),
    openingTitle: linesToHtml(
      landmarks[3]?.titleLines,
      stories[1]?.title?.replace(/\n/g, "<br>") ||
        "FINE DINING<br>ON DAHABIYA",
    ),
    openingBody: escapeHtml(
      stories[0]?.body || landmarks[3]?.body || intro?.body || "",
    ),
    openingCards: [
      shortCardLabel(stories[0]?.title || "A Way of Life"),
      shortCardLabel(stories[1]?.title || "Dahabiya"),
      shortCardLabel(
        landmarks[1]?.indication ||
          landmarks[1]?.titleLines?.join(" ") ||
          "Welcome",
      ),
    ],
    natureCaption: escapeHtml(
      stories[2]?.body ||
        stories[1]?.body ||
        intro?.body ||
        "The Nile keeps its own time.",
    ),
  };

  const pushContent = () => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage(
      {
        type: "hathor-am-content",
        images,
        text,
        slots: AMENITIES_SEQUENCE_IMAGE_NAMES,
      },
      "*",
    );
  };

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "hathor-am-boot" || data.type === "hathor-am-ready") {
        setFrameReady(true);
        const height = Number(data.height);
        if (Number.isFinite(height) && height > 0) {
          /* Runway = full Springs document height so sticky window can scrub it */
          setRunwayPx((prev) => Math.max(prev, Math.ceil(height)));
        }
        pushContent();
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (!frameReady) return;
    pushContent();
  }, [
    frameReady,
    img1.src,
    img2.src,
    img3.src,
    img4.src,
    img5.src,
    img6.src,
    img7.src,
    img8.src,
    img9.src,
    img10.src,
    img11.src,
    img12.src,
  ]);

  /*
   * Parent scroll through the runway → Springs loco scroll inside the iframe.
   * Homepage uses Lenis — native window "scroll" alone is not enough; also
   * bind lenis.on("scroll") like other sticky homepage surfaces.
   */
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
        <section
          className="home-am-springs-host"
          aria-label="Amenities"
        >
          <iframe
            ref={iframeRef}
            className="home-am-springs-frame"
            src="/home-amenities-springs/index.html"
            title="Hathor amenities"
            loading="eager"
            scrolling="no"
            allow="autoplay; fullscreen"
            onLoad={() => {
              setFrameReady(true);
              pushContent();
            }}
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

export default HomeAmenitiesSpringsPortal;
