import Image from 'next/image';
import type { FC } from 'react';

type AuthFormHeaderProps = {
  title: string;
  subtitle?: string;
  className?: string;
};

const AuthFormHeader: FC<AuthFormHeaderProps> = ({ title, subtitle, className = '' }) => {
  return (
    <div className={`flex flex-row gap-1 px-2 md:px-0 ${className}`}>
      <div className="flex md:flex-row justify-start items-center w-150 md:w-full">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-brand-purple font-spartan">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 text-base md:text-lg text-black/70 font-spartan">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex justify-end w-50 md:w-full items-start">
        <Image
          src="/images/auth/auth-login-kis-logo.png"
          alt="KIS Points logo"
          width={180}
          height={180}
          priority
          className="h-auto w-20 md:w-45"
        />
      </div>
    </div>
  );
};

export default AuthFormHeader;
