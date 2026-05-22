'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import DashboardViewSwitch from '@/features/dashboard/DashboardViewSwitch';
import { DashboardStudentSync } from '@/hooks/sync/useDashboardStudentSync';
import { SeatingChartDataSync } from '@/hooks/sync/useSeatingChartDataSync';
import { DashboardProfileSync } from '@/hooks/sync/useDashboardProfileSync';
import { DashboardClassesFilterSync } from '@/hooks/sync/useDashboardClassesFilterSync';

export default function DashboardView() {
  const pathname = usePathname();
  const classId = pathname?.match(/\/dashboard\/classes\/([^/]+)/)?.[1] ?? null;

  return (
    <Suspense fallback={<DashboardViewFallback />}>
      <DashboardStudentSync />
      <SeatingChartDataSync />
      <DashboardProfileSync />
      <DashboardClassesFilterSync />
      <DashboardViewSwitch key={classId ?? 'dashboard-root'} />
    </Suspense>
  );
}

function DashboardViewFallback() {
  return (
    <div className="flex items-center justify-center h-screen bg-brand-purple">
      <div className="text-white">Loading...</div>
    </div>
  );
}
