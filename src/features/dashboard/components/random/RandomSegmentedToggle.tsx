'use client';

type SegmentedOption<T extends string | number> = {
  value: T;
  label: string;
  disabled?: boolean;
};

type RandomSegmentedToggleProps<T extends string | number> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  ariaLabel: string;
};

export default function RandomSegmentedToggle<T extends string | number>({
  options,
  value,
  onChange,
  disabled = false,
  ariaLabel,
}: RandomSegmentedToggleProps<T>) {
  return (
    <div
      className="flex gap-1 p-1 bg-white/10 rounded-xl backdrop-blur-sm"
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const isSelected = value === option.value;
        const isDisabled = disabled || option.disabled;
        return (
          <button
            key={String(option.value)}
            type="button"
            disabled={isDisabled}
            onClick={() => onChange(option.value)}
            className={[
              'flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
              isSelected
                ? 'bg-pink-500 text-white shadow-md'
                : 'text-white/80 hover:bg-white/10 hover:text-white',
              isDisabled ? 'opacity-40 cursor-not-allowed' : '',
            ].join(' ')}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
