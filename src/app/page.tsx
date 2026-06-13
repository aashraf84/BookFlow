'use client'

import { useAppStore } from '@/store/app-store'
import { LoginGate } from '@/components/login-gate'
import { AppShell } from '@/components/app-shell'

export default function Home() {
  const { isAuthenticated } = useAppStore()

  if (!isAuthenticated) {
    return <LoginGate />
  }

  return <AppShell />
}
