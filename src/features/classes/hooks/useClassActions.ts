'use client';

import { useCallback } from 'react';
import { archiveClass as archiveClassApi } from '@/features/classes/lib/api/classes';
import { refreshDashboardClassesForUserAction } from '@/features/dashboard/hooks/sync/dashboardClassesRefresh';

type ArchiveClassParams = {
  classId: string;
  isArchivedView: boolean;
};

export function useClassActions() {
  const archiveClass = useCallback(async ({ classId, isArchivedView }: ArchiveClassParams) => {
    await archiveClassApi(classId, !isArchivedView);
    await refreshDashboardClassesForUserAction();
    window.dispatchEvent(new CustomEvent('classUpdated'));
  }, []);

  return {
    archiveClass,
  };
}
