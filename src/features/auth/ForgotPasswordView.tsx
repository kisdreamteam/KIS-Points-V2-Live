'use client';

import ForgotPasswordForm from '@/features/auth/components/forms/ForgotPasswordForm';
import { useAuthFlow } from '@/hooks/useAuthFlow';

export default function ForgotPasswordView() {
  const {
    forgotStep,
    setForgotStep,
    forgotEmail,
    setForgotEmail,
    forgotOtp,
    setForgotOtp,
    handleForgotPasswordRequest,
    handleForgotPasswordVerify,
    clearFeedback,
    isLoading,
    error,
    success,
  } = useAuthFlow();

  return (
    <ForgotPasswordForm
      step={forgotStep}
      email={forgotEmail}
      otp={forgotOtp}
      onEmailChange={setForgotEmail}
      onOtpChange={(value) => setForgotOtp(value.replace(/\D/g, '').slice(0, 6))}
      onBackToRequest={() => {
        setForgotStep('request');
        setForgotOtp('');
        clearFeedback();
      }}
      onRequestSubmit={handleForgotPasswordRequest}
      onVerifySubmit={handleForgotPasswordVerify}
      isLoading={isLoading}
      error={error}
      success={success}
    />
  );
}
