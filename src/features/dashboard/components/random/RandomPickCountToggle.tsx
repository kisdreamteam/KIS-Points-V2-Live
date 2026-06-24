'use client';

import RandomSegmentedToggle from '@/features/dashboard/components/random/RandomSegmentedToggle';
import type { PickCount } from '@/features/dashboard/lib/randomPickerPool';

const PICK_COUNT_OPTIONS: PickCount[] = [1, 2, 3, 4, 5];

type RandomPickCountToggleProps = {
  value: PickCount;
  onChange: (count: PickCount) => void;
  eligiblePoolSize: number;
  disabled?: boolean;
};

export default function RandomPickCountToggle({
  value,
  onChange,
  eligiblePoolSize,
  disabled = false,
}: RandomPickCountToggleProps) {
  return (
    <div className="mb-4 w-full max-w-md mx-auto">
      <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-2 text-center">Pick count</p>
      <RandomSegmentedToggle<PickCount>
        ariaLabel="Number of students to pick"
        value={value}
        onChange={onChange}
        disabled={disabled}
        options={PICK_COUNT_OPTIONS.map((count) => ({
          value: count,
          label: String(count),
          disabled: count > eligiblePoolSize,
        }))}
      />
    </div>
  );
}
