'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type LargeToolModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  closeOnBackdrop?: boolean;
};

export default function LargeToolModal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  closeOnBackdrop = true,
}: LargeToolModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isOpen || !isMounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-[5vh_5vw]"
      role="dialog"
      aria-modal="true"
      aria-label={title ?? 'Tool'}
    >
      {closeOnBackdrop && (
        <button
          type="button"
          className="absolute inset-0 bg-black/50 cursor-default"
          aria-label="Close"
          onClick={onClose}
        />
      )}
      <div
        className={[
          'relative z-10 flex flex-col w-[90vw] h-[90dvh] max-w-[90vw] max-h-[90dvh] rounded-2xl overflow-hidden shadow-2xl bg-brand-purple',
          className,
        ].join(' ')}
      >
        <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-white/20 shrink-0">
          <span className="text-white font-semibold text-lg truncate">
            {title ?? 'Tool'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors shrink-0"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6 text-white"
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
        <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
      </div>
    </div>,
    document.body
  );
}
