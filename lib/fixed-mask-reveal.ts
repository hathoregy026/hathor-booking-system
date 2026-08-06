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
