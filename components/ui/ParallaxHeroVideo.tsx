"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

const HERO_VOLUME = 0.3;

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const userUnmutedRef = useRef(false);
  const [isMuted, setIsMuted] = useState(true);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1.18]);

  useLayoutEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.volume = HERO_VOLUME;
    void video.play().catch(() => {});
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    userUnmutedRef.current = false;
    setIsMuted(true);

    const startPlayback = () => {
      if (userUnmutedRef.current) {
        video.volume = HERO_VOLUME;
        void video.play().catch(() => {});
        return;
      }

      video.muted = true;
      video.defaultMuted = true;
      video.volume = HERO_VOLUME;
      void video.play().catch(() => {});
    };

    startPlayback();
    video.addEventListener("loadedmetadata", startPlayback, { once: true });
    video.addEventListener("canplay", startPlayback, { once: true });

    return () => {
      video.removeEventListener("loadedmetadata", startPlayback);
      video.removeEventListener("canplay", startPlayback);
    };
  }, [src]);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!isMuted) {
      video.muted = true;
      video.defaultMuted = true;
      userUnmutedRef.current = false;
      setIsMuted(true);
      return;
    }

    userUnmutedRef.current = true;
    video.defaultMuted = false;
    video.muted = false;
    video.volume = HERO_VOLUME;

    setIsMuted(false);

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        userUnmutedRef.current = false;
        video.muted = true;
        video.defaultMuted = true;
        setIsMuted(true);
      });
    }
  };

  return (
    <div ref={containerRef} className={`hathor-parallax-hero__frame ${className}`}>
      <motion.div className="hathor-parallax-hero__motion" style={{ y, scale }}>
        <video
          ref={videoRef}
          className="hathor-parallax-hero__video w-full h-full"
          src={src}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          preload="auto"
          // @ts-expect-error fetchPriority is valid on video in modern browsers
          fetchPriority="high"
          aria-label={ariaLabel}
          {...(poster ? { poster } : {})}
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
