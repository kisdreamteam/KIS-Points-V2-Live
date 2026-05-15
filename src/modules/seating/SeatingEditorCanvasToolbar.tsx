'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import CanvasToolbar, { toolbarButtonClass, type CanvasToolbarAction } from '@/components/ui/CanvasToolbar';
import IconAddPlus from '@/components/ui/icons/iconAddPlus';
import SeatingViewSettingsMenu from '@/components/dashboard/menus/SeatingViewSettingsMenu';
import IconAutoAssign from '@/components/ui/icons/iconAutoAssign';
import IconRandomArrows from '@/components/ui/icons/iconRandomArrows';
import IconSettingsWheel from '@/components/ui/icons/iconSettingsWheel';
import type { DashboardToolbarDef } from '@/components/dashboard/frame/dashboardZoneConfig';
import { useCanvasToolbarActions } from '@/hooks/dashboard/useCanvasToolbarActions';
import { useAnchoredDropdownPortal } from '@/hooks/useAnchoredDropdownPortal';
import { useSeatingEditBottomNav } from '@/hooks/useSeatingEditBottomNav';

const toolbarViewSettingsMenuClassName = 'min-w-[220px]';

type SeatingEditorCanvasToolbarProps = {
  toolbarConfig: DashboardToolbarDef;
};

export default function SeatingEditorCanvasToolbar({ toolbarConfig }: SeatingEditorCanvasToolbarProps) {
  const { topActions } = useCanvasToolbarActions(toolbarConfig);
  const {
    showGrid,
    showFurniture,
    teachersDeskLeft,
    colorByGender,
    onToggleShowGrid,
    onToggleShowFurniture,
    onToggleTeachersDeskLeft,
    onToggleColorByGender,
    onAutoAssignSeats,
    onRandomize,
    onAddGroups,
  } = useSeatingEditBottomNav();

  const addGroupBottomActions = useMemo<CanvasToolbarAction[]>(
    () => [
      {
        id: 'add-group',
        title: 'Add group',
        icon: <IconAddPlus className="w-6 h-6 text-white" />,
        onClick: () => onAddGroups(1),
        variant: 'danger',
      },
    ],
    [onAddGroups]
  );

  const [isViewSettingsMenuOpen, setIsViewSettingsMenuOpen] = useState(false);
  const viewSettingsButtonRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { isMounted, portalStyle } = useAnchoredDropdownPortal({
    isOpen: isViewSettingsMenuOpen,
    anchorRef: viewSettingsButtonRef,
    placement: 'leftOfAnchor',
    widthPx: 220,
  });

  useEffect(() => {
    if (!isViewSettingsMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (viewSettingsButtonRef.current?.contains(target)) return;
      setIsViewSettingsMenuOpen(false);
    };

    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, [isViewSettingsMenuOpen]);

  const viewSettingsMenu = (
    <div ref={menuRef}>
      <SeatingViewSettingsMenu
        isOpen={isViewSettingsMenuOpen}
        isToolbarMenu
        menuClassName={toolbarViewSettingsMenuClassName}
        style={portalStyle ?? undefined}
        showGrid={showGrid}
        showFurniture={showFurniture}
        teachersDeskLeft={teachersDeskLeft}
        colorByGender={colorByGender}
        onToggleShowGrid={onToggleShowGrid}
        onToggleShowFurniture={onToggleShowFurniture}
        onToggleTeachersDeskLeft={onToggleTeachersDeskLeft}
        onToggleColorByGender={onToggleColorByGender}
      />
    </div>
  );

  return (
    <div data-stage-toolbar-slot className="relative h-full min-h-0 overflow-visible">
      <CanvasToolbar
        className={`h-full ${toolbarConfig.className ?? ''}`}
        topActions={topActions}
        bottomActions={addGroupBottomActions}
        topSlot={
          <div className="flex flex-col gap-2">
            <div ref={viewSettingsButtonRef}>
              <button
                type="button"
                title="View Settings"
                aria-label="View Settings"
                className={toolbarButtonClass({ active: isViewSettingsMenuOpen })}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsViewSettingsMenuOpen((open) => !open);
                }}
              >
                <IconSettingsWheel className="w-6 h-6 text-black" />
              </button>
            </div>
            <button
              type="button"
              title="Auto Assign Seats"
              aria-label="Auto Assign Seats"
              className={toolbarButtonClass()}
              onClick={(e) => {
                e.stopPropagation();
                onAutoAssignSeats();
              }}
            >
              <IconAutoAssign className="w-6 h-6 text-black" />
            </button>
            <button
              type="button"
              title="Randomize Seats"
              aria-label="Randomize Seats"
              className={toolbarButtonClass()}
              onClick={(e) => {
                e.stopPropagation();
                onRandomize();
              }}
            >
              <IconRandomArrows className="w-6 h-6 text-black" />
            </button>
          </div>
        }
      />
      {isViewSettingsMenuOpen &&
        isMounted &&
        portalStyle &&
        createPortal(viewSettingsMenu, document.body)}
    </div>
  );
}
