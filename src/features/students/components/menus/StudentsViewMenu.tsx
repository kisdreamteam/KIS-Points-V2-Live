'use client';

import { type RefObject } from 'react';
import { createPortal } from 'react-dom';
import MenuItem from '@/components/ui/menu/MenuItem';
import MenuLabel from '@/components/ui/menu/MenuLabel';
import MenuSurface from '@/components/ui/menu/MenuSurface';
import { useAnchoredDropdownPortal } from '@/hooks/useAnchoredDropdownPortal';

type ViewMode = 'grid' | 'seating';

interface StudentsViewMenuProps {
  isOpen: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function StudentsViewMenu({
  isOpen,
  anchorRef,
  currentView,
  onViewChange,
}: StudentsViewMenuProps) {
  const { isMounted, portalStyle } = useAnchoredDropdownPortal({
    isOpen,
    anchorRef,
    placement: 'aboveAnchorAlignStart',
    widthPx: 200,
    gapPx: 8,
    zIndex: 110,
  });

  if (!isOpen || !isMounted || !portalStyle) return null;

  return createPortal(
    <MenuSurface data-bottom-nav-menu style={portalStyle}>
      <MenuLabel className="text-brand-purple">View mode:</MenuLabel>
      <MenuItem active={currentView === 'grid'} onClick={() => onViewChange('grid')}>
        Student Grid
      </MenuItem>
      <MenuItem active={currentView === 'seating'} onClick={() => onViewChange('seating')}>
        Seating Chart
      </MenuItem>
    </MenuSurface>,
    document.body
  );
}
