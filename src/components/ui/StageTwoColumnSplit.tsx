import type { CSSProperties, ReactNode } from 'react';

/** WorkspaceToolbar column: w-10 (40px) + p-2 × 2 (16px). */
export const STAGE_TOOLBAR_COLUMN_WIDTH_PX = 56;

/** Fixed drawer `right` offset; ~4px gap beside the toolbar column. */
export const STAGE_DRAWER_RIGHT_OFFSET_PX = 60;

type StageTwoColumnSplitProps = {
  children: ReactNode;
  rightRail: ReactNode;
  rightRailClassName?: string;
};

export default function StageTwoColumnSplit({
  children,
  rightRail,
  rightRailClassName = 'overflow-hidden',
}: StageTwoColumnSplitProps) {
  const gridStyle = {
    '--stage-toolbar-width': `${STAGE_TOOLBAR_COLUMN_WIDTH_PX}px`,
  } as CSSProperties;

  return (
    <div
      className="grid h-full min-h-0 w-full min-w-0 grid-cols-[minmax(0,1fr)_var(--stage-toolbar-width)]"
      style={gridStyle}
    >
      <div className="relative min-h-0 min-w-0 overflow-y-auto overflow-x-hidden pt-1">
        {children}
      </div>
      <div
        data-stage-toolbar-column
        className={[
          'relative h-full min-h-0 w-[var(--stage-toolbar-width)] min-w-[var(--stage-toolbar-width)] shrink-0',
          rightRailClassName,
        ].join(' ')}
      >
        {rightRail}
      </div>
    </div>
  );
}
