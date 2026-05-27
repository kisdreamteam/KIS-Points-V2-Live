'use client';

import type { ReactNode, CSSProperties } from 'react';

export type WorkspaceToolbarAction = {
  id: string;
  icon: ReactNode;
  title: string;
  onClick?: () => void;
  disabled?: boolean;
  /** When true, uses active (e.g. purple) button styling */
  active?: boolean;
  /** When muted and inactive, uses gray inactive styling */
  variant?: 'default' | 'muted' | 'danger';
};

export type WorkspaceToolbarProps = {
  topActions: WorkspaceToolbarAction[];
  bottomActions: WorkspaceToolbarAction[];
  /** Rendered after top actions, before the flex spacer */
  topSlot?: ReactNode;
  /** Rendered after the flex spacer, before bottom actions */
  bottomSlot?: ReactNode;
  /** Extra class names for the outer pill */
  className?: string;
  /** aria-label for the toolbar region */
  'aria-label'?: string;
  /** Optional style from parent layout container */
  style?: CSSProperties;
};

const toolbarButtonBase =
  'w-10 h-10 rounded-lg flex items-center justify-center shadow transition-colors';

export function toolbarButtonClass(options?: {
  disabled?: boolean;
  active?: boolean;
  variant?: 'default' | 'muted' | 'danger';
}): string {
  if (options?.disabled) {
    return `${toolbarButtonBase} bg-white/60 cursor-not-allowed opacity-60`;
  }
  if (options?.active) {
    return `${toolbarButtonBase} bg-purple-100 hover:bg-purple-200`;
  }
  if (options?.variant === 'danger') {
    return `${toolbarButtonBase} bg-brand-pink text-white hover:brightness-95`;
  }
  if (options?.variant === 'muted' && !options?.active) {
    return `${toolbarButtonBase} bg-gray-200 hover:bg-gray-300 opacity-75`;
  }
  return `${toolbarButtonBase} bg-white/90 hover:bg-white`;
}

function buttonClass(action: WorkspaceToolbarAction): string {
  return toolbarButtonClass({
    disabled: action.disabled,
    active: action.active,
    variant: action.variant,
  });
}

export default function WorkspaceToolbar({
  topActions,
  bottomActions,
  topSlot,
  bottomSlot,
  className = '',
  'aria-label': ariaLabel = 'Workspace actions',
  style,
}: WorkspaceToolbarProps) {
  const overflowClass = topSlot || bottomSlot ? 'overflow-visible' : 'overflow-hidden';

  return (
    <div
      data-workspace-toolbar
      className={`flex w-full min-h-0 flex-col gap-2 ${overflowClass} p-2 bg-white/80 border-0 border-top-brand-purple ${className}`}
      style={style}
      aria-label={ariaLabel}
    >
      {topActions.map((action) => (
        <button
          key={action.id}
          type="button"
          onClick={action.disabled ? undefined : action.onClick}
          disabled={action.disabled}
          title={action.title}
          aria-label={action.title}
          className={buttonClass(action)}
        >
          {action.icon}
        </button>
      ))}
      {topSlot}
      <div className="min-h-0 flex-1" aria-hidden="true" />
      {bottomSlot}
      {bottomActions.map((action) => (
        <button
          key={action.id}
          type="button"
          onClick={action.disabled ? undefined : action.onClick}
          disabled={action.disabled}
          title={action.title}
          aria-label={action.title}
          className={buttonClass(action)}
        >
          {action.icon}
        </button>
      ))}
    </div>
  );
}
