'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type Position = { x: number; y: number };

type MovableToolPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
};

const DEFAULT_PANEL_WIDTH = 672;
const DEFAULT_PANEL_HEIGHT = 400;

function getCenteredPosition(width: number, height: number): Position {
  if (typeof window === 'undefined') {
    return { x: 16, y: 16 };
  }
  return {
    x: Math.max(16, (window.innerWidth - width) / 2),
    y: Math.max(16, (window.innerHeight - height) / 2),
  };
}

export default function MovableToolPanel({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}: MovableToolPanelProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [position, setPosition] = useState<Position>(() =>
    getCenteredPosition(DEFAULT_PANEL_WIDTH, DEFAULT_PANEL_HEIGHT)
  );
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef<Position>({ x: 0, y: 0 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const el = panelRef.current;
    const width = el?.offsetWidth ?? DEFAULT_PANEL_WIDTH;
    const height = el?.offsetHeight ?? DEFAULT_PANEL_HEIGHT;
    setPosition(getCenteredPosition(width, height));
  }, [isOpen]);

  const handleHeaderPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    dragOffsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [position.x, position.y]);

  const handleHeaderPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragOffsetRef.current.x,
      y: e.clientY - dragOffsetRef.current.y,
    });
  }, [isDragging]);

  const handleHeaderPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, [isDragging]);

  if (!isOpen || !isMounted) return null;

  return createPortal(
    <div
      ref={panelRef}
      className={[
        'fixed z-[120] flex flex-col rounded-xl bg-white shadow-2xl border border-gray-200',
        'w-[min(100vw-2rem,42rem)] max-h-[min(90dvh,720px)] overflow-hidden',
        className,
      ].join(' ')}
      style={{ left: position.x, top: position.y }}
      role="dialog"
      aria-modal="false"
      aria-label={title ?? 'Tool panel'}
    >
      <div
        className={[
          'flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 bg-brand-purple shrink-0 select-none touch-none',
          isDragging ? 'cursor-grabbing' : 'cursor-grab',
        ].join(' ')}
        onPointerDown={handleHeaderPointerDown}
        onPointerMove={handleHeaderPointerMove}
        onPointerUp={handleHeaderPointerUp}
        onPointerCancel={handleHeaderPointerUp}
      >
        <span className="text-white font-semibold text-sm truncate">
          {title ?? 'Tool'}
        </span>
        <button
          type="button"
          onClick={onClose}
          onPointerDown={(e) => e.stopPropagation()}
          className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors shrink-0"
          aria-label="Close"
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div
        className="overflow-y-auto min-h-0 flex-1 p-4"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
