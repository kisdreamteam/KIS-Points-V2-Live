'use client';

import { useCallback, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { BOUNCY_BALLS_URL } from '@/lib/bouncyBalls';
import { formatClassListForClipboard } from '@/lib/classRoster';
import { DUCK_RACE_GAME_URL } from '@/lib/duckRace';
import { buildFlippityNamePickerUrl, FLIPPITY_HOME_URL } from '@/lib/flippity';
import { ONLINE_STOPWATCH_URL } from '@/lib/onlineStopwatch';
import { useDashboardStore } from '@/features/dashboard/stores/useDashboardStore';
import { useLayoutStore } from '@/stores/useLayoutStore';

export type LeftNavWebsitesMenuProps = {
  isOpen: boolean;
  position: 'fixed' | 'absolute';
  leftPx: number;
  topPx: number;
  bottomPx: number;
  zIndex?: number;
};

const menuItemClassName =
  'w-full text-left px-4 py-3 text-sm font-medium text-gray-900 hover:bg-brand-cream disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent border-b border-gray-100';

export default function LeftNavWebsitesMenu({
  isOpen,
  position,
  leftPx,
  topPx,
  bottomPx,
  zIndex = 20,
}: LeftNavWebsitesMenuProps) {
  const activeView = useLayoutStore((s) => s.activeView);
  const students = useDashboardStore((s) => s.students);

  const firstNames = useMemo(
    () =>
      students
        .filter((s) => !s.is_archived)
        .map((s) => s.first_name)
        .filter(Boolean),
    [students]
  );

  const flippityUrl = useMemo(() => buildFlippityNamePickerUrl(firstNames), [firstNames]);
  const isOnClassesView = activeView === 'classes';
  const isRosterToolDisabled = isOnClassesView || firstNames.length === 0;

  const handleCopyRosterAndOpen = useCallback(async (url: string) => {
    const text = formatClassListForClipboard(firstNames);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Still open the site so the user can paste manually if clipboard fails.
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [firstNames]);

  const style: CSSProperties = {
    position,
    top: topPx,
    bottom: bottomPx,
    left: leftPx,
    width: 'min(720px, calc(100% - 160px))',
    transform: isOpen ? 'translateX(0)' : 'translateX(-110%)',
    opacity: isOpen ? 1 : 0,
    pointerEvents: isOpen ? 'auto' : 'none',
    zIndex,
  };

  return (
    <div className="transition-all duration-300 ease-out" style={style}>
      <div className="h-full rounded-xl border-2 border-black bg-brand-cream/60 backdrop-blur-lg shadow-lg overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Helpful Websites (Opens in new tabs)</h3>
        </div>
        <div className="flex-1 min-h-0 overflow-auto">
          <button
            type="button"
            disabled={isRosterToolDisabled}
            onClick={() => window.open(flippityUrl, '_blank', 'noopener,noreferrer')}
            className={menuItemClassName}
          >
            <span className="block font-semibold">Flippity Name Picker</span>
            <span className="block text-xs font-normal text-gray-500 mt-0.5">
              Automatically inserts names into spinning wheel
            </span>
          </button>
          <button
            type="button"
            disabled={isRosterToolDisabled}
            onClick={() => void handleCopyRosterAndOpen(DUCK_RACE_GAME_URL)}
            className={menuItemClassName}
          >
            <span className="block font-semibold">Duck Race Name Picker</span>
            <span className="block text-xs font-normal text-gray-500 mt-0.5">
              Name list is copied automatically. Must paste into Duck Race manually. :(
            </span>
          </button>
          <button
            type="button"
            onClick={() => window.open(FLIPPITY_HOME_URL, '_blank', 'noopener,noreferrer')}
            className={menuItemClassName}
          >
            <span className="block font-semibold">Flippity Game Resources Website</span>
            <span className="block text-xs font-normal text-gray-500 mt-0.5">
              Opens Flippity Game Resources website in new tab - Variety of activities and games to choose from
            </span>
          </button>
          <button
            type="button"
            disabled={isRosterToolDisabled}
            onClick={() => void handleCopyRosterAndOpen(ONLINE_STOPWATCH_URL)}
            className={menuItemClassName}
          >
            <span className="block font-semibold">Online-Stopwatch Resource Website</span>
            <span className="block text-xs font-normal text-gray-500 mt-0.5">
              Name list is copied automatically. Opens Online-Stopwatch in a new tab ??Must paste into name pickers. Not all are free.
            </span>
          </button>
          <button
            type="button"
            onClick={() => window.open(BOUNCY_BALLS_URL, '_blank', 'noopener,noreferrer')}
            className={menuItemClassName}
          >
            <span className="block font-semibold">Bouncy Balls Noise Meter</span>
            <span className="block text-xs font-normal text-gray-500 mt-0.5">
              Enable your microphone to use the noise meter
            </span>
          </button>
          {isOnClassesView && (
            <p className="px-4 py-2 text-xs text-gray-500">
              Select a class to copy the student roster for Flippity Name Picker, Duck Race, and
              Online-Stopwatch.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
