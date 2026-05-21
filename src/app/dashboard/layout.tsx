'use client';

import { Suspense } from 'react';
import { DashboardClassesSync } from '@/hooks/sync/useDashboardClassesSync';
import DashboardShell from '@/features/dashboard/layouts/DashboardShell';

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DashboardClassesSync />
      <Suspense fallback={<DashboardShellFallback />}>
        <DashboardShell>{children}</DashboardShell>
      </Suspense>
    </>
  );
}

function DashboardShellFallback() {
  return (
    <div className="flex items-center justify-center h-screen bg-brand-purple">
      <div className="text-white">Loading...</div>
    </div>
  );
}
