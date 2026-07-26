"use client";

import { useLayoutEffect, useRef } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { ManagedImage } from "@/components/ui/ManagedImage";

gsap.registerPlugin(ScrollTrigger);

type HomeCampaignSectionProps = {
  title: string;
  imageName: string;
  imageAlt: string;
  titleStyle?: CSSProperties;
  previewAnchor?: boolean;
};

/**
 * Full-bleed campaign — entrance motion uses IntersectionObserver (not ScrollTrigger)
 * so Lenis / homepage ST cleanup cannot swallow the letter-rise + button fade.
 */
export function HomeCampaignSection({
  title,
  imageName,
  imageAlt,
  titleStyle,
  previewAnchor = true,
}: HomeCampaignSectionProps) {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const touch = window.matchMedia("(pointer: coarse)").matches;
    const mobile = window.innerWidth < 1024;

    const media =
      root.querySelector<HTMLElement>("img.campaign-bg") ||
      root.querySelector<HTMLElement>("img");
    const chars = Array.from(
      root.querySelectorAll<HTMLElement>(".campaign-heading .split-char"),
    );
    const btn = root.querySelector<HTMLElement>(".campaign-book-btn");
    const bg = root.querySelector<HTMLElement>("[data-parallax='bg']");
    const fg = root.querySelector<HTMLElement>("[data-parallax='fg']");

    let revealed = false;
    let charTween: gsap.core.Tween | null = null;
    let btnTween: gsap.core.Tween | null = null;
    const scrubTriggers: ScrollTrigger[] = [];

    const showInstant = () => {
      if (chars.length) gsap.set(chars, { y: 0, autoAlpha: 1 });
      if (btn) gsap.set(btn, { y: 0, autoAlpha: 1 });
      root.classList.add("is-campaign-revealed");
    };

    const hideInstant = () => {
      if (chars.length) gsap.set(chars, { y: 48, autoAlpha: 0 });
      if (btn) gsap.set(btn, { y: 28, autoAlpha: 0 });
      root.classList.remove("is-campaign-revealed");
    };

    const playReveal = () => {
      if (revealed) return;
      revealed = true;
      root.classList.add("is-campaign-revealed");

      charTween?.kill();
      btnTween?.kill();

      if (chars.length) {
        charTween = gsap.fromTo(
          chars,
          { y: 56, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 1.05,
            stagger: 0.04,
            ease: "power3.out",
            overwrite: "auto",
          },
        );
      }

      if (btn) {
        btnTween = gsap.fromTo(
          btn,
          { y: 32, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.9,
            delay: 0.2,
            ease: "power3.out",
            overwrite: "auto",
          },
        );
      }
    };

    const reverseReveal = () => {
      if (!revealed) return;
      revealed = false;
      root.classList.remove("is-campaign-revealed");

      charTween?.kill();
      btnTween?.kill();

      if (chars.length) {
        charTween = gsap.to(chars, {
          y: 56,
          autoAlpha: 0,
          duration: 0.45,
          stagger: 0.02,
          ease: "power2.in",
          overwrite: "auto",
        });
      }
      if (btn) {
        btnTween = gsap.to(btn, {
          y: 24,
          autoAlpha: 0,
          duration: 0.35,
          ease: "power2.in",
          overwrite: "auto",
        });
      }
    };

    if (reduced) {
      showInstant();
      if (media) gsap.set(media, { scale: 1, clearProps: "clipPath" });
    } else {
      hideInstant();

      /* Entrance — IO is independent of Lenis / ScrollTrigger scroller sync */
      const io = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
            playReveal();
          } else if (!entry.isIntersecting && entry.boundingClientRect.top > 0) {
            reverseReveal();
          }
        },
        { threshold: [0, 0.2, 0.35, 0.5], rootMargin: "0px 0px -8% 0px" },
      );
      io.observe(root);

      /* Scrubbed zoom + soft parallax still via ScrollTrigger */
      if (media) {
        gsap.set(media, { scale: 1.12, force3D: true });
        const zoom = ScrollTrigger.create({
          trigger: root,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          onUpdate: (self) => {
            gsap.set(media, { scale: gsap.utils.interpolate(1.12, 1, self.progress) });
          },
        });
        scrubTriggers.push(zoom);
      }

      if (!touch && !mobile) {
        if (bg) {
          scrubTriggers.push(
            ScrollTrigger.create({
              trigger: root,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.35,
              onUpdate: (self) => {
                gsap.set(bg, {
                  yPercent: gsap.utils.interpolate(-5, 5, self.progress),
                });
              },
            }),
          );
        }
        if (fg) {
          scrubTriggers.push(
            ScrollTrigger.create({
              trigger: root,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.55,
              onUpdate: (self) => {
                gsap.set(fg, {
                  yPercent: gsap.utils.interpolate(-6, 6, self.progress),
                });
              },
            }),
          );
        }
      }

      /* If already on-screen at boot (hash / restore), play immediately */
      requestAnimationFrame(() => {
        const rect = root.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        if (rect.top < vh * 0.85 && rect.bottom > vh * 0.15) {
          playReveal();
        }
      });

      (root as HTMLElement & { __campaignIo?: IntersectionObserver }).__campaignIo =
        io;
    }

    const refresh = () => {
      try {
        ScrollTrigger.refresh();
      } catch {
        /* ignore */
      }
    };
    const t1 = window.setTimeout(refresh, 150);
    const t2 = window.setTimeout(refresh, 600);
    void document.fonts?.ready?.then(refresh);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      const io = (
        root as HTMLElement & { __campaignIo?: IntersectionObserver }
      ).__campaignIo;
      io?.disconnect();
      charTween?.kill();
      btnTween?.kill();
      scrubTriggers.forEach((st) => st.kill());
      if (media) gsap.set(media, { clearProps: "transform" });
      if (bg) gsap.set(bg, { clearProps: "transform" });
      if (fg) gsap.set(fg, { clearProps: "transform" });
      if (chars.length) gsap.set(chars, { clearProps: "transform,opacity,visibility" });
      if (btn) gsap.set(btn, { clearProps: "transform,opacity,visibility" });
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className="campaign-section"
      id="campaign"
      aria-label="Campaign call to action"
    >
      <div className="campaign-img-reveal" data-parallax="bg">
        <ManagedImage
          name={imageName}
          alt={imageAlt}
          fill
          sizes="100vw"
          className="campaign-bg object-cover"
          previewAnchor={previewAnchor}
        />
      </div>

      <div className="campaign-overlay" aria-hidden="true" />

      <div className="campaign-fg">
        <div className="campaign-fg-motion" data-parallax="fg">
          <h2
            className="campaign-heading typo-on-images-title"
            style={titleStyle}
            aria-label={title}
          >
            {Array.from(title).map((ch, index) => (
              <span className="split-heading" key={`${ch}-${index}`}>
                <span className="split-char">{ch === " " ? "\u00A0" : ch}</span>
              </span>
            ))}
          </h2>
          <BookNowTrigger className="btn campaign-book-btn">
            Book Now
          </BookNowTrigger>
        </div>
      </div>
    </section>
  );
}
