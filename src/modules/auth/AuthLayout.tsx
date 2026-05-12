import type { FC, ReactNode } from 'react';

type AuthLayoutProps = {
  children: ReactNode;
  className?: string;
};

const AuthLayout: FC<AuthLayoutProps> = ({ children, className = '' }) => {
  return (
    <div className={`
          h-screen w-screen flex flex-row items-center justify-center 
          bg-brand-purple font-spartan relative ${className}`}>
      {children}
    </div>
  );
};

export default AuthLayout;
