'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Modal from '@/components/ui/modals/Modal';

export type AddSkillFormSubmitValues = {
  classId: string;
  name: string;
  points: number;
  type: 'positive' | 'negative';
  icon: string;
};

interface AddSkillFormProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  onSubmit: (values: AddSkillFormSubmitValues) => Promise<void>;
  skillType?: 'positive' | 'negative';
  positiveIcons: string[];
  negativeIcons: string[];
  isPositiveIconsDetecting: boolean;
}

export default function AddSkillForm({
  isOpen,
  onClose,
  classId,
  onSubmit,
  skillType = 'positive',
  positiveIcons,
  negativeIcons,
  isPositiveIconsDetecting,
}: AddSkillFormProps) {
  const [skillName, setSkillName] = useState<string>('');
  const [points, setPoints] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousValueRef = useRef<number>(1);
  const [selectedIcon, setSelectedIcon] = useState<string>('/images/dashboard/award-points-icons/icons-positive/icon-pos-6.png');
  const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const availableIcons = skillType === 'positive' ? positiveIcons : negativeIcons;

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

  useEffect(() => {
    const newValue = skillType === 'positive' ? 1 : -1;
    setSkillName('');
    setPoints(newValue);
    previousValueRef.current = newValue;
    setSelectedIcon(
      skillType === 'positive'
        ? '/images/dashboard/award-points-icons/icons-positive/icon-pos-6.png'
        : '/images/dashboard/award-points-icons/icons-negative/icon-neg-6.png'
    );
  }, [isOpen, skillType]);

  const handleAddSkill = async () => {
    if (!skillName.trim()) return;
    const pointsValue = skillType === 'positive' ? Math.abs(points) : -Math.abs(points);
    if (pointsValue === 0) return;
    setIsLoading(true);
    try {
      await onSubmit({
        classId,
        name: skillName.trim(),
        points: pointsValue,
        type: skillType,
        icon: selectedIcon,
      });
      setShowSuccessModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSkillName('');
    const newValue = skillType === 'positive' ? 1 : -1;
    setPoints(newValue);
    previousValueRef.current = newValue;
  };

  return (
    <>
      <div className="relative">
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Add New Skill</h2>
        </div>
        <div className="space-y-4">
          <div className="flex justify-center mb-6">
            <div className="relative" ref={dropdownRef}>
              <button type="button" onClick={() => setIsIconDropdownOpen(!isIconDropdownOpen)} className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-2 border-gray-300">
                <Image src={selectedIcon} alt="Skill icon" width={60} height={60} className="w-14 h-14 object-contain" />
              </button>
              {isIconDropdownOpen && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-20 w-96 max-h-[500px] overflow-y-auto">
                  {skillType === 'positive' && isPositiveIconsDetecting ? (
                    <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>
                  ) : (
                    <div className="grid grid-cols-6 gap-2">
                      {availableIcons.map((icon, index) => (
                        <button key={index} type="button" onClick={() => { setSelectedIcon(icon); setIsIconDropdownOpen(false); }} className="w-12 h-12 rounded-lg flex items-center justify-center border-2 border-gray-200">
                          <Image src={icon} alt={`Icon ${index + 1}`} width={40} height={40} className="w-10 h-10 object-contain" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <input type="text" value={skillName} onChange={(e) => setSkillName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="e.g., Helping others" disabled={isLoading} />
          <input type="number" min={skillType === 'positive' ? 1 : undefined} step="1" value={points} ref={inputRef} onChange={(e) => { const num = Number(e.target.value); setPoints(Number.isNaN(num) ? (skillType === 'positive' ? 1 : -1) : num); }} className="w-full px-4 py-3 border border-gray-300 rounded-lg" disabled={isLoading} />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { resetForm(); onClose(); }} disabled={isLoading} className="px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
            <button type="button" onClick={() => void handleAddSkill()} disabled={isLoading} className="px-4 py-2 bg-purple-500 text-white rounded-lg">{isLoading ? 'Saving...' : 'Save Skill'}</button>
          </div>
        </div>
      </div>
      <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} className="max-w-md">
        <div className="text-center py-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">New skill added successfully!</h3>
          <button type="button" onClick={() => { setShowSuccessModal(false); onClose(); }} className="px-6 py-2.5 border border-gray-300 rounded-lg">Return</button>
        </div>
      </Modal>
    </>
  );
}
