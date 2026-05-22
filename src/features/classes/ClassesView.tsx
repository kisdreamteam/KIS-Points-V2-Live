'use client';

import ClassesWorkspace from './ClassesWorkspace';
import ClassesCanvasToolbar from '@/features/classes/components/ClassesCanvasToolbar';
import StageTwoColumnLayout from '@/features/dashboard/components/frame/StageTwoColumnLayout';
import { useClassActions } from '@/hooks/useClassActions';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { usePreferenceStore } from '@/stores/usePreferenceStore';

export default function ClassesView() {
  const classes = useDashboardStore((s) => s.classes);
  const isLoadingClasses = useDashboardStore((s) => s.isLoadingClasses);
  const hasAccessibleClasses = useDashboardStore((s) => s.allAccessibleClasses.length > 0);
  const viewMode = usePreferenceStore((s) => s.viewMode);
  const { archiveClass, deleteClassPermanently } = useClassActions();

  return (
    <StageTwoColumnLayout
      main={
        <ClassesWorkspace
          classes={classes}
          isLoadingClasses={isLoadingClasses}
          hasAccessibleClasses={hasAccessibleClasses}
          viewMode={viewMode}
          onArchiveClassAction={archiveClass}
          onDeleteClassAction={deleteClassPermanently}
        />
      }
      toolbar={<ClassesCanvasToolbar />}
    />
  );
}
