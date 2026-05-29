'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useUserStore } from '@/stores/useUserStore';

interface TopNavProps {
  currentClassName: string | null;
  suppressTeacherFallback?: boolean;
}

export default function TopNav({ currentClassName, suppressTeacherFallback = false }: TopNavProps) {
  const isLoadingProfile = useUserStore((s) => s.isLoadingProfile);
  const teacherProfile = useUserStore((s) => s.teacherProfile);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleContainerRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(72);

  const getTitleText = useCallback(() => {
    if (isLoadingProfile) return 'Loading...';
    if (currentClassName) return currentClassName;
    if (suppressTeacherFallback) return '';
    if (teacherProfile) return `${teacherProfile.title} ${teacherProfile.name.split(' ')[0]}'s Classes`;
    return 'Classes';
  }, [isLoadingProfile, currentClassName, teacherProfile, suppressTeacherFallback]);

  useEffect(() => {
    const adjustFontSize = () => {
      if (!titleRef.current || !titleContainerRef.current) return;

      const container = titleContainerRef.current;
      const textElement = titleRef.current;
      const containerWidth = container.offsetWidth;

      let size = 72;
      textElement.style.fontSize = `${size}px`;

      let minSize = 14;
      let maxSize = 72;

      while (minSize <= maxSize) {
        const testSize = Math.floor((minSize + maxSize) / 2);
        textElement.style.fontSize = `${testSize}px`;

        if (textElement.scrollWidth <= containerWidth) {
          size = testSize;
          minSize = testSize + 1;
        } else {
          maxSize = testSize - 1;
        }
      }

      setFontSize(size);
    };

    const timeoutId = setTimeout(() => {
      adjustFontSize();
    }, 0);

    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        adjustFontSize();
      }, 100);
    };

    window.addEventListener('resize', handleResize);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && titleContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        adjustFontSize();
      });
      resizeObserver.observe(titleContainerRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [isLoadingProfile, currentClassName, teacherProfile, suppressTeacherFallback, getTitleText]);

  return (
    <div
      className="flex h-30 min-w-0 w-full flex-row items-center justify-between overflow-hidden bg-white py-6 pl-2 pt-8 md:pl-7"
      data-top-nav
    >
      <div className="bg-white flex flex-row items-start justify-start flex-1 min-w-0">
        <div ref={titleContainerRef} className="flex-1 min-w-0 overflow-hidden pt-0">
          <h1
            ref={titleRef}
            className="font-bold text-gray-900 text-left font-spartan whitespace-nowrap text-xl md:text-7xl"
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: '1.2',
            }}
          >
            {isLoadingProfile ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600 mr-2"></div>
                Loading...
              </span>
            ) : currentClassName ? (
              currentClassName
            ) : suppressTeacherFallback ? (
              ''
            ) : teacherProfile ? (
              `${teacherProfile.title} ${teacherProfile.name.split(' ')[0]}'s Classes`
            ) : (
              'Classes'
            )}
          </h1>
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-end">
        <div className="relative h-16 w-16 shrink-0 md:h-40 md:w-40">
          <Image
            src="/images/shared/profile-avatar-dashboard.png"
            alt="KIS Points"
            fill
            sizes="160px"
            className="object-contain object-right"
          />
        </div>
      </div>
    </div>
  );
}
