'use client';

import type { AwardPointsTab } from '@/features/dashboard/hooks/useAwardPointsModalState';

type AwardPointsTabBarProps = {
  activeTab: AwardPointsTab;
  onTabChange: (tab: AwardPointsTab) => void;
  disabled?: boolean;
};

export default function AwardPointsTabBar({
  activeTab,
  onTabChange,
  disabled = false,
}: AwardPointsTabBarProps) {
  return (
    <div className="grid grid-cols-2 gap-2 mb-6">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onTabChange('positive')}
        className={[
          'flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-sm transition-colors',
          activeTab === 'positive'
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ].join(' ')}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        Positive Points
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onTabChange('negative')}
        className={[
          'flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-sm transition-colors',
          activeTab === 'negative'
            ? 'bg-gray-800 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ].join(' ')}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        Negative Points
      </button>
    </div>
  );
}
