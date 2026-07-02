import type gsap from "gsap";
import type { ScrollTrigger } from "gsap/ScrollTrigger";

declare global {
  interface Window {
    gsap: typeof gsap;
    ScrollTrigger: typeof ScrollTrigger;
    TransitionForPages?: {
      init: (options?: Record<string, unknown>) => {
        destroy: () => void;
        refresh: () => void;
      } | null;
      destroy: () => void;
      refresh: () => void;
    };
  }
}

export {};
