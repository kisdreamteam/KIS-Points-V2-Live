'use client';

import { type RefObject } from 'react';
import { createPortal } from 'react-dom';
import MenuItem from '@/components/ui/menu/MenuItem';
import MenuLabel from '@/components/ui/menu/MenuLabel';
import MenuSurface from '@/components/ui/menu/MenuSurface';
import { useAnchoredDropdownPortal } from '@/hooks/useAnchoredDropdownPortal';
import type { SortOption } from '@/stores/usePreferenceStore';

interface StudentsSortingMenuProps {
  isOpen: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  sortBy: SortOption;
  onPick: (next: SortOption) => void;
}

export default function StudentsSortingMenu({
  isOpen,
  anchorRef,
  sortBy,
  onPick,
}: StudentsSortingMenuProps) {
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
      <MenuLabel className="border-b border-gray-200">Sort by:</MenuLabel>
      <MenuItem active={sortBy === 'number'} onClick={() => onPick('number')}>
        Student Number
      </MenuItem>
      <MenuItem active={sortBy === 'alphabetical'} onClick={() => onPick('alphabetical')}>
        Alphabetical
      </MenuItem>
      <MenuItem active={sortBy === 'points'} onClick={() => onPick('points')}>
        Points
      </MenuItem>
    </MenuSurface>,
    document.body
  );
}
