import AuthShell from '@/features/auth/layouts/AuthShell';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthShell>{children}</AuthShell>;
}
