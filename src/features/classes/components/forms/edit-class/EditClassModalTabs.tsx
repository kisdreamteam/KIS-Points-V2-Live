'use client';

export type EditClassTab = 'info' | 'students' | 'teachers' | 'settings';

const TABS: { id: EditClassTab; label: string }[] = [
  { id: 'info', label: 'Info' },
  { id: 'students', label: 'Students' },
  { id: 'teachers', label: 'Teachers' },
  { id: 'settings', label: 'Settings' },
];

type EditClassModalTabsProps = {
  activeTab: EditClassTab;
  onTabChange: (tab: EditClassTab) => void;
};

export default function EditClassModalTabs({ activeTab, onTabChange }: EditClassModalTabsProps) {
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex gap-8">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-gray-900 border-b-2 border-red-500 -mb-px'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
