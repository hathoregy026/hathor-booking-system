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
  poster: _poster,
  className = "",
  ariaLabel,
}: ParallaxHeroVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1.18]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = HERO_VOLUME;
    video.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const startPlayback = async () => {
      video.muted = true;
      try {
        await video.play();
      } catch {
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

    const onReady = () => {
      void startPlayback();
    };

    video.addEventListener("canplay", onReady);
    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      void startPlayback();
    }

    return () => video.removeEventListener("canplay", onReady);
  }, [src]);

  useEffect(() => {
    const enableAudio = async () => {
      const video = videoRef.current;
      if (!video || !video.muted) return;

      video.muted = false;
      video.volume = HERO_VOLUME;
      setIsMuted(false);
      try {
        await video.play();
      } catch {
        video.muted = true;
        setIsMuted(true);
      }
    };

    document.addEventListener("pointerdown", enableAudio, { once: true });
    return () => document.removeEventListener("pointerdown", enableAudio);
  }, [src]);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
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
