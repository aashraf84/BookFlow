import { create } from 'zustand'

interface AppState {
  activeModule: string
  sidebarOpen: boolean
  setActiveModule: (module: string) => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  activeModule: 'dashboard',
  sidebarOpen: true,
  setActiveModule: (module: string) => set({ activeModule: module }),
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
}))
