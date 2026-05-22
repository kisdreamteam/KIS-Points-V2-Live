import type { ButtonHTMLAttributes, FC, ReactNode } from 'react';
import PrimaryButton from '@/components/ui/PrimaryButton';

type AuthPrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  className?: string;
};

const AuthPrimaryButton: FC<AuthPrimaryButtonProps> = ({ children, className = '', ...props }) => {
  const baseClassName =
    'h-12 w-full px-8 rounded-[18px] bg-brand-pink text-white font-bold text-2xl tracking-tight hover:brightness-95 transition focus:outline-none focus:ring-4 focus:ring-brand-pink/30 font-spartan disabled:opacity-60';

  return (
    <PrimaryButton className={`${baseClassName} ${className}`.trim()} {...props}>
      {children}
    </PrimaryButton>
  );
};

export default AuthPrimaryButton;
