"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Play, Pause, Video } from "lucide-react";

interface CinematicBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  showVideo?: boolean;
  intensity?: "subtle" | "medium" | "vivid";
}

export function CinematicBackground({
  className,
  children,
  showVideo = true,
}: CinematicBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoMode, setVideoMode] = useState<"furnace" | "sparks">("furnace");

  // Immediate imperative playback setup when ref attaches to DOM
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
        // Fallback for strict browser autoplay policies
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

    // Fallback: resume on first user interaction or tab focus
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
  }, [videoMode]);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className={cn("relative w-full overflow-hidden bg-obsidian-950", className)}>
      {/* 1. Base Cinematic Furnace Photograph with Seamless Ken Burns Pan/Zoom */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 will-change-transform animate-ken-burns scale-105 pointer-events-none"
        style={{
          backgroundImage: "url('/images/furnace-bg.jpg')",
          filter: "brightness(0.40) contrast(1.15) saturate(1.1)",
        }}
      />

      {/* 2. Active Looping Video Layer */}
      {showVideo && (
        <video
          ref={handleRef}
          key={videoMode}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          className={cn(
            "absolute inset-0 h-full w-full object-cover pointer-events-none transition-opacity duration-1000",
            videoMode === "sparks"
              ? "mix-blend-screen opacity-40 md:opacity-50"
              : "opacity-70 mix-blend-screen",
            isPlaying ? "opacity-60 md:opacity-75" : "opacity-0"
          )}
        >
          {videoMode === "furnace" ? (
            <source src="/videos/furnace-stream.mp4" type="video/mp4" />
          ) : (
            <>
              <source src="/videos/sparks-loop.mp4" type="video/mp4" />
              <source src="/videos/sparks-loop.webm" type="video/webm" />
              <source src="/videos/sparks.mp4" type="video/mp4" />
            </>
          )}
        </video>
      )}

      {/* 3. Deep Obsidian Vignettes for High Text Contrast and Clean Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian-950/85 via-obsidian-950/50 to-obsidian-950 pointer-events-none z-[2]" />
      <div
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 38%, rgba(5, 7, 9, 0.65) 0%, rgba(5, 7, 9, 0.85) 65%, #050709 100%)",
        }}
      />

      {/* 4. Molten Orange Horizon Line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-thermal-500/40 to-transparent pointer-events-none z-[3]" />

      {/* 5. Floating Video Control & Perspective Switcher (Bottom Right) */}
      <div className="absolute bottom-3 right-4 z-20 hidden sm:flex items-center gap-2 rounded-lg bg-obsidian-950/85 border border-steel-800/80 px-2.5 py-1 text-xs backdrop-blur-md shadow-lg select-none">
        <button
          onClick={togglePlayback}
          className="flex items-center gap-1.5 text-steel-300 hover:text-white transition-colors"
          title={isPlaying ? "Pause background video" : "Resume background video"}
        >
          {isPlaying ? (
            <>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[10px] text-emerald-400 font-bold">LIVE</span>
            </>
          ) : (
            <>
              <Play className="h-3 w-3 text-thermal-400" />
              <span className="font-mono text-[10px] text-steel-400">PAUSED</span>
            </>
          )}
        </button>

        <span className="h-3 w-px bg-steel-700/80" />

        {/* Video Mode Switcher */}
        <button
          onClick={() => setVideoMode(videoMode === "furnace" ? "sparks" : "furnace")}
          className="flex items-center gap-1.5 text-steel-300 hover:text-thermal-300 transition-colors font-medium text-[11px]"
          title="Switch background video perspective"
        >
          <Video className="h-3 w-3 text-cyanPulse-400" />
          <span>{videoMode === "furnace" ? "Melt Stream" : "Sparks Loop"}</span>
        </button>
      </div>

      {/* 6. Foreground Content */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}
