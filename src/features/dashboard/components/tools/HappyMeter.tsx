'use client';

import Image from 'next/image';
import { useCallback, useState } from 'react';

export type HappyMeterPanelSize = 'large' | 'small';

export const HAPPY_METER_SIZE_STORAGE_KEY = 'dashboard.happyMeter.size';
export const HAPPY_METER_PANEL_WIDTH = 420;
export const HAPPY_METER_PANEL_HEIGHT = 280;
export const HAPPY_METER_PANEL_LARGE_WIDTH = 640;
export const HAPPY_METER_PANEL_LARGE_HEIGHT = 660;

const HAPPY_METER_GAUGE_IMAGE = '/images/dashboard/tools/happy-meter-guage.png';
const GAUGE_WIDTH = 500;
const GAUGE_HEIGHT = 220;
const CX = 250;
const CY = 220;
const NEEDLE_LENGTH = 170;
const NEEDLE_HALF_WIDTH = 18;
const HUB_RADIUS = 12;

const SEGMENT_COUNT = 7;
const SEGMENT_SPAN = 180 / SEGMENT_COUNT;
const NEUTRAL_STEP = 3;
const MIN_STEP = 0;
const MAX_STEP = 6;

const HAPPINESS_LEVELS = [
  { label: 'Very Unhappy', hint: 'Take a breath.' },
  { label: 'Unhappy', hint: 'Let\'s find a solution.	' },
  { label: 'A Little Unhappy', hint: "You've got this." },
  { label: 'Neutral', hint: 'Keep being you!' },
  { label: 'A Little Happy', hint: 'Nice momentum!' },
  { label: 'Happy', hint: 'Great energy!' },
  { label: 'Very Happy', hint: "You're shining!" },
] as const;

export function getHappyMeterPanelDimensions(size: HappyMeterPanelSize): {
  width: number;
  height: number;
} {
  if (size === 'small') {
    return { width: HAPPY_METER_PANEL_WIDTH, height: HAPPY_METER_PANEL_HEIGHT };
  }
  return {
    width: HAPPY_METER_PANEL_LARGE_WIDTH,
    height: HAPPY_METER_PANEL_LARGE_HEIGHT,
  };
}

function clampStep(step: number): number {
  return Math.min(MAX_STEP, Math.max(MIN_STEP, step));
}

function HappyMeterNeedleSvg({ step }: { step: number }) {
  const needleRotation = (step - NEUTRAL_STEP) * SEGMENT_SPAN;
  const tipY = CY - NEEDLE_LENGTH;

  return (
    <g
      transform={`rotate(${needleRotation}, ${CX}, ${CY})`}
      style={{ transition: 'transform 200ms ease-out' }}
    >
      <path
        d={`M ${CX} ${CY} L ${CX - NEEDLE_HALF_WIDTH} ${tipY + 25} L ${CX} ${tipY} L ${CX + NEEDLE_HALF_WIDTH} ${tipY + 25} Z`}
        fill="#4A3B8D"
        stroke="#4A3B8D"
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </g>
  );
}

function HappyMeterGauge({
  size,
  step,
}: {
  size: HappyMeterPanelSize;
  step: number;
}) {
  return (
    <div
      className="relative w-full"
      style={{ aspectRatio: `${GAUGE_WIDTH} / ${GAUGE_HEIGHT}` }}
    >
      <Image
        src={HAPPY_METER_GAUGE_IMAGE}
        alt=""
        fill
        className="object-contain"
        sizes={size === 'small' ? '250px' : '500px'}
        priority
      />
      <svg
        viewBox={`0 0 ${GAUGE_WIDTH} ${GAUGE_HEIGHT}`}
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <HappyMeterNeedleSvg step={step} />
        <circle
          cx={CX}
          cy={CY}
          r={HUB_RADIUS}
          fill="white"
          stroke="#4A3B8D"
          strokeWidth={3}
        />
      </svg>
    </div>
  );
}

type HappyMeterProps = {
  size?: HappyMeterPanelSize;
};

export default function HappyMeter({ size = 'small' }: HappyMeterProps) {
  const isSmall = size === 'small';
  const [step, setStep] = useState(NEUTRAL_STEP);

  const activeLevel = HAPPINESS_LEVELS[step];

  const handleDecrease = useCallback(() => {
    setStep((prev) => clampStep(prev - 1));
  }, []);

  const handleIncrease = useCallback(() => {
    setStep((prev) => clampStep(prev + 1));
  }, []);

  const atMin = step <= MIN_STEP;
  const atMax = step >= MAX_STEP;

  return (
    <div
      className={`flex h-full flex-col items-center justify-center ${isSmall ? 'w-full' : 'mx-auto w-fit'}`}
    >
      {!isSmall && (
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-bold text-brand-purple md:text-3xl">
            Teacher Happy Meter
          </h2>
        </div>
      )}

      <div
        className={`aspect-[500/220] ${isSmall ? 'mb-2 w-full max-w-[250px]' : 'mb-6 w-full max-w-[500px]'}`}
      >
        <HappyMeterGauge size={size} step={step} />
      </div>

      <div
        className={`mb-1 rounded-xl border-2 border-white bg-white/90 text-center shadow-md ${isSmall ? 'px-3 py-0' : 'px-6 py-3'}`}
      >
        <p
          className={`font-bold uppercase tracking-wide text-brand-purple ${isSmall ? 'text-sm' : 'text-xl md:text-2xl'}`}
        >
          {/* {activeLevel.label} */}
        </p>
        {!isSmall && (
          <p className="text-xl md:text-2xl font-bold text-brand-purple">{activeLevel.hint}</p>
        )}
      </div>

      <div
        className={`flex items-start justify-center ${isSmall ? 'w-full max-w-[250px] gap-3' : 'w-full max-w-[500px] gap-6'}`}
      >
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={handleDecrease}
            disabled={atMin}
            aria-label="Less happy"
            className={`flex items-center justify-center rounded-2xl border-4 border-white bg-red-400 font-bold text-white shadow-lg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 ${isSmall ? 'h-12 w-12 text-2xl' : 'h-16 w-16 text-3xl md:h-20 md:w-20 md:text-4xl'}`}
          >
            −
          </button>
          {!isSmall && (
            <span className="text-xs font-medium text-red-500 md:text-sm">- -</span>
          )}
        </div>

        <div className="flex flex-col items-center gap-0">
          <button
            type="button"
            onClick={handleIncrease}
            disabled={atMax}
            aria-label="More happy"
            className={`flex items-center justify-center rounded-2xl border-4 border-white bg-green-500 font-bold text-white shadow-lg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 ${isSmall ? 'h-12 w-12 text-2xl' : 'h-16 w-16 text-3xl md:h-20 md:w-20 md:text-4xl'}`}
          >
            +
          </button>
          {!isSmall && (
            <span className="text-xs font-medium text-green-600 md:text-sm">+ +</span>
          )}
        </div>
      </div>
    </div>
  );
}
