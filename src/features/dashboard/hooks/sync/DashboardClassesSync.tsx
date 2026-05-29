'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { refreshDashboardClasses } from '@/features/dashboard/hooks/sync/dashboardClassesRefresh';

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
