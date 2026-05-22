'use client';

import Link from 'next/link';
import type { FC } from 'react';

import FormLabel from '@/components/ui/FormLabel';
import TextInput from '@/components/ui/TextInput';
import PasswordInput from '@/components/ui/PasswordInput';
import InlineErrorText from '@/components/ui/InlineErrorText';
import AuthBackLink from '@/features/auth/components/AuthBackLink';
import AuthCard from '@/features/auth/components/AuthCard';
import AuthFormHeader from '@/features/auth/components/AuthFormHeader';
import AuthFormFooter from '@/features/auth/components/AuthFormFooter';
import AuthPrimaryButton from '@/features/auth/components/AuthPrimaryButton';

type LoginFormProps = {
  email: string;
  password: string;
  isLoading: boolean;
  error?: string;
  success?: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (data: { email: string; password: string }) => void | Promise<void>;
};

const LoginForm: FC<LoginFormProps> = ({
  email,
  password,
  isLoading,
  error,
  success,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}) => {
  return (
    <>
      {/* AuthBackLink is used to navigate back to the previous page - absolutely positioned */}
      <AuthBackLink
        className="top-6 left-6"
        href="/login"
      />
      {/* AuthCard is used to wrap the AuthFormHeader, form, and the footer*/}
      <AuthCard
        className="w-9/10 md:w-1/3 overflow-hidden
        pb-2 px-2 md:px-6">
        {/* AuthFormHeader is used to display the title and subtitle of the form */}
        <AuthFormHeader
          title="Login" />
        <form
          className="grid gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void onSubmit({ email, password });
          }}
        >
          {/* flex flex-col gap-6 is used to create a vertical gap between the form elements */}
          <div className="flex flex-col gap-6 w-full overflow-hidden">
            {/* grid gap-2 is used to create a vertical gap between the form elements */}
            <div className="grid gap-2">
              {/* FormLabel is used to display the label for the email input */}
              <FormLabel htmlFor="email" className="text-base font-semibold text-[24px] text-black font-spartan">
                Email address
              </FormLabel>
              {/* TextInput is used to display the email input */}
              <TextInput
                id="email"
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

            {/* grid gap-2 is used to create a vertical gap between the form elements */}
            <div className="grid gap-2">
              {/* FormLabel is used to display the label for the password input */}
              <FormLabel htmlFor="password" className="text-base font-semibold text-black text-[24px] font-spartan">
                Password
              </FormLabel>
              {/* PasswordInput is used to display the password input */}
              <PasswordInput
                id="password"
                name="password"
                autoComplete="current-password"
                required
                disabled={isLoading}
                className="h-12 w-full rounded-[12px] border border-black/20 bg-white px-4 pr-12 text-[16px] text-black outline-none focus:border-black/40 focus:ring-2 focus:ring-brand-purple/30 font-sans disabled:opacity-60"
                placeholder=""
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
              />
            </div>

            {/* text-left is used to align the text to the left */}
            <div className="text-left">
              {/* Link is used to navigate to the forgot password page */}
              <Link href="/forgot-password" className="text-[18px] text-sm text-gray-600 hover:underline font-spartan">
                Forgot your password?
              </Link>
            </div>

            {/* flex justify-center gap-3 is used to create a horizontal gap between the buttons */}
            <div className="flex justify-end gap-3">
              {/* AuthPrimaryButton is used to display the login button */}
              <AuthPrimaryButton
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in…' : 'Login'}
              </AuthPrimaryButton>
            </div>
            {error && (
              <InlineErrorText className="text-sm text-red-600 text-center">{error}</InlineErrorText>
            )}
            {success && (
              <InlineErrorText className="text-sm text-green-600 text-center">{success}</InlineErrorText>
            )}
          </div>
        </form>
        <AuthFormFooter
          promptText="Don&apos;t have an account?"
          linkText="Sign up"
          linkHref="/signup"
        />
      </AuthCard>
    </>
  );
};

export default LoginForm;
