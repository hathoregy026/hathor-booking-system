"use client";

/**
 * Faithful port of assets/pages redesign/.../js/accommodation.js
 * Pin each room → scrub through 4 full-bleed images → next room.
 * Smooth Lenis scroll + soft pin so entering blocks never snaps.
 *
 * ≤1024px: native horizontal scroll-snap gallery (no pin).
 * >1024px: existing pin + scrub (unchanged).
 */

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  restoreScrollPositionIfReload,
} from "@/lib/scroll-position-restore";
import {
  shouldLightenMotionForDevice,
} from "@/lib/touch-device";
import {
  splitAtelierText,
  splitAtelierWords,
} from "@/lib/atelier-text-split";
import { ensurePublicScrollController } from "@/lib/public-scroll-controller";
import { requestScrollRefresh } from "@/lib/scroll-refresh-coordinator";

gsap.registerPlugin(ScrollTrigger);

const SLIDE_COUNT = 4;
const NARROW_MQ = "(max-width: 1024px)";
const DESKTOP_MQ = "(min-width: 1025px)";
/** Fade/scale into full view (timeline units → scrub distance). */
const REVEAL = 1;
/** Empty dwell after 100% so next fade does not start immediately. */
const HOLD = 0.85;
const STEP = REVEAL + HOLD;

const CHROME_SELECTOR = ".room-fs-top, .room-fs-cta";
const COPY_SPLIT_SELECTOR =
  ".room-fs-title, .room-fs-route, .room-fs-meta, .room-fs-desc";

type RoomCopyState = {
  copy: HTMLElement | null;
  chars: HTMLElement[];
  chrome: HTMLElement[];
};

function prepareRoomCopy(room: HTMLElement, light: boolean): RoomCopyState {
  const copy = room.querySelector<HTMLElement>(".room-fs-copy");
  const chrome = gsap.utils.toArray<HTMLElement>(
    room.querySelectorAll(CHROME_SELECTOR),
  );
  const targets = room.querySelectorAll<HTMLElement>(COPY_SPLIT_SELECTOR);
  const splitFn = light ? splitAtelierWords : splitAtelierText;
  const chars: HTMLElement[] = [];
  targets.forEach((el) => {
    chars.push(...splitFn(el));
  });

  if (copy) {
    copy.style.setProperty("--room-scrim", "0");
  }

  return { copy, chars, chrome };
}

function playRoomCopyEntrance(
  state: RoomCopyState,
  light: boolean,
  prefersReduced: boolean,
) {
  const { copy, chars, chrome } = state;

  if (prefersReduced) {
    if (copy) copy.style.setProperty("--room-scrim", "1");
    if (chars.length) gsap.set(chars, { yPercent: 0, opacity: 1 });
    if (chrome.length) gsap.set(chrome, { y: 0, opacity: 1 });
    return;
  }

  const tl = gsap.timeline({ defaults: { overwrite: "auto" } });

  /* Soft fog pool grows from the left while copy rises — homepage language */
  if (copy) {
    const scrim = { v: 0 };
    copy.style.setProperty("--room-scrim", "0");
    tl.to(
      scrim,
      {
        v: 1,
        duration: 1.1,
        ease: "power3.out",
        onUpdate: () => {
          copy.style.setProperty("--room-scrim", String(scrim.v));
        },
      },
      0,
    );
  }

  if (chars.length) {
    tl.fromTo(
      chars,
      { yPercent: light ? 55 : 90, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.95,
        /* Light cascade — still reads as one rise, not barred letter shadows */
        stagger: light ? 0.028 : 0.014,
        ease: "power2.out",
      },
      0.06,
    );
  }

  if (chrome.length) {
    tl.fromTo(
      chrome,
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.07,
        ease: "power2.out",
      },
      0.12,
    );
  }
}

function isNarrowViewport() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia(NARROW_MQ).matches
  );
}

function ensureProgressFills(progressRoot: HTMLElement | null) {
  if (!progressRoot) return;

  progressRoot.querySelectorAll("span").forEach((seg) => {
    let fill = seg.querySelector("i");
    if (!fill) {
      fill = document.createElement("i");
      fill.style.cssText =
        "position:absolute;inset:0;background:var(--gold-soft,#d4c28a);transform:scaleX(0);transform-origin:left center;display:block;";
      (seg as HTMLElement).style.position = "relative";
      (seg as HTMLElement).style.overflow = "hidden";
      seg.appendChild(fill);
    }
    gsap.set(fill, { scaleX: 0 });
  });
}

function updateProgressBars(
  room: HTMLElement,
  active: number,
  segProgress: number,
  currentEl: HTMLElement | null,
) {
  if (currentEl) {
    currentEl.textContent = String(active + 1).padStart(2, "0");
  }

  room.querySelectorAll(".room-fs-progress span i").forEach((fill, i) => {
    let sx = 0;
    if (i < active) sx = 1;
    else if (i === active) sx = segProgress;
    gsap.set(fill, { scaleX: sx });
  });
}

export function useAccommodationMotion(
  rootRef: RefObject<HTMLElement | null>,
  enabled = true,
) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    ensurePublicScrollController();

    const ctx = gsap.context(() => {
      /* Intro — soft fades only (no hard pop-ins) */
      if (!prefersReduced) {
        gsap.utils
          .toArray<HTMLElement>(root.querySelectorAll(".acc-reveal"))
          .forEach((el) => {
            gsap.fromTo(
              el,
              { y: 12, opacity: 0.35 },
              {
                y: 0,
                opacity: 1,
                duration: 0.9,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: el,
                  start: "top 92%",
                  once: true,
                },
              },
            );
          });

        root
          .querySelectorAll<HTMLElement>(".acc-intro-title .acc-intro-line")
          .forEach((line) => {
            gsap.fromTo(
              line,
              { y: 16, opacity: 0.4 },
              {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: line.parentElement,
                  start: "top 88%",
                  once: true,
                },
              },
            );
          });
      }

      /* Room fullscreen stack */
      const rooms = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll(".room-fs"),
      );
      if (!rooms.length) return;

      ScrollTrigger.matchMedia({
        [DESKTOP_MQ]: () => {
          let rail: HTMLDivElement | null = null;
          const railDots: HTMLSpanElement[] = [];

          if (!prefersReduced) {
            rail = document.createElement("div");
            rail.className = "rooms-rail";
            rail.setAttribute("aria-hidden", "true");
            rooms.forEach((_, i) => {
              const d = document.createElement("span");
              if (i === 0) d.classList.add("is-active");
              rail!.appendChild(d);
              railDots.push(d);
            });
            document.body.appendChild(rail);
          }

          const setRail = (i: number) => {
            railDots.forEach((d, di) =>
              d.classList.toggle("is-active", di === i),
            );
          };

          const refreshWhenReady = () => {
            requestScrollRefresh("accommodation-image-load");
          };

          rooms.forEach((room, roomIndex) => {
            room.classList.remove("room-fs--native-scroll");

            const slides = gsap.utils.toArray<HTMLElement>(
              room.querySelectorAll(".room-fs-slide"),
            );
            const imgs = slides
              .map((s) => s.querySelector("img"))
              .filter((img): img is HTMLImageElement => Boolean(img));
            const currentEl = room.querySelector<HTMLElement>(".room-fs-current");
            const progressRoot =
              room.querySelector<HTMLElement>(".room-fs-progress");

            const lightCopy = shouldLightenMotionForDevice();
            const copyState = prepareRoomCopy(room, lightCopy);

            if (!prefersReduced) {
              if (copyState.chars.length) {
                gsap.set(copyState.chars, { yPercent: 90, opacity: 0 });
              }
              if (copyState.chrome.length) {
                gsap.set(copyState.chrome, { opacity: 0, y: 20 });
              }
              if (copyState.copy) {
                copyState.copy.style.setProperty("--room-scrim", "0");
              }
            } else {
              playRoomCopyEntrance(copyState, lightCopy, true);
            }

            ensureProgressFills(progressRoot);

            slides.forEach((slide, i) => {
              gsap.set(slide, {
                opacity: i === 0 ? 1 : 0,
                visibility: i === 0 ? "visible" : "hidden",
                zIndex: i + 1,
              });
            });
            imgs.forEach((img, i) => {
              gsap.set(img, { scale: i === 0 ? 1.03 : 1.06 });
              if (!img.complete) {
                img.addEventListener("load", refreshWhenReady, { once: true });
              }
            });

            let textPlayed = false;
            const playText = () => {
              if (textPlayed) return;
              textPlayed = true;
              playRoomCopyEntrance(copyState, lightCopy, prefersReduced);
            };

            if (prefersReduced) {
              return;
            }

            const pinEnd = `+=${SLIDE_COUNT * STEP * 85}%`;

            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: room,
                start: "top top",
                end: pinEnd,
                scrub: 0.25,
                pin: true,
                pinSpacing: true,
                anticipatePin: 0,
                fastScrollEnd: true,
                preventOverlaps: true,
                invalidateOnRefresh: true,
                onEnter: () => {
                  setRail(roomIndex);
                  playText();
                },
                onEnterBack: () => {
                  setRail(roomIndex);
                  playText();
                },
                onUpdate: (self) => {
                  const slideSpan = SLIDE_COUNT * STEP;
                  const endHold = 0.35;
                  const t = Math.min(
                    slideSpan - 0.0001,
                    self.progress * (slideSpan + endHold),
                  );
                  const active = Math.min(SLIDE_COUNT - 1, Math.floor(t / STEP));
                  const intoStep = t - active * STEP;
                  const segProgress =
                    intoStep < REVEAL ? intoStep / REVEAL : 1;

                  updateProgressBars(room, active, segProgress, currentEl);
                },
              },
            });

            if (imgs[0]) {
              tl.fromTo(
                imgs[0],
                { scale: 1.04 },
                { scale: 1.0, duration: REVEAL, ease: "none" },
                0,
              );
            }
            tl.to({}, { duration: HOLD }, REVEAL);

            for (let i = 1; i < slides.length; i++) {
              const slide = slides[i]!;
              const img = imgs[i];
              const t0 = i * STEP;

              tl.set(slide, { visibility: "visible" }, t0);
              tl.fromTo(
                slide,
                { opacity: 0 },
                { opacity: 1, duration: REVEAL, ease: "none" },
                t0,
              );
              if (img) {
                tl.fromTo(
                  img,
                  { scale: 1.05 },
                  { scale: 1.0, duration: REVEAL, ease: "none" },
                  t0,
                );
              }
              tl.to({}, { duration: HOLD }, t0 + REVEAL);
            }

            tl.to({}, { duration: 0.35 });
          });

          return () => {
            rail?.remove();
          };
        },

        [NARROW_MQ]: () => {
          const cleanups: Array<() => void> = [];

          rooms.forEach((room) => {
            room.classList.add("room-fs--native-scroll");

            const slidesContainer = room.querySelector<HTMLElement>(
              ".room-fs-slides",
            );
            const slides = gsap.utils.toArray<HTMLElement>(
              room.querySelectorAll(".room-fs-slide"),
            );
            const currentEl = room.querySelector<HTMLElement>(".room-fs-current");
            const progressRoot =
              room.querySelector<HTMLElement>(".room-fs-progress");
            const lightCopy = shouldLightenMotionForDevice();
            const copyState = prepareRoomCopy(room, lightCopy);

            gsap.set(slides, {
              clearProps: "opacity,visibility,zIndex,transform",
            });
            gsap.set(slidesContainer, { clearProps: "transform" });

            if (!prefersReduced) {
              if (copyState.chars.length) {
                gsap.set(copyState.chars, { yPercent: 55, opacity: 0 });
              }
              if (copyState.chrome.length) {
                gsap.set(copyState.chrome, { opacity: 0, y: 16 });
              }
            } else {
              playRoomCopyEntrance(copyState, lightCopy, true);
            }

            ensureProgressFills(progressRoot);

            if (!slidesContainer || !slides.length) return;

            let textPlayed = false;
            const playText = () => {
              if (textPlayed) return;
              textPlayed = true;
              playRoomCopyEntrance(copyState, lightCopy, prefersReduced);
            };

            const io = new IntersectionObserver(
              (entries) => {
                if (entries.some((e) => e.isIntersecting && e.intersectionRatio > 0.35)) {
                  playText();
                }
              },
              { threshold: [0.35, 0.5] },
            );
            io.observe(room);
            cleanups.push(() => io.disconnect());

            const onScroll = () => {
              const slideWidth = slidesContainer.clientWidth;
              if (slideWidth <= 0) return;

              const scrollLeft = slidesContainer.scrollLeft;
              const rawIndex = scrollLeft / slideWidth;
              const active = Math.min(
                SLIDE_COUNT - 1,
                Math.max(0, Math.floor(rawIndex + 0.001)),
              );
              const segProgress = Math.min(1, Math.max(0, rawIndex - active));

              updateProgressBars(room, active, segProgress, currentEl);
            };

            slidesContainer.addEventListener("scroll", onScroll, {
              passive: true,
            });
            requestAnimationFrame(onScroll);
            cleanups.push(() => {
              slidesContainer.removeEventListener("scroll", onScroll);
              room.classList.remove("room-fs--native-scroll");
            });
          });

          return () => {
            cleanups.forEach((fn) => fn());
          };
        },
      });

      /* Interstitial breaths — gentle fade, never a pop */
      if (!prefersReduced) {
        gsap.utils
          .toArray<HTMLElement>(root.querySelectorAll(".room-interstitial"))
          .forEach((el) => {
            gsap.fromTo(
              el.querySelectorAll(
                ".room-interstitial__eyebrow, .room-interstitial__script, .room-interstitial__body",
              ),
              { y: 10, opacity: 0.4 },
              {
                y: 0,
                opacity: 1,
                duration: 0.9,
                stagger: 0.08,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: el,
                  start: "top 85%",
                  once: true,
                },
              },
            );
          });
      }

      /* CTA */
      if (!prefersReduced) {
        const cta = root.querySelector(
          "#reserve .cta-inner, .cta-section .cta-inner",
        );
        if (cta) {
          gsap.fromTo(
            cta.querySelectorAll("h2, p, .btn"),
            { y: 12, opacity: 0.4 },
            {
              y: 0,
              opacity: 1,
              duration: 0.85,
              stagger: 0.08,
              ease: "power2.out",
              scrollTrigger: {
                trigger: cta,
                start: "top 85%",
                once: true,
              },
            },
          );
        }
      }
    }, root);

    const refreshNativeGalleries = () => {
      root
        .querySelectorAll<HTMLElement>(
          ".room-fs--native-scroll .room-fs-slides",
        )
        .forEach((container) => {
          container.dispatchEvent(new Event("scroll"));
        });
    };

    const onLoad = () => requestScrollRefresh("accommodation-load");
    window.addEventListener("load", onLoad);

    let resizeTimer: number | undefined;
    const onResize = () => {
      if (isNarrowViewport()) return;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(
        () => requestScrollRefresh("accommodation-resize"),
        200,
      );
    };

    const onOrientationChange = () => {
      if (!isNarrowViewport()) return;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        requestScrollRefresh("accommodation-orientation");
        refreshNativeGalleries();
      }, 200);
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onOrientationChange);

    requestAnimationFrame(() => {
      requestScrollRefresh("accommodation-initial");
      restoreScrollPositionIfReload(window.location.pathname || "/");
      requestAnimationFrame(() => {
        requestScrollRefresh("accommodation-secondary");
        restoreScrollPositionIfReload(window.location.pathname || "/");
        refreshNativeGalleries();
      });
    });

    return () => {
      window.removeEventListener("load", onLoad);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onOrientationChange);
      window.clearTimeout(resizeTimer);
      document.querySelectorAll(".rooms-rail").forEach((el) => el.remove());
      ctx.revert();
    };
  }, [rootRef, enabled]);
}
