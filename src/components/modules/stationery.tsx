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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  const getStockStatus = (product: StationeryProduct): { label: string; color: string; variant: 'default' | 'secondary' | 'destructive' } => {
    const inv = product.inventory
    if (!inv || inv.length === 0) {
      return { label: 'No Stock', color: 'text-red-600', variant: 'destructive' }
    }
    const totalQty = inv.reduce((s, i) => s + i.quantity, 0)
    const reorder = inv[0]?.reorderLevel || 10
    if (totalQty === 0) return { label: 'Out of Stock', color: 'text-red-600', variant: 'destructive' }
    if (totalQty <= reorder) return { label: 'Low Stock', color: 'text-amber-600', variant: 'secondary' }
    return { label: 'Available', color: 'text-emerald-600', variant: 'default' }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Stationery Products</h2>
          <p className="text-muted-foreground text-sm">Manage your stationery catalog, pricing, and stock</p>
        </div>
        <Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700 shrink-0">
          <Plus className="size-4 mr-1.5" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, SKU, brand, or barcode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-muted-foreground shrink-0" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Products Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="size-4" />
            Products ({products.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="size-12 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No stationery products found</p>
              <p className="text-xs text-muted-foreground mt-1">Add your first product to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">SKU</TableHead>
                    <TableHead className="hidden sm:table-cell">Category</TableHead>
                    <TableHead className="hidden lg:table-cell">Brand</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="hidden sm:table-cell">Stock Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const stock = getStockStatus(product)
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {product.name}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {product.sku || '—'}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {product.category ? (
                            <Badge variant="outline" className="text-xs">
                              {product.category.name}
                            </Badge>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                          {product.brand || '—'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${product.price.toFixed(2)}
                          {product.discount > 0 && (
                            <span className="ml-1 text-xs text-emerald-600">-{product.discount}%</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant={stock.variant} className={`text-xs ${stock.color} ${stock.variant === 'default' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : stock.variant === 'secondary' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800' : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200 dark:border-red-800'}`}>
                            <span className={`mr-1 inline-block size-1.5 rounded-full ${stock.variant === 'default' ? 'bg-emerald-500' : stock.variant === 'secondary' ? 'bg-amber-500' : 'bg-red-500'}`} />
                            {stock.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => handleEdit(product)}
                              aria-label={`Edit ${product.name}`}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                              onClick={() => handleDelete(product.id)}
                              disabled={deleting === product.id}
                              aria-label={`Delete ${product.name}`}
                            >
                              {deleting === product.id ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="size-3.5" />
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
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update stationery product details.' : 'Add a new stationery product to your catalog.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g., Premium Notebook A5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={form.sku}
                  onChange={(e) => updateField('sku', e.target.value)}
                  placeholder="e.g., STA-NB-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={form.categoryId} onValueChange={(v) => updateField('categoryId', v)}>
                  <SelectTrigger>
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
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={form.brand}
                  onChange={(e) => updateField('brand', e.target.value)}
                  placeholder="e.g., Moleskine"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  value={form.barcode}
                  onChange={(e) => updateField('barcode', e.target.value)}
                  placeholder="e.g., 8901234567890"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Product description..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Selling Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => updateField('price', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="costPrice">Cost Price ($)</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.costPrice}
                  onChange={(e) => updateField('costPrice', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={form.discount}
                  onChange={(e) => updateField('discount', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select value={form.unit} onValueChange={(v) => updateField('unit', v)}>
                  <SelectTrigger>
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
              <div className="space-y-2">
                <Label htmlFor="minOrderQty">Min Order Qty</Label>
                <Input
                  id="minOrderQty"
                  type="number"
                  min="1"
                  value={form.minOrderQty}
                  onChange={(e) => updateField('minOrderQty', e.target.value)}
                  placeholder="1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !form.name.trim()} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? (
                <>
                  <Loader2 className="size-4 mr-1.5 animate-spin" />
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
