'use client';

import type { CSSProperties } from 'react';
import MenuItem from '@/components/ui/menu/MenuItem';
import MenuSurface from '@/components/ui/menu/MenuSurface';

const defaultMenuClassName = 'absolute bottom-full left-0 z-[100] mb-2 min-w-[220px]';

interface SeatingSettingsMenuProps {
  isOpen: boolean;
  menuClassName?: string;
  style?: CSSProperties;
  /** When true, uses data-toolbar-settings-menu for toolbar portal instance */
  isToolbarMenu?: boolean;
  classId?: string | null;
  onEditClass?: () => void;
  onCloseMenu: () => void;
  onClearAllGroups: () => void;
  onDeleteAllGroups: () => void;
}

export default function SeatingSettingsMenu({
  isOpen,
  menuClassName = defaultMenuClassName,
  style,
  isToolbarMenu = false,
  classId,
  onEditClass,
  onCloseMenu,
  onClearAllGroups,
  onDeleteAllGroups,
}: SeatingSettingsMenuProps) {
  if (!isOpen) return null;

  return (
    <MenuSurface
      data-settings-menu={isToolbarMenu ? undefined : true}
      data-toolbar-settings-menu={isToolbarMenu ? true : undefined}
      className={menuClassName}
      style={style}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {classId && onEditClass && (
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            onEditClass();
            onCloseMenu();
          }}
        >
          Edit Class
        </MenuItem>
      )}
      <MenuItem
        onClick={(e) => {
          e.stopPropagation();
          onClearAllGroups();
        }}
      >
        Clear All Groups
      </MenuItem>

      <MenuItem
        intent="danger"
        onClick={(e) => {
          e.stopPropagation();
          onDeleteAllGroups();
        }}
      >
        Delete All Groups
      </MenuItem>
    </MenuSurface>
  );
}
