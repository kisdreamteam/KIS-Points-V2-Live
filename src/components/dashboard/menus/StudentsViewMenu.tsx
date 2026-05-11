'use client';

type ViewMode = 'grid' | 'seating';

interface StudentsViewMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function StudentsViewMenu({ isOpen, currentView, onViewChange }: StudentsViewMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute bottom-full left-0 z-[100] mb-2 min-w-[200px] rounded-lg border-4 border-brand-purple bg-blue-100 py-2 shadow-lg">
      <div className="px-4 py-2 text-sm font-semibold text-brand-purple">View mode:</div>
      <button
        onClick={() => onViewChange('grid')}
        className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-100 ${currentView === 'grid' ? 'font-medium text-purple-600' : 'text-brand-purple'
          }`}
      >
        Student Grid
      </button>
      <button
        onClick={() => onViewChange('seating')}
        className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-100 ${currentView === 'seating' ? 'bg-purple-50 font-medium text-purple-600' : 'text-brand-purple'
          }`}
      >
        Seating Chart
      </button>
    </div>
  );
}
