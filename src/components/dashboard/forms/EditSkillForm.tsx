'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import type { PointCategory } from '@/lib/types';

export type EditSkillFormSubmitPayload = {
  skillId: string;
  name: string;
  points: number;
  icon: string;
};

interface EditSkillFormProps {
  isOpen: boolean;
  onClose: () => void;
  skill: PointCategory | null;
  positiveIcons: string[];
  negativeIcons: string[];
  isPositiveIconsDetecting: boolean;
  onSubmit: (values: EditSkillFormSubmitPayload) => Promise<void>;
}

export default function EditSkillForm({
  isOpen,
  onClose,
  skill,
  positiveIcons,
  negativeIcons,
  isPositiveIconsDetecting,
  onSubmit,
}: EditSkillFormProps) {
  const [activeTab, setActiveTab] = useState<'positive' | 'negative'>('positive');
  const [skillName, setSkillName] = useState<string>('');
  const [points, setPoints] = useState<number>(1);
  const [selectedIcon, setSelectedIcon] = useState<string>('/images/dashboard/award-points-icons/icons-positive/icon-pos-1.png');
  const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const availableIcons = activeTab === 'positive' ? positiveIcons : negativeIcons;

  useEffect(() => {
    if (isOpen && skill) {
      const pointsValue = skill.points ?? skill.default_points ?? 0;
      setSkillName(skill.name);
      setPoints(pointsValue);
      setActiveTab(pointsValue > 0 ? 'positive' : 'negative');
      setSelectedIcon(skill.icon || '/images/dashboard/award-points-icons/icons-positive/icon-pos-1.png');
    }
  }, [isOpen, skill]);

  if (!skill) return null;

  return (
    <div className="relative">
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Edit Skill</h2>
      </div>
      <div className="space-y-4">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsIconDropdownOpen(!isIconDropdownOpen)}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-2 border-gray-300"
            >
              <Image src={selectedIcon} alt="Skill icon" width={60} height={60} className="w-14 h-14 object-contain" />
            </button>
            {isIconDropdownOpen && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-20 w-96 max-h-[500px] overflow-y-auto">
                {activeTab === 'positive' && isPositiveIconsDetecting ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-6 gap-2">
                    {availableIcons.map((icon, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setSelectedIcon(icon);
                          setIsIconDropdownOpen(false);
                        }}
                        className="w-12 h-12 rounded-lg flex items-center justify-center border-2 border-gray-200"
                      >
                        <Image src={icon} alt={`Icon ${index + 1}`} width={40} height={40} className="w-10 h-10 object-contain" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <input
          type="text"
          value={skillName}
          onChange={(e) => setSkillName(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          disabled={isLoading}
        />
        <input
          type="number"
          value={points}
          ref={inputRef}
          onChange={(e) => setPoints(Number(e.target.value) || 0)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          disabled={isLoading}
        />
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 border border-gray-300 rounded-lg">
            Cancel
          </button>
          <button
            type="button"
            onClick={() =>
              void (async (): Promise<void> => {
                setIsLoading(true);
                try {
                  await onSubmit({
                    skillId: skill.id,
                    name: skillName.trim(),
                    points: activeTab === 'positive' ? Math.abs(points) : -Math.abs(points),
                    icon: selectedIcon,
                  });
                  onClose();
                } finally {
                  setIsLoading(false);
                }
              })()
            }
            disabled={isLoading}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
