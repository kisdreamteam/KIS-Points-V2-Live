'use client';

import { type CSSProperties, type RefObject, useCallback, useEffect, useState } from 'react';

interface UseAnchoredDropdownPortalArgs {
  isOpen: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  offsetTop?: number;
  widthPx?: number;
}

interface PortalPosition {
  top: number;
  left: number;
}

export function useAnchoredDropdownPortal({
  isOpen,
  anchorRef,
  offsetTop = 48,
  widthPx = 224,
}: UseAnchoredDropdownPortalArgs) {
  const [isMounted, setIsMounted] = useState(false);
  const [position, setPosition] = useState<PortalPosition | null>(null);

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) {
      setPosition(null);
      return;
    }

    const rect = anchor.getBoundingClientRect();
    const left = Math.round(rect.right - widthPx);
    const top = Math.round(rect.top + offsetTop);
    setPosition({ top, left });
  }, [anchorRef, offsetTop, widthPx]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  const portalStyle: CSSProperties | null = position
    ? {
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 50,
      }
    : null;

  return {
    isMounted,
    portalStyle,
  };
}
