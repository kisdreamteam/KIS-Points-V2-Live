'use client';

import type { CSSProperties } from 'react';
import MenuSurface from '@/components/ui/menu/MenuSurface';

const toggleTrackOn = 'bg-brand-purple';
const toggleTrackOff = 'bg-gray-300';

const defaultMenuClassName = 'absolute bottom-full left-0 z-[100] mb-2 min-w-[220px]';

interface SeatingViewSettingsMenuProps {
  isOpen: boolean;
  menuClassName?: string;
  style?: CSSProperties;
  /** When true, uses data-toolbar-view-settings-menu for toolbar portal instance */
  isToolbarMenu?: boolean;
  showGrid: boolean;
  showFurniture: boolean;
  teachersDeskLeft: boolean;
  colorByGender: boolean;
  onToggleShowGrid: (next: boolean) => void;
  onToggleShowFurniture: (next: boolean) => void;
  onToggleTeachersDeskLeft: (next: boolean) => void;
  onToggleColorByGender: () => void;
}

export default function SeatingViewSettingsMenu({
  isOpen,
  menuClassName = defaultMenuClassName,
  style,
  isToolbarMenu = false,
  showGrid,
  showFurniture,
  teachersDeskLeft,
  colorByGender,
  onToggleShowGrid,
  onToggleShowFurniture,
  onToggleTeachersDeskLeft,
  onToggleColorByGender,
}: SeatingViewSettingsMenuProps) {
  if (!isOpen) return null;

  const teachersDeskEnabled = showFurniture;

  return (
    <MenuSurface
      data-view-settings-menu={isToolbarMenu ? undefined : true}
      data-toolbar-view-settings-menu={isToolbarMenu ? true : undefined}
      className={menuClassName}
      style={style}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-50">
        <span className="text-sm font-medium text-gray-700">Show Grid</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            void onToggleShowGrid(!showGrid);
          }}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showGrid ? toggleTrackOn : toggleTrackOff
            }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showGrid ? 'translate-x-6' : 'translate-x-1'
              }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-50">
        <span className="text-sm font-medium text-gray-700">Show Furniture</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            void onToggleShowFurniture(!showFurniture);
          }}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showFurniture ? toggleTrackOn : toggleTrackOff
            }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showFurniture ? 'translate-x-6' : 'translate-x-1'
              }`}
          />
        </button>
      </div>

      <div
        className={`flex items-center justify-between px-4 py-2 hover:bg-gray-50 ${teachersDeskEnabled ? '' : 'opacity-50'}`}
      >
        <span className="text-sm font-medium text-gray-700">Teacher&apos;s Desk Left</span>
        {teachersDeskEnabled ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              void onToggleTeachersDeskLeft(!teachersDeskLeft);
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${teachersDeskLeft ? toggleTrackOn : toggleTrackOff
              }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${teachersDeskLeft ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="relative inline-flex h-6 w-11 cursor-not-allowed items-center rounded-full bg-gray-300 transition-colors"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${teachersDeskLeft ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-50">
        <span className="text-sm font-medium text-gray-700">Color by Gender</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleColorByGender();
          }}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${colorByGender ? toggleTrackOn : toggleTrackOff
            }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${colorByGender ? 'translate-x-6' : 'translate-x-1'
              }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between px-4 py-2 opacity-50 hover:bg-gray-50">
        <span className="text-sm font-medium text-gray-700">Color by Level</span>
        <button
          type="button"
          disabled
          className="relative inline-flex h-6 w-11 cursor-not-allowed items-center rounded-full bg-gray-300 transition-colors"
        >
          <span className="inline-block h-4 w-4 translate-x-1 transform rounded-full bg-white transition-transform" />
        </button>
      </div>
    </MenuSurface>
  );
}
