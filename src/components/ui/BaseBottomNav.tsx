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
        'relative w-full shrink-0 h-20 font-spartan bg-white',
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
