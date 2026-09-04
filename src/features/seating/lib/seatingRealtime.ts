import type { RealtimeChannel } from '@supabase/supabase-js';

/** Postgres changes for seating_charts view-settings columns. */
export function seatingChartsSettingsChannelName(layoutId: string): string {
  return `seating_charts_settings_${layoutId}`;
}

/** Broadcast channel for group/assignment refresh across tabs. */
export function seatingChartRefreshChannelName(layoutId: string): string {
  return `seating_chart_refresh_${layoutId}`;
}

export const SEATING_REFRESH_EVENT = 'seating_chart_refresh';

const refreshChannelsByLayoutId = new Map<string, RealtimeChannel>();

/** Register the long-lived refresh channel once it reaches SUBSCRIBED. */
export function registerSeatingRefreshChannel(layoutId: string, channel: RealtimeChannel): void {
  refreshChannelsByLayoutId.set(layoutId, channel);
}

export function clearSeatingRefreshChannel(layoutId: string, channel?: RealtimeChannel): void {
  const current = refreshChannelsByLayoutId.get(layoutId);
  if (!current) return;
  if (channel && current !== channel) return;
  refreshChannelsByLayoutId.delete(layoutId);
}

/** Returns the joined refresh channel for same-tab send, if available. */
export function getJoinedSeatingRefreshChannel(layoutId: string): RealtimeChannel | null {
  const channel = refreshChannelsByLayoutId.get(layoutId);
  if (!channel) return null;
  if (channel.state !== 'joined') return null;
  return channel;
}
