'use client';

import WorkspaceToolbar from '@/components/ui/WorkspaceToolbar';
import type { DashboardToolbarDef } from '@/features/dashboard/stage/dashboardToolbarConfig';
import { useWorkspaceToolbarActions } from '@/hooks/dashboard/useWorkspaceToolbarActions';

export default function DashboardWorkspaceToolbar({
  toolbarConfig,
}: {
  toolbarConfig: DashboardToolbarDef;
}) {
  const { topActions, bottomActions } = useWorkspaceToolbarActions(toolbarConfig);
  return (
    <div data-stage-toolbar-slot className="h-full min-h-0 overflow-hidden">
      <WorkspaceToolbar
        className={`h-full ${toolbarConfig.className ?? ''}`}
        topActions={topActions}
        bottomActions={bottomActions}
      />
    </div>
  );
}
