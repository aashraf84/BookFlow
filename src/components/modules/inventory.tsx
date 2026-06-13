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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  const getStockBadge = (item: InventoryItem) => {
    if (item.quantity === 0) {
      return <Badge className="bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200 dark:border-red-800 text-xs"><span className="mr-1 inline-block size-1.5 rounded-full bg-red-500" />Out of Stock</Badge>
    }
    if (item.isLowStock || item.quantity <= item.reorderLevel) {
      return <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800 text-xs"><span className="mr-1 inline-block size-1.5 rounded-full bg-amber-500" />Low Stock</Badge>
    }
    return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-xs"><span className="mr-1 inline-block size-1.5 rounded-full bg-emerald-500" />In Stock</Badge>
  }

  // Transfer status badge
  const getTransferStatusBadge = (status: string) => {
    const map: Record<string, { className: string; label: string }> = {
      pending: { className: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800', label: 'Pending' },
      'in-transit': { className: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400 border-sky-200 dark:border-sky-800', label: 'In Transit' },
      completed: { className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', label: 'Completed' },
      cancelled: { className: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200 dark:border-red-800', label: 'Cancelled' },
    }
    const s = map[status] || { className: '', label: status }
    return <Badge className={`text-xs ${s.className}`}>{s.label}</Badge>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inventory Management</h2>
          <p className="text-muted-foreground text-sm">Real-time stock tracking across warehouses and branches</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setTransferDialogOpen(true)}>
            <ArrowRightLeft className="size-4 mr-1.5" />
            New Transfer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
              <div className="rounded-lg bg-emerald-100 dark:bg-emerald-950/30 p-2">
                <Package className="size-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold text-amber-600">{lowStockItems.length}</p>
              </div>
              <div className="rounded-lg bg-amber-100 dark:bg-amber-950/30 p-2">
                <TrendingDown className="size-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockItems.length}</p>
              </div>
              <div className="rounded-lg bg-red-100 dark:bg-red-950/30 p-2">
                <AlertTriangle className="size-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="rounded-lg bg-teal-100 dark:bg-teal-950/30 p-2">
                <WarehouseIcon className="size-5 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="size-4 shrink-0" />
          {error}
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setError(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Stock Overview</TabsTrigger>
          <TabsTrigger value="low-stock" className="text-xs sm:text-sm">Low Stock</TabsTrigger>
          <TabsTrigger value="warehouses" className="text-xs sm:text-sm">Warehouses</TabsTrigger>
          <TabsTrigger value="transfers" className="text-xs sm:text-sm">Transfers</TabsTrigger>
        </TabsList>

        {/* Stock Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex items-center gap-2 flex-1">
                  <Building2 className="size-4 text-muted-foreground shrink-0" />
                  <Select value={branchFilter} onValueChange={setBranchFilter}>
                    <SelectTrigger className="w-full">
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
                  <WarehouseIcon className="size-4 text-muted-foreground shrink-0" />
                  <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                    <SelectTrigger className="w-full">
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
                  variant={lowStockOnly ? 'default' : 'outline'}
                  size="sm"
                  className={lowStockOnly ? 'bg-amber-600 hover:bg-amber-700' : ''}
                  onClick={() => setLowStockOnly(!lowStockOnly)}
                >
                  <AlertTriangle className="size-4 mr-1.5" />
                  Low Stock Only
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Package className="size-12 text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground">No inventory items found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="hidden md:table-cell">Warehouse</TableHead>
                        <TableHead className="hidden sm:table-cell">Branch</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="hidden sm:table-cell text-right">Reorder Level</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden lg:table-cell text-right">Cost</TableHead>
                        <TableHead className="hidden lg:table-cell text-right">Selling</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id} className={item.quantity === 0 ? 'bg-red-50/50 dark:bg-red-950/10' : item.quantity <= item.reorderLevel ? 'bg-amber-50/50 dark:bg-amber-950/10' : ''}>
                          <TableCell className="font-medium max-w-[200px] truncate">
                            {getProductName(item)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                            {item.warehouse?.name || '—'}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                            {item.branch?.name || '—'}
                          </TableCell>
                          <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                          <TableCell className="hidden sm:table-cell text-right text-muted-foreground text-sm">{item.reorderLevel}</TableCell>
                          <TableCell>{getStockBadge(item)}</TableCell>
                          <TableCell className="hidden lg:table-cell text-right text-sm">${item.costPrice.toFixed(2)}</TableCell>
                          <TableCell className="hidden lg:table-cell text-right text-sm">${item.sellingPrice.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleAdjust(item)}>
                              <Settings2 className="size-3.5 mr-1" />
                              Adjust
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Low Stock Alerts Tab */}
        <TabsContent value="low-stock" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-600" />
                Low Stock Alerts ({lowStockItems.length})
              </CardTitle>
              <CardDescription>Items below or at reorder level that need attention</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {lowStockItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Package className="size-12 text-emerald-500/40 mb-3" />
                  <p className="text-emerald-600 font-medium">All items are well stocked!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Current Qty</TableHead>
                        <TableHead className="text-right">Reorder Level</TableHead>
                        <TableHead className="hidden sm:table-cell">Warehouse</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lowStockItems.map((item) => (
                        <TableRow key={item.id} className={item.quantity === 0 ? 'bg-red-50/50 dark:bg-red-950/10' : 'bg-amber-50/50 dark:bg-amber-950/10'}>
                          <TableCell className="font-medium">{getProductName(item)}</TableCell>
                          <TableCell className="text-right font-bold text-red-600">{item.quantity}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{item.reorderLevel}</TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{item.warehouse?.name || '—'}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleAdjust(item)}>
                              <Settings2 className="size-3.5 mr-1" />
                              Restock
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Warehouses Tab */}
        <TabsContent value="warehouses" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {warehouses.length === 0 ? (
              <Card className="sm:col-span-2 lg:col-span-3">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <WarehouseIcon className="size-12 text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground">No warehouses found</p>
                </CardContent>
              </Card>
            ) : (
              warehouses.map((wh) => {
                const inv = wh.inventory || []
                const totalItems = inv.length
                const totalQty = inv.reduce((s, i) => s + i.quantity, 0)
                const totalValue = inv.reduce((s, i) => s + i.quantity * i.costPrice, 0)
                return (
                  <Card key={wh.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{wh.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">{wh.code}</Badge>
                      </div>
                      {wh.branch && (
                        <CardDescription className="text-xs">{wh.branch.name}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Products</span>
                        <span className="font-medium">{totalItems}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Quantity</span>
                        <span className="font-medium">{totalQty}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Value</span>
                        <span className="font-medium">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </TabsContent>

        {/* Transfers Tab */}
        <TabsContent value="transfers" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ArrowRightLeft className="size-4" />
                    Stock Transfers ({transfers.length})
                  </CardTitle>
                  <CardDescription>Track stock movements between branches</CardDescription>
                </div>
                <Button size="sm" onClick={() => setTransferDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="size-4 mr-1" />
                  New Transfer
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {transfers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ArrowRightLeft className="size-12 text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground">No transfers recorded</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>From</TableHead>
                        <TableHead className="w-8" />
                        <TableHead>To</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden sm:table-cell">Date</TableHead>
                        <TableHead className="hidden md:table-cell">Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transfers.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium text-sm">{t.fromBranch.name}</TableCell>
                          <TableCell><ChevronRight className="size-4 text-muted-foreground" /></TableCell>
                          <TableCell className="font-medium text-sm">{t.toBranch.name}</TableCell>
                          <TableCell>{getTransferStatusBadge(t.status)}</TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                            {new Date(t.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground text-sm max-w-[200px] truncate">
                            {t.notes || '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Adjust Stock Dialog */}
      <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              {adjustingItem ? `Adjusting stock for ${getProductName(adjustingItem)}` : ''}
            </DialogDescription>
          </DialogHeader>
          {adjustingItem && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm text-muted-foreground">Current Quantity</span>
                <span className="text-lg font-bold">{adjustingItem.quantity}</span>
              </div>
              <div className="space-y-2">
                <Label>Operation</Label>
                <Select value={adjustOperation} onValueChange={setAdjustOperation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="set">Set to value</SelectItem>
                    <SelectItem value="add">Add to current</SelectItem>
                    <SelectItem value="subtract">Subtract from current</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adjust-qty">Quantity</Label>
                <Input
                  id="adjust-qty"
                  type="number"
                  min="0"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  placeholder="Enter quantity"
                />
              </div>
              {adjustQty && (
                <div className="rounded-lg bg-muted p-3 text-sm">
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleAdjustSave} disabled={saving || !adjustQty} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : null}
              Apply Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Transfer Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Stock Transfer</DialogTitle>
            <DialogDescription>Transfer stock between branches</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>From Branch</Label>
              <Select value={transferFrom} onValueChange={setTransferFrom}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>To Branch</Label>
              <Select value={transferTo} onValueChange={setTransferTo}>
                <SelectTrigger>
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
            <div className="space-y-2">
              <Label htmlFor="transfer-notes">Notes</Label>
              <Textarea
                id="transfer-notes"
                value={transferNotes}
                onChange={(e) => setTransferNotes(e.target.value)}
                placeholder="Optional notes about this transfer..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleTransferCreate} disabled={saving || !transferFrom || !transferTo || transferFrom === transferTo} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : null}
              Create Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
