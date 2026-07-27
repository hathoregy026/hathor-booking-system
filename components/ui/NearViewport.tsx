"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type NearViewportProps = {
  children: ReactNode;
  /** Expand the intersection root so media can warm before it enters view. */
  rootMargin?: string;
  /** Reserve space before children mount to limit layout shift. */
  minHeight?: CSSProperties["minHeight"];
  className?: string;
  style?: CSSProperties;
  /** When true, mount immediately (e.g. first carousel slide). */
  eager?: boolean;
};

/**
 * Delays mounting heavy children (images) until the shell is near the viewport.
 * Prevents below-fold Next/Image nodes from racing the hero on first paint.
 */
export function NearViewport({
  children,
  rootMargin = "180px 0px",
  minHeight,
  className,
  style,
  eager = false,
}: NearViewportProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(eager);

  useEffect(() => {
    if (eager || show) return;
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setShow(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShow(true);
        observer.disconnect();
      },
      { rootMargin, threshold: 0.01 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [eager, rootMargin, show]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        ...(!show && minHeight != null ? { minHeight } : null),
      }}
    >
      {show ? children : null}
    </div>
  );
}
