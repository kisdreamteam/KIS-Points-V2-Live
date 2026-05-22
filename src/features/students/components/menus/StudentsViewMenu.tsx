'use client';

import MenuItem from '@/components/ui/menu/MenuItem';
import MenuLabel from '@/components/ui/menu/MenuLabel';
import MenuSurface from '@/components/ui/menu/MenuSurface';

type ViewMode = 'grid' | 'seating';

interface StudentsViewMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function StudentsViewMenu({ isOpen, currentView, onViewChange }: StudentsViewMenuProps) {
  if (!isOpen) return null;

  return (
    <MenuSurface className="absolute bottom-full left-0 z-[100] mb-2">
      <MenuLabel className="text-brand-purple">View mode:</MenuLabel>
      <MenuItem
        active={currentView === 'grid'}
        onClick={() => onViewChange('grid')}
      >
        Student Grid
      </MenuItem>
      <MenuItem
        active={currentView === 'seating'}
        onClick={() => onViewChange('seating')}
      >
        Seating Chart
      </MenuItem>
    </MenuSurface>
  );
}
