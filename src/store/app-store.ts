import { create } from 'zustand'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  isViewOnly: boolean
}

interface AppState {
  activeModule: string
  sidebarOpen: boolean
  // Auth
  isAuthenticated: boolean
  isDeviceActivated: boolean
  authUser: AuthUser | null
  authToken: string | null
  // Actions
  setActiveModule: (module: string) => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setAuth: (user: AuthUser, token: string) => void
  setDeviceActivated: (activated: boolean) => void
  logout: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  activeModule: 'dashboard',
  sidebarOpen: true,
  isAuthenticated: false,
  isDeviceActivated: false,
  authUser: null,
  authToken: null,
  setActiveModule: (module: string) => set({ activeModule: module }),
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
  setAuth: (user: AuthUser, token: string) => set({
    isAuthenticated: true,
    authUser: user,
    authToken: token,
  }),
  setDeviceActivated: (activated: boolean) => set({ isDeviceActivated: activated }),
  logout: () => set({
    isAuthenticated: false,
    authUser: null,
    authToken: null,
  }),
}))
