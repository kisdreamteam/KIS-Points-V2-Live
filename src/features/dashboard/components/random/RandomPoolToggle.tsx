'use client';

import RandomSegmentedToggle from '@/features/dashboard/components/random/RandomSegmentedToggle';
import type { PickerPool } from '@/features/dashboard/lib/randomPickerPool';

type RandomPoolToggleProps = {
  value: PickerPool;
  onChange: (pool: PickerPool) => void;
  poolCounts: { all: number; boys: number; girls: number };
  disabled?: boolean;
};

export default function RandomPoolToggle({ value, onChange, poolCounts, disabled = false }: RandomPoolToggleProps) {
  return (
    <div className="mb-4 w-full max-w-md mx-auto">
      {/* <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-2 text-center">Student pool</p> */}
      <RandomSegmentedToggle<PickerPool>
        ariaLabel="Student pool filter"
        value={value}
        onChange={onChange}
        disabled={disabled}
        options={[
          { value: 'all', label: 'All', disabled: poolCounts.all === 0 },
          { value: 'boys', label: 'Boys', disabled: poolCounts.boys === 0 },
          { value: 'girls', label: 'Girls', disabled: poolCounts.girls === 0 },
        ]}
      />
    </div>
  );
}
