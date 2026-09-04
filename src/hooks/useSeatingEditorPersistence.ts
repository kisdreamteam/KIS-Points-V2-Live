'use client';

import { useCallback, useRef, type Dispatch, type RefObject, type SetStateAction } from 'react';
import type { Student } from '@/lib/types';
import {
  deleteStudentSeatAssignmentsByStudentId,
  insertStudentSeatAssignment,
  swapSeatAssignments,
  updateSeatingGroupPosition,
  updateSeatingGroupRows,
  updateStudentSeatAssignmentByStudentId,
  type GroupAssignment,
} from '@/features/seating/lib/api/seating';
import { computeGroupRowsFromAssignments } from '@/features/seating/lib/seatingLogic';

export interface SeatingGroupForPersistence {
  id: string;
  group_columns: number;
  group_rows?: number;
  position_x?: number;
  position_y?: number;
}

type NotifyFn = (title: string, message: string) => void;

export interface UseSeatingEditorPersistenceParams<T extends SeatingGroupForPersistence> {
  groups: T[];
  setGroups: Dispatch<SetStateAction<T[]>>;
  groupAssignmentsRef: RefObject<Map<string, GroupAssignment[]>>;
  setGroupAssignments: Dispatch<SetStateAction<Map<string, GroupAssignment[]>>>;
  setUnseatedStudents: Dispatch<SetStateAction<Student[]>>;
  setGroupPositions: Dispatch<SetStateAction<Map<string, { x: number; y: number }>>>;
  showError: NotifyFn;
}

function cloneAssignmentsMap(source: Map<string, GroupAssignment[]>): Map<string, GroupAssignment[]> {
  const clone = new Map<string, GroupAssignment[]>();
  source.forEach((list, groupId) => {
    clone.set(groupId, list.map((a) => ({ ...a, student: { ...a.student } })));
  });
  return clone;
}

export function useSeatingEditorPersistence<T extends SeatingGroupForPersistence>({
  groups,
  setGroups,
  groupAssignmentsRef,
  setGroupAssignments,
  setUnseatedStudents,
  setGroupPositions,
  showError,
}: UseSeatingEditorPersistenceParams<T>) {
  const persistInFlightRef = useRef(0);

  const syncGroupRowsForGroupIds = useCallback(
    async (groupIds: string[]) => {
      const uniqueIds = [...new Set(groupIds)];
      for (const groupId of uniqueIds) {
        const group = groups.find((g) => g.id === groupId);
        if (!group) continue;
        const assignments = groupAssignmentsRef.current?.get(groupId) ?? [];
        const columns = group.group_columns || 2;
        const group_rows = computeGroupRowsFromAssignments(assignments, columns);
        await updateSeatingGroupRows(groupId, group_rows);
        setGroups((prev) =>
          prev.map((g) => (g.id === groupId ? { ...g, group_rows } : g))
        );
      }
    },
    [groups, groupAssignmentsRef, setGroups]
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
        setGroups((prev) =>
          prev.map((g) =>
            g.id === groupId
              ? { ...g, position_x: position.x, position_y: position.y }
              : g
          )
        );
      } catch (err) {
        console.error('Error persisting group position:', err);
        setGroupPositions((prev) => {
          const next = new Map(prev);
          next.set(groupId, rollbackPosition);
          return next;
        });
        showError(
          'Error',
          err instanceof Error ? err.message : 'Failed to save group position.'
        );
      } finally {
        persistInFlightRef.current -= 1;
      }
    },
    [setGroups, setGroupPositions, showError]
  );

  const persistAddStudent = useCallback(
    async (params: {
      student: Student;
      groupId: string;
      seatIndex: number;
      snapshotAssignments: Map<string, GroupAssignment[]>;
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
        setGroupAssignments(snapshotAssignments);
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
    [setGroupAssignments, setUnseatedStudents, showError, syncGroupRowsForGroupIds]
  );

  const persistRemoveStudent = useCallback(
    async (params: {
      studentId: string;
      groupId: string;
      removedStudent: Student;
      snapshotAssignments: Map<string, GroupAssignment[]>;
      snapshotUnseated: Student[];
    }) => {
      const { studentId, groupId, removedStudent, snapshotAssignments, snapshotUnseated } = params;
      persistInFlightRef.current += 1;
      try {
        await deleteStudentSeatAssignmentsByStudentId(studentId);
        await syncGroupRowsForGroupIds([groupId]);
      } catch (err) {
        console.error('Error persisting student removal:', err);
        setGroupAssignments(snapshotAssignments);
        setUnseatedStudents(snapshotUnseated);
        showError(
          'Error',
          err instanceof Error ? err.message : 'Failed to remove seat assignment.'
        );
      } finally {
        persistInFlightRef.current -= 1;
      }
    },
    [setGroupAssignments, setUnseatedStudents, showError, syncGroupRowsForGroupIds]
  );

  const persistMoveStudent = useCallback(
    async (params: {
      studentId: string;
      fromGroupId: string;
      toGroupId: string;
      seatIndex: number;
      snapshotAssignments: Map<string, GroupAssignment[]>;
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
          await deleteStudentSeatAssignmentsByStudentId(studentId);
          await insertStudentSeatAssignment({
            student_id: studentId,
            seating_group_id: toGroupId,
            seat_index: seatIndex,
          });
        }
        await syncGroupRowsForGroupIds(affectedGroups);
      } catch (err) {
        console.error('Error persisting student move:', err);
        setGroupAssignments(snapshotAssignments);
        showError(
          'Error',
          err instanceof Error ? err.message : 'Failed to save seat move.'
        );
      } finally {
        persistInFlightRef.current -= 1;
      }
    },
    [setGroupAssignments, showError, syncGroupRowsForGroupIds]
  );

  const persistSwapStudents = useCallback(
    async (params: {
      studentId1: string;
      groupId1: string;
      studentId2: string;
      groupId2: string;
      seatIndex1: number;
      seatIndex2: number;
      snapshotAssignments: Map<string, GroupAssignment[]>;
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
        setGroupAssignments(snapshotAssignments);
        showError(
          'Error',
          err instanceof Error ? err.message : 'Failed to save seat swap.'
        );
      } finally {
        persistInFlightRef.current -= 1;
      }
    },
    [setGroupAssignments, showError, syncGroupRowsForGroupIds]
  );

  return {
    cloneAssignmentsMap,
    syncGroupRowsForGroupIds,
    persistGroupPosition,
    persistAddStudent,
    persistRemoveStudent,
    persistMoveStudent,
    persistSwapStudents,
    persistInFlightRef,
  };
}
