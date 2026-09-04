'use client';

import { useCallback } from 'react';
import {
  archiveClass as archiveClassApi,
  deleteClassPermanently as deleteClassPermanentlyApi,
} from '@/features/classes/lib/api/classes';
import { refreshDashboardClassesForUserAction } from '@/features/dashboard/hooks/sync/dashboardClassesRefresh';
import { invalidateStudentsCacheForClass } from '@/features/dashboard/hooks/sync/dashboardStudentRefresh';

type ArchiveClassParams = {
  classId: string;
  isArchivedView: boolean;
};

type DeleteClassParams = {
  classId: string;
};

export function useClassActions() {
  const archiveClass = useCallback(async ({ classId, isArchivedView }: ArchiveClassParams) => {
    await archiveClassApi(classId, !isArchivedView);
    await refreshDashboardClassesForUserAction();
    window.dispatchEvent(new CustomEvent('classUpdated'));
  }, []);

  const deleteClassPermanently = useCallback(async ({ classId }: DeleteClassParams) => {
    await deleteClassPermanentlyApi(classId);
    invalidateStudentsCacheForClass(classId);
    await refreshDashboardClassesForUserAction();
    window.dispatchEvent(new CustomEvent('classUpdated'));
  }, []);

  return {
    archiveClass,
    deleteClassPermanently,
  };
}
