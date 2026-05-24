'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getSessionUser,
  requestPasswordReset,
  signInWithEmailPassword,
  signUpWithEmailPassword,
  updateCurrentUserPassword,
  verifyRecoveryOtp,
} from '@/lib/api/auth.service';

export type ForgotPasswordStep = 'request' | 'verify';

export function useAuthFlow() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupTitle, setSignupTitle] = useState('Ms.');
  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupLastName, setSignupLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupRole, setSignupRole] = useState('Teacher');

  const [forgotStep, setForgotStep] = useState<ForgotPasswordStep>('request');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');

  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [isSessionChecked, setIsSessionChecked] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  const clearFeedback = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  const handleLogin = useCallback(
    async (data: { email: string; password: string }) => {
      clearFeedback();
      setIsLoading(true);
      try {
        await signInWithEmailPassword(data.email, data.password);
        setSuccess('Login successful.');
        router.push('/dashboard');
      } catch (err) {
        console.error('Login error:', err);
        setError(err instanceof Error ? err.message : 'Failed to sign in. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [clearFeedback, router]
  );

  const handleSignup = useCallback(
    async (data: {
      title: string;
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      confirmPassword: string;
      role: string;
    }) => {
      clearFeedback();
      const fullEmail = data.email.includes('@') ? data.email : `${data.email}@kshcm.net`;
      const fullName = `${data.firstName} ${data.lastName}`.trim();

      if (!fullEmail.toLowerCase().endsWith('@kshcm.net')) {
        setError('Email must be a valid @kshcm.net address.');
        return;
      }
      if (data.role === 'Parent' || data.role === 'Student') {
        setError(`${data.role} is not available for sign-up yet. Please choose the correct option to continue.`);
        return;
      }
      if (data.password !== data.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      setIsLoading(true);
      try {
        await signUpWithEmailPassword({
          email: fullEmail,
          password: data.password,
          data: {
            name: fullName,
            title: data.title,
            role: data.role,
          },
        });
        setSuccess('Success! Redirecting you to the login page...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } catch (err) {
        console.error('Supabase signUp error:', err);
        setError(err instanceof Error ? err.message : 'Failed to sign up. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [clearFeedback, router]
  );

  const handleForgotPasswordRequest = useCallback(
    async (data: { email: string }) => {
      clearFeedback();
      setIsLoading(true);
      try {
        await requestPasswordReset(data.email);
        setSuccess('Code sent. Check your inbox.');
        setForgotStep('verify');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not send code. Try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [clearFeedback]
  );

  const handleForgotPasswordVerify = useCallback(
    async (data: { email: string; otp: string }) => {
      clearFeedback();
      if (data.otp.length !== 6) {
        setError('Enter the full 6-digit code.');
        return;
      }

      setIsLoading(true);
      try {
        await verifyRecoveryOtp(data.email, data.otp);
        setSuccess('Code verified.');
        router.push('/reset-password');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid code. Try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [clearFeedback, router]
  );

  const handleResetPassword = useCallback(
    async (data: { password: string; confirmPassword: string }) => {
      clearFeedback();
      if (data.password !== data.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (data.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }

      setIsLoading(true);
      try {
        await updateCurrentUserPassword(data.password);
        setSuccess('Password updated.');
        router.push('/login');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not update password. Try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [clearFeedback, router]
  );

  const checkResetSession = useCallback(async () => {
    const session = await getSessionUser();
    setHasSession(!!session);
    setIsSessionChecked(true);
  }, []);

  useEffect(() => {
    void checkResetSession();
  }, [checkResetSession]);

  return {
    isLoading,
    error,
    success,
    clearFeedback,

    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    handleLogin,

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

    forgotStep,
    setForgotStep,
    forgotEmail,
    setForgotEmail,
    forgotOtp,
    setForgotOtp,
    handleForgotPasswordRequest,
    handleForgotPasswordVerify,

    resetPassword,
    setResetPassword,
    resetConfirmPassword,
    setResetConfirmPassword,
    isSessionChecked,
    hasSession,
    handleResetPassword,
  };
}
