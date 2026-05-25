import { createClient } from '@/lib/client';
import type { Student } from '@/lib/types';
import { throwApiError } from '@/lib/api/_shared/errors';

export async function listStudentsByClassId(classId: string): Promise<Student[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('students')
    .select(
      `
        id,
        first_name,
        last_name,
        points,
        avatar,
        student_number,
        gender,
        class_id
      `
    )
    .eq('class_id', classId)
    .eq('is_archived', false)
    .order('last_name', { ascending: true });

  if (error) throwApiError(error, 'listStudentsByClassId');

  return (data || []) as Student[];
}

export async function listStudentsForRandomByClassId(classId: string): Promise<Student[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('students')
    .select('id, first_name, last_name, points, class_id, student_number, gender, avatar, has_been_picked')
    .eq('class_id', classId)
    .eq('is_archived', false)
    .order('last_name', { ascending: true });

  if (error) throwApiError(error, 'listStudentsForRandomByClassId');

  return (data || []) as Student[];
}

export async function updateStudentPickedState(studentId: string, picked: boolean): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('students')
    .update({ has_been_picked: picked })
    .eq('id', studentId);

  if (error) throwApiError(error, 'updateStudentPickedState');
}

export async function resetPickedStudentsByClassId(classId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('students')
    .update({ has_been_picked: false })
    .eq('class_id', classId);

  if (error) throwApiError(error, 'resetPickedStudentsByClassId');
}

export async function getStudentCountByClassId(classId: string): Promise<number> {
  const supabase = createClient();
  const { count, error } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('class_id', classId);
  if (error) throwApiError(error, 'getStudentCountByClassId');
  return count || 0;
}

/** Next display number: MAX(student_number) + 1 for the class (all rows, including archived). Empty / all null → 1. */
export async function getNextStartingStudentNumber(classId: string): Promise<number> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('students')
    .select('student_number')
    .eq('class_id', classId)
    .not('student_number', 'is', null)
    .order('student_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throwApiError(error, 'getNextStartingStudentNumber');

  const max = data?.student_number;
  if (max === null || max === undefined || typeof max !== 'number') {
    return 1;
  }
  return max + 1;
}

export async function createStudent(studentData: {
  first_name: string;
  last_name: string;
  class_id: string;
  avatar: string;
  gender?: string | null;
}): Promise<void> {
  const supabase = createClient();
  const student_number = await getNextStartingStudentNumber(studentData.class_id);
  const { error } = await supabase.from('students').insert({ ...studentData, student_number });
  if (error) throwApiError(error, 'createStudent');
}

export async function createStudentsBulk(
  studentsData: Array<{
    first_name: string;
    last_name: string;
    class_id: string;
    avatar: string;
  }>
): Promise<void> {
  if (studentsData.length === 0) return;

  const classId = studentsData[0].class_id;
  if (!studentsData.every((r) => r.class_id === classId)) {
    throw new Error('createStudentsBulk: all rows must share the same class_id');
  }

  let n = await getNextStartingStudentNumber(classId);
  const rows = studentsData.map((row) => ({
    ...row,
    student_number: n++,
  }));

  const supabase = createClient();
  const { error } = await supabase.from('students').insert(rows);
  if (error) throwApiError(error, 'createStudentsBulk');
}

export async function updateStudent(
  studentId: string,
  patch: {
    first_name: string;
    last_name: string | null;
    student_number: number | null;
    gender: string | null;
    avatar?: string;
  }
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('students')
    .update(patch)
    .eq('id', studentId);
  if (error) throwApiError(error, 'updateStudent');
}

export async function bulkUpdateStudents(
  updates: Array<{
    id: string;
    first_name: string;
    last_name: string | null;
    student_number: number | null;
    gender: string | null;
  }>
): Promise<void> {
  const supabase = createClient();
  await Promise.all(
    updates.map(async (student) => {
      const { error } = await supabase
        .from('students')
        .update({
          first_name: student.first_name,
          last_name: student.last_name,
          student_number: student.student_number,
          gender: student.gender,
        })
        .eq('id', student.id);
      if (error) throwApiError(error, 'bulkUpdateStudents');
    })
  );
}

export async function listStudentIdsByClassId(classId: string): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('students')
    .select('id')
    .eq('class_id', classId)
    .eq('is_archived', false);
  if (error) throwApiError(error, 'listStudentIdsByClassId');
  return (data || []).map((s: { id: string }) => s.id);
}

export async function archiveStudentById(studentId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('students')
    .update({ is_archived: true })
    .eq('id', studentId);
  if (error) throwApiError(error, 'archiveStudentById');
}

export async function deleteCustomPointEventsByStudentIds(studentIds: string[]): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('custom_point_events')
    .delete()
    .in('student_id', studentIds);
  if (error) throwApiError(error, 'deleteCustomPointEventsByStudentIds');
}

export async function resetPointsByStudentIds(studentIds: string[]): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('students')
    .update({ points: 0 })
    .in('id', studentIds);
  if (error) throwApiError(error, 'resetPointsByStudentIds');
}

// Legacy aliases for backwards compatibility.
export const fetchStudentsByClassId = listStudentsByClassId;
export const fetchStudentsForRandomByClassId = listStudentsForRandomByClassId;
export const markStudentAsPicked = (studentId: string) => updateStudentPickedState(studentId, true);
export const countStudentsByClassId = getStudentCountByClassId;
export const insertStudent = createStudent;
export const insertStudentsBulk = createStudentsBulk;
export const updateStudentById = updateStudent;
export const fetchStudentIdsByClassIdForReset = listStudentIdsByClassId;
