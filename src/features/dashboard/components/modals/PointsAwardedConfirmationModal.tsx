'use client';

import { useEffect } from 'react';
import Modal from '@/components/ui/modals/Modal';
import { normalizeAvatarPath } from '@/lib/iconUtils';

interface PointsAwardedConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentAvatar: string;
  studentFirstName: string;
  points: number;
  categoryName: string;
  categoryIcon?: string;
}

const playChime = async () => {
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioContext = new AudioContextClass();
    if (audioContext.state === 'suspended') await audioContext.resume();
    const frequencies = [523.25, 659.25, 783.99];
    const duration = 0.3;
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      const now = audioContext.currentTime;
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
      oscillator.start(now + index * 0.05);
      oscillator.stop(now + duration + index * 0.05);
    });
  } catch {}
};

const playBoing = async () => {
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioContext = new AudioContextClass();
    if (audioContext.state === 'suspended') await audioContext.resume();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    const startFreq = 200;
    const endFreq = 100;
    const duration = 0.4;
    oscillator.type = 'sawtooth';
    const now = audioContext.currentTime;
    oscillator.frequency.setValueAtTime(startFreq, now);
    oscillator.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.4, now + 0.05);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.1);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
    oscillator.start(now);
    oscillator.stop(now + duration);
  } catch {}
};

export default function PointsAwardedConfirmationModal({
  isOpen,
  onClose,
  studentAvatar,
  studentFirstName,
  points,
  categoryName,
  categoryIcon,
}: PointsAwardedConfirmationModalProps) {
  useEffect(() => {
    if (isOpen) {
      if (points > 0) void playChime();
      else if (points < 0) void playBoing();
    }
  }, [isOpen, points]);

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
                {points > 0 ? '+' : ''}
                {points} points
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
                  {points > 0 ? '+' : ''}
                  {points}
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
