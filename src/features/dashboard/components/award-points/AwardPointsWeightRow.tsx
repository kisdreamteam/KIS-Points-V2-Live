'use client';

import type { AwardPointWeight, AwardPointsTab } from '@/features/dashboard/hooks/useAwardPointsModalState';

const WEIGHTS: AwardPointWeight[] = [1, 2, 3, 4, 5];

type AwardPointsWeightRowProps = {
  activeTab: AwardPointsTab;
  selectedWeight: AwardPointWeight;
  onWeightChange: (weight: AwardPointWeight) => void;
  disabled?: boolean;
};

export default function AwardPointsWeightRow({
  activeTab,
  selectedWeight,
  onWeightChange,
  disabled = false,
}: AwardPointsWeightRowProps) {
  const prefix = activeTab === 'positive' ? '+' : '-';

  return (
    <div className="mb-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
        Award point weight value
      </p>
      <div className="flex gap-2">
        {WEIGHTS.map((weight) => {
          const isSelected = selectedWeight === weight;
          return (
            <button
              key={weight}
              type="button"
              disabled={disabled}
              onClick={() => onWeightChange(weight)}
              className={[
                'flex-1 rounded-xl border-2 py-3 text-lg font-bold transition-colors',
                isSelected
                  ? 'border-amber-500 bg-amber-100 text-gray-900'
                  : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100',
                disabled ? 'opacity-50 cursor-not-allowed' : '',
              ].join(' ')}
            >
              {prefix}
              {weight}
            </button>
          );
        })}
      </div>
    </div>
  );
}
