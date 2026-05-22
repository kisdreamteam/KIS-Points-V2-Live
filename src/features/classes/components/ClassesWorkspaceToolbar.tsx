'use client';

import WorkspaceToolbar from '@/components/ui/WorkspaceToolbar';
import { buildShellToolbarConfig } from '@/features/dashboard/stage/dashboardToolbarConfig';
import { useWorkspaceToolbarActions } from '@/hooks/dashboard/useWorkspaceToolbarActions';

const classesToolbarConfig = buildShellToolbarConfig({
  activeView: 'classes',
  isEditMode: false,
  seatingLayoutsCount: 0,
});

export default function ClassesWorkspaceToolbar() {
  const { topActions, bottomActions } = useWorkspaceToolbarActions(classesToolbarConfig);

  return (
    <div data-stage-toolbar-slot className="h-full min-h-0 overflow-hidden">
      <WorkspaceToolbar
        className={`h-full ${classesToolbarConfig.className}`}
        topActions={topActions}
        bottomActions={bottomActions}
      />
    </div>
  );
}
