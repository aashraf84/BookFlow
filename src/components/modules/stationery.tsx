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

// ─── Component ────────────────────────────────────────────────────
export function StationeryModule() {
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
  const getStockStatus = (product: StationeryProduct): { label: string; dotClass: string; textClass: string } => {
    const inv = product.inventory
    if (!inv || inv.length === 0) {
      return { label: 'No Stock', dotClass: 'bg-macos-red', textClass: 'text-macos-red' }
    }
    const totalQty = inv.reduce((s, i) => s + i.quantity, 0)
    const reorder = inv[0]?.reorderLevel || 10
    if (totalQty === 0) return { label: 'Out of Stock', dotClass: 'bg-macos-red', textClass: 'text-macos-red' }
    if (totalQty <= reorder) return { label: 'Low Stock', dotClass: 'bg-macos-orange', textClass: 'text-macos-orange' }
    return { label: 'In Stock', dotClass: 'bg-macos-green', textClass: 'text-macos-green' }
  }

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

  // Category tabs for segmented control
  const categoryTabs = [
    { id: 'all', label: 'All' },
    ...categories.map((c) => ({ id: c.name, label: c.name })),
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[13px] font-semibold tracking-tight text-foreground">Stationery Products</h2>
          <p className="text-[11px] text-muted-foreground tracking-tight">{products.length} products in catalog</p>
        </div>
        <Button onClick={handleAdd} className="bg-primary text-primary-foreground rounded-lg font-medium text-[13px] h-8 shrink-0">
          <Plus className="size-3.5 mr-1.5" />
          Add Product
        </Button>
      </div>

      {/* Search + Category Segmented Control */}
      <div className="rounded-2xl macos-shadow p-4 space-y-3 bg-background">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by name, SKU, brand, or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 pl-8 focus-visible:ring-1 focus-visible:ring-primary/30"
          />
        </div>
        <div className="flex items-center gap-3">
          <Filter className="size-3.5 text-muted-foreground shrink-0" />
          <div className="macos-segmented inline-flex p-0.5 overflow-x-auto">
            {categoryTabs.slice(0, 7).map((tab) => (
              <button
                key={tab.id}
                className={`px-3 py-1 text-[12px] font-medium rounded-md transition-all whitespace-nowrap ${categoryFilter === tab.id ? 'macos-segmented-active' : 'text-muted-foreground hover:text-foreground'}`}
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
        <div className="flex items-center gap-2 rounded-xl bg-macos-red/10 p-3 text-[13px] text-macos-red macos-shadow">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
          <Button variant="ghost" size="sm" className="ml-auto h-6 text-[11px] text-macos-red hover:text-macos-red" onClick={() => setError(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Products Table */}
      <div className="rounded-2xl macos-shadow bg-background overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="size-12 text-muted-foreground/30 mb-3" />
            <p className="text-[13px] text-muted-foreground">No stationery products found</p>
            <p className="text-[11px] text-muted-foreground mt-1">Add your first product to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/50 hover:bg-transparent">
                  <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Name</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground hidden md:table-cell">SKU</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground hidden sm:table-cell">Category</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground hidden lg:table-cell">Brand</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Price</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground hidden sm:table-cell">Stock</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const stock = getStockStatus(product)
                  return (
                    <TableRow key={product.id} className="hover:bg-secondary/50 border-b border-border/30">
                      <TableCell className="text-[13px] font-medium max-w-[200px] truncate tracking-tight">
                        {product.name}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-[13px] font-mono tracking-tight">
                        {product.sku || '—'}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {product.category ? (
                          <span className="rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 bg-macos-purple/10 text-macos-purple">
                            {product.category.name}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-[13px] tracking-tight">
                        {product.brand || '—'}
                      </TableCell>
                      <TableCell className="text-right text-[13px] font-medium tracking-tight">
                        ${product.price.toFixed(2)}
                        {product.discount > 0 && (
                          <span className="ml-1 text-[10px] text-macos-green">-{product.discount}%</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className={`inline-flex items-center gap-1.5 text-[13px] font-medium ${stock.textClass}`}>
                          <span className={`inline-block size-2 rounded-full ${stock.dotClass}`} />
                          {stock.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 rounded-md hover:bg-secondary"
                            onClick={() => handleEdit(product)}
                            aria-label={`Edit ${product.name}`}
                          >
                            <Pencil className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 rounded-md text-macos-red hover:bg-macos-red/10 hover:text-macos-red"
                            onClick={() => handleDelete(product.id)}
                            disabled={deleting === product.id}
                            aria-label={`Delete ${product.name}`}
                          >
                            {deleting === product.id ? (
                              <Loader2 className="size-3 animate-spin" />
                            ) : (
                              <Trash2 className="size-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-2xl macos-shadow-elevated">
          <DialogHeader>
            <DialogTitle className="text-[13px] font-semibold tracking-tight">{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription className="text-[11px]">
              {editingProduct ? 'Update stationery product details.' : 'Add a new stationery product to your catalog.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="name" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Product Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g., Premium Notebook A5"
                  className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sku" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">SKU</Label>
                <Input
                  id="sku"
                  value={form.sku}
                  onChange={(e) => updateField('sku', e.target.value)}
                  placeholder="e.g., STA-NB-001"
                  className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 font-mono focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Category</Label>
                <Select value={form.categoryId} onValueChange={(v) => updateField('categoryId', v)}>
                  <SelectTrigger className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8">
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
                <Label htmlFor="brand" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Brand</Label>
                <Input
                  id="brand"
                  value={form.brand}
                  onChange={(e) => updateField('brand', e.target.value)}
                  placeholder="e.g., Moleskine"
                  className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="barcode" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Barcode</Label>
                <Input
                  id="barcode"
                  value={form.barcode}
                  onChange={(e) => updateField('barcode', e.target.value)}
                  placeholder="e.g., 8901234567890"
                  className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="description" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Product description..."
                  rows={3}
                  className="rounded-lg bg-secondary/80 border-0 text-[13px] focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Selling Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => updateField('price', e.target.value)}
                  placeholder="0.00"
                  className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="costPrice" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Cost Price ($)</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.costPrice}
                  onChange={(e) => updateField('costPrice', e.target.value)}
                  placeholder="0.00"
                  className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="discount" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={form.discount}
                  onChange={(e) => updateField('discount', e.target.value)}
                  placeholder="0"
                  className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="unit" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Unit</Label>
                <Select value={form.unit} onValueChange={(v) => updateField('unit', v)}>
                  <SelectTrigger className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8">
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
                <Label htmlFor="minOrderQty" className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Min Order Qty</Label>
                <Input
                  id="minOrderQty"
                  type="number"
                  min="1"
                  value={form.minOrderQty}
                  onChange={(e) => updateField('minOrderQty', e.target.value)}
                  placeholder="1"
                  className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setDialogOpen(false)} disabled={saving} className="bg-secondary text-secondary-foreground rounded-lg text-[13px] h-8">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !form.name.trim()} className="bg-primary text-primary-foreground rounded-lg font-medium text-[13px] h-8">
              {saving ? (
                <>
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : editingProduct ? (
                'Update Product'
              ) : (
                'Create Product'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
