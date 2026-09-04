'use client';

import { useMemo, useRef, useState } from 'react';
import CategoryFilterPopover from '@/features/dashboard/components/points-report/CategoryFilterPopover';
import PointsReportTable from '@/features/dashboard/components/points-report/PointsReportTable';
import type { ConsolidatedCategoryOption } from '@/features/dashboard/lib/api/pointsReport';
import type { PointsReportRow } from '@/features/dashboard/hooks/usePointsReport';

export type PointsReportPanelProps = {
  rows: PointsReportRow[];
  isLoading: boolean;
  error: string | null;
  isFiltered: boolean;
  selectedNameKeys: string[];
  selectedCategoryLabels: string[];
  categoryCatalog: ConsolidatedCategoryOption[];
  onSelectTotal: () => void;
  onApplyCategoryFilter: (nameKeys: string[]) => void;
  onRemoveCategoryFilter: (nameKey: string) => void;
};

export default function PointsReportPanel({
  rows,
  isLoading,
  error,
  isFiltered,
  selectedNameKeys,
  selectedCategoryLabels,
  categoryCatalog,
  onSelectTotal,
  onApplyCategoryFilter,
  onRemoveCategoryFilter,
}: PointsReportPanelProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  const pointsColumnLabel = useMemo(() => {
    if (!isFiltered || selectedCategoryLabels.length === 0) return 'Points';
    return `Points (${selectedCategoryLabels.join(', ')})`;
  }, [isFiltered, selectedCategoryLabels]);

  const nameKeyByLabel = useMemo(() => {
    const map = new Map<string, string>();
    for (const option of categoryCatalog) {
      map.set(option.displayName, option.nameKey);
    }
    return map;
  }, [categoryCatalog]);

  return (
    <div className="h-full min-h-0 w-full flex flex-col bg-brand-cream rounded-lg overflow-hidden">
      <div className="shrink-0 px-4 py-3 border-b border-gray-200 bg-brand-cream/90">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 font-spartan">Points Report</h2>
            <p className="text-sm text-gray-500">{rows.length} students</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSelectTotal}
            className={[
              'px-3 py-1.5 rounded-full text-sm font-semibold transition-colors',
              !isFiltered
                ? 'bg-brand-purple text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50',
            ].join(' ')}
          >
            Total
          </button>

          <button
            ref={filterButtonRef}
            type="button"
            onClick={() => setIsFilterOpen((open) => !open)}
            className="px-3 py-1.5 rounded-full text-sm font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Filter categories
          </button>

          {selectedCategoryLabels.map((label) => {
            const nameKey = nameKeyByLabel.get(label);
            if (!nameKey) return null;
            return (
              <button
                key={nameKey}
                type="button"
                onClick={() => onRemoveCategoryFilter(nameKey)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-brand-purple hover:bg-purple-200 transition-colors"
                title={`Remove ${label} filter`}
              >
                {label}
                <span aria-hidden className="text-brand-purple/70">
                  ×
                </span>
              </button>
            );
          })}
        </div>

        {isFiltered ? (
          <p className="mt-2 text-xs text-gray-500">
            Custom points are included in Total only.
          </p>
        ) : null}
      </div>

      {error ? (
        <div className="shrink-0 px-4 py-2 text-sm text-red-600 border-b border-red-100 bg-red-50">
          {error}
        </div>
      ) : null}

      <PointsReportTable rows={rows} isLoading={isLoading} pointsColumnLabel={pointsColumnLabel} />

      <CategoryFilterPopover
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        anchorRef={filterButtonRef}
        catalog={categoryCatalog}
        selectedNameKeys={selectedNameKeys}
        onApply={onApplyCategoryFilter}
      />
    </div>
  );
}
