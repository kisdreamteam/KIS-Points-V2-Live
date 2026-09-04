'use client';

/**
 * Seating chart **editor** controller (Layer 1 integration).
 * Distinct from `useSeatingStore` (sidebar selection / unseated list for the editor).
 */

import { useState, useEffect, useCallback, useRef, type Dispatch, type SetStateAction } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import { Student } from '@/lib/types';
import {
  createSeatingLayout,
  deleteAssignmentsForGroupsSequential,
  deleteSeatingGroupsSequential,
  deleteStudentSeatAssignmentsForGroupIds,
  deleteStudentSeatAssignmentsForSeatingGroupId,
  deleteTeamAssignmentsAndGroup,
  fetchSeatingGroupsWithAssignments,
  fetchSeatingLayoutsByClassId,
  insertSeatingGroup,
  insertSeatingGroups,
  insertStudentSeatAssignments,
  insertStudentSeatAssignmentsBatched,
  updateSeatingGroupFields,
  updateSeatingGroupsLayoutBatch,
} from '@/features/seating/lib/api/seating';
import type { GroupAssignment } from '@/features/seating/lib/api/seating';
import {
  computeGroupRowsFromAssignments,
  getCoordinates,
  getMaxSeatIndexFromAssignments,
  getNextIndex,
  getSlotIndex,
} from '@/features/seating/lib/seatingLogic';
import { STUDENT_EVENTS, emitSeatingEditMode, type SeatingRepairLayoutDetail } from '@/lib/events/students';
import { refreshSeatingGroupsForLayout } from '@/features/dashboard/hooks/sync/seatingChartRefresh';
import { getEditorPersistInFlight } from '@/features/seating/lib/seatingEditorPersistGate';
import { useSeatingEditorPersistence } from '@/hooks/useSeatingEditorPersistence';
import { useSeatingStore } from '@/features/seating/stores/useSeatingStore';
import {
  assignmentsMapToRecord,
  buildGroupPositionsFromGroups,
  getAssignmentsForGroup,
} from '@/features/seating/stores/seatingLayoutStoreHelpers';


interface SeatingChart {
  id: string;
  name: string;
  class_id: string;
  created_at: string;
  show_grid?: boolean;
  show_objects?: boolean;
  layout_orientation?: string;
}

interface SeatingGroup {
  id: string;
  name: string;
  seating_chart_id: string;
  sort_order: number;
  group_columns: number; // Number of columns for the group (renamed from grid_columns)
  group_rows?: number;  // Number of rows for the group (1 header + student rows, min 2)
  position_x?: number; // X position in pixels on the canvas
  position_y?: number; // Y position in pixels on the canvas
  created_at: string;
}

interface StudentSeatAssignment {
  seating_group_id: string;
  seat_index: number | null;
  students: Student | null;
}

const GROUP_BASE_WIDTH_FOR_2_COLUMNS = 400;
const GROUP_PADDING = 8;
const GROUP_GAP = 8;
const GROUP_CARD_MIN_WIDTH = 180;
const GROUP_MIN_WIDTH = 300;
const GROUP_MIN_HEIGHT = 100;
const GROUP_HEADER_HEIGHT = 50;
const GROUP_STUDENT_ROW_HEIGHT = 50;
export const GROUP_EXPAND_ROW_HEIGHT = 36;
const DEFAULT_GROUP_STAGGER_X = 20;
const DEFAULT_GROUP_STAGGER_Y = 100;
const DEFAULT_GROUP_START = 20;
const BATCH_GROUPS_PER_ROW = 3;
const BATCH_GROUP_HEIGHT = 150;
const BATCH_GROUP_HORIZONTAL_SPACING = 30;
const BATCH_GROUP_VERTICAL_SPACING = 30;
const BATCH_GROUP_START_X = 50;
const BATCH_GROUP_START_Y = 150;
/** Yellow highlight hold before moving a student during randomize (50% faster than 600ms). */
const RANDOMIZE_ABOUT_TO_MOVE_MS = 300;
/** Blue highlight hold before advancing to the next student during randomize (50% faster than 800ms). */
const RANDOMIZE_BEING_PLACED_MS = 400;

function getMaxSeatIndexInColumn(assignments: GroupAssignment[], column: number, columns: number): number {
  const inColumn = assignments.filter(
    (a) => getCoordinates(a.seat_index ?? 0, columns).col === column
  );
  return inColumn.length === 0 ? 0 : Math.max(...inColumn.map((a) => a.seat_index ?? 0));
}

function getNextSeatIndex(assignments: GroupAssignment[]): number {
  return getNextIndex(assignments.map((a) => a.seat_index ?? 0));
}

function getNextSeatIndexInColumn(assignments: GroupAssignment[], column: number, columns: number): number {
  const maxInColumn = getMaxSeatIndexInColumn(assignments, column, columns);
  return maxInColumn === 0 ? column + 1 : maxInColumn + columns;
}

function getBatchGroupWidth(): number {
  const cardWidthFor2Columns = Math.max(
    GROUP_CARD_MIN_WIDTH,
    (GROUP_BASE_WIDTH_FOR_2_COLUMNS - GROUP_PADDING * 2 - GROUP_GAP * (2 - 1)) / 2
  );
  return Math.max(GROUP_MIN_WIDTH, cardWidthFor2Columns * 2 + GROUP_GAP * (2 - 1) + GROUP_PADDING * 2);
}

function getBatchGroupPosition(index: number, groupWidth: number): { x: number; y: number } {
  const row = Math.floor(index / BATCH_GROUPS_PER_ROW);
  const col = index % BATCH_GROUPS_PER_ROW;
  return {
    x: BATCH_GROUP_START_X + col * (groupWidth + BATCH_GROUP_HORIZONTAL_SPACING),
    y: BATCH_GROUP_START_Y + row * (BATCH_GROUP_HEIGHT + BATCH_GROUP_VERTICAL_SPACING),
  };
}

function getGroupRenderLayout(groupColumns: number, assignmentsInGroup: GroupAssignment[]) {
  const validColumns = Math.max(1, Math.min(3, groupColumns || 2));
  const maxIndex = getMaxSeatIndexFromAssignments(assignmentsInGroup);
  const numRows = Math.max(1, Math.ceil(maxIndex / validColumns));

  const cardWidthFor2Columns = Math.max(
    GROUP_CARD_MIN_WIDTH,
    (GROUP_BASE_WIDTH_FOR_2_COLUMNS - GROUP_PADDING * 2 - GROUP_GAP * (2 - 1)) / 2
  );
  const twoColumnGroupWidth = Math.max(
    GROUP_MIN_WIDTH,
    cardWidthFor2Columns * 2 + GROUP_GAP * (2 - 1) + GROUP_PADDING * 2
  );

  let groupWidth: number;
  if (validColumns === 1) {
    groupWidth = twoColumnGroupWidth * 0.5;
  } else if (validColumns === 2) {
    groupWidth = twoColumnGroupWidth;
  } else {
    const cardWidth = Math.max(
      GROUP_CARD_MIN_WIDTH,
      (GROUP_BASE_WIDTH_FOR_2_COLUMNS - GROUP_PADDING * 2 - GROUP_GAP * (validColumns - 1)) / validColumns
    );
    groupWidth = Math.max(
      GROUP_MIN_WIDTH,
      cardWidth * validColumns + GROUP_GAP * (validColumns - 1) + GROUP_PADDING * 2
    );
  }

  const groupHeight =
    GROUP_HEADER_HEIGHT +
    numRows * GROUP_STUDENT_ROW_HEIGHT +
    GROUP_EXPAND_ROW_HEIGHT +
    GROUP_PADDING * 2;

  return { validColumns, numRows, groupWidth, groupHeight };
}

function getDefaultStaggerPosition(index: number): { x: number; y: number } {
  return {
    x: DEFAULT_GROUP_START + index * DEFAULT_GROUP_STAGGER_X,
    y: DEFAULT_GROUP_START + index * DEFAULT_GROUP_STAGGER_Y,
  };
}

function readStoreAssignments(groupId: string): GroupAssignment[] {
  return getAssignmentsForGroup(useSeatingStore.getState().groupAssignmentsById, groupId);
}
export interface UseSeatingChartEditorParams {
  classId: string;
  students: Student[];
  selectedLayoutId: string | null;
  setSelectedLayoutId: (id: string | null) => void;
  selectedStudentForGroup: Student | null;
  setSelectedStudentForGroup: Dispatch<SetStateAction<Student | null>>;
  setUnseatedStudents: Dispatch<SetStateAction<Student[]>>;
  unseatedStudents: Student[];
  searchParams: ReadonlyURLSearchParams | null;
  router: AppRouterInstance;
  pathname: string | null;
}

export function useSeatingChartEditor(params: UseSeatingChartEditorParams) {
  const {
    classId,
    students,
    selectedLayoutId,
    setSelectedLayoutId,
    selectedStudentForGroup,
    setSelectedStudentForGroup,
    setUnseatedStudents,
    unseatedStudents,
    searchParams,
    router,
    pathname,
  } = params;

    const [layouts, setLayouts] = useState<SeatingChart[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const {
      groups,
      isLoadingGroups,
      groupAssignmentsById,
      groupPositionsById,
      setGroups,
      setGroupsLoading,
      setGroupAssignmentsById,
      mergeGroupPositions,
      updateGroups,
      updateGroupAssignmentsById,
    } = useSeatingStore(
      useShallow((s) => ({
        groups: s.groups,
        isLoadingGroups: s.isLoadingGroups,
        groupAssignmentsById: s.groupAssignmentsById,
        groupPositionsById: s.groupPositionsById,
        setGroups: s.setGroups,
        setGroupsLoading: s.setGroupsLoading,
        setGroupAssignmentsById: s.setGroupAssignmentsById,
        mergeGroupPositions: s.mergeGroupPositions,
        updateGroups: s.updateGroups,
        updateGroupAssignmentsById: s.updateGroupAssignmentsById,
      }))
    );
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
    const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
    const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
    const [isClearTeamModalOpen, setIsClearTeamModalOpen] = useState(false);
    const [isDeleteTeamModalOpen, setIsDeleteTeamModalOpen] = useState(false);
    const [isRandomizeModalOpen, setIsRandomizeModalOpen] = useState(false);
    const [isAutoAssignModalOpen, setIsAutoAssignModalOpen] = useState(false);
    const [teamToClear, setTeamToClear] = useState<SeatingGroup | null>(null);
    const [teamToDelete, setTeamToDelete] = useState<SeatingGroup | null>(null);
    const [successNotification, setSuccessNotification] = useState<{ isOpen: boolean; title: string; message: string }>({
      isOpen: false,
      title: '',
      message: '',
    });
    const [isSavingAllChanges, setIsSavingAllChanges] = useState(false);
    const [editingGroup, setEditingGroup] = useState<SeatingGroup | null>(null);
    const handleCloseRef = useRef<() => void>(() => {});
    /** Set when closing via handleClose after save so unmount cleanup does not emit edit-mode false again. */
    const skipUnmountEditModeEmitRef = useRef(false);
    const addStudentToGroupInFlightRef = useRef<{ studentId: string; groupId: string } | null>(null);
    const saveAllChangesInFlightRef = useRef(false);
    const [targetGroupId, setTargetGroupId] = useState<string | null>(null);

    // Helpers for fixed-slot grid (derived from store groupAssignmentsById)
    const getAssignmentsInGroup = useCallback((groupId: string): GroupAssignment[] => {
      return groupAssignmentsById[groupId] ?? [];
    }, [groupAssignmentsById]);
    const getStudentsInGroup = useCallback((groupId: string): Student[] => {
      return (groupAssignmentsById[groupId] ?? []).map(a => a.student);
    }, [groupAssignmentsById]);
    const studentAtSlot = useCallback((groupId: string, seatIndex: number): Student | null => {
      const list = groupAssignmentsById[groupId] ?? [];
      const found = list.find(a => a.seat_index === seatIndex);
      return found ? found.student : null;
    }, [groupAssignmentsById]);
    const maxSeatIndex = useCallback((groupId: string): number => {
      const list = groupAssignmentsById[groupId] ?? [];
      return getMaxSeatIndexFromAssignments(list);
    }, [groupAssignmentsById]);
    const maxSeatIndexInColumn = useCallback((groupId: string, col: number, C: number): number => {
      const list = groupAssignmentsById[groupId] ?? [];
      return getMaxSeatIndexInColumn(list, col, C);
    }, [groupAssignmentsById]);
    const nextSeatIndexInColumn = useCallback((groupId: string, col: number, C: number): number => {
      const list = groupAssignmentsById[groupId] ?? [];
      return getNextSeatIndexInColumn(list, col, C);
    }, [groupAssignmentsById]);
    const [openSettingsMenuId, setOpenSettingsMenuId] = useState<string | null>(null);
    const [selectedStudentForSwap, setSelectedStudentForSwap] = useState<{ studentId: string; groupId: string } | null>(null);
    const [editingGroupNameId, setEditingGroupNameId] = useState<string | null>(null);
    const [editingGroupNameValue, setEditingGroupNameValue] = useState<string>('');
    const canvasContainerRef = useRef<HTMLDivElement | null>(null);
    // Track which group is being dragged
    const [draggedGroupId, setDraggedGroupId] = useState<string | null>(null);

    // Helper function to show success notification
    const showSuccessNotification = (title: string, message: string) => {
      setSuccessNotification({ isOpen: true, title, message });
    };

    const {
      cloneAssignmentsRecord,
      syncGroupRowsForGroupIds,
      persistGroupColumnsChange,
      persistGroupPosition,
      persistAddStudent,
      persistRemoveStudent,
      persistMoveStudent,
      persistSwapStudents,
    } = useSeatingEditorPersistence({
      setUnseatedStudents,
      showError: showSuccessNotification,
    });

    // Handle close — navigate only; SeatingChartDataSync refreshes after persists settle
    const handleClose = useCallback(() => {
      skipUnmountEditModeEmitRef.current = true;
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      params.delete('mode');
      const base = pathname ?? '/';
      const newUrl = params.toString() ? `${base}?${params.toString()}` : base;
      router.push(newUrl);
      emitSeatingEditMode({ isEditMode: false });
    }, [pathname, router, searchParams]);

    const searchParamsSnapshot = searchParams?.toString() ?? '';
    useEffect(() => {
      return () => {
        if (skipUnmountEditModeEmitRef.current) return;
        const params = new URLSearchParams(searchParamsSnapshot);
        if (params.get('mode') === 'edit') {
          emitSeatingEditMode({ isEditMode: false });
        }
      };
    }, [searchParamsSnapshot]);

    useEffect(() => {
      handleCloseRef.current = handleClose;
    }, [handleClose]);

    useEffect(() => {
      const handleStageCloseEditor = () => {
        handleCloseRef.current();
      };
      window.addEventListener(STUDENT_EVENTS.STAGE_CLOSE_EDITOR, handleStageCloseEditor);
      return () => window.removeEventListener(STUDENT_EVENTS.STAGE_CLOSE_EDITOR, handleStageCloseEditor);
    }, []);

    // Track the offset from where the user clicked to the group's top-left corner
    const dragOffsetRef = useRef<{ x: number; y: number } | null>(null);
    // Animation state for randomize
    const [isRandomizing, setIsRandomizing] = useState(false);
    const [studentsAboutToMove, setStudentsAboutToMove] = useState<Set<string>>(new Set()); // Yellow
    const [studentsBeingPlaced, setStudentsBeingPlaced] = useState<Set<string>>(new Set()); // Blue

    const fetchLayouts = useCallback(async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchSeatingLayoutsByClassId(classId);

        if (data) {
          setLayouts(data);
          // Check URL parameter for layout ID first, then localStorage, then default to first
          const layoutIdFromURL = searchParams?.get('layout');
          const storageKey = `seatingChart_selectedLayout_${classId}`;
          const layoutIdFromStorage = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
          
          if (data.length > 0) {
            // Priority: URL parameter > current context value > localStorage > first layout
            if (layoutIdFromURL && data.some((layout) => layout.id === layoutIdFromURL)) {
              if (selectedLayoutId !== layoutIdFromURL) {
                setSelectedLayoutId(layoutIdFromURL);
              }
            } else if (
              selectedLayoutId !== null &&
              data.some((layout) => layout.id === selectedLayoutId)
            ) {
              // Keep current context selection when it is still valid.
            } else if (layoutIdFromStorage && data.some((layout) => layout.id === layoutIdFromStorage)) {
              setSelectedLayoutId(layoutIdFromStorage);
            } else {
              setSelectedLayoutId(data[0].id);
            }
          } else if (selectedLayoutId !== null) {
            setSelectedLayoutId(null);
          }
        } else {
          setLayouts([]);
          if (selectedLayoutId !== null) {
            setSelectedLayoutId(null);
          }
        }
      } catch (err) {
        console.error('Unexpected error fetching seating charts:', err);
        setError('An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    }, [selectedLayoutId, classId, searchParams, setSelectedLayoutId]);

    // Fetch layouts from Supabase
    useEffect(() => {
      if (classId) {
        fetchLayouts();
      }
    }, [classId, fetchLayouts]);

    // Watch for URL parameter changes and update selected layout
    useEffect(() => {
      const layoutIdFromURL = searchParams?.get('layout');
      if (layoutIdFromURL && layouts.length > 0) {
        const layoutExists = layouts.find(l => l.id === layoutIdFromURL);
        if (layoutExists && selectedLayoutId !== layoutIdFromURL) {
          setSelectedLayoutId(layoutIdFromURL);
        }
      }
    }, [selectedLayoutId, layouts, searchParams, setSelectedLayoutId]);

    // Store selected layout ID in localStorage when it changes
    useEffect(() => {
      if (selectedLayoutId && classId) {
        const storageKey = `seatingChart_selectedLayout_${classId}`;
        localStorage.setItem(storageKey, selectedLayoutId);
      }
    }, [selectedLayoutId, classId]);

    const fetchGroups = useCallback(async (options?: { preserveLocalPositions?: boolean }) => {
      if (!selectedLayoutId) return;

      const preserveLocalPositions = options?.preserveLocalPositions ?? false;

      try {
        setGroupsLoading(true);
        const { groups: groupsData, groupAssignments: nextGroupAssignments } =
          await fetchSeatingGroupsWithAssignments(selectedLayoutId);

        if (groupsData) {
          setGroups(groupsData);

          mergeGroupPositions((prev) =>
            buildGroupPositionsFromGroups(groupsData, prev, { preserveLocalPositions })
          );

          setGroupAssignmentsById(assignmentsMapToRecord(nextGroupAssignments));

          const assignedStudentIds = new Set<string>();
          nextGroupAssignments.forEach((assignments) => {
            assignments.forEach((assignment) => {
              assignedStudentIds.add(assignment.student.id);
            });
          });
          const unseated = students.filter((student) => !assignedStudentIds.has(student.id));
          setUnseatedStudents(unseated);
        } else {
          setGroups([]);
          setGroupAssignmentsById({});
          setUnseatedStudents(students);
        }
      } catch (err) {
        console.error('Unexpected error fetching seating groups:', err);
      } finally {
        setGroupsLoading(false);
      }
    }, [
      selectedLayoutId,
      students,
      setUnseatedStudents,
      setGroups,
      setGroupsLoading,
      setGroupAssignmentsById,
      mergeGroupPositions,
    ]);

    // Fetch groups when layout is selected or when shared roster changes
    useEffect(() => {
      if (selectedLayoutId && students.length > 0) {
        fetchGroups();
      } else if (!selectedLayoutId) {
        setGroups([]);
        setGroupAssignmentsById({});
      }
    }, [selectedLayoutId, fetchGroups, students.length, setGroups, setGroupAssignmentsById]);

    // Listen for student selection from sidebar
    useEffect(() => {
      const handleStudentSelected = (event: CustomEvent) => {
        const student = event.detail.student as Student;
        setSelectedStudentForGroup(student);
        // Show visual indicator that a student is ready to be placed
      };

      window.addEventListener('studentSelectedForGroup', handleStudentSelected as EventListener);
      return () => {
        window.removeEventListener('studentSelectedForGroup', handleStudentSelected as EventListener);
      };
    }, [setSelectedStudentForGroup]);


    /** Matches local grid math used previously in saveAllGroupSizes (header row + student rows, min 2). */
    const computeGroupRows = useCallback(
      (assignmentsInGroup: GroupAssignment[], groupColumns: number) =>
        computeGroupRowsFromAssignments(assignmentsInGroup, groupColumns),
      []
    );

    /**
     * Manual recovery: full replace of group layout + seat assignments from store.
     * Not wired to exit X — normal edits persist immediately via useSeatingEditorPersistence.
     * Triggered only via SEATING_REPAIR_LAYOUT (Settings → Sync layout to database).
     */
    const repairSeatingLayoutFromStore = useCallback(async (onRepairComplete?: () => void) => {
      if (!selectedLayoutId) {
        showSuccessNotification('No layout', 'Select a seating layout before syncing.');
        return;
      }
      if (groups.length === 0) {
        showSuccessNotification('Nothing to sync', 'Create at least one group before syncing.');
        return;
      }
      if (getEditorPersistInFlight() > 0) {
        showSuccessNotification(
          'Please wait',
          'Seat changes are still saving. Try sync again in a moment.'
        );
        return;
      }
      if (isRandomizing) {
        showSuccessNotification('Please wait', 'Randomize is in progress. Try sync again when it finishes.');
        return;
      }
      if (saveAllChangesInFlightRef.current) return;
      saveAllChangesInFlightRef.current = true;
      setIsSavingAllChanges(true);
      try {
        const groupIds = groups.map((g) => g.id);
        const groupIdSet = new Set(groupIds);

        const updates = groups.map((group) => {
          const pos = groupPositionsById[group.id] ?? {
            x: group.position_x ?? 0,
            y: group.position_y ?? 0,
          };
          const assignmentsInGroup = groupAssignmentsById[group.id] ?? [];
          const columns = group.group_columns || 2;
          const group_rows = computeGroupRows(assignmentsInGroup, columns);
          return { group, pos, columns, group_rows };
        });

        const layoutUpdates = updates.map(({ group, pos, columns, group_rows }) => ({
          id: group.id,
          position_x: pos.x,
          position_y: pos.y,
          group_columns: columns,
          group_rows,
        }));

        try {
          await updateSeatingGroupsLayoutBatch(layoutUpdates);
        } catch (firstGroupErr: unknown) {
          console.error('Error updating seating_groups:', firstGroupErr);
          showSuccessNotification(
            'Error',
            firstGroupErr instanceof Error ? firstGroupErr.message : 'Failed to update groups.'
          );
          return;
        }

        if (groupIds.length > 0) {
          try {
            await deleteStudentSeatAssignmentsForGroupIds(groupIds);
          } catch (deleteError: unknown) {
            console.error('Error clearing seat assignments:', deleteError);
            showSuccessNotification(
              'Error',
              deleteError instanceof Error ? deleteError.message : 'Failed to clear seat assignments.'
            );
            return;
          }
        }

        const insertRows: { student_id: string; seating_group_id: string; seat_index: number }[] = [];
        for (const [seatingGroupId, list] of Object.entries(groupAssignmentsById)) {
          if (!groupIdSet.has(seatingGroupId)) continue;
          for (const a of list) {
            insertRows.push({
              student_id: a.student.id,
              seating_group_id: seatingGroupId,
              seat_index: a.seat_index,
            });
          }
        }

        if (insertRows.length > 0) {
          try {
            await insertStudentSeatAssignmentsBatched(insertRows, 500);
          } catch (insertError: unknown) {
            console.error('Error inserting seat assignments:', insertError);
            showSuccessNotification(
              'Error',
              insertError instanceof Error ? insertError.message : 'Failed to save seat assignments.'
            );
            return;
          }
        }

        updateGroups((prev) =>
          prev.map((g) => {
            const pos = groupPositionsById[g.id] ?? { x: g.position_x ?? 0, y: g.position_y ?? 0 };
            const assignmentsInGroup = groupAssignmentsById[g.id] ?? [];
            const columns = g.group_columns || 2;
            const group_rows = computeGroupRows(assignmentsInGroup, columns);
            return {
              ...g,
              position_x: pos.x,
              position_y: pos.y,
              group_columns: columns,
              group_rows,
            };
          })
        );

        showSuccessNotification(
          'Layout synced',
          'Seating layout and assignments were rebuilt from the current canvas.'
        );
        await refreshSeatingGroupsForLayout(selectedLayoutId);
        onRepairComplete?.();
      } catch (err) {
        console.error('Unexpected error repairing seating chart:', err);
        showSuccessNotification('Error', 'Failed to sync layout. Please try again.');
      } finally {
        saveAllChangesInFlightRef.current = false;
        setIsSavingAllChanges(false);
      }
    }, [
      selectedLayoutId,
      groups,
      groupAssignmentsById,
      groupPositionsById,
      computeGroupRows,
      updateGroups,
      isRandomizing,
    ]);

    const repairSeatingLayoutFromStoreRef = useRef(repairSeatingLayoutFromStore);
    const isRandomizingRef = useRef(isRandomizing);
    useEffect(() => {
      repairSeatingLayoutFromStoreRef.current = repairSeatingLayoutFromStore;
    }, [repairSeatingLayoutFromStore]);
    useEffect(() => {
      isRandomizingRef.current = isRandomizing;
    }, [isRandomizing]);

    const showSuccessNotificationRef = useRef(showSuccessNotification);
    useEffect(() => {
      showSuccessNotificationRef.current = showSuccessNotification;
    }, [showSuccessNotification]);

    useEffect(() => {
      const handleSeatingRepairLayout = (event: Event) => {
        const detail = (event as CustomEvent<SeatingRepairLayoutDetail>).detail;
        if (getEditorPersistInFlight() > 0) {
          showSuccessNotificationRef.current(
            'Please wait',
            'Seat changes are still saving. Try sync again in a moment.'
          );
          return;
        }
        if (isRandomizingRef.current) {
          showSuccessNotificationRef.current(
            'Please wait',
            'Randomize is in progress. Try sync again when it finishes.'
          );
          return;
        }
        if (saveAllChangesInFlightRef.current) {
          showSuccessNotificationRef.current(
            'Please wait',
            'A layout sync is already in progress.'
          );
          return;
        }
        void repairSeatingLayoutFromStoreRef.current(detail?.onRepairComplete);
      };

      window.addEventListener(STUDENT_EVENTS.SEATING_REPAIR_LAYOUT, handleSeatingRepairLayout as EventListener);
      return () => {
        window.removeEventListener(STUDENT_EVENTS.SEATING_REPAIR_LAYOUT, handleSeatingRepairLayout as EventListener);
      };
    }, []);

    // Handle randomize seating - animated swap of all seated students
    const handleRandomizeSeating = useCallback(async () => {
      if (isRandomizing || groups.length === 0) return;
      
      setIsRandomizing(true);
      
      try {
        // First, record the size of each group (to maintain group sizes after randomization)
        const groupSizes: Map<string, number> = new Map();
        for (const [groupId, assignments] of Object.entries(groupAssignmentsById)) {
          groupSizes.set(groupId, assignments.length);
        }

        // Collect all seated students with their current groups
        const seatedStudents: Array<{ student: Student; currentGroupId: string }> = [];
        for (const [groupId, assignments] of Object.entries(groupAssignmentsById)) {
          assignments.forEach(({ student }) => {
            seatedStudents.push({ student, currentGroupId: groupId });
          });
        }

        if (seatedStudents.length === 0) {
          setIsRandomizing(false);
          return;
        }

        // Shuffle all students randomly
        const shuffledStudents = [...seatedStudents].sort(() => Math.random() - 0.5);
        
        // Create new assignments maintaining original group sizes
        const newAssignments: Array<{ student: Student; newGroupId: string; currentGroupId: string }> = [];
        const groupIds = groups.map(g => g.id);
        
        // Create a map to track how many students have been assigned to each group
        const groupAssignmentCounts: Map<string, number> = new Map();
        groupIds.forEach(groupId => {
          groupAssignmentCounts.set(groupId, 0);
        });
        
        // Distribute shuffled students back to groups maintaining original sizes
        let studentIndex = 0;
        for (const groupId of groupIds) {
          const targetSize = groupSizes.get(groupId) || 0;
          const currentCount = groupAssignmentCounts.get(groupId) || 0;
          const needed = targetSize - currentCount;
          
          // Assign the needed number of students to this group
          for (let i = 0; i < needed && studentIndex < shuffledStudents.length; i++) {
            const { student, currentGroupId } = shuffledStudents[studentIndex];
            newAssignments.push({ student, newGroupId: groupId, currentGroupId });
            groupAssignmentCounts.set(groupId, (groupAssignmentCounts.get(groupId) || 0) + 1);
            studentIndex++;
          }
        }

        // Animate each swap one by one
        for (let i = 0; i < newAssignments.length; i++) {
          const { student, newGroupId, currentGroupId } = newAssignments[i];
          
          // Skip if student is already in the target group
          if (currentGroupId === newGroupId) continue;

          // Show yellow (about to move)
          setStudentsAboutToMove(prev => new Set(prev).add(student.id));
          
          await new Promise((resolve) => setTimeout(resolve, RANDOMIZE_ABOUT_TO_MOVE_MS));
          
          // Show blue (being placed) and update local state
          setStudentsAboutToMove(prev => {
            const next = new Set(prev);
            next.delete(student.id);
            return next;
          });
          setStudentsBeingPlaced(prev => new Set(prev).add(student.id));
          
          // Update store immediately for visual feedback (randomize uses 1..N per group)
          updateGroupAssignmentsById((prev) => {
            const next = { ...prev };
            const oldList = next[currentGroupId] ?? [];
            const newList = next[newGroupId] ?? [];
            const newIndexInNewGroup = newList.length + 1;
            next[currentGroupId] = oldList.filter((a) => a.student.id !== student.id);
            next[newGroupId] = [...newList, { student, seat_index: newIndexInNewGroup }];
            return next;
          });
          
          await new Promise((resolve) => setTimeout(resolve, RANDOMIZE_BEING_PLACED_MS));
          
          // Remove blue state
          setStudentsBeingPlaced(prev => {
            const next = new Set(prev);
            next.delete(student.id);
            return next;
          });
        }

        // After all animations, update database
        const currentLayoutGroupIds = groups.map((g) => g.id);
        if (currentLayoutGroupIds.length > 0) {
          await deleteStudentSeatAssignmentsForGroupIds(currentLayoutGroupIds);
        }

        const nextSeatIndexByGroup = new Map<string, number>();
        groups.forEach((g) => nextSeatIndexByGroup.set(g.id, 1));
        const assignmentsToInsert = newAssignments.map(({ student, newGroupId }) => {
          const seat_index = nextSeatIndexByGroup.get(newGroupId) ?? 1;
          nextSeatIndexByGroup.set(newGroupId, seat_index + 1);
          return { student_id: student.id, seating_group_id: newGroupId, seat_index };
        });

        if (assignmentsToInsert.length > 0) {
          await insertStudentSeatAssignments(assignmentsToInsert);
        }

        await syncGroupRowsForGroupIds(currentLayoutGroupIds);
        
        // Refresh to ensure sync
        await fetchGroups();
        
      } catch (err) {
        console.error('Error randomizing seating:', err);
        alert('Failed to randomize seating. Please try again.');
      } finally {
        // Clear all animation states
        setStudentsAboutToMove(new Set());
        setStudentsBeingPlaced(new Set());
        setIsRandomizing(false);
      }
    }, [isRandomizing, groups, groupAssignmentsById, fetchGroups, syncGroupRowsForGroupIds, updateGroupAssignmentsById]);

    // Listen for randomize event
    useEffect(() => {
      const handleRandomize = () => {
        setIsRandomizeModalOpen(true);
      };

      window.addEventListener(STUDENT_EVENTS.SEATING_RANDOMIZE, handleRandomize as EventListener);
      return () => {
        window.removeEventListener(STUDENT_EVENTS.SEATING_RANDOMIZE, handleRandomize as EventListener);
      };
    }, [handleRandomizeSeating]);

    // Listen for add student to group event. targetSeatIndex = fill hole / expand; omit = append at end.
    const addStudentToGroup = useCallback((student: Student, groupId: string, targetSeatIndex?: number) => {
      // Prevent double invocation (e.g. React Strict Mode or duplicate event)
      if (addStudentToGroupInFlightRef.current?.studentId === student.id && addStudentToGroupInFlightRef.current?.groupId === groupId) {
        return;
      }
      addStudentToGroupInFlightRef.current = { studentId: student.id, groupId };

      try {
        const currentInGroup = readStoreAssignments(groupId).map((a) => a.student);
        if (currentInGroup.some((s) => s.id === student.id)) {
          setSelectedStudentForGroup(null);
          addStudentToGroupInFlightRef.current = null;
          return;
        }

        const seatIndexToUse =
          targetSeatIndex != null
            ? targetSeatIndex
            : getNextSeatIndex(readStoreAssignments(groupId));

        const snapshotAssignments = cloneAssignmentsRecord(
          useSeatingStore.getState().groupAssignmentsById
        );

        updateGroupAssignmentsById((prev) => {
          const next = { ...prev };
          const list = next[groupId] ?? [];
          if (!list.some((a) => a.student.id === student.id)) {
            next[groupId] = [...list, { student, seat_index: seatIndexToUse }];
          }
          return next;
        });

        setUnseatedStudents((prev: Student[]) => prev.filter(s => s.id !== student.id));
        setSelectedStudentForGroup(null);

        void persistAddStudent({
          student,
          groupId,
          seatIndex: seatIndexToUse,
          snapshotAssignments,
        });
      } catch (err) {
        console.error('Unexpected error assigning student:', err);
        alert('An unexpected error occurred. Please try again.');
      } finally {
        if (addStudentToGroupInFlightRef.current?.studentId === student.id && addStudentToGroupInFlightRef.current?.groupId === groupId) {
          addStudentToGroupInFlightRef.current = null;
        }
      }
    }, [cloneAssignmentsRecord, persistAddStudent, setUnseatedStudents, setSelectedStudentForGroup, updateGroupAssignmentsById]);

    useEffect(() => {
      const handleAddStudentToGroup = (event: CustomEvent) => {
        const { studentId, groupId } = event.detail;
        if (selectedStudentForGroup && selectedStudentForGroup.id === studentId) {
          addStudentToGroup(selectedStudentForGroup, groupId);
        }
      };

      window.addEventListener('addStudentToGroup', handleAddStudentToGroup as EventListener);
      return () => {
        window.removeEventListener('addStudentToGroup', handleAddStudentToGroup as EventListener);
      };
    }, [selectedStudentForGroup, addStudentToGroup]);

    // Listen for clear all groups event from bottom nav
    useEffect(() => {
      const handleClearAllGroups = () => {
        setIsClearAllModalOpen(true);
      };

      window.addEventListener(STUDENT_EVENTS.SEATING_CLEAR_ALL_GROUPS, handleClearAllGroups);
      return () => {
        window.removeEventListener(STUDENT_EVENTS.SEATING_CLEAR_ALL_GROUPS, handleClearAllGroups);
      };
    }, []);

    // Listen for delete all groups event from bottom nav
    useEffect(() => {
      const handleDeleteAllGroups = () => {
        setIsDeleteAllModalOpen(true);
      };

      window.addEventListener(STUDENT_EVENTS.SEATING_DELETE_ALL_GROUPS, handleDeleteAllGroups);
      return () => {
        window.removeEventListener(STUDENT_EVENTS.SEATING_DELETE_ALL_GROUPS, handleDeleteAllGroups);
      };
    }, []);

    const removeStudentFromGroup = (studentId: string, groupId: string) => {
      const list = readStoreAssignments(groupId);
      const found = list.find((a) => a.student.id === studentId);
      if (!found) return;

      const removedStudent = found.student;
      const snapshotAssignments = cloneAssignmentsRecord(
        useSeatingStore.getState().groupAssignmentsById
      );
      const snapshotUnseated = [...unseatedStudents];

      updateGroupAssignmentsById((prev) => {
        const next = { ...prev };
        const currentList = next[groupId] ?? [];
        next[groupId] = currentList.filter((a) => a.student.id !== studentId);
        return next;
      });

      setUnseatedStudents((prev: Student[]) => {
        const existingIds = new Set(prev.map((s) => s.id));
        return existingIds.has(removedStudent.id) ? prev : [...prev, removedStudent];
      });

      if (selectedStudentForGroup?.id === studentId) {
        setSelectedStudentForGroup(null);
      }

      void persistRemoveStudent({
        studentId,
        groupId,
        removedStudent,
        snapshotAssignments,
        snapshotUnseated,
      });
    };

    const handleCreateGroup = async (groupName: string, columns: number) => {
      if (!selectedLayoutId) return;

      try {
        const maxSortOrder = groups.length > 0 
          ? Math.max(...groups.map(g => g.sort_order))
          : -1;

        const initialX = 20;
        const initialY = 20;

        const defaultGroupRows = 2;

        let data;
        try {
          data = await insertSeatingGroup({
            name: groupName,
            seating_chart_id: selectedLayoutId,
            sort_order: maxSortOrder + 1,
            group_columns: columns,
            group_rows: defaultGroupRows,
            position_x: initialX,
            position_y: initialY,
          });
        } catch (insertError: unknown) {
          console.error('Error creating seating group:', insertError);
          console.error('Insert data:', {
            name: groupName,
            seating_chart_id: selectedLayoutId,
            sort_order: maxSortOrder + 1,
            group_columns: columns,
            position_x: initialX,
            position_y: initialY,
          });
          console.error('Full error details:', JSON.stringify(insertError, null, 2));
          const msg = insertError instanceof Error ? insertError.message : 'Please check the console for details.';
          alert(`Failed to create group: ${msg}`);
          return;
        }

        if (data) {
          mergeGroupPositions((prev) => ({
            ...prev,
            [data.id]: { x: initialX, y: initialY },
          }));

          await fetchGroups();
        }
      } catch (err) {
        console.error('Unexpected error creating seating group:', err);
        alert('An unexpected error occurred. Please try again.');
      }
    };

    const handleAddMultipleGroups = useCallback(async (numGroups: number) => {
      if (!selectedLayoutId) return;

      try {
        const maxSortOrder = groups.length > 0 
          ? Math.max(...groups.map(g => g.sort_order))
          : -1;

        const groupWidth = getBatchGroupWidth();

        const defaultColumns = 2;
        const defaultGroupRows = 2;

        type GroupToCreate = {
          name: string;
          seating_chart_id: string;
          sort_order: number;
          group_columns: number;
          group_rows: number;
          position_x: number;
          position_y: number;
        };
        const nextGroupNumber = groups.length + 1;
        const groupsToCreate: GroupToCreate[] = [];
        for (let i = 0; i < numGroups; i++) {
          const { x, y } = getBatchGroupPosition(groups.length + i, groupWidth);
          
          groupsToCreate.push({
            name: `Group ${nextGroupNumber + i}`,
            seating_chart_id: selectedLayoutId,
            sort_order: maxSortOrder + 1 + i,
            group_columns: defaultColumns,
            group_rows: defaultGroupRows,
            position_x: x,
            position_y: y,
          });
        }

        let insertedGroups;
        try {
          insertedGroups = await insertSeatingGroups(groupsToCreate);
        } catch (insertError: unknown) {
          console.error('Error creating multiple groups:', insertError);
          const msg = insertError instanceof Error ? insertError.message : 'Please check the console for details.';
          alert(`Failed to create groups: ${msg}`);
          return;
        }

        if (insertedGroups && insertedGroups.length > 0) {
          mergeGroupPositions((prev) => {
            const next = { ...prev };
            insertedGroups.forEach((group) => {
              const groupData = groupsToCreate.find((g) => g.name === group.name);
              if (groupData) {
                next[group.id] = { x: groupData.position_x, y: groupData.position_y };
              }
            });
            return next;
          });

          await fetchGroups({ preserveLocalPositions: true });
        }
      } catch (err) {
        console.error('Unexpected error creating multiple groups:', err);
        alert('An unexpected error occurred. Please try again.');
      }
    }, [selectedLayoutId, groups, fetchGroups, mergeGroupPositions]);

    const handleCreateLayout = async (layoutName: string) => {
      try {
        let data;
        try {
          data = await createSeatingLayout({ classId, name: layoutName });
        } catch (insertError: unknown) {
          console.error('Error creating seating chart:', insertError);
          alert('Failed to create layout. Please try again.');
          return;
        }

        if (data) {
          await fetchLayouts();
          setSelectedLayoutId(data.id);
          setIsCreateModalOpen(false);
        }
      } catch (err) {
        console.error('Unexpected error creating seating chart:', err);
        alert('An unexpected error occurred. Please try again.');
      }
    };

    // Native HTML5 drag handlers
    const handleDragStart = (e: React.DragEvent, groupId: string) => {
      // Prevent dragging if the group name is being edited
      if (editingGroupNameId === groupId) {
        e.preventDefault();
        return;
      }

      setDraggedGroupId(groupId);
      // Set drag image to be the element itself
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', groupId);
      
      // Calculate offset from where user clicked to the group's top-left corner
      if (e.currentTarget instanceof HTMLElement) {
        const groupRect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX;
        const clickY = e.clientY;
        
        // Store the offset from click position to group's top-left corner
        dragOffsetRef.current = {
          x: clickX - groupRect.left,
          y: clickY - groupRect.top
        };
        
        // Make the drag image semi-transparent
        e.currentTarget.style.opacity = '0.5';
      }
    };

    const handleDragEnd = (e: React.DragEvent) => {
      // Reset opacity
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.style.opacity = '1';
      }
      setDraggedGroupId(null);
      dragOffsetRef.current = null; // Clear drag offset
    };

    const handleDragOver = (e: React.DragEvent) => {
      // Prevent default to allow drop
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      
      if (!canvasContainerRef.current || !draggedGroupId || !dragOffsetRef.current) {
        return;
      }

      const container = canvasContainerRef.current;
      const containerRect = container.getBoundingClientRect();
      
      // Calculate where the group's top-left corner should be based on mouse position and offset
      const groupTopLeftX = e.clientX - dragOffsetRef.current.x;
      const groupTopLeftY = e.clientY - dragOffsetRef.current.y;
      
      // Get coordinates relative to the canvas container
      const relativeX = groupTopLeftX - containerRect.left;
      const relativeY = groupTopLeftY - containerRect.top;
      
      // Clamp to canvas bounds (prevent groups from going outside)
      const clampedX = Math.max(0, Math.min(relativeX, containerRect.width - GROUP_MIN_WIDTH));
      const clampedY = Math.max(0, Math.min(relativeY, containerRect.height - GROUP_MIN_HEIGHT));
      
      const group = groups.find((g) => g.id === draggedGroupId);
      const rollbackPosition = groupPositionsById[draggedGroupId] ?? {
        x: group?.position_x ?? 0,
        y: group?.position_y ?? 0,
      };

      mergeGroupPositions((prev) => ({
        ...prev,
        [draggedGroupId]: { x: clampedX, y: clampedY },
      }));

      void persistGroupPosition(
        draggedGroupId,
        { x: clampedX, y: clampedY },
        rollbackPosition
      );

      setDraggedGroupId(null);
      dragOffsetRef.current = null; // Clear drag offset
    };

    const moveStudentToGroup = (studentId: string, fromGroupId: string, toGroupId: string, targetSeatIndex?: number) => {
      const snapshotAssignments = cloneAssignmentsRecord(
        useSeatingStore.getState().groupAssignmentsById
      );

      // Same group + target slot = move to empty seat within group
      if (fromGroupId === toGroupId && targetSeatIndex != null) {
        updateGroupAssignmentsById((prev) => {
          const next = { ...prev };
          const list = (next[fromGroupId] ?? []).map((a) =>
            a.student.id === studentId ? { ...a, seat_index: targetSeatIndex } : a
          );
          next[fromGroupId] = list;
          return next;
        });
        setSelectedStudentForSwap(null);
        void persistMoveStudent({
          studentId,
          fromGroupId,
          toGroupId,
          seatIndex: targetSeatIndex,
          snapshotAssignments,
        });
        return;
      }

      if (fromGroupId === toGroupId) {
        setSelectedStudentForSwap(null);
        return;
      }

      const fromList = readStoreAssignments(fromGroupId);
      const foundFrom = fromList.find((a) => a.student.id === studentId);
      const studentToMove = foundFrom?.student;

      if (!studentToMove) {
        console.error('Student not found in source group');
        alert('Failed to move student. The student data may be out of sync.');
        setSelectedStudentForSwap(null);
        return;
      }

      const toList = readStoreAssignments(toGroupId);
      const nextSeat = targetSeatIndex != null ? targetSeatIndex : getNextSeatIndex(toList);

      updateGroupAssignmentsById((prev) => {
        const next = { ...prev };
        const src = (next[fromGroupId] ?? []).filter((a) => a.student.id !== studentId);
        const tgt = [...(next[toGroupId] ?? []), { student: studentToMove, seat_index: nextSeat }];
        next[fromGroupId] = src;
        next[toGroupId] = tgt;
        return next;
      });
      setSelectedStudentForSwap(null);
      void persistMoveStudent({
        studentId,
        fromGroupId,
        toGroupId,
        seatIndex: nextSeat,
        snapshotAssignments,
      });
    };

    const handleSlotClick = (groupId: string, seatIndex: number) => (e: React.MouseEvent) => {
      e.stopPropagation();
      if (selectedStudentForGroup) {
        addStudentToGroup(selectedStudentForGroup, groupId, seatIndex);
        return;
      }
      if (selectedStudentForSwap) {
        moveStudentToGroup(selectedStudentForSwap.studentId, selectedStudentForSwap.groupId, groupId, seatIndex);
        return;
      }
    };

    const handleExpandInColumn = (groupId: string, col: number, C: number) => (e: React.MouseEvent) => {
      e.stopPropagation();
      const nextSeat = nextSeatIndexInColumn(groupId, col, C);
      if (selectedStudentForGroup) {
        addStudentToGroup(selectedStudentForGroup, groupId, nextSeat);
        return;
      }
      if (selectedStudentForSwap) {
        moveStudentToGroup(selectedStudentForSwap.studentId, selectedStudentForSwap.groupId, groupId, nextSeat);
        return;
      }
    };

    const handleGroupClick = (groupId: string) => {
      if (selectedStudentForSwap) {
        moveStudentToGroup(selectedStudentForSwap.studentId, selectedStudentForSwap.groupId, groupId);
        return;
      }
      if (selectedStudentForGroup) {
        addStudentToGroup(selectedStudentForGroup, groupId);
      } else {
        setTargetGroupId(groupId);
      }
    };

    const handleStudentClick = (e: React.MouseEvent, studentId: string, groupId: string) => {
      e.stopPropagation(); // Prevent group click handler from firing
      e.preventDefault();
      
      // Disable clicking during randomize animation
      if (isRandomizing) {
        return;
      }
      
      if (!selectedStudentForSwap) {
        // First student selected - highlight it
        setSelectedStudentForSwap({ studentId, groupId });
      } else if (selectedStudentForSwap.studentId === studentId && selectedStudentForSwap.groupId === groupId) {
        // Clicking the same student - deselect
        setSelectedStudentForSwap(null);
      } else {
        // Second student selected - swap them
        console.log('Swapping students:', {
          student1: selectedStudentForSwap.studentId,
          group1: selectedStudentForSwap.groupId,
          student2: studentId,
          group2: groupId
        });
        swapStudents(selectedStudentForSwap.studentId, selectedStudentForSwap.groupId, studentId, groupId);
        setSelectedStudentForSwap(null);
      }
    };

    const swapStudents = (studentId1: string, groupId1: string, studentId2: string, groupId2: string) => {
      try {
        const snapshotAssignments = cloneAssignmentsRecord(
          useSeatingStore.getState().groupAssignmentsById
        );

        if (groupId1 === groupId2) {
          const assignments = groupAssignmentsById[groupId1] ?? [];
          const a1 = assignments.find((a) => a.student.id === studentId1);
          const a2 = assignments.find((a) => a.student.id === studentId2);
          if (!a1 || !a2) {
            console.error('One or both students not found in group');
            return;
          }
          const s1 = a1.seat_index;
          const s2 = a2.seat_index;
          updateGroupAssignmentsById((prev) => {
            const next = { ...prev };
            const list = (next[groupId1] ?? []).map((a) => {
              if (a.student.id === studentId1) return { ...a, seat_index: s2 };
              if (a.student.id === studentId2) return { ...a, seat_index: s1 };
              return a;
            });
            next[groupId1] = list;
            return next;
          });
          void persistSwapStudents({
            studentId1,
            groupId1,
            studentId2,
            groupId2,
            seatIndex1: s1,
            seatIndex2: s2,
            snapshotAssignments,
          });
          return;
        }

        const list1 = groupAssignmentsById[groupId1] ?? [];
        const list2 = groupAssignmentsById[groupId2] ?? [];
        const a1 = list1.find(a => a.student.id === studentId1);
        const a2 = list2.find(a => a.student.id === studentId2);

        if (!a1 || !a2) {
          console.error('Students not found in expected groups:', {
            studentId1,
            studentId2,
            groupId1,
            groupId2,
          });
          alert('Failed to swap students. The student data may be out of sync. Please refresh the page and try again.');
          return;
        }

        const seatIndex1 = a1.seat_index;
        const seatIndex2 = a2.seat_index;
        const student1 = a1.student;
        const student2 = a2.student;

        updateGroupAssignmentsById((prev) => {
          const next = { ...prev };
          const g1 = (next[groupId1] ?? []).filter((a) => a.student.id !== studentId1);
          const g2 = (next[groupId2] ?? []).filter((a) => a.student.id !== studentId2);
          next[groupId1] = [...g1, { student: student2, seat_index: seatIndex1 }];
          next[groupId2] = [...g2, { student: student1, seat_index: seatIndex2 }];
          return next;
        });

        void persistSwapStudents({
          studentId1,
          groupId1,
          studentId2,
          groupId2,
          seatIndex1,
          seatIndex2,
          snapshotAssignments,
        });
      } catch (err) {
        console.error('Unexpected error swapping students:', err);
        alert('An unexpected error occurred. Please try again.');
      }
    };

    const handleAssignSeats = useCallback(async () => {
      if (groups.length === 0) {
        alert('Please create at least one group before assigning seats.');
        return;
      }

      if (unseatedStudents.length === 0) {
        alert('No unseated students to assign.');
        return;
      }

      try {
        const currentAssignments = useSeatingStore.getState().groupAssignmentsById;
        const totalSeatedStudents = Object.values(currentAssignments).reduce(
          (sum, assignments) => sum + assignments.length,
          0
        );
        const totalStudents = totalSeatedStudents + unseatedStudents.length;
        const targetPerGroup = Math.floor(totalStudents / groups.length);
        const remainder = totalStudents % groups.length;
        const groupCurrentCounts = groups.map((group) => {
          const list = currentAssignments[group.id] ?? [];
          const maxIdx = getMaxSeatIndexFromAssignments(list);
          return { groupId: group.id, currentCount: list.length, nextSeatIndex: maxIdx + 1 };
        });
        
        // Calculate how many students each group needs to reach target
        // Groups with index < remainder should have targetPerGroup + 1, others should have targetPerGroup
        const groupTargets = groups.map((group, index) => ({
          groupId: group.id,
          target: targetPerGroup + (index < remainder ? 1 : 0)
        }));
        
        // Calculate how many more students each group needs
        const groupNeeds = groupTargets.map((target, index) => {
          const current = groupCurrentCounts[index].currentCount;
          const needed = Math.max(0, target.target - current);
          return {
            groupId: target.groupId,
            needed: needed,
            target: target.target,
            current: current
          };
        });
        
        const shuffledStudents = [...unseatedStudents].sort(() => Math.random() - 0.5);
        const nextSeatIndexByGroup = new Map<string, number>();
        groupCurrentCounts.forEach(({ groupId, nextSeatIndex }) => nextSeatIndexByGroup.set(groupId, nextSeatIndex));
        const assignments: Array<{ student_id: string; seating_group_id: string; seat_index: number }> = [];
        let studentIndex = 0;
        const sortedGroupNeeds = [...groupNeeds].sort((a, b) => b.needed - a.needed);
        for (const groupNeed of sortedGroupNeeds) {
          for (let i = 0; i < groupNeed.needed && studentIndex < shuffledStudents.length; i++) {
            const seat_index = nextSeatIndexByGroup.get(groupNeed.groupId) ?? 1;
            nextSeatIndexByGroup.set(groupNeed.groupId, seat_index + 1);
            assignments.push({
              student_id: shuffledStudents[studentIndex].id,
              seating_group_id: groupNeed.groupId,
              seat_index,
            });
            studentIndex++;
          }
        }
        
        if (assignments.length > 0) {
          try {
            await insertStudentSeatAssignments(assignments);
          } catch (insertError: unknown) {
            console.error('Error assigning seats:', insertError);
            alert('Failed to assign seats. Please try again.');
            return;
          }

          const affectedGroupIds = [...new Set(assignments.map((a) => a.seating_group_id))];
          await fetchGroups();
          await syncGroupRowsForGroupIds(affectedGroupIds);
        }
      } catch (err) {
        console.error('Unexpected error assigning seats:', err);
        alert('An unexpected error occurred. Please try again.');
      }
    }, [groups, unseatedStudents, fetchGroups, syncGroupRowsForGroupIds]);

    // Listen for add multiple groups event from bottom nav
    useEffect(() => {
      const handleAddMultipleGroupsEvent = (event: CustomEvent) => {
        const { numGroups } = event.detail;
        handleAddMultipleGroups(numGroups);
      };

      window.addEventListener(STUDENT_EVENTS.SEATING_ADD_MULTIPLE_GROUPS, handleAddMultipleGroupsEvent as EventListener);
      return () => {
        window.removeEventListener(STUDENT_EVENTS.SEATING_ADD_MULTIPLE_GROUPS, handleAddMultipleGroupsEvent as EventListener);
      };
    }, [handleAddMultipleGroups]);

    // Listen for auto assign seats event from bottom nav
    useEffect(() => {
      const handleAutoAssignSeatsEvent = () => {
        setIsAutoAssignModalOpen(true);
      };

      window.addEventListener(STUDENT_EVENTS.SEATING_AUTO_ASSIGN_SEATS, handleAutoAssignSeatsEvent);
      return () => {
        window.removeEventListener(STUDENT_EVENTS.SEATING_AUTO_ASSIGN_SEATS, handleAutoAssignSeatsEvent);
      };
    }, [handleAssignSeats]);

    const handleEditTeam = (groupId: string) => {
      const groupToEdit = groups.find(g => g.id === groupId);
      if (groupToEdit) {
        console.log('Opening edit modal for group:', groupToEdit);
        setEditingGroup(groupToEdit);
        setIsEditGroupModalOpen(true);
        setOpenSettingsMenuId(null);
      } else {
        console.error('Group not found:', groupId);
      }
    };

    const handleUpdateGroup = async (groupName: string, columns: number) => {
      if (!editingGroup) return;

      try {
        await persistGroupColumnsChange({
          groupId: editingGroup.id,
          columns,
          name: groupName,
        });
        setIsEditGroupModalOpen(false);
        setEditingGroup(null);
      } catch {
        // Error toast shown by persistence hook
      }
    };

    // Handle double-click to edit group name
    const handleDoubleClickGroupName = (groupId: string, currentName: string, e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent group click handler
      setEditingGroupNameId(groupId);
      setEditingGroupNameValue(currentName);
    };

    // Handle saving edited group name
    const handleSaveGroupName = async (groupId: string) => {
      if (!editingGroupNameValue.trim()) {
        // If empty, revert to original name
        const originalGroup = groups.find(g => g.id === groupId);
        if (originalGroup) {
          setEditingGroupNameValue(originalGroup.name);
        }
        setEditingGroupNameId(null);
        return;
      }

      try {
        try {
          await updateSeatingGroupFields(groupId, {
            name: editingGroupNameValue.trim(),
          });
        } catch (updateError: unknown) {
          console.error('Error updating group name:', updateError);
          alert('Failed to update group name. Please try again.');
          const originalGroup = groups.find(g => g.id === groupId);
          if (originalGroup) {
            setEditingGroupNameValue(originalGroup.name);
          }
          return;
        }

        updateGroups((prev) =>
          prev.map((g) =>
            g.id === groupId ? { ...g, name: editingGroupNameValue.trim() } : g
          )
        );

        setEditingGroupNameId(null);
        setEditingGroupNameValue('');
      } catch (err) {
        console.error('Unexpected error updating group name:', err);
        alert('An unexpected error occurred. Please try again.');
        // Revert to original
        const originalGroup = groups.find(g => g.id === groupId);
        if (originalGroup) {
          setEditingGroupNameValue(originalGroup.name);
        }
        setEditingGroupNameId(null);
      }
    };

    // Handle cancel editing group name
    const handleCancelEditGroupName = (groupId: string) => {
      const originalGroup = groups.find(g => g.id === groupId);
      if (originalGroup) {
        setEditingGroupNameValue(originalGroup.name);
      }
      setEditingGroupNameId(null);
    };

    const handleUpdateGroupColumns = async (groupId: string, columns: number) => {
      try {
        await persistGroupColumnsChange({ groupId, columns });
      } catch {
        // Error toast shown by persistence hook
      }
    };

    const handleClearTeam = (groupId: string) => {
      const group = groups.find(g => g.id === groupId);
      if (group) {
        setTeamToClear(group);
        setIsClearTeamModalOpen(true);
        setOpenSettingsMenuId(null);
      }
    };

    const handleClearTeamConfirmed = async () => {
      if (!teamToClear) return;

      try {
        try {
          await deleteStudentSeatAssignmentsForSeatingGroupId(teamToClear.id);
        } catch (deleteError: unknown) {
          console.error('Error clearing team:', deleteError);
          showSuccessNotification(
            'Error',
            'Failed to clear team. Please try again.'
          );
          setIsClearTeamModalOpen(false);
          setTeamToClear(null);
          return;
        }

        const studentsToUnseat = getStudentsInGroup(teamToClear.id);
        updateGroupAssignmentsById((prev) => ({
          ...prev,
          [teamToClear.id]: [],
        }));
        
        // Add students back to unseated list (filter out duplicates)
        setUnseatedStudents((prev: Student[]) => {
          const existingIds = new Set(prev.map(s => s.id));
          const newStudents = studentsToUnseat.filter(s => !existingIds.has(s.id));
          return [...prev, ...newStudents];
        });

        await syncGroupRowsForGroupIds([teamToClear.id]);
        
        showSuccessNotification(
          'Team Cleared Successfully',
          `All students have been removed from "${teamToClear.name}" and moved back to the unseated list.`
        );
        setIsClearTeamModalOpen(false);
        setTeamToClear(null);
      } catch (err) {
        console.error('Unexpected error clearing team:', err);
        showSuccessNotification(
          'Error',
          'An unexpected error occurred. Please try again.'
        );
        setIsClearTeamModalOpen(false);
        setTeamToClear(null);
      }
    };

    const handleDeleteTeam = (groupId: string) => {
      const group = groups.find(g => g.id === groupId);
      if (group) {
        setTeamToDelete(group);
        setIsDeleteTeamModalOpen(true);
        setOpenSettingsMenuId(null);
      }
    };

    const handleDeleteTeamConfirmed = async () => {
      if (!teamToDelete) return;

      try {
        try {
          await deleteTeamAssignmentsAndGroup(teamToDelete.id);
        } catch (deleteError: unknown) {
          console.error('Error deleting team:', deleteError);
          showSuccessNotification(
            'Error',
            'Failed to delete team. Please try again.'
          );
          setIsDeleteTeamModalOpen(false);
          setTeamToDelete(null);
          return;
        }

        const studentsToUnseat = getStudentsInGroup(teamToDelete.id);
        updateGroupAssignmentsById((prev) => {
          const next = { ...prev };
          delete next[teamToDelete.id];
          return next;
        });

        updateGroups((prev) => prev.filter((g) => g.id !== teamToDelete.id));
        mergeGroupPositions((prev) => {
          const next = { ...prev };
          delete next[teamToDelete.id];
          return next;
        });
        
        // Add students back to unseated list (filter out duplicates)
        setUnseatedStudents((prev: Student[]) => {
          const existingIds = new Set(prev.map(s => s.id));
          const newStudents = studentsToUnseat.filter(s => !existingIds.has(s.id));
          return [...prev, ...newStudents];
        });
        
        showSuccessNotification(
          'Team Deleted Successfully',
          `"${teamToDelete.name}" has been permanently deleted and students have been moved back to the unseated list.`
        );
        setIsDeleteTeamModalOpen(false);
        setTeamToDelete(null);
      } catch (err) {
        console.error('Unexpected error deleting team:', err);
        showSuccessNotification(
          'Error',
          'An unexpected error occurred. Please try again.'
        );
        setIsDeleteTeamModalOpen(false);
        setTeamToDelete(null);
      }
    };

    const handleRandomizeConfirmed = useCallback(async () => {
      if (isRandomizing) return;
      setIsRandomizeModalOpen(false);
      await handleRandomizeSeating();
    }, [isRandomizing, handleRandomizeSeating]);

    const handleAutoAssignConfirmed = useCallback(async () => {
      setIsAutoAssignModalOpen(false);
      await handleAssignSeats();
    }, [handleAssignSeats]);

    const handleClearAllGroups = () => {
      setIsClearAllModalOpen(true);
    };

    const handleClearAllConfirmed = async () => {
      if (!selectedLayoutId) {
        showSuccessNotification(
          'No Layout Selected',
          'Please select a layout before clearing groups.'
        );
        setIsClearAllModalOpen(false);
        return;
      }

      try {
        const groupIds = groups.map(g => g.id);
        
        if (groupIds.length === 0) {
          showSuccessNotification(
            'No Groups to Clear',
            'There are no groups in the selected layout to clear.'
          );
          setIsClearAllModalOpen(false);
          return;
        }

        const hasError = await deleteAssignmentsForGroupsSequential(groupIds);

        if (hasError) {
          showSuccessNotification(
            'Error Clearing Groups',
            'Some errors occurred while clearing groups. Please check the console for details.'
          );
          setIsClearAllModalOpen(false);
          return;
        }

        const allStudentsToUnseat: Student[] = [];
        for (const assignments of Object.values(groupAssignmentsById)) {
          assignments.forEach((a) => allStudentsToUnseat.push(a.student));
        }
        updateGroupAssignmentsById((prev) => {
          const next = { ...prev };
          groupIds.forEach((groupId) => {
            next[groupId] = [];
          });
          return next;
        });

        // Add all students back to unseated list (filter out duplicates)
        setUnseatedStudents((prev: Student[]) => {
          const existingIds = new Set(prev.map(s => s.id));
          const newStudents = allStudentsToUnseat.filter(s => !existingIds.has(s.id));
          return [...prev, ...newStudents];
        });

        await syncGroupRowsForGroupIds(groupIds);

        showSuccessNotification(
          'Groups Cleared Successfully',
          'All students have been removed from all groups and moved back to the unseated list.'
        );
        setIsClearAllModalOpen(false);
      } catch (err) {
        console.error('Unexpected error clearing all groups:', err);
        showSuccessNotification(
          'Error',
          'An unexpected error occurred. Please try again.'
        );
        setIsClearAllModalOpen(false);
      }
    };

    const handleDeleteAllGroups = () => {
      setIsDeleteAllModalOpen(true);
    };

    const handleDeleteAllConfirmed = async () => {
      if (!selectedLayoutId) {
        showSuccessNotification(
          'No Layout Selected',
          'Please select a layout before deleting groups.'
        );
        setIsDeleteAllModalOpen(false);
        return;
      }

      try {
        const groupIds = groups.map(g => g.id);
        
        if (groupIds.length === 0) {
          showSuccessNotification(
            'No Groups to Delete',
            'There are no groups in the selected layout to delete.'
          );
          setIsDeleteAllModalOpen(false);
          return;
        }

        const hasAssignmentError = await deleteAssignmentsForGroupsSequential(groupIds);

        if (hasAssignmentError) {
          showSuccessNotification(
            'Error Deleting Assignments',
            'Some errors occurred while deleting student assignments. Please check the console for details.'
          );
          setIsDeleteAllModalOpen(false);
          return;
        }

        const hasGroupError = await deleteSeatingGroupsSequential(groupIds);

        if (hasGroupError) {
          showSuccessNotification(
            'Error Deleting Groups',
            'Some errors occurred while deleting groups. Please check the console for details.'
          );
          setIsDeleteAllModalOpen(false);
          return;
        }

        const allStudentsToUnseat: Student[] = [];
        for (const assignments of Object.values(groupAssignmentsById)) {
          assignments.forEach((a) => allStudentsToUnseat.push(a.student));
        }
        setGroups([]);
        setGroupAssignmentsById({});
        useSeatingStore.getState().setGroupPositionsById({});

        // Add all students back to unseated list (filter out duplicates)
        setUnseatedStudents((prev: Student[]) => {
          const existingIds = new Set(prev.map(s => s.id));
          const newStudents = allStudentsToUnseat.filter(s => !existingIds.has(s.id));
          return [...prev, ...newStudents];
        });

        showSuccessNotification(
          'Groups Deleted Successfully',
          'All groups have been permanently deleted and students have been moved back to the unseated list.'
        );
        setIsDeleteAllModalOpen(false);
      } catch (err) {
        console.error('Unexpected error deleting all groups:', err);
        showSuccessNotification(
          'Error',
          'An unexpected error occurred. Please try again.'
        );
        setIsDeleteAllModalOpen(false);
      }
    };

  return {
    GROUP_EXPAND_ROW_HEIGHT,
    classId,
    selectedLayoutId,
    setSelectedLayoutId,
    selectedStudentForGroup,
    setSelectedStudentForGroup,
    setUnseatedStudents,
    unseatedStudents,
    searchParams,
    router,
    pathname,
    layouts,
    setLayouts,
    isLoading,
    setIsLoading,
    error,
    setError,
    groups,
    setGroups,
    isLoadingGroups,
    setGroupsLoading,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditGroupModalOpen,
    setIsEditGroupModalOpen,
    isClearAllModalOpen,
    setIsClearAllModalOpen,
    isDeleteAllModalOpen,
    setIsDeleteAllModalOpen,
    isClearTeamModalOpen,
    setIsClearTeamModalOpen,
    isDeleteTeamModalOpen,
    setIsDeleteTeamModalOpen,
    isRandomizeModalOpen,
    setIsRandomizeModalOpen,
    isAutoAssignModalOpen,
    setIsAutoAssignModalOpen,
    handleRandomizeConfirmed,
    handleAutoAssignConfirmed,
    teamToClear,
    setTeamToClear,
    teamToDelete,
    setTeamToDelete,
    successNotification,
    setSuccessNotification,
    isSavingAllChanges,
    setIsSavingAllChanges,
    editingGroup,
    setEditingGroup,
    groupAssignmentsById,
    setGroupAssignmentsById,
    updateGroupAssignmentsById,
    handleCloseRef,
    addStudentToGroupInFlightRef,
    saveAllChangesInFlightRef,
    targetGroupId,
    setTargetGroupId,
    getAssignmentsInGroup,
    getStudentsInGroup,
    studentAtSlot,
    maxSeatIndex,
    maxSeatIndexInColumn,
    nextSeatIndexInColumn,
    openSettingsMenuId,
    setOpenSettingsMenuId,
    selectedStudentForSwap,
    setSelectedStudentForSwap,
    editingGroupNameId,
    setEditingGroupNameId,
    editingGroupNameValue,
    setEditingGroupNameValue,
    groupPositionsById,
    mergeGroupPositions,
    updateGroups,
    canvasContainerRef,
    draggedGroupId,
    setDraggedGroupId,
    showSuccessNotification,
    handleClose,
    dragOffsetRef,
    isRandomizing,
    setIsRandomizing,
    studentsAboutToMove,
    setStudentsAboutToMove,
    studentsBeingPlaced,
    setStudentsBeingPlaced,
    fetchLayouts,
    fetchGroups,
    computeGroupRows,
    repairSeatingLayoutFromStore,
    handleRandomizeSeating,
    addStudentToGroup,
    removeStudentFromGroup,
    handleCreateGroup,
    handleAddMultipleGroups,
    handleCreateLayout,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    moveStudentToGroup,
    handleSlotClick,
    handleExpandInColumn,
    handleGroupClick,
    handleStudentClick,
    swapStudents,
    handleAssignSeats,
    handleEditTeam,
    handleUpdateGroup,
    handleDoubleClickGroupName,
    handleSaveGroupName,
    handleCancelEditGroupName,
    handleUpdateGroupColumns,
    handleClearTeam,
    handleClearTeamConfirmed,
    handleDeleteTeam,
    handleDeleteTeamConfirmed,
    handleClearAllGroups,
    handleClearAllConfirmed,
    handleDeleteAllGroups,
    handleDeleteAllConfirmed,
    getSlotIndex,
    getGroupRenderLayout,
    getDefaultStaggerPosition,
  };
}
