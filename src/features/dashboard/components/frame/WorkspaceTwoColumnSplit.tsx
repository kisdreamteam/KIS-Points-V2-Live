import type { ReactNode } from 'react';

type WorkspaceTwoColumnSplitProps = {
  main: ReactNode;
  toolbar: ReactNode;
  toolbarColumnClassName?: string;
};

export default function WorkspaceTwoColumnSplit({
  main,
  toolbar,
  toolbarColumnClassName = 'overflow-hidden',
}: WorkspaceTwoColumnSplitProps) {
  return (
    <div className="grid h-full min-h-0 grid-cols-[1fr_auto]">
      <div className="relative min-h-0 min-w-0 overflow-y-auto overflow-x-hidden pt-1">
        {main}
      </div>
      <div
        data-stage-toolbar-column
        className={['relative h-full min-h-0 shrink-0', toolbarColumnClassName].join(' ')}
      >
        {toolbar}
      </div>
    </div>
  );
}
