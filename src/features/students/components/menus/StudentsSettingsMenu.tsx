'use client';

import { type RefObject } from 'react';
import { createPortal } from 'react-dom';
import MenuItem from '@/components/ui/menu/MenuItem';
import MenuSurface from '@/components/ui/menu/MenuSurface';
import { useAnchoredDropdownPortal } from '@/hooks/useAnchoredDropdownPortal';

interface StudentsSettingsMenuProps {
  isOpen: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  classId?: string | null;
  onEditClass?: () => void;
  onCloseMenu: () => void;
  onLogout: () => void;
}

export default function StudentsSettingsMenu({
  isOpen,
  anchorRef,
  classId,
  onEditClass,
  onCloseMenu,
  onLogout,
}: StudentsSettingsMenuProps) {
  const { isMounted, portalStyle } = useAnchoredDropdownPortal({
    isOpen,
    anchorRef,
    placement: 'aboveAnchorAlignEnd',
    widthPx: 200,
    gapPx: 8,
    zIndex: 110,
  });

  if (!isOpen || !isMounted || !portalStyle) return null;

  return createPortal(
    <MenuSurface data-bottom-nav-menu style={portalStyle}>
      {classId && onEditClass && (
        <MenuItem
          onClick={() => {
            onEditClass();
            onCloseMenu();
          }}
        >
          Edit Class
        </MenuItem>
      )}
      <MenuItem onClick={onLogout}>Log out</MenuItem>
    </MenuSurface>,
    document.body
  );
}
