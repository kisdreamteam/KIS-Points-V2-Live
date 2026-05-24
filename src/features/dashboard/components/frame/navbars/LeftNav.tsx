'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { normalizeClassIconPath } from '@/lib/iconUtils';
import IconTimerClock from '@/components/ui/icons/iconTimerClock';
import LeftNavWebsitesMenu from '@/features/dashboard/components/menus/LeftNavWebsitesMenu';
import { useDashboardToolbarInset } from '@/features/dashboard/hooks/useDashboardToolbarInset';
import { useLayoutStore } from '@/stores/useLayoutStore';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { usePreferenceStore } from '@/stores/usePreferenceStore';

/** Set to `true` to show the Archived Classes row in the sidebar again. */
const SHOW_ARCHIVED_CLASSES_IN_NAV = false;

export default function LeftNav() {
  const [isWebsitesMenuOpen, setIsWebsitesMenuOpen] = useState(false);
  const websitesMenuRef = useRef<HTMLDivElement>(null);
  const websitesToggleRef = useRef<HTMLButtonElement>(null);
  const toolbarInset = useDashboardToolbarInset();
  const router = useRouter();
  const searchParams = useSearchParams();
  const allAccessibleClasses = useDashboardStore((s) => s.allAccessibleClasses);
  const isLoadingClasses = useDashboardStore((s) => s.isLoadingClasses);
  const activeClassId = useDashboardStore((s) => s.activeClassId);
  const viewPreference = usePreferenceStore((s) => s.viewPreference);
  const viewMode = usePreferenceStore((s) => s.viewMode);
  const setViewMode = usePreferenceStore((s) => s.setViewMode);
  const viewFromUrl = searchParams?.get('view');
  const smartDiveView =
    viewFromUrl === 'seating'
      ? 'seating'
      : viewFromUrl === 'grid'
        ? 'grid'
        : viewPreference === 'seating'
          ? 'seating'
          : 'grid';

  const handleAllClassesClick = () => {
    useLayoutStore.getState().setActiveView('classes');
    setViewMode('active');
    router.push('/dashboard');
  };

  const activeClasses = allAccessibleClasses.filter((cls) => !cls.is_archived);
  const hasArchivedClasses =
    SHOW_ARCHIVED_CLASSES_IN_NAV && allAccessibleClasses.some((cls) => cls.is_archived);

  const handleArchivedClassesClick = () => {
    useLayoutStore.getState().setActiveView('classes');
    setViewMode('archived');
    router.push('/dashboard');
  };

  useEffect(() => {
    if (!isWebsitesMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (websitesMenuRef.current?.contains(target)) return;
      if (websitesToggleRef.current?.contains(target)) return;
      setIsWebsitesMenuOpen(false);
    };

    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, [isWebsitesMenuOpen]);

  return (
    <>
      <div className="p-4 flex flex-col h-full max-h-screen">
        <div className="flex-shrink-0 flex flex-col min-h-0 flex-1">
          <div className="bg-brand-cream rounded-4xl p-0 mb-4 flex-shrink-0">
            <div className="text-center">
              <Image
                src="/images/shared/default-image.png"
                alt="User Avatar"
                width={250}
                height={250}
                className="mx-auto mb-2"
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>
          </div>

          <button
            onClick={handleAllClassesClick}
            className={`w-full bg-brand-purple text-white p-3 rounded-lg mb-4 hover:bg-blue-800 transition-colors cursor-pointer flex-shrink-0 ${viewMode === 'active' ? 'ring-2 ring-white ring-offset-2 ring-offset-brand-purple' : ''
              }`}
          >
            <h2 className="text-center font-semibold">All Classes</h2>
          </button>

          {/* LeftNav Classes List Starts Here - brrand cream container*/}
          <div className="flex-1 overflow-y-auto space-y-2 min-h-0 bg-brand-cream rounded-xl mb-4">
            {/* if loading classes, show loading spinner, otherwise show no classes found message, else show the classes list */}
            {isLoadingClasses ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                <span className="ml-2 text-sm text-gray-600">Loading classes...</span>
              </div>
            ) : activeClasses.length === 0 && !hasArchivedClasses ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No classes yet</p>
              </div>
            ) : (
              <>
                {/* map through the active classes and create a link for each class */}
                {activeClasses.map((cls) => {
                  const isActiveClass = activeClassId === cls.id;
                  return (
                    <Link
                      key={cls.id}
                      href={
                        smartDiveView === 'seating'
                          ? `/dashboard/classes/${cls.id}?view=seating`
                          : `/dashboard/classes/${cls.id}`
                      }
                      className="block"
                      onClick={() => {
                        useDashboardStore.getState().setActiveClassId(cls.id);
                      }}
                    >
                      <div
                        className={`flex items-center space-x-3 px-2 py-1rounded cursor-pointer transition-colors ${isActiveClass ? 'bg-purple-400 hover:bg-purple-500' : 'hover:bg-blue-200'
                          }`}
                      >
                        <div className="w-6 h-6 flex-shrink-0">
                          <Image
                            src={normalizeClassIconPath(cls.icon)}
                            alt={`${cls.name} icon`}
                            width={32}
                            height={32}
                            className="rounded"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span
                            className={`text-xl font-medium block truncate ${isActiveClass ? 'text-white' : 'text-gray-800'
                              }`}
                          >
                            {cls.name}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}

                {/* {hasArchivedClasses && (
                <div
                  onClick={handleArchivedClassesClick}
                  className={`flex items-center space-x-3 p-2 hover:bg-blue-200 rounded cursor-pointer transition-colors ${viewMode === 'archived' ? 'bg-blue-200' : ''
                    }`}
                >
                  <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                    <IconTimerClock className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xl font-medium text-gray-800 block truncate">Archived Classes</span>
                  </div>
                </div>
              )} */}
              </>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 mt-auto">
          <div className="flex gap-2 mb-2">
            <div className="flex-1 bg-brand-pink text-white p-3 rounded-lg opacity-50 cursor-default">
              <div className="text-center font-semibold">KI-EUN</div>
            </div>
            <button
              ref={websitesToggleRef}
              type="button"
              onClick={() => setIsWebsitesMenuOpen((open) => !open)}
              className="flex-1 bg-brand-pink text-white p-3 rounded-lg font-semibold hover:brightness-95 transition"
              aria-expanded={isWebsitesMenuOpen}
            >
              Websites
            </button>
          </div>
        </div>
      </div>
      <div ref={websitesMenuRef}>
        <LeftNavWebsitesMenu
          isOpen={isWebsitesMenuOpen}
          position="fixed"
          leftPx={306}
          topPx={toolbarInset.top + 2}
          bottomPx={toolbarInset.bottom - 1}
          zIndex={35}
        />
      </div>
    </>
  );
}
