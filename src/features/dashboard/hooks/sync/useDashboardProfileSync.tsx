'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  fetchTeacherProfileById,
  getSessionUserId,
  type TeacherProfile,
  type ViewPreference,
} from '@/lib/api/auth.service';
import { useUserStore } from '@/stores/useUserStore';
import { usePreferenceStore } from '@/stores/usePreferenceStore';

let cachedTeacherProfile: TeacherProfile | null = null;
let cachedViewPreference: ViewPreference | null = null;
let teacherProfileFetchPromise: Promise<void> | null = null;

/** Keeps module cache aligned when the user changes preferred view from the UI (see `StudentsViewMenu`). */
export function syncProfileCacheViewPreference(pref: ViewPreference) {
  cachedViewPreference = pref;
}

/** Fetches teacher profile once (deduped) and writes to `useUserStore` + `viewPreference` into `usePreferenceStore`. */
export function DashboardProfileSync() {
  const router = useRouter();

  const fetchTeacherProfile = useCallback(async () => {
    const { setTeacherProfile, setLoadingProfile } = useUserStore.getState();
    const { setViewPreference } = usePreferenceStore.getState();

    if (cachedTeacherProfile) {
      setTeacherProfile(cachedTeacherProfile);
      if (cachedViewPreference) setViewPreference(cachedViewPreference);
      setLoadingProfile(false);
      return;
    }

    if (teacherProfileFetchPromise) {
      setLoadingProfile(true);
      await teacherProfileFetchPromise;
      setTeacherProfile(cachedTeacherProfile);
      if (cachedViewPreference) setViewPreference(cachedViewPreference);
      setLoadingProfile(false);
      return;
    }

    setLoadingProfile(true);
    teacherProfileFetchPromise = (async () => {
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
      cachedViewPreference = preferredView;
      cachedTeacherProfile = profile;
    })();

    try {
      await teacherProfileFetchPromise;
      setTeacherProfile(cachedTeacherProfile);
      if (cachedViewPreference) setViewPreference(cachedViewPreference);
    } finally {
      teacherProfileFetchPromise = null;
      setLoadingProfile(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchTeacherProfile();
  }, [fetchTeacherProfile]);

  return null;
}
