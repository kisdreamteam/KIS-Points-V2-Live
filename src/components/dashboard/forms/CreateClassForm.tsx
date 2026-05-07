'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export type CreateClassFormValues = {
  className: string;
  grade: string;
  icon: string;
  schoolYear: string;
};

interface CreateClassFormProps {
  onClose: () => void;
  onSubmit: (values: CreateClassFormValues) => void | Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

export default function CreateClassForm({ onClose, onSubmit, isLoading, error }: CreateClassFormProps) {
  const [className, setClassName] = useState('');
  const [grade, setGrade] = useState('');
  const getRandomIcon = () => {
    const iconNumber = Math.floor(Math.random() * 15) + 1;
    return `/images/dashboard/class-icons/icon-${iconNumber}.png`;
  };
  const [selectedIcon, setSelectedIcon] = useState<string>(() => getRandomIcon());
  const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const availableIcons = Array.from({ length: 15 }, (_, i) => `/images/dashboard/class-icons/icon-${i + 1}.png`);

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

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      className,
      grade,
      schoolYear: '2025-2026',
      icon: selectedIcon,
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Create new class</h2>
        <div className="flex justify-center mb-6">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsIconDropdownOpen(!isIconDropdownOpen)}
              className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors border-2 border-gray-300 hover:border-blue-500 relative"
            >
              <Image src={selectedIcon} alt="Class icon" width={60} height={60} className="w-14 h-14 object-contain" />
            </button>
            {isIconDropdownOpen && (
              <>
                <div className="fixed  inset-0 z-10" onClick={() => setIsIconDropdownOpen(false)} />
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-20 w-80 max-h-96 overflow-y-auto">
                  <div className="text-sm font-semibold text-gray-700 mb-3 text-center">Choose Class Icon</div>
                  <div className="grid grid-cols-5 gap-3">
                    {availableIcons.map((icon, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setSelectedIcon(icon);
                          setIsIconDropdownOpen(false);
                        }}
                        className={`w-12 h-12 rounded-lg flex items-center justify-center border-2 transition-all hover:scale-110 ${selectedIcon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <Image src={icon} alt={`Icon ${index + 1}`} width={40} height={40} className="w-10 h-10 object-contain" />
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <form onSubmit={handleCreateClass} className="space-y-4">
        <div>
          <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-2">School</label>
          <input type="text" id="school" value="Korean International School" readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed" />
        </div>
        <div>
          <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-2">Class name</label>
          <input type="text" id="className" value={className} onChange={(e) => setClassName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter class name" required />
        </div>
        <div>
          <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
          <select id="grade" value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
            <option value="">Select a grade</option>
            <option value="Grade1">Grade 1</option>
            <option value="Grade2">Grade 2</option>
            <option value="Grade3">Grade 3</option>
            <option value="Grade4">Grade 4</option>
            <option value="Grade5">Grade 5</option>
            <option value="Grade6">Grade 6</option>
            <option value="Grade7">Grade 7</option>
          </select>
        </div>
        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} disabled={isLoading} className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
          <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? 'Creating...' : 'Create'}
          </button>
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>
    </div>
  );
}
