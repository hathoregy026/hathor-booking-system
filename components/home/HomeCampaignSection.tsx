"use client";

import { useLayoutEffect, useRef } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { ManagedImage } from "@/components/ui/ManagedImage";

gsap.registerPlugin(ScrollTrigger);

const SILK_ROWS = ["TAKE YOUR", "VOYAGE", "TODAY"] as const;

/** Frame-rate independent exponential smooth toward target */
function damp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function smoothstep(t: number) {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

type HomeCampaignSectionProps = {
  title: string;
  imageName: string;
  imageAlt: string;
  titleStyle?: CSSProperties;
  previewAnchor?: boolean;
};

type LenisLike = {
  on: (event: string, handler: () => void) => void;
  off?: (event: string, handler: () => void) => void;
};

/**
 * Call-to-action stage — simple & silky.
 *
 * - Stick is 1:1 with scroll (never damped — damping caused the jump).
 * - Gold invite plays once on enter (not scrubbed — scrub made letters bounce).
 * - Photograph y% is heavily damped toward scroll for a soft erase.
 * - On-image title eases in after the wipe.
 */
export function HomeCampaignSection({
  title,
  imageName,
  imageAlt,
  titleStyle,
  previewAnchor = true,
}: HomeCampaignSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const frame = track.querySelector<HTMLElement>("[data-hcta-frame]");
    const reveal = track.querySelector<HTMLElement>("[data-hcta-reveal]");
    const silkChars = gsap.utils.toArray<HTMLElement>(
      track.querySelectorAll(".hcta-silk-char"),
    );
    const chars = gsap.utils.toArray<HTMLElement>(
      track.querySelectorAll(".hcta-heading .hcta-char"),
    );
    const book = track.querySelector<HTMLElement>(".hcta-book");

    if (!frame) return;

    let killed = false;
    let removeLenis: (() => void) | null = null;
    let invitePlaying = false;
    let inviteShown = false;
    let titleShown = false;
    let imageS = 0;

    const playInvite = () => {
      if (invitePlaying || inviteShown || !silkChars.length) return;
      invitePlaying = true;
      gsap.killTweensOf(silkChars);
      gsap.fromTo(
        silkChars,
        { yPercent: 115, autoAlpha: 0 },
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: 1.15,
          stagger: 0.022,
          ease: "power3.out",
          force3D: true,
          onComplete: () => {
            invitePlaying = false;
            inviteShown = true;
          },
        },
      );
    };

    const reverseInvite = () => {
      if (!silkChars.length) return;
      invitePlaying = false;
      inviteShown = false;
      gsap.killTweensOf(silkChars);
      gsap.to(silkChars, {
        yPercent: 115,
        autoAlpha: 0,
        duration: 0.45,
        stagger: 0.01,
        ease: "power2.in",
        force3D: true,
        overwrite: true,
      });
    };

    const playTitle = () => {
      if (titleShown) return;
      titleShown = true;
      if (chars.length) {
        gsap.killTweensOf(chars);
        gsap.fromTo(
          chars,
          { yPercent: 110, autoAlpha: 0 },
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: 0.95,
            stagger: 0.018,
            ease: "power3.out",
            force3D: true,
            overwrite: true,
          },
        );
      }
      if (book) {
        gsap.killTweensOf(book);
        gsap.fromTo(
          book,
          { autoAlpha: 0, y: 16 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            delay: 0.2,
            ease: "power3.out",
            overwrite: true,
          },
        );
      }
    };

    const hideTitle = () => {
      if (!titleShown) return;
      titleShown = false;
      if (chars.length) {
        gsap.killTweensOf(chars);
        gsap.to(chars, {
          yPercent: 110,
          autoAlpha: 0,
          duration: 0.35,
          ease: "power2.in",
          overwrite: true,
        });
      }
      if (book) {
        gsap.killTweensOf(book);
        gsap.to(book, {
          autoAlpha: 0,
          y: 12,
          duration: 0.3,
          ease: "power2.in",
          overwrite: true,
        });
      }
    };

    if (reduced) {
      gsap.set(frame, { clearProps: "transform" });
      if (reveal) gsap.set(reveal, { yPercent: 0, clearProps: "transform" });
      if (silkChars.length) gsap.set(silkChars, { yPercent: 0, autoAlpha: 0 });
      if (chars.length) gsap.set(chars, { yPercent: 0, autoAlpha: 1 });
      if (book) gsap.set(book, { autoAlpha: 1, y: 0 });
      return;
    }

    if (reveal) gsap.set(reveal, { yPercent: 100, force3D: true });
    if (silkChars.length) {
      gsap.set(silkChars, { yPercent: 115, autoAlpha: 0, force3D: true });
    }
    if (chars.length) {
      gsap.set(chars, { yPercent: 110, autoAlpha: 0, force3D: true });
    }
    if (book) gsap.set(book, { autoAlpha: 0, y: 16 });
    gsap.set(frame, { y: 0, force3D: true });

    /*
     * Invite: one-shot when the cream stage is approaching / locked.
     * Never scrub letter progress — that was the rapid bounce.
     */
    ScrollTrigger.create({
      id: "hcta-invite",
      trigger: track,
      start: "top 78%",
      end: "top top",
      onEnter: () => playInvite(),
      onEnterBack: () => playInvite(),
      onLeaveBack: () => reverseInvite(),
    });

    const sync = () => {
      if (killed) return;

      const dt = gsap.ticker.deltaRatio(60);
      const vh = window.innerHeight;
      const rect = track.getBoundingClientRect();
      const frameH = frame.offsetHeight || vh;
      const travel = Math.max(1, track.offsetHeight - frameH);

      /*
       * Stick MUST be exact — damping the frame vs scroll is what felt
       * like text jumping up and down.
       */
      const stickY = Math.min(travel, Math.max(0, -rect.top));
      gsap.set(frame, { y: stickY, force3D: true });

      const stage = clamp01(stickY / travel);

      /* Hold invite, then long soft wipe, then title */
      let imageT = 0;
      if (stage <= 0.12) imageT = 0;
      else if (stage >= 0.8) imageT = 1;
      else imageT = smoothstep((stage - 0.12) / 0.68);

      /* Heavy damp on the photograph only — silk erase glide */
      imageS = damp(imageS, imageT, 3.8, dt);

      if (reveal) {
        gsap.set(reveal, {
          yPercent: (1 - imageS) * 100,
          force3D: true,
        });
      }

      if (imageS > 0.88) playTitle();
      else if (imageS < 0.72) hideTitle();

      if (stage > 0.02 || rect.top < vh * 0.5) playInvite();
    };

    gsap.ticker.add(sync);
    sync();

    const bindLenis = () => {
      if (removeLenis) return;
      const lenis = (window as Window & { __hathorLenis?: LenisLike | null })
        .__hathorLenis;
      if (!lenis?.on) return;
      const onScroll = () => ScrollTrigger.update();
      lenis.on("scroll", onScroll);
      removeLenis = () => lenis.off?.("scroll", onScroll);
    };
    bindLenis();
    const lenisPoll = window.setInterval(() => {
      bindLenis();
      if (removeLenis || killed) window.clearInterval(lenisPoll);
    }, 50);
    window.setTimeout(() => window.clearInterval(lenisPoll), 2000);

    const onResize = () => {
      ScrollTrigger.refresh();
      sync();
    };
    window.addEventListener("resize", onResize);

    return () => {
      killed = true;
      window.clearInterval(lenisPoll);
      window.removeEventListener("resize", onResize);
      removeLenis?.();
      gsap.ticker.remove(sync);
      ScrollTrigger.getById("hcta-invite")?.kill();
      gsap.killTweensOf(silkChars);
      if (chars.length) gsap.killTweensOf(chars);
      if (book) gsap.killTweensOf(book);
      gsap.set(frame, { clearProps: "transform" });
      if (reveal) gsap.set(reveal, { clearProps: "transform" });
    };
  }, []);

  return (
    <div
      ref={trackRef}
      className="hcta-track"
      id="campaign"
      aria-label="Campaign call to action"
      data-hcta-track
    >
      <div className="hcta-frame" data-hcta-frame>
        <div className="hcta-silk" data-hcta-silk>
          <div className="hcta-silk-copy" aria-hidden="true">
            {SILK_ROWS.map((row) => (
              <div className="hcta-silk-row" key={row}>
                {Array.from(row).map((ch, index) => (
                  <span className="hcta-silk-letter" key={`${row}-${index}`}>
                    <span className="hcta-silk-char">
                      {ch === " " ? "\u00A0" : ch}
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="hcta-reveal" data-hcta-reveal>
          <div className="hcta-media" data-hcta-media>
            <ManagedImage
              name={imageName}
              alt={imageAlt}
              fill
              sizes="100vw"
              className="hcta-bg object-cover"
              previewAnchor={previewAnchor}
            />
          </div>
          <div className="hcta-veil" aria-hidden="true" />
        </div>

        <div className="hcta-copy">
          <h2
            className="hcta-heading typo-on-images-title"
            style={titleStyle}
            aria-label={title}
            data-typo-role="on_images_title"
          >
            {Array.from(title).map((ch, index) => (
              <span className="hcta-letter" key={`${ch}-${index}`}>
                <span className="hcta-char">
                  {ch === " " ? "\u00A0" : ch}
                </span>
              </span>
            ))}
          </h2>
          <BookNowTrigger className="btn hcta-book">Book Now</BookNowTrigger>
        </div>
      </div>
    </div>
  );
}
