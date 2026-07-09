import type { ViewState } from '@/stores/useLayoutStore';

export type ToolbarActionId =
  | 'close-editor'
  | 'add'
  | 'edit'
  | 'layout-manager'
  | 'points-report'
  | 'teacher-view'
  | 'point-log';

export type ToolbarActionDef = {
  id: ToolbarActionId;
  title: string;
  disabled?: boolean;
  active?: boolean;
};

export type DashboardToolbarDef = {
  className: string;
  topActions: ToolbarActionDef[];
  bottomActions: ToolbarActionDef[];
};

export type ShellToolbarConfigInput = {
  activeView: ViewState;
  isEditMode: boolean;
  seatingLayoutsCount: number;
  activeBottomActionIds?: ToolbarActionId[];
};

function withActiveBottomActions(
  actions: ToolbarActionDef[],
  activeBottomActionIds: ToolbarActionId[] = []
): ToolbarActionDef[] {
  const activeSet = new Set(activeBottomActionIds);
  return actions.map((action) => ({
    ...action,
    active: activeSet.has(action.id) ? true : action.active,
  }));
}

export function buildShellToolbarConfig({
  activeView,
  isEditMode,
  seatingLayoutsCount,
  activeBottomActionIds = [],
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
        : withActiveBottomActions(
            [
              { id: 'points-report', title: 'Points report' },
              { id: 'teacher-view', title: "Teacher's view" },
              { id: 'point-log', title: 'Toggle point log' },
            ],
            activeBottomActionIds
          ),
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
    bottomActions: withActiveBottomActions(
      [
        {
          id: 'points-report',
          title: 'Points report (class view only)',
          disabled: activeView === 'classes',
        },
        {
          id: 'teacher-view',
          title: "Teacher's view (seating view only)",
          disabled: true,
        },
        { id: 'point-log', title: 'Toggle point log' },
      ],
      activeBottomActionIds
    ),
  };
}
