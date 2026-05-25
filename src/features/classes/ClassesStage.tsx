'use client';

import ClassesStageContent from './ClassesStageContent';
import { useClassActions } from '@/features/classes/hooks/useClassActions';
import { useDashboardStore } from '@/features/dashboard/stores/useDashboardStore';
import { usePreferenceStore } from '@/stores/usePreferenceStore';

export default function ClassesStage() {
  const classes = useDashboardStore((s) => s.classes);
  const isLoadingClasses = useDashboardStore((s) => s.isLoadingClasses);
  const hasAccessibleClasses = useDashboardStore((s) => s.allAccessibleClasses.length > 0);
  const viewMode = usePreferenceStore((s) => s.viewMode);
  const { archiveClass, deleteClassPermanently } = useClassActions();

  return (
    <ClassesStageContent
      classes={classes}
      isLoadingClasses={isLoadingClasses}
      hasAccessibleClasses={hasAccessibleClasses}
      viewMode={viewMode}
      onArchiveClassAction={archiveClass}
      onDeleteClassAction={deleteClassPermanently}
    />
  );
}
