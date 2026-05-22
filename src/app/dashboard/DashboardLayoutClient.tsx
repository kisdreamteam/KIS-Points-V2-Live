'use client';

import { DashboardClassesSync } from '@/hooks/sync/useDashboardClassesSync';
import DashboardShell from '@/features/dashboard/layouts/DashboardShell';

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DashboardClassesSync />
      <DashboardShell>{children}</DashboardShell>
    </>
  );
}
