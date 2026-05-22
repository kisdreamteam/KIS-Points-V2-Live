'use client';

import SignupForm from '@/features/auth/components/forms/SignupForm';
import { useAuthFlow } from '@/hooks/useAuthFlow';

export default function SignUpView() {
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
  );
}
