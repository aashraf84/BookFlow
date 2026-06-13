'use client'

import * as React from 'react'
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  Filter,
  Tag,
  Archive,
  CheckCircle2,
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
      {/* ─── Page Header ──────────────────────────────────────────── */}
      <MacosPageHeader
        title="Stationery"
        subtitle={`${products.length} products in catalog`}
        icon={Package}
        iconColor="text-macos-teal"
        iconBg="bg-macos-teal/10"
      >
        {!isViewOnly && (
          <MacosButton variant="primary" icon={Plus} onClick={handleAdd}>
            Add Product
          </MacosButton>
        )}
      </MacosPageHeader>

      {/* ─── Stat Cards ───────────────────────────────────────────── */}
      <MacosStatGrid>
        <MacosStatCard
          label="Total Products"
          value={products.length}
          icon={Package}
          iconColor="text-macos-blue"
          iconBg="bg-macos-blue/10"
        />
        <MacosStatCard
          label="In Stock"
          value={inStockCount}
          icon={Archive}
          iconColor="text-macos-green"
          iconBg="bg-macos-green/10"
        />
        <MacosStatCard
          label="Low Stock"
          value={lowStockCount}
          icon={AlertCircle}
          iconColor="text-macos-orange"
          iconBg="bg-macos-orange/10"
        />
        <MacosStatCard
          label="Categories"
          value={categories.length}
          icon={Tag}
          iconColor="text-gg-sunset"
          iconBg="bg-gg-sunset/10"
        />
      </MacosStatGrid>

      {/* ─── Search + Filter Bar ──────────────────────────────────── */}
      <MacosCard noPadding>
        <div className="p-4 space-y-3">
          <MacosSearch
            value={search}
            onChange={setSearch}
            placeholder="Search by name, SKU, brand, or barcode..."
          />
          <div className="flex items-center gap-3">
            <Filter className="size-3.5 text-muted-foreground shrink-0" strokeWidth={1.8} />
            <MacosFilterBar
              items={categoryTabs.slice(0, 7).map((tab) => ({
                id: tab.id,
                label: tab.label,
              }))}
              activeId={categoryFilter}
              onChange={setCategoryFilter}
              className="overflow-x-auto"
            />
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
      </MacosCard>

      {/* ─── Error Alert ──────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2.5 macos-card macos-shadow-card p-4 bg-macos-red/5 border-macos-red/20">
          <div className="size-7 rounded-lg bg-macos-red/10 flex items-center justify-center shrink-0">
            <AlertCircle className="size-3.5 text-macos-red" />
          </div>
          <span className="text-[13px] font-medium text-macos-red flex-1">{error}</span>
          <MacosButton variant="ghost" onClick={() => setError(null)} className="text-macos-red hover:text-macos-red hover:bg-macos-red/10">
            Dismiss
          </MacosButton>
        </div>
      )}

      {/* ─── Products Table ───────────────────────────────────────── */}
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
          <MacosEmptyState
            icon={Package}
            title="No stationery products found"
            description="Add your first product to get started"
          />
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/50 hover:bg-transparent">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Product</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 hidden md:table-cell">SKU</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 hidden sm:table-cell">Category</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 hidden lg:table-cell">Brand</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right">Price</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 hidden sm:table-cell">Stock</TableHead>
                  {!isViewOnly && (
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const stock = getStockStatus(product)
                  return (
                    <TableRow key={product.id} className="macos-table-row border-b border-border/30 last:border-0">
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-xl bg-macos-teal/10 flex items-center justify-center shrink-0">
                            <Package className="size-4 text-macos-teal" strokeWidth={1.8} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium tracking-tight truncate max-w-[180px]">{product.name}</p>
                            {product.brand && (
                              <p className="text-[11px] text-muted-foreground truncate">{product.brand}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-[13px] font-mono tracking-tight">
                        {product.sku || '\u2014'}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {product.category ? (
                          <MacosBadge variant="purple">{product.category.name}</MacosBadge>
                        ) : (
                          <span className="text-[13px] text-muted-foreground">{'\u2014'}</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-[13px] text-muted-foreground tracking-tight">
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
                        <MacosBadge
                          variant={
                            stock.label === 'In Stock' ? 'success' :
                            stock.label === 'Low Stock' ? 'warning' : 'danger'
                          }
                        >
                          {stock.label}
                        </MacosBadge>
                      </TableCell>
                      {!isViewOnly && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-0.5">
                            <MacosButton
                              variant="ghost"
                              onClick={() => handleEdit(product)}
                              aria-label={`Edit ${product.name}`}
                              className="size-7 px-0"
                            >
                              <Pencil className="size-3" strokeWidth={1.8} />
                            </MacosButton>
                            <MacosButton
                              variant="danger"
                              onClick={() => handleDelete(product.id)}
                              disabled={deleting === product.id}
                              aria-label={`Delete ${product.name}`}
                              className="size-7 px-0"
                            >
                              {deleting === product.id ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : (
                                <Trash2 className="size-3" strokeWidth={1.8} />
                              )}
                            </MacosButton>
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

      {/* ─── Add/Edit Dialog ──────────────────────────────────────── */}
      <MacosDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        description={editingProduct ? 'Update stationery product details.' : 'Add a new stationery product to your catalog.'}
        footer={
          <>
            <MacosButton variant="secondary" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </MacosButton>
            <MacosButton variant="primary" onClick={handleSave} disabled={saving || !form.name.trim()} icon={saving ? Loader2 : (editingProduct ? CheckCircle2 : Plus)}>
              {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
            </MacosButton>
          </>
        }
      >
        <div className="grid gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MacosFormField label="Product Name *" className="sm:col-span-2">
              <Input
                id="name"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g., Premium Notebook A5"
                className="macos-search border-0 h-8 text-[13px] font-medium focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </MacosFormField>

            <MacosFormField label="SKU">
              <Input
                id="sku"
                value={form.sku}
                onChange={(e) => updateField('sku', e.target.value)}
                placeholder="e.g., STA-NB-001"
                className="macos-search border-0 h-8 text-[13px] font-mono font-medium focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </MacosFormField>

            <MacosFormField label="Category">
              <Select value={form.categoryId} onValueChange={(v) => updateField('categoryId', v)}>
                <SelectTrigger className="macos-search border-0 h-8 text-[13px] font-medium">
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
            </MacosFormField>

            <MacosFormField label="Brand">
              <Input
                id="brand"
                value={form.brand}
                onChange={(e) => updateField('brand', e.target.value)}
                placeholder="e.g., Moleskine"
                className="macos-search border-0 h-8 text-[13px] font-medium focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </MacosFormField>

            <MacosFormField label="Barcode">
              <Input
                id="barcode"
                value={form.barcode}
                onChange={(e) => updateField('barcode', e.target.value)}
                placeholder="e.g., 8901234567890"
                className="macos-search border-0 h-8 text-[13px] font-medium focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </MacosFormField>

            <MacosFormField label="Description" className="sm:col-span-2">
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Product description..."
                rows={3}
                className="macos-search border-0 text-[13px] font-medium focus-visible:ring-1 focus-visible:ring-primary/30 resize-none"
              />
            </MacosFormField>

            <MacosFormField label="Selling Price ($)">
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => updateField('price', e.target.value)}
                placeholder="0.00"
                className="macos-search border-0 h-8 text-[13px] font-medium focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </MacosFormField>

            <MacosFormField label="Cost Price ($)">
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                min="0"
                value={form.costPrice}
                onChange={(e) => updateField('costPrice', e.target.value)}
                placeholder="0.00"
                className="macos-search border-0 h-8 text-[13px] font-medium focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </MacosFormField>

            <MacosFormField label="Discount (%)">
              <Input
                id="discount"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={form.discount}
                onChange={(e) => updateField('discount', e.target.value)}
                placeholder="0"
                className="macos-search border-0 h-8 text-[13px] font-medium focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </MacosFormField>

            <MacosFormField label="Unit">
              <Select value={form.unit} onValueChange={(v) => updateField('unit', v)}>
                <SelectTrigger className="macos-search border-0 h-8 text-[13px] font-medium">
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
            </MacosFormField>

            <MacosFormField label="Min Order Qty">
              <Input
                id="minOrderQty"
                type="number"
                min="1"
                value={form.minOrderQty}
                onChange={(e) => updateField('minOrderQty', e.target.value)}
                placeholder="1"
                className="macos-search border-0 h-8 text-[13px] font-medium focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </MacosFormField>
          </div>
        </div>
      </MacosDialog>
    </div>
  )
}
