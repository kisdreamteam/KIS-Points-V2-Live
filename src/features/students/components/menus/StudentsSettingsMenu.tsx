'use client';

import MenuItem from '@/components/ui/menu/MenuItem';
import MenuSurface from '@/components/ui/menu/MenuSurface';

interface StudentsSettingsMenuProps {
  isOpen: boolean;
  classId?: string | null;
  onEditClass?: () => void;
  onCloseMenu: () => void;
  onLogout: () => void;
}

export default function StudentsSettingsMenu({ isOpen, classId, onEditClass, onCloseMenu, onLogout }: StudentsSettingsMenuProps) {
  if (!isOpen) return null;

  return (
    <MenuSurface className="absolute bottom-full right-0 z-[100] mb-2">
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
      <MenuItem onClick={onLogout}>
        Log out
      </MenuItem>
    </MenuSurface>
  );
}
