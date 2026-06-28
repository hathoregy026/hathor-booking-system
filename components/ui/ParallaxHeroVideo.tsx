"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

type ParallaxHeroVideoProps = {
  src: string;
  poster?: string;
  className?: string;
  ariaLabel: string;
};

export function ParallaxHeroVideo({
  src,
  poster,
  className = "",
  ariaLabel,
}: ParallaxHeroVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1.18]);

  return (
    <div ref={containerRef} className={`hathor-parallax-hero__frame ${className}`}>
      <motion.div className="hathor-parallax-hero__motion" style={{ y, scale }}>
        <video
          className="hathor-parallax-hero__video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={poster}
          aria-label={ariaLabel}
        >
          <source src={src} type="video/mp4" />
        </video>
      </motion.div>
    </div>
  );
}
