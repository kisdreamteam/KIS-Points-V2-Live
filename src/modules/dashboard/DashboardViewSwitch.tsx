'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLayoutStore } from '@/stores/useLayoutStore';
import ClassesView from '@/components/dashboard/ClassesView';
import StudentsView from '../students/StudentsView';

export default function DashboardViewSwitch() {
  const activeView = useLayoutStore((s) => s.activeView);
  const pathname = usePathname();
  const router = useRouter();
  const classId = pathname?.match(/\/dashboard\/classes\/([^/]+)/)?.[1] ?? null;

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
