'use client';

import AuthPageLayout from '@/components/layout/auth/AuthPageLayout';
import SignupForm from '@/components/ui/auth/SignupForm';
import { useAuthFlow } from '@/hooks/useAuthFlow';

export default function SignupPageModule() {
  const {
    signupTitle,
    setSignupTitle,
    signupFirstName,
    setSignupFirstName,
    signupLastName,
    setSignupLastName,
    signupEmail,
    setSignupEmail,
    signupPassword,
    setSignupPassword,
    signupConfirmPassword,
    setSignupConfirmPassword,
    signupRole,
    setSignupRole,
    handleSignup,
    isLoading,
    error,
    success,
  } = useAuthFlow();

  return (
    <AuthPageLayout>
      <SignupForm
        title={signupTitle}
        firstName={signupFirstName}
        lastName={signupLastName}
        email={signupEmail}
        password={signupPassword}
        confirmPassword={signupConfirmPassword}
        role={signupRole}
        onTitleChange={setSignupTitle}
        onFirstNameChange={setSignupFirstName}
        onLastNameChange={setSignupLastName}
        onEmailChange={setSignupEmail}
        onPasswordChange={setSignupPassword}
        onConfirmPasswordChange={setSignupConfirmPassword}
        onRoleChange={setSignupRole}
        onSubmit={handleSignup}
        isLoading={isLoading}
        error={error}
        success={success}
      />
    </AuthPageLayout>
  );
}
