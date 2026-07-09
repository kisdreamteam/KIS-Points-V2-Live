'use client';

import { useEffect, useRef, useState } from 'react';
import type { ConsolidatedCategoryOption } from '@/features/dashboard/lib/api/pointsReport';

export type CategoryFilterPopoverProps = {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  catalog: ConsolidatedCategoryOption[];
  selectedNameKeys: string[];
  onApply: (nameKeys: string[]) => void;
};

export default function CategoryFilterPopover({
  isOpen,
  onClose,
  anchorRef,
  catalog,
  selectedNameKeys,
  onApply,
}: CategoryFilterPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [draftKeys, setDraftKeys] = useState<string[]>(selectedNameKeys);

  useEffect(() => {
    if (isOpen) {
      setDraftKeys(selectedNameKeys);
    }
  }, [isOpen, selectedNameKeys]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (popoverRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  const toggleKey = (nameKey: string) => {
    setDraftKeys((prev) =>
      prev.includes(nameKey) ? prev.filter((key) => key !== nameKey) : [...prev, nameKey]
    );
  };

  const anchorRect = anchorRef.current?.getBoundingClientRect();
  const style = anchorRect
    ? {
        position: 'fixed' as const,
        top: anchorRect.bottom + 8,
        left: Math.max(8, anchorRect.left - 200),
        zIndex: 50,
      }
    : undefined;

  return (
    <div
      ref={popoverRef}
      data-points-report-filter
      className="w-72 max-h-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg flex flex-col"
      style={style}
      role="dialog"
      aria-label="Filter by category"
    >
      <div className="px-4 py-3 border-b border-gray-100">
        <h4 className="text-sm font-semibold text-gray-900">Filter by category</h4>
        <p className="text-xs text-gray-500 mt-0.5">Select one or more categories</p>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {catalog.length === 0 ? (
          <p className="px-2 py-4 text-sm text-gray-500 text-center">No categories available</p>
        ) : (
          <ul className="space-y-1">
            {catalog.map((option) => {
              const checked = draftKeys.includes(option.nameKey);
              return (
                <li key={option.nameKey}>
                  <label className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleKey(option.nameKey)}
                      className="rounded border-gray-300 text-brand-purple focus:ring-brand-purple"
                    />
                    <span className="text-sm text-gray-800">{option.displayName}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="px-3 py-3 border-t border-gray-100 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            onApply(draftKeys);
            onClose();
          }}
          className="px-3 py-1.5 text-sm font-semibold text-white bg-brand-purple hover:bg-purple-700 rounded-lg"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
