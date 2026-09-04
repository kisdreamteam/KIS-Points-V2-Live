import { createClient } from '@/lib/client';
import type { Student } from '@/lib/types';
import { throwApiError } from '@/lib/api/errors';
import {
  SEATING_REFRESH_EVENT,
  clearSeatingRefreshChannel,
  getJoinedSeatingRefreshChannel,
  registerSeatingRefreshChannel,
  seatingChartRefreshChannelName,
  seatingChartsSettingsChannelName,
} from '@/features/seating/lib/seatingRealtime';

export type SeatingChartRecord = {
  id: string;
  name: string;
  class_id: string;
  created_at: string;
  show_grid?: boolean;
  show_objects?: boolean;
  layout_orientation?: string;
  color_by_gender?: boolean;
  color_by_level?: boolean;
};

export type SeatingGroupRecord = {
  id: string;
  name: string;
  seating_chart_id: string;
  sort_order: number;
  group_columns: number;
  group_rows?: number;
  position_x?: number;
  position_y?: number;
  created_at: string;
};

export type GroupAssignment = { student: Student; seat_index: number };
export type LayoutViewSettings = {
  show_grid?: boolean | null;
  show_objects?: boolean | null;
  layout_orientation?: string | null;
  color_by_gender?: boolean | null;
  color_by_level?: boolean | null;
};

type StudentSeatAssignment = {
  seating_group_id: string;
  seat_index: number | null;
  students: Student | null;
};

export async function fetchSeatingLayoutsByClassId(
  classId: string
): Promise<SeatingChartRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('seating_charts')
    .select('*')
    .eq('class_id', classId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []) as SeatingChartRecord[];
}

export async function updateSeatingLayoutName(layoutId: string, newName: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('seating_charts')
    .update({ name: newName })
    .eq('id', layoutId);

  if (error) {
    throw error;
  }
}

export async function createSeatingLayout(params: {
  classId: string;
  name: string;
}): Promise<SeatingChartRecord> {
  const supabase = createClient();
  const { classId, name } = params;

  const { data, error } = await supabase
    .from('seating_charts')
    .insert({
      name,
      class_id: classId,
      show_grid: true,
      show_objects: true,
      layout_orientation: 'Left',
      color_by_gender: true,
      color_by_level: false,
    })
    .select()
    .single();

  if (error || !data) {
    throw error ?? new Error('Failed to create layout.');
  }

  return data as SeatingChartRecord;
}

export async function deleteSeatingLayoutCascade(layoutId: string): Promise<void> {
  const supabase = createClient();

  const { data: groupsData, error: groupsError } = await supabase
    .from('seating_groups')
    .select('id')
    .eq('seating_chart_id', layoutId);

  if (groupsError) {
    throw groupsError;
  }

  if (groupsData && groupsData.length > 0) {
    const groupIds = groupsData.map((g) => g.id);

    for (const groupId of groupIds) {
      const { error: assignmentDeleteError } = await supabase
        .from('student_seat_assignments')
        .delete()
        .eq('seating_group_id', groupId);
      if (assignmentDeleteError) {
        throw assignmentDeleteError;
      }
    }

    for (const groupId of groupIds) {
      const { error: groupDeleteError } = await supabase
        .from('seating_groups')
        .delete()
        .eq('id', groupId);
      if (groupDeleteError) {
        throw groupDeleteError;
      }
    }
  }

  const { error: layoutDeleteError } = await supabase
    .from('seating_charts')
    .delete()
    .eq('id', layoutId);

  if (layoutDeleteError) {
    throw layoutDeleteError;
  }
}

export async function fetchSeatingGroupsWithAssignments(
  layoutId: string
): Promise<{
  groups: SeatingGroupRecord[];
  groupAssignments: Map<string, GroupAssignment[]>;
}> {
  const supabase = createClient();
  const { data: groupsData, error: groupsError } = await supabase
    .from('seating_groups')
    .select('*')
    .eq('seating_chart_id', layoutId)
    .order('sort_order', { ascending: true });

  if (groupsError) {
    throw groupsError;
  }

  const groups = (groupsData || []) as SeatingGroupRecord[];
  const groupAssignments = new Map<string, GroupAssignment[]>();
  groups.forEach((group) => {
    groupAssignments.set(group.id, []);
  });

  const groupIds = groups.map((g) => g.id);
  if (groupIds.length === 0) {
    return { groups, groupAssignments };
  }

  const { data: assignmentsData, error: assignmentsError } = await supabase
    .from('student_seat_assignments')
    .select('*, students(*)')
    .in('seating_group_id', groupIds)
    .order('seating_group_id', { ascending: true })
    .order('seat_index', { ascending: true });

  if (assignmentsError) {
    throw assignmentsError;
  }

  const byGroup = new Map<string, StudentSeatAssignment[]>();
  for (const assignment of (assignmentsData || []) as StudentSeatAssignment[]) {
    const groupId = assignment.seating_group_id;
    if (!byGroup.has(groupId)) byGroup.set(groupId, []);
    byGroup.get(groupId)!.push(assignment);
  }

  const seenStudentIdsInLayout = new Set<string>();
  for (const group of groups) {
    const assignments = byGroup.get(group.id) ?? [];
    const withStudent = assignments.filter(
      (a): a is StudentSeatAssignment & { students: Student } =>
        a.students != null && a.students.is_archived !== true
    );
    const deduped = withStudent.filter((a) => {
      if (seenStudentIdsInLayout.has(a.students.id)) return false;
      seenStudentIdsInLayout.add(a.students.id);
      return true;
    });
    const hasNull = deduped.some((a) => a.seat_index == null);
    const sorted = [...deduped].sort((a, b) => {
      if (hasNull) {
        const cmp = (a.students.first_name ?? '').localeCompare(b.students.first_name ?? '');
        return cmp !== 0 ? cmp : (a.students.last_name ?? '').localeCompare(b.students.last_name ?? '');
      }
      const sa = a.seat_index ?? Infinity;
      const sb = b.seat_index ?? Infinity;
      if (sa !== sb) return sa - sb;
      return (a.students.first_name ?? '').localeCompare(b.students.first_name ?? '');
    });
    groupAssignments.set(
      group.id,
      sorted.map((a, i) => ({ student: a.students, seat_index: a.seat_index ?? i + 1 }))
    );
  }

  return { groups, groupAssignments };
}

export async function fetchLayoutViewSettings(
  layoutId: string
): Promise<LayoutViewSettings | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('seating_charts')
    .select('show_grid, show_objects, layout_orientation, color_by_gender, color_by_level')
    .eq('id', layoutId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as LayoutViewSettings;
}

export async function updateLayoutViewSettings(
  layoutId: string,
  patch: LayoutViewSettings
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('seating_charts')
    .update(patch)
    .eq('id', layoutId);

  if (error) {
    throw error;
  }
}

/** Row shape for bulk insert into `student_seat_assignments`. */
export type StudentSeatAssignmentRow = {
  student_id: string;
  seating_group_id: string;
  seat_index: number;
};

type StudentSeatAssignmentInsertRow = StudentSeatAssignmentRow & {
  seating_chart_id: string;
};

export type DeleteStudentSeatAssignmentsOptions = {
  /** When set, only remove the assignment for this layout. Omit to remove all layouts (e.g. archive). */
  seatingChartId?: string;
};

export type SeatingGroupLayoutUpdate = {
  id: string;
  position_x: number;
  position_y: number;
  group_columns: number;
  group_rows: number;
};

export type SeatingRefreshPayload = {
  layoutId: string;
  emittedAt: number;
};

async function resolveLayoutIdByGroupIds(groupIds: string[]): Promise<string | null> {
  if (groupIds.length === 0) return null;
  const supabase = createClient();
  const { data, error } = await supabase
    .from('seating_groups')
    .select('seating_chart_id')
    .in('id', groupIds)
    .limit(1)
    .maybeSingle();

  if (error || !data?.seating_chart_id) return null;
  return data.seating_chart_id as string;
}

export async function resolveSeatingChartIdForGroup(groupId: string): Promise<string | null> {
  return resolveLayoutIdByGroupIds([groupId]);
}

async function resolveGroupLayoutMap(groupIds: string[]): Promise<Map<string, string>> {
  if (groupIds.length === 0) return new Map();
  const supabase = createClient();
  const { data, error } = await supabase
    .from('seating_groups')
    .select('id, seating_chart_id')
    .in('id', groupIds);

  if (error) throwApiError(error, 'resolveGroupLayoutMap');
  const map = new Map<string, string>();
  for (const row of data ?? []) {
    if (row.seating_chart_id) {
      map.set(row.id as string, row.seating_chart_id as string);
    }
  }
  return map;
}

async function enrichAssignmentRows(
  rows: StudentSeatAssignmentRow[]
): Promise<StudentSeatAssignmentInsertRow[]> {
  const groupIds = [...new Set(rows.map((r) => r.seating_group_id))];
  const layoutByGroupId = await resolveGroupLayoutMap(groupIds);
  return rows.map((row) => {
    const seating_chart_id = layoutByGroupId.get(row.seating_group_id);
    if (!seating_chart_id) {
      throwApiError(
        new Error(`No seating layout found for group ${row.seating_group_id}.`),
        'enrichAssignmentRows'
      );
    }
    return { ...row, seating_chart_id };
  });
}

async function upsertStudentSeatAssignmentRows(rows: StudentSeatAssignmentInsertRow[]): Promise<void> {
  if (rows.length === 0) return;
  const supabase = createClient();
  const { error } = await supabase.from('student_seat_assignments').upsert(rows, {
    onConflict: 'student_id,seating_chart_id',
  });
  if (error) throwApiError(error, 'upsertStudentSeatAssignmentRows');
}

async function broadcastByGroupIds(groupIds: string[]): Promise<void> {
  const layoutId = await resolveLayoutIdByGroupIds(groupIds);
  if (!layoutId) return;
  await broadcastSeatingChartRefresh(layoutId);
}

async function sendSeatingRefreshBroadcast(
  channel: ReturnType<ReturnType<typeof createClient>['channel']>,
  payload: SeatingRefreshPayload
): Promise<void> {
  const result = await channel.send({
    type: 'broadcast',
    event: SEATING_REFRESH_EVENT,
    payload,
  });
  if (result !== 'ok' && result !== 'timed out') {
    throw new Error(`Failed to broadcast seating refresh (${String(result)})`);
  }
}

/**
 * Notify other tabs to refresh groups/assignments for a layout.
 * Best-effort only — never throws; DB writes are already committed by callers.
 */
export async function broadcastSeatingChartRefresh(layoutId: string): Promise<void> {
  const payload: SeatingRefreshPayload = {
    layoutId,
    emittedAt: Date.now(),
  };

  try {
    const joined = getJoinedSeatingRefreshChannel(layoutId);
    if (joined) {
      await sendSeatingRefreshBroadcast(joined, payload);
      return;
    }

    const supabase = createClient();
    const channel = supabase.channel(seatingChartRefreshChannelName(layoutId));

    await new Promise<void>((resolve, reject) => {
      let finished = false;
      const timeoutMs = 12_000;
      const timeoutId = setTimeout(() => {
        if (finished) return;
        finished = true;
        void supabase.removeChannel(channel);
        reject(new Error('broadcastSeatingChartRefresh: subscribe timed out'));
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
              await sendSeatingRefreshBroadcast(channel, payload);
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
    console.warn(
      'broadcastSeatingChartRefresh failed (notify-only; DB write already committed):',
      e instanceof Error ? e.message : e
    );
  }
}

/**
 * Supabase realtime: seating_charts view-settings updates + cross-tab assignment refresh.
 * Uses separate channels so ephemeral broadcast publish never collides with the long-lived subscriber.
 */
export function subscribeToSeatingChartRowUpdates(
  layoutId: string,
  onNewRow: (row: LayoutViewSettings) => void,
  options?: {
    onRefresh?: (payload: SeatingRefreshPayload) => void;
  }
): { unsubscribe: () => void } {
  const supabase = createClient();

  const settingsChannel = supabase
    .channel(seatingChartsSettingsChannelName(layoutId))
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'seating_charts',
        filter: `id=eq.${layoutId}`,
      },
      (payload) => {
        const nextRow = payload.new as LayoutViewSettings;
        onNewRow(nextRow);
      }
    )
    .subscribe();

  const refreshChannel = supabase
    .channel(seatingChartRefreshChannelName(layoutId))
    .on(
      'broadcast',
      { event: SEATING_REFRESH_EVENT },
      ({ payload }) => {
        const refreshPayload = payload as SeatingRefreshPayload | undefined;
        if (!refreshPayload || refreshPayload.layoutId !== layoutId) return;
        options?.onRefresh?.(refreshPayload);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        registerSeatingRefreshChannel(layoutId, refreshChannel);
      }
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        clearSeatingRefreshChannel(layoutId, refreshChannel);
      }
    });

  return {
    unsubscribe: () => {
      clearSeatingRefreshChannel(layoutId, refreshChannel);
      void supabase.removeChannel(settingsChannel);
      void supabase.removeChannel(refreshChannel);
    },
  };
}

export async function updateSeatingGroupsLayoutBatch(
  updates: SeatingGroupLayoutUpdate[]
): Promise<void> {
  if (updates.length === 0) return;
  const supabase = createClient();
  const updateResults = await Promise.all(
    updates.map(({ id, position_x, position_y, group_columns, group_rows }) =>
      supabase
        .from('seating_groups')
        .update({
          position_x,
          position_y,
          group_columns,
          group_rows,
        })
        .eq('id', id)
    )
  );
  const firstErr = updateResults.find((r) => r.error)?.error;
  if (firstErr) throwApiError(firstErr, 'updateSeatingGroupsLayoutBatch');
  await broadcastByGroupIds(updates.map((u) => u.id));
}

export async function deleteStudentSeatAssignmentsByStudentId(
  studentId: string,
  options?: DeleteStudentSeatAssignmentsOptions
): Promise<void> {
  const supabase = createClient();
  let selectQuery = supabase
    .from('student_seat_assignments')
    .select('seating_group_id')
    .eq('student_id', studentId);

  if (options?.seatingChartId) {
    selectQuery = selectQuery.eq('seating_chart_id', options.seatingChartId);
  }

  const { data: rows, error: selectError } = await selectQuery;

  if (selectError) throwApiError(selectError, 'deleteStudentSeatAssignmentsByStudentId.select');

  const groupIds = [...new Set((rows ?? []).map((r) => r.seating_group_id as string))];
  if (groupIds.length === 0) return;

  let deleteQuery = supabase
    .from('student_seat_assignments')
    .delete()
    .eq('student_id', studentId);

  if (options?.seatingChartId) {
    deleteQuery = deleteQuery.eq('seating_chart_id', options.seatingChartId);
  }

  const { error } = await deleteQuery;

  if (error) throwApiError(error, 'deleteStudentSeatAssignmentsByStudentId.delete');
  await broadcastByGroupIds(groupIds);
}

export async function deleteStudentSeatAssignmentsForGroupIds(groupIds: string[]): Promise<void> {
  if (groupIds.length === 0) return;
  const supabase = createClient();
  const { error } = await supabase
    .from('student_seat_assignments')
    .delete()
    .in('seating_group_id', groupIds);

  if (error) throwApiError(error, 'deleteStudentSeatAssignmentsForGroupIds');
  await broadcastByGroupIds(groupIds);
}

export async function insertStudentSeatAssignmentsBatched(
  rows: StudentSeatAssignmentRow[],
  chunkSize = 500
): Promise<void> {
  if (rows.length === 0) return;
  const enriched = await enrichAssignmentRows(rows);
  for (let i = 0; i < enriched.length; i += chunkSize) {
    const chunk = enriched.slice(i, i + chunkSize);
    await upsertStudentSeatAssignmentRows(chunk);
  }
  await broadcastByGroupIds(rows.map((r) => r.seating_group_id));
}

export async function insertStudentSeatAssignments(rows: StudentSeatAssignmentRow[]): Promise<void> {
  if (rows.length === 0) return;
  const enriched = await enrichAssignmentRows(rows);
  await upsertStudentSeatAssignmentRows(enriched);
  await broadcastByGroupIds(rows.map((r) => r.seating_group_id));
}

export async function insertSeatingGroup(row: {
  name: string;
  seating_chart_id: string;
  sort_order: number;
  group_columns: number;
  group_rows: number;
  position_x: number;
  position_y: number;
}): Promise<SeatingGroupRecord> {
  const supabase = createClient();
  const { data, error } = await supabase.from('seating_groups').insert(row).select().single();

  if (error || !data) throwApiError(error ?? new Error('insertSeatingGroup'), 'insertSeatingGroup');
  await broadcastSeatingChartRefresh(row.seating_chart_id);
  return data as SeatingGroupRecord;
}

export async function insertSeatingGroups(
  rows: Array<{
    name: string;
    seating_chart_id: string;
    sort_order: number;
    group_columns: number;
    group_rows: number;
    position_x: number;
    position_y: number;
  }>
): Promise<SeatingGroupRecord[]> {
  if (rows.length === 0) return [];
  const supabase = createClient();
  const { data, error } = await supabase.from('seating_groups').insert(rows).select();

  if (error) throwApiError(error, 'insertSeatingGroups');
  await broadcastSeatingChartRefresh(rows[0].seating_chart_id);
  return (data || []) as SeatingGroupRecord[];
}

export async function updateSeatingGroupFields(
  groupId: string,
  patch: { name?: string; group_columns?: number; group_rows?: number }
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('seating_groups').update(patch).eq('id', groupId);

  if (error) throwApiError(error, 'updateSeatingGroupFields');
  await broadcastByGroupIds([groupId]);
}

export async function updateSeatingGroupPosition(
  groupId: string,
  position: { position_x: number; position_y: number }
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('seating_groups')
    .update({
      position_x: position.position_x,
      position_y: position.position_y,
    })
    .eq('id', groupId);

  if (error) throwApiError(error, 'updateSeatingGroupPosition');
  await broadcastByGroupIds([groupId]);
}

export async function updateSeatingGroupRows(groupId: string, group_rows: number): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('seating_groups').update({ group_rows }).eq('id', groupId);

  if (error) throwApiError(error, 'updateSeatingGroupRows');
  await broadcastByGroupIds([groupId]);
}

export async function insertStudentSeatAssignment(row: StudentSeatAssignmentRow): Promise<void> {
  const [enriched] = await enrichAssignmentRows([row]);
  await upsertStudentSeatAssignmentRows([enriched]);
  await broadcastByGroupIds([row.seating_group_id]);
}

export type UpdateStudentSeatAssignmentOptions = {
  /** Used to insert when no DB row exists and patch only sets seat_index. */
  fallbackGroupId?: string;
};

export async function updateStudentSeatAssignmentByStudentId(
  studentId: string,
  patch: { seating_group_id?: string; seat_index?: number | null },
  options?: UpdateStudentSeatAssignmentOptions
): Promise<void> {
  const groupIdForLayout = patch.seating_group_id ?? options?.fallbackGroupId;
  if (!groupIdForLayout) {
    throwApiError(
      new Error('Cannot update seat assignment without a seating group for layout resolution.'),
      'updateStudentSeatAssignmentByStudentId.layout'
    );
  }

  const seating_chart_id = await resolveSeatingChartIdForGroup(groupIdForLayout);
  if (!seating_chart_id) {
    throwApiError(
      new Error(`No seating layout found for group ${groupIdForLayout}.`),
      'updateStudentSeatAssignmentByStudentId.layout'
    );
  }

  const supabase = createClient();
  const { data: existing, error: selectError } = await supabase
    .from('student_seat_assignments')
    .select('id, seating_group_id, seat_index')
    .eq('student_id', studentId)
    .eq('seating_chart_id', seating_chart_id)
    .maybeSingle();

  if (selectError) throwApiError(selectError, 'updateStudentSeatAssignmentByStudentId.select');

  const groupIds = new Set<string>([groupIdForLayout]);
  if (existing?.seating_group_id) groupIds.add(existing.seating_group_id as string);
  if (patch.seating_group_id) groupIds.add(patch.seating_group_id);

  if (!existing) {
    const seating_group_id = patch.seating_group_id ?? options?.fallbackGroupId;
    const seat_index = patch.seat_index;
    if (!seating_group_id || seat_index == null) {
      throwApiError(
        new Error('Cannot upsert seat assignment without seating_group_id and seat_index.'),
        'updateStudentSeatAssignmentByStudentId.upsert'
      );
    }
    await insertStudentSeatAssignment({
      student_id: studentId,
      seating_group_id,
      seat_index,
    });
    return;
  }

  const { error: updateError } = await supabase
    .from('student_seat_assignments')
    .update({
      ...patch,
      seating_chart_id,
    })
    .eq('id', existing.id);

  if (updateError) throwApiError(updateError, 'updateStudentSeatAssignmentByStudentId.update');
  if (groupIds.size > 0) await broadcastByGroupIds([...groupIds]);
}

export type SwapSeatAssignmentsParams = {
  studentA: string;
  studentB: string;
  groupA: string;
  groupB: string;
  seatA: number;
  seatB: number;
};

/**
 * Swap two seated students by replacing both assignment rows (avoids unique-slot collisions on
 * seating_group_id + seat_index during in-place updates).
 */
export async function swapSeatAssignments(params: SwapSeatAssignmentsParams): Promise<void> {
  const { studentA, studentB, groupA, groupB, seatA, seatB } = params;

  const seatingChartId = await resolveSeatingChartIdForGroup(groupA);
  const layoutScope = seatingChartId ? { seatingChartId } : undefined;

  await deleteStudentSeatAssignmentsByStudentId(studentA, layoutScope);
  await deleteStudentSeatAssignmentsByStudentId(studentB, layoutScope);

  await insertStudentSeatAssignment({
    student_id: studentA,
    seating_group_id: groupB,
    seat_index: seatB,
  });
  await insertStudentSeatAssignment({
    student_id: studentB,
    seating_group_id: groupA,
    seat_index: seatA,
  });
}

export async function deleteStudentSeatAssignmentsForSeatingGroupId(groupId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('student_seat_assignments')
    .delete()
    .eq('seating_group_id', groupId);

  if (error) throwApiError(error, 'deleteStudentSeatAssignmentsForSeatingGroupId');
  await broadcastByGroupIds([groupId]);
}

/** Matches legacy editor: assignments delete is not checked; group delete error is surfaced. */
export async function deleteTeamAssignmentsAndGroup(groupId: string): Promise<void> {
  const supabase = createClient();
  const layoutId = await resolveLayoutIdByGroupIds([groupId]);
  await supabase.from('student_seat_assignments').delete().eq('seating_group_id', groupId);
  const { error } = await supabase.from('seating_groups').delete().eq('id', groupId);
  if (error) throwApiError(error, 'deleteTeamAssignmentsAndGroup');
  if (layoutId) await broadcastSeatingChartRefresh(layoutId);
}

export async function deleteAssignmentsForGroupsSequential(groupIds: string[]): Promise<boolean> {
  if (groupIds.length === 0) return false;
  const layoutId = await resolveLayoutIdByGroupIds(groupIds);
  const supabase = createClient();
  let hasError = false;
  for (const groupId of groupIds) {
    const { error } = await supabase
      .from('student_seat_assignments')
      .delete()
      .eq('seating_group_id', groupId);

    if (error) {
      console.error(`Error clearing assignments for group ${groupId}:`, error);
      hasError = true;
    }
  }
  if (!hasError && layoutId) await broadcastSeatingChartRefresh(layoutId);
  return hasError;
}

export async function deleteSeatingGroupsSequential(groupIds: string[]): Promise<boolean> {
  if (groupIds.length === 0) return false;
  const layoutId = await resolveLayoutIdByGroupIds(groupIds);
  const supabase = createClient();
  let hasGroupError = false;
  for (const groupId of groupIds) {
    const { error: groupError } = await supabase.from('seating_groups').delete().eq('id', groupId);

    if (groupError) {
      console.error(`Error deleting group ${groupId}:`, groupError);
      hasGroupError = true;
    }
  }
  if (!hasGroupError && layoutId) await broadcastSeatingChartRefresh(layoutId);
  return hasGroupError;
}
