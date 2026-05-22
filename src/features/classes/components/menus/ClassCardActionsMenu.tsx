'use client';

import { type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { useAnchoredDropdownPortal } from '@/hooks/useAnchoredDropdownPortal';
import MenuSurface from '@/components/ui/menu/MenuSurface';
import MenuItem from '@/components/ui/menu/MenuItem';
import MenuDivider from '@/components/ui/menu/MenuDivider';
import MenuLabel from '@/components/ui/menu/MenuLabel';

interface ClassCardActionsMenuProps {
  isOpen: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  classId: string;
  className: string;
  isOwner: boolean;
  archiveButtonText: string;
  showDelete: boolean;
  onEdit: (classId: string) => void;
  onArchive: (classId: string, className: string) => void;
  onDelete?: (classId: string, className: string) => void;
}

export default function ClassCardActionsMenu({
  isOpen,
  anchorRef,
  classId,
  className,
  isOwner,
  archiveButtonText,
  showDelete,
  onEdit,
  onArchive,
  onDelete,
}: ClassCardActionsMenuProps) {
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

  const archiveIcon =
    archiveButtonText === 'Unarchive Class' ? (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ) : (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l6 6m0 0l6-6m-6 6V3" />
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
    <MenuSurface
      style={portalStyle}
      className="w-56 absolute bottom-top z-[100] -translate-y-4 bg-brand-cream rounded-lg shadow-lg"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <MenuLabel className="border-b border-gray-200"> Class Options:</MenuLabel>
      <MenuItem
        icon={editIcon}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onEdit(classId);
        }}
      >
        Edit Class
      </MenuItem>
      {isOwner && (
        <>
          <MenuDivider />
          <MenuItem
            icon={archiveIcon}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onArchive(classId, className);
            }}
          >
            {archiveButtonText}
          </MenuItem>
        </>
      )}
      {isOwner && showDelete && onDelete && (
        <>
          <MenuDivider />
          <MenuItem
            icon={deleteIcon}
            intent="danger"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(classId, className);
            }}
          >
            Delete Class
          </MenuItem>
        </>
      )}
    </MenuSurface>,
    document.body
  );
}
