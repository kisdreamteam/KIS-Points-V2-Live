import { createClient } from '@/lib/client';
import type { Student } from '@/lib/types';
import { getOptionalSessionUserId, getRequiredSessionUserId } from '@/lib/api/_shared/auth';
import { throwApiError } from '@/lib/api/_shared/errors';

export type ClassRecord = {
  id: string;
  name: string;
  grade: string;
  school_year: string;
  teacher_id: string;
  is_archived: boolean;
  created_at: string;
  icon?: string;
  is_owner?: boolean;
};

function isMissingListAccessibleClassesRpc(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const msg = (error.message || '').toLowerCase();
  return (
    error.code === 'PGRST202' ||
    error.code === '42883' ||
    msg.includes('could not find the function') ||
    msg.includes('schema cache')
  );
}

export async function listAccessibleClassesForUser(userId: string): Promise<ClassRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('list_accessible_classes');
  let rows: ClassRecord[] = [];

  if (error) {
    if (!isMissingListAccessibleClassesRpc(error)) {
      console.warn('list_accessible_classes failed, falling back:', error.message);
    }
    const { data: ownerRows, error: ownerError } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', userId)
      .order('is_archived', { ascending: true })
      .order('created_at', { ascending: false });

    if (ownerError) throwApiError(ownerError, 'listAccessibleClassesForUser.fallbackOwnerRows');

    rows = (ownerRows || []).map((r) => ({ ...r, is_owner: true }));
  } else {
    rows = (data || []) as ClassRecord[];
  }

  return [...rows].sort((a, b) => {
    if (a.is_archived !== b.is_archived) return a.is_archived ? 1 : -1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export async function getStudentCountsByClassIds(
  classIds: string[]
): Promise<Record<string, number>> {
  if (classIds.length === 0) return {};

  const supabase = createClient();
  const { data: students, error } = await supabase
    .from('students')
    .select('class_id')
    .in('class_id', classIds);

  if (error) throwApiError(error, 'getStudentCountsByClassIds');

  const countsMap: Record<string, number> = {};
  classIds.forEach((classId) => {
    countsMap[classId] = 0;
  });

  students?.forEach((student) => {
    if (student.class_id && countsMap[student.class_id] !== undefined) {
      countsMap[student.class_id]++;
    }
  });

  return countsMap;
}

export async function archiveClass(classId: string, archived: boolean): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('classes')
    .update({ is_archived: archived })
    .eq('id', classId);

  if (error) throwApiError(error, 'archiveClass');
}

export async function deleteClassPermanently(classId: string): Promise<void> {
  const supabase = createClient();

  const { error: studentsError } = await supabase
    .from('students')
    .delete()
    .eq('class_id', classId);

  if (studentsError) throwApiError(studentsError, 'deleteClassPermanently.deleteStudents');

  const { error: classError } = await supabase
    .from('classes')
    .delete()
    .eq('id', classId);

  if (classError) throwApiError(classError, 'deleteClassPermanently.deleteClass');
}

export async function createClass(params: {
  className: string;
  grade: string;
  schoolYear: string;
  icon: string;
}): Promise<void> {
  const supabase = createClient();
  const userId = await getRequiredSessionUserId();

  const { data: rpcData, error } = await supabase.rpc('create_new_class', {
    class_name: params.className,
    class_grade: params.grade,
    class_school_year: params.schoolYear,
  });
  if (error) throwApiError(error, 'createClass.createNewClassRpc');

  let classId: string | null = null;
  if (rpcData) {
    if (typeof rpcData === 'string') classId = rpcData;
    else if (Array.isArray(rpcData) && rpcData.length > 0) classId = rpcData[0]?.id || rpcData[0];
    else if ((rpcData as { id?: string }).id) classId = (rpcData as { id: string }).id;
  }

  if (!classId) {
    const { data: classData, error: findError } = await supabase
      .from('classes')
      .select('id')
      .eq('name', params.className)
      .eq('teacher_id', userId)
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (findError || !classData) return;
    classId = classData.id;
  }

  const { error: updateError } = await supabase
    .from('classes')
    .update({ icon: params.icon })
    .eq('id', classId);
  if (updateError) {
    console.error('Error updating class icon:', updateError);
  }
}

export async function fetchClassById(classId: string): Promise<ClassRecord | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('id', classId)
    .single();
  if (error || !data) return null;
  return data as ClassRecord;
}

export async function getCurrentSessionUserId(): Promise<string | null> {
  return getOptionalSessionUserId();
}

export async function updateClass(params: {
  classId: string;
  name: string;
  grade: string;
  icon: string;
}): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('classes')
    .update({
      name: params.name,
      grade: params.grade,
      icon: params.icon,
    })
    .eq('id', params.classId);
  if (error) throwApiError(error, 'updateClass');
}

export type CollaboratorTeacherRow = {
  row_id: string;
  collaborator_id: string;
  name: string | null;
  email: string;
};

export async function listClassCollaborators(classId: string): Promise<CollaboratorTeacherRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('list_class_collaborators', {
    p_class_id: classId,
  });
  if (error) throwApiError(error, 'listClassCollaborators');
  return Array.isArray(data) ? (data as CollaboratorTeacherRow[]) : [];
}

export async function lookupTeacherByEmail(email: string): Promise<{ id: string; name: string | null; email: string } | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('lookup_teacher_by_email', {
    p_email: email,
  });
  if (error) throwApiError(error, 'lookupTeacherByEmail');
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || !row.id) return null;
  return row as { id: string; name: string | null; email: string };
}

export async function addClassCollaborator(classId: string, collaboratorId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('class_collaborators').insert({
    class_id: classId,
    collaborator_id: collaboratorId,
    primary_user: false,
  });
  if (error) throwApiError(error, 'addClassCollaborator');
}

export async function removeClassCollaborator(collaboratorRowId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('class_collaborators')
    .delete()
    .eq('id', collaboratorRowId);
  if (error) throwApiError(error, 'removeClassCollaborator');
}

export async function listStudentsForClassEdit(classId: string): Promise<Student[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('students')
    .select('id, first_name, last_name, avatar, student_number, gender, class_id, points')
    .eq('class_id', classId)
    .eq('is_archived', false);
  if (error) throwApiError(error, 'listStudentsForClassEdit');
  return (data || []) as Student[];
}

// Legacy aliases for backwards compatibility.
export const fetchAccessibleClassesForUser = listAccessibleClassesForUser;
export const fetchStudentCountsByClassIds = getStudentCountsByClassIds;
export const createClassForCurrentUser = createClass;
export const updateClassInfo = updateClass;
export const fetchStudentsForClassEdit = listStudentsForClassEdit;
