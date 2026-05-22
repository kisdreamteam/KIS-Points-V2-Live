'use client';

type EditClassSettingsTabProps = {
  isClassOwner: boolean;
  isResettingPoints: boolean;
  onResetPointsClick: () => void;
};

export default function EditClassSettingsTab({
  isClassOwner,
  isResettingPoints,
  onResetPointsClick,
}: EditClassSettingsTabProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-brand-purple">Points Management</h3>
      <button
        type="button"
        onClick={onResetPointsClick}
        disabled={isResettingPoints || !isClassOwner}
        className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isResettingPoints ? 'Resetting...' : 'Reset Points'}
      </button>
    </div>
  );
}
