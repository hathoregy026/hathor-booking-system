/** Fixed-Background Mask Reveal helpers (curtain-reveal / springs design grammar). */

export function luxWipe(t: number) {
  const hold = 0.14;
  if (t <= hold) return 0;
  if (t >= 1 - hold) return 1;
  const u = (t - hold) / (1 - hold * 2);
  const ease = (x: number) => x * x * x * (x * (6 * x - 15) + 10);
  return ease(Math.max(0, Math.min(1, u)));
}

export function applyVerticalWipe(
  panels: HTMLElement[],
  progress: number,
) {
  const n = panels.length;
  const wipes = Math.max(1, n - 1);

  panels.forEach((panel, i) => {
    if (i === 0) {
      panel.style.clipPath = "inset(0% 0 0 0)";
      panel.style.zIndex = "1";
      return;
    }

    const start = (i - 1) / wipes;
    const end = i / wipes;
    const raw = Math.max(0, Math.min(1, (progress - start) / (end - start)));
    const inset = (1 - luxWipe(raw)) * 100;

    panel.style.clipPath = `inset(${inset}% 0 0 0)`;
    panel.style.zIndex = String(1 + i);
  });

  return Math.min(n - 1, Math.max(0, Math.floor(progress * wipes + 0.55)));
}

export function applyPolygonBottomReveal(el: HTMLElement, progress: number) {
  const pct = Math.max(0, Math.min(100, progress * 100));
  el.style.clipPath = `polygon(0% ${100 - pct}%, 100% ${100 - pct}%, 100% 100%, 0% 100%)`;
}

/** Amenities-derived wipe angles for stacked image reveals. */
export type AmenitiesWipeAngle = "up" | "right" | "down" | "left";

/** Cycle so each consecutive slide arrives from a different amenities angle. */
export function amenitiesWipeAngleForIndex(index: number): AmenitiesWipeAngle {
  const angles: AmenitiesWipeAngle[] = ["up", "right", "down", "left"];
  return angles[index % angles.length]!;
}

export function amenitiesWipeClosed(angle: AmenitiesWipeAngle): string {
  switch (angle) {
    case "up":
      // i-slider stacked image — rises from bottom
      return "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)";
    case "right":
      // i-intro caption — expands from the right edge
      return "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)";
    case "down":
      // i-slider images column entrance — falls from top
      return "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)";
    case "left":
      // mirror of i-intro — expands from the left edge
      return "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)";
  }
}

export function amenitiesWipeOpen(): string {
  return "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
}

/** Interpolate closed → open clip for a given amenities wipe angle. */
export function amenitiesWipeClip(
  angle: AmenitiesWipeAngle,
  progress: number,
): string {
  const t = Math.max(0, Math.min(1, progress));
  if (t <= 0) return amenitiesWipeClosed(angle);
  if (t >= 1) return amenitiesWipeOpen();

  switch (angle) {
    case "up": {
      const top = (1 - t) * 100;
      return `polygon(0% ${top}%, 100% ${top}%, 100% 100%, 0% 100%)`;
    }
    case "down": {
      const bottom = t * 100;
      return `polygon(0% 0%, 100% 0%, 100% ${bottom}%, 0% ${bottom}%)`;
    }
    case "right": {
      const left = (1 - t) * 100;
      return `polygon(${left}% 0%, 100% 0%, 100% 100%, ${left}% 100%)`;
    }
    case "left": {
      const right = t * 100;
      return `polygon(0% 0%, ${right}% 0%, ${right}% 100%, 0% 100%)`;
    }
  }
}

export function amenitiesWipeOrigin(angle: AmenitiesWipeAngle): string {
  switch (angle) {
    case "up":
      return "50% 100%";
    case "down":
      return "50% 0%";
    case "right":
      return "100% 50%";
    case "left":
      return "0% 50%";
  }
}
