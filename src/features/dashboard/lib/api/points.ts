import { createClient } from '@/lib/client';
import type { PointCategory } from '@/lib/types';
import { throwApiError } from '@/lib/api/_shared/errors';
import { getOptionalSessionUserId } from '@/lib/api/_shared/auth';

export type PointLogRow = {
  id: string;
  studentName: string;
  reason: string;
  points: number;
  createdAt: string;
};

export async function listPointCategoriesByClassIds(classIds: string[]): Promise<PointCategory[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('point_categories')
    .select('*')
    .in('class_id', classIds)
    .eq('is_archived', false);

  if (error) throwApiError(error, 'listPointCategoriesByClassIds');

  return (data ?? []) as PointCategory[];
}

export async function listStudentIdsByClassIds(classIds: string[]): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('students')
    .select('id')
    .in('class_id', classIds);

  if (error) throwApiError(error, 'listStudentIdsByClassIds');

  return (data ?? []).map((s: { id: string }) => s.id);
}

export async function listStudentIdsByClassId(classId: string): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('students')
    .select('id')
    .eq('class_id', classId);

  if (error) throwApiError(error, 'listStudentIdsByClassId');

  return (data ?? []).map((s: { id: string }) => s.id);
}

export async function createPointAwardsForStudents(params: {
  studentIds: string[];
  categoryId: string;
  points: number;
  memo?: string;
}): Promise<void> {
  const { studentIds, categoryId, points, memo = '' } = params;
  const supabase = createClient();

  const results = await Promise.all(
    studentIds.map(async (studentId) => {
      const { error } = await supabase.rpc('award_points_to_student', {
        student_id_in: studentId,
        category_id_in: categoryId,
        points_in: points,
        memo_in: memo,
      });
      return error;
    })
  );

  if (results.some((err) => err !== null)) {
    throwApiError(new Error('Failed to award points to one or more students.'), 'createPointAwardsForStudents');
  }
}

export async function getAuthenticatedUserId(): Promise<string | null> {
  return getOptionalSessionUserId();
}

export async function createCustomPointAwardsForStudents(params: {
  studentIds: string[];
  teacherId: string;
  points: number;
  memo?: string;
}): Promise<void> {
  const { studentIds, teacherId, points, memo } = params;
  const supabase = createClient();

  const { data: students, error: fetchError } = await supabase
    .from('students')
    .select('id, points')
    .in('id', studentIds);

  if (fetchError) throwApiError(fetchError, 'createCustomPointAwardsForStudents.fetchStudents');

  const rows = (students ?? []) as Array<{ id: string; points: number | null }>;
  const results = await Promise.all(
    rows.map(async (student) => {
      const { error: insertError } = await supabase
        .from('custom_point_events')
        .insert({
          student_id: student.id,
          teacher_id: teacherId,
          points,
          memo: memo || null,
        });

      if (insertError) {
        return insertError;
      }

      const currentPoints = student.points ?? 0;
      const { error: updateError } = await supabase
        .from('students')
        .update({ points: currentPoints + points })
        .eq('id', student.id);

      return updateError;
    })
  );

  if (results.some((err) => err !== null)) {
    throwApiError(new Error('Failed to apply custom points to one or more students.'), 'createCustomPointAwardsForStudents');
  }
}

export async function listPointLogRowsForStudents(params: {
  studentIds: string[];
  studentNameMap: Map<string, string>;
}): Promise<PointLogRow[]> {
  const { studentIds, studentNameMap } = params;
  const supabase = createClient();

  const { data: pointEvents, error: pointEventsError } = await supabase
    .from('point_events')
    .select('id, student_id, category_id, points, created_at')
    .in('student_id', studentIds)
    .order('created_at', { ascending: false });

  const { data: customEvents, error: customEventsError } = await supabase
    .from('custom_point_events')
    .select('id, student_id, points, memo, created_at')
    .in('student_id', studentIds)
    .order('created_at', { ascending: false });

  if (pointEventsError) throwApiError(pointEventsError, 'listPointLogRowsForStudents.pointEvents');
  if (customEventsError) throwApiError(customEventsError, 'listPointLogRowsForStudents.customEvents');

  const categoryIds = Array.from(
    new Set(
      ((pointEvents ?? []) as { category_id?: string }[])
        .map((ev) => ev.category_id)
        .filter(Boolean)
    )
  );

  const categoryMap = new Map<string, string>();
  if (categoryIds.length > 0) {
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('point_categories')
      .select('id, name')
      .in('id', categoryIds);

    if (categoriesError) throwApiError(categoriesError, 'listPointLogRowsForStudents.categories');

    (categoriesData ?? []).forEach((c: { id: string; name?: string }) => {
      categoryMap.set(c.id, c.name ?? 'Category');
    });
  }

  const standardRows: PointLogRow[] = ((pointEvents ?? []) as Record<string, unknown>[]).map((ev) => {
    const categoryId = ev.category_id as string;
    return {
      id: `standard-${ev.id}`,
      studentName: studentNameMap.get(ev.student_id as string) ?? 'Unknown student',
      reason: categoryMap.get(categoryId) ?? 'Point award',
      points: Number(ev.points ?? 0),
      createdAt: ev.created_at as string,
    };
  });

  const customRows: PointLogRow[] = ((customEvents ?? []) as Record<string, unknown>[]).map((ev) => {
    const memoText = String(ev.memo ?? '').trim();
    return {
      id: `custom-${ev.id}`,
      studentName: studentNameMap.get(ev.student_id as string) ?? 'Unknown student',
      reason: memoText ? `Custom: ${memoText}` : 'Custom',
      points: Number(ev.points ?? 0),
      createdAt: ev.created_at as string,
    };
  });

  return [...standardRows, ...customRows].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export const STUDENT_POINTS_BROADCAST_EVENT = 'student_points_updated';

export type StudentPointsUpdate = {
  studentId: string;
  points: number;
};

export type StudentPointsBroadcastPayload = {
  classId: string;
  emittedAt: number;
  updates: StudentPointsUpdate[];
};

/** Supabase broadcast: notify other tabs that roster point totals changed for a class. */
export async function broadcastStudentPointsUpdate(
  payload: StudentPointsBroadcastPayload
): Promise<void> {
  const supabase = createClient();
  const channelName = `student_points_${payload.classId}`;
  const channel = supabase.channel(channelName);

  try {
    await new Promise<void>((resolve, reject) => {
      let finished = false;
      const timeoutMs = 12_000;
      const timeoutId = setTimeout(() => {
        if (finished) return;
        finished = true;
        void supabase.removeChannel(channel);
        reject(new Error('broadcastStudentPointsUpdate: subscribe timed out'));
      }, timeoutMs);

      const done = (fn: () => void) => {
        if (finished) return;
        finished = true;
        clearTimeout(timeoutId);
        fn();
      };

      channel.subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          void (async () => {
            try {
              const result = await channel.send({
                type: 'broadcast',
                event: STUDENT_POINTS_BROADCAST_EVENT,
                payload,
              });
              if (result !== 'ok' && result !== 'timed out') {
                done(() => {
                  void supabase.removeChannel(channel);
                  reject(new Error('Failed to broadcast student points update'));
                });
                return;
              }
              done(() => {
                void supabase.removeChannel(channel);
                resolve();
              });
            } catch (sendErr) {
              done(() => {
                void supabase.removeChannel(channel);
                reject(sendErr instanceof Error ? sendErr : new Error(String(sendErr)));
              });
            }
          })();
          return;
        }

        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          done(() => {
            void supabase.removeChannel(channel);
            reject(err ?? new Error(`Realtime channel ${status}`));
          });
        }
      });
    });
  } catch (e) {
    throwApiError(e instanceof Error ? e : new Error(String(e)), 'broadcastStudentPointsUpdate');
  }
}

type StudentPointsRowPayload = {
  id?: string;
  points?: number | null;
  class_id?: string;
};

/** Realtime: `students` row updates + cross-tab broadcast for point totals. */
export function subscribeToStudentPointsSync(
  classId: string,
  handlers: {
    onStudentPointsUpdate?: (update: StudentPointsUpdate) => void;
    onBroadcast?: (payload: StudentPointsBroadcastPayload) => void;
  },
  options?: { channelSuffix?: string }
): { unsubscribe: () => void } {
  const supabase = createClient();
  const channelSuffix = options?.channelSuffix ?? '';
  const realtimeChannel = supabase
    .channel(`student_points_${classId}${channelSuffix}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'students',
        filter: `class_id=eq.${classId}`,
      },
      (payload) => {
        const nextRow = payload.new as StudentPointsRowPayload;
        const studentId = nextRow.id;
        if (!studentId) return;
        handlers.onStudentPointsUpdate?.({
          studentId,
          points: nextRow.points ?? 0,
        });
      }
    )
    .on(
      'broadcast',
      { event: STUDENT_POINTS_BROADCAST_EVENT },
      ({ payload }) => {
        const broadcastPayload = payload as StudentPointsBroadcastPayload | undefined;
        if (!broadcastPayload || broadcastPayload.classId !== classId) return;
        handlers.onBroadcast?.(broadcastPayload);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      void supabase.removeChannel(realtimeChannel);
    },
  };
}

// Legacy aliases for backwards compatibility.
export const fetchPointCategoriesByClassIds = listPointCategoriesByClassIds;
export const fetchStudentIdsByClassIds = listStudentIdsByClassIds;
export const fetchStudentIdsByClassId = listStudentIdsByClassId;
export const awardPointsToStudents = createPointAwardsForStudents;
export const awardCustomPointsToStudents = createCustomPointAwardsForStudents;
export const fetchPointLogRowsForStudents = listPointLogRowsForStudents;
