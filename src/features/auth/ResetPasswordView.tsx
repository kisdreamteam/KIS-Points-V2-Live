'use client';

import ResetPasswordForm from '@/features/auth/components/forms/ResetPasswordForm';
import { useAuthFlow } from '@/features/auth/hooks/useAuthFlow';

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
