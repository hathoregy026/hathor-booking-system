"use client";

import { useEffect, useRef } from "react";

type Ripple = { x: number; y: number; started: number };
type ShipBounds = { x: number; y: number; width: number; height: number };

const ARRIVAL_FADE_MS = 9000;
const RIPPLE_FADE_MS = 4200;
const FRAME_INTERVAL_MS = 1000 / 30;

/** A cream-on-cream height field: the light and shadow are the water, not drawn lines. */
export function ShipWaterSurface({ awake }: { awake: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = canvas?.parentElement;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !section || !context) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let lastFrame = 0;
    let lastPointer = 0;
    let lastPointerX = -100;
    let lastPointerY = -100;
    let image: ImageData;
    let ship: ShipBounds = { x: 0, y: 0, width: 1, height: 1 };
    let ripples: Ripple[] = [];
    const arrivalStarted = awake ? performance.now() : Number.POSITIVE_INFINITY;

    function measure() {
      if (!canvas || !section || !context) return;
      const sectionRect = section.getBoundingClientRect();
      const planRect = section.querySelector(".ship-plan--compact")?.getBoundingClientRect();
      const sampleStep = sectionRect.width > 700 ? 5 : 4;
      canvas.width = Math.max(1, Math.ceil(sectionRect.width / sampleStep));
      canvas.height = Math.max(1, Math.ceil(sectionRect.height / sampleStep));
      image = context.createImageData(canvas.width, canvas.height);
      if (planRect) ship = {
        x: planRect.left - sectionRect.left,
        y: planRect.top - sectionRect.top,
        width: planRect.width,
        height: planRect.height,
      };
    }

    function draw(now: number) {
      frame = 0;
      if (!canvas || !context || motionPreference.matches) return;
      if (now - lastFrame < FRAME_INTERVAL_MS) {
        frame = requestAnimationFrame(draw);
        return;
      }
      lastFrame = now;
      ripples = ripples.filter(ripple => now - ripple.started < RIPPLE_FADE_MS);
      const arrivalAge = awake ? now - arrivalStarted : ARRIVAL_FADE_MS;
      const arrival = Math.max(0, 1 - arrivalAge / ARRIVAL_FADE_MS) ** 1.35;
      if (arrival < .003 && ripples.length === 0) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      const pixels = image.data;
      const xScale = section!.clientWidth / canvas.width;
      const yScale = section!.clientHeight / canvas.height;
      const centreX = ship.x + ship.width * .49;
      const centreY = ship.y + ship.height * .5;
      const radiusX = Math.max(1, ship.width * .54);
      const radiusY = Math.max(1, ship.height * .46);
      const time = now / 1000;
      const arrivalTime = Math.max(0, arrivalAge) / 1000;

      for (let row = 0; row < canvas.height; row++) {
        const y = row * yScale;
        for (let column = 0; column < canvas.width; column++) {
          const x = column * xScale;
          const ellipse = Math.hypot((x - centreX) / radiusX, (y - centreY) / radiusY);
          const distance = (ellipse - 1) * radiusY;
          const reach = Math.exp(-Math.max(0, distance) / 350);
          const fold = Math.sin(distance * .055 - arrivalTime * 1.65 + .32 * Math.sin(x * .008));
          const meander = Math.sin(x * .009 - time * .25) * .85 + Math.sin(y * .019 + time * .3) * .4;
          const crossing = Math.sin(y * .055 + x * .018 - time * .9 + meander);
          const reflection = Math.sin((x - y * .8) * .027 + time * .68 + Math.sin(y * .019) * .65);
          let light = arrival * (fold * reach * .9 + crossing * .58 + reflection * .38);

          for (const ripple of ripples) {
            const age = (now - ripple.started) / 1000;
            const dx = x - ripple.x;
            const dy = y - ripple.y;
            const spread = 48 + age * 62;
            const envelope = Math.exp(
              -(dx * dx / (spread * spread * 2.2) + dy * dy / (spread * spread * .8)),
            ) * Math.exp(-age / 2.3);
            const wake = Math.sin(dx * .045 + dy * .092 - age * 5 + Math.sin(dx * .022) * .7)
              + Math.sin(dx * -.033 + dy * .067 + age * 3.2) * .48;
            light += wake * envelope * .82;
          }

          light = Math.max(-1.2, Math.min(1.2, light));
          const index = (row * canvas.width + column) * 4;
          pixels[index] = 236 + light * (light > 0 ? 20 : 28);
          pixels[index + 1] = 232 + light * (light > 0 ? 22 : 38);
          pixels[index + 2] = 223 + light * (light > 0 ? 23 : 48);
          pixels[index + 3] = 255;
        }
      }
      context.putImageData(image, 0, 0);
      frame = requestAnimationFrame(draw);
    }

    function start() {
      if (!frame && !motionPreference.matches) frame = requestAnimationFrame(draw);
    }

    function addRipple(event: PointerEvent) {
      if (motionPreference.matches) return;
      const now = performance.now();
      const rect = section!.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (now - lastPointer < 85 && Math.hypot(x - lastPointerX, y - lastPointerY) < 35) return;
      lastPointer = now;
      lastPointerX = x;
      lastPointerY = y;
      ripples.push({ x, y, started: now });
      if (ripples.length > 5) ripples.shift();
      start();
    }

    function onPointerMove(event: PointerEvent) {
      if (event.pointerType !== "touch") addRipple(event);
    }

    function onMotionChange() {
      if (motionPreference.matches) {
        cancelAnimationFrame(frame);
        frame = 0;
        ripples = [];
        context!.clearRect(0, 0, canvas!.width, canvas!.height);
      } else start();
    }

    measure();
    const resizeObserver = new ResizeObserver(() => { measure(); start(); });
    resizeObserver.observe(section);
    section.addEventListener("pointermove", onPointerMove, { passive: true });
    section.addEventListener("pointerdown", addRipple, { passive: true });
    motionPreference.addEventListener("change", onMotionChange);
    if (awake) start();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      section.removeEventListener("pointermove", onPointerMove);
      section.removeEventListener("pointerdown", addRipple);
      motionPreference.removeEventListener("change", onMotionChange);
    };
  }, [awake]);

  return <canvas ref={canvasRef} className="h3-ship__water-surface" aria-hidden="true" />;
}
