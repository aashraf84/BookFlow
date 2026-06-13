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
  Maximize2,
  Minus,
  X,
  Sparkles,
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

// ─── macOS Traffic Lights ────────────────────────────────────
function TrafficLights({ onClose, onMinimize, onMaximize }: { onClose?: () => void; onMinimize?: () => void; onMaximize?: () => void }) {
  return (
    <div className="flex items-center gap-2 pl-3">
      <button onClick={onClose} className="group size-3 rounded-full traffic-close flex items-center justify-center transition-colors">
        <X className="size-1.5 text-transparent group-hover:text-black/60" strokeWidth={3} />
      </button>
      <button onClick={onMinimize} className="group size-3 rounded-full traffic-minimize flex items-center justify-center transition-colors">
        <Minus className="size-1.5 text-transparent group-hover:text-black/60" strokeWidth={3} />
      </button>
      <button onClick={onMaximize} className="group size-3 rounded-full traffic-maximize flex items-center justify-center transition-colors">
        <Maximize2 className="size-1.5 text-transparent group-hover:text-black/60" strokeWidth={3} />
      </button>
    </div>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────
function AppSidebar() {
  const { activeModule, setActiveModule } = useAppStore()

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
              <div className="flex aspect-square size-8 items-center justify-center rounded-[10px] macos-gradient text-white shadow-sm">
                <BookOpen className="size-4" strokeWidth={2.5} />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-[13px] tracking-tight">BookFlow OS</span>
                <span className="truncate text-[11px] text-sidebar-foreground/50">Enterprise Platform</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="custom-scrollbar px-2 pb-2">
        {navGroups.map((group) => {
          const groupModules = navModules.filter((m) => m.group === group.id)
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
        <div className="group-data-[collapsible=icon]:hidden">
          <div className="rounded-lg bg-sidebar-accent/50 p-2.5 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Sparkles className="size-3 text-sidebar-primary" />
              <span className="text-[11px] font-semibold text-sidebar-foreground/70">ApexFlow Ecosystem</span>
            </div>
            <p className="text-[10px] text-sidebar-foreground/40">v27.0 · Retina</p>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

// ─── Titlebar / Header ───────────────────────────────────────
function AppHeader() {
  const { activeModule, sidebarOpen, setSidebarOpen } = useAppStore()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const currentModule = getModuleById(activeModule)
  const moduleName = currentModule?.label || 'Dashboard'

  return (
    <header className="macos-titlebar flex h-[52px] shrink-0 items-center gap-3 border-b border-border/50 bg-background/80 glass-thin px-4">
      {/* Traffic Lights */}
      <TrafficLights />

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

      {/* User Avatar */}
      <Avatar className="size-7 cursor-default ring-1 ring-border/50">
        <AvatarFallback className="bg-macos-blue/10 text-macos-blue text-[10px] font-bold tracking-tight">
          AD
        </AvatarFallback>
      </Avatar>
    </header>
  )
}

// ─── Footer ──────────────────────────────────────────────────
function AppFooter() {
  return (
    <footer className="mt-auto border-t border-border/30 bg-background/60 glass-thin">
      <div className="flex items-center justify-between px-4 h-8 text-[11px] text-muted-foreground/60 font-medium tracking-tight">
        <span>
          BookFlow OS <span className="mx-0.5 opacity-30">·</span>{' '}
          <span className="text-primary/70">ApexFlow</span> Ecosystem
        </span>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-macos-green" />
            Online
          </span>
          <span className="opacity-30">·</span>
          <span>v27.0</span>
        </div>
      </div>
    </footer>
  )
}

// ─── Main Shell ──────────────────────────────────────────────
export function AppShell() {
  const { activeModule, sidebarOpen, setSidebarOpen } = useAppStore()

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
