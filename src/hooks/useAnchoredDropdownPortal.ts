'use client';

import { type CSSProperties, type RefObject, useCallback, useEffect, useState } from 'react';

export type AnchoredDropdownPlacement =
  | 'below'
  | 'leftOfAnchor'
  | 'leftOfAnchorDown'
  | 'leftOfAnchorAbove';

interface UseAnchoredDropdownPortalArgs {
  isOpen: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  placement?: AnchoredDropdownPlacement;
  offsetTop?: number;
  widthPx?: number;
  gapPx?: number;
  zIndex?: number;
}

interface PortalPosition {
  top: number;
  left: number;
  transform?: string;
}

export function useAnchoredDropdownPortal({
  isOpen,
  anchorRef,
  placement = 'below',
  offsetTop = 48,
  widthPx = 224,
  gapPx = 8,
  zIndex = 100,
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
    if (placement === 'leftOfAnchor') {
      setPosition({
        top: Math.round(rect.top),
        left: Math.round(rect.left - widthPx - gapPx),
      });
      return;
    }

    if (placement === 'leftOfAnchorDown') {
      setPosition({
        top: Math.round(rect.top),
        left: Math.round(rect.left - widthPx - gapPx),
      });
      return;
    }

    if (placement === 'leftOfAnchorAbove') {
      setPosition({
        top: Math.round(rect.bottom),
        left: Math.round(rect.left - widthPx - gapPx),
        transform: `translateY(calc(-100% - ${gapPx}px))`,
      });
      return;
    }

    setPosition({
      top: Math.round(rect.top + offsetTop),
      left: Math.round(rect.right - widthPx),
    });
  }, [anchorRef, gapPx, offsetTop, placement, widthPx]);

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
        transform: position.transform,
        zIndex,
      }
    : null;

  return {
    isMounted,
    portalStyle,
  };
}
