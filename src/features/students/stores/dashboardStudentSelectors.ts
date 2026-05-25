import type { SortOption } from '@/stores/usePreferenceStore';
import type { Student } from '@/lib/types';

function sortStudentsCopy(students: Student[], sortBy: SortOption): Student[] {
  const studentsCopy = [...students];

  if (sortBy === 'number') {
    return studentsCopy.sort((a, b) => {
      if (a.student_number === null && b.student_number === null) return 0;
      if (a.student_number === null) return 1;
      if (b.student_number === null) return -1;
      return a.student_number - b.student_number;
    });
  }

  if (sortBy === 'points') {
    return studentsCopy.sort((a, b) => {
      const pointsA = a.points || 0;
      const pointsB = b.points || 0;
      if (pointsA !== pointsB) {
        return pointsB - pointsA;
      }
      const lastNameCompare = (a.last_name || '').localeCompare(b.last_name || '');
      if (lastNameCompare !== 0) return lastNameCompare;
      return (a.first_name || '').localeCompare(b.first_name || '');
    });
  }

  if (sortBy === 'alphabetical') {
    return studentsCopy.sort((a, b) => {
      const firstNameCompare = (a.first_name || '').localeCompare(b.first_name || '');
      if (firstNameCompare !== 0) return firstNameCompare;
      return (a.last_name || '').localeCompare(b.last_name || '');
    });
  }

  return studentsCopy;
}

/** Zustand selector: ordered student ids for the grid (use with `useShallow`). */
export function selectOrderedStudentIds(sortBy: SortOption) {
  return (state: { students: Student[] }): string[] => {
    const sorted = sortStudentsCopy(state.students, sortBy);
    return sorted.map((s) => s.id);
  };
}

export function selectTotalClassPoints(state: { students: Student[] }): number {
  return state.students.reduce((total, student) => total + (student.points || 0), 0);
}
