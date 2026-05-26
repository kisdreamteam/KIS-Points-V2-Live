import { useCallback, useEffect, useState } from 'react';
import { useLayoutStore } from '@/stores/useLayoutStore';
import {
  STUDENT_EVENTS,
  emitGroupSelectEnabledChanged,
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
import { useDashboardStore } from '@/features/dashboard/stores/useDashboardStore';

export function useStudentsSelection() {
  const isMultiSelectMode = useLayoutStore((s) => s.isMultiSelectMode);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [isGroupSelectEnabled, setIsGroupSelectEnabled] = useState(false);

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
      setIsGroupSelectEnabled(false);
      queueMicrotask(() => {
        emitGroupSelectEnabledChanged({ enabled: false });
      });
      resetSelections();
    } else {
      setIsGroupSelectEnabled(false);
      queueMicrotask(() => {
        emitGroupSelectEnabledChanged({ enabled: false });
      });
      emitSelectionSummary([], []);
    }
  }, [emitSelectionSummary, resetSelections]);

  const toggleGroupMultiSelect = useCallback(() => {
    if (!useLayoutStore.getState().isMultiSelectMode) return;
    setIsGroupSelectEnabled((prev) => {
      const next = !prev;
      queueMicrotask(() => {
        emitGroupSelectEnabledChanged({ enabled: next });
      });
      return next;
    });
  }, []);

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

  const recentlySelect = useCallback(() => {
    if (!isMultiSelectMode) return;
    const lastSelected = localStorage.getItem('lastSelectedStudents');
    if (!lastSelected) return;
    try {
      const ids = JSON.parse(lastSelected) as string[];
      setSelectedStudentIds(ids);
      emitSelectionSummary(ids, selectedGroupIds);
    } catch (e) {
      console.error('Error parsing last selected students:', e);
    }
  }, [isMultiSelectMode, selectedGroupIds, emitSelectionSummary]);

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
    openMultiStudentPointsAward(studentIds, { excludeAbsent: true });
  }, [isMultiSelectMode, selectedStudentIds, selectedGroupIds]);

  const inverseSelect = useCallback(() => {
    if (!isMultiSelectMode) return;

    const allStudentIds = useDashboardStore.getState().students.map((s) => s.id);
    const newStudentIds = allStudentIds.filter((id) => !selectedStudentIds.includes(id));
    setSelectedStudentIds(newStudentIds);

    let newGroupIds = selectedGroupIds;
    if (isGroupSelectEnabled) {
      const { groups, groupAssignmentsById } = useSeatingStore.getState();
      const awardableIds = getAwardableGroupIds(groups, groupAssignmentsById);
      newGroupIds = awardableIds.filter((id) => !selectedGroupIds.includes(id));
      setSelectedGroupIds(newGroupIds);
    }

    emitSelectionSummary(newStudentIds, newGroupIds);
  }, [
    isMultiSelectMode,
    isGroupSelectEnabled,
    selectedStudentIds,
    selectedGroupIds,
    emitSelectionSummary,
  ]);

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

  const resetGroupSelectEnabled = useCallback(() => {
    setIsGroupSelectEnabled(false);
    setSelectedGroupIds([]);
    queueMicrotask(() => {
      emitGroupSelectEnabledChanged({ enabled: false });
    });
  }, []);

  return {
    isMultiSelectMode,
    isGroupSelectEnabled,
    selectedStudentIds,
    selectedGroupIds,
    toggleMultiSelect,
    toggleGroupMultiSelect,
    selectAll,
    selectNone,
    recentlySelect,
    awardPoints,
    inverseSelect,
    handleSelectStudent,
    handleSelectGroup,
    removeFromSelection,
    handleAwardComplete,
    resetGroupSelectEnabled,
  };
}
