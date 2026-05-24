'use client';

import type { DashboardToolbarDef } from '@/features/dashboard/stage/dashboardToolbarConfig';
import { toWorkspaceToolbarAction } from '@/features/dashboard/stage/workspaceToolbarPresets';

export function useWorkspaceToolbarActions(toolbarConfig: DashboardToolbarDef) {
  const topActions = toolbarConfig.topActions.map(toWorkspaceToolbarAction);
  const bottomActions = toolbarConfig.bottomActions.map(toWorkspaceToolbarAction);
  return { topActions, bottomActions };
}
