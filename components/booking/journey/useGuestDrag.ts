"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

/**
 * Pointer-based dragging for guest tiles, so mouse, touch and pen behave the
 * same. HTML5 drag-and-drop is skipped on purpose: phones do not support it
 * reliably and it cannot be styled.
 *
 * Targets are found by hit-testing `[data-hj-drop]`, whose value is
 * "cabin:<id>", "type:<room type>" or "pool". A press that does not move is a
 * tap, and the tile's own click handler (also the keyboard path) takes over.
 */

export type DragState = { guestId: string; x: number; y: number; over: string | null };

const THRESHOLD = 6;
const EDGE = 90;

function dropAt(x: number, y: number): string | null {
  const element = document.elementFromPoint(x, y);
  return element?.closest<HTMLElement>("[data-hj-drop]")?.dataset.hjDrop ?? null;
}

export function useGuestDrag(onDrop: (guestId: string, target: string) => void) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const session = useRef<{ guestId: string; pointerId: number; startX: number; startY: number; x: number; y: number; moved: boolean } | null>(null);
  const suppressUntil = useRef(0);
  const frame = useRef(0);
  const dropRef = useRef(onDrop);
  const detach = useRef<() => void>(() => undefined);

  useEffect(() => {
    dropRef.current = onDrop;
  }, [onDrop]);

  useEffect(() => () => detach.current(), []);

  const begin = useCallback((event: ReactPointerEvent<HTMLElement>, guestId: string) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    detach.current();
    session.current = {
      guestId,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      x: event.clientX,
      y: event.clientY,
      moved: false,
    };

    // Near the top or bottom of the window, keep scrolling so a guest can
    // reach a cabin further down the list.
    const scroll = () => {
      const current = session.current;
      if (!current?.moved) return;
      const { y } = current;
      if (y < EDGE) window.scrollBy(0, -Math.ceil((EDGE - y) / 5));
      else if (y > window.innerHeight - EDGE) window.scrollBy(0, Math.ceil((y - (window.innerHeight - EDGE)) / 5));
      frame.current = requestAnimationFrame(scroll);
    };

    const move = (next: PointerEvent) => {
      const current = session.current;
      if (!current || next.pointerId !== current.pointerId) return;
      if (!current.moved && Math.hypot(next.clientX - current.startX, next.clientY - current.startY) < THRESHOLD) return;
      if (!current.moved) {
        current.moved = true;
        frame.current = requestAnimationFrame(scroll);
      }
      next.preventDefault();
      current.x = next.clientX;
      current.y = next.clientY;
      setDrag({ guestId: current.guestId, x: next.clientX, y: next.clientY, over: dropAt(next.clientX, next.clientY) });
    };

    const end = (last: PointerEvent) => {
      const current = session.current;
      if (!current || last.pointerId !== current.pointerId) return;
      detach.current();
      session.current = null;
      if (!current.moved) return;
      suppressUntil.current = Date.now() + 400;
      setDrag(null);
      const target = last.type === "pointercancel" ? null : dropAt(last.clientX, last.clientY);
      if (target) dropRef.current(current.guestId, target);
    };

    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    detach.current = () => {
      cancelAnimationFrame(frame.current);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      detach.current = () => undefined;
    };
  }, []);

  /** True while the click that trails a finished drag should be ignored. */
  const justDragged = useCallback(() => Date.now() < suppressUntil.current, []);

  return { drag, begin, justDragged };
}
