'use client';

import { useEffect } from 'react';
import Modal from '@/components/ui/modals/Modal';
import { normalizeAvatarPath } from '@/lib/iconUtils';
import { triggerPointsAnimation } from '@/features/dashboard/utils/animationEffects';

interface PointsAwardedConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentAvatar: string;
  studentFirstName: string;
  pointsDelta: number;
  categoryName: string;
  categoryIcon?: string;
}

export default function PointsAwardedConfirmationModal({
  isOpen,
  onClose,
  studentAvatar,
  studentFirstName,
  pointsDelta,
  categoryName,
  categoryIcon,
}: PointsAwardedConfirmationModalProps) {
  useEffect(() => {
    if (isOpen) {
      triggerPointsAnimation(pointsDelta);
    }
  }, [isOpen, pointsDelta]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => onClose(), 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-180 max-h-50">
      <div className="flex flex-row bg-white rounded-2xl p-8 items-center justify-center gap-12 p-1 shadow-lg">
        <div className="relative w-40">
          <img
            src={normalizeAvatarPath(studentAvatar)}
            alt={`${studentFirstName} avatar`}
            width={120}
            height={120}
            className="rounded-lg object-cover"
            decoding="async"
            onError={(e) => {
              e.currentTarget.src = '/images/dashboard/student-avatars/avatar-01.png';
            }}
          />
        </div>
        <div className="flex flex-col gap-10 w-100 justify-center items-center">
          {studentFirstName.includes('Student') ? (
            <>
              <h2 className="text-5xl font-bold text-gray-900">
                {pointsDelta > 0 ? '+' : ''}
                {pointsDelta} points
              </h2>
              <div className="flex flex-row gap-2 items-center justify-center">
                <span className="text-lg font-semibold text-gray-900">awarded to</span>
                <span className="text-lg font-semibold text-gray-900">{studentFirstName}</span>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-5xl font-bold text-gray-900">{studentFirstName}</h2>
              <div className="flex flex-row gap-2 items-center justify-center">
                <div className="text-4xl font-bold text-red-600">
                  {pointsDelta > 0 ? '+' : ''}
                  {pointsDelta}
                </div>
                <span className="text-lg font-semibold text-gray-900"> awarded for</span>
                <span className="text-lg font-semibold text-gray-900">{categoryName}</span>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-3 w-40">
          {categoryIcon && (
            <div className="w-12 h-12 flex items-center justify-center">
              <img
                src={categoryIcon}
                alt={categoryName}
                width={120}
                height={120}
                className="w-12 h-12 object-contain"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
