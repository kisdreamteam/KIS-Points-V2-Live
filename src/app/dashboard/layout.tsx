import { Suspense } from 'react';
import DashboardShell from '@/features/dashboard/layouts/DashboardShell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-brand-purple">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
