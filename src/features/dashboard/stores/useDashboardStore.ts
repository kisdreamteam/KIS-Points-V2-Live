import { create } from 'zustand';
import type { ClassRecord } from '@/features/classes/lib/api/classes';
import type { Student } from '@/lib/types';

export type DashboardSetStudents = Student[] | ((prev: Student[]) => Student[]);

interface DashboardStore {
  activeClassId: string | null;
  /** Full list from `listAccessibleClassesForUser` (unfiltered). */
  allAccessibleClasses: ClassRecord[];
  /** Filtered by dashboard viewMode (active vs archived). */
  classes: ClassRecord[];
  students: Student[];
  absentStudentIds: string[];
  isLoadingStudents: boolean;
  isLoadingClasses: boolean;
  setActiveClassId: (id: string | null) => void;
  setAllAccessibleClasses: (classes: ClassRecord[]) => void;
  setClasses: (classes: ClassRecord[]) => void;
  setStudents: (next: DashboardSetStudents) => void;
  setAbsentStudentIds: (ids: string[]) => void;
  setLoadingStudents: (v: boolean) => void;
  setLoadingClasses: (v: boolean) => void;
  updateStudent: (studentId: string, patch: Partial<Student>) => void;
  applyPointsDelta: (studentIds: string[], delta: number) => void;
  /** Absolute point totals from realtime/cross-tab sync — one store write for N students. */
  applyStudentPointsUpdates: (updates: { studentId: string; points: number }[]) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  activeClassId: null,
  allAccessibleClasses: [],
  classes: [],
  students: [],
  absentStudentIds: [],
  isLoadingStudents: false,
  isLoadingClasses: true,
  setActiveClassId: (id) => set({ activeClassId: id }),
  setAllAccessibleClasses: (allAccessibleClasses) => set({ allAccessibleClasses }),
  setClasses: (data) => set({ classes: data }),
  setStudents: (next) =>
    set((state) => ({
      students: typeof next === 'function' ? (next as (prev: Student[]) => Student[])(state.students) : next,
    })),
  setAbsentStudentIds: (ids) => set({ absentStudentIds: ids }),
  setLoadingStudents: (v) => set({ isLoadingStudents: v }),
  setLoadingClasses: (v) => set({ isLoadingClasses: v }),
  updateStudent: (studentId, patch) =>
    set((state) => ({
      students: state.students.map((s) => (s.id === studentId ? { ...s, ...patch } : s)),
    })),
  applyPointsDelta: (studentIds, delta) =>
    set((state) => {
      const idSet = new Set(studentIds);
      let touched = false;
      const students = state.students.map((s) => {
        if (!idSet.has(s.id)) return s;
        touched = true;
        return { ...s, points: (s.points ?? 0) + delta };
      });
      return touched ? { students } : {};
    }),
  applyStudentPointsUpdates: (updates) =>
    set((state) => {
      if (updates.length === 0) return {};
      const pointsById = new Map(updates.map((u) => [u.studentId, u.points]));
      let touched = false;
      const students = state.students.map((s) => {
        const nextPoints = pointsById.get(s.id);
        if (nextPoints === undefined || (s.points ?? 0) === nextPoints) return s;
        touched = true;
        return { ...s, points: nextPoints };
      });
      return touched ? { students } : {};
    }),
}));
