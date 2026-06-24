import type { Student } from '@/lib/types';

export type PickerPool = 'all' | 'boys' | 'girls';
export type PickCount = number;

export const MAX_PICK_COUNT = 20;

function isPresent(student: Student, absentIds: string[]): boolean {
  return !absentIds.includes(student.id);
}

function isUnpicked(student: Student): boolean {
  return student.has_been_picked !== true;
}

function matchesPool(student: Student, pool: PickerPool): boolean {
  if (pool === 'all') return true;
  if (pool === 'boys') return student.gender === 'Boy';
  if (pool === 'girls') return student.gender === 'Girl';
  return false;
}

export function getEligiblePool(
  students: Student[],
  opts: {
    pool: PickerPool;
    absentIds: string[];
    excludeIds?: Set<string>;
    requireUnpicked?: boolean;
  }
): Student[] {
  const { pool, absentIds, excludeIds, requireUnpicked = true } = opts;

  return students.filter((student) => {
    if (!isPresent(student, absentIds)) return false;
    if (requireUnpicked && !isUnpicked(student)) return false;
    if (excludeIds?.has(student.id)) return false;
    if (!matchesPool(student, pool)) return false;
    return true;
  });
}

export function pickRandomStudent(pool: Student[]): Student | null {
  if (pool.length === 0) return null;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index] ?? null;
}

export function countPoolByType(
  students: Student[],
  absentIds: string[]
): { all: number; boys: number; girls: number } {
  return {
    all: getEligiblePool(students, { pool: 'all', absentIds }).length,
    boys: getEligiblePool(students, { pool: 'boys', absentIds }).length,
    girls: getEligiblePool(students, { pool: 'girls', absentIds }).length,
  };
}

export function getPresentPoolStudents(
  students: Student[],
  pool: PickerPool,
  absentIds: string[]
): Student[] {
  return students.filter((student) => {
    if (!isPresent(student, absentIds)) return false;
    if (!matchesPool(student, pool)) return false;
    return true;
  });
}

export function getPoolPickStats(
  students: Student[],
  pool: PickerPool,
  absentIds: string[]
): { picked: number; total: number } {
  const presentPool = getPresentPoolStudents(students, pool, absentIds);
  const picked = presentPool.filter((student) => student.has_been_picked === true).length;
  return { picked, total: presentPool.length };
}

export function getPoolPickedLabel(pool: PickerPool): 'students' | 'boys' | 'girls' {
  if (pool === 'boys') return 'boys';
  if (pool === 'girls') return 'girls';
  return 'students';
}

export function getMaxPickCount(poolSize: number): PickCount {
  if (poolSize <= 0) return 1;
  return Math.min(MAX_PICK_COUNT, poolSize);
}

export function clampPickCount(pickCount: PickCount, poolSize: number): PickCount {
  const max = getMaxPickCount(poolSize);
  return Math.min(Math.max(1, pickCount), max);
}
