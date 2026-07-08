"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { ReactNode } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
  viewportAmount?: number;
  viewportMargin?: string;
};

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  viewportAmount = 0.18,
  viewportMargin = "0px 0px -10% 0px",
}: ScrollRevealProps) {
  const reducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={[
        "scroll-reveal",
        `scroll-reveal--${direction}`,
        isVisible ? "is-visible" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-lux-scroll-reveal
      viewport={{ once: true, margin: viewportMargin, amount: viewportAmount }}
      onViewportEnter={() => setIsVisible(true)}
      style={{ transitionDelay: `${delay / 1000}s` }}
    >
      {children}
    </motion.div>
  );
}
