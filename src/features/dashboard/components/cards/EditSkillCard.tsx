'use client';

import Image from 'next/image';
import { PointCategory } from '@/lib/types';

interface EditSkillCardProps {
  category: PointCategory;
  pointsValue: number;
  isHovered: boolean;
  isDeleting: boolean;
  isLoading: boolean;
  onEdit: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onDelete: () => void;
}

export default function EditSkillCard({
  category,
  pointsValue,
  isHovered,
  isDeleting,
  isLoading,
  onEdit,
  onHoverStart,
  onHoverEnd,
  onDelete,
}: EditSkillCardProps) {
  const isPositive = pointsValue > 0;

  return (
    <div
      onClick={onEdit}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      className="bg-white font-spartan rounded-3xl hover:bg-blue-100 hover:rounded-3xl shadow-md p-6 overflow-hidden hover:shadow-lg transition-shadow duration-200 relative group cursor-pointer aspect-square flex flex-col"
    >
      {isHovered ? (
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="text-purple-600 mb-2">
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-purple-600">Edit</span>
        </div>
      ) : (
        <>
          <div className="flex justify-center mb-1 pointer-events-none flex-shrink-0">
            {category.icon ? (
              <Image
                src={category.icon}
                alt={category.name}
                width={100}
                height={100}
                className="rounded-xl bg-[#FDF2F0] object-contain"
              />
            ) : (
              <div className="w-[100px] h-[100px] rounded-xl bg-[#FDF2F0] flex items-center justify-center">
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
          </div>
          <div className="text-center mb-0 pointer-events-none flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
          </div>
          <div className="text-center pointer-events-none mt-auto">
            <div
              className={`inline-flex items-center px-3 py-0 rounded-full bg-[#FDF2F0] ${isPositive ? 'text-red-400' : 'text-red-600'} text-xl font-large font-bold`}
            >
              {isPositive ? '+' : ''}
              {pointsValue}
            </div>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete();
        }}
        disabled={isDeleting || isLoading}
        className="absolute top-2 left-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
        title="Delete skill"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {isDeleting && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-90 flex items-center justify-center rounded-3xl z-20">
          <span className="text-sm text-gray-600">Deleting...</span>
        </div>
      )}
    </div>
  );
}
