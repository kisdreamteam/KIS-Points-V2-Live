import React from 'react';

export type BotNavGrayButtonVariant = 'default' | 'primary' | 'danger';

interface BotNavGrayButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  enabled?: boolean;
  variant?: BotNavGrayButtonVariant;
  /** Highlights default-variant buttons (e.g. active tool). */
  active?: boolean;
  /** Keeps layout size while hiding visuals (Zone 6 pixel-lock placeholders). */
  visuallyHidden?: boolean;
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
  wrapperRef?: React.RefObject<HTMLDivElement | null>;
  stopPropagation?: boolean;
}

export default function BotNavGrayButton({
  icon,
  label,
  onClick,
  enabled = true,
  variant = 'default',
  active = false,
  visuallyHidden = false,
  className = '',
  iconClassName = '',
  labelClassName = '',
  wrapperRef,
  stopPropagation = false,
}: BotNavGrayButtonProps) {
  const layout =
    'px-4 py-2 gap-4 md:gap-2 md:w-40 flex items-center justify-center flex-shrink-0 font-semibold text-sm transition-colors select-none';

  let surfaceClass = '';
  if (variant === 'primary') {
    surfaceClass = enabled
      ? 'bg-brand-purple text-white hover:opacity-90 hover:shadow-sm cursor-pointer'
      : 'bg-gray-300 cursor-not-allowed opacity-50 text-gray-500';
  } else if (variant === 'danger') {
    surfaceClass = enabled
      ? 'bg-[#dd7f81] text-white hover:opacity-90 hover:shadow-sm cursor-pointer'
      : 'bg-gray-300 cursor-not-allowed opacity-50 text-gray-500';
  } else {
    surfaceClass = enabled
      ? `bg-white hover:bg-pink-50 hover:shadow-sm cursor-pointer ${active ? 'ring-2 ring-brand-purple ring-offset-1' : ''}`
      : 'bg-gray-100 cursor-not-allowed opacity-50';
  }

  const labelDefault =
    variant === 'default'
      ? enabled
        ? active
          ? 'text-brand-purple hidden sm:inline'
          : 'text-gray-400 hidden sm:inline'
        : 'text-gray-300 hidden sm:inline'
      : `${enabled ? 'text-white' : 'text-gray-200'} hidden sm:inline`;

  const finalLabelClassName = `${labelDefault} ${labelClassName}`.trim();

  const iconTone =
    variant === 'default'
      ? enabled
        ? active
          ? 'text-brand-purple [&_svg]:text-brand-purple'
          : 'text-gray-400 [&_svg]:text-gray-400'
        : 'text-gray-300 [&_svg]:text-gray-300'
      : enabled
        ? 'text-white [&_svg]:text-white'
        : '';

  const handleClick = (e: React.MouseEvent) => {
    if (visuallyHidden) return;
    if (stopPropagation) {
      e.stopPropagation();
    }
    if (enabled) {
      onClick(e);
    }
  };

  const buttonContent = (
    <div
      role="button"
      tabIndex={visuallyHidden || !enabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (visuallyHidden || !enabled) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e as unknown as React.MouseEvent);
        }
      }}
      className={[
        layout,
        surfaceClass,
        visuallyHidden ? 'invisible pointer-events-none' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden={visuallyHidden}
    >
      <span className={`flex items-center justify-center shrink-0 ${iconTone} ${iconClassName}`.trim()}>{icon}</span>
      <span className={finalLabelClassName}>{label}</span>
    </div>
  );

  if (wrapperRef) {
    return (
      <div className="relative flex-shrink-0" ref={wrapperRef}>
        {buttonContent}
      </div>
    );
  }

  return buttonContent;
}
