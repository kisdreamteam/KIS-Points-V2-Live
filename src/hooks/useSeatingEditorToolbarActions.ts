'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchLayoutViewSettings, updateLayoutViewSettings } from '@/lib/api/seating';
import { useSeatingStore } from '@/stores/useSeatingStore';
import {
  emitSeatingAddMultipleGroups,
  emitSeatingAutoAssignSeats,
  emitSeatingClearAllGroups,
  emitSeatingDeleteAllGroups,
  emitSeatingRandomize,
  emitSeatingViewSettingsChanged,
  STUDENT_EVENTS,
} from '@/lib/events/students';
import type { SeatingViewSettingsChangedDetail } from '@/lib/events/students';

export type SeatingEditorToolbarActionsReturn = {
  showGrid: boolean;
  showFurniture: boolean;
  teachersDeskLeft: boolean;
  colorByGender: boolean;
  onToggleShowGrid: (next: boolean) => void;
  onToggleShowFurniture: (next: boolean) => void;
  onToggleTeachersDeskLeft: (next: boolean) => void;
  onToggleColorByGender: () => void;
  onRandomize: () => void;
  onClearAllGroups: () => void;
  onDeleteAllGroups: () => void;
  onAddGroups: (numGroups: number) => void;
  onAutoAssignSeats: () => void;
};

export function useSeatingEditorToolbarActions(): SeatingEditorToolbarActionsReturn {
  const searchParams = useSearchParams();
  const layoutId = searchParams?.get('layout');

  const [showGrid, setShowGrid] = useState(true);
  const [showFurniture, setShowFurniture] = useState(true);
  const [teachersDeskLeft, setTeachersDeskLeft] = useState(true);
  const [colorByGender, setColorByGender] = useState(true);

  const emitViewSettingsChanged = useCallback(
    (partial: {
      show_grid?: boolean;
      show_objects?: boolean;
      layout_orientation?: 'Left' | 'Right';
      color_by_gender?: boolean;
    }) => {
      if (!layoutId) return;
      emitSeatingViewSettingsChanged({
        layoutId,
        ...partial,
      });
    },
    [layoutId]
  );

  const applyViewDetail = useCallback((detail: SeatingViewSettingsChangedDetail) => {
    if (detail.show_grid !== undefined) setShowGrid(detail.show_grid);
    if (detail.show_objects !== undefined) setShowFurniture(detail.show_objects);
    if (detail.layout_orientation !== undefined) {
      setTeachersDeskLeft(detail.layout_orientation === 'Left');
    }
    if (detail.color_by_gender !== undefined) setColorByGender(detail.color_by_gender);
  }, []);

  useEffect(() => {
    if (!layoutId) return;

    const load = async () => {
      try {
        const data = await fetchLayoutViewSettings(layoutId);
        if (!data) return;
        setShowGrid(data.show_grid ?? true);
        setShowFurniture(data.show_objects ?? true);
        const orient = data.layout_orientation ?? 'Left';
        setTeachersDeskLeft(orient === 'Left');
        setColorByGender(data.color_by_gender ?? true);
      } catch (err) {
        console.error('Unexpected error fetching layout view settings (editor toolbar):', err);
      }
    };

    void load();
  }, [layoutId]);

  useEffect(() => {
    if (!layoutId) return;

    const onViewSettings = (event: Event) => {
      const custom = event as CustomEvent<SeatingViewSettingsChangedDetail>;
      const detail = custom.detail;
      if (!detail || detail.layoutId !== layoutId) return;
      applyViewDetail(detail);
    };

    window.addEventListener(STUDENT_EVENTS.SEATING_VIEW_SETTINGS_CHANGED, onViewSettings as EventListener);
    return () =>
      window.removeEventListener(STUDENT_EVENTS.SEATING_VIEW_SETTINGS_CHANGED, onViewSettings as EventListener);
  }, [layoutId, applyViewDetail]);

  const onToggleShowGrid = useCallback(
    async (newValue: boolean) => {
      if (!layoutId) return;
      setShowGrid(newValue);
      try {
        await updateLayoutViewSettings(layoutId, { show_grid: newValue });
        useSeatingStore.getState().syncLayoutViewSettings(layoutId, { show_grid: newValue });
        emitViewSettingsChanged({ show_grid: newValue });
      } catch (err) {
        console.error('Unexpected error updating show_grid:', err);
        setShowGrid(!newValue);
      }
    },
    [layoutId, emitViewSettingsChanged]
  );

  const onToggleShowFurniture = useCallback(
    async (newValue: boolean) => {
      if (!layoutId) return;
      setShowFurniture(newValue);
      try {
        await updateLayoutViewSettings(layoutId, { show_objects: newValue });
        useSeatingStore.getState().syncLayoutViewSettings(layoutId, { show_objects: newValue });
        emitViewSettingsChanged({ show_objects: newValue });
      } catch (err) {
        console.error('Unexpected error updating show_objects:', err);
        setShowFurniture(!newValue);
      }
    },
    [layoutId, emitViewSettingsChanged]
  );

  const onToggleTeachersDeskLeft = useCallback(
    async (newValue: boolean) => {
      if (!layoutId || !showFurniture) return;
      setTeachersDeskLeft(newValue);
      try {
        await updateLayoutViewSettings(layoutId, {
          layout_orientation: newValue ? 'Left' : 'Right',
        });
        useSeatingStore.getState().syncLayoutViewSettings(layoutId, {
          layout_orientation: newValue ? 'Left' : 'Right',
        });
        emitViewSettingsChanged({ layout_orientation: newValue ? 'Left' : 'Right' });
      } catch (err) {
        console.error('Unexpected error updating layout_orientation:', err);
        setTeachersDeskLeft(!newValue);
      }
    },
    [layoutId, showFurniture, emitViewSettingsChanged]
  );

  const onToggleColorByGender = useCallback(async () => {
    if (!layoutId) return;
    const next = !colorByGender;
    setColorByGender(next);
    try {
      await updateLayoutViewSettings(layoutId, { color_by_gender: next });
      useSeatingStore.getState().syncLayoutViewSettings(layoutId, { color_by_gender: next });
      emitViewSettingsChanged({ color_by_gender: next });
    } catch (err) {
      console.error('Unexpected error updating color_by_gender:', err);
      setColorByGender(!next);
    }
  }, [layoutId, colorByGender, emitViewSettingsChanged]);

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
    onToggleShowGrid,
    onToggleShowFurniture,
    onToggleTeachersDeskLeft,
    onToggleColorByGender,
    onRandomize,
    onClearAllGroups,
    onDeleteAllGroups,
    onAddGroups,
    onAutoAssignSeats,
  };
}
