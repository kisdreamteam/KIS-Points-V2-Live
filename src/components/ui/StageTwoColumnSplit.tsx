import type { ReactNode } from 'react';

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
  return (
    <div className="grid h-full min-h-0 grid-cols-[1fr_auto]">
      <div className="relative min-h-0 min-w-0 overflow-y-auto overflow-x-hidden pt-1">
        {children}
      </div>
      <div
        data-stage-toolbar-column
        className={['relative h-full min-h-0 shrink-0', rightRailClassName].join(' ')}
      >
        {rightRail}
      </div>
    </div>
  );
}
