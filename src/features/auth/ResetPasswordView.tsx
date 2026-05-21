'use client';

import ResetPasswordForm from '@/components/ui/auth/ResetPasswordForm';
import { useAuthFlow } from '@/hooks/useAuthFlow';

export default function ResetPasswordView() {
  const {
    resetPassword,
    setResetPassword,
    resetConfirmPassword,
    setResetConfirmPassword,
    isSessionChecked,
    hasSession,
    handleResetPassword,
    isLoading,
    error,
    success,
  } = useAuthFlow();

  return (
    <ResetPasswordForm
      password={resetPassword}
      confirmPassword={resetConfirmPassword}
      onPasswordChange={setResetPassword}
      onConfirmPasswordChange={setResetConfirmPassword}
      onSubmit={handleResetPassword}
      isSessionChecked={isSessionChecked}
      hasSession={hasSession}
      isLoading={isLoading}
      error={error}
      success={success}
    />
  );
}
