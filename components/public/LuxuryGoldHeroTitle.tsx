"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type LuxuryGoldHeroTitleProps = {
  children: ReactNode;
  className?: string;
};

function childrenToLabel(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(childrenToLabel).join("");
  }
  return "";
}

type Box = { x: number; y: number; width: number; height: number };

const FALLBACK_BOX: Box = { x: 0, y: -80, width: 640, height: 160 };
const CYCLE_MS = 6000;

/**
 * SVG metallic gold title — one <text>, animated diagonal metal gradient.
 * Outer `.hero-line--left` keeps GSAP transform/opacity.
 */
export function LuxuryGoldHeroTitle({
  children,
  className = "",
}: LuxuryGoldHeroTitleProps) {
  const label = childrenToLabel(children).trim();
  const rawId = useId().replace(/:/g, "");
  const gradientId = `lux-gold-${rawId}`;
  const textRef = useRef<SVGTextElement>(null);
  const gradientRef = useRef<SVGLinearGradientElement>(null);
  const [box, setBox] = useState<Box>(FALLBACK_BOX);
  const [reducedMotion, setReducedMotion] = useState(false);

  const measure = useCallback(async () => {
    if (!label || !textRef.current) return;
    try {
      if (typeof document !== "undefined" && document.fonts?.ready) {
        await document.fonts.ready;
      }
    } catch {
      /* fonts.ready can reject — still measure */
    }
    const node = textRef.current;
    if (!node) return;
    const b = node.getBBox();
    if (!Number.isFinite(b.width) || b.width < 1) return;
    const padX = Math.max(6, b.width * 0.03);
    const padY = Math.max(8, b.height * 0.1);
    setBox({
      x: b.x - padX,
      y: b.y - padY,
      width: b.width + padX * 2,
      height: b.height + padY * 2,
    });
  }, [label]);

  useLayoutEffect(() => {
    void measure();
    const t1 = window.setTimeout(() => {
      void measure();
    }, 120);
    const t2 = window.setTimeout(() => {
      void measure();
    }, 600);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [measure]);

  useEffect(() => {
    const onResize = () => {
      void measure();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measure]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const period = Math.max(40, box.width * 0.11);
  /* Park pause so a white specular sits inside the glyphs before the sweep */
  const pauseTx = -period * 0.42;
  const travel = box.width * 1.05;

  useEffect(() => {
    const grad = gradientRef.current;
    if (!grad) return;

    if (reducedMotion) {
      grad.removeAttribute("data-freeze-tx");
      grad.setAttribute("gradientTransform", `translate(${pauseTx} 0)`);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const easeInOut = (u: number) => u * u * (3 - 2 * u);

    const tick = (now: number) => {
      const freeze = grad.getAttribute("data-freeze-tx");
      if (freeze != null) {
        grad.setAttribute("gradientTransform", `translate(${freeze} 0)`);
        raf = window.requestAnimationFrame(tick);
        return;
      }

      const t = ((now - start) % CYCLE_MS) / CYCLE_MS;
      let tx = pauseTx;
      if (t < 0.2) {
        tx = pauseTx;
      } else if (t < 0.7) {
        const u = easeInOut((t - 0.2) / 0.5);
        tx = pauseTx - travel * u;
      } else {
        tx = pauseTx - travel;
      }
      grad.setAttribute("gradientTransform", `translate(${tx} 0)`);
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [box.width, pauseTx, travel, reducedMotion]);

  if (!label) return null;

  const gx1 = box.x;
  const gy1 = box.y + box.height * 0.05;
  const gx2 = box.x + period;
  const gy2 = box.y + box.height * 0.95;

  return (
    <span className={`luxuryGoldHeroTitle ${className}`.trim()}>
      <svg
        className="luxuryGoldHeroTitle__svg"
        width={box.width}
        height={box.height}
        viewBox={`${box.x} ${box.y} ${box.width} ${box.height}`}
        role="img"
        aria-label={label}
        overflow="visible"
      >
        <defs>
          <linearGradient
            ref={gradientRef}
            id={gradientId}
            gradientUnits="userSpaceOnUse"
            x1={gx1}
            y1={gy1}
            x2={gx2}
            y2={gy2}
            spreadMethod="repeat"
            gradientTransform={`translate(${pauseTx} 0)`}
          >
            {/* Jewelry gold: dark creases + rich body + wide white specular */}
            <stop offset="0%" stopColor="#3a1600" />
            <stop offset="8%" stopColor="#8a4208" />
            <stop offset="16%" stopColor="#d49412" />
            <stop offset="24%" stopColor="#f6c848" />
            <stop offset="32%" stopColor="#fff4c4" />
            <stop offset="38%" stopColor="#ffffff" />
            <stop offset="48%" stopColor="#ffffff" />
            <stop offset="54%" stopColor="#fff0b0" />
            <stop offset="62%" stopColor="#e8b020" />
            <stop offset="70%" stopColor="#6a3006" />
            <stop offset="78%" stopColor="#c87810" />
            <stop offset="86%" stopColor="#ffd056" />
            <stop offset="93%" stopColor="#fff6d0" />
            <stop offset="100%" stopColor="#3a1600" />
          </linearGradient>
        </defs>
        <text
          ref={textRef}
          className="luxuryGoldHeroTitle__text"
          x={0}
          y={0}
          fill={`url(#${gradientId})`}
          stroke="#2e1604"
          strokeWidth={0.35}
          strokeOpacity={0.3}
          paintOrder="stroke fill"
          dominantBaseline="alphabetic"
        >
          {label}
        </text>
      </svg>
    </span>
  );
}
