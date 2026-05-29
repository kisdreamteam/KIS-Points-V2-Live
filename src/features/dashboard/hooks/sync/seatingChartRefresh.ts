'use client';

import { useSeatingStore } from '@/features/seating/stores/useSeatingStore';
import {
  fetchLayoutViewSettings,
  fetchSeatingGroupsWithAssignments,
  fetchSeatingLayoutsByClassId,
  type GroupAssignment,
  type SeatingGroupRecord,
} from '@/features/seating/lib/api/seating';

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

export async function refreshLayoutViewSettings(layoutId: string): Promise<void> {
  try {
    const data = await fetchLayoutViewSettings(layoutId);
    if (!data) return;
    useSeatingStore.getState().syncLayoutViewSettings(layoutId, data);
  } catch {
    // intentionally swallow transient realtime/network errors
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
