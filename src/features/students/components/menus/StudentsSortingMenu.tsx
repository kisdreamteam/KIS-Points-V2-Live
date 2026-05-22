'use client';

import MenuItem from '@/components/ui/menu/MenuItem';
import MenuLabel from '@/components/ui/menu/MenuLabel';
import MenuSurface from '@/components/ui/menu/MenuSurface';
import type { SortOption } from '@/stores/usePreferenceStore';

interface StudentsSortingMenuProps {
  isOpen: boolean;
  sortBy: SortOption;
  onPick: (next: SortOption) => void;
}

export default function StudentsSortingMenu({ isOpen, sortBy, onPick }: StudentsSortingMenuProps) {
  if (!isOpen) return null;

  return (
    <MenuSurface className="absolute bottom-full left-0 z-[100] mb-2">
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
    </MenuSurface>
  );
}
