'use client';

import { useCallback, useMemo, useState } from 'react';

export type HappyMeterPanelSize = 'large' | 'small';

export const HAPPY_METER_SIZE_STORAGE_KEY = 'dashboard.happyMeter.size';
export const HAPPY_METER_PANEL_WIDTH = 420;
export const HAPPY_METER_PANEL_HEIGHT = 300;

const SEGMENT_COUNT = 7;
const SEGMENT_SPAN = 180 / SEGMENT_COUNT;
const NEUTRAL_STEP = 3;
const MIN_STEP = 0;
const MAX_STEP = 6;

const HAPPINESS_LEVELS = [
  { label: 'Very Unhappy', hint: 'Take a breath.' },
  { label: 'Unhappy', hint: 'Tomorrow is a new day.' },
  { label: 'A Little Unhappy', hint: "You've got this." },
  { label: 'Neutral', hint: 'Keep being you!' },
  { label: 'A Little Happy', hint: 'Nice momentum!' },
  { label: 'Happy', hint: 'Great energy!' },
  { label: 'Very Happy', hint: "You're shining!" },
] as const;

const SEGMENT_COLORS = [
  '#C0392B',
  '#E74C3C',
  '#F39C12',
  '#F1C40F',
  '#A8D08D',
  '#6BBF59',
  '#27AE60',
] as const;

const CX = 100;
const CY = 100;
const RADIUS = 82;
const NEEDLE_LENGTH = 68;

export function getHappyMeterPanelDimensions(size: HappyMeterPanelSize): {
  width: number;
  height: number;
} {
  if (size === 'small') {
    return { width: HAPPY_METER_PANEL_WIDTH, height: HAPPY_METER_PANEL_HEIGHT };
  }
  if (typeof window === 'undefined') {
    return { width: 672, height: 480 };
  }
  return {
    width: Math.max(672, Math.floor(window.innerWidth * 0.9)),
    height: Math.max(480, Math.floor(window.innerHeight * 0.9)),
  };
}

function clampStep(step: number): number {
  return Math.min(MAX_STEP, Math.max(MIN_STEP, step));
}

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const radians = ((angleDeg - 180) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function describeWedge(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, radius, startAngle);
  const end = polarToCartesian(cx, cy, radius, endAngle);
  const largeArcFlag = startAngle - endAngle > 180 ? 1 : 0;
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
}

type FaceMood = 'angry' | 'sad' | 'meh' | 'neutral' | 'ok' | 'happy' | 'joy';

const FACE_MOODS: FaceMood[] = ['angry', 'sad', 'meh', 'neutral', 'ok', 'happy', 'joy'];

function SegmentFace({ mood, x, y, scale }: { mood: FaceMood; x: number; y: number; scale: number }) {
  const eyeOffset = 4 * scale;
  const mouthY = 3 * scale;

  let mouthPath = '';
  switch (mood) {
    case 'angry':
      mouthPath = `M ${x - 5 * scale} ${y + mouthY} Q ${x} ${y + 1 * scale} ${x + 5 * scale} ${y + mouthY}`;
      break;
    case 'sad':
      mouthPath = `M ${x - 5 * scale} ${y + 6 * scale} Q ${x} ${y + 2 * scale} ${x + 5 * scale} ${y + 6 * scale}`;
      break;
    case 'meh':
      mouthPath = `M ${x - 4 * scale} ${y + 5 * scale} L ${x + 4 * scale} ${y + 5 * scale}`;
      break;
    case 'neutral':
      mouthPath = `M ${x - 4 * scale} ${y + 5 * scale} L ${x + 4 * scale} ${y + 5 * scale}`;
      break;
    case 'ok':
      mouthPath = `M ${x - 5 * scale} ${y + 5 * scale} Q ${x} ${y + 7 * scale} ${x + 5 * scale} ${y + 5 * scale}`;
      break;
    case 'happy':
      mouthPath = `M ${x - 5 * scale} ${y + 4 * scale} Q ${x} ${y + 9 * scale} ${x + 5 * scale} ${y + 4 * scale}`;
      break;
    case 'joy':
      mouthPath = `M ${x - 6 * scale} ${y + 3 * scale} Q ${x} ${y + 10 * scale} ${x + 6 * scale} ${y + 3 * scale}`;
      break;
  }

  return (
    <g>
      <circle cx={x - eyeOffset} cy={y - 2 * scale} r={1.5 * scale} fill="#4A3B8D" />
      <circle cx={x + eyeOffset} cy={y - 2 * scale} r={1.5 * scale} fill="#4A3B8D" />
      {mood === 'angry' && (
        <>
          <path
            d={`M ${x - 7 * scale} ${y - 5 * scale} L ${x - 2 * scale} ${y - 3 * scale}`}
            stroke="#4A3B8D"
            strokeWidth={1.2 * scale}
            strokeLinecap="round"
          />
          <path
            d={`M ${x + 7 * scale} ${y - 5 * scale} L ${x + 2 * scale} ${y - 3 * scale}`}
            stroke="#4A3B8D"
            strokeWidth={1.2 * scale}
            strokeLinecap="round"
          />
        </>
      )}
      <path
        d={mouthPath}
        fill="none"
        stroke="#4A3B8D"
        strokeWidth={1.5 * scale}
        strokeLinecap="round"
      />
    </g>
  );
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
        d={`M ${CX} ${CY} L ${CX - 7} ${tipY + 10} L ${CX} ${tipY} L ${CX + 7} ${tipY + 10} Z`}
        fill="#4A3B8D"
        stroke="#4A3B8D"
        strokeWidth={1}
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
  const isSmall = size === 'small';
  const faceScale = isSmall ? 0.85 : 1.15;

  const segments = useMemo(() => {
    return Array.from({ length: SEGMENT_COUNT }, (_, index) => {
      const startAngle = index * SEGMENT_SPAN;
      const endAngle = (index + 1) * SEGMENT_SPAN;
      const midAngle = (startAngle + endAngle) / 2;
      const facePos = polarToCartesian(CX, CY, RADIUS * 0.62, midAngle);
      return {
        path: describeWedge(CX, CY, RADIUS, startAngle, endAngle),
        color: SEGMENT_COLORS[index],
        face: FACE_MOODS[index],
        faceX: facePos.x,
        faceY: facePos.y,
      };
    });
  }, []);

  return (
    <svg viewBox="0 0 200 118" className="h-auto w-full" aria-hidden>
      <defs>
        <filter id="happyMeterShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" />
        </filter>
      </defs>

      <g filter="url(#happyMeterShadow)">
        {segments.map((segment) => (
          <path
            key={segment.color}
            d={segment.path}
            fill={segment.color}
            stroke="white"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        ))}
      </g>

      {segments.map((segment) => (
        <SegmentFace
          key={`face-${segment.face}`}
          mood={segment.face}
          x={segment.faceX}
          y={segment.faceY}
          scale={faceScale}
        />
      ))}

      <HappyMeterNeedleSvg step={step} />

      <circle cx={CX} cy={CY} r={10} fill="white" stroke="#4A3B8D" strokeWidth={3} />
    </svg>
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
    <div className="flex h-full w-full flex-col items-center justify-center">
      {!isSmall && (
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-bold text-brand-purple md:text-3xl">
            Teacher Happy Meter
          </h2>
          {/* <p className="mt-1 text-base text-brand-purple/70 md:text-lg">
            How are you feeling today?
          </p> */}
        </div>
      )}

      <div
        className={`aspect-[200/118] w-full ${isSmall ? 'mb-2 w-[60%] max-w-[260px]' : 'mb-6 w-[80%] min-w-[320px] max-w-[560px]'
          }`}
      >
        <HappyMeterGauge size={size} step={step} />
      </div>

      <div
        className={`mb-1 rounded-xl border-2 border-white bg-white/90 text-center shadow-md ${isSmall ? 'px-3 py-0' : 'px-6 py-3'
          }`}
      >
        <p
          className={`font-bold uppercase tracking-wide text-brand-purple ${isSmall ? 'text-sm' : 'text-xl md:text-2xl'
            }`}
        >
          {/* {activeLevel.label} */}
        </p>
        {!isSmall && (
          <p className="text-xl md:text-2xl font-bold text-brand-purple">{activeLevel.hint}</p>
        )}
      </div>

      <div
        className={`flex w-full items-start justify-center ${isSmall ? 'max-w-[260px] gap-3' : 'max-w-[560px] gap-6'
          }`}
      >
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={handleDecrease}
            disabled={atMin}
            aria-label="Less happy"
            className={`flex items-center justify-center rounded-2xl border-4 border-white bg-red-400 font-bold text-white shadow-lg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 ${isSmall ? 'h-12 w-12 text-2xl' : 'h-16 w-16 text-3xl md:h-20 md:w-20 md:text-4xl'
              }`}
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
            className={`flex items-center justify-center rounded-2xl border-4 border-white bg-green-500 font-bold text-white shadow-lg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 ${isSmall ? 'h-12 w-12 text-2xl' : 'h-16 w-16 text-3xl md:h-20 md:w-20 md:text-4xl'
              }`}
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
