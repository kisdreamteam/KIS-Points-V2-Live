'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type Position = { x: number; y: number };
type PanelSize = { width: number; height: number };
type StoredPanelState = PanelSize & Position;
type PanelPlacement = 'center' | 'bottom-right';

type MovableToolPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  resizable?: boolean;
  minScale?: number;
  initialScale?: number;
  storageKey?: string;
  defaultPlacement?: PanelPlacement;
};

const DEFAULT_PANEL_WIDTH = 672;
const DEFAULT_PANEL_HEIGHT = 400;
const PANEL_ASPECT = DEFAULT_PANEL_WIDTH / DEFAULT_PANEL_HEIGHT;

function getCenteredPosition(width: number, height: number): Position {
  if (typeof window === 'undefined') {
    return { x: 16, y: 16 };
  }
  return {
    x: Math.max(16, (window.innerWidth - width) / 2),
    y: Math.max(16, (window.innerHeight - height) / 2),
  };
}

function getBottomRightPosition(width: number, height: number): Position {
  const margin = 16;
  const gapAboveNav = 12;

  if (typeof window === 'undefined') {
    return { x: margin, y: margin };
  }

  const nav = document.querySelector('[data-bottom-nav]');
  const navHeight = nav?.getBoundingClientRect().height ?? 80;
  const main = document.querySelector('main');

  if (main) {
    const rect = main.getBoundingClientRect();
    return {
      x: Math.max(margin, rect.right - width - margin),
      y: Math.max(margin, rect.bottom - height - navHeight - gapAboveNav),
    };
  }

  return {
    x: Math.max(margin, window.innerWidth - width - margin),
    y: Math.max(margin, window.innerHeight - height - navHeight - gapAboveNav),
  };
}

function getDefaultPosition(
  width: number,
  height: number,
  placement: PanelPlacement
): Position {
  if (placement === 'bottom-right') {
    return getBottomRightPosition(width, height);
  }
  return getCenteredPosition(width, height);
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

function clampProportionalSize(
  width: number,
  height: number,
  minWidth: number,
  minHeight: number,
  maxWidth: number,
  maxHeight: number,
  aspect: number
) {
  let nextWidth = Math.round(width);
  let nextHeight = Math.round(nextWidth / aspect);

  if (nextWidth < minWidth) {
    nextWidth = minWidth;
    nextHeight = Math.round(nextWidth / aspect);
  }
  if (nextWidth > maxWidth) {
    nextWidth = maxWidth;
    nextHeight = Math.round(nextWidth / aspect);
  }
  if (nextHeight < minHeight) {
    nextHeight = minHeight;
    nextWidth = Math.round(nextHeight * aspect);
  }
  if (nextHeight > maxHeight) {
    nextHeight = maxHeight;
    nextWidth = Math.round(nextHeight * aspect);
  }

  nextWidth = Math.round(Math.min(Math.max(minWidth, nextWidth), maxWidth));
  nextHeight = Math.round(Math.min(Math.max(minHeight, nextHeight), maxHeight));

  return { width: nextWidth, height: nextHeight };
}

function readStoredPanelState(
  storageKey: string,
  minWidth: number,
  minHeight: number,
  maxWidth: number,
  maxHeight: number
): StoredPanelState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredPanelState>;
    if (
      typeof parsed.width !== 'number' ||
      typeof parsed.height !== 'number' ||
      typeof parsed.x !== 'number' ||
      typeof parsed.y !== 'number'
    ) {
      return null;
    }
    const clamped = clampProportionalSize(
      parsed.width,
      parsed.height,
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
      PANEL_ASPECT
    );
    return { ...clamped, x: parsed.x, y: parsed.y };
  } catch {
    return null;
  }
}

function writeStoredPanelState(storageKey: string, state: StoredPanelState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // ignore quota / private mode errors
  }
}

function getInitialPanelState(
  storageKey: string | undefined,
  defaultWidth: number,
  defaultHeight: number,
  minScale: number,
  placement: PanelPlacement
): StoredPanelState {
  const { minWidth, minHeight, maxWidth, maxHeight } = getResizeBounds(minScale);
  if (storageKey) {
    const stored = readStoredPanelState(storageKey, minWidth, minHeight, maxWidth, maxHeight);
    if (stored) return stored;
  }
  const size = clampProportionalSize(
    defaultWidth,
    defaultHeight,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    PANEL_ASPECT
  );
  const position = getDefaultPosition(size.width, size.height, placement);
  return { ...size, ...position };
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
  storageKey,
  defaultPlacement = 'center',
}: MovableToolPanelProps) {
  const clampedInitialScale = Math.max(minScale, Math.min(1, initialScale));
  const defaultWidth = Math.round(DEFAULT_PANEL_WIDTH * clampedInitialScale);
  const defaultHeight = Math.round(DEFAULT_PANEL_HEIGHT * clampedInitialScale);

  const [isMounted, setIsMounted] = useState(false);
  const [position, setPosition] = useState<Position>(() => {
    const initial = getInitialPanelState(
      storageKey,
      defaultWidth,
      defaultHeight,
      minScale,
      defaultPlacement
    );
    return { x: initial.x, y: initial.y };
  });
  const [size, setSize] = useState<PanelSize>(() => {
    const initial = getInitialPanelState(
      storageKey,
      defaultWidth,
      defaultHeight,
      minScale,
      defaultPlacement
    );
    return { width: initial.width, height: initial.height };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef<Position>({ x: 0, y: 0 });
  const resizeStartRef = useRef({ width: 0, height: 0, x: 0, y: 0 });
  const sizeRef = useRef(size);
  const positionRef = useRef(position);
  const hasHydratedFromStorageRef = useRef(false);
  const wasOpenRef = useRef(false);

  sizeRef.current = size;
  positionRef.current = position;

  const persistPanelState = useCallback(
    (nextSize: PanelSize, nextPosition: Position) => {
      if (!storageKey) return;
      writeStoredPanelState(storageKey, {
        width: nextSize.width,
        height: nextSize.height,
        x: nextPosition.x,
        y: nextPosition.y,
      });
    },
    [storageKey]
  );

  const applyClampedSize = useCallback(
    (width: number, height: number) => {
      const { minWidth, minHeight, maxWidth, maxHeight } = getResizeBounds(minScale);
      const clamped = clampProportionalSize(
        width,
        height,
        minWidth,
        minHeight,
        maxWidth,
        maxHeight,
        PANEL_ASPECT
      );

      const node = panelRef.current;
      if (node) {
        node.style.width = `${clamped.width}px`;
        node.style.height = `${clamped.height}px`;
      }

      setSize(clamped);
      sizeRef.current = clamped;
      return clamped;
    },
    [minScale]
  );

  const applyProportionalResize = useCallback(
    (deltaX: number, deltaY: number) => {
      const start = resizeStartRef.current;
      const scaleFactor =
        ((start.width + deltaX) / start.width + (start.height + deltaY) / start.height) / 2;
      return applyClampedSize(
        Math.round(start.width * scaleFactor),
        Math.round(start.height * scaleFactor)
      );
    },
    [applyClampedSize]
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !resizable) {
      wasOpenRef.current = isOpen;
      return;
    }

    const justOpened = !wasOpenRef.current;
    wasOpenRef.current = true;

    if (!justOpened) return;

    if (storageKey && !hasHydratedFromStorageRef.current) {
      const { minWidth, minHeight, maxWidth, maxHeight } = getResizeBounds(minScale);
      const stored = readStoredPanelState(storageKey, minWidth, minHeight, maxWidth, maxHeight);
      if (stored) {
        setSize({ width: stored.width, height: stored.height });
        setPosition({ x: stored.x, y: stored.y });
        const node = panelRef.current;
        if (node) {
          node.style.width = `${stored.width}px`;
          node.style.height = `${stored.height}px`;
        }
        hasHydratedFromStorageRef.current = true;
        return;
      }
      hasHydratedFromStorageRef.current = true;
    }

    if (storageKey) return;

    const width = defaultWidth;
    const height = defaultHeight;
    setSize({ width, height });
    setPosition(getCenteredPosition(width, height));
    const node = panelRef.current;
    if (node) {
      node.style.width = `${width}px`;
      node.style.height = `${height}px`;
    }
  }, [defaultHeight, defaultWidth, isOpen, minScale, resizable, storageKey]);

  // Keep DOM inline size in sync when panel opens (no ResizeObserver — it was resetting size after drag)
  useEffect(() => {
    if (!isOpen || !resizable) return;
    const node = panelRef.current;
    if (!node) return;
    node.style.width = `${sizeRef.current.width}px`;
    node.style.height = `${sizeRef.current.height}px`;
  }, [isOpen, resizable]);

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
      applyProportionalResize(deltaX, deltaY);
    },
    [applyProportionalResize, isResizing]
  );

  const handleResizePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isResizing) return;
      const deltaX = e.clientX - resizeStartRef.current.x;
      const deltaY = e.clientY - resizeStartRef.current.y;
      const clamped = applyProportionalResize(deltaX, deltaY);
      setIsResizing(false);
      persistPanelState(clamped, positionRef.current);
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    },
    [applyProportionalResize, isResizing, persistPanelState]
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

  const handleHeaderPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      const nextPosition = {
        x: e.clientX - dragOffsetRef.current.x,
        y: e.clientY - dragOffsetRef.current.y,
      };
      setPosition(nextPosition);
      positionRef.current = nextPosition;
      setIsDragging(false);
      persistPanelState(sizeRef.current, nextPosition);
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    },
    [isDragging, persistPanelState]
  );

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
