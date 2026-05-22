'use client';

import type { DashboardToolbarDef } from '@/features/dashboard/stage/dashboardToolbarConfig';
import { toCanvasAction } from '@/features/dashboard/stage/canvasToolbarPresets';

export function useCanvasToolbarActions(toolbarConfig: DashboardToolbarDef) {
  const topActions = toolbarConfig.topActions.map(toCanvasAction);
  const bottomActions = toolbarConfig.bottomActions.map(toCanvasAction);
  return { topActions, bottomActions };
}
