'use client';

import type { DashboardToolbarDef } from '@/components/dashboard/frame/dashboardZoneConfig';
import { toCanvasAction } from '@/modules/dashboard/stage/canvasToolbarPresets';

export function useCanvasToolbarActions(toolbarConfig: DashboardToolbarDef) {
  const topActions = toolbarConfig.topActions.map(toCanvasAction);
  const bottomActions = toolbarConfig.bottomActions.map(toCanvasAction);
  return { topActions, bottomActions };
}
