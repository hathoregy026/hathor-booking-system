"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

const HERO_VOLUME = 0.3;

type ParallaxHeroVideoProps = {
  sources: string[];
  poster: string;
  className?: string;
  ariaLabel: string;
};

export function ParallaxHeroVideo({
  sources,
  poster,
  className = "",
  ariaLabel,
}: ParallaxHeroVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [activeSourceIndex, setActiveSourceIndex] = useState(0);

  const activeSrc = sources[activeSourceIndex] ?? sources[0] ?? "";

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1.18]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.volume = HERO_VOLUME;
    setIsMuted(true);

    const startPlayback = async () => {
      try {
        await video.play();
      } catch {
        /* autoplay blocked — poster remains visible until interaction */
      }
    };

    const onReady = () => {
      void startPlayback();
    };

    video.addEventListener("loadeddata", onReady);
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      void startPlayback();
    }

    return () => video.removeEventListener("loadeddata", onReady);
  }, [activeSrc]);

  const tryNextSource = () => {
    if (activeSourceIndex < sources.length - 1) {
      setActiveSourceIndex((index) => index + 1);
    }
  };

  const toggleMute = async () => {
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !isMuted;
    if (nextMuted) {
      video.muted = true;
      setIsMuted(true);
      return;
    }

    video.muted = false;
    video.volume = HERO_VOLUME;

    try {
      await video.play();
      setIsMuted(false);
    } catch {
      video.muted = true;
      setIsMuted(true);
    }
  };

  return (
    <div ref={containerRef} className={`hathor-parallax-hero__frame ${className}`}>
      <motion.div className="hathor-parallax-hero__motion" style={{ y, scale }}>
        <video
          ref={videoRef}
          key={activeSrc}
          className="hathor-parallax-hero__video w-full h-full"
          poster={poster}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-label={ariaLabel}
          onError={tryNextSource}
        >
          <source src={activeSrc} type="video/mp4" />
        </video>
      </motion.div>

      <button
        type="button"
        className="hathor-hero-audio-toggle cursor-hover"
        onClick={() => {
          void toggleMute();
        }}
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
