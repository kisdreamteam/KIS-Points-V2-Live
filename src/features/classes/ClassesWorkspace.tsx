'use client';

import ClassesWorkspaceContent from './ClassesWorkspaceContent';
import ClassesWorkspaceToolbar from '@/features/classes/components/ClassesWorkspaceToolbar';
import WorkspaceTwoColumnSplit from '@/features/dashboard/components/frame/WorkspaceTwoColumnSplit';
import { useClassActions } from '@/hooks/useClassActions';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { usePreferenceStore } from '@/stores/usePreferenceStore';

export default function ClassesWorkspace() {
  const classes = useDashboardStore((s) => s.classes);
  const isLoadingClasses = useDashboardStore((s) => s.isLoadingClasses);
  const hasAccessibleClasses = useDashboardStore((s) => s.allAccessibleClasses.length > 0);
  const viewMode = usePreferenceStore((s) => s.viewMode);
  const { archiveClass, deleteClassPermanently } = useClassActions();

  return (
    <WorkspaceTwoColumnSplit
      main={
        <ClassesWorkspaceContent
          classes={classes}
          isLoadingClasses={isLoadingClasses}
          hasAccessibleClasses={hasAccessibleClasses}
          viewMode={viewMode}
          onArchiveClassAction={archiveClass}
          onDeleteClassAction={deleteClassPermanently}
        />
      }
      toolbar={<ClassesWorkspaceToolbar />}
    />
  );
}
