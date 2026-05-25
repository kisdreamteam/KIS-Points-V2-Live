'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionUserId } from '@/lib/api/auth.service';
import { fetchAccessibleClassesForUser } from '@/features/classes/lib/api/classes';
import { useDashboardStore } from '@/features/dashboard/stores/useDashboardStore';

export type RefreshDashboardClassesOptions = {
  /** When true, never toggles `isLoadingClasses`. */
  silent?: boolean;
  /** e.g. `() => router.replace('/login')` when `getSessionUserId` returns null. */
  onUnauthenticated?: () => void;
};

/**
 * Fetches the full accessible class list into `allAccessibleClasses`.
 * Shows `isLoadingClasses` only on the initial empty load unless `silent` is true.
 */
export async function refreshDashboardClasses(options?: RefreshDashboardClassesOptions): Promise<void> {
  const st = useDashboardStore.getState();
  const empty = st.allAccessibleClasses.length === 0;
  const silent = options?.silent === true;
  const showLoading = !silent && empty;
  if (showLoading) {
    st.setLoadingClasses(true);
  }
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      options?.onUnauthenticated?.();
      return;
    }
    const rows = await fetchAccessibleClassesForUser(userId);
    st.setAllAccessibleClasses(rows);
  } catch (err) {
    console.error('Unexpected error fetching classes:', err);
  } finally {
    if (showLoading) {
      useDashboardStore.getState().setLoadingClasses(false);
    }
  }
}

/** After CRUD: background refresh when we already have a list; otherwise shows loading. */
export async function refreshDashboardClassesForUserAction(): Promise<void> {
  const populated = useDashboardStore.getState().allAccessibleClasses.length > 0;
  await refreshDashboardClasses({ silent: populated });
}

/**
 * Mount once under `app/dashboard/layout.tsx` so class list loading is not tied to
 * page-level remounts when switching between `/dashboard` and class routes.
 */
export function DashboardClassesSync() {
  const router = useRouter();
  const bootstrappedRef = useRef(false);

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;
    void refreshDashboardClasses({
      onUnauthenticated: () => router.replace('/login'),
    });
  }, [router]);

  return null;
}
