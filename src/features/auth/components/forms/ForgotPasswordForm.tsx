'use client';

import Link from 'next/link';
import type { FC } from 'react';

import FormLabel from '@/components/ui/FormLabel';
import TextInput from '@/components/ui/TextInput';
import InlineErrorText from '@/components/ui/InlineErrorText';
import AuthBackLink from '@/features/auth/components/AuthBackLink';
import AuthCard from '@/features/auth/components/AuthCard';
import AuthFormHeader from '@/features/auth/components/AuthFormHeader';
import AuthPrimaryButton from '@/features/auth/components/AuthPrimaryButton';
import type { ForgotPasswordStep } from '@/hooks/useAuthFlow';

type ForgotPasswordFormProps = {
  step: ForgotPasswordStep;
  email: string;
  otp: string;
  isLoading: boolean;
  error?: string;
  success?: string;
  onEmailChange: (value: string) => void;
  onOtpChange: (value: string) => void;
  onBackToRequest: () => void;
  onRequestSubmit: (data: { email: string }) => void | Promise<void>;
  onVerifySubmit: (data: { email: string; otp: string }) => void | Promise<void>;
};

type ForgotHeaderProps = { step: ForgotPasswordStep };

const ForgotHeader: FC<ForgotHeaderProps> = ({ step }) => (
  <AuthFormHeader
    title="Forgot password"
    subtitle={
      step === 'request'
        ? "Enter email and receive a 6-digit code"
        : 'Enter the code from your email to continue.'
    }
  />
);

const ForgotPasswordForm: FC<ForgotPasswordFormProps> = ({
  step,
  email,
  otp,
  isLoading,
  error,
  success,
  onEmailChange,
  onOtpChange,
  onBackToRequest,
  onRequestSubmit,
  onVerifySubmit,
}) => {
  return (
    <>
      <AuthBackLink
        className="top-6 left-6"
        href="/login"
      />
      {/* w-9/10 md:w-1/3 pb-2 px-2 md:px-6 */}
      <AuthCard
        className="w-9/10 md:w-1/3 overflow-hidden
        pb-2 px-2 md:px-6">
        {/* ForgotHeader is used to display the title and subtitle of the form */}
        <ForgotHeader step={step} />

        {step === 'request' ? (
          <form
            className="grid gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              void onRequestSubmit({ email });
            }}
          >
            <div className="grid gap-2">
              <FormLabel
                htmlFor="forgot-email"
                className="text-base w-fullfont-semibold text-[24px] text-black font-spartan"
              >
                Email address
              </FormLabel>
              <TextInput
                id="forgot-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={isLoading}
                className="h-12 rounded-[12px] border border-black/20 bg-white px-4 text-[16px] text-black outline-none focus:border-black/40 focus:ring-2 focus:ring-brand-purple/30 font-sans disabled:opacity-60"
                placeholder=""
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
              />
            </div>

            <div className="flex justify-center gap-3">
              <AuthPrimaryButton
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Sending…' : 'Send code'}
              </AuthPrimaryButton>
            </div>
          </form>
        ) : (
          <form
            className="grid gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              void onVerifySubmit({ email, otp });
            }}
          >
            <p className="text-center text-sm text-black/80 font-spartan">
              Code sent to <span className="font-semibold text-brand-purple">{email}</span>
            </p>

            <div className="grid gap-2">
              <FormLabel
                htmlFor="recovery-otp"
                className="text-base font-semibold text-[24px] text-black font-spartan"
              >
                6-digit code
              </FormLabel>
              <TextInput
                id="recovery-otp"
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                disabled={isLoading}
                className="h-14 rounded-[12px] border border-black/20 bg-white px-4 text-center text-2xl tracking-[0.5em] font-sans text-black outline-none focus:border-black/40 focus:ring-2 focus:ring-brand-purple/30 disabled:opacity-60"
                placeholder="000000"
                value={otp}
                onChange={(e) => onOtpChange(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <button
                type="button"
                disabled={isLoading}
                onClick={onBackToRequest}
                className="h-12 w-full max-w-[750px] sm:max-w-[220px] rounded-[12px] border-2 border-brand-purple bg-white px-8 text-lg font-bold text-brand-purple transition hover:bg-brand-purple/10 focus:outline-none focus:ring-4 focus:ring-brand-purple/30 font-spartan disabled:opacity-60"
              >
                Back
              </button>
              <AuthPrimaryButton
                type="submit"
                disabled={isLoading || otp.length !== 6}
              // className="max-w-[750px] flex-1 sm:max-w-none"
              >
                {isLoading ? 'Verifying…' : 'Verify'}
              </AuthPrimaryButton>
            </div>
          </form>
        )}

        {error && (
          <InlineErrorText className="mt-4 text-sm text-red-600 text-center">{error}</InlineErrorText>
        )}
        {success && (
          <InlineErrorText className="mt-4 text-sm text-green-600 text-center">{success}</InlineErrorText>
        )}

        <div className="mt-6 text-center text-sm text-[18px]">
          <Link href="/login" className="text-brand-pink font-semibold font-spartan hover:underline">
            Back to login
          </Link>
        </div>
      </AuthCard>
    </>
  );
};

export default ForgotPasswordForm;
