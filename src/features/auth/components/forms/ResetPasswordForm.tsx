'use client';

import Link from 'next/link';
import type { FC } from 'react';

import FormLabel from '@/components/ui/FormLabel';
import PasswordInput from '@/components/ui/PasswordInput';
import InlineErrorText from '@/components/ui/InlineErrorText';
import AuthBackLink from '@/features/auth/components/AuthBackLink';
import AuthCard from '@/features/auth/components/AuthCard';
import AuthFormHeader from '@/features/auth/components/AuthFormHeader';
import AuthPrimaryButton from '@/features/auth/components/AuthPrimaryButton';

type ResetPasswordFormProps = {
  password: string;
  confirmPassword: string;
  isLoading: boolean;
  error?: string;
  success?: string;
  isSessionChecked: boolean;
  hasSession: boolean;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: (data: { password: string; confirmPassword: string }) => void | Promise<void>;
};

const ResetPasswordForm: FC<ResetPasswordFormProps> = ({
  password,
  confirmPassword,
  isLoading,
  error,
  success,
  isSessionChecked,
  hasSession,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}) => {
  return (
    <>
      <AuthBackLink
        className="text-gray-300 flex-shrink-0"
        style={{
          left: 'max(calc(50% - 400px - 48px), 24px)',
          top: 'calc(50% - 220px)',
        }}
        href="/login"
        strokeWidth={3}
      />
      <AuthCard className="w-full max-w-[800px] px-8 py-10">
        <AuthFormHeader
          title="Reset password"
          subtitle="Choose a new password for your account."
        />

        {!isSessionChecked ? (
          <p className="text-center text-brand-purple font-spartan">Checking your session...</p>
        ) : !hasSession ? (
          <div className="grid gap-4 text-center">
            <p className="text-black/80 font-spartan">
              This link is invalid or has expired. Request a new reset link.
            </p>
            <Link
              href="/forgot-password"
              className="text-brand-pink font-semibold font-spartan hover:underline"
            >
              Forgot password
            </Link>
          </div>
        ) : (
          <form
            className="grid gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              void onSubmit({ password, confirmPassword });
            }}
          >
            <div className="grid gap-2">
              <FormLabel
                htmlFor="new-password"
                className="text-base font-semibold text-black text-[24px] font-spartan"
              >
                New password
              </FormLabel>
              <PasswordInput
                id="new-password"
                name="password"
                autoComplete="new-password"
                required
                disabled={isLoading}
                className="h-12 w-full rounded-[12px] border border-black/20 bg-white px-4 pr-12 text-[16px] text-black outline-none focus:border-black/40 focus:ring-2 focus:ring-brand-purple/30 font-sans disabled:opacity-60"
                placeholder=""
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <FormLabel
                htmlFor="confirm-password"
                className="text-base font-semibold text-black text-[24px] font-spartan"
              >
                Confirm new password
              </FormLabel>
              <PasswordInput
                id="confirm-password"
                name="confirmPassword"
                autoComplete="new-password"
                required
                disabled={isLoading}
                className="h-12 w-full rounded-[12px] border border-black/20 bg-white px-4 pr-12 text-[16px] text-black outline-none focus:border-black/40 focus:ring-2 focus:ring-brand-purple/30 font-sans disabled:opacity-60"
                placeholder=""
                value={confirmPassword}
                onChange={(e) => onConfirmPasswordChange(e.target.value)}
              />
            </div>

            <div className="flex justify-center gap-3">
              <AuthPrimaryButton
                type="submit"
                disabled={isLoading}
                className="max-w-[750px]"
              >
                {isLoading ? 'Saving…' : 'Update password'}
              </AuthPrimaryButton>
            </div>

            {error && (
              <InlineErrorText className="text-sm text-red-600 text-center">{error}</InlineErrorText>
            )}
            {success && (
              <InlineErrorText className="text-sm text-green-600 text-center">{success}</InlineErrorText>
            )}
          </form>
        )}
      </AuthCard>
    </>
  );
};

export default ResetPasswordForm;
