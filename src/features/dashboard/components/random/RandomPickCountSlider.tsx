'use client';

import { MAX_PICK_COUNT } from '@/features/dashboard/lib/randomPickerPool';

type RandomPickCountSliderProps = {
  value: number;
  onChange: (count: number) => void;
  eligiblePoolSize: number;
  disabled?: boolean;
};

export default function RandomPickCountSlider({
  value,
  onChange,
  eligiblePoolSize,
  disabled = false,
}: RandomPickCountSliderProps) {
  const max = Math.min(MAX_PICK_COUNT, Math.max(1, eligiblePoolSize));
  const isDisabled = disabled || max <= 1;

  return (
    <div className="mb-4 w-full max-w-md mx-auto">
      <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-2 text-center">
        Pick count: <span className="text-white">{value}</span>
      </p>
      <input
        type="range"
        min={1}
        max={max}
        step={1}
        value={Math.min(value, max)}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={isDisabled}
        aria-label="Number of students to pick"
        className="random-pick-count-slider w-full h-2 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
      />
      <div className="flex justify-between mt-1 px-0.5">
        <span className="text-white/50 text-xs">1</span>
        <span className="text-white/50 text-xs">{max}</span>
      </div>
    </div>
  );
}
