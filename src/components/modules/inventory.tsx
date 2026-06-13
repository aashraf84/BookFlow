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
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'

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

// ─── Component ────────────────────────────────────────────────────
export function InventoryModule() {
  const [activeTab, setActiveTab] = React.useState('overview')
  const [items, setItems] = React.useState<InventoryItem[]>([])
  const [warehouses, setWarehouses] = React.useState<Warehouse[]>([])
  const [transfers, setTransfers] = React.useState<StockTransfer[]>([])
  const [branches, setBranches] = React.useState<Branch[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

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

  // Fetch inventory items
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

  // Fetch warehouses
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

  // Fetch branches
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

  // Fetch transfers
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

  // Product name helper
  const getProductName = (item: InventoryItem): string => {
    if (item.book) return item.book.title
    if (item.stationery) return item.stationery.name
    return 'Unknown Product'
  }

  // Stock status
  const getStockStatus = (item: InventoryItem): { dotClass: string; textClass: string; label: string } => {
    if (item.quantity === 0) {
      return { dotClass: 'bg-macos-red', textClass: 'text-macos-red', label: 'Out of Stock' }
    }
    if (item.isLowStock || item.quantity <= item.reorderLevel) {
      return { dotClass: 'bg-macos-orange', textClass: 'text-macos-orange', label: 'Low Stock' }
    }
    return { dotClass: 'bg-macos-green', textClass: 'text-macos-green', label: 'In Stock' }
  }

  // Transfer status badge
  const getTransferStatusBadge = (status: string) => {
    const map: Record<string, { className: string; label: string }> = {
      pending: { className: 'bg-macos-orange/10 text-macos-orange', label: 'Pending' },
      'in-transit': { className: 'bg-macos-blue/10 text-macos-blue', label: 'In Transit' },
      completed: { className: 'bg-macos-green/10 text-macos-green', label: 'Completed' },
      cancelled: { className: 'bg-macos-red/10 text-macos-red', label: 'Cancelled' },
    }
    const s = map[status] || { className: 'bg-secondary text-secondary-foreground', label: status }
    return <span className={`rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 ${s.className}`}>{s.label}</span>
  }

  // Open adjust dialog
  const handleAdjust = (item: InventoryItem) => {
    setAdjustingItem(item)
    setAdjustQty('')
    setAdjustOperation('set')
    setAdjustDialogOpen(true)
  }

  // Save stock adjustment
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

  // Create transfer
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

  // Compute stats
  const totalItems = items.length
  const lowStockItems = items.filter((i) => i.isLowStock || i.quantity <= i.reorderLevel)
  const outOfStockItems = items.filter((i) => i.quantity === 0)
  const totalValue = items.reduce((s, i) => s + i.quantity * i.costPrice, 0)

  // Segmented tabs
  const tabs = [
    { id: 'overview', label: 'Stock Overview' },
    { id: 'low-stock', label: 'Low Stock' },
    { id: 'warehouses', label: 'Warehouses' },
    { id: 'transfers', label: 'Transfers' },
  ]

  // Quantity bar visualization
  const QuantityBar = ({ quantity, max }: { quantity: number; max: number }) => {
    const pct = max > 0 ? Math.min(100, (quantity / max) * 100) : 0
    const barColor = quantity === 0 ? 'bg-macos-red' : pct < 30 ? 'bg-macos-orange' : 'bg-macos-green'
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 rounded-full bg-secondary/80 overflow-hidden">
          <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-[13px] font-medium tracking-tight">{quantity}</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[13px] font-semibold tracking-tight text-foreground">Inventory Management</h2>
          <p className="text-[11px] text-muted-foreground tracking-tight">Real-time stock tracking across warehouses and branches</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setTransferDialogOpen(true)} className="bg-primary text-primary-foreground rounded-lg font-medium text-[13px] h-8">
            <ArrowRightLeft className="size-3.5 mr-1.5" />
            New Transfer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl macos-shadow p-4 bg-background">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Total Items</p>
          <p className="text-2xl font-bold tracking-tight">{totalItems}</p>
        </div>
        <div className="rounded-2xl macos-shadow p-4 bg-background">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Low Stock</p>
          <p className="text-2xl font-bold tracking-tight text-macos-orange">{lowStockItems.length}</p>
        </div>
        <div className="rounded-2xl macos-shadow p-4 bg-background">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Out of Stock</p>
          <p className="text-2xl font-bold tracking-tight text-macos-red">{outOfStockItems.length}</p>
        </div>
        <div className="rounded-2xl macos-shadow p-4 bg-background">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Total Value</p>
          <p className="text-2xl font-bold tracking-tight">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-macos-red/10 p-3 text-[13px] text-macos-red macos-shadow">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
          <Button variant="ghost" size="sm" className="ml-auto h-6 text-[11px] text-macos-red hover:text-macos-red" onClick={() => setError(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Segmented Tabs */}
      <div className="macos-segmented inline-flex p-0.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-3 py-1 text-[12px] font-medium rounded-md transition-all ${activeTab === tab.id ? 'macos-segmented-active' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stock Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="rounded-2xl macos-shadow p-4 bg-background">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex items-center gap-2 flex-1">
                <Building2 className="size-3.5 text-muted-foreground shrink-0" />
                <Select value={branchFilter} onValueChange={setBranchFilter}>
                  <SelectTrigger className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 w-full focus-visible:ring-1 focus-visible:ring-primary/30">
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
                  <SelectTrigger className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 w-full focus-visible:ring-1 focus-visible:ring-primary/30">
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
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-lg text-[13px] h-8 ${lowStockOnly ? 'bg-macos-orange/10 text-macos-orange hover:bg-macos-orange/20' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                onClick={() => setLowStockOnly(!lowStockOnly)}
              >
                <AlertTriangle className="size-3.5 mr-1.5" />
                Low Stock Only
              </Button>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="rounded-2xl macos-shadow bg-background overflow-hidden">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Package className="size-12 text-muted-foreground/30 mb-3" />
                <p className="text-[13px] text-muted-foreground">No inventory items found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/50 hover:bg-transparent">
                      <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Product</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground hidden md:table-cell">Warehouse</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground hidden sm:table-cell">Branch</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Quantity</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground hidden sm:table-cell text-right">Reorder</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground hidden lg:table-cell text-right">Cost</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground hidden lg:table-cell text-right">Selling</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => {
                      const status = getStockStatus(item)
                      return (
                        <TableRow key={item.id} className={`hover:bg-secondary/50 border-b border-border/30 ${item.quantity === 0 ? 'bg-macos-red/5' : item.quantity <= item.reorderLevel ? 'bg-macos-orange/5' : ''}`}>
                          <TableCell className="text-[13px] font-medium max-w-[200px] truncate tracking-tight">
                            {getProductName(item)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground text-[13px] tracking-tight">
                            {item.warehouse?.name || '—'}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground text-[13px] tracking-tight">
                            {item.branch?.name || '—'}
                          </TableCell>
                          <TableCell>
                            <QuantityBar quantity={item.quantity} max={item.maxStockLevel || item.reorderLevel * 3} />
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-right text-muted-foreground text-[13px] tracking-tight">{item.reorderLevel}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1.5 text-[13px] font-medium ${status.textClass}`}>
                              <span className={`inline-block size-2 rounded-full ${status.dotClass}`} />
                              {status.label}
                            </span>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-right text-[13px] tracking-tight">${item.costPrice.toFixed(2)}</TableCell>
                          <TableCell className="hidden lg:table-cell text-right text-[13px] tracking-tight">${item.sellingPrice.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleAdjust(item)} className="h-7 text-[13px] rounded-md hover:bg-secondary">
                              <Settings2 className="size-3 mr-1" />
                              Adjust
                            </Button>
                          </TableCell>
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

      {/* Low Stock Alerts Tab */}
      {activeTab === 'low-stock' && (
        <div className="rounded-2xl macos-shadow bg-background overflow-hidden">
          {lowStockItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="size-12 text-macos-green/30 mb-3" />
              <p className="text-[13px] text-macos-green font-medium">All items are well stocked!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50 hover:bg-transparent">
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Product</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Current Qty</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Reorder Level</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground hidden sm:table-cell">Warehouse</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockItems.map((item) => (
                    <TableRow key={item.id} className={`hover:bg-secondary/50 border-b border-border/30 ${item.quantity === 0 ? 'bg-macos-red/5' : 'bg-macos-orange/5'}`}>
                      <TableCell className="text-[13px] font-medium tracking-tight">{getProductName(item)}</TableCell>
                      <TableCell className="text-right text-[13px] font-bold text-macos-red tracking-tight">{item.quantity}</TableCell>
                      <TableCell className="text-right text-muted-foreground text-[13px] tracking-tight">{item.reorderLevel}</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground text-[13px] tracking-tight">{item.warehouse?.name || '—'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleAdjust(item)} className="h-7 text-[13px] rounded-md hover:bg-secondary">
                          <Settings2 className="size-3 mr-1" />
                          Restock
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* Warehouses Tab */}
      {activeTab === 'warehouses' && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {warehouses.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3 rounded-2xl macos-shadow bg-background flex flex-col items-center justify-center py-16 text-center">
              <WarehouseIcon className="size-12 text-muted-foreground/30 mb-3" />
              <p className="text-[13px] text-muted-foreground">No warehouses found</p>
            </div>
          ) : (
            warehouses.map((wh) => {
              const inv = wh.inventory || []
              const totalItems = inv.length
              const totalQty = inv.reduce((s, i) => s + i.quantity, 0)
              const totalValue = inv.reduce((s, i) => s + i.quantity * i.costPrice, 0)
              return (
                <div key={wh.id} className="rounded-2xl macos-shadow p-4 bg-background">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[13px] font-semibold tracking-tight">{wh.name}</h3>
                    <span className="rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 bg-macos-teal/10 text-macos-teal">{wh.code}</span>
                  </div>
                  {wh.branch && (
                    <p className="text-[11px] text-muted-foreground mb-3 tracking-tight">{wh.branch.name}</p>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[13px] tracking-tight">
                      <span className="text-muted-foreground">Products</span>
                      <span className="font-medium">{totalItems}</span>
                    </div>
                    <div className="flex items-center justify-between text-[13px] tracking-tight">
                      <span className="text-muted-foreground">Total Quantity</span>
                      <span className="font-medium">{totalQty}</span>
                    </div>
                    <div className="flex items-center justify-between text-[13px] tracking-tight">
                      <span className="text-muted-foreground">Total Value</span>
                      <span className="font-medium">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Transfers Tab */}
      {activeTab === 'transfers' && (
        <div className="rounded-2xl macos-shadow bg-background overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-border/30">
            <div>
              <h3 className="text-[13px] font-semibold tracking-tight flex items-center gap-2">
                <ArrowRightLeft className="size-3.5" />
                Stock Transfers ({transfers.length})
              </h3>
              <p className="text-[11px] text-muted-foreground tracking-tight">Track stock movements between branches</p>
            </div>
            <Button size="sm" onClick={() => setTransferDialogOpen(true)} className="bg-primary text-primary-foreground rounded-lg font-medium text-[13px] h-7">
              <Plus className="size-3 mr-1" />
              New Transfer
            </Button>
          </div>
          {transfers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ArrowRightLeft className="size-12 text-muted-foreground/30 mb-3" />
              <p className="text-[13px] text-muted-foreground">No transfers recorded</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50 hover:bg-transparent">
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">From</TableHead>
                    <TableHead className="w-8" />
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">To</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground hidden sm:table-cell">Date</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground hidden md:table-cell">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((t) => (
                    <TableRow key={t.id} className="hover:bg-secondary/50 border-b border-border/30">
                      <TableCell className="text-[13px] font-medium tracking-tight">{t.fromBranch.name}</TableCell>
                      <TableCell><ChevronRight className="size-3.5 text-muted-foreground" /></TableCell>
                      <TableCell className="text-[13px] font-medium tracking-tight">{t.toBranch.name}</TableCell>
                      <TableCell>{getTransferStatusBadge(t.status)}</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground text-[13px] tracking-tight">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-[13px] max-w-[200px] truncate tracking-tight">
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

      {/* Adjust Stock Dialog */}
      <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl macos-shadow-elevated">
          <DialogHeader>
            <DialogTitle className="text-[13px] font-semibold tracking-tight">Adjust Stock</DialogTitle>
            <DialogDescription className="text-[11px]">
              {adjustingItem ? `Adjusting stock for ${getProductName(adjustingItem)}` : ''}
            </DialogDescription>
          </DialogHeader>
          {adjustingItem && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between rounded-xl bg-secondary/50 p-3">
                <span className="text-[13px] text-muted-foreground tracking-tight">Current Quantity</span>
                <span className="text-lg font-bold tracking-tight">{adjustingItem.quantity}</span>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Operation</Label>
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
              <div className="space-y-1.5">
                <Label htmlFor="adjust-qty" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Quantity</Label>
                <Input
                  id="adjust-qty"
                  type="number"
                  min="0"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  placeholder="Enter quantity"
                  className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
              {adjustQty && (
                <div className="rounded-xl bg-secondary/50 p-3 text-[13px] tracking-tight">
                  <span className="text-muted-foreground">New quantity will be: </span>
                  <span className="font-bold">
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
            <Button variant="ghost" onClick={() => setAdjustDialogOpen(false)} disabled={saving} className="bg-secondary text-secondary-foreground rounded-lg text-[13px] h-8">
              Cancel
            </Button>
            <Button onClick={handleAdjustSave} disabled={saving || !adjustQty} className="bg-primary text-primary-foreground rounded-lg font-medium text-[13px] h-8">
              {saving ? <Loader2 className="size-3.5 mr-1.5 animate-spin" /> : null}
              Apply Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Transfer Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl macos-shadow-elevated">
          <DialogHeader>
            <DialogTitle className="text-[13px] font-semibold tracking-tight">Create Stock Transfer</DialogTitle>
            <DialogDescription className="text-[11px]">Transfer stock between branches</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">From Branch</Label>
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
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">To Branch</Label>
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
              <Label htmlFor="transfer-notes" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Notes</Label>
              <Textarea
                id="transfer-notes"
                value={transferNotes}
                onChange={(e) => setTransferNotes(e.target.value)}
                placeholder="Optional notes about this transfer..."
                rows={3}
                className="rounded-lg bg-secondary/80 border-0 text-[13px] focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setTransferDialogOpen(false)} disabled={saving} className="bg-secondary text-secondary-foreground rounded-lg text-[13px] h-8">
              Cancel
            </Button>
            <Button onClick={handleTransferCreate} disabled={saving || !transferFrom || !transferTo || transferFrom === transferTo} className="bg-primary text-primary-foreground rounded-lg font-medium text-[13px] h-8">
              {saving ? <Loader2 className="size-3.5 mr-1.5 animate-spin" /> : null}
              Create Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
