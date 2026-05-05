'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { refreshDashboardClassesForUserAction } from '@/hooks/useDashboardClassesSync';
import { usePreferenceStore } from '@/stores/usePreferenceStore';
import { useLayoutStore } from '@/stores/useLayoutStore';
import type { ViewState } from '@/stores/useLayoutStore';

export function useDashboardRouteStateSync() {
  const viewPreference = usePreferenceStore((s) => s.viewPreference);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const viewPreferenceRef = useRef(viewPreference);
  const setEditMode = useLayoutStore((s) => s.setEditMode);

  const currentClassId = pathname ? (pathname.match(/\/dashboard\/classes\/([^/]+)/)?.[1] ?? null) : null;
  const searchParamsKey = searchParams?.toString() ?? '';

  useLayoutEffect(() => {
    const onClassRoute = !!pathname?.includes('/dashboard/classes/');
    let next: ViewState = 'classes';
    if (onClassRoute) {
      const view = searchParams?.get('view') || 'grid';
      next = view === 'seating' ? 'seating_chart' : 'students';
    }
    useLayoutStore.getState().setActiveView(next);
    setEditMode(searchParams?.get('mode') === 'edit');
  }, [pathname, searchParamsKey, searchParams, setEditMode]);

  useEffect(() => {
    viewPreferenceRef.current = viewPreference;
  }, [viewPreference]);

  useEffect(() => {
    const handleClassUpdate = () => {
      void refreshDashboardClassesForUserAction();
    };
    window.addEventListener('classUpdated', handleClassUpdate);
    return () => window.removeEventListener('classUpdated', handleClassUpdate);
  }, []);

  useEffect(() => {
    const inClassRoute = !!pathname?.includes('/dashboard/classes/');
    const params = new URLSearchParams(window.location.search);
    const hasView = params.has('view');
    if (!inClassRoute) return;
    if (hasView) return;

    if (viewPreferenceRef.current === 'seating') {
      params.set('view', 'seating');
    } else {
      params.delete('view');
      params.delete('mode');
    }

    const base = pathname ?? '/';
    const currentSearch = window.location.search;
    const currentUrl = currentSearch ? `${base}${currentSearch}` : base;
    const newUrl = params.toString() ? `${base}?${params.toString()}` : base;
    if (newUrl === currentUrl) {
      return;
    }
    router.replace(newUrl, { scroll: false });
  }, [pathname, router]);

  return {
    currentClassId,
  };
}
