"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

const HERO_VOLUME = 0.3;

type ParallaxHeroVideoProps = {
  src: string;
  poster: string;
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1.18]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = false;
    video.muted = false;
    video.volume = HERO_VOLUME;
    setIsMuted(false);

    const startPlayback = () => {
      video.muted = false;
      video.volume = HERO_VOLUME;
      void video.play().catch(() => {
        /* Autoplay blocked without gesture — keep unmuted; user can tap play area */
      });
    };

    startPlayback();
    video.addEventListener("canplay", startPlayback, { once: true });

    const onVolumeChange = () => {
      setIsMuted(video.muted);
    };
    video.addEventListener("volumechange", onVolumeChange);

    return () => {
      video.removeEventListener("canplay", startPlayback);
      video.removeEventListener("volumechange", onVolumeChange);
    };
  }, [src]);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    if (!video.muted) {
      video.volume = HERO_VOLUME;
      void video.play().catch(() => {});
    }
    setIsMuted(video.muted);
  };

  return (
    <div ref={containerRef} className={`hathor-parallax-hero__frame ${className}`}>
      <motion.div className="hathor-parallax-hero__motion" style={{ y, scale }}>
        <video
          ref={videoRef}
          className="hathor-parallax-hero__video w-full h-full"
          src={src}
          poster={poster}
          autoPlay
          loop
          playsInline
          preload="auto"
          // @ts-expect-error fetchPriority is valid on video in modern browsers
          fetchPriority="high"
          aria-label={ariaLabel}
        />
      </motion.div>

      <button
        type="button"
        className="hathor-hero-audio-toggle cursor-hover"
        onClick={toggleMute}
        aria-label={isMuted ? "Unmute hero video" : "Mute hero video"}
        aria-pressed={!isMuted}
      >
        {isMuted ? (
          <VolumeX className="hathor-hero-audio-toggle__icon" aria-hidden />
        ) : (
          <Volume2 className="hathor-hero-audio-toggle__icon" aria-hidden />
        )}
      </button>
    </div>
  );
}
