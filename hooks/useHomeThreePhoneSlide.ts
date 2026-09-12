"use client";

import { useEffect, type RefObject } from "react";

const PHONE_QUERY = "(max-width: 480px)";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
/** How far a finger has to travel before the slide commits (px). */
const SWIPE_COMMIT = 10;
/** Quiet time after a free scroll before a stray position is settled (ms). */
const SETTLE_DELAY = 140;

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Phone homepage: the story slides over the pinned film as one gesture.
 *
 * On a phone the site runs native scroll, so a wheel tick or a short swipe
 * moved the page in visible steps and the story arrived over the film like a
 * block. Between the top of the page and the point where the story fully
 * covers the film, any scroll now hands off to one eased slide — down onto
 * the story, or back up to the film. Everywhere else scrolling is untouched,
 * and reduced motion keeps plain scrolling throughout.
 */
export function useHomeThreePhoneSlide(
  storyRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const story = storyRef.current;
    if (!story) return;

    const phone = window.matchMedia(PHONE_QUERY);
    const reduced = window.matchMedia(REDUCED_QUERY);
    let frame = 0;
    let settleId = 0;
    let sliding = false;
    let touchY: number | null = null;
    let lastY = window.scrollY;
    let direction = 0;

    const active = () => phone.matches && !reduced.matches;
    /* where the story's top meets the top of the screen: the film is covered */
    const coverAt = () =>
      Math.round(story.getBoundingClientRect().top + window.scrollY);

    const slideTo = (target: number) => {
      const from = window.scrollY;
      const distance = target - from;
      if (Math.abs(distance) < 2) return;
      cancelAnimationFrame(frame);
      window.clearTimeout(settleId);
      sliding = true;
      const start = performance.now();
      const duration = Math.min(1150, Math.max(650, Math.abs(distance) * 1.3));
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        window.scrollTo({
          top: from + distance * easeInOutCubic(t),
          behavior: "instant",
        });
        if (t < 1) {
          frame = requestAnimationFrame(step);
          return;
        }
        sliding = false;
        lastY = window.scrollY;
      };
      frame = requestAnimationFrame(step);
    };

    /* down: anywhere above the cover point; up: from the cover point or above */
    const slideFor = (goingDown: boolean) => {
      const y = window.scrollY;
      const cover = coverAt();
      if (goingDown && y < cover - 1) return cover;
      if (!goingDown && y > 0 && y <= cover + 1) return 0;
      return null;
    };

    const onWheel = (event: WheelEvent) => {
      if (!active()) return;
      if (sliding) {
        event.preventDefault();
        return;
      }
      if (event.deltaY === 0) return;
      const target = slideFor(event.deltaY > 0);
      if (target === null) return;
      event.preventDefault();
      slideTo(target);
    };

    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!active()) return;
      /* the rest of a committed swipe must never reach native scroll — it
         would fight the slide frame by frame */
      if (sliding) {
        if (event.cancelable) event.preventDefault();
        return;
      }
      if (touchY === null) return;
      const current = event.touches[0]?.clientY ?? touchY;
      const travel = touchY - current;
      const y = window.scrollY;
      const cover = coverAt();
      /* inside the handoff the page never drifts on its own */
      const inside = y > 0 && y < cover - 1;
      if (Math.abs(travel) < SWIPE_COMMIT) {
        if (inside && event.cancelable) event.preventDefault();
        return;
      }
      const target = slideFor(travel > 0);
      if (target === null) return;
      if (event.cancelable) event.preventDefault();
      touchY = null;
      slideTo(target);
    };

    const onTouchEnd = () => {
      touchY = null;
    };

    /* keyboard, scrollbar or leftover momentum: settle whichever way it was going */
    const onScroll = () => {
      if (!active() || sliding) return;
      const y = window.scrollY;
      if (y !== lastY) direction = y > lastY ? 1 : -1;
      lastY = y;
      window.clearTimeout(settleId);
      settleId = window.setTimeout(() => {
        if (sliding || !active() || touchY !== null) return;
        const now = window.scrollY;
        const cover = coverAt();
        if (now > 0 && now < cover - 1) slideTo(direction < 0 ? 0 : cover);
      }, SETTLE_DELAY);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settleId);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("scroll", onScroll);
    };
  }, [storyRef]);
}
