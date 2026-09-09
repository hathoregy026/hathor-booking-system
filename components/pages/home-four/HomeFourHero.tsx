"use client";

import { useEffect, useRef, useState } from "react";
import { HathorLogoSplit } from "@/components/public/HathorLogoSplit";
import { useHeroLogoSettings } from "@/components/public/HeroLogoSettingsProvider";
import { useTypographyInlineStyle } from "@/components/public/TypographySettingsProvider";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { HATHOR_HERO_VIDEO_SRC, HATHOR_HERO_VIDEO_PHONE_SRC } from "@/lib/branding";
import { heroPosterDelivery } from "@/lib/local-optimized-site-images";

export function HomeFourHero({ poster }: { poster: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [available, setAvailable] = useState(false);
  const logo = useHeroLogoSettings();
  const title = useTypographyInlineStyle("hero_title");
  const script = useTypographyInlineStyle("hero_subtitle");
  const delivery = heroPosterDelivery(poster);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const device = matchMedia("(max-width: 480px)");
    const tablet = matchMedia("(max-width: 1024px)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    let visible = true, disposed = false;
    const play = () => {
      if (!visible || document.hidden || paused || reduced.matches || document.querySelector('.home-four[data-h4-static="true"]')) { video.pause(); return; }
      if (video.getAttribute("src")) void video.play().catch(() => { if (!disposed) setAvailable(false); });
    };
    const configure = () => {
      video.pause();
      const save = connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? "");
      const source = reduced.matches || save || (tablet.matches && !device.matches) ? "" : device.matches ? HATHOR_HERO_VIDEO_PHONE_SRC : HATHOR_HERO_VIDEO_SRC;
      if (!source) { video.removeAttribute("src"); video.load(); setAvailable(false); return; }
      if (video.getAttribute("src") !== source) video.src = source;
      setAvailable(true); play();
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; play(); }, { threshold: 0 });
    observer.observe(video);
    const timer = window.setTimeout(configure, 1200);
    reduced.addEventListener("change", configure);
    device.addEventListener("change", configure);
    tablet.addEventListener("change", configure);
    document.addEventListener("visibilitychange", play);
    document.addEventListener("h4-motion-change", play);
    return () => {
      disposed = true; clearTimeout(timer); observer.disconnect(); video.pause();
      reduced.removeEventListener("change", configure); device.removeEventListener("change", configure); tablet.removeEventListener("change", configure);
      document.removeEventListener("visibilitychange", play); document.removeEventListener("h4-motion-change", play);
    };
  }, [paused]);

  return <section className="h4-hero-run" aria-label="Welcome aboard Hathor">
    <div className="h4-hero home-hero-container">
      <div className="h4-hero-media">
        {/* eslint-disable-next-line @next/next/no-img-element -- responsive CMS poster, matches shared delivery */}
        <img src={delivery.src} srcSet={delivery.srcSet} sizes={delivery.sizes} alt="Hathor Dahabiya on the Nile" width={1920} height={1080} fetchPriority="high" />
        <video ref={videoRef} poster={delivery.src} muted playsInline loop preload="none" aria-hidden="true" onError={() => setAvailable(false)} />
      </div>
      <div className="h4-hero-veil" aria-hidden="true" />
      <div className="h4-stripes" aria-hidden="true">{Array.from({ length: 36 }, (_, i) => <i key={i} />)}</div>
      <div className="h4-hero-copy">
        <p className="h4-eyebrow">Aboard Hathor Dahabiya · Egypt</p>
        <h1 style={{ fontFamily: title.fontFamily, fontWeight: title.fontWeight, fontStyle: title.fontStyle }}><span>Hathor</span> <span>on the Nile</span></h1>
        <p className="h4-hero-script" style={{ fontFamily: script.fontFamily }}>Let the river <span>set the pace.</span></p>
        <nav className="h4-hero-links" aria-label="Explore Home 4"><a href="#h4-voyages">Choose your voyage</a><a href="#h4-invitation">Plan your stay</a></nav>
      </div>
      <div className="hero-logo-mark hero-logo-mark--split h4-logo" aria-hidden="true"><HathorLogoSplit partsVariant={logo.desktopPartsVariant} mobilePartsVariant={logo.mobilePartsVariant} /></div>
      <div className="h4-hero-book"><BookNowTrigger className="h4-btn">Reserve a voyage</BookNowTrigger></div>
      <div className="h4-video-control">{available && <button type="button" onClick={() => setPaused(!paused)} aria-pressed={paused}>{paused ? "Play film" : "Pause film"}</button>}</div>
    </div>
  </section>;
}
