import { create } from 'zustand';

export type ViewState = 'classes' | 'students' | 'seating_chart';

interface LayoutStore {
  activeView: ViewState;
  isSidebarOpen: boolean;
  isMultiSelectMode: boolean;
  isEditMode: boolean;
  isTimerOpen: boolean;
  isRandomOpen: boolean;
  isBellsOpen: boolean;
  isEditClassModalOpen: boolean;
  setActiveView: (view: ViewState) => void;
  setEditMode: (v: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setMultiSelectMode: (v: boolean) => void;
  toggleMultiSelectMode: () => void;
  setTimerOpen: (v: boolean) => void;
  setRandomOpen: (v: boolean) => void;
  setBellsOpen: (v: boolean) => void;
  setEditClassModalOpen: (v: boolean) => void;
}

export const useLayoutStore = create<LayoutStore>((set) => ({
  activeView: 'classes',
  isSidebarOpen: true,
  isMultiSelectMode: false,
  isEditMode: false,
  isTimerOpen: false,
  isRandomOpen: false,
  isBellsOpen: false,
  isEditClassModalOpen: false,
  setActiveView: (view) => set({ activeView: view }),
  setEditMode: (isEditMode) => set({ isEditMode }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  setMultiSelectMode: (isMultiSelectMode) => set({ isMultiSelectMode }),
  toggleMultiSelectMode: () => set((state) => ({ isMultiSelectMode: !state.isMultiSelectMode })),
  setTimerOpen: (isTimerOpen) => set({ isTimerOpen }),
  setRandomOpen: (isRandomOpen) =>
    set(
      isRandomOpen
        ? { isRandomOpen: true, isTimerOpen: false, isBellsOpen: false }
        : { isRandomOpen: false }
    ),
  setBellsOpen: (isBellsOpen) => set({ isBellsOpen }),
  setEditClassModalOpen: (isEditClassModalOpen) => set({ isEditClassModalOpen }),
}));