import { ScrollTrigger } from "gsap/ScrollTrigger";
import { refreshPageScrollTransition } from "@/components/pages/pageScrollTransitionEngine";

/**
 * PageScrollTransition pins the hero sheet before editorial ScrollTriggers
 * can measure layout. Initializing editorial motion in the same layout pass
 * crashes ScrollTrigger on client-side navigations.
 */
export function deferEditorialMotionInit(
  run: () => void,
  delayMs = 120,
): () => void {
  let frame1 = 0;
  let frame2 = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  frame1 = requestAnimationFrame(() => {
    frame2 = requestAnimationFrame(() => {
      refreshPageScrollTransition();
      timer = setTimeout(() => {
        run();
        ScrollTrigger.refresh();
      }, delayMs);
    });
  });

  return () => {
    cancelAnimationFrame(frame1);
    cancelAnimationFrame(frame2);
    if (timer) clearTimeout(timer);
  };
}
