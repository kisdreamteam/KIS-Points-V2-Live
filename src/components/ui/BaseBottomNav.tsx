import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export type BaseBottomNavProps = Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'children'> & {
  children: ReactNode;
  style?: CSSProperties;
};

export default function BaseBottomNav({
  children,
  className = '',
  style,
  ...rest
}: BaseBottomNavProps) {
  return (
    <div
      data-bottom-nav
      className={[
        'relative w-full shrink-0 h-16 font-spartan bg-white border-t border-brand-purple',
        'flex items-center px-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
      {...rest}
    >
      {children}
    </div>
  );
}
