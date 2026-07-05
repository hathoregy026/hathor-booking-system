import { ScrollTrigger } from "gsap/ScrollTrigger";

export function alignDomeContentGap(root: HTMLElement, next: HTMLElement) {
  const dome = root.querySelector<HTMLElement>(".dome-container");
  const landing = root.querySelector<HTMLElement>(".pt-sheet__landing");
  if (!dome || !next) return;

  void document.body.offsetHeight;

  const domeBottom =
    landing?.getBoundingClientRect().bottom ?? dome.getBoundingClientRect().bottom;
  const nextTop = next.getBoundingClientRect().top;
  let gap = nextTop - domeBottom;

  if (gap > 0) {
    next.style.marginTop = `-${gap}px`;
  } else {
    next.style.marginTop = "0";
  }

  console.log("Dome bottom:", domeBottom, "Next top:", nextTop, "Gap:", gap);
  ScrollTrigger.refresh();
}

export function alignCruisesDomeContentGap(collapseTrack = false) {
  const root = document.querySelector<HTMLElement>("[data-cruises-scroll]");
  const next = document.querySelector<HTMLElement>(".next-section");
  if (!root || !next) return;

  if (collapseTrack) {
    root.style.height = "auto";
    root.style.minHeight = "0";
  }

  alignDomeContentGap(root, next);
}

export function restoreCruisesScrollTrack(pinVh: number) {
  const root = document.querySelector<HTMLElement>("[data-cruises-scroll]");
  const next = document.querySelector<HTMLElement>(".next-section");
  if (!root) return;

  root.style.height = `${window.innerHeight * (1 + pinVh)}px`;
  root.style.minHeight = "";
  if (next) next.style.marginTop = "0";
  ScrollTrigger.refresh();
}
