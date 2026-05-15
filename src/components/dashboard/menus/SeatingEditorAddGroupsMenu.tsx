'use client';

import type { CSSProperties } from 'react';
import MenuItem from '@/components/ui/menu/MenuItem';
import MenuSurface from '@/components/ui/menu/MenuSurface';

const GROUP_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

const defaultMenuClassName = 'absolute bottom-full left-0 z-[100] mb-2 min-w-[220px]';

interface SeatingEditorAddGroupsMenuProps {
  isOpen: boolean;
  onAddGroups: (numGroups: number) => void;
  menuClassName?: string;
  style?: CSSProperties;
  /** When true, uses data-toolbar-add-groups-menu for toolbar portal instance */
  isToolbarMenu?: boolean;
}

export default function SeatingEditorAddGroupsMenu({
  isOpen,
  onAddGroups,
  menuClassName = defaultMenuClassName,
  style,
  isToolbarMenu = false,
}: SeatingEditorAddGroupsMenuProps) {
  if (!isOpen) return null;

  return (
    <MenuSurface
      data-add-groups-menu={isToolbarMenu ? undefined : true}
      data-toolbar-add-groups-menu={isToolbarMenu ? true : undefined}
      className={menuClassName}
      style={style}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {GROUP_OPTIONS.map((num) => (
        <MenuItem
          key={num}
          onClick={(e) => {
            e.stopPropagation();
            onAddGroups(num);
          }}
        >
          {num} Groups
        </MenuItem>
      ))}
    </MenuSurface>
  );
}
