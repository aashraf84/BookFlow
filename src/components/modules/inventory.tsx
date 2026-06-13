'use client'

import * as React from 'react'
import {
  Search,
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

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useAppStore } from '@/store/app-store'

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
  const map: Record<string, { className: string; label: string }> = {
    pending: { className: 'bg-macos-orange/10 text-macos-orange', label: 'Pending' },
    'in-transit': { className: 'bg-macos-blue/10 text-macos-blue', label: 'In Transit' },
    completed: { className: 'bg-macos-green/10 text-macos-green', label: 'Completed' },
    cancelled: { className: 'bg-macos-red/10 text-macos-red', label: 'Cancelled' },
  }
  const s = map[status] || { className: 'bg-secondary text-secondary-foreground', label: status }
  return (
    <span className={`rounded-md bg-opacity-100 text-[10px] font-semibold tracking-wide px-2 py-0.5 ${s.className}`}>
      {s.label}
    </span>
  )
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
        <div>
          <Skeleton className="h-7 w-56 mb-1" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="macos-stat space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-xl" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-7 w-28" />
            </div>
          ))}
        </div>
        <div className="macos-card macos-shadow-card p-5">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* ─── Page Header ────────────────────────────────────────── */}
      <div className="macos-page-header flex-col !items-start sm:!flex-row sm:!items-center">
        <div>
          <h1 className="macos-page-title">Inventory</h1>
          <p className="macos-page-subtitle">Real-time stock tracking across warehouses and branches</p>
        </div>
        {!isViewOnly && (
          <Button
            onClick={() => setTransferDialogOpen(true)}
            className="rounded-lg font-medium text-[13px] h-8 bg-gg-bridge hover:bg-gg-bridge/90 text-white"
          >
            <ArrowRightLeft className="size-3.5 mr-1.5" />
            New Transfer
          </Button>
        )}
      </div>

      {/* ─── Stat Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {/* Total Items */}
        <div className="macos-stat">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-9 rounded-xl bg-macos-blue/10 flex items-center justify-center">
              <Boxes className="size-4 text-macos-blue" strokeWidth={1.8} />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Total Items</span>
          </div>
          <p className="text-[24px] font-bold tracking-tight">{totalItems}</p>
        </div>

        {/* Low Stock */}
        <div className="macos-stat">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-9 rounded-xl bg-macos-orange/10 flex items-center justify-center">
              <TrendingDown className="size-4 text-macos-orange" strokeWidth={1.8} />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Low Stock</span>
          </div>
          <p className="text-[24px] font-bold tracking-tight text-macos-orange">{lowStockItems.length}</p>
        </div>

        {/* Out of Stock */}
        <div className="macos-stat">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-9 rounded-xl bg-macos-red/10 flex items-center justify-center">
              <AlertTriangle className="size-4 text-macos-red" strokeWidth={1.8} />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Out of Stock</span>
          </div>
          <p className="text-[24px] font-bold tracking-tight text-macos-red">{outOfStockItems.length}</p>
        </div>

        {/* Total Value */}
        <div className="macos-stat">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-9 rounded-xl bg-gg-golden/10 flex items-center justify-center">
              <BarChart3 className="size-4 text-gg-golden" strokeWidth={1.8} />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Total Value</span>
          </div>
          <p className="text-[24px] font-bold tracking-tight">
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* ─── Error Alert ────────────────────────────────────────── */}
      {error && (
        <div className="macos-card macos-shadow-card flex items-center gap-2.5 p-3 bg-macos-red/5 border-macos-red/20">
          <div className="size-7 rounded-lg bg-macos-red/10 flex items-center justify-center shrink-0">
            <AlertCircle className="size-3.5 text-macos-red" />
          </div>
          <span className="text-[13px] font-medium text-macos-red flex-1">{error}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[11px] text-macos-red hover:text-macos-red rounded-lg"
            onClick={() => setError(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* ─── Filter Bar (Tabs + Search) ─────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="macos-filter-bar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`macos-filter-item ${activeTab === tab.id ? 'macos-filter-item-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="macos-search flex items-center gap-2 px-3 h-8 w-full sm:w-64">
            <Search className="size-3.5 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search products, ISBN, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground/60"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-muted-foreground hover:text-foreground text-[11px]"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          TAB: Stock Overview
          ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          {/* Filters Row */}
          <div className="macos-card macos-shadow-card p-3">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 flex-1">
                <Building2 className="size-3.5 text-muted-foreground shrink-0" />
                <Select value={branchFilter} onValueChange={setBranchFilter}>
                  <SelectTrigger className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 w-full focus-visible:ring-1 focus-visible:ring-macos-blue/30">
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
                <WarehouseIcon className="size-3.5 text-muted-foreground shrink-0" />
                <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                  <SelectTrigger className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 w-full focus-visible:ring-1 focus-visible:ring-macos-blue/30">
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
              <button
                className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-[13px] font-medium transition-all ${
                  lowStockOnly
                    ? 'bg-macos-orange/10 text-macos-orange'
                    : 'bg-secondary/80 text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setLowStockOnly(!lowStockOnly)}
              >
                <AlertTriangle className="size-3.5" />
                Low Stock Only
              </button>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="macos-card macos-shadow-card overflow-hidden">
            {filteredItems.length === 0 ? (
              <div className="macos-empty py-16">
                <div className="size-14 rounded-2xl bg-macos-blue/5 flex items-center justify-center mb-3">
                  <Package className="size-6 text-macos-blue/40" strokeWidth={1.5} />
                </div>
                <p className="text-[13px] font-semibold text-foreground">No inventory items found</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {searchQuery ? 'Try a different search term' : 'Add products to start tracking inventory'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/50 hover:bg-transparent">
                      <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Product</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground hidden md:table-cell">Warehouse</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground hidden sm:table-cell">Branch</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Stock Level</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground hidden lg:table-cell text-right">Cost</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground hidden lg:table-cell text-right">Selling</TableHead>
                      {!isViewOnly && (
                        <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Actions</TableHead>
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
                          className={`macos-table-row border-b border-border/30 ${level === 'critical' ? 'bg-macos-red/[0.03]' : level === 'low' ? 'bg-macos-orange/[0.03]' : ''}`}
                        >
                          <TableCell className="text-[13px] font-medium max-w-[200px] truncate">
                            <div>
                              <span className="tracking-tight">{getProductName(item)}</span>
                              {item.book?.isbn && (
                                <p className="text-[10px] text-muted-foreground mt-0.5">ISBN: {item.book.isbn}</p>
                              )}
                              {item.stationery?.sku && (
                                <p className="text-[10px] text-muted-foreground mt-0.5">SKU: {item.stationery.sku}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-[13px] text-muted-foreground">
                            {item.warehouse?.name || '—'}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-[13px] text-muted-foreground">
                            {item.branch?.name || '—'}
                          </TableCell>
                          <TableCell>
                            <StockLevelBar
                              quantity={item.quantity}
                              maxStockLevel={item.maxStockLevel}
                              reorderLevel={item.reorderLevel}
                            />
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-semibold ${colors.bg} ${colors.text}`}>
                              <span className={`inline-block size-1.5 rounded-full ${colors.bar}`} />
                              {colors.label}
                            </span>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-right text-[13px] text-muted-foreground tabular-nums">
                            ${item.costPrice.toFixed(2)}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-right text-[13px] font-medium tabular-nums">
                            ${item.sellingPrice.toFixed(2)}
                          </TableCell>
                          {!isViewOnly && (
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAdjust(item)}
                                className="h-7 text-[13px] rounded-lg hover:bg-secondary"
                              >
                                <Settings2 className="size-3 mr-1" />
                                Adjust
                              </Button>
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
            <div className="macos-empty py-16">
              <div className="size-14 rounded-2xl bg-macos-green/5 flex items-center justify-center mb-3">
                <Package className="size-6 text-macos-green/40" strokeWidth={1.5} />
              </div>
              <p className="text-[13px] font-semibold text-macos-green">All items are well stocked!</p>
              <p className="text-[11px] text-muted-foreground mt-1">No items below reorder level</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50 hover:bg-transparent">
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Product</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Stock Level</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Reorder At</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground hidden sm:table-cell">Warehouse</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                    {!isViewOnly && (
                      <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Actions</TableHead>
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
                        className={`macos-table-row border-b border-border/30 ${level === 'critical' ? 'bg-macos-red/[0.03]' : 'bg-macos-orange/[0.03]'}`}
                      >
                        <TableCell className="text-[13px] font-medium">{getProductName(item)}</TableCell>
                        <TableCell className="text-right">
                          <StockLevelBar
                            quantity={item.quantity}
                            maxStockLevel={item.maxStockLevel}
                            reorderLevel={item.reorderLevel}
                          />
                        </TableCell>
                        <TableCell className="text-right text-[13px] text-muted-foreground tabular-nums">{item.reorderLevel}</TableCell>
                        <TableCell className="hidden sm:table-cell text-[13px] text-muted-foreground">{item.warehouse?.name || '—'}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-semibold ${colors.bg} ${colors.text}`}>
                            <span className={`inline-block size-1.5 rounded-full ${colors.bar}`} />
                            {colors.label}
                          </span>
                        </TableCell>
                        {!isViewOnly && (
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAdjust(item)}
                              className="h-7 text-[13px] rounded-lg hover:bg-macos-blue/5 text-macos-blue"
                            >
                              <Settings2 className="size-3 mr-1" />
                              Restock
                            </Button>
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
            <div className="sm:col-span-2 lg:col-span-3 macos-card macos-shadow-card macos-empty py-16">
              <div className="size-14 rounded-2xl bg-gg-bay/5 flex items-center justify-center mb-3">
                <WarehouseIcon className="size-6 text-gg-bay/40" strokeWidth={1.5} />
              </div>
              <p className="text-[13px] font-semibold text-foreground">No warehouses found</p>
              <p className="text-[11px] text-muted-foreground mt-1">Add warehouses to manage stock locations</p>
            </div>
          ) : (
            warehouses.map((wh) => {
              const inv = wh.inventory || []
              const whTotalItems = inv.length
              const totalQty = inv.reduce((s, i) => s + i.quantity, 0)
              const totalVal = inv.reduce((s, i) => s + i.quantity * i.costPrice, 0)
              return (
                <div key={wh.id} className="macos-card macos-shadow-card p-4 hover:macos-card-hover">
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
                    <span className="rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 bg-gg-bay/10 text-gg-bay">
                      {wh.code}
                    </span>
                  </div>
                  <div className="space-y-2.5 pt-3 border-t border-border/30">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-muted-foreground font-medium">Products</span>
                      <span className="font-semibold tabular-nums">{whTotalItems}</span>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-muted-foreground font-medium">Total Quantity</span>
                      <span className="font-semibold tabular-nums">{totalQty}</span>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-muted-foreground font-medium">Total Value</span>
                      <span className="font-semibold tabular-nums">${totalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
          <div className="p-4 flex items-center justify-between border-b border-border/30">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-gg-sunset/10 flex items-center justify-center">
                <ArrowRightLeft className="size-3.5 text-gg-sunset" strokeWidth={1.8} />
              </div>
              <div>
                <h3 className="text-[13px] font-semibold tracking-tight">
                  Stock Transfers
                  <span className="text-muted-foreground font-medium ml-1">({transfers.length})</span>
                </h3>
                <p className="text-[10px] text-muted-foreground">Track stock movements between branches</p>
              </div>
            </div>
            {!isViewOnly && (
              <Button
                size="sm"
                onClick={() => setTransferDialogOpen(true)}
                className="rounded-lg font-medium text-[13px] h-7 bg-gg-bridge hover:bg-gg-bridge/90 text-white"
              >
                <Plus className="size-3 mr-1" />
                New Transfer
              </Button>
            )}
          </div>

          {transfers.length === 0 ? (
            <div className="macos-empty py-16">
              <div className="size-14 rounded-2xl bg-gg-sunset/5 flex items-center justify-center mb-3">
                <ArrowRightLeft className="size-6 text-gg-sunset/40" strokeWidth={1.5} />
              </div>
              <p className="text-[13px] font-semibold text-foreground">No transfers recorded</p>
              <p className="text-[11px] text-muted-foreground mt-1">Create a transfer to move stock between branches</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50 hover:bg-transparent">
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">From</TableHead>
                    <TableHead className="w-8" />
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">To</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground hidden sm:table-cell">Date</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground hidden md:table-cell">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((t) => (
                    <TableRow key={t.id} className="macos-table-row border-b border-border/30">
                      <TableCell className="text-[13px] font-medium">{t.fromBranch.name}</TableCell>
                      <TableCell>
                        <ChevronRight className="size-3.5 text-muted-foreground" />
                      </TableCell>
                      <TableCell className="text-[13px] font-medium">{t.toBranch.name}</TableCell>
                      <TableCell>{getTransferStatusBadge(t.status)}</TableCell>
                      <TableCell className="hidden sm:table-cell text-[13px] text-muted-foreground">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-[13px] text-muted-foreground max-w-[200px] truncate">
                        {t.notes || '—'}
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
      <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl macos-shadow-float border-0.5">
          <DialogHeader>
            <DialogTitle className="text-[13px] font-semibold tracking-tight">Adjust Stock</DialogTitle>
            <DialogDescription className="text-[11px] text-muted-foreground">
              {adjustingItem ? `Adjusting stock for ${getProductName(adjustingItem)}` : ''}
            </DialogDescription>
          </DialogHeader>
          {adjustingItem && (
            <div className="space-y-4 py-2">
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
              <div className="space-y-1.5">
                <Label className="text-[12px] font-medium text-muted-foreground">Operation</Label>
                <Select value={adjustOperation} onValueChange={setAdjustOperation}>
                  <SelectTrigger className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="set">Set to value</SelectItem>
                    <SelectItem value="add">Add to current</SelectItem>
                    <SelectItem value="subtract">Subtract from current</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity Input */}
              <div className="space-y-1.5">
                <Label htmlFor="adjust-qty" className="text-[12px] font-medium text-muted-foreground">Quantity</Label>
                <Input
                  id="adjust-qty"
                  type="number"
                  min="0"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  placeholder="Enter quantity"
                  className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-macos-blue/30"
                />
              </div>

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
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setAdjustDialogOpen(false)}
              disabled={saving}
              className="bg-secondary text-secondary-foreground rounded-lg text-[13px] h-8"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdjustSave}
              disabled={saving || !adjustQty}
              className="rounded-lg font-medium text-[13px] h-8 bg-macos-blue hover:bg-macos-blue/90 text-white"
            >
              {saving ? <Loader2 className="size-3.5 mr-1.5 animate-spin" /> : null}
              Apply Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════
          DIALOG: Create Transfer
          ═══════════════════════════════════════════════════════════ */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl macos-shadow-float border-0.5">
          <DialogHeader>
            <DialogTitle className="text-[13px] font-semibold tracking-tight">Create Stock Transfer</DialogTitle>
            <DialogDescription className="text-[11px] text-muted-foreground">Transfer stock between branches</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-[12px] font-medium text-muted-foreground">From Branch</Label>
              <Select value={transferFrom} onValueChange={setTransferFrom}>
                <SelectTrigger className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8">
                  <SelectValue placeholder="Select source branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center">
              <div className="size-7 rounded-full bg-secondary flex items-center justify-center">
                <ChevronRight className="size-3.5 text-muted-foreground rotate-90" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px] font-medium text-muted-foreground">To Branch</Label>
              <Select value={transferTo} onValueChange={setTransferTo}>
                <SelectTrigger className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8">
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
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="transfer-notes" className="text-[12px] font-medium text-muted-foreground">Notes</Label>
              <Textarea
                id="transfer-notes"
                value={transferNotes}
                onChange={(e) => setTransferNotes(e.target.value)}
                placeholder="Optional notes about this transfer..."
                rows={3}
                className="rounded-lg bg-secondary/80 border-0 text-[13px] focus-visible:ring-1 focus-visible:ring-macos-blue/30 resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setTransferDialogOpen(false)}
              disabled={saving}
              className="bg-secondary text-secondary-foreground rounded-lg text-[13px] h-8"
            >
              Cancel
            </Button>
            <Button
              onClick={handleTransferCreate}
              disabled={saving || !transferFrom || !transferTo || transferFrom === transferTo}
              className="rounded-lg font-medium text-[13px] h-8 bg-gg-bridge hover:bg-gg-bridge/90 text-white"
            >
              {saving ? <Loader2 className="size-3.5 mr-1.5 animate-spin" /> : null}
              Create Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
