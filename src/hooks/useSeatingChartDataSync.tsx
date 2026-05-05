'use client';

import { useEffect, useRef } from 'react';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { useSeatingStore } from '@/stores/useSeatingStore';
import {
  fetchSeatingGroupsWithAssignments,
  fetchSeatingLayoutsByClassId,
  type GroupAssignment,
  type SeatingGroupRecord,
} from '@/lib/api/seating';
import { STUDENT_EVENTS } from '@/lib/events/students';

function mapAssignmentsToRecord(map: Map<string, GroupAssignment[]>): Record<string, GroupAssignment[]> {
  const out: Record<string, GroupAssignment[]> = {};
  map.forEach((v, k) => {
    out[k] = v;
  });
  return out;
}

function buildGroupPositions(
  groupsData: SeatingGroupRecord[],
  prev: Record<string, { x: number; y: number }>
): Record<string, { x: number; y: number }> {
  const groupPositionsById: Record<string, { x: number; y: number }> = { ...prev };
  groupsData.forEach((group, index) => {
    if (group.position_x !== undefined && group.position_y !== undefined) {
      groupPositionsById[group.id] = { x: group.position_x, y: group.position_y };
    } else if (groupPositionsById[group.id] === undefined) {
      groupPositionsById[group.id] = { x: 20 + index * 20, y: 20 + index * 100 };
    }
  });
  return groupPositionsById;
}

export async function refreshSeatingLayoutsForClass(classId: string): Promise<void> {
  const st = useSeatingStore.getState();
  const selectedLayoutId = st.selectedLayoutId;
  st.setLayoutLoading(true);
  st.setLayoutsError(null);
  try {
    const data = await fetchSeatingLayoutsByClassId(classId);
    if (data) {
      st.setLayouts(data);
      if (data.length > 0) {
        const hasActive =
          selectedLayoutId !== null && data.some((layout) => layout.id === selectedLayoutId);
        if (!hasActive) {
          st.setSelectedLayoutId(data[0].id);
        }
      } else if (selectedLayoutId !== null) {
        st.setSelectedLayoutId(null);
      }
    } else {
      st.setLayouts([]);
      if (selectedLayoutId !== null) {
        st.setSelectedLayoutId(null);
      }
    }
  } catch (err) {
    console.error('Unexpected error fetching seating charts:', err);
    st.setLayoutsError('An unexpected error occurred.');
  } finally {
    useSeatingStore.getState().setLayoutLoading(false);
  }
}

export async function refreshSeatingGroupsForLayout(layoutId: string | null): Promise<void> {
  const st = useSeatingStore.getState();
  if (!layoutId) {
    st.setGroups([]);
    st.setGroupAssignmentsById({});
    st.setGroupPositionsById({});
    st.setGroupsLoading(false);
    return;
  }
  st.setGroupsLoading(true);
  try {
    const { groups: groupsData, groupAssignments: nextGroupAssignments } =
      await fetchSeatingGroupsWithAssignments(layoutId);
    if (!groupsData || groupsData.length === 0) {
      st.setGroups([]);
      st.setGroupAssignmentsById({});
      st.setGroupPositionsById({});
      st.setGroupsLoading(false);
      return;
    }
    const nextPositions = buildGroupPositions(groupsData, st.groupPositionsById);
    st.setGroups(groupsData);
    st.setGroupAssignmentsById(mapAssignmentsToRecord(nextGroupAssignments));
    st.setGroupPositionsById(nextPositions);
    st.setGroupsLoading(false);
  } catch (err) {
    console.error('Unexpected error fetching seating groups:', err);
    st.setGroupsLoading(false);
  }
}

/** Keeps seating layout/group data in `useSeatingStore` aligned with class + layout selection. */
export function SeatingChartDataSync() {
  const activeClassId = useDashboardStore((s) => s.activeClassId);
  const rosterLen = useDashboardStore((s) => s.students.length);
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
    if (rosterLen === 0) return;
    void refreshSeatingGroupsForLayout(selectedLayoutId);
  }, [selectedLayoutId, rosterLen]);

  useEffect(() => {
    const handleSeatingEditMode = (event: Event) => {
      const detail = (event as CustomEvent<{ isEditMode?: boolean }>).detail;
      if (detail?.isEditMode === false && selectedLayoutId) {
        void refreshSeatingGroupsForLayout(selectedLayoutId);
      }
    };
    window.addEventListener(STUDENT_EVENTS.SEATING_EDIT_MODE, handleSeatingEditMode as EventListener);
    return () => window.removeEventListener(STUDENT_EVENTS.SEATING_EDIT_MODE, handleSeatingEditMode as EventListener);
  }, [selectedLayoutId]);

  return null;
}
