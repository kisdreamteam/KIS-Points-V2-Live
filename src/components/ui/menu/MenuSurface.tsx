'use client';

import type { HTMLAttributes, ReactNode } from 'react';

interface MenuSurfaceProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children: ReactNode;
}

export default function MenuSurface({ children, className = '', ...rest }: MenuSurfaceProps) {
  return (
    <div
      className={[
        'min-w-[200px] rounded-lg border-2 border-brand-purple bg-brand-cream/80 backdrop-blur-lg py-2 shadow-lg',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}
