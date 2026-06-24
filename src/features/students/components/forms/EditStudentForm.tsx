'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import FormLabel from '@/components/ui/FormLabel';

const INPUT_CLASS =
  'w-full h-12 rounded-[12px] border border-black/20 bg-white px-4 text-[16px] text-black outline-none focus:border-black/40 focus:ring-2 focus:ring-brand-purple/30';

const AVAILABLE_AVATARS = Array.from({ length: 40 }, (_, i) => {
  const number = String(i + 1).padStart(2, '0');
  return `/images/dashboard/student-avatars/avatar-${number}.png`;
});

export type EditStudentFormProps = {
  firstName: string;
  lastName: string;
  studentNumber: string;
  gender: string;
  selectedAvatar: string;
  isLoading: boolean;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onStudentNumberChange: (value: string) => void;
  onGenderChange: (value: string) => void;
  onAvatarChange: (path: string) => void;
  onCancel: () => void;
  onSave: () => void;
};

export default function EditStudentForm({
  firstName,
  lastName,
  studentNumber,
  gender,
  selectedAvatar,
  isLoading,
  onFirstNameChange,
  onLastNameChange,
  onStudentNumberChange,
  onGenderChange,
  onAvatarChange,
  onCancel,
  onSave,
}: EditStudentFormProps) {
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAvatarDropdownOpen(false);
      }
    };
    if (isAvatarDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isAvatarDropdownOpen]);

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsAvatarDropdownOpen(!isAvatarDropdownOpen)}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors border-2 border-gray-300 hover:border-brand-purple relative shadow-sm overflow-hidden"
          >
            <Image
              src={selectedAvatar}
              alt="Student avatar"
              width={80}
              height={80}
              className="w-full h-full object-cover rounded-full"
            />
            <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
              ▼
            </span>
          </button>
          {isAvatarDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsAvatarDropdownOpen(false)} />
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-20 w-80 max-h-96 overflow-y-auto">
                <div className="text-sm font-semibold text-gray-700 mb-3 text-center">Choose Student Avatar</div>
                <div className="grid grid-cols-5 gap-3">
                  {AVAILABLE_AVATARS.map((avatar) => (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => {
                        onAvatarChange(avatar);
                        setIsAvatarDropdownOpen(false);
                      }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all hover:scale-110 overflow-hidden ${selectedAvatar === avatar
                        ? 'border-brand-purple bg-brand-purple/10'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <Image
                        src={avatar}
                        alt=""
                        width={48}
                        height={48}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div>
        <FormLabel htmlFor="edit-student-number" className="block text-sm font-bold text-gray-900 mb-2">
          Student Number
        </FormLabel>
        <input
          id="edit-student-number"
          type="text"
          value={studentNumber}
          onChange={(e) => onStudentNumberChange(e.target.value)}
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <FormLabel htmlFor="edit-student-first-name" className="block text-sm font-bold text-gray-900 mb-2">
          First Name
        </FormLabel>
        <input
          id="edit-student-first-name"
          type="text"
          value={firstName}
          onChange={(e) => onFirstNameChange(e.target.value)}
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <FormLabel htmlFor="edit-student-last-name" className="block text-sm font-bold text-gray-900 mb-2">
          Last Name <span className="font-normal text-gray-500">(Optional)</span>
        </FormLabel>
        <input
          id="edit-student-last-name"
          type="text"
          value={lastName}
          onChange={(e) => onLastNameChange(e.target.value)}
          placeholder="Enter last name (optional)"
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <FormLabel htmlFor="edit-student-gender" className="block text-sm font-bold text-gray-900 mb-2">
          Gender
        </FormLabel>
        <select
          id="edit-student-gender"
          value={gender}
          onChange={(e) => onGenderChange(e.target.value)}
          className={INPUT_CLASS}
        >
          <option value="">Select gender</option>
          <option value="Boy">Boy</option>
          <option value="Girl">Girl</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isLoading}
          className="px-6 py-2 bg-brand-pink text-white rounded-lg font-bold hover:brightness-95 transition disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
