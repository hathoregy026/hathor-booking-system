/**
 * Canvas specular rim for Hathor CTAs — warm gold edge light that
 * follows the pointer and breathes slowly when idle.
 */

const PAD = 20;

export type SpecularFxHandle = {
  destroy: () => void;
};

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function parseRadius(el: HTMLElement): number {
  const raw = getComputedStyle(el).borderRadius.split(" ")[0] ?? "999px";
  if (raw.includes("%")) return 9999;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : 999;
}

export function mountSpecularButtonFx(host: HTMLElement): SpecularFxHandle {
  if (host.dataset.specularFx === "1") {
    return { destroy: () => undefined };
  }
  host.dataset.specularFx = "1";
  host.classList.add("specular-button");

  let fx = host.querySelector<HTMLElement>(":scope > .specular-button__fx");
  if (!fx) {
    fx = document.createElement("span");
    fx.className = "specular-button__fx";
    fx.setAttribute("aria-hidden", "true");
    const canvas = document.createElement("canvas");
    fx.appendChild(canvas);
    host.insertBefore(fx, host.firstChild);
  }

  const canvas = fx.querySelector("canvas");
  if (!canvas) {
    return { destroy: () => undefined };
  }

  const labelCandidates = Array.from(host.childNodes).filter((node) => {
    if (node === fx) return false;
    if (node instanceof HTMLElement && node.classList.contains("specular-button__fx")) {
      return false;
    }
    return true;
  });

  const alreadyLabeled = host.querySelector(":scope > .specular-button__label");
  if (!alreadyLabeled && labelCandidates.length > 0) {
    const label = document.createElement("span");
    label.className = "specular-button__label";
    for (const node of labelCandidates) {
      label.appendChild(node);
    }
    host.appendChild(label);
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return { destroy: () => undefined };
  }

  let raf = 0;
  let running = true;
  let pointerActive = false;
  let mx = 0.5;
  let my = 0.35;
  let targetMx = mx;
  let targetMy = my;
  let breath = 0;

  const resize = () => {
    const rect = host.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.ceil(rect.width + PAD * 2));
    const h = Math.max(1, Math.ceil(rect.height + PAD * 2));
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const draw = () => {
    if (!running) return;
    const rect = host.getBoundingClientRect();
    const w = rect.width + PAD * 2;
    const h = rect.height + PAD * 2;
    const btnW = rect.width;
    const btnH = rect.height;
    const radius = parseRadius(host);

    mx += (targetMx - mx) * 0.12;
    my += (targetMy - my) * 0.12;
    breath += 0.018;

    if (!pointerActive) {
      targetMx = 0.5 + Math.cos(breath) * 0.28;
      targetMy = 0.35 + Math.sin(breath * 0.85) * 0.18;
    }

    ctx.clearRect(0, 0, w, h);

    const cx = PAD + mx * btnW;
    const cy = PAD + my * btnH;
    const glowR = Math.max(btnW, btnH) * 0.95;

    /* Soft gold bloom outside the pill */
    ctx.save();
    const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
    bloom.addColorStop(0, "rgba(212, 194, 138, 0.2)");
    bloom.addColorStop(0.45, "rgba(182, 159, 100, 0.07)");
    bloom.addColorStop(1, "rgba(182, 159, 100, 0)");
    ctx.fillStyle = bloom;
    roundedRectPath(ctx, PAD - 6, PAD - 6, btnW + 12, btnH + 12, radius + 6);
    ctx.fill();
    ctx.restore();

    /* Specular rim stroke */
    const rim = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR * 0.85);
    rim.addColorStop(0, "rgba(245, 239, 228, 0.95)");
    rim.addColorStop(0.18, "rgba(212, 194, 138, 0.85)");
    rim.addColorStop(0.42, "rgba(182, 159, 100, 0.35)");
    rim.addColorStop(0.7, "rgba(182, 159, 100, 0.08)");
    rim.addColorStop(1, "rgba(182, 159, 100, 0)");

    ctx.strokeStyle = rim;
    ctx.lineWidth = 1.35;
    ctx.shadowColor = "rgba(212, 194, 138, 0.45)";
    ctx.shadowBlur = 8;
    roundedRectPath(ctx, PAD + 0.75, PAD + 0.75, btnW - 1.5, btnH - 1.5, radius);
    ctx.stroke();

    /* Inner hairline highlight (top edge bias) */
    ctx.shadowBlur = 0;
    const inner = ctx.createLinearGradient(PAD, PAD, PAD, PAD + btnH);
    inner.addColorStop(0, "rgba(255, 252, 245, 0.35)");
    inner.addColorStop(0.35, "rgba(212, 194, 138, 0.12)");
    inner.addColorStop(1, "rgba(182, 159, 100, 0)");
    ctx.strokeStyle = inner;
    ctx.lineWidth = 1;
    roundedRectPath(
      ctx,
      PAD + 1.5,
      PAD + 1.5,
      btnW - 3,
      btnH - 3,
      Math.max(0, radius - 1),
    );
    ctx.stroke();

    raf = window.requestAnimationFrame(draw);
  };

  const onPointerMove = (event: PointerEvent) => {
    const rect = host.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    pointerActive = true;
    targetMx = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    targetMy = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
  };

  const onPointerLeave = () => {
    pointerActive = false;
  };

  const ro = new ResizeObserver(() => {
    resize();
  });

  resize();
  ro.observe(host);
  host.addEventListener("pointermove", onPointerMove);
  host.addEventListener("pointerenter", onPointerMove);
  host.addEventListener("pointerleave", onPointerLeave);
  raf = window.requestAnimationFrame(draw);

  return {
    destroy: () => {
      running = false;
      window.cancelAnimationFrame(raf);
      ro.disconnect();
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerenter", onPointerMove);
      host.removeEventListener("pointerleave", onPointerLeave);
      fx?.remove();
      const label = host.querySelector(":scope > .specular-button__label");
      if (label) {
        while (label.firstChild) {
          host.appendChild(label.firstChild);
        }
        label.remove();
      }
      host.classList.remove("specular-button");
      delete host.dataset.specularFx;
    },
  };
}
