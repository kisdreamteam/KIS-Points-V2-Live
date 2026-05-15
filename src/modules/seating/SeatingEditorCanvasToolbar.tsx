'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import CanvasToolbar, { toolbarButtonClass, type CanvasToolbarAction } from '@/components/ui/CanvasToolbar';
import SeatingEditorAddGroupsMenu from '@/components/dashboard/menus/SeatingEditorAddGroupsMenu';
import SeatingSettingsMenu from '@/components/dashboard/menus/SeatingSettingsMenu';
import IconAddPlus from '@/components/ui/icons/iconAddPlus';
import SeatingViewSettingsMenu from '@/components/dashboard/menus/SeatingViewSettingsMenu';
import IconAutoAssign from '@/components/ui/icons/iconAutoAssign';
import IconRandomArrows from '@/components/ui/icons/iconRandomArrows';
import IconSettingsWheel from '@/components/ui/icons/iconSettingsWheel';
import type { DashboardToolbarDef } from '@/components/dashboard/frame/dashboardZoneConfig';
import { useCanvasToolbarActions } from '@/hooks/dashboard/useCanvasToolbarActions';
import { useAnchoredDropdownPortal } from '@/hooks/useAnchoredDropdownPortal';
import { useSeatingEditBottomNav } from '@/hooks/useSeatingEditBottomNav';

const toolbarMenuClassName = 'min-w-[220px]';
const TOOLBAR_TOP_MENU_PLACEMENT = 'leftOfAnchorDown' as const;
const TOOLBAR_BOTTOM_MENU_PLACEMENT = 'leftOfAnchorAbove' as const;

type SeatingEditorCanvasToolbarProps = {
  toolbarConfig: DashboardToolbarDef;
  classId?: string | null;
  onEditClass?: () => void;
};

export default function SeatingEditorCanvasToolbar({
  toolbarConfig,
  classId = null,
  onEditClass,
}: SeatingEditorCanvasToolbarProps) {
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
    onClearAllGroups,
    onDeleteAllGroups,
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
  const viewSettingsMenuRef = useRef<HTMLDivElement>(null);

  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const settingsButtonRef = useRef<HTMLDivElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  const [isAddGroupsMenuOpen, setIsAddGroupsMenuOpen] = useState(false);
  const addGroupsButtonRef = useRef<HTMLDivElement>(null);
  const addGroupsMenuRef = useRef<HTMLDivElement>(null);

  const {
    isMounted: isViewSettingsMounted,
    portalStyle: viewSettingsPortalStyle,
  } = useAnchoredDropdownPortal({
    isOpen: isViewSettingsMenuOpen,
    anchorRef: viewSettingsButtonRef,
    placement: TOOLBAR_TOP_MENU_PLACEMENT,
    widthPx: 220,
  });

  const {
    isMounted: isSettingsMounted,
    portalStyle: settingsPortalStyle,
  } = useAnchoredDropdownPortal({
    isOpen: isSettingsMenuOpen,
    anchorRef: settingsButtonRef,
    placement: TOOLBAR_BOTTOM_MENU_PLACEMENT,
    widthPx: 220,
  });

  const {
    isMounted: isAddGroupsMounted,
    portalStyle: addGroupsPortalStyle,
  } = useAnchoredDropdownPortal({
    isOpen: isAddGroupsMenuOpen,
    anchorRef: addGroupsButtonRef,
    placement: TOOLBAR_BOTTOM_MENU_PLACEMENT,
    widthPx: 220,
  });

  const handleAddGroups = useCallback(
    (numGroups: number) => {
      onAddGroups(numGroups);
      setIsAddGroupsMenuOpen(false);
    },
    [onAddGroups]
  );

  const handleClearAllGroups = useCallback(() => {
    onClearAllGroups();
    setIsSettingsMenuOpen(false);
  }, [onClearAllGroups]);

  const handleDeleteAllGroups = useCallback(() => {
    onDeleteAllGroups();
    setIsSettingsMenuOpen(false);
  }, [onDeleteAllGroups]);

  useEffect(() => {
    if (!isViewSettingsMenuOpen && !isSettingsMenuOpen && !isAddGroupsMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      if (isViewSettingsMenuOpen) {
        if (viewSettingsMenuRef.current?.contains(target)) return;
        if (viewSettingsButtonRef.current?.contains(target)) return;
        setIsViewSettingsMenuOpen(false);
      }

      if (isSettingsMenuOpen) {
        if (settingsMenuRef.current?.contains(target)) return;
        if (settingsButtonRef.current?.contains(target)) return;
        setIsSettingsMenuOpen(false);
      }

      if (isAddGroupsMenuOpen) {
        if (addGroupsMenuRef.current?.contains(target)) return;
        if (addGroupsButtonRef.current?.contains(target)) return;
        setIsAddGroupsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, [isViewSettingsMenuOpen, isSettingsMenuOpen, isAddGroupsMenuOpen]);

  const viewSettingsMenu = (
    <div ref={viewSettingsMenuRef}>
      <SeatingViewSettingsMenu
        isOpen={isViewSettingsMenuOpen}
        isToolbarMenu
        menuClassName={toolbarMenuClassName}
        style={viewSettingsPortalStyle ?? undefined}
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

  const settingsMenu = (
    <div ref={settingsMenuRef}>
      <SeatingSettingsMenu
        isOpen={isSettingsMenuOpen}
        isToolbarMenu
        menuClassName={toolbarMenuClassName}
        style={settingsPortalStyle ?? undefined}
        classId={classId}
        onEditClass={onEditClass}
        onCloseMenu={() => setIsSettingsMenuOpen(false)}
        onClearAllGroups={handleClearAllGroups}
        onDeleteAllGroups={handleDeleteAllGroups}
      />
    </div>
  );

  const addGroupsMenu = (
    <div ref={addGroupsMenuRef}>
      <SeatingEditorAddGroupsMenu
        isOpen={isAddGroupsMenuOpen}
        isToolbarMenu
        menuClassName={toolbarMenuClassName}
        style={addGroupsPortalStyle ?? undefined}
        onAddGroups={handleAddGroups}
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
        bottomSlot={
          <div className="flex flex-col gap-2">
            <div ref={settingsButtonRef}>
              <button
                type="button"
                title="Settings"
                aria-label="Settings"
                className={toolbarButtonClass({ active: isSettingsMenuOpen })}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAddGroupsMenuOpen(false);
                  setIsSettingsMenuOpen((open) => !open);
                }}
              >
                <IconSettingsWheel className="w-6 h-6 text-black" />
              </button>
            </div>
            <div ref={addGroupsButtonRef}>
              <button
                type="button"
                title="Add Groups"
                aria-label="Add Groups"
                className={toolbarButtonClass({ active: isAddGroupsMenuOpen })}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSettingsMenuOpen(false);
                  setIsAddGroupsMenuOpen((open) => !open);
                }}
              >
                <IconAddPlus className="w-6 h-6 text-black" />
              </button>
            </div>
          </div>
        }
      />
      {isViewSettingsMenuOpen &&
        isViewSettingsMounted &&
        viewSettingsPortalStyle &&
        createPortal(viewSettingsMenu, document.body)}
      {isSettingsMenuOpen &&
        isSettingsMounted &&
        settingsPortalStyle &&
        createPortal(settingsMenu, document.body)}
      {isAddGroupsMenuOpen &&
        isAddGroupsMounted &&
        addGroupsPortalStyle &&
        createPortal(addGroupsMenu, document.body)}
    </div>
  );
}
