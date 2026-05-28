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
  resizable?: boolean;
  minScale?: number;
  initialScale?: number;
};

const DEFAULT_PANEL_WIDTH = 672;
const DEFAULT_PANEL_HEIGHT = 400;
const SIZE_EPSILON = 1;

function getCenteredPosition(width: number, height: number): Position {
  if (typeof window === 'undefined') {
    return { x: 16, y: 16 };
  }
  return {
    x: Math.max(16, (window.innerWidth - width) / 2),
    y: Math.max(16, (window.innerHeight - height) / 2),
  };
}

function getResizeBounds(minScale: number) {
  const minWidth = Math.round(DEFAULT_PANEL_WIDTH * minScale);
  const minHeight = Math.round(DEFAULT_PANEL_HEIGHT * minScale);
  const maxWidth =
    typeof window !== 'undefined'
      ? Math.min(window.innerWidth - 32, 42 * 16)
      : 42 * 16;
  const maxHeight =
    typeof window !== 'undefined'
      ? Math.min(window.innerHeight * 0.9, 720)
      : 720;
  return { minWidth, minHeight, maxWidth, maxHeight };
}

function clampResizableSize(
  width: number,
  height: number,
  minWidth: number,
  minHeight: number,
  maxWidth: number,
  maxHeight: number,
  heightCapAtMaxWidth: number
) {
  let nextWidth = Math.round(Math.min(Math.max(minWidth, width), maxWidth));
  let nextHeight = Math.round(Math.min(Math.max(minHeight, height), maxHeight));

  const atMaxWidth = nextWidth >= maxWidth - SIZE_EPSILON;
  const atMaxHeight = nextHeight >= maxHeight - SIZE_EPSILON;

  if (atMaxWidth) {
    nextWidth = maxWidth;
    nextHeight = Math.min(nextHeight, heightCapAtMaxWidth);
  }

  if (atMaxHeight) {
    nextHeight = maxHeight;
    nextWidth = maxWidth;
  }

  if (nextWidth >= maxWidth - SIZE_EPSILON) {
    nextWidth = maxWidth;
    nextHeight = Math.min(nextHeight, heightCapAtMaxWidth);
  }

  nextWidth = Math.round(Math.min(Math.max(minWidth, nextWidth), maxWidth));
  nextHeight = Math.round(Math.min(Math.max(minHeight, nextHeight), maxHeight));

  return { width: nextWidth, height: nextHeight };
}

export default function MovableToolPanel({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  resizable = false,
  minScale = 0.5,
  initialScale = 1,
}: MovableToolPanelProps) {
  const clampedInitialScale = Math.max(minScale, Math.min(1, initialScale));
  const defaultWidth = Math.round(DEFAULT_PANEL_WIDTH * clampedInitialScale);
  const defaultHeight = Math.round(DEFAULT_PANEL_HEIGHT * clampedInitialScale);
  const [isMounted, setIsMounted] = useState(false);
  const [position, setPosition] = useState<Position>(() =>
    getCenteredPosition(defaultWidth, defaultHeight)
  );
  const [size, setSize] = useState(() => ({
    width: defaultWidth,
    height: defaultHeight,
  }));
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef<Position>({ x: 0, y: 0 });
  const resizeStartRef = useRef({ width: 0, height: 0, x: 0, y: 0 });

  const applyClampedSize = useCallback(
    (width: number, height: number) => {
      const { minWidth, minHeight, maxWidth, maxHeight } = getResizeBounds(minScale);
      const clamped = clampResizableSize(
        width,
        height,
        minWidth,
        minHeight,
        maxWidth,
        maxHeight,
        defaultHeight
      );

      const node = panelRef.current;
      if (node) {
        node.style.width = `${clamped.width}px`;
        node.style.height = `${clamped.height}px`;
      }

      setSize(clamped);
      return clamped;
    },
    [defaultHeight, minScale]
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const width = defaultWidth;
    const height = defaultHeight;
    setSize({ width, height });
    setPosition(getCenteredPosition(width, height));
    const node = panelRef.current;
    if (node && resizable) {
      node.style.width = `${width}px`;
      node.style.height = `${height}px`;
    }
  }, [defaultHeight, defaultWidth, isOpen, resizable]);

  useEffect(() => {
    if (!resizable) return;
    const node = panelRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return;

    const { minWidth, minHeight, maxWidth, maxHeight } = getResizeBounds(minScale);

    const observer = new ResizeObserver((entries) => {
      if (isResizing) return;
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      const clamped = clampResizableSize(
        width,
        height,
        minWidth,
        minHeight,
        maxWidth,
        maxHeight,
        defaultHeight
      );
      if (
        Math.abs(clamped.width - width) > SIZE_EPSILON ||
        Math.abs(clamped.height - height) > SIZE_EPSILON
      ) {
        node.style.width = `${clamped.width}px`;
        node.style.height = `${clamped.height}px`;
      }
      setSize(clamped);
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [defaultHeight, isResizing, minScale, resizable]);

  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      resizeStartRef.current = {
        width: size.width,
        height: size.height,
        x: e.clientX,
        y: e.clientY,
      };
      setIsResizing(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [size.height, size.width]
  );

  const handleResizePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isResizing) return;
      const deltaX = e.clientX - resizeStartRef.current.x;
      const deltaY = e.clientY - resizeStartRef.current.y;
      applyClampedSize(
        resizeStartRef.current.width + deltaX,
        resizeStartRef.current.height + deltaY
      );
    },
    [applyClampedSize, isResizing]
  );

  const handleResizePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isResizing) return;
      applyClampedSize(size.width, size.height);
      setIsResizing(false);
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    },
    [applyClampedSize, isResizing, size.height, size.width]
  );

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

  const { minWidth, minHeight } = getResizeBounds(minScale);

  return createPortal(
    <div
      ref={panelRef}
      className={[
        'fixed z-[120] flex flex-col rounded-xl bg-white shadow-2xl border border-gray-200',
        resizable ? 'overflow-hidden' : 'w-[min(100vw-2rem,42rem)] max-h-[min(90dvh,720px)] overflow-hidden',
        className,
      ].join(' ')}
      style={{
        left: position.x,
        top: position.y,
        ...(resizable
          ? {
              width: `${size.width}px`,
              height: `${size.height}px`,
              minWidth: `${minWidth}px`,
              minHeight: `${minHeight}px`,
            }
          : {}),
      }}
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
      {resizable ? (
        <div
          role="button"
          tabIndex={0}
          aria-label="Resize panel"
          className="absolute bottom-0 right-0 z-10 h-4 w-4 cursor-nwse-resize touch-none select-none"
          onPointerDown={handleResizePointerDown}
          onPointerMove={handleResizePointerMove}
          onPointerUp={handleResizePointerUp}
          onPointerCancel={handleResizePointerUp}
        >
          <svg
            className="absolute bottom-0.5 right-0.5 h-3 w-3 text-gray-400 pointer-events-none"
            viewBox="0 0 12 12"
            fill="currentColor"
            aria-hidden
          >
            <path d="M12 12H8V10H10V8H12V12ZM10 12H6V10H8V8H10V12ZM8 12H4V10H6V8H8V12Z" />
          </svg>
        </div>
      ) : null}
    </div>,
    document.body
  );
}
