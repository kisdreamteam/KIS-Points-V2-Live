'use client';

import { type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { useAnchoredDropdownPortal } from '@/hooks/useAnchoredDropdownPortal';
import MenuSurface from '@/components/ui/menu/MenuSurface';
import MenuItem from '@/components/ui/menu/MenuItem';
import MenuDivider from '@/components/ui/menu/MenuDivider';
import MenuLabel from '@/components/ui/menu/MenuLabel';

interface StudentCardActionsMenuProps {
  isOpen: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  studentId: string;
  studentName: string;
  onEdit: (studentId: string) => void;
  onDelete: (studentId: string, studentName: string) => void;
}

export default function StudentCardActionsMenu({
  isOpen,
  anchorRef,
  studentId,
  studentName,
  onEdit,
  onDelete,
}: StudentCardActionsMenuProps) {
  const { isMounted, portalStyle } = useAnchoredDropdownPortal({ isOpen, anchorRef });

  if (!isOpen || !isMounted || !portalStyle) return null;

  const editIcon = (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  );

  const deleteIcon = (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );

  return createPortal(

    // absolute bottom-full right-0 z-[100] mb-2
    <MenuSurface
      style={portalStyle}
      className="w-56 absolute bottom-top z-[100] -translate-y-5 bg-brand-cream"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <MenuLabel className="border-b border-gray-200"> Student Options:</MenuLabel>
      <MenuItem
        icon={editIcon}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onEdit(studentId);
        }}
      >
        Edit Student
      </MenuItem>
      <MenuDivider />
      <MenuItem
        icon={deleteIcon}
        intent="danger"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(studentId, studentName);
        }}
      >
        Delete Student
      </MenuItem>
    </MenuSurface>,
    document.body
  );
}