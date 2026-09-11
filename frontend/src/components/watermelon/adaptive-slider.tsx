'use client';

import { useState, useMemo, type FC, type ChangeEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';

export type GoodDirection = 'high' | 'low' | 'neutral';

export interface ColorSettings {
  text: string;
  gradient: string;
  thumbBorder: string;
  thumbDot: string;
  glow?: string;
  goodness: number;
}

export interface AdaptiveSliderProps {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  label?: string;
  unit?: string;
  className?: string;
  variant?: 'compact' | 'full';
  colorScheme?: 'thermal' | 'emerald' | 'cyan' | 'amber' | 'adaptive' | 'dynamic';
  goodDirection?: GoodDirection;
}

const DEFAULT_MIN = 50;
const DEFAULT_MAX = 350;
const DEFAULT_STEP = 25;
const DEFAULT_VALUE = 200;

function interpolateRgb(
  c1: [number, number, number],
  c2: [number, number, number],
  t: number
): [number, number, number] {
  const clampedT = Math.max(0, Math.min(1, t));
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * clampedT),
    Math.round(c1[1] + (c2[1] - c1[1]) * clampedT),
    Math.round(c1[2] + (c2[2] - c1[2]) * clampedT),
  ];
}

function rgbToStr(c: [number, number, number]): string {
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

/**
 * Calculates continuous color transformation based on value and good/bad direction:
 * - Bad values: "a bit dark, a bit dark only, not very dark and red" (muted slate/steel #334155 to #475569, text #94a3b8)
 * - Baseline / Mid: transitions into seafoam/teal #2dd4bf
 * - Good values: "green light colors" (vibrant luminous emerald/mint #34d399, #6ee7b7)
 */
export const getSliderColor = (
  value: number,
  min: number,
  max: number,
  goodDirection: GoodDirection = 'high'
): ColorSettings => {
  const range = max - min || 1;
  const normalized = Math.max(0, Math.min(1, (value - min) / range));
  const goodness = goodDirection === 'low' ? 1 - normalized : normalized;

  // 3 Anchor Points:
  // Anchor 0.0 (Bad - muted dark slate/steel, clean legibility, not red, not pitch dark)
  const BAD_TEXT: [number, number, number] = [148, 163, 184]; // #94a3b8 (steel-400)
  const BAD_START: [number, number, number] = [30, 41, 59];   // #1e293b (steel-800)
  const BAD_MID: [number, number, number] = [51, 65, 85];     // #334155 (steel-700)
  const BAD_END: [number, number, number] = [71, 85, 105];    // #475569 (steel-600)
  const BAD_THUMB: [number, number, number] = [100, 116, 139];// #64748b

  // Anchor 0.5 (Mid / JSL Baseline - balanced seafoam / teal-green)
  const MID_TEXT: [number, number, number] = [45, 212, 191];  // #2dd4bf (teal-400)
  const MID_START: [number, number, number] = [30, 41, 59];   // #1e293b
  const MID_MID: [number, number, number] = [13, 148, 136];   // #0d9488 (teal-600)
  const MID_END: [number, number, number] = [20, 184, 166];   // #14b8a6 (teal-500)
  const MID_THUMB: [number, number, number] = [20, 184, 166]; // #14b8a6

  // Anchor 1.0 (Good - vibrant luminous green light colors)
  const GOOD_TEXT: [number, number, number] = [110, 231, 183]; // #6ee7b7 (emerald-300 light green)
  const GOOD_START: [number, number, number] = [5, 150, 105];  // #059669 (emerald-600)
  const GOOD_MID: [number, number, number] = [16, 185, 129];   // #10b981 (emerald-500)
  const GOOD_END: [number, number, number] = [52, 211, 153];   // #34d399 (emerald-400 light green)
  const GOOD_THUMB: [number, number, number] = [52, 211, 153]; // #34d399

  let textColor: [number, number, number];
  let startColor: [number, number, number];
  let midColor: [number, number, number];
  let endColor: [number, number, number];
  let thumbColor: [number, number, number];

  if (goodness < 0.5) {
    const t = goodness / 0.5;
    textColor = interpolateRgb(BAD_TEXT, MID_TEXT, t);
    startColor = interpolateRgb(BAD_START, MID_START, t);
    midColor = interpolateRgb(BAD_MID, MID_MID, t);
    endColor = interpolateRgb(BAD_END, MID_END, t);
    thumbColor = interpolateRgb(BAD_THUMB, MID_THUMB, t);
  } else {
    const t = (goodness - 0.5) / 0.5;
    textColor = interpolateRgb(MID_TEXT, GOOD_TEXT, t);
    startColor = interpolateRgb(MID_START, GOOD_START, t);
    midColor = interpolateRgb(MID_MID, GOOD_MID, t);
    endColor = interpolateRgb(MID_END, GOOD_END, t);
    thumbColor = interpolateRgb(MID_THUMB, GOOD_THUMB, t);
  }

  const textHex = rgbToStr(textColor);
  const startHex = rgbToStr(startColor);
  const midHex = rgbToStr(midColor);
  const endHex = rgbToStr(endColor);
  const thumbHex = rgbToStr(thumbColor);

  return {
    text: textHex,
    gradient: `linear-gradient(to right, ${startHex}, ${midHex}, ${endHex})`,
    thumbBorder: thumbHex,
    thumbDot: textHex,
    glow: goodness > 0.55 ? `0 0 12px ${thumbHex}80` : undefined,
    goodness,
  };
};

const getColorSettings = (
  value: number,
  min: number,
  max: number,
  scheme: string = 'dynamic',
  goodDirection?: GoodDirection
): ColorSettings => {
  if (goodDirection || scheme === 'dynamic' || scheme === 'adaptive') {
    return getSliderColor(value, min, max, goodDirection || 'high');
  }

  if (scheme === 'thermal') {
    return {
      text: '#F97316',
      gradient: 'linear-gradient(to right, #EA580C, #F97316, #FB923C)',
      thumbBorder: '#F97316',
      thumbDot: '#F97316',
      goodness: 1,
    };
  }

  if (scheme === 'emerald') {
    return {
      text: '#10B981',
      gradient: 'linear-gradient(to right, #059669, #10B981, #34D399)',
      thumbBorder: '#10B981',
      thumbDot: '#10B981',
      goodness: 1,
    };
  }

  if (scheme === 'cyan') {
    return {
      text: '#06B6D4',
      gradient: 'linear-gradient(to right, #0891B2, #06B6D4, #22D3EE)',
      thumbBorder: '#06B6D4',
      thumbDot: '#06B6D4',
      goodness: 1,
    };
  }

  if (scheme === 'amber') {
    return {
      text: '#F59E0B',
      gradient: 'linear-gradient(to right, #D97706, #F59E0B, #FBBF24)',
      thumbBorder: '#F59E0B',
      thumbDot: '#F59E0B',
      goodness: 1,
    };
  }

  return getSliderColor(value, min, max, 'high');
};

export const AdaptiveSlider: FC<AdaptiveSliderProps> = ({
  value,
  min = DEFAULT_MIN,
  max = DEFAULT_MAX,
  step = DEFAULT_STEP,
  defaultValue = DEFAULT_VALUE,
  onChange,
  label,
  unit,
  className,
  variant = 'compact',
  colorScheme = 'dynamic',
  goodDirection,
}) => {
  const [internalValue, setInternalValue] = useState<number>(defaultValue);

  const currentValue = value ?? internalValue;

  const colorSettings = useMemo(
    () => getColorSettings(currentValue, min, max, colorScheme, goodDirection),
    [currentValue, min, max, colorScheme, goodDirection],
  );

  const range = max - min || 1;
  const percentage = Math.max(0, Math.min(100, ((currentValue - min) / range) * 100));

  const dots = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="z-30 h-1.5 w-1.5 rounded-full bg-white/20 transition-colors"
          style={{ opacity: 0.8 }}
        />
      )),
    [],
  );

  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setInternalValue(val);
    onChange?.(val);
  };

  if (variant === 'full') {
    return (
      <motion.div className={cn("flex h-[60vh] w-xs flex-col items-center justify-center rounded-[36px] bg-[#FEFEFE] p-6 shadow-2xl shadow-black/5 transition-colors select-none sm:w-sm sm:p-12 dark:bg-neutral-900 dark:shadow-none", className)}>
        <span className="mb-2 text-xl font-bold text-[#878787] sm:text-2xl dark:text-neutral-500">
          {label || 'Calories'}
        </span>

        <div className="mb-8 flex items-baseline gap-2">
          <AnimatedText
            value={currentValue.toString()}
            className="overflow-hidden text-5xl font-extrabold tracking-tight sm:text-6xl"
          />
          <motion.span
            layout
            className="text-4xl font-extrabold text-[#010101] transition-colors sm:text-5xl dark:text-neutral-100"
          >
            {unit || 'kCal'}
          </motion.span>
        </div>

        <div className="group relative flex h-13 w-full items-center overflow-hidden rounded-full bg-[#f1f3f5] transition-colors dark:bg-neutral-800">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-4 transition-colors sm:px-8">
            {dots}
          </div>

          <motion.div
            className="pointer-events-none absolute top-0 left-0 h-full rounded-full"
            animate={{
              width: `calc((${percentage} / 100) * (100% - 52px) + 52px)`,
              background: colorSettings.gradient,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />

          <input
            title="range"
            type="range"
            min={min}
            max={max}
            step={step}
            value={currentValue}
            onChange={handleSliderChange}
            className="absolute inset-0 z-50 h-13 w-full cursor-pointer opacity-0"
          />

          <motion.div
            className="pointer-events-none absolute top-0 z-40 flex size-13 items-center justify-center rounded-full border-none"
            animate={{
              left: `calc((${percentage} / 100) * (100% - 52px))`,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="size-10 rounded-full bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]" />
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Compact variant for Cockpit Sliders (dark metallic SCADA layout)
  return (
    <div className={cn("group relative flex h-7 w-full items-center overflow-hidden rounded-full bg-steel-900 border border-steel-700/60 shadow-inner select-none transition-colors", className)}>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-3 sm:px-5">
        {dots}
      </div>

      <motion.div
        className="pointer-events-none absolute top-0 left-0 h-full rounded-full opacity-90"
        animate={{
          width: `calc((${percentage} / 100) * (100% - 28px) + 28px)`,
          background: colorSettings.gradient,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      />

      <input
        title={label || "range"}
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        onChange={handleSliderChange}
        className="absolute inset-0 z-50 h-7 w-full cursor-pointer opacity-0"
      />

      <motion.div
        className="pointer-events-none absolute top-0 z-40 flex size-7 items-center justify-center rounded-full"
        animate={{
          left: `calc((${percentage} / 100) * (100% - 28px))`,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      >
        <div
          className="size-5 rounded-full bg-white shadow-md border ring-2 ring-black/20 flex items-center justify-center transition-all duration-200"
          style={{
            borderColor: colorSettings.thumbBorder,
            boxShadow: colorSettings.glow,
          }}
        >
          <div
            className="size-2 rounded-full transition-colors duration-200"
            style={{ backgroundColor: colorSettings.thumbDot || colorSettings.text }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export const AnimatedText = ({
  value,
  className,
}: {
  value: string;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'flex text-lg tracking-tight will-change-transform',
        className,
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {value.split('').map((char, index) => {
          const displayChar = char === ' ' ? '\u00A0' : char;

          return (
            <motion.span
              key={char + index}
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  type: 'spring',
                  stiffness: 200,
                  damping: 20,
                },
              }}
              exit={{ opacity: 0, y: 0, scale: 1, transition: { duration: 0 } }}
            >
              {displayChar}
            </motion.span>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
