/**
 * Production pages use the frozen /test-scroll-reveal scroll engine verbatim.
 * Do not duplicate logic here — re-export only.
 */
export {
  useTestScrollTransition as usePageScrollTransition,
  refreshTestScrollTransition as refreshPageScrollTransition,
} from "@/hooks/useTestScrollTransition";
