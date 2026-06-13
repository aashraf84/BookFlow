'use client'

import * as React from 'react'
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Building,
  Smartphone,
  Loader2,
  AlertCircle,
  X,
  Check,
  Receipt,
  UserCircle,
  Package,
  BookOpen,
  PencilRuler,
  GraduationCap,
  Tag,
  Eye,
  Sparkles,
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
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useAppStore } from '@/store/app-store'

// ─── Types ────────────────────────────────────────────────────────
type ProductType = 'book' | 'stationery'

interface POSProduct {
  id: string
  type: ProductType
  name: string
  sku: string | null
  isbn: string | null
  barcode: string | null
  price: number
  costPrice: number
  discount: number
  author?: string | null
  brand?: string | null
  category?: string | null
}

interface CartItem {
  product: POSProduct
  quantity: number
  unitPrice: number
  discount: number
  totalPrice: number
}

interface Customer {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  loyaltyPoints: number
}

interface CompletedSale {
  invoiceNumber: string
  total: number
  subtotal: number
  discount: number
  tax: number
  paymentMethod: string
  customerName: string | null
  items: Array<{ name: string; quantity: number; unitPrice: number; totalPrice: number }>
}

// ─── Component ────────────────────────────────────────────────────
export function RetailPOSModule() {
  const { authUser } = useAppStore()
  const isViewOnly = authUser?.isViewOnly ?? false

  // Products
  const [products, setProducts] = React.useState<POSProduct[]>([])
  const [searchTerm, setSearchTerm] = React.useState('')
  const [categoryFilter, setCategoryFilter] = React.useState<'all' | 'books' | 'stationery' | 'school'>('all')
  const [searchLoading, setSearchLoading] = React.useState(false)

  // Cart
  const [cart, setCart] = React.useState<CartItem[]>([])
  const [cartDiscount, setCartDiscount] = React.useState(0)
  const [discountType, setDiscountType] = React.useState<'percentage' | 'fixed'>('percentage')
  const [taxRate, setTaxRate] = React.useState(0)

  // Customer
  const [customerSearch, setCustomerSearch] = React.useState('')
  const [customers, setCustomers] = React.useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null)
  const [customerLookupOpen, setCustomerLookupOpen] = React.useState(false)

  // Payment
  const [paymentMethod, setPaymentMethod] = React.useState('cash')

  // Sale
  const [completing, setCompleting] = React.useState(false)
  const [completedSale, setCompletedSale] = React.useState<CompletedSale | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  // Search products
  React.useEffect(() => {
    const searchProducts = async () => {
      setSearchLoading(true)
      try {
        const params = new URLSearchParams()
        params.set('limit', '30')
        if (searchTerm) params.set('search', searchTerm)

        const [booksRes, stationeryRes] = await Promise.all([
          fetch(`/api/books?${params.toString()}`),
          fetch(`/api/stationery?${params.toString()}`),
        ])

        const bookData = booksRes.ok ? await booksRes.json() : { data: [] }
        const stationeryData = stationeryRes.ok ? await stationeryRes.json() : { data: [] }

        const bookProducts: POSProduct[] = (bookData.data || []).map((b: Record<string, unknown>) => ({
          id: b.id as string,
          type: 'book' as ProductType,
          name: b.title as string,
          sku: null,
          isbn: (b.isbn as string) || null,
          barcode: (b.barcode as string) || null,
          price: (b.price as number) || 0,
          costPrice: (b.costPrice as number) || 0,
          discount: (b.discount as number) || 0,
          author: (b.author as { name: string } | null)?.name || null,
          category: (b.category as { name: string } | null)?.name || null,
        }))

        const stationeryProducts: POSProduct[] = (stationeryData.data || []).map((s: Record<string, unknown>) => ({
          id: s.id as string,
          type: 'stationery' as ProductType,
          name: s.name as string,
          sku: (s.sku as string) || null,
          isbn: null,
          barcode: (s.barcode as string) || null,
          price: (s.price as number) || 0,
          costPrice: (s.costPrice as number) || 0,
          discount: (s.discount as number) || 0,
          brand: (s.brand as string) || null,
          category: (s.category as { name: string } | null)?.name || null,
        }))

        let all = [...bookProducts, ...stationeryProducts]

        // Apply category filter
        if (categoryFilter === 'books') {
          all = all.filter((p) => p.type === 'book')
        } else if (categoryFilter === 'stationery') {
          all = all.filter((p) => p.type === 'stationery')
        } else if (categoryFilter === 'school') {
          all = all.filter((p) => p.category?.toLowerCase().includes('school') || p.category?.toLowerCase().includes('educational'))
        }

        setProducts(all)
      } catch {
        // silent
      } finally {
        setSearchLoading(false)
      }
    }

    const debounce = setTimeout(searchProducts, 300)
    return () => clearTimeout(debounce)
  }, [searchTerm, categoryFilter])

  // Search customers
  React.useEffect(() => {
    if (!customerSearch) {
      setCustomers([])
      return
    }
    const searchCustomers = async () => {
      try {
        const res = await fetch(`/api/customers?search=${encodeURIComponent(customerSearch)}&type=retail&limit=10`)
        if (res.ok) {
          const json = await res.json()
          setCustomers(json.data || [])
        }
      } catch {
        // silent
      }
    }
    const debounce = setTimeout(searchCustomers, 300)
    return () => clearTimeout(debounce)
  }, [customerSearch])

  // Add to cart
  const addToCart = (product: POSProduct) => {
    if (isViewOnly) return
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id && item.product.type === product.type)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.product.type === product.type
            ? {
                ...item,
                quantity: item.quantity + 1,
                totalPrice: (item.quantity + 1) * item.unitPrice * (1 - item.discount / 100),
              }
            : item
        )
      }
      const unitPrice = product.price * (1 - product.discount / 100)
      return [
        ...prev,
        {
          product,
          quantity: 1,
          unitPrice: product.price,
          discount: product.discount,
          totalPrice: unitPrice,
        },
      ]
    })
  }

  // Update cart quantity
  const updateQuantity = (index: number, newQty: number) => {
    if (isViewOnly) return
    if (newQty < 1) {
      removeFromCart(index)
      return
    }
    setCart((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, quantity: newQty, totalPrice: newQty * item.unitPrice * (1 - item.discount / 100) }
          : item
      )
    )
  }

  // Remove from cart
  const removeFromCart = (index: number) => {
    if (isViewOnly) return
    setCart((prev) => prev.filter((_, i) => i !== index))
  }

  // Clear cart
  const clearCart = () => {
    if (isViewOnly) return
    setCart([])
    setCartDiscount(0)
    setSelectedCustomer(null)
    setCompletedSale(null)
  }

  // Compute totals
  const subtotal = cart.reduce((s, item) => s + item.totalPrice, 0)
  const discountAmount = discountType === 'percentage' ? subtotal * (cartDiscount / 100) : cartDiscount
  const afterDiscount = Math.max(0, subtotal - discountAmount)
  const taxAmount = afterDiscount * (taxRate / 100)
  const total = afterDiscount + taxAmount

  // Complete sale
  const handleCompleteSale = async () => {
    if (isViewOnly || cart.length === 0) return
    setCompleting(true)
    setError(null)
    try {
      const saleItems = cart.map((item) => ({
        bookId: item.product.type === 'book' ? item.product.id : undefined,
        stationeryId: item.product.type === 'stationery' ? item.product.id : undefined,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
      }))

      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer?.id || null,
          discount: discountAmount,
          tax: taxRate,
          paymentMethod,
          paymentStatus: 'paid',
          saleType: 'retail',
          items: saleItems,
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to complete sale')
      }

      const json = await res.json()
      const sale = json.data

      setCompletedSale({
        invoiceNumber: sale.invoiceNumber,
        total: sale.total,
        subtotal: sale.subtotal,
        discount: sale.discount,
        tax: sale.tax,
        paymentMethod: sale.paymentMethod,
        customerName: selectedCustomer?.name || null,
        items: cart.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
      })

      // Clear cart
      setCart([])
      setCartDiscount(0)
      setSelectedCustomer(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete sale')
    } finally {
      setCompleting(false)
    }
  }

  // Payment method icons
  const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: Banknote, color: 'macos-green' as const },
    { value: 'card', label: 'Card', icon: CreditCard, color: 'macos-blue' as const },
    { value: 'bank', label: 'Bank', icon: Building, color: 'macos-purple' as const },
    { value: 'wallet', label: 'Wallet', icon: Smartphone, color: 'macos-orange' as const },
  ]

  // Category filters
  const categoryFilters = [
    { value: 'all' as const, label: 'All', icon: Package },
    { value: 'books' as const, label: 'Books', icon: BookOpen },
    { value: 'stationery' as const, label: 'Stationery', icon: PencilRuler },
    { value: 'school' as const, label: 'School', icon: GraduationCap },
  ]

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ─── Page Header ─── */}
      <div className="macos-page-header flex-shrink-0">
        <div>
          <h1 className="macos-page-title flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-gg-bridge/10 flex items-center justify-center">
              <ShoppingCart className="size-4 text-gg-bridge" />
            </div>
            Point of Sale
          </h1>
          <p className="macos-page-subtitle">Process retail transactions — select products, add to cart, and complete sales</p>
        </div>
        {isViewOnly && (
          <div className="flex items-center gap-1.5 rounded-lg bg-macos-orange/10 px-3 py-1.5 text-macos-orange">
            <Eye className="size-3.5" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">View Only</span>
          </div>
        )}
      </div>

      {/* ─── Error Alert ─── */}
      {error && (
        <div className="macos-card macos-shadow-card flex items-center gap-2.5 p-3 mb-4 border-macos-red/20 bg-macos-red/5 flex-shrink-0">
          <div className="size-6 rounded-md bg-macos-red/10 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="size-3.5 text-macos-red" />
          </div>
          <span className="text-[13px] font-medium text-macos-red flex-1">{error}</span>
          <button
            className="size-6 rounded-md hover:bg-macos-red/10 flex items-center justify-center transition-colors"
            onClick={() => setError(null)}
          >
            <X className="size-3.5 text-macos-red" />
          </button>
        </div>
      )}

      {/* ─── Receipt Dialog ─── */}
      <Dialog open={!!completedSale} onOpenChange={(open) => !open && setCompletedSale(null)}>
        <DialogContent className="sm:max-w-[460px] rounded-xl macos-shadow-float border-0 bg-card p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-[13px] font-semibold tracking-tight flex items-center gap-2">
              <div className="size-6 rounded-md bg-macos-green/10 flex items-center justify-center">
                <Receipt className="size-3.5 text-macos-green" />
              </div>
              Sale Completed
            </DialogTitle>
            <DialogDescription className="text-[11px] text-muted-foreground">Transaction processed successfully</DialogDescription>
          </DialogHeader>
          {completedSale && (
            <div className="p-6 pt-4 space-y-4">
              <div className="text-center space-y-1.5 py-3">
                <div className="flex items-center justify-center gap-1.5">
                  <Sparkles className="size-3.5 text-gg-golden" />
                  <p className="text-[15px] font-bold tracking-tight">BookFlow OS</p>
                  <Sparkles className="size-3.5 text-gg-golden" />
                </div>
                <p className="text-[11px] text-muted-foreground font-medium">Invoice {completedSale.invoiceNumber}</p>
                <p className="text-[10px] text-muted-foreground">{new Date().toLocaleString()}</p>
              </div>

              <div className="rounded-lg bg-secondary/50 p-3 space-y-2">
                {completedSale.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-[13px] tracking-tight">
                    <span className="flex-1 truncate mr-3 font-medium">{item.name} <span className="text-muted-foreground">×{item.quantity}</span></span>
                    <span className="font-semibold tabular-nums">${item.totalPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <Separator className="opacity-50" />

              <div className="space-y-2 text-[13px] tracking-tight">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums">${completedSale.subtotal.toFixed(2)}</span>
                </div>
                {completedSale.discount > 0 && (
                  <div className="flex justify-between text-macos-green">
                    <span>Discount</span>
                    <span className="tabular-nums">-${completedSale.discount.toFixed(2)}</span>
                  </div>
                )}
                {completedSale.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="tabular-nums">${completedSale.tax.toFixed(2)}</span>
                  </div>
                )}
                <Separator className="opacity-50" />
                <div className="flex justify-between font-bold text-[15px] tracking-tight">
                  <span>Total</span>
                  <span className="tabular-nums">${completedSale.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                <span>Paid: {completedSale.paymentMethod}</span>
                {completedSale.customerName && <span>Customer: {completedSale.customerName}</span>}
              </div>
            </div>
          )}
          <DialogFooter className="p-6 pt-0">
            <Button
              onClick={() => setCompletedSale(null)}
              className="w-full bg-macos-green text-white rounded-lg font-semibold text-[13px] h-10 hover:bg-macos-green/90"
            >
              <Check className="size-4 mr-1.5" />
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Main POS Split Layout ─── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-0 overflow-hidden">
        {/* ─── Left: Products ─── */}
        <div className="lg:col-span-3 flex flex-col min-h-0 gap-4">
          {/* Search + Category Filter Bar */}
          <div className="macos-card macos-shadow-card p-4 flex-shrink-0">
            <div className="macos-search flex items-center gap-2 px-3 h-9">
              <Search className="size-3.5 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder="Search by name, ISBN, or barcode…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent text-[13px] font-medium placeholder:text-muted-foreground/60 outline-none"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="size-4 rounded-full bg-muted-foreground/20 flex items-center justify-center hover:bg-muted-foreground/30">
                  <X className="size-2.5 text-background" />
                </button>
              )}
            </div>

            <div className="macos-filter-bar mt-3">
              {categoryFilters.map((cat) => {
                const Icon = cat.icon
                const isActive = categoryFilter === cat.value
                return (
                  <button
                    key={cat.value}
                    className={`macos-filter-item inline-flex items-center gap-1.5 ${isActive ? 'macos-filter-item-active' : ''}`}
                    onClick={() => setCategoryFilter(cat.value)}
                  >
                    <Icon className="size-3" />
                    {cat.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1">
            {searchLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="macos-card macos-shadow-card p-4 animate-pulse">
                    <div className="h-3 bg-secondary rounded-md w-3/4 mb-3" />
                    <div className="h-2.5 bg-secondary rounded-md w-1/2 mb-3" />
                    <div className="h-4 bg-secondary rounded-md w-1/3" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="macos-card macos-shadow-card macos-empty py-20">
                <div className="size-14 rounded-2xl bg-gg-bay/10 flex items-center justify-center mb-4">
                  <Package className="size-7 text-gg-bay" />
                </div>
                <p className="text-[13px] font-semibold text-foreground">No products found</p>
                <p className="text-[11px] text-muted-foreground mt-1">Try a different search or category</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {products.map((product) => {
                  const inCart = cart.find((c) => c.product.id === product.id && c.product.type === product.type)
                  const typeColor = product.type === 'book' ? 'gg-bridge' : 'gg-sunset'
                  return (
                    <button
                      key={`${product.type}-${product.id}`}
                      className={`macos-card macos-shadow-card macos-card-hover p-4 text-left w-full cursor-pointer group ${inCart ? 'ring-1 ring-macos-green/30 bg-macos-green/[0.02]' : 'bg-card'} ${isViewOnly ? 'cursor-default' : ''}`}
                      onClick={() => addToCart(product)}
                      disabled={isViewOnly}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-1.5">
                          <p className="text-[13px] font-semibold leading-snug line-clamp-2 tracking-tight group-hover:text-macos-blue transition-colors">{product.name}</p>
                          <span className={`rounded-md text-[10px] font-semibold tracking-wide px-1.5 py-0.5 bg-${typeColor}/10 text-${typeColor} shrink-0 uppercase`}>
                            {product.type === 'book' ? 'Book' : 'Item'}
                          </span>
                        </div>
                        {product.author && (
                          <p className="text-[11px] text-muted-foreground truncate tracking-tight">by {product.author}</p>
                        )}
                        {product.brand && (
                          <p className="text-[11px] text-muted-foreground truncate tracking-tight">{product.brand}</p>
                        )}
                        {product.category && (
                          <span className="inline-block rounded-md text-[10px] font-semibold tracking-wide px-1.5 py-0.5 bg-secondary text-muted-foreground">
                            {product.category}
                          </span>
                        )}
                        <div className="flex items-center justify-between pt-1">
                          <div>
                            {product.discount > 0 ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-muted-foreground line-through tracking-tight">${product.price.toFixed(2)}</span>
                                <span className="text-[14px] font-bold text-macos-green tracking-tight">${(product.price * (1 - product.discount / 100)).toFixed(2)}</span>
                              </div>
                            ) : (
                              <span className="text-[14px] font-bold tracking-tight">${product.price.toFixed(2)}</span>
                            )}
                          </div>
                          {inCart ? (
                            <span className="rounded-md text-[10px] font-bold tracking-wide px-2 py-0.5 bg-macos-green/10 text-macos-green">
                              ×{inCart.quantity}
                            </span>
                          ) : !isViewOnly ? (
                            <div className="size-6 rounded-lg bg-macos-blue/10 flex items-center justify-center group-hover:bg-macos-blue/20 transition-colors">
                              <Plus className="size-3 text-macos-blue" />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ─── Right: Cart Panel ─── */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <div className="macos-card macos-shadow flex-1 flex flex-col min-h-0 sticky top-4 max-h-[calc(100vh-10rem)]">
            {/* Cart Header */}
            <div className="p-4 pb-3 flex items-center justify-between border-b border-border/40 flex-shrink-0">
              <h3 className="text-[13px] font-semibold tracking-tight flex items-center gap-2">
                <div className="size-5 rounded-md bg-gg-bridge/10 flex items-center justify-center">
                  <ShoppingCart className="size-3 text-gg-bridge" />
                </div>
                Cart
                {cart.length > 0 && (
                  <span className="rounded-md text-[10px] font-bold tracking-wide px-1.5 py-0.5 bg-gg-bridge/10 text-gg-bridge">
                    {cart.length}
                  </span>
                )}
              </h3>
              {cart.length > 0 && !isViewOnly && (
                <button
                  className="text-[11px] font-medium text-macos-red hover:text-macos-red/80 flex items-center gap-1 rounded-md px-2 py-1 hover:bg-macos-red/10 transition-colors"
                  onClick={clearCart}
                >
                  <Trash2 className="size-3" />
                  Clear
                </button>
              )}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-4">
              {/* Customer Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Customer</Label>
                  <button
                    className="text-[11px] font-medium text-macos-blue hover:text-macos-blue/80 flex items-center gap-1 rounded-md px-1.5 py-0.5 hover:bg-macos-blue/10 transition-colors"
                    onClick={() => setCustomerLookupOpen(true)}
                  >
                    <UserCircle className="size-3" />
                    {selectedCustomer ? 'Change' : 'Select'}
                  </button>
                </div>
                {selectedCustomer ? (
                  <div className="flex items-center justify-between rounded-lg bg-gg-bay/5 border border-gg-bay/10 p-2.5">
                    <div>
                      <p className="text-[13px] font-semibold tracking-tight">{selectedCustomer.name}</p>
                      <p className="text-[10px] text-muted-foreground tracking-tight font-medium">{selectedCustomer.loyaltyPoints} loyalty pts</p>
                    </div>
                    {!isViewOnly && (
                      <button
                        className="size-5 rounded-md hover:bg-macos-red/10 flex items-center justify-center transition-colors"
                        onClick={() => setSelectedCustomer(null)}
                      >
                        <X className="size-3 text-macos-red" />
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground tracking-tight font-medium">Walk-in customer</p>
                )}
              </div>

              <Separator className="opacity-40" />

              {/* Cart Items */}
              <div className="space-y-0">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="size-12 rounded-2xl bg-secondary/60 flex items-center justify-center mb-3">
                      <ShoppingCart className="size-5 text-muted-foreground/40" />
                    </div>
                    <p className="text-[13px] font-medium text-muted-foreground tracking-tight">Cart is empty</p>
                    <p className="text-[11px] text-muted-foreground/60 mt-1">Click products to add them</p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-52">
                    <div className="space-y-0.5 pr-1">
                      {cart.map((item, index) => (
                        <div key={`${item.product.type}-${item.product.id}`} className="flex items-center gap-2.5 rounded-lg p-2.5 hover:bg-secondary/30 transition-colors group/item">
                          {/* Type indicator */}
                          <div className={`size-2 rounded-full flex-shrink-0 ${item.product.type === 'book' ? 'bg-gg-bridge' : 'bg-gg-sunset'}`} />

                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium truncate tracking-tight">{item.product.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[11px] text-muted-foreground tracking-tight tabular-nums">${item.unitPrice.toFixed(2)}</span>
                              {item.discount > 0 && (
                                <span className="rounded-md text-[10px] font-semibold tracking-wide px-1.5 py-0 bg-macos-green/10 text-macos-green">
                                  -{item.discount}%
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quantity controls */}
                          <div className="flex items-center gap-0.5">
                            <button
                              className="size-6 rounded-md bg-secondary/60 flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-40"
                              onClick={() => updateQuantity(index, item.quantity - 1)}
                              disabled={isViewOnly}
                            >
                              <Minus className="size-2.5" />
                            </button>
                            <span className="w-7 text-center text-[13px] font-semibold tabular-nums tracking-tight">{item.quantity}</span>
                            <button
                              className="size-6 rounded-md bg-secondary/60 flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-40"
                              onClick={() => updateQuantity(index, item.quantity + 1)}
                              disabled={isViewOnly}
                            >
                              <Plus className="size-2.5" />
                            </button>
                          </div>

                          <div className="text-right min-w-[52px]">
                            <p className="text-[13px] font-semibold tabular-nums tracking-tight">${item.totalPrice.toFixed(2)}</p>
                            {!isViewOnly && (
                              <button
                                className="size-4 text-muted-foreground/50 hover:text-macos-red mt-0.5 inline-flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity"
                                onClick={() => removeFromCart(index)}
                              >
                                <X className="size-2.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>

              <Separator className="opacity-40" />

              {/* Discount */}
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1">
                  <Tag className="size-2.5" />
                  Cart Discount
                </Label>
                <div className="flex gap-2">
                  <Select value={discountType} onValueChange={(v: 'percentage' | 'fixed') => setDiscountType(v)} disabled={isViewOnly}>
                    <SelectTrigger className="rounded-lg bg-secondary/60 border-0 text-[13px] h-7 w-[100px] font-medium focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percent %</SelectItem>
                      <SelectItem value="fixed">Fixed $</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="0"
                    step={discountType === 'percentage' ? '1' : '0.01'}
                    value={cartDiscount || ''}
                    onChange={(e) => setCartDiscount(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    disabled={isViewOnly}
                    className="w-20 rounded-lg bg-secondary/60 border-0 text-[13px] h-7 font-medium focus-visible:ring-1 focus-visible:ring-macos-blue/30"
                  />
                </div>
              </div>

              {/* Tax */}
              <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Tax Rate (%)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={taxRate || ''}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  disabled={isViewOnly}
                  className="w-16 text-right rounded-lg bg-secondary/60 border-0 text-[13px] h-7 font-medium focus-visible:ring-1 focus-visible:ring-macos-blue/30"
                />
              </div>

              <Separator className="opacity-40" />

              {/* Totals */}
              <div className="space-y-2 text-[13px] tracking-tight">
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Subtotal</span>
                  <span className="tabular-nums font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-macos-green">
                    <span className="font-medium">Discount</span>
                    <span className="tabular-nums font-medium">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Tax ({taxRate}%)</span>
                    <span className="tabular-nums font-medium">${taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <Separator className="opacity-40" />
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-[15px] tracking-tight">Total</span>
                  <span className="font-bold text-[20px] tracking-tight tabular-nums">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-2.5">
                <Label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-4 gap-2">
                  {paymentMethods.map((pm) => {
                    const Icon = pm.icon
                    const isSelected = paymentMethod === pm.value
                    const colorMap: Record<string, string> = {
                      'macos-green': 'text-macos-green bg-macos-green/10 ring-macos-green/20',
                      'macos-blue': 'text-macos-blue bg-macos-blue/10 ring-macos-blue/20',
                      'macos-purple': 'text-macos-purple bg-macos-purple/10 ring-macos-purple/20',
                      'macos-orange': 'text-macos-orange bg-macos-orange/10 ring-macos-orange/20',
                    }
                    return (
                      <Label
                        key={pm.value}
                        className={`flex flex-col items-center gap-1.5 rounded-xl p-3 cursor-pointer transition-all ${isSelected ? `ring-1 ${colorMap[pm.color]}` : 'bg-secondary/40 hover:bg-secondary/60 ring-0'}`}
                      >
                        <RadioGroupItem value={pm.value} className="sr-only" />
                        <Icon className={`size-4 ${isSelected ? '' : 'text-muted-foreground'}`} />
                        <span className="text-[10px] font-semibold tracking-wide">{pm.label}</span>
                      </Label>
                    )
                  })}
                </RadioGroup>
              </div>

              {/* Complete Sale */}
              <Button
                className="w-full bg-gg-bridge hover:bg-gg-bridge/90 text-white rounded-lg font-semibold text-[13px] h-11 shadow-sm disabled:opacity-50"
                onClick={handleCompleteSale}
                disabled={cart.length === 0 || completing || isViewOnly}
              >
                {completing ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Processing…
                  </>
                ) : isViewOnly ? (
                  <>
                    <Eye className="size-4 mr-2" />
                    View Only — Checkout Disabled
                  </>
                ) : (
                  <>
                    <Check className="size-4 mr-2" />
                    Complete Sale — ${total.toFixed(2)}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Customer Lookup Dialog ─── */}
      <Dialog open={customerLookupOpen} onOpenChange={setCustomerLookupOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-xl macos-shadow-float border-0 bg-card p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-[13px] font-semibold tracking-tight">Select Customer</DialogTitle>
            <DialogDescription className="text-[11px] text-muted-foreground">Search for an existing customer</DialogDescription>
          </DialogHeader>
          <div className="p-6 pt-4 space-y-4">
            <div className="macos-search flex items-center gap-2 px-3 h-9">
              <Search className="size-3.5 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder="Search by name, email, or phone…"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="flex-1 bg-transparent text-[13px] font-medium placeholder:text-muted-foreground/60 outline-none"
              />
              {customerSearch && (
                <button onClick={() => setCustomerSearch('')} className="size-4 rounded-full bg-muted-foreground/20 flex items-center justify-center hover:bg-muted-foreground/30">
                  <X className="size-2.5 text-background" />
                </button>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-0.5">
              {customers.length === 0 && customerSearch ? (
                <div className="macos-empty py-10">
                  <p className="text-[13px] text-muted-foreground font-medium tracking-tight">No customers found</p>
                </div>
              ) : (
                customers.map((c) => (
                  <button
                    key={c.id}
                    className="w-full flex items-center justify-between rounded-lg p-3 hover:bg-secondary/50 transition-colors text-left group"
                    onClick={() => {
                      setSelectedCustomer(c)
                      setCustomerLookupOpen(false)
                      setCustomerSearch('')
                    }}
                  >
                    <div>
                      <p className="text-[13px] font-semibold tracking-tight">{c.name}</p>
                      <p className="text-[11px] text-muted-foreground tracking-tight">{c.email || c.phone || 'No contact info'}</p>
                    </div>
                    <span className="rounded-md text-[10px] font-bold tracking-wide px-2 py-0.5 bg-gg-golden/10 text-gg-golden">{c.loyaltyPoints} pts</span>
                  </button>
                ))
              )}
            </div>
          </div>
          <DialogFooter className="p-6 pt-0">
            <Button
              variant="ghost"
              className="bg-secondary text-secondary-foreground rounded-lg text-[13px] h-9 font-medium hover:bg-secondary/80"
              onClick={() => {
                setCustomerLookupOpen(false)
                setCustomerSearch('')
                setSelectedCustomer(null)
              }}
            >
              Walk-in Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
