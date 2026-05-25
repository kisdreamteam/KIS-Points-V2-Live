'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';
import WorkspaceToolbar, { toolbarButtonClass, type WorkspaceToolbarAction } from '@/components/ui/WorkspaceToolbar';
import SeatingEditorAddGroupsMenu from '@/features/seating/components/menus/SeatingEditorAddGroupsMenu';
import SeatingSettingsMenu from '@/features/seating/components/menus/SeatingSettingsMenu';
import SeatingViewSettingsMenu from '@/features/seating/components/menus/SeatingViewSettingsMenu';
import AddPlusIcon from '@/components/ui/icons/AddPlusIcon';
import EditorAddMultipleIcon from '@/components/ui/icons/EditorAddMultipleIcon';
import EditorAutoAssignSeatsIcon from '@/components/ui/icons/EditorAutoAssignSeatsIcon';
import EditorRandomSeatsIcon from '@/components/ui/icons/EditorRandomSeatsIcon';
import EditorViewPreferencesIcon from '@/components/ui/icons/EditorViewPreferencesIcon';
import EditorClearGroupsIcon from '@/components/ui/icons/EditorClearGroupsIcon';
import { buildShellToolbarConfig } from '@/features/dashboard/stage/dashboardToolbarConfig';
import { useWorkspaceToolbarActions } from '@/features/dashboard/hooks/useWorkspaceToolbarActions';
import { useAnchoredDropdownPortal } from '@/hooks/useAnchoredDropdownPortal';
import { useSeatingEditorToolbarActions } from '@/hooks/useSeatingEditorToolbarActions';
import { useLayoutStore } from '@/stores/useLayoutStore';
import { useSeatingStore } from '@/features/seating/stores/useSeatingStore';

const toolbarMenuClassName = 'min-w-[220px]';
const TOOLBAR_TOP_MENU_PLACEMENT = 'leftOfAnchorDown' as const;
const TOOLBAR_BOTTOM_MENU_PLACEMENT = 'leftOfAnchorAbove' as const;

type SeatingEditorWorkspaceToolbarProps = {
  classId?: string | null;
};

export default function SeatingEditorWorkspaceToolbar({
  classId: classIdProp = null,
}: SeatingEditorWorkspaceToolbarProps) {
  const params = useParams();
  const classId = classIdProp ?? (params?.classId as string | undefined) ?? null;
  const setEditClassModalOpen = useLayoutStore((s) => s.setEditClassModalOpen);
  const seatingLayoutsCount = useSeatingStore(useShallow((s) => s.layouts.length));

  const onEditClass = useCallback(() => {
    setEditClassModalOpen(true);
  }, [setEditClassModalOpen]);

  const toolbarConfig = useMemo(
    () =>
      buildShellToolbarConfig({
        activeView: 'seating_chart',
        isEditMode: true,
        seatingLayoutsCount,
      }),
    [seatingLayoutsCount]
  );

  const { topActions } = useWorkspaceToolbarActions(toolbarConfig);
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
  } = useSeatingEditorToolbarActions();

  const addGroupBottomActions = useMemo<WorkspaceToolbarAction[]>(
    () => [
      {
        id: 'add-group',
        title: 'Add group',
        icon: <AddPlusIcon className="w-6 h-6 text-white" />,
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
      <WorkspaceToolbar
        className={`h-full ${toolbarConfig.className ?? ''}`}
        topActions={topActions}
        bottomActions={addGroupBottomActions}
        topSlot={
          <div className="flex flex-col gap-2">
            <div ref={viewSettingsButtonRef}>
              <button
                type="button"
                title="View Preferences"
                aria-label="View Preferences"
                className={toolbarButtonClass({ active: isViewSettingsMenuOpen })}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsViewSettingsMenuOpen((open) => !open);
                }}
              >
                <EditorViewPreferencesIcon className="w-6 h-6 text-black" />
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
              <EditorAutoAssignSeatsIcon className="w-6 h-6" />
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
              <EditorRandomSeatsIcon className="w-6 h-6 text-black" />
            </button>
          </div>
        }
        bottomSlot={
          <div className="flex flex-col gap-2">
            <div ref={settingsButtonRef}>
              <button
                type="button"
                title="Clear Groups"
                aria-label="Clear Groups"
                className={toolbarButtonClass({ active: isSettingsMenuOpen })}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAddGroupsMenuOpen(false);
                  setIsSettingsMenuOpen((open) => !open);
                }}
              >
                <EditorClearGroupsIcon className="w-6 h-6 text-black" />
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
                <EditorAddMultipleIcon className="w-6 h-6 text-black" />
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
