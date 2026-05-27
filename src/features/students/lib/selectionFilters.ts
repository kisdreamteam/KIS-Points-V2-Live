import type { Student } from '@/lib/types';

export function getPresentStudentIdsByGender(
  students: Student[],
  absentStudentIds: string[],
  gender: 'Boy' | 'Girl'
): string[] {
  return students
    .filter((s) => s.gender === gender && !absentStudentIds.includes(s.id))
    .map((s) => s.id);
}
