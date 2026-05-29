'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLayoutStore } from '@/stores/useLayoutStore';
import ClassesStage from '@/features/classes/ClassesStage';
import StudentsStage from '@/features/students/StudentsStage';
import { DashboardStudentSync } from '@/features/dashboard/hooks/sync/DashboardStudentSync';
import { SeatingChartDataSync } from '@/features/dashboard/hooks/sync/SeatingChartDataSync';
import { DashboardProfileSync } from '@/features/dashboard/hooks/sync/DashboardProfileSync';
import { DashboardClassesFilterSync } from '@/features/dashboard/hooks/sync/DashboardClassesFilterSync';
import { AttendanceSync } from '@/features/dashboard/hooks/sync/useAttendanceSync';

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
      return <ClassesStage />;
    case 'students':
    case 'seating_chart':
      return <StudentsStage />;
    default:
      return <ClassesStage />;
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
      <AttendanceSync />
      <DashboardProfileSync />
      <DashboardClassesFilterSync />
      {/* <ClassesStage> and <StudentsStage> are the two main stage views for the dashboard */}
      <DashboardStageContent key={classId ?? 'dashboard-root'} />
    </Suspense>
  );
}
