'use client';

import type { CSSProperties } from 'react';
import MenuItem from '@/components/ui/menu/MenuItem';
import MenuSurface from '@/components/ui/menu/MenuSurface';

const defaultMenuClassName = 'min-w-[220px] max-w-[min(90vw,16rem)]';

interface SeatingEditorGroupSettingsMenuProps {
  isOpen: boolean;
  menuClassName?: string;
  style?: CSSProperties;
  onCloseMenu: () => void;
  onEditTeam: () => void;
  onClearTeam: () => void;
  onDeleteTeam: () => void;
}

export default function SeatingEditorGroupSettingsMenu({
  isOpen,
  menuClassName = defaultMenuClassName,
  style,
  onCloseMenu,
  onEditTeam,
  onClearTeam,
  onDeleteTeam,
}: SeatingEditorGroupSettingsMenuProps) {
  if (!isOpen) return null;

  return (
    <MenuSurface
      data-seating-editor-group-settings-menu
      className={menuClassName}
      style={style}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <MenuItem
        onClick={(e) => {
          e.stopPropagation();
          onEditTeam();
          onCloseMenu();
        }}
      >
        Edit Team
      </MenuItem>
      <MenuItem
        onClick={(e) => {
          e.stopPropagation();
          onClearTeam();
          onCloseMenu();
        }}
      >
        Clear Team
      </MenuItem>
      <MenuItem
        intent="danger"
        onClick={(e) => {
          e.stopPropagation();
          onDeleteTeam();
          onCloseMenu();
        }}
      >
        Delete Team
      </MenuItem>
    </MenuSurface>
  );
}
