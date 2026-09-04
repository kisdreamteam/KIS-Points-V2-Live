'use client';

import { useState, type ChangeEvent, type FC } from 'react';

import EyeIcon from '@/components/ui/icons/EyeIcon';
import TextInput from '@/components/ui/TextInput';

type PasswordInputProps = {
  id: string;
  name?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  toggleButtonClassName?: string;
};

const PasswordInput: FC<PasswordInputProps> = ({
  id,
  name,
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  disabled,
  className = '',
  toggleButtonClassName = 'absolute right-3 top-1/2 -translate-y-1/2 text-black/50 hover:text-black/80',
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <TextInput
        id={id}
        name={name}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        className={className}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => setVisible((v) => !v)}
        className={`${toggleButtonClassName} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        <EyeIcon hidden={visible} />
      </button>
    </div>
  );
};

export default PasswordInput;
