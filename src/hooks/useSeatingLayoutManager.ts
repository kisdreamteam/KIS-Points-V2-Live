'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Dispatch, MouseEvent, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import {
  createSeatingLayout,
  deleteSeatingLayoutCascade,
  subscribeToSeatingChartRowUpdates,
  updateSeatingLayoutName,
  type SeatingChartRecord,
} from '@/features/seating/lib/api/seating';
import {
  refreshLayoutViewSettings,
  refreshSeatingGroupsForLayout,
  refreshSeatingLayoutsForClass,
} from '@/features/dashboard/hooks/sync/useSeatingChartDataSync';
import { STUDENT_EVENTS, emitSeatingEditMode, emitSeatingLayoutSelected } from '@/lib/events/students';
import {
  subscribeSeatingPointsDeltaForClass,
  type SeatingLayoutNavHandlers,
  useSeatingStore,
} from '@/features/seating/stores/useSeatingStore';

type UseSeatingLayoutManagerParams = {
  classId: string;
  currentView: string;
  pathname: string | null;
  searchQuery: string;
  selectedLayoutId: string | null;
  setSelectedLayoutId: (id: string | null) => void;
  layouts: SeatingChartRecord[];
  setIsPointLogOpen: Dispatch<SetStateAction<boolean>>;
};

export function useSeatingLayoutManager({
  classId,
  currentView,
  pathname,
  searchQuery,
  selectedLayoutId,
  setSelectedLayoutId,
  layouts,
  setIsPointLogOpen,
}: UseSeatingLayoutManagerParams) {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [layoutToDelete, setLayoutToDelete] = useState<{ id: string; name: string } | null>(null);
  const [layoutToEdit, setLayoutToEdit] = useState<{ id: string; name: string } | null>(null);
  const [isEditLayoutModalOpen, setIsEditLayoutModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTeacherView, setIsTeacherView] = useState(false);
  const [isLayoutManagerOpen, setIsLayoutManagerOpen] = useState(false);

  const handleDeleteLayout = useCallback((layoutId: string, layoutName: string, e: MouseEvent) => {
    e.stopPropagation();
    setLayoutToDelete({ id: layoutId, name: layoutName });
    setIsDeleteModalOpen(true);
  }, []);

  const handleDeleteLayoutFromDrawer = useCallback((layoutId: string, layoutName: string) => {
    setLayoutToDelete({ id: layoutId, name: layoutName });
    setIsDeleteModalOpen(true);
  }, []);

  const handleEditLayout = useCallback((layoutId: string, layoutName: string, e: MouseEvent) => {
    e.stopPropagation();
    setLayoutToEdit({ id: layoutId, name: layoutName });
    setIsEditLayoutModalOpen(true);
  }, []);

  const handleInlineRenameLayout = useCallback(
    async (layoutId: string, newName: string) => {
      const trimmedName = newName.trim();
      if (!trimmedName) return;
      try {
        await updateSeatingLayoutName(layoutId, trimmedName);
      } catch (error) {
        console.error('Error updating layout name:', error);
        throw new Error('Failed to update layout name.');
      }
      await refreshSeatingLayoutsForClass(classId);
    },
    [classId]
  );

  const handleSelectLayoutFromDrawer = useCallback(
    (layoutId: string) => {
      setSelectedLayoutId(layoutId);
      setIsLayoutManagerOpen(false);
    },
    [setSelectedLayoutId]
  );

  useEffect(() => {
    if (!classId) return;
    const storageKey = `seatingChart_teacherView_${classId}`;
    const stored = localStorage.getItem(storageKey);
    if (stored !== null) {
      setIsTeacherView(stored === 'true');
    }
  }, [classId]);

  useEffect(() => {
    if (selectedLayoutId && classId) {
      const storageKey = `seatingChart_selectedLayout_${classId}`;
      localStorage.setItem(storageKey, selectedLayoutId);
      emitSeatingLayoutSelected({ layoutId: selectedLayoutId, classId });
    }
  }, [selectedLayoutId, classId]);

  useEffect(() => {
    const handlers: SeatingLayoutNavHandlers = {
      onSelectLayout: setSelectedLayoutId,
      onAddLayout: () => setIsCreateModalOpen(true),
      onEditLayout: handleEditLayout,
      onDeleteLayout: handleDeleteLayout,
    };
    useSeatingStore.getState().setLayoutNavHandlers(handlers);
    return () => useSeatingStore.getState().setLayoutNavHandlers(null);
  }, [handleDeleteLayout, handleEditLayout, setSelectedLayoutId]);

  useEffect(() => subscribeSeatingPointsDeltaForClass(classId), [classId]);

  useEffect(() => {
    if (!selectedLayoutId) return;
    const currentLayout = layouts.find((l) => l.id === selectedLayoutId);
    if (currentLayout) {
      useSeatingStore.getState().applyLayoutViewSettings(currentLayout);
    }
  }, [selectedLayoutId, layouts]);

  useEffect(() => {
    if (!selectedLayoutId) return;

    const handleViewSettingsUpdate = async () => {
      if (document.visibilityState !== 'visible') return;
      await refreshLayoutViewSettings(selectedLayoutId);
    };

    const handleLocalSettingsEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{
        layoutId?: string;
        show_grid?: boolean | null;
        show_objects?: boolean | null;
        layout_orientation?: string | null;
        color_by_gender?: boolean | null;
      }>;
      const detail = customEvent.detail;
      if (!detail || detail.layoutId !== selectedLayoutId) return;
      useSeatingStore.getState().syncLayoutViewSettings(selectedLayoutId, detail);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void handleViewSettingsUpdate();
      }
    };

    void refreshLayoutViewSettings(selectedLayoutId);

    window.addEventListener(STUDENT_EVENTS.SEATING_VIEW_SETTINGS_CHANGED, handleLocalSettingsEvent as EventListener);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const { unsubscribe } = subscribeToSeatingChartRowUpdates(
      selectedLayoutId,
      (nextRow) => {
        useSeatingStore.getState().syncLayoutViewSettings(selectedLayoutId, nextRow);
      },
      {
        onRefresh: (payload) => {
          if (payload.layoutId !== selectedLayoutId) return;
          void refreshSeatingGroupsForLayout(selectedLayoutId);
        },
      }
    );

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener(
        STUDENT_EVENTS.SEATING_VIEW_SETTINGS_CHANGED,
        handleLocalSettingsEvent as EventListener
      );
      unsubscribe();
    };
  }, [selectedLayoutId]);

  const handleEditLayoutSave = useCallback(
    async (newName: string) => {
      if (!layoutToEdit) return;
      try {
        await updateSeatingLayoutName(layoutToEdit.id, newName);
      } catch (error) {
        console.error('Error updating layout name:', error);
        throw new Error('Failed to update layout name.');
      }
      await refreshSeatingLayoutsForClass(classId);
      setLayoutToEdit(null);
      setIsEditLayoutModalOpen(false);
    },
    [classId, layoutToEdit]
  );

  const handleOpenSeatingEditor = useCallback(() => {
    const base = pathname ?? '/';
    emitSeatingEditMode({ isEditMode: true });
    const params = new URLSearchParams(searchQuery);
    params.set('mode', 'edit');
    if (selectedLayoutId) params.set('layout', selectedLayoutId);
    router.push(params.toString() ? `${base}?${params.toString()}` : `${base}?mode=edit`);
  }, [selectedLayoutId, pathname, router, searchQuery]);

  useEffect(() => {
    const onCreateLayoutEvent = () => {
      if (currentView !== 'seating') return;
      setIsCreateModalOpen(true);
    };
    const onOpenEditorEvent = () => {
      if (currentView !== 'seating') return;
      if (layouts.length > 0) handleOpenSeatingEditor();
    };
    const onToggleTeacherViewEvent = () => {
      if (currentView !== 'seating') return;
      setIsTeacherView((v) => {
        const next = !v;
        if (classId) localStorage.setItem(`seatingChart_teacherView_${classId}`, String(next));
        return next;
      });
    };
    const onTogglePointLogEvent = () => {
      if (currentView !== 'seating') return;
      setIsLayoutManagerOpen(false);
      setIsPointLogOpen((v) => !v);
    };
    const onToggleLayoutManagerEvent = () => {
      if (currentView !== 'seating') return;
      setIsPointLogOpen(false);
      setIsLayoutManagerOpen((v) => !v);
    };

    window.addEventListener(STUDENT_EVENTS.STAGE_CREATE_LAYOUT, onCreateLayoutEvent);
    window.addEventListener(STUDENT_EVENTS.STAGE_OPEN_SEATING_EDITOR, onOpenEditorEvent);
    window.addEventListener(STUDENT_EVENTS.STAGE_TOGGLE_TEACHER_VIEW, onToggleTeacherViewEvent);
    window.addEventListener(STUDENT_EVENTS.STAGE_TOGGLE_POINT_LOG, onTogglePointLogEvent);
    window.addEventListener(STUDENT_EVENTS.STAGE_TOGGLE_LAYOUT_MANAGER, onToggleLayoutManagerEvent);
    return () => {
      window.removeEventListener(STUDENT_EVENTS.STAGE_CREATE_LAYOUT, onCreateLayoutEvent);
      window.removeEventListener(STUDENT_EVENTS.STAGE_OPEN_SEATING_EDITOR, onOpenEditorEvent);
      window.removeEventListener(STUDENT_EVENTS.STAGE_TOGGLE_TEACHER_VIEW, onToggleTeacherViewEvent);
      window.removeEventListener(STUDENT_EVENTS.STAGE_TOGGLE_POINT_LOG, onTogglePointLogEvent);
      window.removeEventListener(STUDENT_EVENTS.STAGE_TOGGLE_LAYOUT_MANAGER, onToggleLayoutManagerEvent);
    };
  }, [classId, currentView, handleOpenSeatingEditor, layouts.length, setIsPointLogOpen]);

  const handleDeleteConfirmed = useCallback(async () => {
    if (!layoutToDelete) return;

    try {
      await deleteSeatingLayoutCascade(layoutToDelete.id);

      if (selectedLayoutId === layoutToDelete.id) {
        setSelectedLayoutId(null);
        const storageKey = `seatingChart_selectedLayout_${classId}`;
        localStorage.removeItem(storageKey);
      }

      await refreshSeatingLayoutsForClass(classId);
      setIsDeleteModalOpen(false);
      setLayoutToDelete(null);
    } catch (err) {
      console.error('Unexpected error deleting layout:', err);
      alert('An unexpected error occurred. Please try again.');
      setIsDeleteModalOpen(false);
      setLayoutToDelete(null);
    }
  }, [classId, layoutToDelete, selectedLayoutId, setSelectedLayoutId]);

  const handleCreateLayout = useCallback(
    async (layoutName: string) => {
      try {
        const data = await createSeatingLayout({ classId, name: layoutName });

        const storageKey = `seatingChart_selectedLayout_${classId}`;
        localStorage.setItem(storageKey, data.id);

        await refreshSeatingLayoutsForClass(classId);
        setSelectedLayoutId(data.id);
        setIsCreateModalOpen(false);

        emitSeatingEditMode({ isEditMode: true });
        const params = new URLSearchParams();
        params.set('view', 'seating');
        params.set('mode', 'edit');
        params.set('layout', data.id);
        const base = pathname ?? '/';
        router.push(`${base}?${params.toString()}`);
      } catch (err) {
        console.error('Unexpected error creating seating chart:', err);
        alert('An unexpected error occurred. Please try again.');
      }
    },
    [classId, pathname, router, setSelectedLayoutId]
  );

  const retryLayouts = useCallback(() => {
    void refreshSeatingLayoutsForClass(classId);
  }, [classId]);

  return {
    isLayoutManagerOpen,
    isTeacherView,
    isDeleteModalOpen,
    isEditLayoutModalOpen,
    isCreateModalOpen,
    layoutToDelete,
    layoutToEdit,
    setIsDeleteModalOpen,
    setIsEditLayoutModalOpen,
    setIsCreateModalOpen,
    setIsLayoutManagerOpen,
    setLayoutToDelete,
    setLayoutToEdit,
    handleDeleteLayoutFromDrawer,
    handleInlineRenameLayout,
    handleSelectLayoutFromDrawer,
    handleDeleteConfirmed,
    handleCreateLayout,
    handleEditLayoutSave,
    retryLayouts,
  };
}
