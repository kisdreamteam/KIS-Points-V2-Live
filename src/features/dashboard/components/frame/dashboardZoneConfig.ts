import type { ViewState } from '@/stores/useLayoutStore';

export const mainStageGridRowsClassName =
  'grid h-full min-h-0 grid-rows-[auto_1fr_auto] gap-0';

export const mainHeaderRowClassName = 'row-start-1 row-end-2';

export const mainSectionRowClassName = 'row-start-2 row-end-3';

export const mainFooterRowClassName = 'row-start-3 row-end-4';

export const mainSectionStagePaddingClassName = 'pl-0 pt-0';

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
