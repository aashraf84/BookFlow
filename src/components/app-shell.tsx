'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import {
  Search,
  Moon,
  Sun,
  Bell,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Eye,
  LogOut,
  Shield,
  Crown,
} from 'lucide-react'

import { useAppStore } from '@/store/app-store'
import { navModules, navGroups, getModuleById } from '@/lib/nav-config'
import { ModuleContent } from '@/components/module-content'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// ─── Sidebar ─────────────────────────────────────────────────
function AppSidebar() {
  const { activeModule, setActiveModule, authUser } = useAppStore()

  const initials = authUser?.name
    ? authUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'BF'

  return (
    <Sidebar collapsible="icon" className="border-r-0 glass-sidebar macos-shadow">
      <SidebarHeader className="p-2 pt-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-sidebar-accent rounded-lg"
              onClick={() => setActiveModule('dashboard')}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-[10px] macos-gradient-golden text-white shadow-sm">
                <BookOpen className="size-4" strokeWidth={2.5} />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-[13px] tracking-tight">BookFlow OS</span>
                <span className="truncate text-[11px] text-sidebar-foreground/50">v27.0 Professional</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="custom-scrollbar px-2 pb-2">
        {navGroups.map((group) => {
          const groupModules = navModules.filter((m) => {
            if (m.group !== group.id) return false
            // Hide owner-only modules from non-owners
            if (m.ownerOnly && authUser?.role !== 'owner') return false
            return true
          })
          // Don't render empty groups
          if (groupModules.length === 0) return null
          return (
            <SidebarGroup key={group.id} className="py-1">
              <SidebarGroupLabel className="text-[10px] uppercase tracking-wider font-semibold text-sidebar-foreground/40 px-2 mb-0.5">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {groupModules.map((module) => {
                    const Icon = module.icon
                    const isActive = activeModule === module.id
                    return (
                      <SidebarMenuItem key={module.id}>
                        <SidebarMenuButton
                          isActive={isActive}
                          tooltip={module.label}
                          onClick={() => setActiveModule(module.id)}
                          className={`
                            h-8 rounded-lg text-[13px] font-medium tracking-tight
                            transition-all duration-150 ease-out
                            ${isActive
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-[0_0.5px_1px_rgba(0,0,0,0.04)]'
                              : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                            }
                          `}
                        >
                          <Icon className={`size-[16px] ${isActive ? 'text-sidebar-primary' : ''}`} strokeWidth={isActive ? 2 : 1.5} />
                          <span>{module.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>

      <SidebarFooter className="px-2 pb-3">
        {/* View Only Banner */}
        {authUser?.isViewOnly && (
          <div className="group-data-[collapsible=icon]:hidden mb-2">
            <div className="rounded-lg bg-[#AF52DE]/10 border border-[#AF52DE]/20 p-2.5 flex items-center gap-2">
              <Eye className="size-3.5 text-[#AF52DE]" strokeWidth={2} />
              <div>
                <p className="text-[11px] font-semibold text-[#AF52DE]">View Only Mode</p>
                <p className="text-[10px] text-sidebar-foreground/40">Actions are disabled</p>
              </div>
            </div>
          </div>
        )}

        {/* Owner Badge */}
        {authUser?.role === 'owner' && (
          <div className="group-data-[collapsible=icon]:hidden mb-2">
            <div className="rounded-lg bg-[#FF9500]/10 border border-[#FF9500]/20 p-2.5 flex items-center gap-2">
              <Crown className="size-3.5 text-[#FF9500]" strokeWidth={2} />
              <div>
                <p className="text-[11px] font-semibold text-[#FF9500]">Owner Access</p>
                <p className="text-[10px] text-sidebar-foreground/40">Full system control</p>
              </div>
            </div>
          </div>
        )}

        <div className="group-data-[collapsible=icon]:hidden">
          <div className="rounded-lg bg-sidebar-accent/50 p-2.5 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Crown className="size-3 text-sidebar-primary" />
              <span className="text-[11px] font-semibold text-sidebar-foreground/70">BookFlow OS</span>
            </div>
            <p className="text-[10px] text-sidebar-foreground/40">v27.0.0 · Professional Edition</p>
            <p className="text-[9px] text-sidebar-foreground/30 mt-0.5">© 2025 ApexFlow Ecosystem</p>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

// ─── Titlebar / Header ───────────────────────────────────────
function AppHeader() {
  const { activeModule, sidebarOpen, setSidebarOpen, authUser, logout, authToken } = useAppStore()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const currentModule = getModuleById(activeModule)
  const moduleName = currentModule?.label || 'Dashboard'

  const initials = authUser?.name
    ? authUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'BF'

  const handleLogout = async () => {
    if (authToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` },
        })
      } catch {}
    }
    localStorage.removeItem('bf_auth_token')
    localStorage.removeItem('bf_auth_user')
    logout()
  }

  return (
    <header className="macos-titlebar flex h-[52px] shrink-0 items-center gap-3 border-b border-border/50 bg-background/80 glass-thin px-4">
      {/* Sidebar Toggle */}
      <SidebarTrigger
        className="-mx-1 flex size-7 items-center justify-center rounded-md hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
        aria-label="Toggle sidebar"
      />

      {/* Breadcrumb */}
      <div className="hidden sm:flex items-center gap-1.5 text-[13px]">
        <span className="text-muted-foreground font-medium">BookFlow OS</span>
        <ChevronRight className="size-3 text-muted-foreground/50" strokeWidth={2} />
        <span className="font-semibold text-foreground">{moduleName}</span>
      </div>

      {/* Mobile: Module name */}
      <span className="font-semibold text-[13px] sm:hidden">{moduleName}</span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* View Only Badge */}
      {authUser?.isViewOnly && (
        <Badge variant="outline" className="hidden sm:flex items-center gap-1 h-6 px-2 text-[10px] font-semibold border-[#AF52DE]/30 text-[#AF52DE] bg-[#AF52DE]/5">
          <Eye className="size-3" strokeWidth={2} />
          VIEW ONLY
        </Badge>
      )}

      {/* Search Bar - macOS Spotlight Style */}
      <div className="hidden md:flex items-center relative max-w-[240px] w-full">
        <Search className="absolute left-2.5 size-3.5 text-muted-foreground/60" strokeWidth={2} />
        <Input
          type="search"
          placeholder="Search..."
          className="h-7 pl-7 pr-3 text-[13px] bg-secondary/80 border-0 rounded-lg focus-visible:ring-1 focus-visible:ring-primary/30 placeholder:text-muted-foreground/50 font-medium tracking-tight"
        />
      </div>

      {/* Theme Toggle */}
      {mounted && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="size-3.5 text-yellow-500" strokeWidth={2} />
                ) : (
                  <Moon className="size-3.5 text-muted-foreground" strokeWidth={2} />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Notifications */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06] relative"
              aria-label="Notifications"
            >
              <Bell className="size-3.5 text-muted-foreground" strokeWidth={2} />
              <span className="absolute top-1 right-1 size-1.5 rounded-full bg-macos-red" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">Notifications</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* User Avatar + Dropdown */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 cursor-default"
            >
              <Avatar className="size-7 cursor-pointer ring-1 ring-border/50 hover:ring-primary/30 transition-all">
                <AvatarFallback className={`text-[10px] font-bold tracking-tight ${
                  authUser?.isViewOnly
                    ? 'bg-[#AF52DE]/10 text-[#AF52DE]'
                    : 'bg-macos-blue/10 text-macos-blue'
                }`}>
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            <div className="text-center">
              <p>{authUser?.name || 'User'}</p>
              <p className="text-muted-foreground text-[10px]">{authUser?.email}</p>
              <p className="text-muted-foreground text-[10px] mt-0.5">Click to sign out</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </header>
  )
}

// ─── Footer ──────────────────────────────────────────────────
function AppFooter() {
  const { authUser } = useAppStore()

  return (
    <footer className="mt-auto border-t border-border/30 bg-background/60 glass-thin">
      <div className="flex items-center justify-between px-4 h-8 text-[11px] text-muted-foreground/60 font-medium tracking-tight">
        <span>
          BookFlow OS v27.0
          {authUser?.isViewOnly && (
            <>
              <span className="mx-0.5 opacity-30">·</span>
              <span className="text-[#AF52DE]/70 flex items-center gap-0.5 inline-flex">
                <Eye className="size-2.5" />
                Demo
              </span>
            </>
          )}
        </span>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-macos-green" />
            Online
          </span>
          <span className="opacity-30">·</span>
          <span>Powered by ApexFlow</span>
        </div>
      </div>
    </footer>
  )
}

// ─── Main Shell ──────────────────────────────────────────────
export function AppShell() {
  const { activeModule, sidebarOpen, setSidebarOpen, authUser } = useAppStore()

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <AppSidebar />
      <SidebarInset>
        <div className="flex min-h-svh flex-col bg-background">
          <AppHeader />
          <main className="flex-1 overflow-auto">
            <div className="p-5 md:p-6 lg:p-8 max-w-[1600px]">
              <ModuleContent activeModule={activeModule} />
            </div>
          </main>
          <AppFooter />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
