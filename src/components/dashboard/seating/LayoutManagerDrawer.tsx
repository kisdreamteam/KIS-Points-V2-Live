'use client';

import type { CSSProperties, KeyboardEvent, MouseEvent } from 'react';
import { useState } from 'react';
import type { SeatingChartRecord } from '@/lib/api/seating';

type LayoutManagerDrawerProps = {
  isOpen: boolean;
  position: 'fixed' | 'absolute';
  rightPx: number;
  topPx: number;
  bottomPx: number;
  zIndex?: number;
  layouts: SeatingChartRecord[];
  selectedLayoutId: string | null;
  onSelectLayout: (layoutId: string) => void;
  onRenameLayout: (layoutId: string, newName: string) => Promise<void>;
  onDeleteLayout: (layoutId: string, layoutName: string) => void;
};

export default function LayoutManagerDrawer({
  isOpen,
  position,
  rightPx,
  topPx,
  bottomPx,
  zIndex = 30,
  layouts,
  selectedLayoutId,
  onSelectLayout,
  onRenameLayout,
  onDeleteLayout,
}: LayoutManagerDrawerProps) {
  const [editingLayoutId, setEditingLayoutId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const style: CSSProperties = {
    position,
    top: topPx,
    bottom: bottomPx,
    right: rightPx,
    width: 'min(520px, calc(100% - 160px))',
    transform: isOpen ? 'translateX(0)' : 'translateX(110%)',
    opacity: isOpen ? 1 : 0,
    pointerEvents: isOpen ? 'auto' : 'none',
    zIndex,
  };

  const startEditing = (layout: SeatingChartRecord, e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setEditingLayoutId(layout.id);
    setEditingValue(layout.name);
  };

  const cancelEditing = () => {
    setEditingLayoutId(null);
    setEditingValue('');
  };

  const saveEditing = async (layoutId: string) => {
    const trimmed = editingValue.trim();
    if (!trimmed) return;
    const original = layouts.find((layout) => layout.id === layoutId)?.name ?? '';
    if (trimmed === original.trim()) {
      cancelEditing();
      return;
    }

    setIsSaving(true);
    try {
      await onRenameLayout(layoutId, trimmed);
      cancelEditing();
    } finally {
      setIsSaving(false);
    }
  };

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>, layoutId: string) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void saveEditing(layoutId);
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      cancelEditing();
    }
  };

  return (
    <div className="transition-all duration-300 ease-out " style={style}>
      <div className="h-full rounded-xl border-2 border-black bg-brand-cream/50 backdrop-blur-lg shadow-lg overflow-hidden flex flex-col font-spartan">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-brand-cream/20 backdrop-blur-lg">
          <h3 className="font-semibold text-gray-900">Layouts</h3>
          <span className="text-sm text-gray-500">{layouts.length} total</span>
        </div>

        <div className="flex-1 overflow-auto">
          {layouts.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500 text-sm px-4">
              No layouts available.
            </div>
          ) : (
            <div>
              {layouts.map((layout, index) => {
                const isActive = selectedLayoutId === layout.id;
                const isEditing = editingLayoutId === layout.id;

                return (
                  <div
                    key={layout.id}
                    className={[
                      'px-4 py-2 border-b border-gray-100',
                      index % 2 === 0 ? 'bg-white/50 backdrop-blur-sm' : 'bg-brand-cream/10 backdrop-blur-sm shadow-lg',
                      isActive ? 'ring-5 ring-inset ring-brand-pink' : '',
                    ].join(' ')}
                    onClick={() => {
                      if (!isEditing) {
                        onSelectLayout(layout.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        if (!isEditing) {
                          onSelectLayout(layout.id);
                        }
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingValue}
                            autoFocus
                            onChange={(event) => setEditingValue(event.target.value)}
                            onClick={(event) => event.stopPropagation()}
                            onKeyDown={(event) => onInputKeyDown(event, layout.id)}
                            onBlur={() => {
                              if (!isSaving) {
                                void saveEditing(layout.id);
                              }
                            }}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        ) : (
                          <p className="text-sm text-gray-900 truncate">{layout.name}</p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(event) => startEditing(layout, event)}
                        className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                        title="Rename layout"
                        aria-label="Rename layout"
                        disabled={isSaving}
                      >
                        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDeleteLayout(layout.id, layout.name);
                        }}
                        className="p-1.5 rounded hover:bg-red-100 transition-colors"
                        title="Delete layout"
                        aria-label="Delete layout"
                        disabled={isSaving}
                      >
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
