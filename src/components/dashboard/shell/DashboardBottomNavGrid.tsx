import type { ReactNode } from 'react';

type Props = {
  zone5: ReactNode;
  zone6: ReactNode;
  zone7: ReactNode;
  innerClassName?: string;
};

/**
 * Shared 7-zone map skeleton for dashboard shell bottom bars:
 * Zone 5 left cluster | Zone 6 centered primary pair | Zone 7 right anchored actions.
 */
export default function DashboardBottomNavGrid({ zone5, zone6, zone7, innerClassName = '' }: Props) {
  return (
    <div
      className={[
        'grid w-full min-h-0 items-center grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-x-2',
        innerClassName,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex min-w-0 items-center justify-start gap-4 overflow-visible">{zone5}</div>
      <div className="flex shrink-0 items-center justify-center gap-6">{zone6}</div>
      <div className="flex min-w-0 items-center justify-end gap-4 overflow-visible">{zone7}</div>
    </div>
  );
}
