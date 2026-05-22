import type { FC, ReactNode } from 'react';

type AuthCardProps = {
  children: ReactNode;
  className?: string;
};

const AuthCard: FC<AuthCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-brand-cream rounded-[20px] shadow-xl relative ${className}`}>
      {children}
    </div>
  );
};

export default AuthCard;
