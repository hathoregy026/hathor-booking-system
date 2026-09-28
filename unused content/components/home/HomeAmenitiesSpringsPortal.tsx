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
 * Literal Springs amenities document (/test-slide source) in an iframe.
 * Springs owns layout + loco/sticky/parallax. Hathor only injects CMS media/copy.
 */
export function HomeAmenitiesSpringsPortal({
  landmarks,
  stories,
  voyages,
}: HomeAmenitiesSpringsPortalProps) {
  const hostRef = useRef<HTMLElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [frameReady, setFrameReady] = useState(false);

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
  const img13 = useSiteImage("home-amenities-13");
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
    "home-amenities-13": img13.src,
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
      shortCardLabel(
        landmarks[2]?.indication ||
          landmarks[2]?.titleLines?.join(" ") ||
          "Spa & Wellness",
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
   * Forward wheel into the Springs iframe while mid-runway so parent Lenis
   * does not steal scroll. At iframe start/end, release so the homepage
   * continues (voyages / helm).
   */
  useEffect(() => {
    const host = hostRef.current;
    const iframe = iframeRef.current;
    if (!host || !iframe || !frameReady) return;

    const onWheel = (event: WheelEvent) => {
      const win = iframe.contentWindow;
      const doc = iframe.contentDocument;
      if (!win || !doc) return;
      const max = Math.max(
        0,
        doc.documentElement.scrollHeight - win.innerHeight,
      );
      const y = win.scrollY || doc.documentElement.scrollTop || 0;
      const goingDown = event.deltaY > 0;
      const atStart = y <= 1 && !goingDown;
      const atEnd = y >= max - 2 && goingDown;
      if (atStart || atEnd || max <= 0) return;
      event.preventDefault();
      event.stopPropagation();
      win.scrollBy(0, event.deltaY);
      win.postMessage(
        { type: "hathor-am-scroll", y: (win.scrollY || 0) + event.deltaY },
        "*",
      );
    };

    host.addEventListener("wheel", onWheel, { passive: false });
    return () => host.removeEventListener("wheel", onWheel);
  }, [frameReady]);

  return (
    <>
      <section
        ref={hostRef}
        className="home-am-springs-host"
        data-home-amenities-springs
        aria-label="Amenities"
      >
        <iframe
          ref={iframeRef}
          className="home-am-springs-frame"
          src="/home-amenities-springs/index.html"
          title="Hathor amenities"
          loading="eager"
          allow="autoplay; fullscreen"
          onLoad={() => {
            setFrameReady(true);
            pushContent();
          }}
        />
      </section>
      {voyages ? (
        <div className="home-am-voyages" data-am-voyages id="home-am-voyages">
          <div className="home-am-voyages__stage">{voyages}</div>
        </div>
      ) : null}
    </>
  );
}

export default HomeAmenitiesSpringsPortal;
