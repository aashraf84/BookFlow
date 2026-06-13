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
  SidebarSeparator,
} from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
 BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

function AppSidebar() {
  const { activeModule, setActiveModule } = useAppStore()

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-sidebar-accent"
              onClick={() => setActiveModule('dashboard')}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BookOpen className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold text-base">BookFlow OS</span>
                <span className="truncate text-xs opacity-70">Business Platform</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="custom-scrollbar">
        {navGroups.map((group) => {
          const groupModules = navModules.filter((m) => m.group === group.id)
          return (
            <SidebarGroup key={group.id}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {groupModules.map((module) => {
                    const Icon = module.icon
                    const isActive = activeModule === module.id
                    return (
                      <SidebarMenuItem key={module.id}>
                        <SidebarMenuButton
                          isActive={isActive}
                          tooltip={module.label}
                          onClick={() => setActiveModule(module.id)}
                          className={isActive ? 'bg-primary/15 text-primary font-medium hover:bg-primary/20 hover:text-primary' : ''}
                        >
                          <Icon className="size-4" />
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

      <SidebarFooter>
        <SidebarSeparator />
        <div className="px-2 py-1 group-data-[collapsible=icon]:hidden">
          <p className="text-xs text-sidebar-foreground/50 text-center">
            ApexFlow Ecosystem
          </p>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

function AppHeader() {
  const { activeModule } = useAppStore()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const currentModule = getModuleById(activeModule)
  const moduleName = currentModule?.label || 'Dashboard'

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      {/* Breadcrumb */}
      <Breadcrumb className="hidden sm:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <span className="text-muted-foreground text-sm cursor-default">BookFlow OS</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="size-3" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium">{moduleName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Mobile: show just module name */}
      <span className="font-medium text-sm sm:hidden">{moduleName}</span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search Bar */}
      <div className="hidden md:flex items-center relative max-w-xs w-full">
        <Search className="absolute left-2.5 size-3.5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search anything..."
          className="h-8 pl-8 text-sm bg-muted/50 border-0 focus-visible:ring-1"
        />
      </div>

      {/* Dark Mode Toggle */}
      {mounted && (
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </Button>
      )}

      {/* Notification Bell */}
      <Button variant="ghost" size="icon" className="size-8 relative" aria-label="Notifications">
        <Bell className="size-4" />
        <span className="absolute top-1 right-1 size-2 rounded-full bg-primary" />
      </Button>

      {/* User Avatar */}
      <Avatar className="size-8 cursor-default">
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
          AD
        </AvatarFallback>
      </Avatar>
    </header>
  )
}

function AppFooter() {
  return (
    <footer className="mt-auto border-t bg-background">
      <div className="flex items-center justify-between px-4 py-3 text-xs text-muted-foreground">
        <span className="font-medium">
          BookFlow OS <span className="mx-1">—</span>{' '}
          <span className="text-primary">ApexFlow</span> Ecosystem
        </span>
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal">
          v1.0
        </Badge>
      </div>
    </footer>
  )
}

export function AppShell() {
  const { activeModule, sidebarOpen, setSidebarOpen } = useAppStore()

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <AppSidebar />
      <SidebarInset>
        <div className="flex min-h-svh flex-col">
          <AppHeader />
          <main className="flex-1 overflow-auto">
            <div className="p-4 md:p-6">
              <ModuleContent activeModule={activeModule} />
            </div>
          </main>
          <AppFooter />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
