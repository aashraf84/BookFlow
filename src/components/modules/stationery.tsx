'use client'

import * as React from 'react'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Package,
  Loader2,
  AlertCircle,
  Filter,
  Tag,
  DollarSign,
  Archive,
  CheckCircle2,
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
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'

// ─── Types ────────────────────────────────────────────────────────
interface StationeryCategory {
  id: string
  name: string
  type?: string | null
}

interface StationeryProduct {
  id: string
  name: string
  sku: string | null
  categoryId: string | null
  category: StationeryCategory | null
  brand: string | null
  description: string | null
  price: number
  costPrice: number
  discount: number
  barcode: string | null
  unit: string
  minOrderQty: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  inventory?: Array<{ quantity: number; reorderLevel: number }>
}

interface ProductFormData {
  name: string
  sku: string
  categoryId: string
  brand: string
  description: string
  price: string
  costPrice: string
  discount: string
  barcode: string
  unit: string
  minOrderQty: string
}

const emptyForm: ProductFormData = {
  name: '',
  sku: '',
  categoryId: '',
  brand: '',
  description: '',
  price: '',
  costPrice: '',
  discount: '',
  barcode: '',
  unit: 'piece',
  minOrderQty: '1',
}

// ─── Stat Card Colors ─────────────────────────────────────────
const statColors = [
  { icon: Package, bg: 'bg-macos-blue/10', text: 'text-macos-blue', label: 'Total Products' },
  { icon: Archive, bg: 'bg-macos-green/10', text: 'text-macos-green', label: 'In Stock' },
  { icon: AlertCircle, bg: 'bg-macos-orange/10', text: 'text-macos-orange', label: 'Low Stock' },
  { icon: Tag, bg: 'bg-gg-sunset/10', text: 'text-gg-sunset', label: 'Categories' },
]

// ─── Component ────────────────────────────────────────────────────
export function StationeryModule() {
  const authUser = useAppStore((s) => s.authUser)
  const isViewOnly = authUser?.isViewOnly ?? false

  const [products, setProducts] = React.useState<StationeryProduct[]>([])
  const [categories, setCategories] = React.useState<StationeryCategory[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState('')
  const [categoryFilter, setCategoryFilter] = React.useState('all')
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingProduct, setEditingProduct] = React.useState<StationeryProduct | null>(null)
  const [form, setForm] = React.useState<ProductFormData>(emptyForm)
  const [saving, setSaving] = React.useState(false)
  const [deleting, setDeleting] = React.useState<string | null>(null)

  // Fetch products
  const fetchProducts = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (categoryFilter && categoryFilter !== 'all') params.set('category', categoryFilter)
      params.set('limit', '50')
      const res = await fetch(`/api/stationery?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch products')
      const json = await res.json()
      setProducts(json.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [search, categoryFilter])

  // Fetch categories
  const fetchCategories = React.useCallback(async () => {
    try {
      const res = await fetch('/api/stationery?categories=true&limit=100')
      if (!res.ok) throw new Error('Failed to fetch categories')
      const json = await res.json()
      setCategories(json.categories || [])
    } catch {
      // Silent fail for categories
    }
  }, [])

  React.useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  React.useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Stock status helper
  const getStockStatus = (product: StationeryProduct): { label: string; dotClass: string; textClass: string; badgeClass: string } => {
    const inv = product.inventory
    if (!inv || inv.length === 0) {
      return { label: 'No Stock', dotClass: 'bg-macos-red', textClass: 'text-macos-red', badgeClass: 'bg-macos-red/10 text-macos-red' }
    }
    const totalQty = inv.reduce((s, i) => s + i.quantity, 0)
    const reorder = inv[0]?.reorderLevel || 10
    if (totalQty === 0) return { label: 'Out of Stock', dotClass: 'bg-macos-red', textClass: 'text-macos-red', badgeClass: 'bg-macos-red/10 text-macos-red' }
    if (totalQty <= reorder) return { label: 'Low Stock', dotClass: 'bg-macos-orange', textClass: 'text-macos-orange', badgeClass: 'bg-macos-orange/10 text-macos-orange' }
    return { label: 'In Stock', dotClass: 'bg-macos-green', textClass: 'text-macos-green', badgeClass: 'bg-macos-green/10 text-macos-green' }
  }

  // Computed stats
  const inStockCount = products.filter((p) => {
    const inv = p.inventory
    if (!inv || inv.length === 0) return false
    const qty = inv.reduce((s, i) => s + i.quantity, 0)
    const reorder = inv[0]?.reorderLevel || 10
    return qty > reorder
  }).length

  const lowStockCount = products.filter((p) => {
    const inv = p.inventory
    if (!inv || inv.length === 0) return false
    const qty = inv.reduce((s, i) => s + i.quantity, 0)
    const reorder = inv[0]?.reorderLevel || 10
    return qty > 0 && qty <= reorder
  }).length

  const statValues = [products.length, inStockCount, lowStockCount, categories.length]

  // Open add dialog
  const handleAdd = () => {
    setEditingProduct(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  // Open edit dialog
  const handleEdit = (product: StationeryProduct) => {
    setEditingProduct(product)
    setForm({
      name: product.name,
      sku: product.sku || '',
      categoryId: product.categoryId || '',
      brand: product.brand || '',
      description: product.description || '',
      price: product.price.toString(),
      costPrice: product.costPrice.toString(),
      discount: product.discount.toString(),
      barcode: product.barcode || '',
      unit: product.unit,
      minOrderQty: product.minOrderQty.toString(),
    })
    setDialogOpen(true)
  }

  // Save product (create or update)
  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const payload = {
        ...(editingProduct ? { id: editingProduct.id } : {}),
        name: form.name.trim(),
        sku: form.sku.trim() || null,
        categoryId: form.categoryId || null,
        brand: form.brand.trim() || null,
        description: form.description.trim() || null,
        price: parseFloat(form.price) || 0,
        costPrice: parseFloat(form.costPrice) || 0,
        discount: parseFloat(form.discount) || 0,
        barcode: form.barcode.trim() || null,
        unit: form.unit || 'piece',
        minOrderQty: parseInt(form.minOrderQty) || 1,
      }

      const res = await fetch('/api/stationery', {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to save product')
      }

      setDialogOpen(false)
      fetchProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  // Delete product
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/stationery?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete product')
      fetchProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product')
    } finally {
      setDeleting(null)
    }
  }

  // Update form field
  const updateField = (field: keyof ProductFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // Category tabs for filter bar
  const categoryTabs = [
    { id: 'all', label: 'All' },
    ...categories.map((c) => ({ id: c.name, label: c.name })),
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="macos-page-header flex-col gap-3 sm:flex-row">
        <div>
          <h2 className="macos-page-title">Stationery</h2>
          <p className="macos-page-subtitle">{products.length} products in catalog</p>
        </div>
        {!isViewOnly && (
          <Button
            onClick={handleAdd}
            className="bg-primary text-primary-foreground rounded-lg font-medium text-[13px] h-8 shrink-0"
          >
            <Plus className="size-3.5 mr-1.5" strokeWidth={1.5} />
            Add Product
          </Button>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statColors.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="macos-card macos-shadow-card p-4 flex items-center gap-3">
              <div className={`size-9 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`size-4 ${stat.text}`} strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <p className="text-[22px] font-bold tracking-[-0.03em] leading-tight">{statValues[i]}</p>
                <p className="text-[11px] text-muted-foreground font-medium truncate">{stat.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Search + Filter Bar */}
      <div className="macos-card macos-shadow-card p-4 space-y-3">
        <div className="macos-search flex items-center px-3 h-9">
          <Search className="size-3.5 text-muted-foreground shrink-0" strokeWidth={1.5} />
          <input
            placeholder="Search by name, SKU, brand, or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-0 text-[13px] font-medium placeholder:text-muted-foreground/60 focus:outline-none ml-2"
          />
        </div>
        <div className="flex items-center gap-3">
          <Filter className="size-3.5 text-muted-foreground shrink-0" strokeWidth={1.5} />
          <div className="macos-filter-bar overflow-x-auto">
            {categoryTabs.slice(0, 7).map((tab) => (
              <button
                key={tab.id}
                className={`macos-filter-item whitespace-nowrap ${categoryFilter === tab.id ? 'macos-filter-item-active' : ''}`}
                onClick={() => setCategoryFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
            {categoryTabs.length > 7 && (
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-6 w-auto border-0 bg-transparent text-[12px] font-medium text-muted-foreground hover:text-foreground p-0 pl-2">
                  <SelectValue placeholder="More..." />
                </SelectTrigger>
                <SelectContent>
                  {categoryTabs.slice(7).map((tab) => (
                    <SelectItem key={tab.id} value={tab.id}>{tab.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2.5 macos-card macos-shadow-card p-4 bg-macos-red/5 border-macos-red/20">
          <div className="size-7 rounded-lg bg-macos-red/10 flex items-center justify-center shrink-0">
            <AlertCircle className="size-3.5 text-macos-red" />
          </div>
          <span className="text-[13px] font-medium text-macos-red flex-1">{error}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-[11px] text-macos-red hover:text-macos-red hover:bg-macos-red/10 rounded-lg"
            onClick={() => setError(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Products Table */}
      <div className="macos-card macos-shadow-card overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-xl shrink-0" />
                <Skeleton className="h-4 flex-1 rounded-lg" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="macos-empty py-16">
            <Package className="size-12 text-muted-foreground/25 mb-3" strokeWidth={1.5} />
            <p className="text-[13px] font-semibold text-muted-foreground">No stationery products found</p>
            <p className="text-[11px] text-muted-foreground mt-1">Add your first product to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/50 hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Product</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground hidden md:table-cell">SKU</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground hidden sm:table-cell">Category</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground hidden lg:table-cell">Brand</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Price</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground hidden sm:table-cell">Stock</TableHead>
                  {!isViewOnly && (
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const stock = getStockStatus(product)
                  return (
                    <TableRow key={product.id} className="macos-table-row border-b border-border/30">
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-xl bg-macos-teal/10 flex items-center justify-center shrink-0">
                            <Package className="size-4 text-macos-teal" strokeWidth={1.5} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium truncate max-w-[180px]">{product.name}</p>
                            {product.brand && (
                              <p className="text-[11px] text-muted-foreground truncate">{product.brand}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-[13px] font-mono">
                        {product.sku || '\u2014'}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {product.category ? (
                          <span className="rounded-md text-[10px] font-semibold tracking-wider px-2 py-0.5 bg-macos-purple/10 text-macos-purple uppercase">
                            {product.category.name}
                          </span>
                        ) : (
                          <span className="text-[13px] text-muted-foreground">{'\u2014'}</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-[13px] text-muted-foreground">
                        {product.brand || '\u2014'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-[13px] font-semibold tracking-[-0.01em]">
                            ${product.price.toFixed(2)}
                          </span>
                          {product.discount > 0 && (
                            <span className="text-[10px] font-semibold text-macos-green tracking-wide">
                              -{product.discount}%
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className={`rounded-md text-[10px] font-semibold tracking-wider px-2 py-0.5 uppercase ${stock.badgeClass}`}>
                          {stock.label}
                        </span>
                      </TableCell>
                      {!isViewOnly && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 rounded-lg hover:bg-secondary"
                              onClick={() => handleEdit(product)}
                              aria-label={`Edit ${product.name}`}
                            >
                              <Pencil className="size-3" strokeWidth={1.5} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 rounded-lg text-macos-red hover:bg-macos-red/10 hover:text-macos-red"
                              onClick={() => handleDelete(product.id)}
                              disabled={deleting === product.id}
                              aria-label={`Delete ${product.name}`}
                            >
                              {deleting === product.id ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : (
                                <Trash2 className="size-3" strokeWidth={1.5} />
                              )}
                            </Button>
                          </div>
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto macos-shadow-float rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[13px] font-semibold tracking-[-0.01em]">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
            <DialogDescription className="text-[11px] text-muted-foreground">
              {editingProduct ? 'Update stationery product details.' : 'Add a new stationery product to your catalog.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="name" className="text-[12px] font-medium text-muted-foreground">Product Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g., Premium Notebook A5"
                  className="rounded-lg border-border/50 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sku" className="text-[12px] font-medium text-muted-foreground">SKU</Label>
                <Input
                  id="sku"
                  value={form.sku}
                  onChange={(e) => updateField('sku', e.target.value)}
                  placeholder="e.g., STA-NB-001"
                  className="rounded-lg border-border/50 text-[13px] h-8 font-mono focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-[12px] font-medium text-muted-foreground">Category</Label>
                <Select value={form.categoryId} onValueChange={(v) => updateField('categoryId', v)}>
                  <SelectTrigger className="rounded-lg border-border/50 text-[13px] h-8">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="brand" className="text-[12px] font-medium text-muted-foreground">Brand</Label>
                <Input
                  id="brand"
                  value={form.brand}
                  onChange={(e) => updateField('brand', e.target.value)}
                  placeholder="e.g., Moleskine"
                  className="rounded-lg border-border/50 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="barcode" className="text-[12px] font-medium text-muted-foreground">Barcode</Label>
                <Input
                  id="barcode"
                  value={form.barcode}
                  onChange={(e) => updateField('barcode', e.target.value)}
                  placeholder="e.g., 8901234567890"
                  className="rounded-lg border-border/50 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="description" className="text-[12px] font-medium text-muted-foreground">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Product description..."
                  rows={3}
                  className="rounded-lg border-border/50 text-[13px] focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-[12px] font-medium text-muted-foreground">Selling Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => updateField('price', e.target.value)}
                  placeholder="0.00"
                  className="rounded-lg border-border/50 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="costPrice" className="text-[12px] font-medium text-muted-foreground">Cost Price ($)</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.costPrice}
                  onChange={(e) => updateField('costPrice', e.target.value)}
                  placeholder="0.00"
                  className="rounded-lg border-border/50 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="discount" className="text-[12px] font-medium text-muted-foreground">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={form.discount}
                  onChange={(e) => updateField('discount', e.target.value)}
                  placeholder="0"
                  className="rounded-lg border-border/50 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="unit" className="text-[12px] font-medium text-muted-foreground">Unit</Label>
                <Select value={form.unit} onValueChange={(v) => updateField('unit', v)}>
                  <SelectTrigger className="rounded-lg border-border/50 text-[13px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piece">Piece</SelectItem>
                    <SelectItem value="pack">Pack</SelectItem>
                    <SelectItem value="box">Box</SelectItem>
                    <SelectItem value="set">Set</SelectItem>
                    <SelectItem value="dozen">Dozen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="minOrderQty" className="text-[12px] font-medium text-muted-foreground">Min Order Qty</Label>
                <Input
                  id="minOrderQty"
                  type="number"
                  min="1"
                  value={form.minOrderQty}
                  onChange={(e) => updateField('minOrderQty', e.target.value)}
                  placeholder="1"
                  className="rounded-lg border-border/50 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="secondary"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
              className="rounded-lg text-[13px] font-medium h-8"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="bg-primary text-primary-foreground rounded-lg font-medium text-[13px] h-8"
            >
              {saving ? (
                <>
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : editingProduct ? (
                'Update Product'
              ) : (
                <>
                  <Plus className="size-3.5 mr-1.5" strokeWidth={1.5} />
                  Create Product
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
