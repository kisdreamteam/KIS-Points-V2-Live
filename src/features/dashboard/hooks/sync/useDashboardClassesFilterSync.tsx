'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { usePreferenceStore } from '@/stores/usePreferenceStore';

/** Mirrors `allAccessibleClasses` + `viewMode` into filtered `classes` on the dashboard store. */
export function DashboardClassesFilterSync() {
  const allAccessibleClasses = useDashboardStore((s) => s.allAccessibleClasses);
  const viewMode = usePreferenceStore((s) => s.viewMode);

  useEffect(() => {
    const filtered = allAccessibleClasses.filter((cls) =>
      viewMode === 'archived' ? cls.is_archived : !cls.is_archived
    );
    useDashboardStore.getState().setClasses(filtered);
  }, [allAccessibleClasses, viewMode]);

  return null;
}
