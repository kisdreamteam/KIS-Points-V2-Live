'use client';

import { generateNegativeIconPaths } from '@/lib/iconUtils';

/**
 * Hook to get negative icon paths (static, no detection needed)
 */
export function useAvailableNegativeIcons() {
  return generateNegativeIconPaths(7);
}
