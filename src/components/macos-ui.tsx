'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button, ButtonProps } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { LucideIcon, Search, X, ArrowUpRight, ArrowDownRight } from 'lucide-react'

// ─── macOS Page Header ─────────────────────────────────────────
interface MacosPageHeaderProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  iconColor?: string
  iconBg?: string
  children?: React.ReactNode
}

export function MacosPageHeader({ title, subtitle, icon: Icon, iconColor, iconBg, children }: MacosPageHeaderProps) {
  return (
    <div className="macos-page-header">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={cn('flex size-10 items-center justify-center rounded-xl shadow-sm', iconBg || 'bg-primary/10')}>
            <Icon className={cn('size-5', iconColor || 'text-primary')} strokeWidth={1.8} />
          </div>
        )}
        <div>
          <h1 className="macos-page-title">{title}</h1>
          {subtitle && <p className="macos-page-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {children}
      </div>
    </div>
  )
}

// ─── macOS Stat Card ───────────────────────────────────────────
interface MacosStatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  trend?: { value: number; label?: string }
  className?: string
}

export function MacosStatCard({ label, value, icon: Icon, iconColor, iconBg, trend, className }: MacosStatCardProps) {
  return (
    <div className={cn('macos-stat macos-card-hover group', className)}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn('flex size-9 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105', iconBg || 'bg-primary/10')}>
          <Icon className={cn('size-[18px]', iconColor || 'text-primary')} strokeWidth={1.8} />
        </div>
        {trend && (
          <div className={cn(
            'flex items-center gap-0.5 macos-badge',
            trend.value >= 0 ? 'bg-macos-green/10 text-macos-green' : 'bg-macos-red/10 text-macos-red'
          )}>
            {trend.value >= 0 ? (
              <ArrowUpRight className="size-3" strokeWidth={2.5} />
            ) : (
              <ArrowDownRight className="size-3" strokeWidth={2.5} />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
      <div className="text-[12px] font-medium text-muted-foreground mt-0.5">{label}</div>
    </div>
  )
}

// ─── macOS Glass Card ──────────────────────────────────────────
interface MacosCardProps {
  title?: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}

export function MacosCard({ title, subtitle, action, children, className, noPadding }: MacosCardProps) {
  return (
    <div className={cn('macos-card macos-shadow-card', className)}>
      {(title || action) && (
        <div className="macos-section-header px-5 pt-4 pb-0">
          <div>
            {title && <h3 className="macos-section-title">{title}</h3>}
            {subtitle && <p className="macos-section-desc">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={cn(noPadding ? '' : 'p-5')}>{children}</div>
    </div>
  )
}

// ─── macOS Search Field ────────────────────────────────────────
interface MacosSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function MacosSearch({ value, onChange, placeholder = 'Search...', className }: MacosSearchProps) {
  return (
    <div className={cn('macos-search flex items-center gap-2 px-3 h-8', className)}>
      <Search className="size-3.5 text-muted-foreground/60 shrink-0" strokeWidth={2} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-[13px] font-medium tracking-tight placeholder:text-muted-foreground/50 outline-none text-foreground"
      />
      {value && (
        <button onClick={() => onChange('')} className="shrink-0">
          <X className="size-3 text-muted-foreground/50 hover:text-foreground" strokeWidth={2} />
        </button>
      )}
    </div>
  )
}

// ─── macOS Filter Bar (Segmented Control) ──────────────────────
interface MacosFilterBarProps {
  items: { id: string; label: string; count?: number }[]
  activeId: string
  onChange: (id: string) => void
  className?: string
}

export function MacosFilterBar({ items, activeId, onChange, className }: MacosFilterBarProps) {
  return (
    <div className={cn('macos-filter-bar', className)}>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={cn(
            'macos-filter-item',
            activeId === item.id && 'macos-filter-item-active'
          )}
        >
          {item.label}
          {item.count !== undefined && (
            <span className="ml-1 text-[10px] opacity-50">{item.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}

// ─── macOS Action Button ───────────────────────────────────────
interface MacosButtonProps extends ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  icon?: LucideIcon
}

export function MacosButton({ variant = 'secondary', icon: Icon, children, className, ...props }: MacosButtonProps) {
  const variantStyles: Record<string, string> = {
    primary: 'macos-pill bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
    secondary: 'macos-pill bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50',
    ghost: 'macos-pill hover:bg-secondary text-foreground',
    danger: 'macos-pill bg-macos-red/10 text-macos-red hover:bg-macos-red/20',
  }

  return (
    <Button
      className={cn(variantStyles[variant], 'gap-1.5 h-8 text-[12px] font-semibold tracking-tight', className)}
      {...props}
    >
      {Icon && <Icon className="size-3.5" strokeWidth={2} />}
      {children}
    </Button>
  )
}

// ─── macOS Badge ───────────────────────────────────────────────
interface MacosBadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
  children: React.ReactNode
  className?: string
}

export function MacosBadge({ variant = 'default', children, className }: MacosBadgeProps) {
  const variantStyles: Record<string, string> = {
    default: 'bg-secondary text-foreground',
    success: 'bg-macos-green/10 text-macos-green',
    warning: 'bg-macos-orange/10 text-macos-orange',
    danger: 'bg-macos-red/10 text-macos-red',
    info: 'bg-macos-blue/10 text-macos-blue',
    purple: 'bg-macos-purple/10 text-macos-purple',
  }

  return (
    <span className={cn('macos-badge', variantStyles[variant], className)}>
      {children}
    </span>
  )
}

// ─── macOS Table Card ──────────────────────────────────────────
interface MacosTableCardProps {
  title?: string
  subtitle?: string
  action?: React.ReactNode
  headers: { key: string; label: string; className?: string }[]
  rows: Array<Record<string, React.ReactNode>>
  onRowClick?: (index: number) => void
  emptyMessage?: string
  emptyIcon?: LucideIcon
  className?: string
}

export function MacosTableCard({ title, subtitle, action, headers, rows, onRowClick, emptyMessage = 'No data found', emptyIcon: EmptyIcon, className }: MacosTableCardProps) {
  return (
    <div className={cn('macos-card macos-shadow-card', className)}>
      {(title || action) && (
        <div className="macos-section-header px-5 pt-4 pb-3">
          <div>
            {title && <h3 className="macos-section-title">{title}</h3>}
            {subtitle && <p className="macos-section-desc">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="overflow-x-auto custom-scrollbar">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 hover:bg-transparent">
              {headers.map((h) => (
                <TableHead key={h.key} className={cn('text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9', h.className)}>
                  {h.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={headers.length} className="h-32">
                  <div className="macos-empty">
                    {EmptyIcon && <EmptyIcon className="size-10 text-muted-foreground/20 mb-3" strokeWidth={1.2} />}
                    <p className="text-[13px] font-medium text-muted-foreground/50">{emptyMessage}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, i) => (
                <TableRow
                  key={i}
                  onClick={() => onRowClick?.(i)}
                  className={cn('macos-table-row cursor-default border-b border-border/30 last:border-0', onRowClick && 'cursor-pointer')}
                >
                  {headers.map((h) => (
                    <TableCell key={h.key} className="text-[13px] font-medium tracking-tight py-3">
                      {row[h.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// ─── macOS Dialog ──────────────────────────────────────────────
interface MacosDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function MacosDialog({ open, onOpenChange, title, description, children, footer, className }: MacosDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('macos-card macos-shadow-elevated glass-card border-border/50 p-0 gap-0 max-w-lg', className)}>
        <DialogHeader className="px-6 pt-5 pb-2">
          <DialogTitle className="macos-page-title text-lg">{title}</DialogTitle>
          {description && <DialogDescription className="macos-page-subtitle text-[12px]">{description}</DialogDescription>}
        </DialogHeader>
        <div className="px-6 py-4">{children}</div>
        {footer && (
          <DialogFooter className="px-6 pb-5 pt-2 gap-2">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── macOS Empty State ─────────────────────────────────────────
interface MacosEmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function MacosEmptyState({ icon: Icon, title, description, action, className }: MacosEmptyStateProps) {
  return (
    <div className={cn('macos-empty', className)}>
      {Icon && <Icon className="size-12 text-muted-foreground/15 mb-4" strokeWidth={1.2} />}
      <p className="text-[15px] font-semibold text-foreground/70 mb-1">{title}</p>
      {description && <p className="text-[13px] text-muted-foreground/50 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ─── macOS Section Header ──────────────────────────────────────
interface MacosSectionProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

export function MacosSection({ title, subtitle, action, className }: MacosSectionProps) {
  return (
    <div className={cn('macos-section-header', className)}>
      <div>
        <h3 className="macos-section-title">{title}</h3>
        {subtitle && <p className="macos-section-desc">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ─── macOS Form Field ──────────────────────────────────────────
interface MacosFormFieldProps {
  label: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function MacosFormField({ label, description, children, className }: MacosFormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="text-[12px] font-semibold tracking-tight text-foreground/80">{label}</label>
      {children}
      {description && <p className="text-[11px] text-muted-foreground/50">{description}</p>}
    </div>
  )
}

// ─── macOS Stat Grid ───────────────────────────────────────────
export function MacosStatGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-3', className)}>
      {children}
    </div>
  )
}

// ─── macOS Content Grid ────────────────────────────────────────
export function MacosContentGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-2 gap-4', className)}>
      {children}
    </div>
  )
}

// ─── Loading Skeletons ─────────────────────────────────────────
export function MacosStatSkeleton() {
  return (
    <div className="macos-stat">
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="size-9 rounded-xl" />
        <Skeleton className="h-5 w-12 rounded-md" />
      </div>
      <Skeleton className="h-7 w-24 mb-1" />
      <Skeleton className="h-3 w-16" />
    </div>
  )
}

export function MacosTableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="macos-card macos-shadow-card p-5">
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
