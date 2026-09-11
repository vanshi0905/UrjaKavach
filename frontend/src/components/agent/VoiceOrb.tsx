"use client";

import { useEffect, useRef } from "react";
import { VoiceState } from "@/lib/voice-agent";
import { Mic, MicOff, Square, Sparkles } from "lucide-react";

interface VoiceOrbProps {
  state: VoiceState;
  audioLevel?: number; // 0.0 to 1.0
  onToggleListen: () => void;
  onInterrupt: () => void;
  size?: number;
}

export function VoiceOrb({
  state,
  audioLevel = 0,
  onToggleListen,
  onInterrupt,
  size = 220,
}: VoiceOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);
  const audioLevelRef = useRef<number>(audioLevel);

  useEffect(() => {
    audioLevelRef.current = audioLevel;
  }, [audioLevel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = size * 0.28;

    const render = () => {
      phaseRef.current += 0.035;
      const phase = phaseRef.current;

      ctx.clearRect(0, 0, width, height);

      if (state === "idle") {
        // IDLE: Concentric cool steel pulsing rings
        const pulse = Math.sin(phase * 0.8) * 4;

        // Outer glow
        const grad = ctx.createRadialGradient(centerX, centerY, baseRadius * 0.4, centerX, centerY, baseRadius * 1.5);
        grad.addColorStop(0, "rgba(51, 65, 85, 0.4)");
        grad.addColorStop(1, "rgba(15, 23, 42, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Rings
        ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius + pulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "rgba(203, 213, 225, 0.5)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius * 0.75 - pulse * 0.5, 0, Math.PI * 2);
        ctx.stroke();

        // Core
        ctx.fillStyle = "#334155";
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius * 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (state === "listening") {
        // LISTENING: Emerald reactive acoustic waveforms
        const effectiveLevel = Math.max(0.12, audioLevelRef.current);
        const radius = baseRadius * (1 + effectiveLevel * 0.65);

        // Ambient glow
        const grad = ctx.createRadialGradient(centerX, centerY, radius * 0.5, centerX, centerY, radius * 1.4);
        grad.addColorStop(0, "rgba(16, 185, 129, 0.35)");
        grad.addColorStop(1, "rgba(16, 185, 129, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 1.4, 0, Math.PI * 2);
        ctx.fill();

        // Reactive wavy perimeter
        const points = 40;
        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const wave = Math.sin(angle * 6 + phase * 2) * (effectiveLevel * 14);
          const r = radius + wave;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = "#34d399";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Inner glowing core
        ctx.fillStyle = "rgba(16, 185, 129, 0.4)";
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
      } else if (state === "thinking") {
        // THINKING: Amber radial computational radar
        const spinRadius = baseRadius * 1.1;

        // Rotating radar arcs
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(phase * 1.5);

        for (let j = 0; j < 3; j++) {
          ctx.beginPath();
          ctx.arc(0, 0, spinRadius - j * 12, j * 1.5, j * 1.5 + Math.PI * 0.85);
          ctx.strokeStyle = j === 0 ? "#fbbf24" : "rgba(245, 158, 11, 0.4)";
          ctx.lineWidth = 3 - j * 0.7;
          ctx.stroke();
        }
        ctx.restore();

        // Central amber pulse
        const corePulse = Math.sin(phase * 3) * 5;
        ctx.fillStyle = "rgba(245, 158, 11, 0.6)";
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius * 0.55 + corePulse, 0, Math.PI * 2);
        ctx.fill();
      } else if (state === "speaking") {
        // SPEAKING: Cyan resonant audio oscillation waves
        const grad = ctx.createRadialGradient(centerX, centerY, baseRadius * 0.3, centerX, centerY, baseRadius * 1.6);
        grad.addColorStop(0, "rgba(6, 182, 212, 0.5)");
        grad.addColorStop(1, "rgba(6, 182, 212, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius * 1.6, 0, Math.PI * 2);
        ctx.fill();

        // Multi-frequency sine ripples
        for (let waveIdx = 0; waveIdx < 3; waveIdx++) {
          const wPhase = phase * 2.5 + waveIdx * 1.2;
          const wRadius = baseRadius * (0.8 + waveIdx * 0.25);
          const points = 48;

          ctx.beginPath();
          for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const undulation = Math.sin(angle * (4 + waveIdx) + wPhase) * 7;
            const r = wRadius + undulation;
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.strokeStyle = waveIdx === 0 ? "#38bdf8" : "rgba(6, 182, 212, 0.5)";
          ctx.lineWidth = 2.5 - waveIdx * 0.5;
          ctx.stroke();
        }

        // Inner vibrating core
        ctx.fillStyle = "#06b6d4";
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [state, size]);

  const handleClick = () => {
    if (state === "speaking" || state === "thinking") {
      onInterrupt();
    } else {
      onToggleListen();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div
        onClick={handleClick}
        className="relative cursor-pointer group flex items-center justify-center transition-transform active:scale-95"
        style={{ width: size, height: size }}
        title={
          state === "speaking"
            ? "Tap to Interrupt (Barge-in)"
            : state === "listening"
            ? "Tap to Stop Listening"
            : "Tap to Speak"
        }
      >
        <canvas
          ref={canvasRef}
          width={size * 2}
          height={size * 2}
          style={{ width: size, height: size }}
          className="absolute inset-0 pointer-events-none"
        />

        {/* Center action button icon */}
        <div className="relative z-10 flex items-center justify-center w-14 h-14 rounded-full bg-obsidian-950/90 border border-steel-700/80 shadow-2xl transition-all group-hover:border-thermal-400">
          {state === "speaking" && <Square className="w-5 h-5 text-cyanPulse-400 fill-current animate-pulse" />}
          {state === "thinking" && <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />}
          {state === "listening" && <Mic className="w-6 h-6 text-emerald-400 animate-pulse" />}
          {state === "idle" && <Mic className="w-6 h-6 text-steel-400 group-hover:text-white" />}
        </div>
      </div>

      {/* State label & tap hint */}
      <div className="mt-2 text-center">
        {state === "idle" && (
          <p className="text-xs font-semibold text-steel-400">
            Tap orb to speak <span className="font-mono text-[10px] text-steel-600">(Web Audio / WS)</span>
          </p>
        )}
        {state === "listening" && (
          <p className="text-xs font-semibold text-emerald-400 animate-pulse flex items-center gap-1.5 justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Listening... (Speak naturally)
          </p>
        )}
        {state === "thinking" && (
          <p className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 justify-center">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            Analyzing metallurgical physics...
          </p>
        )}
        {state === "speaking" && (
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-cyanPulse-300 flex items-center gap-1.5 justify-center">
              <span className="w-2 h-2 rounded-full bg-cyanPulse-400 animate-pulse"></span>
              Speaking (Neural Voice)
            </p>
            <button
              onClick={onInterrupt}
              className="text-[11px] text-steel-400 hover:text-white underline decoration-dashed transition-colors"
            >
              [Tap to interrupt / barge-in]
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
