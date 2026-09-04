'use client';

import { useCallback, useRef, type Dispatch, type SetStateAction } from 'react';
import type { Student } from '@/lib/types';
import {
  deleteStudentSeatAssignmentsByStudentId,
  insertStudentSeatAssignment,
  resolveSeatingChartIdForGroup,
  swapSeatAssignments,
  updateSeatingGroupPosition,
  updateSeatingGroupRows,
  updateSeatingGroupFields,
  updateStudentSeatAssignmentByStudentId,
} from '@/features/seating/lib/api/seating';
import { computeGroupRowsFromAssignments } from '@/features/seating/lib/seatingLogic';
import {
  cloneAssignmentsRecord,
  getAssignmentsForGroup,
  type GroupAssignmentsById,
} from '@/features/seating/stores/seatingLayoutStoreHelpers';
import { useSeatingStore } from '@/features/seating/stores/useSeatingStore';

type NotifyFn = (title: string, message: string) => void;

async function layoutDeleteScopeForGroup(groupId: string): Promise<{ seatingChartId: string } | undefined> {
  const selectedLayoutId = useSeatingStore.getState().selectedLayoutId;
  if (selectedLayoutId) return { seatingChartId: selectedLayoutId };
  const seatingChartId = await resolveSeatingChartIdForGroup(groupId);
  return seatingChartId ? { seatingChartId } : undefined;
}

export interface UseSeatingEditorPersistenceParams {
  setUnseatedStudents: Dispatch<SetStateAction<Student[]>>;
  showError: NotifyFn;
}

export function useSeatingEditorPersistence({
  setUnseatedStudents,
  showError,
}: UseSeatingEditorPersistenceParams) {
  const persistInFlightRef = useRef(0);

  const syncGroupRowsForGroupIds = useCallback(async (groupIds: string[]) => {
    const uniqueIds = [...new Set(groupIds)];
    const st = useSeatingStore.getState();
    for (const groupId of uniqueIds) {
      const group = st.groups.find((g) => g.id === groupId);
      if (!group) continue;
      const assignments = getAssignmentsForGroup(st.groupAssignmentsById, groupId);
      const columns = group.group_columns || 2;
      const group_rows = computeGroupRowsFromAssignments(assignments, columns);
      await updateSeatingGroupRows(groupId, group_rows);
      st.updateGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, group_rows } : g))
      );
    }
  }, []);

  const persistGroupColumnsChange = useCallback(
    async (params: { groupId: string; columns: number; name?: string }) => {
      const { groupId, columns, name } = params;
      const st = useSeatingStore.getState();
      const previousGroup = st.groups.find((g) => g.id === groupId);
      if (!previousGroup) return;

      const assignments = getAssignmentsForGroup(st.groupAssignmentsById, groupId);
      const group_rows = computeGroupRowsFromAssignments(assignments, columns);

      persistInFlightRef.current += 1;
      try {
        await updateSeatingGroupFields(groupId, {
          ...(name !== undefined ? { name } : {}),
          group_columns: columns,
          group_rows,
        });
        st.updateGroups((prev) =>
          prev.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  ...(name !== undefined ? { name } : {}),
                  group_columns: columns,
                  group_rows,
                }
              : g
          )
        );
      } catch (err) {
        console.error('Error persisting group columns:', err);
        st.updateGroups((prev) =>
          prev.map((g) => (g.id === groupId ? previousGroup : g))
        );
        showError(
          'Error',
          err instanceof Error ? err.message : 'Failed to update group columns.'
        );
        throw err;
      } finally {
        persistInFlightRef.current -= 1;
      }
    },
    [showError]
  );

  const persistGroupPosition = useCallback(
    async (
      groupId: string,
      position: { x: number; y: number },
      rollbackPosition: { x: number; y: number }
    ) => {
      persistInFlightRef.current += 1;
      try {
        await updateSeatingGroupPosition(groupId, {
          position_x: position.x,
          position_y: position.y,
        });
        useSeatingStore.getState().updateGroups((prev) =>
          prev.map((g) =>
            g.id === groupId
              ? { ...g, position_x: position.x, position_y: position.y }
              : g
          )
        );
      } catch (err) {
        console.error('Error persisting group position:', err);
        useSeatingStore.getState().mergeGroupPositions((prev) => ({
          ...prev,
          [groupId]: rollbackPosition,
        }));
        showError(
          'Error',
          err instanceof Error ? err.message : 'Failed to save group position.'
        );
      } finally {
        persistInFlightRef.current -= 1;
      }
    },
    [showError]
  );

  const persistAddStudent = useCallback(
    async (params: {
      student: Student;
      groupId: string;
      seatIndex: number;
      snapshotAssignments: GroupAssignmentsById;
    }) => {
      const { student, groupId, seatIndex, snapshotAssignments } = params;
      persistInFlightRef.current += 1;
      try {
        await insertStudentSeatAssignment({
          student_id: student.id,
          seating_group_id: groupId,
          seat_index: seatIndex,
        });
        await syncGroupRowsForGroupIds([groupId]);
      } catch (err) {
        console.error('Error persisting student placement:', err);
        useSeatingStore.getState().setGroupAssignmentsById(snapshotAssignments);
        setUnseatedStudents((prev) => {
          if (prev.some((s) => s.id === student.id)) return prev;
          return [...prev, student];
        });
        showError(
          'Error',
          err instanceof Error ? err.message : 'Failed to save seat assignment.'
        );
      } finally {
        persistInFlightRef.current -= 1;
      }
    },
    [setUnseatedStudents, showError, syncGroupRowsForGroupIds]
  );

  const persistRemoveStudent = useCallback(
    async (params: {
      studentId: string;
      groupId: string;
      removedStudent: Student;
      snapshotAssignments: GroupAssignmentsById;
      snapshotUnseated: Student[];
    }) => {
      const { studentId, groupId, removedStudent, snapshotAssignments, snapshotUnseated } = params;
      persistInFlightRef.current += 1;
      try {
        const layoutScope = await layoutDeleteScopeForGroup(groupId);
        await deleteStudentSeatAssignmentsByStudentId(studentId, layoutScope);
        await syncGroupRowsForGroupIds([groupId]);
      } catch (err) {
        console.error('Error persisting student removal:', err);
        useSeatingStore.getState().setGroupAssignmentsById(snapshotAssignments);
        setUnseatedStudents(snapshotUnseated);
        showError(
          'Error',
          err instanceof Error ? err.message : 'Failed to remove seat assignment.'
        );
      } finally {
        persistInFlightRef.current -= 1;
      }
    },
    [setUnseatedStudents, showError, syncGroupRowsForGroupIds]
  );

  const persistMoveStudent = useCallback(
    async (params: {
      studentId: string;
      fromGroupId: string;
      toGroupId: string;
      seatIndex: number;
      snapshotAssignments: GroupAssignmentsById;
    }) => {
      const { studentId, fromGroupId, toGroupId, seatIndex, snapshotAssignments } = params;
      const affectedGroups =
        fromGroupId === toGroupId ? [fromGroupId] : [fromGroupId, toGroupId];
      persistInFlightRef.current += 1;
      try {
        if (fromGroupId === toGroupId) {
          await updateStudentSeatAssignmentByStudentId(
            studentId,
            { seat_index: seatIndex },
            { fallbackGroupId: fromGroupId }
          );
        } else {
          const layoutScope = await layoutDeleteScopeForGroup(toGroupId);
          await deleteStudentSeatAssignmentsByStudentId(studentId, layoutScope);
          await insertStudentSeatAssignment({
            student_id: studentId,
            seating_group_id: toGroupId,
            seat_index: seatIndex,
          });
        }
        await syncGroupRowsForGroupIds(affectedGroups);
      } catch (err) {
        console.error('Error persisting student move:', err);
        useSeatingStore.getState().setGroupAssignmentsById(snapshotAssignments);
        showError(
          'Error',
          err instanceof Error ? err.message : 'Failed to save seat move.'
        );
      } finally {
        persistInFlightRef.current -= 1;
      }
    },
    [showError, syncGroupRowsForGroupIds]
  );

  const persistSwapStudents = useCallback(
    async (params: {
      studentId1: string;
      groupId1: string;
      studentId2: string;
      groupId2: string;
      seatIndex1: number;
      seatIndex2: number;
      snapshotAssignments: GroupAssignmentsById;
    }) => {
      const {
        studentId1,
        groupId1,
        studentId2,
        groupId2,
        seatIndex1,
        seatIndex2,
        snapshotAssignments,
      } = params;
      const affectedGroups = groupId1 === groupId2 ? [groupId1] : [groupId1, groupId2];
      persistInFlightRef.current += 1;
      try {
        await swapSeatAssignments({
          studentA: studentId1,
          studentB: studentId2,
          groupA: groupId1,
          groupB: groupId2,
          seatA: seatIndex1,
          seatB: seatIndex2,
        });
        await syncGroupRowsForGroupIds(affectedGroups);
      } catch (err) {
        console.error('Error persisting student swap:', err);
        useSeatingStore.getState().setGroupAssignmentsById(snapshotAssignments);
        showError(
          'Error',
          err instanceof Error ? err.message : 'Failed to save seat swap.'
        );
      } finally {
        persistInFlightRef.current -= 1;
      }
    },
    [showError, syncGroupRowsForGroupIds]
  );

  return {
    cloneAssignmentsRecord,
    syncGroupRowsForGroupIds,
    persistGroupColumnsChange,
    persistGroupPosition,
    persistAddStudent,
    persistRemoveStudent,
    persistMoveStudent,
    persistSwapStudents,
    persistInFlightRef,
  };
}
