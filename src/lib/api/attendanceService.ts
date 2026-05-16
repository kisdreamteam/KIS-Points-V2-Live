import { createClient } from '@/lib/client';
import { throwApiError } from '@/lib/api/_shared/errors';

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export async function logAbsence(
  studentId: string,
  classId: string,
  teacherId: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('attendance_events').insert({
    student_id: studentId,
    class_id: classId,
    teacher_id: teacherId,
    date: getTodayDateString(),
  });

  if (error) throwApiError(error, 'logAbsence');
}

export async function removeAbsence(studentId: string): Promise<void> {
  const supabase = createClient();
  const today = getTodayDateString();
  const { error } = await supabase
    .from('attendance_events')
    .delete()
    .eq('student_id', studentId)
    .eq('date', today);

  if (error) throwApiError(error, 'removeAbsence');
}

export async function fetchDailyAbsences(classId: string): Promise<string[]> {
  const supabase = createClient();
  const today = getTodayDateString();
  const { data, error } = await supabase
    .from('attendance_events')
    .select('student_id')
    .eq('class_id', classId)
    .eq('date', today);

  if (error) throwApiError(error, 'fetchDailyAbsences');

  return (data ?? []).map((row) => row.student_id);
}
