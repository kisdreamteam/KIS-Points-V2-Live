import type { ViewState } from '@/stores/useLayoutStore';

type ToolbarActionId = 'close-editor' | 'add' | 'edit' | 'layout-manager' | 'teacher-view' | 'point-log';

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

type ShellZoneInputs = {
  isSidebarOpen: boolean;
  activeView: ViewState;
  isEditMode: boolean;
};

type WorkspaceZoneInputs = {
  activeView: ViewState;
  isEditMode: boolean;
  isTimerOpen: boolean;
  isRandomOpen: boolean;
  currentClassName: string | null;
  seatingLayoutsCount: number;
};

export function getShellZoneConfig({ isSidebarOpen, activeView, isEditMode }: ShellZoneInputs) {
  const isSeatingChartView = activeView === 'seating_chart';
  return {
    shellGridColsClass: isSidebarOpen ? 'grid-cols-[19rem_1fr]' : 'grid-cols-[0px_1fr]',
    useSeatingEditorLeftNav: isSeatingChartView && isEditMode,
  };
}

export function getWorkspaceZoneConfig({
  activeView,
  isEditMode,
  isTimerOpen,
  isRandomOpen,
  currentClassName,
  seatingLayoutsCount,
}: WorkspaceZoneInputs) {
  const isSeatingView = activeView === 'seating_chart';
  const showTopNav = !isSeatingView;
  const stageContentPadding = isSeatingView ? '' : 'pl-2 pt-2';
  const showBottomNav = Boolean(currentClassName) && !isTimerOpen && !isRandomOpen;

  const toolbarConfig: DashboardToolbarDef = isSeatingView
    ? {
        className: 'z-10',
        topActions: isEditMode
          ? [{ id: 'close-editor', title: 'Close editor' }]
          : [
              { id: 'add', title: 'Create new layout' },
              { id: 'edit', title: 'Seating Editor View' },
              { id: 'layout-manager', title: 'Layout manager', disabled: seatingLayoutsCount === 0 },
            ],
        bottomActions: isEditMode
          ? []
          : [
              { id: 'teacher-view', title: "Teacher's view" },
              { id: 'point-log', title: 'Toggle point log' },
            ],
      }
    : {
        className: '!bg-white',
        topActions: [
          { id: 'add', title: 'Create layout (seating view only)', disabled: true },
          { id: 'edit', title: 'Seating Editor (seating view only)', disabled: true },
        ],
        bottomActions: [
          { id: 'teacher-view', title: "Teacher's view (seating view only)", disabled: true },
          { id: 'point-log', title: 'Toggle point log' },
        ],
      };

  return {
    isSeatingView,
    showTopNav,
    stageContentPadding,
    showBottomNav,
    toolbarConfig,
  };
}
