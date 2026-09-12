"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CinematicBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  showVideo?: boolean;
}

export function CinematicBackground({
  className,
  children,
  showVideo = true,
}: CinematicBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Imperative video playback setup on ref attachment
  const handleRef = (node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node) {
      node.muted = true;
      node.defaultMuted = true;
      node.playsInline = true;
      node.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const playVideo = async () => {
      try {
        if (video.paused) {
          await video.play();
        }
        setIsPlaying(true);
      } catch {
        // Fallback for autoplay policies
      }
    };

    playVideo();

    const onCanPlay = () => playVideo();
    const onPlaying = () => setIsPlaying(true);
    const onTimeUpdate = () => {
      if (video.currentTime > 0) setIsPlaying(true);
    };

    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("timeupdate", onTimeUpdate);

    // Resume on first user touch, scroll, or tab focus
    const handleGesture = () => playVideo();
    window.addEventListener("pointerdown", handleGesture, { once: true, passive: true });
    window.addEventListener("touchstart", handleGesture, { once: true, passive: true });
    window.addEventListener("scroll", handleGesture, { once: true, passive: true });
    window.addEventListener("focus", playVideo);

    return () => {
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("timeupdate", onTimeUpdate);
      window.removeEventListener("pointerdown", handleGesture);
      window.removeEventListener("touchstart", handleGesture);
      window.removeEventListener("scroll", handleGesture);
      window.removeEventListener("focus", playVideo);
    };
  }, []);

  return (
    <div className={cn("relative w-full overflow-hidden bg-obsidian-950", className)}>
      {/* 1. Base Fallback Poster Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none transition-transform duration-1000 will-change-transform scale-105"
        style={{
          backgroundImage: "url('/images/hero-melt-shop.jpg')",
          filter: "brightness(0.65) contrast(1.10) saturate(1.15)",
        }}
      />

      {/* 2. Primary Running Looping Cinematic Video */}
      {showVideo && (
        <video
          ref={handleRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/images/hero-melt-shop.jpg"
          aria-hidden="true"
          className={cn(
            "absolute inset-0 h-full w-full object-cover pointer-events-none transition-opacity duration-1000",
            isPlaying ? "opacity-95" : "opacity-0"
          )}
          style={{
            filter: "brightness(0.72) contrast(1.12) saturate(1.2)",
          }}
        >
          <source src="/videos/hero-melt-shop.mp4" type="video/mp4" />
          <source src="/videos/hero-rolling-mill.mp4" type="video/mp4" />
        </video>
      )}

      {/* 3. Engineering Precision Grid & Ambient Thermal Glow Layers */}
      <div className="absolute inset-0 bg-industrial-grid opacity-35 pointer-events-none z-[2]" />
      <div className="absolute inset-0 glow-thermal-ambient pointer-events-none z-[2]" />

      {/* 4. Balanced Obsidian Carbon Vignette for Sharp Text Contrast Without Crushing Detail */}
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian-950/75 via-obsidian-950/25 to-obsidian-950 pointer-events-none z-[2]" />
      <div
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 36%, rgba(10, 14, 23, 0.20) 0%, rgba(10, 14, 23, 0.55) 68%, #0a0e17 100%)",
        }}
      />

      {/* 5. Molten Orange & Cyan Horizon Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-thermal-500/50 via-amber-400/40 to-transparent pointer-events-none z-[3]" />

      {/* 6. Foreground Content */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}
