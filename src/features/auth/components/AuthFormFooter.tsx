import Link from 'next/link';
import type { FC } from 'react';

type AuthFormFooterProps = {
  promptText?: string;
  linkText: string;
  linkHref: string;
  className?: string;
  promptClassName?: string;
  linkClassName?: string;
};

const AuthFormFooter: FC<AuthFormFooterProps> = ({
  promptText,
  linkText,
  linkHref,
  className = 'mt-6 text-center text-sm text-[18px]',
  promptClassName = 'text-gray-600 font-spartan',
  linkClassName = 'text-brand-pink text-[18px] font-semibold font-spartan hover:underline',
}) => {
  return (
    <div className={className}>
      {promptText ? <span className={promptClassName}>{promptText} </span> : null}
      <Link href={linkHref} className={linkClassName}>
        {linkText}
      </Link>
    </div>
  );
};

export default AuthFormFooter;
