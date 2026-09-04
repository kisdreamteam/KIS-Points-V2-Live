'use client';

import { useEffect, useRef } from 'react';
import { useDashboardStore } from '@/features/dashboard/stores/useDashboardStore';
import { useSeatingStore } from '@/features/seating/stores/useSeatingStore';
import { subscribeToSeatingChartRowUpdates } from '@/features/seating/lib/api/seating';
import {
  refreshLayoutViewSettings,
  refreshSeatingGroupsForLayout,
  refreshSeatingLayoutsForClass,
} from '@/features/dashboard/hooks/sync/seatingChartRefresh';
import { waitForEditorPersistsIdle } from '@/features/seating/lib/seatingEditorPersistGate';
import { STUDENT_EVENTS, type SeatingViewSettingsChangedDetail } from '@/lib/events/students';

/** Keeps seating layout/group data in `useSeatingStore` aligned with class + layout selection. */
export function SeatingChartDataSync() {
  const activeClassId = useDashboardStore((s) => s.activeClassId);
  const selectedLayoutId = useSeatingStore((s) => s.selectedLayoutId);
  const prevClassRef = useRef<string | null>(null);

  useEffect(() => {
    if (!activeClassId) {
      useSeatingStore.getState().resetForClassSwitch();
      useSeatingStore.getState().setLayouts([]);
      useSeatingStore.getState().setLayoutsError(null);
      useSeatingStore.getState().setLayoutLoading(false);
      prevClassRef.current = null;
      return;
    }
    if (prevClassRef.current !== activeClassId) {
      useSeatingStore.getState().resetForClassSwitch();
      prevClassRef.current = activeClassId;
    }
    void refreshSeatingLayoutsForClass(activeClassId);
  }, [activeClassId]);

  useEffect(() => {
    if (!selectedLayoutId) {
      useSeatingStore.getState().setGroups([]);
      useSeatingStore.getState().setGroupAssignmentsById({});
      useSeatingStore.getState().setGroupPositionsById({});
      return;
    }
    void refreshSeatingGroupsForLayout(selectedLayoutId);
    void refreshLayoutViewSettings(selectedLayoutId);
  }, [selectedLayoutId]);

  useEffect(() => {
    const handleViewSettingsChanged = (event: Event) => {
      const detail = (event as CustomEvent<SeatingViewSettingsChangedDetail>).detail;
      if (!detail?.layoutId || detail.layoutId !== selectedLayoutId) return;
      useSeatingStore.getState().syncLayoutViewSettings(detail.layoutId, detail);
    };

    window.addEventListener(STUDENT_EVENTS.SEATING_VIEW_SETTINGS_CHANGED, handleViewSettingsChanged as EventListener);
    return () =>
      window.removeEventListener(
        STUDENT_EVENTS.SEATING_VIEW_SETTINGS_CHANGED,
        handleViewSettingsChanged as EventListener
      );
  }, [selectedLayoutId]);

  useEffect(() => {
    const handleSeatingEditMode = (event: Event) => {
      const detail = (event as CustomEvent<{ isEditMode?: boolean }>).detail;
      if (detail?.isEditMode === false && selectedLayoutId) {
        const layoutId = selectedLayoutId;
        void (async () => {
          await waitForEditorPersistsIdle();
          await refreshSeatingGroupsForLayout(layoutId);
          await refreshLayoutViewSettings(layoutId);
        })();
      }
    };
    window.addEventListener(STUDENT_EVENTS.SEATING_EDIT_MODE, handleSeatingEditMode as EventListener);
    return () => window.removeEventListener(STUDENT_EVENTS.SEATING_EDIT_MODE, handleSeatingEditMode as EventListener);
  }, [selectedLayoutId]);

  useEffect(() => {
    if (!selectedLayoutId) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void refreshLayoutViewSettings(selectedLayoutId);
      }
    };

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
      unsubscribe();
    };
  }, [selectedLayoutId]);

  return null;
}
