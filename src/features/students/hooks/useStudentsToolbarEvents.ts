import { useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import {
  emitMultiSelectStateChanged,
  emitRecentlySelectedCleared,
  STUDENT_EVENTS,
} from '@/lib/events/students';
import { useLayoutStore } from '@/stores/useLayoutStore';

interface UseStudentsToolbarEventsParams {
  classId: string;
  currentView: string;
  onToggleMultiSelect: () => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onRecentlySelect: () => void;
  onAwardPoints: () => void;
  onInverseSelect: () => void;
  clearGroupSelection: () => void;
  setIsPointLogOpen: Dispatch<SetStateAction<boolean>>;
}

export function useStudentsToolbarEvents({
  classId,
  currentView,
  onToggleMultiSelect,
  onSelectAll,
  onSelectNone,
  onRecentlySelect,
  onAwardPoints,
  onInverseSelect,
  clearGroupSelection,
  setIsPointLogOpen,
}: UseStudentsToolbarEventsParams) {
  useEffect(() => {
    useLayoutStore.getState().setMultiSelectMode(false);
    emitMultiSelectStateChanged({ isMultiSelect: false });
    clearGroupSelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- class mount reset only
  }, []);

  useEffect(() => {
    if (classId) {
      localStorage.removeItem('lastSelectedClasses');
      localStorage.removeItem('lastSelectedStudents');
      localStorage.removeItem('lastSelectedGroups');
      emitRecentlySelectedCleared();
    }
  }, [classId]);

  useEffect(() => {
    window.addEventListener(STUDENT_EVENTS.TOGGLE_MULTI_SELECT, onToggleMultiSelect);
    window.addEventListener(STUDENT_EVENTS.SELECT_ALL, onSelectAll);
    window.addEventListener(STUDENT_EVENTS.SELECT_NONE, onSelectNone);
    window.addEventListener(STUDENT_EVENTS.RECENTLY_SELECT, onRecentlySelect);
    window.addEventListener(STUDENT_EVENTS.AWARD_POINTS, onAwardPoints);
    window.addEventListener(STUDENT_EVENTS.INVERSE_SELECT, onInverseSelect);

    return () => {
      window.removeEventListener(STUDENT_EVENTS.TOGGLE_MULTI_SELECT, onToggleMultiSelect);
      window.removeEventListener(STUDENT_EVENTS.SELECT_ALL, onSelectAll);
      window.removeEventListener(STUDENT_EVENTS.SELECT_NONE, onSelectNone);
      window.removeEventListener(STUDENT_EVENTS.RECENTLY_SELECT, onRecentlySelect);
      window.removeEventListener(STUDENT_EVENTS.AWARD_POINTS, onAwardPoints);
      window.removeEventListener(STUDENT_EVENTS.INVERSE_SELECT, onInverseSelect);
    };
  }, [
    onToggleMultiSelect,
    onSelectAll,
    onSelectNone,
    onRecentlySelect,
    onAwardPoints,
    onInverseSelect,
  ]);

  useEffect(() => {
    if (currentView !== 'grid') {
      setIsPointLogOpen(false);
    }
    if (currentView !== 'seating') {
      clearGroupSelection();
    }
  }, [currentView, setIsPointLogOpen, clearGroupSelection]);

  useEffect(() => {
    const handleTogglePointLog = () => {
      if (currentView !== 'grid') return;
      setIsPointLogOpen((v) => !v);
    };
    window.addEventListener(STUDENT_EVENTS.STAGE_TOGGLE_POINT_LOG, handleTogglePointLog);
    return () => window.removeEventListener(STUDENT_EVENTS.STAGE_TOGGLE_POINT_LOG, handleTogglePointLog);
  }, [currentView, setIsPointLogOpen]);
}
