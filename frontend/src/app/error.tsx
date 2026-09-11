"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for telemetry tracking
    console.error("Telemetry Error Caught:", error);
  }, [error]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black font-mono selection:bg-amber-500/30">
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4">
        <div className="relative z-10 max-w-2xl space-y-8 text-center">
          {/* Glitch Animated 500 Headline (error-3 layout) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative inline-block"
          >
            <h1
              className="text-8xl font-black tracking-tighter text-transparent select-none md:text-[10rem]"
              style={{ WebkitTextStroke: "2px rgba(245, 158, 11, 0.2)" }}
            >
              500
            </h1>
            <motion.h1
              animate={{ x: [-3, 3, -3], opacity: [0.8, 1, 0.8] }}
              transition={{
                duration: 0.15,
                repeat: Infinity,
                repeatType: "mirror",
              }}
              className="absolute inset-0 text-8xl font-black tracking-tighter text-amber-500 mix-blend-screen select-none md:text-[10rem]"
              style={{ clipPath: "polygon(0 0, 100% 0, 100% 45%, 0 45%)" }}
            >
              500
            </motion.h1>
            <motion.h1
              animate={{ x: [3, -3, 3], opacity: [0.8, 1, 0.8] }}
              transition={{
                duration: 0.25,
                repeat: Infinity,
                repeatType: "mirror",
              }}
              className="absolute inset-0 text-8xl font-black tracking-tighter text-amber-400 mix-blend-screen select-none md:text-[10rem]"
              style={{
                clipPath: "polygon(0 55%, 100% 55%, 100% 100%, 0 100%)",
              }}
            >
              500
            </motion.h1>
            <h1 className="absolute inset-0 text-8xl font-black tracking-tighter text-white select-none md:text-[10rem]">
              500
            </h1>
          </motion.div>

          {/* Status Message Box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="border border-amber-500/20 bg-black/60 p-6 backdrop-blur-md rounded-2xl"
          >
            <div className="mb-3 flex items-center justify-center gap-3">
              <h2 className="text-xl font-bold tracking-[0.2em] text-amber-400 uppercase md:text-2xl">
                Telemetry Uplink Anomaly
              </h2>
            </div>

            <p className="leading-relaxed text-zinc-400 text-sm md:text-base">
              Pyrometallurgical telemetry pipeline interrupted. The calculation state encountered an unexpected exception:
            </p>

            <p className="mt-3 text-xs text-amber-300 font-mono bg-amber-950/40 border border-amber-900/60 p-2.5 rounded-lg truncate">
              {error?.message || "Execution exception in thermodynamic mass balance sequence."}
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row"
          >
            <Link
              href="/"
              className="group relative overflow-hidden bg-amber-500 px-8 py-3.5 text-xs sm:text-sm font-bold tracking-widest text-black uppercase transition-all duration-300 hover:scale-105 rounded-xl"
            >
              <div className="absolute inset-0 translate-y-full bg-white transition-transform duration-300 ease-in-out group-hover:translate-y-0" />
              <div className="relative flex items-center gap-2">
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span>Initialize Reboot</span>
              </div>
            </Link>

            <button
              onClick={() => reset()}
              className="inline-flex items-center gap-2 border border-amber-500/40 px-8 py-3.5 text-xs sm:text-sm font-bold tracking-widest text-amber-400 uppercase transition-all duration-300 hover:bg-amber-500 hover:text-black rounded-xl"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry Calculation</span>
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
