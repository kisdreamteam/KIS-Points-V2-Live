'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const GRADE_OPTIONS = [
  { value: '', label: 'Select a grade' },
  { value: 'Grade1', label: 'Grade 1' },
  { value: 'Grade2', label: 'Grade 2' },
  { value: 'Grade3', label: 'Grade 3' },
  { value: 'Grade4', label: 'Grade 4' },
  { value: 'Grade5', label: 'Grade 5' },
  { value: 'Grade6', label: 'Grade 6' },
  { value: 'Grade7', label: 'Grade 7' },
];

const AVAILABLE_ICONS = Array.from(
  { length: 15 },
  (_, i) => `/images/dashboard/class-icons/icon-${i + 1}.png`
);

type EditClassInfoTabProps = {
  className: string;
  grade: string;
  selectedIcon: string;
  onClassNameChange: (value: string) => void;
  onGradeChange: (value: string) => void;
  onIconChange: (icon: string) => void;
  isClassOwner: boolean;
  isLoading: boolean;
  onSave: () => void;
  onCancel: () => void;
};

export default function EditClassInfoTab({
  className,
  grade,
  selectedIcon,
  onClassNameChange,
  onGradeChange,
  onIconChange,
  isClassOwner,
  isLoading,
  onSave,
  onCancel,
}: EditClassInfoTabProps) {
  const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsIconDropdownOpen(false);
      }
    };
    if (isIconDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isIconDropdownOpen]);

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            disabled={!isClassOwner}
            onClick={() => isClassOwner && setIsIconDropdownOpen(!isIconDropdownOpen)}
            className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-300 hover:border-blue-500 relative disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Image src={selectedIcon} alt="Class icon" width={60} height={60} className="w-14 h-14 object-contain" />
            {isClassOwner && (
              <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                ▼
              </span>
            )}
          </button>
          {isIconDropdownOpen && isClassOwner && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsIconDropdownOpen(false)} />
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-20 w-80 max-h-96 overflow-y-auto">
                <div className="text-sm font-semibold text-gray-700 mb-3 text-center">Choose Class Icon</div>
                <div className="grid grid-cols-5 gap-3">
                  {AVAILABLE_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => {
                        onIconChange(icon);
                        setIsIconDropdownOpen(false);
                      }}
                      className={`w-12 h-12 rounded-lg flex items-center justify-center border-2 transition-all hover:scale-110 ${
                        selectedIcon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Image src={icon} alt="" width={40} height={40} className="w-10 h-10 object-contain" />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">Class Name</label>
        <input
          type="text"
          value={className}
          onChange={(e) => onClassNameChange(e.target.value)}
          disabled={!isClassOwner}
          className="w-full h-11 rounded-lg border border-gray-300 px-3 disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">Grade</label>
        <select
          value={grade}
          onChange={(e) => onGradeChange(e.target.value)}
          disabled={!isClassOwner}
          className="w-full h-11 rounded-lg border border-gray-300 px-3 disabled:bg-gray-50 disabled:cursor-not-allowed"
        >
          {GRADE_OPTIONS.map((opt) => (
            <option key={opt.value || 'empty'} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isLoading || !isClassOwner}
          className="px-6 py-2 bg-brand-pink text-white rounded-lg font-bold hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
