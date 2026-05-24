'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signOutCurrentUser } from '@/lib/api/auth.service';

export function useDashboardSessionActions() {
  const router = useRouter();

  const onLogoutStudentsNav = useCallback(async () => {
    try {
      await signOutCurrentUser();
      router.push('/login');
    } catch (err) {
      console.error('Unexpected error during logout:', err);
      alert('An unexpected error occurred. Please try again.');
    }
  }, [router]);

  return { onLogoutStudentsNav };
}
