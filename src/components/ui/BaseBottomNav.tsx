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
        // border-t border-brand-purple
        'relative flex h-20 min-w-0 w-full shrink-0 items-center px-4 font-spartan bg-white',
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
