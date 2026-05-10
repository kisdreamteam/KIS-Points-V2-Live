import { createClient } from '@/lib/client';
import type { Student } from '@/lib/types';
import { throwApiError } from '@/lib/api/_shared/errors';

export type SeatingChartRecord = {
  id: string;
  name: string;
  class_id: string;
  created_at: string;
  show_grid?: boolean;
  show_objects?: boolean;
  layout_orientation?: string;
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

  byGroup.forEach((assignments, groupId) => {
    const withStudent = assignments.filter(
      (a): a is StudentSeatAssignment & { students: Student } => a.students != null
    );
    const hasNull = withStudent.some((a) => a.seat_index == null);
    const sorted = [...withStudent].sort((a, b) => {
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
      groupId,
      sorted.map((a, i) => ({ student: a.students, seat_index: a.seat_index ?? i + 1 }))
    );
  });

  return { groups, groupAssignments };
}

export async function fetchLayoutViewSettings(
  layoutId: string
): Promise<LayoutViewSettings | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('seating_charts')
    .select('show_grid, show_objects, layout_orientation')
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

const SEATING_REFRESH_EVENT = 'seating_chart_refresh';

async function resolveLayoutIdByGroupIds(groupIds: string[]): Promise<string | null> {
  if (groupIds.length === 0) return null;
  const supabase = createClient();
  const { data, error } = await supabase
    .from('seating_groups')
    .select('seating_chart_id')
    .in('id', groupIds)
    .limit(1)
    .single();

  if (error || !data?.seating_chart_id) return null;
  return data.seating_chart_id as string;
}

async function broadcastByGroupIds(groupIds: string[]): Promise<void> {
  const layoutId = await resolveLayoutIdByGroupIds(groupIds);
  if (!layoutId) return;
  await broadcastSeatingChartRefresh(layoutId);
}

export async function broadcastSeatingChartRefresh(layoutId: string): Promise<void> {
  const supabase = createClient();
  const payload: SeatingRefreshPayload = {
    layoutId,
    emittedAt: Date.now(),
  };
  const channelName = `seating_chart_view_settings_${layoutId}`;
  const channel = supabase.channel(channelName);

  try {
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
              const result = await channel.send({
                type: 'broadcast',
                event: SEATING_REFRESH_EVENT,
                payload,
              });
              if (result !== 'ok' && result !== 'timed out') {
                done(() => {
                  void supabase.removeChannel(channel);
                  reject(new Error('Failed to broadcast seating refresh'));
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
    throwApiError(e instanceof Error ? e : new Error(String(e)), 'broadcastSeatingChartRefresh');
  }
}

/** Supabase realtime: `seating_charts` row updates for view settings (grid/objects/orientation). */
export function subscribeToSeatingChartRowUpdates(
  layoutId: string,
  onNewRow: (row: LayoutViewSettings) => void,
  options?: {
    channelSuffix?: string;
    onRefresh?: (payload: SeatingRefreshPayload) => void;
  }
): { unsubscribe: () => void } {
  const supabase = createClient();
  const channelSuffix = options?.channelSuffix ?? '';
  const realtimeChannel = supabase
    .channel(`seating_chart_view_settings_${layoutId}${channelSuffix}`)
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
    .on(
      'broadcast',
      { event: SEATING_REFRESH_EVENT },
      ({ payload }) => {
        const refreshPayload = payload as SeatingRefreshPayload | undefined;
        if (!refreshPayload || refreshPayload.layoutId !== layoutId) return;
        options?.onRefresh?.(refreshPayload);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      void supabase.removeChannel(realtimeChannel);
    },
  };
}

export async function renumberSeatIndicesForGroup(groupId: string): Promise<void> {
  const supabase = createClient();
  const { data: assignments, error } = await supabase
    .from('student_seat_assignments')
    .select('id')
    .eq('seating_group_id', groupId)
    .order('seat_index', { ascending: true, nullsFirst: false });

  if (error) throwApiError(error, 'renumberSeatIndicesForGroup.select');
  if (!assignments?.length) return;

  for (let i = 0; i < assignments.length; i++) {
    const { error: upErr } = await supabase
      .from('student_seat_assignments')
      .update({ seat_index: i + 1 })
      .eq('id', assignments[i].id);
    if (upErr) throwApiError(upErr, 'renumberSeatIndicesForGroup.update');
  }
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
  const supabase = createClient();
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase.from('student_seat_assignments').insert(chunk);
    if (error) throwApiError(error, 'insertStudentSeatAssignmentsBatched');
  }
  await broadcastByGroupIds(rows.map((r) => r.seating_group_id));
}

export async function insertStudentSeatAssignments(rows: StudentSeatAssignmentRow[]): Promise<void> {
  if (rows.length === 0) return;
  const supabase = createClient();
  const { error } = await supabase.from('student_seat_assignments').insert(rows);
  if (error) throwApiError(error, 'insertStudentSeatAssignments');
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
  patch: { name?: string; group_columns?: number }
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('seating_groups').update(patch).eq('id', groupId);

  if (error) throwApiError(error, 'updateSeatingGroupFields');
  await broadcastByGroupIds([groupId]);
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
