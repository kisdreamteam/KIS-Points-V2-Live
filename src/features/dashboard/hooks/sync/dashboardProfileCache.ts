import type { TeacherProfile, ViewPreference } from '@/lib/api/auth.service';

export const dashboardProfileCache = {
  teacherProfile: null as TeacherProfile | null,
  viewPreference: null as ViewPreference | null,
  fetchPromise: null as Promise<void> | null,
};

/** Keeps module cache aligned when the user changes preferred view from the UI. */
export function syncProfileCacheViewPreference(pref: ViewPreference) {
  dashboardProfileCache.viewPreference = pref;
}
