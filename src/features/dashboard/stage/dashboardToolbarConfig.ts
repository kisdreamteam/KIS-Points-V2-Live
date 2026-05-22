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
