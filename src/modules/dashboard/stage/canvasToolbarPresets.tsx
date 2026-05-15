'use client';

import type { ReactNode } from 'react';

import IconAddPlus from '@/components/ui/icons/iconAddPlus';
import IconEditPencil from '@/components/ui/icons/iconEditPencil';
import IconPresentationBoard from '@/components/ui/icons/iconPresentationBoard';
import IconDocumentClock from '@/components/ui/icons/iconDocumentClock';
import type {
  ToolbarActionDef,
  ToolbarActionId,
} from '@/components/dashboard/frame/dashboardZoneConfig';
import type { CanvasToolbarAction } from '@/components/ui/CanvasToolbar';
import { STUDENT_EVENTS } from '@/lib/events/students';

type Preset = {
  event: string;
  renderIcon: (disabled: boolean) => ReactNode;
  variant?: 'default' | 'muted';
};

const PRESETS: Record<ToolbarActionId, Preset> = {
  'close-editor': {
    event: STUDENT_EVENTS.STAGE_CLOSE_EDITOR,
    renderIcon: () => (
      <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  add: {
    event: STUDENT_EVENTS.STAGE_CREATE_LAYOUT,
    renderIcon: (d) => <IconAddPlus className={d ? 'w-6 h-6 text-gray-500' : 'w-6 h-6 text-black'} />,
  },
  edit: {
    event: STUDENT_EVENTS.STAGE_OPEN_SEATING_EDITOR,
    renderIcon: (d) => (
      <IconEditPencil className={d ? 'w-6 h-6 text-gray-500' : 'w-6 h-6 text-black'} strokeWidth={2} />
    ),
  },
  'layout-manager': {
    event: STUDENT_EVENTS.STAGE_TOGGLE_LAYOUT_MANAGER,
    renderIcon: () => (
      <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
      </svg>
    ),
  },
  'teacher-view': {
    event: STUDENT_EVENTS.STAGE_TOGGLE_TEACHER_VIEW,
    renderIcon: (d) => (
      <IconPresentationBoard
        className={d ? 'w-6 h-6 text-gray-500' : 'w-6 h-6 text-black'}
        strokeWidth={2}
      />
    ),
    variant: 'muted',
  },
  'point-log': {
    event: STUDENT_EVENTS.STAGE_TOGGLE_POINT_LOG,
    renderIcon: () => <IconDocumentClock className="w-6 h-6 text-black" strokeWidth={2} />,
  },
};

export function toCanvasAction(action: ToolbarActionDef): CanvasToolbarAction {
  const preset = PRESETS[action.id];
  return {
    ...action,
    icon: preset.renderIcon(!!action.disabled),
    onClick: action.disabled
      ? undefined
      : () => window.dispatchEvent(new CustomEvent(preset.event)),
    variant: preset.variant,
  };
}
