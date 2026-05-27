import { useCallback, useEffect, useState } from 'react';
import { useLayoutStore } from '@/stores/useLayoutStore';
import {
  STUDENT_EVENTS,
  emitMultiSelectStateChanged,
  emitRecentlySelectedUpdated,
  emitSelectionCountChanged,
} from '@/lib/events/students';
import {
  getAwardableGroupIds,
  resolveAwardableStudentIds,
} from '@/features/seating/lib/seatingSelection';
import { useSeatingStore } from '@/features/seating/stores/useSeatingStore';
import { openMultiStudentPointsAward } from '@/features/students/hooks/useBatchPointsAward';
import { getPresentStudentIdsByGender } from '@/features/students/lib/selectionFilters';
import { useDashboardStore } from '@/features/dashboard/stores/useDashboardStore';

export function useStudentsSelection() {
  const isMultiSelectMode = useLayoutStore((s) => s.isMultiSelectMode);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  const emitSelectionSummary = useCallback((studentIds: string[], groupIds: string[]) => {
    const { groupAssignmentsById } = useSeatingStore.getState();
    const awardableStudentCount = resolveAwardableStudentIds(
      studentIds,
      groupIds,
      groupAssignmentsById
    ).length;

    queueMicrotask(() => {
      emitSelectionCountChanged({
        studentCount: studentIds.length,
        groupCount: groupIds.length,
        awardableStudentCount,
      });
    });
  }, []);

  const resetSelections = useCallback(() => {
    setSelectedStudentIds([]);
    setSelectedGroupIds([]);
    emitSelectionSummary([], []);
  }, [emitSelectionSummary]);

  const toggleMultiSelect = useCallback(() => {
    const prev = useLayoutStore.getState().isMultiSelectMode;
    const newState = !prev;
    useLayoutStore.getState().setMultiSelectMode(newState);
    emitMultiSelectStateChanged({ isMultiSelect: newState });
    if (!newState) {
      resetSelections();
    } else {
      emitSelectionSummary([], []);
    }
  }, [emitSelectionSummary, resetSelections]);

  const selectAll = useCallback(() => {
    if (!isMultiSelectMode) return;
    const { students, absentStudentIds } = useDashboardStore.getState();
    const eligibleIds = students.map((s) => s.id).filter((id) => !absentStudentIds.includes(id));
    setSelectedStudentIds(eligibleIds);
    emitSelectionSummary(eligibleIds, selectedGroupIds);
  }, [isMultiSelectMode, selectedGroupIds, emitSelectionSummary]);

  const selectNone = useCallback(() => {
    if (!isMultiSelectMode) return;
    setSelectedStudentIds([]);
    setSelectedGroupIds([]);
    emitSelectionSummary([], []);
  }, [isMultiSelectMode, emitSelectionSummary]);

  const mergeGenderIntoSelection = useCallback(
    (gender: 'Boy' | 'Girl') => {
      if (!isMultiSelectMode) return;
      const { students, absentStudentIds } = useDashboardStore.getState();
      const ids = getPresentStudentIdsByGender(students, absentStudentIds, gender);
      setSelectedStudentIds((prev) => [...new Set([...prev, ...ids])]);
    },
    [isMultiSelectMode]
  );

  const selectAllBoys = useCallback(() => {
    mergeGenderIntoSelection('Boy');
  }, [mergeGenderIntoSelection]);

  const selectAllGirls = useCallback(() => {
    mergeGenderIntoSelection('Girl');
  }, [mergeGenderIntoSelection]);

  const recentlySelect = useCallback(() => {
    if (!isMultiSelectMode) return;
    const lastSelected = localStorage.getItem('lastSelectedStudents');
    if (!lastSelected) return;
    try {
      const ids = JSON.parse(lastSelected) as string[];
      setSelectedStudentIds(ids);
      setSelectedGroupIds([]);
      emitSelectionSummary(ids, []);
    } catch (e) {
      console.error('Error parsing last selected students:', e);
    }
  }, [isMultiSelectMode, emitSelectionSummary]);

  const awardPoints = useCallback(() => {
    if (!isMultiSelectMode) return;
    const { groupAssignmentsById } = useSeatingStore.getState();
    const studentIds = resolveAwardableStudentIds(
      selectedStudentIds,
      selectedGroupIds,
      groupAssignmentsById
    );
    if (studentIds.length === 0) {
      alert('Please select at least one student to award points.');
      return;
    }
    openMultiStudentPointsAward(studentIds);
  }, [isMultiSelectMode, selectedStudentIds, selectedGroupIds]);

  const inverseSelect = useCallback(() => {
    if (!isMultiSelectMode) return;

    const { students, absentStudentIds } = useDashboardStore.getState();
    const presentStudentIds = students.map((s) => s.id).filter((id) => !absentStudentIds.includes(id));

    const newStudentIds = presentStudentIds.filter((id) => !selectedStudentIds.includes(id));
    setSelectedStudentIds(newStudentIds);
    setSelectedGroupIds([]);

    emitSelectionSummary(newStudentIds, []);
  }, [isMultiSelectMode, selectedStudentIds, emitSelectionSummary]);

  const handleSelectStudent = useCallback((studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  }, []);

  const handleSelectGroup = useCallback((groupId: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  }, []);

  const removeFromSelection = useCallback((studentId: string) => {
    setSelectedStudentIds((prev) => {
      if (!prev.includes(studentId)) return prev;
      return prev.filter((id) => id !== studentId);
    });
  }, []);

  const handleAwardComplete = useCallback(
    (awardedStudentIds: string[], hadGroupSelection: boolean) => {
      localStorage.setItem('lastSelectedStudents', JSON.stringify(awardedStudentIds));
      if (hadGroupSelection) {
        localStorage.setItem('lastSelectedGroups', JSON.stringify(selectedGroupIds));
      }
      emitRecentlySelectedUpdated();
      setSelectedStudentIds([]);
      setSelectedGroupIds([]);
      emitSelectionSummary([], []);
    },
    [emitSelectionSummary, selectedGroupIds]
  );

  useEffect(() => {
    const onMultiComplete = (e: Event) => {
      const detail = (e as CustomEvent<{ studentIds: string[] }>).detail;
      if (!detail?.studentIds) return;
      handleAwardComplete(detail.studentIds, selectedGroupIds.length > 0);
    };
    window.addEventListener(STUDENT_EVENTS.MULTI_STUDENT_AWARD_COMPLETE, onMultiComplete);
    return () =>
      window.removeEventListener(STUDENT_EVENTS.MULTI_STUDENT_AWARD_COMPLETE, onMultiComplete);
  }, [handleAwardComplete, selectedGroupIds]);

  useEffect(() => {
    if (!isMultiSelectMode) return;
    emitSelectionSummary(selectedStudentIds, selectedGroupIds);
  }, [selectedStudentIds, selectedGroupIds, isMultiSelectMode, emitSelectionSummary]);

  const clearGroupSelection = useCallback(() => {
    setSelectedGroupIds([]);
  }, []);

  return {
    isMultiSelectMode,
    selectedStudentIds,
    selectedGroupIds,
    toggleMultiSelect,
    selectAll,
    selectNone,
    selectAllBoys,
    selectAllGirls,
    recentlySelect,
    awardPoints,
    inverseSelect,
    handleSelectStudent,
    handleSelectGroup,
    removeFromSelection,
    handleAwardComplete,
    clearGroupSelection,
  };
}
