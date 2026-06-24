'use client';

import type { AwardPointWeight, AwardPointsTab } from '@/features/dashboard/hooks/useAwardPointsModalState';

const WEIGHTS_ROW_ONE: AwardPointWeight[] = [1, 2, 3, 4, 5];
const WEIGHTS_ROW_TWO: AwardPointWeight[] = [6, 7, 8, 9, 10];

type AwardPointsWeightRowProps = {
  activeTab: AwardPointsTab;
  selectedWeight: AwardPointWeight;
  onWeightChange: (weight: AwardPointWeight) => void;
  disabled?: boolean;
};

type WeightButtonProps = {
  weight: AwardPointWeight;
  prefix: string;
  isSelected: boolean;
  disabled: boolean;
  onWeightChange: (weight: AwardPointWeight) => void;
};

function WeightButton({ weight, prefix, isSelected, disabled, onWeightChange }: WeightButtonProps) {
  return (
    <button
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
}

function WeightRow({
  weights,
  prefix,
  selectedWeight,
  disabled,
  onWeightChange,
}: {
  weights: AwardPointWeight[];
  prefix: string;
  selectedWeight: AwardPointWeight;
  disabled: boolean;
  onWeightChange: (weight: AwardPointWeight) => void;
}) {
  return (
    <div className="flex gap-2">
      {weights.map((weight) => (
        <WeightButton
          key={weight}
          weight={weight}
          prefix={prefix}
          isSelected={selectedWeight === weight}
          disabled={disabled}
          onWeightChange={onWeightChange}
        />
      ))}
    </div>
  );
}

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
      <div className="flex flex-col gap-2">
        <WeightRow
          weights={WEIGHTS_ROW_ONE}
          prefix={prefix}
          selectedWeight={selectedWeight}
          disabled={disabled}
          onWeightChange={onWeightChange}
        />
        <WeightRow
          weights={WEIGHTS_ROW_TWO}
          prefix={prefix}
          selectedWeight={selectedWeight}
          disabled={disabled}
          onWeightChange={onWeightChange}
        />
      </div>
    </div>
  );
}
