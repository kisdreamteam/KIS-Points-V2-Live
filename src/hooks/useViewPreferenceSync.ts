'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { emitSeatingEditMode } from '@/lib/events/students';
import { getSessionUserId, updateTeacherPreferredView } from '@/lib/api/auth';
import { useLayoutStore } from '@/stores/useLayoutStore';
import { usePreferenceStore } from '@/stores/usePreferenceStore';
import { useUserStore } from '@/stores/useUserStore';
import { syncProfileCacheViewPreference } from '@/hooks/useDashboardProfileSync';

export function useViewPreferenceSync() {
  const router = useRouter();

  const handleViewChange = useCallback(
    async (view: 'grid' | 'seating') => {
      const params = new URLSearchParams(window.location.search);
      params.set('view', view);
      params.delete('mode');
      emitSeatingEditMode({ isEditMode: false });

      const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
      useLayoutStore.getState().setActiveView(view === 'seating' ? 'seating_chart' : 'students');
      router.replace(newUrl, { scroll: false });

      const preference = view === 'seating' ? 'seating' : 'students';
      usePreferenceStore.getState().setViewPreference(preference);
      syncProfileCacheViewPreference(preference);
      try {
        const sessionUserId = await getSessionUserId();
        const userId = sessionUserId ?? useUserStore.getState().teacherProfile?.id;
        if (userId) {
          await updateTeacherPreferredView(userId, preference);
        }
      } catch (err) {
        console.error('Unexpected error updating preferred view:', err);
      }
    },
    [router]
  );

  return { handleViewChange };
}
