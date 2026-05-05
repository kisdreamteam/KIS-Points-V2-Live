'use client';

import AuthPageLayout from '@/components/layout/auth/AuthPageLayout';
import LoginForm from '@/components/ui/auth/LoginForm';
import { useAuthFlow } from '@/hooks/useAuthFlow';

export default function LoginPageModule() {
  const {
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    handleLogin,
    isLoading,
    error,
    success,
  } = useAuthFlow();

  return (
    <AuthPageLayout>
      <LoginForm
        email={loginEmail}
        password={loginPassword}
        onEmailChange={setLoginEmail}
        onPasswordChange={setLoginPassword}
        onSubmit={handleLogin}
        isLoading={isLoading}
        error={error}
        success={success}
      />
    </AuthPageLayout>
  );
}
