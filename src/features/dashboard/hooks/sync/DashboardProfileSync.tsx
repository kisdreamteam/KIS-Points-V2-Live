'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  fetchTeacherProfileById,
  getSessionUserId,
  type ViewPreference,
} from '@/lib/api/auth.service';
import { useUserStore } from '@/stores/useUserStore';
import { usePreferenceStore } from '@/stores/usePreferenceStore';
import { dashboardProfileCache } from '@/features/dashboard/hooks/sync/dashboardProfileCache';

/** Fetches teacher profile once (deduped) and writes to `useUserStore` + `viewPreference` into `usePreferenceStore`. */
export function DashboardProfileSync() {
  const router = useRouter();

  const fetchTeacherProfile = useCallback(async () => {
    const { setTeacherProfile, setLoadingProfile } = useUserStore.getState();
    const { setViewPreference } = usePreferenceStore.getState();

    if (dashboardProfileCache.teacherProfile) {
      setTeacherProfile(dashboardProfileCache.teacherProfile);
      if (dashboardProfileCache.viewPreference) setViewPreference(dashboardProfileCache.viewPreference);
      setLoadingProfile(false);
      return;
    }

    if (dashboardProfileCache.fetchPromise) {
      setLoadingProfile(true);
      await dashboardProfileCache.fetchPromise;
      setTeacherProfile(dashboardProfileCache.teacherProfile);
      if (dashboardProfileCache.viewPreference) setViewPreference(dashboardProfileCache.viewPreference);
      setLoadingProfile(false);
      return;
    }

    setLoadingProfile(true);
    dashboardProfileCache.fetchPromise = (async () => {
      const userId = await getSessionUserId();
      if (!userId) {
        router.replace('/login');
        return;
      }

      const profile = await fetchTeacherProfileById(userId);
      if (!profile) {
        console.error('Error fetching teacher profile');
        return;
      }

      const preferredView: ViewPreference =
        profile.preferred_view === 'seating' || profile.preferred_view === 'students'
          ? profile.preferred_view
          : 'students';
      dashboardProfileCache.viewPreference = preferredView;
      dashboardProfileCache.teacherProfile = profile;
    })();

    try {
      await dashboardProfileCache.fetchPromise;
      setTeacherProfile(dashboardProfileCache.teacherProfile);
      if (dashboardProfileCache.viewPreference) setViewPreference(dashboardProfileCache.viewPreference);
    } finally {
      dashboardProfileCache.fetchPromise = null;
      setLoadingProfile(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchTeacherProfile();
  }, [fetchTeacherProfile]);

  return null;
}
