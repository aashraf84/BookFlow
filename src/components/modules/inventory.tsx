'use client'

import * as React from 'react'
import {
  Warehouse as WarehouseIcon,
  AlertTriangle,
  ArrowRightLeft,
  Loader2,
  AlertCircle,
  Plus,
  Settings2,
  Package,
  TrendingDown,
  Building2,
  ChevronRight,
  Boxes,
  BarChart3,
} from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'
import {
  MacosPageHeader,
  MacosStatCard,
  MacosCard,
  MacosSearch,
  MacosFilterBar,
  MacosButton,
  MacosBadge,
  MacosDialog,
  MacosFormField,
  MacosStatGrid,
  MacosEmptyState,
} from '@/components/macos-ui'

// ─── Types ────────────────────────────────────────────────────────
interface Branch {
  id: string
  name: string
  code: string
}

interface Warehouse {
  id: string
  name: string
  code: string
  address?: string | null
  branchId?: string | null
  branch?: Branch | null
  isActive: boolean
  inventory?: Array<{ quantity: number; costPrice: number; sellingPrice: number }>
}

interface InventoryItem {
  id: string
  warehouseId: string | null
  branchId: string | null
  bookId: string | null
  stationeryId: string | null
  quantity: number
  reorderLevel: number
  maxStockLevel: number
  batchNumber: string | null
  costPrice: number
  sellingPrice: number
  location: string | null
  isLowStock?: boolean
  book?: { id: string; title: string; isbn: string | null; price: number; author?: { name: string } | null } | null
  stationery?: { id: string; name: string; sku: string | null; price: number; brand: string | null } | null
  warehouse?: { id: string; name: string; code: string } | null
  branch?: { id: string; name: string; code: string } | null
}

interface StockTransfer {
  id: string
  fromBranchId: string
  toBranchId: string
  items: string
  status: string
  notes: string | null
  createdAt: string
  updatedAt: string
  fromBranch: Branch
  toBranch: Branch
}

// ─── Helpers ──────────────────────────────────────────────────────
function getProductName(item: InventoryItem): string {
  if (item.book) return item.book.title
  if (item.stationery) return item.stationery.name
  return 'Unknown Product'
}

type StockLevel = 'healthy' | 'moderate' | 'low' | 'critical'

function getStockLevel(item: InventoryItem): StockLevel {
  if (item.quantity === 0) return 'critical'
  const ratio = item.maxStockLevel > 0 ? item.quantity / item.maxStockLevel : item.quantity / (item.reorderLevel * 3)
  if (item.isLowStock || item.quantity <= item.reorderLevel) return 'low'
  if (ratio < 0.5) return 'moderate'
  return 'healthy'
}

function getStockLevelColors(level: StockLevel) {
  const map: Record<StockLevel, { bar: string; bg: string; text: string; label: string }> = {
    healthy: { bar: 'bg-macos-green', bg: 'bg-macos-green/10', text: 'text-macos-green', label: 'In Stock' },
    moderate: { bar: 'bg-macos-yellow', bg: 'bg-macos-yellow/10', text: 'text-macos-yellow', label: 'Moderate' },
    low: { bar: 'bg-macos-orange', bg: 'bg-macos-orange/10', text: 'text-macos-orange', label: 'Low Stock' },
    critical: { bar: 'bg-macos-red', bg: 'bg-macos-red/10', text: 'text-macos-red', label: 'Out of Stock' },
  }
  return map[level]
}

function getTransferStatusBadge(status: string) {
  const map: Record<string, { variant: 'warning' | 'info' | 'success' | 'danger'; label: string }> = {
    pending: { variant: 'warning', label: 'Pending' },
    'in-transit': { variant: 'info', label: 'In Transit' },
    completed: { variant: 'success', label: 'Completed' },
    cancelled: { variant: 'danger', label: 'Cancelled' },
  }
  const s = map[status] || { variant: 'default' as const, label: status }
  return <MacosBadge variant={s.variant}>{s.label}</MacosBadge>
}

// ─── Stock Level Progress Bar ─────────────────────────────────────
function StockLevelBar({ quantity, maxStockLevel, reorderLevel }: { quantity: number; maxStockLevel: number; reorderLevel: number }) {
  const max = maxStockLevel || reorderLevel * 3
  const pct = max > 0 ? Math.min(100, (quantity / max) * 100) : 0
  const item = { quantity, reorderLevel, maxStockLevel, isLowStock: quantity <= reorderLevel } as InventoryItem
  const level = getStockLevel(item)
  const colors = getStockLevelColors(level)

  return (
    <div className="flex items-center gap-2.5 min-w-[120px]">
      <div className="flex-1 h-1.5 rounded-full bg-secondary/80 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colors.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[13px] font-medium tabular-nums tracking-tight w-8 text-right">{quantity}</span>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────
export function InventoryModule() {
  const authUser = useAppStore((s) => s.authUser)
  const isViewOnly = authUser?.isViewOnly ?? false

  const [activeTab, setActiveTab] = React.useState('overview')
  const [items, setItems] = React.useState<InventoryItem[]>([])
  const [warehouses, setWarehouses] = React.useState<Warehouse[]>([])
  const [transfers, setTransfers] = React.useState<StockTransfer[]>([])
  const [branches, setBranches] = React.useState<Branch[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('')

  // Filters
  const [branchFilter, setBranchFilter] = React.useState('all')
  const [warehouseFilter, setWarehouseFilter] = React.useState('all')
  const [lowStockOnly, setLowStockOnly] = React.useState(false)

  // Dialogs
  const [adjustDialogOpen, setAdjustDialogOpen] = React.useState(false)
  const [transferDialogOpen, setTransferDialogOpen] = React.useState(false)
  const [adjustingItem, setAdjustingItem] = React.useState<InventoryItem | null>(null)
  const [saving, setSaving] = React.useState(false)

  // Adjust form
  const [adjustQty, setAdjustQty] = React.useState('')
  const [adjustOperation, setAdjustOperation] = React.useState('set')

  // Transfer form
  const [transferFrom, setTransferFrom] = React.useState('')
  const [transferTo, setTransferTo] = React.useState('')
  const [transferNotes, setTransferNotes] = React.useState('')

  // ─── Data Fetching ───────────────────────────────────────────
  const fetchItems = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('limit', '100')
      if (branchFilter && branchFilter !== 'all') params.set('branchId', branchFilter)
      if (warehouseFilter && warehouseFilter !== 'all') params.set('warehouseId', warehouseFilter)
      if (lowStockOnly) params.set('lowStock', 'true')

      const res = await fetch(`/api/inventory?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch inventory')
      const json = await res.json()
      setItems(json.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [branchFilter, warehouseFilter, lowStockOnly])

  const fetchWarehouses = React.useCallback(async () => {
    try {
      const res = await fetch('/api/warehouses')
      if (!res.ok) throw new Error('Failed to fetch warehouses')
      const json = await res.json()
      setWarehouses(json.data || [])
    } catch {
      // silent
    }
  }, [])

  const fetchBranches = React.useCallback(async () => {
    try {
      const res = await fetch('/api/branches')
      if (!res.ok) throw new Error('Failed to fetch branches')
      const json = await res.json()
      setBranches(json.data || [])
    } catch {
      // silent
    }
  }, [])

  const fetchTransfers = React.useCallback(async () => {
    try {
      const res = await fetch('/api/inventory?transfers=true&limit=50')
      if (!res.ok) throw new Error('Failed to fetch transfers')
      const json = await res.json()
      setTransfers(json.transfers || [])
    } catch {
      // silent
    }
  }, [])

  React.useEffect(() => {
    fetchItems()
  }, [fetchItems])

  React.useEffect(() => {
    fetchWarehouses()
    fetchBranches()
    fetchTransfers()
  }, [fetchWarehouses, fetchBranches, fetchTransfers])

  // ─── Handlers ────────────────────────────────────────────────
  const handleAdjust = (item: InventoryItem) => {
    if (isViewOnly) return
    setAdjustingItem(item)
    setAdjustQty('')
    setAdjustOperation('set')
    setAdjustDialogOpen(true)
  }

  const handleAdjustSave = async () => {
    if (!adjustingItem || !adjustQty) return
    setSaving(true)
    try {
      const res = await fetch('/api/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: adjustingItem.id,
          quantity: parseInt(adjustQty),
          operation: adjustOperation,
        }),
      })
      if (!res.ok) throw new Error('Failed to adjust stock')
      setAdjustDialogOpen(false)
      fetchItems()
      fetchWarehouses()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to adjust stock')
    } finally {
      setSaving(false)
    }
  }

  const handleTransferCreate = async () => {
    if (!transferFrom || !transferTo || transferFrom === transferTo) return
    setSaving(true)
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'transfer',
          fromBranchId: transferFrom,
          toBranchId: transferTo,
          notes: transferNotes,
        }),
      })
      if (!res.ok) throw new Error('Failed to create transfer')
      setTransferDialogOpen(false)
      setTransferFrom('')
      setTransferTo('')
      setTransferNotes('')
      fetchTransfers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transfer')
    } finally {
      setSaving(false)
    }
  }

  // ─── Computed Stats ──────────────────────────────────────────
  const totalItems = items.length
  const lowStockItems = items.filter((i) => i.isLowStock || i.quantity <= i.reorderLevel)
  const outOfStockItems = items.filter((i) => i.quantity === 0)
  const totalValue = items.reduce((s, i) => s + i.quantity * i.costPrice, 0)

  // Filter items by search
  const filteredItems = React.useMemo(() => {
    if (!searchQuery.trim()) return items
    const q = searchQuery.toLowerCase()
    return items.filter(
      (i) =>
        getProductName(i).toLowerCase().includes(q) ||
        i.warehouse?.name?.toLowerCase().includes(q) ||
        i.branch?.name?.toLowerCase().includes(q) ||
        i.book?.isbn?.toLowerCase().includes(q) ||
        i.stationery?.sku?.toLowerCase().includes(q)
    )
  }, [items, searchQuery])

  // ─── Tab Config ──────────────────────────────────────────────
  const tabs = [
    { id: 'overview', label: 'Stock Overview' },
    { id: 'low-stock', label: 'Low Stock' },
    { id: 'warehouses', label: 'Warehouses' },
    { id: 'transfers', label: 'Transfers' },
  ]

  // ─── Loading State ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-5">
        <MacosPageHeader
          title="Inventory"
          subtitle="Real-time stock tracking across warehouses and branches"
          icon={WarehouseIcon}
          iconColor="text-gg-bay"
          iconBg="bg-gg-bay/10"
        />
        <MacosStatGrid>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="macos-stat space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-xl" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-7 w-28" />
            </div>
          ))}
        </MacosStatGrid>
        <div className="macos-card macos-shadow-card p-5">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* ─── Page Header ────────────────────────────────────────── */}
      <MacosPageHeader
        title="Inventory"
        subtitle="Real-time stock tracking across warehouses and branches"
        icon={WarehouseIcon}
        iconColor="text-gg-bay"
        iconBg="bg-gg-bay/10"
      >
        {!isViewOnly && (
          <MacosButton
            variant="primary"
            icon={ArrowRightLeft}
            onClick={() => setTransferDialogOpen(true)}
            className="bg-gg-bridge hover:bg-gg-bridge/90 text-white"
          >
            New Transfer
          </MacosButton>
        )}
      </MacosPageHeader>

      {/* ─── Stat Cards ─────────────────────────────────────────── */}
      <MacosStatGrid>
        <MacosStatCard
          label="Total Items"
          value={totalItems}
          icon={Boxes}
          iconColor="text-macos-blue"
          iconBg="bg-macos-blue/10"
        />
        <MacosStatCard
          label="Low Stock"
          value={lowStockItems.length}
          icon={TrendingDown}
          iconColor="text-macos-orange"
          iconBg="bg-macos-orange/10"
        />
        <MacosStatCard
          label="Out of Stock"
          value={outOfStockItems.length}
          icon={AlertTriangle}
          iconColor="text-macos-red"
          iconBg="bg-macos-red/10"
        />
        <MacosStatCard
          label="Total Value"
          value={`$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={BarChart3}
          iconColor="text-gg-golden"
          iconBg="bg-gg-golden/10"
        />
      </MacosStatGrid>

      {/* ─── Error Alert ────────────────────────────────────────── */}
      {error && (
        <div className="macos-card macos-shadow-card flex items-center gap-2.5 p-3 bg-macos-red/5 border-macos-red/20">
          <div className="size-7 rounded-lg bg-macos-red/10 flex items-center justify-center shrink-0">
            <AlertCircle className="size-3.5 text-macos-red" />
          </div>
          <span className="text-[13px] font-medium text-macos-red flex-1">{error}</span>
          <MacosButton variant="ghost" onClick={() => setError(null)} className="text-macos-red hover:text-macos-red">
            Dismiss
          </MacosButton>
        </div>
      )}

      {/* ─── Filter Bar (Tabs + Search) ─────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <MacosFilterBar
          items={tabs}
          activeId={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === 'overview' && (
          <MacosSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search products, ISBN, SKU..."
            className="w-full sm:w-64"
          />
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          TAB: Stock Overview
          ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          {/* Filters Row */}
          <MacosCard noPadding>
            <div className="p-3">
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 flex-1">
                  <Building2 className="size-3.5 text-muted-foreground shrink-0" strokeWidth={1.8} />
                  <Select value={branchFilter} onValueChange={setBranchFilter}>
                    <SelectTrigger className="macos-search border-0 h-8 text-[13px] font-medium w-full focus-visible:ring-1 focus-visible:ring-macos-blue/30">
                      <SelectValue placeholder="All Branches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      {branches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <WarehouseIcon className="size-3.5 text-muted-foreground shrink-0" strokeWidth={1.8} />
                  <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                    <SelectTrigger className="macos-search border-0 h-8 text-[13px] font-medium w-full focus-visible:ring-1 focus-visible:ring-macos-blue/30">
                      <SelectValue placeholder="All Warehouses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Warehouses</SelectItem>
                      {warehouses.map((w) => (
                        <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <MacosButton
                  variant={lowStockOnly ? 'primary' : 'secondary'}
                  icon={AlertTriangle}
                  onClick={() => setLowStockOnly(!lowStockOnly)}
                  className={lowStockOnly ? 'bg-macos-orange/10 text-macos-orange hover:bg-macos-orange/20' : ''}
                >
                  Low Stock Only
                </MacosButton>
              </div>
            </div>
          </MacosCard>

          {/* Inventory Table */}
          <div className="macos-card macos-shadow-card overflow-hidden">
            {filteredItems.length === 0 ? (
              <MacosEmptyState
                icon={Package}
                title="No inventory items found"
                description={searchQuery ? 'Try a different search term' : 'Add products to start tracking inventory'}
              />
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/50 hover:bg-transparent">
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Product</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 hidden md:table-cell">Warehouse</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 hidden sm:table-cell">Branch</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Stock Level</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Status</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 hidden lg:table-cell text-right">Cost</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 hidden lg:table-cell text-right">Selling</TableHead>
                      {!isViewOnly && (
                        <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => {
                      const level = getStockLevel(item)
                      const colors = getStockLevelColors(level)
                      return (
                        <TableRow
                          key={item.id}
                          className={`macos-table-row border-b border-border/30 last:border-0 ${level === 'critical' ? 'bg-macos-red/[0.03]' : level === 'low' ? 'bg-macos-orange/[0.03]' : ''}`}
                        >
                          <TableCell className="text-[13px] font-medium tracking-tight py-3 max-w-[200px] truncate">
                            <div>
                              <span>{getProductName(item)}</span>
                              {item.book?.isbn && (
                                <p className="text-[10px] text-muted-foreground mt-0.5">ISBN: {item.book.isbn}</p>
                              )}
                              {item.stationery?.sku && (
                                <p className="text-[10px] text-muted-foreground mt-0.5">SKU: {item.stationery.sku}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-[13px] text-muted-foreground tracking-tight">
                            {item.warehouse?.name || '\u2014'}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-[13px] text-muted-foreground tracking-tight">
                            {item.branch?.name || '\u2014'}
                          </TableCell>
                          <TableCell>
                            <StockLevelBar
                              quantity={item.quantity}
                              maxStockLevel={item.maxStockLevel}
                              reorderLevel={item.reorderLevel}
                            />
                          </TableCell>
                          <TableCell>
                            <MacosBadge
                              variant={
                                level === 'healthy' ? 'success' :
                                level === 'moderate' ? 'default' :
                                level === 'low' ? 'warning' : 'danger'
                              }
                            >
                              <span className="flex items-center gap-1.5">
                                <span className={`inline-block size-1.5 rounded-full ${colors.bar}`} />
                                {colors.label}
                              </span>
                            </MacosBadge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-right text-[13px] text-muted-foreground tabular-nums tracking-tight">
                            ${item.costPrice.toFixed(2)}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-right text-[13px] font-medium tabular-nums tracking-tight">
                            ${item.sellingPrice.toFixed(2)}
                          </TableCell>
                          {!isViewOnly && (
                            <TableCell className="text-right">
                              <MacosButton
                                variant="ghost"
                                icon={Settings2}
                                onClick={() => handleAdjust(item)}
                                className="text-macos-blue hover:bg-macos-blue/5"
                              >
                                Adjust
                              </MacosButton>
                            </TableCell>
                          )}
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB: Low Stock Alerts
          ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'low-stock' && (
        <div className="macos-card macos-shadow-card overflow-hidden">
          {lowStockItems.length === 0 ? (
            <MacosEmptyState
              icon={Package}
              title="All items are well stocked!"
              description="No items below reorder level"
            />
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50 hover:bg-transparent">
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Product</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right">Stock Level</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right">Reorder At</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 hidden sm:table-cell">Warehouse</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Status</TableHead>
                    {!isViewOnly && (
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockItems.map((item) => {
                    const level = getStockLevel(item)
                    const colors = getStockLevelColors(level)
                    return (
                      <TableRow
                        key={item.id}
                        className={`macos-table-row border-b border-border/30 last:border-0 ${level === 'critical' ? 'bg-macos-red/[0.03]' : 'bg-macos-orange/[0.03]'}`}
                      >
                        <TableCell className="text-[13px] font-medium tracking-tight py-3">{getProductName(item)}</TableCell>
                        <TableCell className="text-right">
                          <StockLevelBar
                            quantity={item.quantity}
                            maxStockLevel={item.maxStockLevel}
                            reorderLevel={item.reorderLevel}
                          />
                        </TableCell>
                        <TableCell className="text-right text-[13px] text-muted-foreground tabular-nums tracking-tight">{item.reorderLevel}</TableCell>
                        <TableCell className="hidden sm:table-cell text-[13px] text-muted-foreground tracking-tight">{item.warehouse?.name || '\u2014'}</TableCell>
                        <TableCell>
                          <MacosBadge
                            variant={
                              level === 'healthy' ? 'success' :
                              level === 'moderate' ? 'default' :
                              level === 'low' ? 'warning' : 'danger'
                            }
                          >
                            <span className="flex items-center gap-1.5">
                              <span className={`inline-block size-1.5 rounded-full ${colors.bar}`} />
                              {colors.label}
                            </span>
                          </MacosBadge>
                        </TableCell>
                        {!isViewOnly && (
                          <TableCell className="text-right">
                            <MacosButton
                              variant="ghost"
                              icon={Settings2}
                              onClick={() => handleAdjust(item)}
                              className="text-macos-blue hover:bg-macos-blue/5"
                            >
                              Restock
                            </MacosButton>
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB: Warehouses
          ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'warehouses' && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {warehouses.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3">
              <MacosEmptyState
                icon={WarehouseIcon}
                title="No warehouses found"
                description="Add warehouses to manage stock locations"
              />
            </div>
          ) : (
            warehouses.map((wh) => {
              const inv = wh.inventory || []
              const whTotalItems = inv.length
              const totalQty = inv.reduce((s, i) => s + i.quantity, 0)
              const totalVal = inv.reduce((s, i) => s + i.quantity * i.costPrice, 0)
              return (
                <div key={wh.id} className="macos-card macos-shadow-card macos-card-hover p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-lg bg-gg-bay/10 flex items-center justify-center">
                        <WarehouseIcon className="size-3.5 text-gg-bay" strokeWidth={1.8} />
                      </div>
                      <div>
                        <h3 className="text-[13px] font-semibold tracking-tight">{wh.name}</h3>
                        {wh.branch && (
                          <p className="text-[10px] text-muted-foreground">{wh.branch.name}</p>
                        )}
                      </div>
                    </div>
                    <MacosBadge variant="info">{wh.code}</MacosBadge>
                  </div>
                  <div className="space-y-2.5 pt-3 border-t border-border/30">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-muted-foreground font-medium">Products</span>
                      <span className="font-semibold tabular-nums tracking-tight">{whTotalItems}</span>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-muted-foreground font-medium">Total Quantity</span>
                      <span className="font-semibold tabular-nums tracking-tight">{totalQty}</span>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-muted-foreground font-medium">Total Value</span>
                      <span className="font-semibold tabular-nums tracking-tight">${totalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB: Transfers
          ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'transfers' && (
        <div className="macos-card macos-shadow-card overflow-hidden">
          {/* Transfer Header */}
          <div className="macos-section-header p-4 border-b border-border/30">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-gg-sunset/10 flex items-center justify-center">
                <ArrowRightLeft className="size-3.5 text-gg-sunset" strokeWidth={1.8} />
              </div>
              <div>
                <h3 className="macos-section-title">
                  Stock Transfers
                  <span className="text-muted-foreground font-medium ml-1">({transfers.length})</span>
                </h3>
                <p className="macos-section-desc">Track stock movements between branches</p>
              </div>
            </div>
            {!isViewOnly && (
              <MacosButton
                variant="primary"
                icon={Plus}
                onClick={() => setTransferDialogOpen(true)}
                className="bg-gg-bridge hover:bg-gg-bridge/90 text-white"
              >
                New Transfer
              </MacosButton>
            )}
          </div>

          {transfers.length === 0 ? (
            <MacosEmptyState
              icon={ArrowRightLeft}
              title="No transfers recorded"
              description="Create a transfer to move stock between branches"
            />
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50 hover:bg-transparent">
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">From</TableHead>
                    <TableHead className="w-8" />
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">To</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Status</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 hidden sm:table-cell">Date</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 hidden md:table-cell">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((t) => (
                    <TableRow key={t.id} className="macos-table-row border-b border-border/30 last:border-0">
                      <TableCell className="text-[13px] font-medium tracking-tight py-3">{t.fromBranch.name}</TableCell>
                      <TableCell>
                        <ChevronRight className="size-3.5 text-muted-foreground" strokeWidth={1.8} />
                      </TableCell>
                      <TableCell className="text-[13px] font-medium tracking-tight">{t.toBranch.name}</TableCell>
                      <TableCell>{getTransferStatusBadge(t.status)}</TableCell>
                      <TableCell className="hidden sm:table-cell text-[13px] text-muted-foreground tracking-tight">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-[13px] text-muted-foreground max-w-[200px] truncate tracking-tight">
                        {t.notes || '\u2014'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          DIALOG: Adjust Stock
          ═══════════════════════════════════════════════════════════ */}
      <MacosDialog
        open={adjustDialogOpen}
        onOpenChange={setAdjustDialogOpen}
        title="Adjust Stock"
        description={adjustingItem ? `Adjusting stock for ${getProductName(adjustingItem)}` : ''}
        footer={
          <>
            <MacosButton variant="secondary" onClick={() => setAdjustDialogOpen(false)} disabled={saving}>
              Cancel
            </MacosButton>
            <MacosButton
              variant="primary"
              onClick={handleAdjustSave}
              disabled={saving || !adjustQty}
              icon={saving ? Loader2 : undefined}
              className="bg-macos-blue hover:bg-macos-blue/90 text-white"
            >
              {saving ? 'Applying...' : 'Apply Adjustment'}
            </MacosButton>
          </>
        }
      >
        {adjustingItem && (
          <div className="space-y-4">
            {/* Current Quantity Display */}
            <div className="flex items-center justify-between rounded-xl bg-secondary/50 p-3">
              <span className="text-[12px] font-medium text-muted-foreground">Current Quantity</span>
              <span className="text-[24px] font-bold tracking-tight tabular-nums">{adjustingItem.quantity}</span>
            </div>

            {/* Stock Level Bar */}
            <StockLevelBar
              quantity={adjustingItem.quantity}
              maxStockLevel={adjustingItem.maxStockLevel}
              reorderLevel={adjustingItem.reorderLevel}
            />

            {/* Operation Select */}
            <MacosFormField label="Operation">
              <Select value={adjustOperation} onValueChange={setAdjustOperation}>
                <SelectTrigger className="macos-search border-0 h-8 text-[13px] font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="set">Set to value</SelectItem>
                  <SelectItem value="add">Add to current</SelectItem>
                  <SelectItem value="subtract">Subtract from current</SelectItem>
                </SelectContent>
              </Select>
            </MacosFormField>

            {/* Quantity Input */}
            <MacosFormField label="Quantity">
              <Input
                id="adjust-qty"
                type="number"
                min="0"
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
                placeholder="Enter quantity"
                className="macos-search border-0 h-8 text-[13px] font-medium focus-visible:ring-1 focus-visible:ring-macos-blue/30"
              />
            </MacosFormField>

            {/* Preview */}
            {adjustQty && (
              <div className="rounded-xl bg-macos-blue/5 border border-macos-blue/10 p-3 text-[13px]">
                <span className="text-muted-foreground">New quantity will be: </span>
                <span className="font-bold text-macos-blue tabular-nums">
                  {adjustOperation === 'add'
                    ? adjustingItem.quantity + parseInt(adjustQty || '0')
                    : adjustOperation === 'subtract'
                    ? Math.max(0, adjustingItem.quantity - parseInt(adjustQty || '0'))
                    : parseInt(adjustQty || '0')}
                </span>
              </div>
            )}
          </div>
        )}
      </MacosDialog>

      {/* ═══════════════════════════════════════════════════════════
          DIALOG: Create Transfer
          ═══════════════════════════════════════════════════════════ */}
      <MacosDialog
        open={transferDialogOpen}
        onOpenChange={setTransferDialogOpen}
        title="Create Stock Transfer"
        description="Transfer stock between branches"
        footer={
          <>
            <MacosButton variant="secondary" onClick={() => setTransferDialogOpen(false)} disabled={saving}>
              Cancel
            </MacosButton>
            <MacosButton
              variant="primary"
              onClick={handleTransferCreate}
              disabled={saving || !transferFrom || !transferTo || transferFrom === transferTo}
              icon={saving ? Loader2 : undefined}
              className="bg-gg-bridge hover:bg-gg-bridge/90 text-white"
            >
              {saving ? 'Creating...' : 'Create Transfer'}
            </MacosButton>
          </>
        }
      >
        <div className="space-y-4">
          <MacosFormField label="From Branch">
            <Select value={transferFrom} onValueChange={setTransferFrom}>
              <SelectTrigger className="macos-search border-0 h-8 text-[13px] font-medium">
                <SelectValue placeholder="Select source branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </MacosFormField>

          <div className="flex justify-center">
            <div className="size-7 rounded-full bg-secondary flex items-center justify-center">
              <ChevronRight className="size-3.5 text-muted-foreground rotate-90" strokeWidth={1.8} />
            </div>
          </div>

          <MacosFormField label="To Branch">
            <Select value={transferTo} onValueChange={setTransferTo}>
              <SelectTrigger className="macos-search border-0 h-8 text-[13px] font-medium">
                <SelectValue placeholder="Select destination branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id} disabled={b.id === transferFrom}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </MacosFormField>

          <MacosFormField label="Notes">
            <Textarea
              id="transfer-notes"
              value={transferNotes}
              onChange={(e) => setTransferNotes(e.target.value)}
              placeholder="Optional notes about this transfer..."
              rows={3}
              className="macos-search border-0 text-[13px] font-medium focus-visible:ring-1 focus-visible:ring-macos-blue/30 resize-none"
            />
          </MacosFormField>
        </div>
      </MacosDialog>
    </div>
  )
}
