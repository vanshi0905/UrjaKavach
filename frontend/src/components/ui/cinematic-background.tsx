"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CinematicBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  showVideo?: boolean;
  intensity?: "subtle" | "medium" | "vivid";
}

interface Ember {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  fadeSpeed: number;
  color: string;
}

export function CinematicBackground({
  className,
  children,
  showVideo = true,
  intensity = "medium",
}: CinematicBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Enforce properties directly on DOM element to satisfy all browser autoplay policies
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const startPlayback = async () => {
      try {
        if (video.paused) {
          await video.play();
        }
        setIsPlaying(true);
      } catch (err) {
        // Autoplay may be deferred until user interacts with the page
        console.debug("Video autoplay awaiting interaction:", err);
      }
    };

    // Attempt immediate playback
    startPlayback();

    // Event listeners to start as soon as data arrives or document becomes active
    const onCanPlay = () => startPlayback();
    const onLoadedData = () => startPlayback();
    const onPlaying = () => setIsPlaying(true);
    const onTimeUpdate = () => {
      if (video.currentTime > 0) setIsPlaying(true);
    };

    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("timeupdate", onTimeUpdate);

    // Fallback: resume playback on first user gesture or tab focus
    const handleUserGesture = () => {
      startPlayback();
    };

    window.addEventListener("pointerdown", handleUserGesture, { once: true, passive: true });
    window.addEventListener("touchstart", handleUserGesture, { once: true, passive: true });
    window.addEventListener("scroll", handleUserGesture, { once: true, passive: true });
    window.addEventListener("focus", startPlayback);

    return () => {
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("timeupdate", onTimeUpdate);
      window.removeEventListener("pointerdown", handleUserGesture);
      window.removeEventListener("touchstart", handleUserGesture);
      window.removeEventListener("scroll", handleUserGesture);
      window.removeEventListener("focus", startPlayback);
    };
  }, []);

  // Floating continuous embers on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const colors = [
      "rgba(249, 115, 22, ",   // Thermal orange
      "rgba(251, 146, 60, ",   // Light orange
      "rgba(245, 158, 11, ",   // Amber gold
      "rgba(234, 88, 12, ",    // Deep fiery orange
    ];

    const emberCount = intensity === "subtle" ? 25 : intensity === "medium" ? 45 : 65;
    const embers: Ember[] = Array.from({ length: emberCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.8,
      speedY: Math.random() * 0.7 + 0.3,
      speedX: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.6 + 0.2,
      fadeSpeed: (Math.random() * 0.004 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < embers.length; i++) {
        const e = embers[i];

        // Move upward
        e.y -= e.speedY;
        e.x += e.speedX;

        // Oscillate opacity
        e.opacity += e.fadeSpeed;
        if (e.opacity > 0.85 || e.opacity < 0.15) {
          e.fadeSpeed = -e.fadeSpeed;
        }

        // Seamless wrap around when reaching top
        if (e.y < -10) {
          e.y = height + 10;
          e.x = Math.random() * width;
        }
        if (e.x < -10) e.x = width + 10;
        if (e.x > width + 10) e.x = -10;

        // Draw soft glowing particle
        ctx.save();
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fillStyle = `${e.color}${Math.max(0, Math.min(1, e.opacity))})`;
        ctx.shadowBlur = e.size * 3;
        ctx.shadowColor = "rgba(249, 115, 22, 0.8)";
        ctx.fill();
        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [intensity]);

  return (
    <div className={cn("relative w-full overflow-hidden bg-obsidian-950", className)}>
      {/* 1. Base Cinematic Furnace Photograph with Seamless Ken Burns Pan/Zoom */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 will-change-transform animate-ken-burns scale-105 pointer-events-none"
        style={{
          backgroundImage: "url('/images/furnace-bg.jpg')",
          filter: "brightness(0.48) contrast(1.18) saturate(1.15)",
        }}
      />

      {/* 2. Base Darkening Gradient to Ensure Background Depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian-950/75 via-obsidian-950/45 to-obsidian-950 pointer-events-none" />

      {/* 3. Seamless Looping Industrial Sparks & Fire Video Layer */}
      {showVideo && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          className={cn(
            "absolute inset-0 h-full w-full object-cover pointer-events-none mix-blend-screen transition-opacity duration-1000",
            isPlaying ? "opacity-80 md:opacity-90" : "opacity-0"
          )}
          style={{
            filter: "contrast(1.15) brightness(1.15)",
          }}
        >
          <source src="/videos/sparks-loop.mp4" type="video/mp4" />
          <source src="/videos/sparks-loop.webm" type="video/webm" />
          <source src="/videos/sparks.mp4" type="video/mp4" />
        </video>
      )}

      {/* 4. Infinite Seamless Floating Embers Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full pointer-events-none z-[2]"
      />

      {/* 5. Deep Thermal Vignette & Text-Readability Mask */}
      <div
        className="absolute inset-0 pointer-events-none z-[3]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 35%, rgba(5, 7, 9, 0.25) 0%, rgba(5, 7, 9, 0.65) 75%, #050709 100%)",
        }}
      />

      {/* Subtle bottom molten orange horizon line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-thermal-500/40 to-transparent pointer-events-none z-[4]" />

      {/* 6. Foreground Content */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}
