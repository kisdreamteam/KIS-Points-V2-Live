'use client';

import { useState, useEffect } from 'react';
import {
  detectAvailablePositiveIcons,
  generatePositiveIconPaths,
} from '@/lib/iconUtils';

/**
 * Hook to detect and cache available positive skill icons
 * Detects once on mount and caches the result
 */
export function useAvailablePositiveIcons() {
  const [availableIcons, setAvailableIcons] = useState<string[]>([]);
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const detectIcons = async () => {
      try {
        const count = await detectAvailablePositiveIcons(60);
        if (isMounted) {
          setAvailableIcons(generatePositiveIconPaths(count));
          setIsDetecting(false);
        }
      } catch (error) {
        console.error('Error detecting icons:', error);
        if (isMounted) {
          setAvailableIcons(generatePositiveIconPaths(60));
          setIsDetecting(false);
        }
      }
    };

    detectIcons();

    return () => {
      isMounted = false;
    };
  }, []);

  return { availableIcons, isDetecting };
}
