import { useEffect } from 'react';

const DEFAULT_EXCLUDE_SELECTORS = [
  '[data-points-log-drawer]',
  '[data-layout-manager-drawer]',
  '[data-stage-toolbar-column]',
  '[data-workspace-toolbar]',
];

type UseCloseDrawersOnClickOutsideParams = {
  isActive: boolean;
  onClose: () => void;
  excludeSelectors?: string[];
};

export function useCloseDrawersOnClickOutside({
  isActive,
  onClose,
  excludeSelectors = DEFAULT_EXCLUDE_SELECTORS,
}: UseCloseDrawersOnClickOutsideParams) {
  useEffect(() => {
    if (!isActive) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      for (const selector of excludeSelectors) {
        const excluded = document.querySelector(selector);
        if (excluded?.contains(target)) {
          return;
        }
      }
      onClose();
    };

    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, [isActive, onClose, excludeSelectors]);
}
