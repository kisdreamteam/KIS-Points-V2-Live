import type { MouseEvent } from 'react';
import { create } from 'zustand';
import type { Student } from '@/lib/types';
import type { GroupAssignment, SeatingChartRecord, SeatingGroupRecord } from '@/features/seating/lib/api/seating';
import { STUDENT_EVENTS, type SeatingStudentPointsDeltaDetail } from '@/lib/events/students';

export type UnseatedSet = Student[] | ((prev: Student[]) => Student[]);
export type SelectedForGroupSet = Student | null | ((prev: Student | null) => Student | null);

export type SeatingLayoutNavHandlers = {
  onSelectLayout: (layoutId: string) => void;
  onAddLayout: () => void;
  onEditLayout: (layoutId: string, layoutName: string, e: MouseEvent) => void;
  onDeleteLayout: (layoutId: string, layoutName: string, e: MouseEvent) => void;
};

interface SeatingStore {
  layouts: SeatingChartRecord[];
  isLoadingLayouts: boolean;
  layoutsError: string | null;
  selectedLayoutId: string | null;
  layoutNavHandlers: SeatingLayoutNavHandlers | null;
  groups: SeatingGroupRecord[];
  isLoadingGroups: boolean;
  groupAssignmentsById: Record<string, GroupAssignment[]>;
  groupPositionsById: Record<string, { x: number; y: number }>;
  showGrid: boolean;
  showObjects: boolean;
  layoutOrientation: string;
  colorByGender: boolean;
  unseatedStudents: Student[];
  selectedStudentForGroup: Student | null;
  setLayouts: (layouts: SeatingChartRecord[]) => void;
  setLayoutLoading: (v: boolean) => void;
  setLayoutsError: (e: string | null) => void;
  setSelectedLayoutId: (id: string | null) => void;
  setLayoutNavHandlers: (handlers: SeatingLayoutNavHandlers | null) => void;
  setGroupsLoading: (v: boolean) => void;
  setGroups: (groups: SeatingGroupRecord[]) => void;
  setGroupAssignmentsById: (next: Record<string, GroupAssignment[]>) => void;
  setGroupPositionsById: (next: Record<string, { x: number; y: number }>) => void;
  mergeGroupPositions: (
    updater: (prev: Record<string, { x: number; y: number }>) => Record<string, { x: number; y: number }>
  ) => void;
  applyLayoutViewSettings: (data: {
    show_grid?: boolean | null;
    show_objects?: boolean | null;
    layout_orientation?: string | null;
    color_by_gender?: boolean | null;
  }) => void;
  syncLayoutViewSettings: (
    layoutId: string,
    patch: {
      show_grid?: boolean | null;
      show_objects?: boolean | null;
      layout_orientation?: string | null;
      color_by_gender?: boolean | null;
    }
  ) => void;
  setUnseatedStudents: (next: UnseatedSet) => void;
  setSelectedStudentForGroup: (next: SelectedForGroupSet) => void;
  addStudentToGroup: (studentId: string, groupId: string) => void;
  resetForClassSwitch: () => void;
  patchGroupAssignmentsForPointsDelta: (studentIds: string[], delta: number) => void;
  syncGroupAssignmentStudentPoints: (updates: { studentId: string; points: number }[]) => void;
  removeStudentFromSeatingState: (studentId: string) => void;
}

const initialViewSettings = {
  showGrid: true,
  showObjects: true,
  layoutOrientation: 'Left' as string,
  colorByGender: true,
};

export const useSeatingStore = create<SeatingStore>((set, get) => ({
  layouts: [],
  isLoadingLayouts: false,
  layoutsError: null,
  selectedLayoutId: null,
  layoutNavHandlers: null,
  groups: [],
  isLoadingGroups: false,
  groupAssignmentsById: {},
  groupPositionsById: {},
  ...initialViewSettings,
  unseatedStudents: [],
  selectedStudentForGroup: null,

  setLayouts: (layouts) => set({ layouts }),
  setLayoutLoading: (isLoadingLayouts) => set({ isLoadingLayouts }),
  setLayoutsError: (layoutsError) => set({ layoutsError }),
  setSelectedLayoutId: (selectedLayoutId) => set({ selectedLayoutId }),
  setLayoutNavHandlers: (layoutNavHandlers) => set({ layoutNavHandlers }),
  setGroupsLoading: (isLoadingGroups) => set({ isLoadingGroups }),
  setGroups: (groups) => set({ groups }),
  setGroupAssignmentsById: (groupAssignmentsById) => set({ groupAssignmentsById }),
  setGroupPositionsById: (groupPositionsById) => set({ groupPositionsById }),
  mergeGroupPositions: (updater) =>
    set((s) => ({ groupPositionsById: updater(s.groupPositionsById) })),

  applyLayoutViewSettings: (data) =>
    set({
      showGrid: data.show_grid ?? true,
      showObjects: data.show_objects ?? true,
      layoutOrientation: data.layout_orientation ?? 'Left',
      colorByGender: data.color_by_gender ?? true,
    }),

  syncLayoutViewSettings: (layoutId, patch) =>
    set((s) => {
      const nextLayouts = s.layouts.map((layout) => {
        if (layout.id !== layoutId) return layout;
        return {
          ...layout,
          ...(patch.show_grid !== undefined ? { show_grid: patch.show_grid ?? undefined } : {}),
          ...(patch.show_objects !== undefined ? { show_objects: patch.show_objects ?? undefined } : {}),
          ...(patch.layout_orientation !== undefined
            ? { layout_orientation: patch.layout_orientation ?? undefined }
            : {}),
          ...(patch.color_by_gender !== undefined
            ? { color_by_gender: patch.color_by_gender ?? undefined }
            : {}),
        };
      });

      if (s.selectedLayoutId !== layoutId) {
        return { layouts: nextLayouts };
      }

      return {
        layouts: nextLayouts,
        showGrid: patch.show_grid !== undefined ? (patch.show_grid ?? true) : s.showGrid,
        showObjects: patch.show_objects !== undefined ? (patch.show_objects ?? true) : s.showObjects,
        layoutOrientation:
          patch.layout_orientation !== undefined ? (patch.layout_orientation ?? 'Left') : s.layoutOrientation,
        colorByGender:
          patch.color_by_gender !== undefined ? (patch.color_by_gender ?? true) : s.colorByGender,
      };
    }),

  setUnseatedStudents: (next) =>
    set((s) => ({
      unseatedStudents: typeof next === 'function' ? (next as (p: Student[]) => Student[])(s.unseatedStudents) : next,
    })),

  setSelectedStudentForGroup: (next) =>
    set((s) => ({
      selectedStudentForGroup:
        typeof next === 'function'
          ? (next as (p: Student | null) => Student | null)(s.selectedStudentForGroup)
          : next,
    })),

  addStudentToGroup: (studentId, groupId) => {
    get().setUnseatedStudents((prev) => prev.filter((st) => st.id !== studentId));
    get().setSelectedStudentForGroup(null);
    window.dispatchEvent(new CustomEvent('addStudentToGroup', { detail: { studentId, groupId } }));
  },

  resetForClassSwitch: () =>
    set({
      groups: [],
      groupAssignmentsById: {},
      groupPositionsById: {},
      layoutsError: null,
      isLoadingGroups: false,
      selectedLayoutId: null,
      layoutNavHandlers: null,
      unseatedStudents: [],
      selectedStudentForGroup: null,
      ...initialViewSettings,
    }),

  patchGroupAssignmentsForPointsDelta: (studentIds, delta) => {
    if (studentIds.length === 0 || delta === 0 || !Number.isFinite(delta)) return;
    const idSet = new Set(studentIds);
    set((s) => {
      const nextAssignments: Record<string, GroupAssignment[]> = {};
      let touched = false;
      for (const [gid, list] of Object.entries(s.groupAssignmentsById)) {
        nextAssignments[gid] = list.map((ga) => {
          if (!idSet.has(ga.student.id)) return ga;
          touched = true;
          return {
            ...ga,
            student: {
              ...ga.student,
              points: (ga.student.points ?? 0) + delta,
            },
          };
        });
      }
      return touched ? { groupAssignmentsById: nextAssignments } : {};
    });
  },

  syncGroupAssignmentStudentPoints: (updates) => {
    if (updates.length === 0) return;
    const pointsByStudentId = new Map(updates.map((u) => [u.studentId, u.points]));
    set((s) => {
      const nextAssignments: Record<string, GroupAssignment[]> = {};
      let touched = false;
      for (const [gid, list] of Object.entries(s.groupAssignmentsById)) {
        nextAssignments[gid] = list.map((ga) => {
          const nextPoints = pointsByStudentId.get(ga.student.id);
          if (nextPoints === undefined || (ga.student.points ?? 0) === nextPoints) return ga;
          touched = true;
          return {
            ...ga,
            student: {
              ...ga.student,
              points: nextPoints,
            },
          };
        });
      }
      return touched ? { groupAssignmentsById: nextAssignments } : {};
    });
  },

  removeStudentFromSeatingState: (studentId) => {
    set((s) => {
      const nextAssignments: Record<string, GroupAssignment[]> = {};
      let assignmentsTouched = false;
      for (const [gid, list] of Object.entries(s.groupAssignmentsById)) {
        const filtered = list.filter((ga) => ga.student.id !== studentId);
        if (filtered.length !== list.length) assignmentsTouched = true;
        nextAssignments[gid] = filtered;
      }
      const nextUnseated = s.unseatedStudents.filter((st) => st.id !== studentId);
      const unseatedTouched = nextUnseated.length !== s.unseatedStudents.length;
      const clearSelection = s.selectedStudentForGroup?.id === studentId;

      if (!assignmentsTouched && !unseatedTouched && !clearSelection) {
        return {};
      }

      return {
        ...(assignmentsTouched ? { groupAssignmentsById: nextAssignments } : {}),
        ...(unseatedTouched ? { unseatedStudents: nextUnseated } : {}),
        ...(clearSelection ? { selectedStudentForGroup: null } : {}),
      };
    });
  },
}));

export function subscribeSeatingPointsDeltaForClass(classId: string): () => void {
  const handler = (e: Event) => {
    const d = (e as CustomEvent<SeatingStudentPointsDeltaDetail>).detail;
    if (!d || d.classId !== classId) return;
    useSeatingStore.getState().patchGroupAssignmentsForPointsDelta(d.studentIds, d.delta);
  };
  window.addEventListener(STUDENT_EVENTS.SEATING_STUDENT_POINTS_DELTA, handler as EventListener);
  return () => window.removeEventListener(STUDENT_EVENTS.SEATING_STUDENT_POINTS_DELTA, handler as EventListener);
}
