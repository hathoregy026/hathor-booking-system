"use client";

import { useEffect, useRef } from "react";

/** Gold luxury cursor — desktop fine pointer only. */
export function CeCursor({ rootRef }: { rootRef: React.RefObject<HTMLElement | null> }) {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const cursor = cursorRef.current;
    if (!root || !cursor) return;

    const fine = window.matchMedia("(pointer: fine)").matches;
    const wide = window.matchMedia("(min-width: 1024px)").matches;
    if (!fine || !wide) {
      cursor.style.display = "none";
      return;
    }

    const pos = { x: 0, y: 0 };
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          cursor.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
          raf = 0;
        });
      }
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const interactive = t?.closest("a, button, [role='button'], label, input, select, textarea");
      cursor.classList.toggle("is-hover", Boolean(interactive));
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    root.addEventListener("mouseover", onOver);
    return () => {
      window.removeEventListener("mousemove", onMove);
      root.removeEventListener("mouseover", onOver);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [rootRef]);

  return <div ref={cursorRef} className="ce-cursor" aria-hidden="true" />;
}
