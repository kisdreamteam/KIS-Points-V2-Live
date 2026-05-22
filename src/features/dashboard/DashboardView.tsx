'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLayoutStore } from '@/stores/useLayoutStore';
import ClassesView from '@/features/classes/ClassesView';
import StudentsView from '@/features/students/StudentsView';
import { DashboardStudentSync } from '@/hooks/sync/useDashboardStudentSync';
import { SeatingChartDataSync } from '@/hooks/sync/useSeatingChartDataSync';
import { DashboardProfileSync } from '@/hooks/sync/useDashboardProfileSync';
import { DashboardClassesFilterSync } from '@/hooks/sync/useDashboardClassesFilterSync';

function getDashboardClassIdFromPath(pathname: string | null): string | null {
  return pathname?.match(/\/dashboard\/classes\/([^/]+)/)?.[1] ?? null;
}

function DashboardStageContent() {
  const activeView = useLayoutStore((s) => s.activeView);
  const pathname = usePathname();
  const router = useRouter();
  const classId = getDashboardClassIdFromPath(pathname);

  useEffect(() => {
    if ((activeView === 'students' || activeView === 'seating_chart') && !classId) {
      router.replace('/dashboard');
    }
  }, [activeView, classId, router]);

  if ((activeView === 'students' || activeView === 'seating_chart') && !classId) {
    return null;
  }

  switch (activeView) {
    case 'classes':
      return <ClassesView />;
    case 'students':
    case 'seating_chart':
      return <StudentsView />;
    default:
      return <ClassesView />;
  }
}

function DashboardViewFallback() {
  return (
    <div className="flex items-center justify-center h-screen bg-brand-purple">
      <div className="text-white">Loading...</div>
    </div>
  );
}

export default function DashboardView() {
  const pathname = usePathname();
  const classId = getDashboardClassIdFromPath(pathname);

  return (
    <Suspense fallback={<DashboardViewFallback />}>
      <DashboardStudentSync />
      <SeatingChartDataSync />
      <DashboardProfileSync />
      <DashboardClassesFilterSync />
      {/* <ClassesView> and <StudentsView> are the two main views for the dashboard */}
      <DashboardStageContent key={classId ?? 'dashboard-root'} />
    </Suspense>
  );
}
