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
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.defaultMuted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // Autoplay fallback
          console.log("Video waiting for user interaction or low power mode:", err);
        });
      }
    }
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
      {/* 1. Base Cinematic Furnace Photograph with Vibrant Industrial Glow */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 will-change-transform scale-105 pointer-events-none"
        style={{
          backgroundImage: "url('/images/furnace-bg.jpg')",
          filter: "brightness(0.85) contrast(1.18) saturate(1.3)",
        }}
      />

      {/* 2. Seamless Looping Industrial Sparks & Fire Video Layer */}
      {showVideo && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onLoadedData={() => setVideoLoaded(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover pointer-events-none mix-blend-screen transition-opacity duration-700",
            videoLoaded ? "opacity-85" : "opacity-65"
          )}
          poster="/images/furnace-bg.jpg"
        >
          <source src="/videos/sparks.mp4" type="video/mp4" />
          <source src="/videos/sparks.webm" type="video/webm" />
        </video>
      )}

      {/* 3. Infinite Seamless Floating Embers Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full pointer-events-none z-[2]"
      />

      {/* 4. Deep Thermal Vignette & Text-Readability Masks (Tuned so furnace glow & sparks are vividly visible) */}
      <div
        className="absolute inset-0 pointer-events-none z-[3]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 38%, rgba(5, 7, 9, 0.12) 0%, rgba(5, 7, 9, 0.40) 60%, rgba(5, 7, 9, 0.88) 100%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian-950/40 via-transparent to-obsidian-950/90 pointer-events-none z-[3]" />

      {/* Subtle bottom molten orange horizon line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-thermal-500/50 to-transparent pointer-events-none z-[4]" />

      {/* 5. Foreground Content */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}
