import type { FC, ReactNode } from 'react';

type AuthLayoutProps = {
  children: ReactNode;
  className?: string;
};

const AuthLayout: FC<AuthLayoutProps> = ({ children, className = '' }) => {
  return (
    <div className={`h-screen w-full bg-brand-purple flex items-center justify-center font-spartan relative ${className}`}>
      {children}
    </div>
  );
};

export default AuthLayout;
