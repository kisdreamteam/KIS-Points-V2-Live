import type { ViewState } from '@/stores/useLayoutStore';

export type ToolbarActionId =
  | 'close-editor'
  | 'add'
  | 'edit'
  | 'layout-manager'
  | 'teacher-view'
  | 'point-log';

export type ToolbarActionDef = {
  id: ToolbarActionId;
  title: string;
  disabled?: boolean;
};

export type DashboardToolbarDef = {
  className: string;
  topActions: ToolbarActionDef[];
  bottomActions: ToolbarActionDef[];
};

export const mainStageGridRowsClassName =
  'grid h-full min-h-0 grid-rows-[auto_1fr_auto] gap-0';

export const mainHeaderRowClassName = 'row-start-1 row-end-2';

export const mainSectionRowClassName = 'row-start-2 row-end-3';

export const mainFooterRowClassName = 'row-start-3 row-end-4';

export const mainSectionStagePaddingClassName = 'pl-0 pt-0';

export const canvasToolbarGridColsClassName = 'grid-cols-[1fr_auto]';

export const canvasZoneBaseClassName =
  'relative w-full h-full min-h-0 overflow-y-auto overflow-x-hidden pt-1';

export const canvasToolbarGridInnerClassName = 'grid h-full min-h-0 -mt-0';

export type ShellGridConfigInput = {
  isSidebarOpen: boolean;
  activeView: ViewState;
  isEditMode: boolean;
};

export type ShellGridConfig = {
  dashboardGridColsClassName: string;
  useSeatingEditorLeftNav: boolean;
};

export function getShellGridConfig({
  isSidebarOpen,
  activeView,
  isEditMode,
}: ShellGridConfigInput): ShellGridConfig {
  const isSeatingChartView = activeView === 'seating_chart';
  return {
    dashboardGridColsClassName: isSidebarOpen
      ? 'grid-cols-[0px_1fr] md:grid-cols-[19rem_1fr]'
      : 'grid-cols-[0px_1fr]',
    useSeatingEditorLeftNav: isSeatingChartView && isEditMode,
  };
}

export function buildCanvasZoneCellClassName(showCanvasToolbar: boolean): string {
  return [canvasZoneBaseClassName, showCanvasToolbar ? '' : 'col-start-1 col-end-3']
    .filter(Boolean)
    .join(' ');
}

export function getToolbarZoneCellClassName(
  isSeatingView: boolean,
  isEditMode: boolean
): string {
  return [
    'relative h-full min-h-0',
    isSeatingView && isEditMode ? 'overflow-visible' : 'overflow-hidden',
  ].join(' ');
}

export type ShellToolbarConfigInput = {
  activeView: ViewState;
  isEditMode: boolean;
  seatingLayoutsCount: number;
};

export function buildShellToolbarConfig({
  activeView,
  isEditMode,
  seatingLayoutsCount,
}: ShellToolbarConfigInput): DashboardToolbarDef {
  const isSeatingView = activeView === 'seating_chart';

  if (isSeatingView) {
    const noLayouts = seatingLayoutsCount === 0;
    return {
      className: 'z-10',
      topActions: isEditMode
        ? [{ id: 'close-editor', title: 'Close editor' }]
        : [
            { id: 'add', title: 'Create new layout' },
            { id: 'edit', title: 'Seating Editor View', disabled: noLayouts },
            {
              id: 'layout-manager',
              title: 'Layout manager',
              disabled: noLayouts,
            },
          ],
      bottomActions: isEditMode
        ? []
        : [
            { id: 'teacher-view', title: "Teacher's view" },
            { id: 'point-log', title: 'Toggle point log' },
          ],
    };
  }

  return {
    className: '!bg-white',
    topActions: [
      {
        id: 'add',
        title: 'Create layout (seating view only)',
        disabled: true,
      },
      {
        id: 'edit',
        title: 'Seating Editor (seating view only)',
        disabled: true,
      },
      { id: 'layout-manager', title: 'Layout manager', disabled: true },
    ],
    bottomActions: [
      {
        id: 'teacher-view',
        title: "Teacher's view (seating view only)",
        disabled: true,
      },
      { id: 'point-log', title: 'Toggle point log' },
    ],
  };
}
