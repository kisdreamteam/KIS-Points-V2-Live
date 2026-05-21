'use client';

import { Suspense } from 'react';
import { DashboardStudentSync } from '@/hooks/sync/useDashboardStudentSync';
import { SeatingChartDataSync } from '@/hooks/sync/useSeatingChartDataSync';
import { DashboardProfileSync } from '@/hooks/sync/useDashboardProfileSync';
import { DashboardClassesFilterSync } from '@/hooks/sync/useDashboardClassesFilterSync';

export default function DashboardView({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<DashboardViewFallback />}>
      <DashboardStudentSync />
      <SeatingChartDataSync />
      <DashboardProfileSync />
      <DashboardClassesFilterSync />
      {children}
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
