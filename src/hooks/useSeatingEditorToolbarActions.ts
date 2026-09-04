'use client';

import { useCallback } from 'react';
import { updateLayoutViewSettings } from '@/features/seating/lib/api/seating';
import { useSeatingStore } from '@/features/seating/stores/useSeatingStore';
import {
  emitSeatingAddMultipleGroups,
  emitSeatingAutoAssignSeats,
  emitSeatingClearAllGroups,
  emitSeatingDeleteAllGroups,
  emitSeatingRandomize,
  emitSeatingViewSettingsChanged,
} from '@/lib/events/students';

export type SeatingEditorToolbarActionsReturn = {
  showGrid: boolean;
  showFurniture: boolean;
  teachersDeskLeft: boolean;
  colorByGender: boolean;
  colorByLevel: boolean;
  onToggleShowGrid: (next: boolean) => void;
  onToggleShowFurniture: (next: boolean) => void;
  onToggleTeachersDeskLeft: (next: boolean) => void;
  onToggleColorByGender: () => void;
  onToggleColorByLevel: () => void;
  onRandomize: () => void;
  onClearAllGroups: () => void;
  onDeleteAllGroups: () => void;
  onAddGroups: (numGroups: number) => void;
  onAutoAssignSeats: () => void;
};

export function useSeatingEditorToolbarActions(): SeatingEditorToolbarActionsReturn {
  const layoutId = useSeatingStore((s) => s.selectedLayoutId);
  const showGrid = useSeatingStore((s) => s.showGrid);
  const showFurniture = useSeatingStore((s) => s.showObjects);
  const teachersDeskLeft = useSeatingStore((s) => s.layoutOrientation === 'Left');
  const colorByGender = useSeatingStore((s) => s.colorByGender);
  const colorByLevel = useSeatingStore((s) => s.colorByLevel);

  const emitViewSettingsChanged = useCallback(
    (partial: {
      show_grid?: boolean;
      show_objects?: boolean;
      layout_orientation?: 'Left' | 'Right';
      color_by_gender?: boolean;
      color_by_level?: boolean;
    }) => {
      if (!layoutId) return;
      emitSeatingViewSettingsChanged({
        layoutId,
        ...partial,
      });
    },
    [layoutId]
  );

  const onToggleShowGrid = useCallback(
    async (newValue: boolean) => {
      if (!layoutId) return;
      const st = useSeatingStore.getState();
      const previous = st.showGrid;
      st.syncLayoutViewSettings(layoutId, { show_grid: newValue });
      try {
        await updateLayoutViewSettings(layoutId, { show_grid: newValue });
        emitViewSettingsChanged({ show_grid: newValue });
      } catch (err) {
        console.error('Unexpected error updating show_grid:', err);
        st.syncLayoutViewSettings(layoutId, { show_grid: previous });
      }
    },
    [layoutId, emitViewSettingsChanged]
  );

  const onToggleShowFurniture = useCallback(
    async (newValue: boolean) => {
      if (!layoutId) return;
      const st = useSeatingStore.getState();
      const previous = st.showObjects;
      st.syncLayoutViewSettings(layoutId, { show_objects: newValue });
      try {
        await updateLayoutViewSettings(layoutId, { show_objects: newValue });
        emitViewSettingsChanged({ show_objects: newValue });
      } catch (err) {
        console.error('Unexpected error updating show_objects:', err);
        st.syncLayoutViewSettings(layoutId, { show_objects: previous });
      }
    },
    [layoutId, emitViewSettingsChanged]
  );

  const onToggleTeachersDeskLeft = useCallback(
    async (newValue: boolean) => {
      if (!layoutId || !showFurniture) return;
      const st = useSeatingStore.getState();
      const previous = st.layoutOrientation;
      const orientation = newValue ? 'Left' : 'Right';
      st.syncLayoutViewSettings(layoutId, { layout_orientation: orientation });
      try {
        await updateLayoutViewSettings(layoutId, { layout_orientation: orientation });
        emitViewSettingsChanged({ layout_orientation: orientation });
      } catch (err) {
        console.error('Unexpected error updating layout_orientation:', err);
        st.syncLayoutViewSettings(layoutId, { layout_orientation: previous });
      }
    },
    [layoutId, showFurniture, emitViewSettingsChanged]
  );

  const onToggleColorByGender = useCallback(async () => {
    if (!layoutId) return;
    const st = useSeatingStore.getState();
    const previous = st.colorByGender;
    const next = !previous;
    st.syncLayoutViewSettings(layoutId, { color_by_gender: next });
    try {
      await updateLayoutViewSettings(layoutId, { color_by_gender: next });
      emitViewSettingsChanged({ color_by_gender: next });
    } catch (err) {
      console.error('Unexpected error updating color_by_gender:', err);
      st.syncLayoutViewSettings(layoutId, { color_by_gender: previous });
    }
  }, [layoutId, emitViewSettingsChanged]);

  const onToggleColorByLevel = useCallback(async () => {
    if (!layoutId) return;
    const st = useSeatingStore.getState();
    const previous = st.colorByLevel;
    const next = !previous;
    st.syncLayoutViewSettings(layoutId, { color_by_level: next });
    try {
      await updateLayoutViewSettings(layoutId, { color_by_level: next });
      emitViewSettingsChanged({ color_by_level: next });
    } catch (err) {
      console.error('Unexpected error updating color_by_level:', err);
      st.syncLayoutViewSettings(layoutId, { color_by_level: previous });
    }
  }, [layoutId, emitViewSettingsChanged]);

  const onRandomize = useCallback(() => {
    emitSeatingRandomize();
  }, []);

  const onClearAllGroups = useCallback(() => {
    emitSeatingClearAllGroups();
  }, []);

  const onDeleteAllGroups = useCallback(() => {
    emitSeatingDeleteAllGroups();
  }, []);

  const onAddGroups = useCallback((numGroups: number) => {
    emitSeatingAddMultipleGroups({ numGroups });
  }, []);

  const onAutoAssignSeats = useCallback(() => {
    emitSeatingAutoAssignSeats();
  }, []);

  return {
    showGrid,
    showFurniture,
    teachersDeskLeft,
    colorByGender,
    colorByLevel,
    onToggleShowGrid,
    onToggleShowFurniture,
    onToggleTeachersDeskLeft,
    onToggleColorByGender,
    onToggleColorByLevel,
    onRandomize,
    onClearAllGroups,
    onDeleteAllGroups,
    onAddGroups,
    onAutoAssignSeats,
  };
}
