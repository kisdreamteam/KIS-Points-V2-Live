import type { ReactNode } from 'react';

type AuthShellProps = {
  children: ReactNode;
};

export default function AuthShell({ children }: AuthShellProps) {
  return (
    <div
      className="
        h-screen w-screen flex flex-row items-center justify-center
        bg-brand-purple font-spartan relative
      "
    >
      {children}
    </div>
  );
}
