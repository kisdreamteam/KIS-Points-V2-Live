'use client';

import Image from 'next/image';
import type { FC } from 'react';

import TextInput from '@/components/ui/TextInput';
import SelectInput from '@/components/ui/SelectInput';
import PasswordInput from '@/components/ui/PasswordInput';
import InlineErrorText from '@/components/ui/InlineErrorText';
import AuthBackLink from '@/features/auth/components/AuthBackLink';
import AuthCard from '@/features/auth/components/AuthCard';
import AuthFormHeader from '@/features/auth/components/AuthFormHeader';
import AuthPrimaryButton from '@/features/auth/components/AuthPrimaryButton';

type SignupFormProps = {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  isLoading: boolean;
  error?: string;
  success?: string;
  onTitleChange: (value: string) => void;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onSubmit: (data: {
    title: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: string;
  }) => void | Promise<void>;
};

const SignupFooter: FC = () => (
  <div className="mt-6 text-center text-sm text-black/70 flex items-center justify-center gap-2">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className="h-5 w-5"
    >
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
      />
    </svg>
    <span>English (US)</span>
  </div>
);

const SignupAvatar: FC = () => (
  <div className="hidden md:flex lg:flex flex-1 w-full items-center justify-center">
    <div className="relative flex items-center justify-center bg-brand-purple w-200 h-200">
      <div
        className="bg-brand-cream rounded-full md:w-80 md:h-80 lg:w-120 lg:h-120 translate-y-25 translate-x-10 shadow-xl"
        style={{ borderRadius: '40% 30% 30% 30% / 40% 40% 40% 40%' }}
      />
      <Image
        src="/images/auth/auth-signup-mascot.png"
        alt="Signup avatar character"
        width={600}
        height={600}
        priority
        className="absolute md:w-140 md:h-auto lg:w-190 lg:h-auto object-cover"
      />
    </div>
  </div>
);

const SignupForm: FC<SignupFormProps> = ({
  title,
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
  role,
  isLoading,
  error,
  success,
  onTitleChange,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onRoleChange,
  onSubmit,
}) => {
  return (
    <>
      <div className="flex flex-row lg:w-full md:w-1/2">
        <AuthBackLink className="top-6 left-6" />
        <SignupAvatar />
      </div>
      <div className="flex flex-row w-full items-center justify-center p-2 md:p-0">
        <AuthCard className="w-9/10 md:w-3/4 p-6 md:p-10 bg-brand-cream">
          <AuthFormHeader
            title="Create your account"
            subtitle="Enter your information to create a new account."
          />

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void onSubmit({
                title,
                firstName,
                lastName,
                email,
                password,
                confirmPassword,
                role,
              });
            }}
            className="space-y-4"
          >
            <div className="relative">
              <SelectInput
                id="title"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                className="w-full h-12 rounded-[12px] border border-black/20 bg-white px-4 pr-10 text-[16px] text-black outline-none focus:border-black/40 focus:ring-2 focus:ring-[#3B47E0]/30 appearance-none cursor-pointer"
              >
                <option>Mr.</option>
                <option>Ms.</option>
              </SelectInput>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-black/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <TextInput
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => onFirstNameChange(e.target.value)}
              placeholder="First Name"
              disabled={isLoading}
              className="w-full h-12 rounded-[12px] border border-black/20 bg-white px-4 text-[16px] text-black placeholder:text-black/50 outline-none focus:border-black/40 focus:ring-2 focus:ring-[#3B47E0]/30 disabled:opacity-60"
            />

            <TextInput
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => onLastNameChange(e.target.value)}
              placeholder="Last Name"
              disabled={isLoading}
              className="w-full h-12 rounded-[12px] border border-black/20 bg-white px-4 text-[16px] text-black placeholder:text-black/50 outline-none focus:border-black/40 focus:ring-2 focus:ring-[#3B47E0]/30 disabled:opacity-60"
            />

            <div className="relative">
              <TextInput
                id="email"
                type="text"
                value={email}
                onChange={(e) => onEmailChange(e.target.value.replace(/@kshcm\.net/gi, ''))}
                placeholder="Email address"
                disabled={isLoading}
                className="w-full h-12 rounded-[12px] border border-black/20 bg-white px-4 pr-24 text-[16px] text-black placeholder:text-black/50 outline-none focus:border-black/40 focus:ring-2 focus:ring-[#3B47E0]/30 disabled:opacity-60"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[16px] text-black/70 pointer-events-none">
                @kshcm.net
              </span>
            </div>

            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="Password"
              disabled={isLoading}
              className="w-full h-12 rounded-[12px] border border-black/20 bg-white px-4 pr-12 text-[16px] text-black placeholder:text-black/50 outline-none focus:border-black/40 focus:ring-2 focus:ring-[#3B47E0]/30 disabled:opacity-60"
            />

            <PasswordInput
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              placeholder="Confirm Password"
              disabled={isLoading}
              className="w-full h-12 rounded-[12px] border border-black/20 bg-white px-4 pr-12 text-[16px] text-black placeholder:text-black/50 outline-none focus:border-black/40 focus:ring-2 focus:ring-[#3B47E0]/30 disabled:opacity-60"
            />

            <div className="relative">
              <SelectInput
                id="role"
                value={role}
                onChange={(e) => onRoleChange(e.target.value)}
                disabled={isLoading}
                className="w-full h-12 rounded-[12px] border border-black/20 bg-white px-4 pr-10 text-[16px] text-black outline-none focus:border-black/40 focus:ring-2 focus:ring-[#3B47E0]/30 appearance-none cursor-pointer disabled:opacity-60"
              >
                <option>Teacher</option>
                <option>Parent</option>
                <option>Student</option>
              </SelectInput>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-black/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <AuthPrimaryButton
              type="submit"
              disabled={isLoading}
            // className="rounded-[18px] bg-brand-pink text-lg focus:ring-brand-pink/30 mt-6"
            >
              {isLoading ? 'Creating Account…' : 'Create Account'}
            </AuthPrimaryButton>

            {error && (
              <InlineErrorText className="text-sm text-center text-red-600">{error}</InlineErrorText>
            )}
            {success && (
              <InlineErrorText className="text-sm text-center text-green-600">{success}</InlineErrorText>
            )}
          </form>

          <SignupFooter />
        </AuthCard>
      </div>
    </>
  );
};

export default SignupForm;
