"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { SITE_IMAGE_QUALITY } from "@/lib/site-image-quality";
import { shouldLightenMotionForDevice } from "@/lib/touch-device";

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
  const [lightTouch, setLightTouch] = useState(false);

  useLayoutEffect(() => {
    setLightTouch(shouldLightenMotionForDevice());
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  /* Same parallax language — half travel / scale on real phones. */
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    lightTouch ? ["0%", "12%"] : ["0%", "28%"],
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    lightTouch ? [1, 1.02] : [1.02, 1.06],
  );

  return (
    <div
      ref={containerRef}
      className={`hathor-parallax-hero__frame ${className}`}
    >
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
