'use client';

import AuthLayout from '@/modules/auth/AuthLayout';
import ForgotPasswordForm from '@/components/ui/auth/ForgotPasswordForm';
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
    <AuthLayout>
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
    </AuthLayout>
  );
}
