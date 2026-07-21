"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { SITE_IMAGE_QUALITY } from "@/lib/site-image-quality";

type ParallaxHeroImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
};

export function ParallaxHeroImage({
  src,
  alt,
  priority = false,
  sizes = "100vw",
  className = "",
}: ParallaxHeroImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  /* Keep parallax, but avoid heavy upscale — sources are ~1536px */
  const scale = useTransform(scrollYProgress, [0, 1], [1.02, 1.06]);

  return (
    <div ref={containerRef} className={`hathor-parallax-hero__frame ${className}`}>
      <motion.div className="hathor-parallax-hero__motion" style={{ y, scale }}>
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          className="object-cover"
          sizes={sizes}
          quality={SITE_IMAGE_QUALITY}
        />
      </motion.div>
    </div>
  );
}
