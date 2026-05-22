import LandingShell from '@/features/landing/layouts/LandingShell';

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LandingShell>{children}</LandingShell>;
}
