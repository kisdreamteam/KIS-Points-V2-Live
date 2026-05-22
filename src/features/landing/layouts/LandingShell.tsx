import type { ReactNode } from 'react';

type LandingShellProps = {
  children: ReactNode;
};

export default function LandingShell({ children }: LandingShellProps) {
  return <>{children}</>;
}
