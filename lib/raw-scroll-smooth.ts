/** Back-compat bridge to the shared public scroll controller. */
import { ensurePublicScrollController } from "@/lib/public-scroll-controller";

export const RAW_SCROLL_LENIS_DURATION = 1.4;

export function pageOwnsLenis(): boolean {
  if (typeof window === "undefined") return false;
  return ensurePublicScrollController().mode === "lenis";
}

export function bindRawScrollSmooth(): () => void {
  ensurePublicScrollController();
  return () => {};
}
