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
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

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
    setCart((prev) => prev.filter((_, i) => i !== index))
  }

  // Clear cart
  const clearCart = () => {
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
    if (cart.length === 0) return
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
    { value: 'cash', label: 'Cash', icon: Banknote },
    { value: 'card', label: 'Card', icon: CreditCard },
    { value: 'bank', label: 'Bank', icon: Building },
    { value: 'wallet', label: 'Wallet', icon: Smartphone },
  ]

  // Category filters
  const categoryFilters = [
    { value: 'all' as const, label: 'All', icon: Package },
    { value: 'books' as const, label: 'Books', icon: BookOpen },
    { value: 'stationery' as const, label: 'Stationery', icon: PencilRuler },
    { value: 'school' as const, label: 'School', icon: GraduationCap },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-[13px] font-semibold tracking-tight text-foreground">Point of Sale</h2>
        <p className="text-[11px] text-muted-foreground tracking-tight">Process retail sales quickly and efficiently</p>
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

      {/* Receipt Dialog */}
      <Dialog open={!!completedSale} onOpenChange={(open) => !open && setCompletedSale(null)}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl macos-shadow-elevated">
          <DialogHeader>
            <DialogTitle className="text-[13px] font-semibold tracking-tight flex items-center gap-2">
              <Receipt className="size-4 text-macos-green" />
              Sale Completed
            </DialogTitle>
            <DialogDescription className="text-[11px]">Your transaction has been processed successfully</DialogDescription>
          </DialogHeader>
          {completedSale && (
            <div className="space-y-4 py-4">
              <div className="text-center space-y-1">
                <p className="text-[13px] font-semibold tracking-tight">BookFlow OS</p>
                <p className="text-[11px] text-muted-foreground">Invoice: {completedSale.invoiceNumber}</p>
                <p className="text-[11px] text-muted-foreground">{new Date().toLocaleString()}</p>
              </div>
              <Separator />
              <div className="space-y-2">
                {completedSale.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-[13px] tracking-tight">
                    <span className="flex-1 truncate mr-2">{item.name} x{item.quantity}</span>
                    <span className="font-medium">${item.totalPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-1.5 text-[13px] tracking-tight">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${completedSale.subtotal.toFixed(2)}</span>
                </div>
                {completedSale.discount > 0 && (
                  <div className="flex justify-between text-macos-green">
                    <span>Discount</span>
                    <span>-${completedSale.discount.toFixed(2)}</span>
                  </div>
                )}
                {completedSale.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${completedSale.tax.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-base tracking-tight">
                  <span>Total</span>
                  <span>${completedSale.total.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Payment: {completedSale.paymentMethod}</span>
                {completedSale.customerName && <span>Customer: {completedSale.customerName}</span>}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setCompletedSale(null)} className="bg-primary text-primary-foreground rounded-lg font-medium text-[13px] h-8">
              <Check className="size-3.5 mr-1.5" />
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left: Products */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search + Category Filter */}
          <div className="rounded-2xl macos-shadow p-4 space-y-3 bg-background">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by name, ISBN, or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 pl-8 focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categoryFilters.map((cat) => {
                const Icon = cat.icon
                const isActive = categoryFilter === cat.value
                return (
                  <button
                    key={cat.value}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 text-[12px] font-medium rounded-md transition-all ${isActive ? 'macos-segmented-active' : 'text-muted-foreground hover:text-foreground bg-secondary/50'}`}
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
          {searchLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl macos-shadow p-3 bg-background animate-pulse">
                  <div className="h-3.5 bg-secondary rounded w-3/4 mb-2" />
                  <div className="h-3 bg-secondary rounded w-1/2 mb-2" />
                  <div className="h-4 bg-secondary rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl macos-shadow bg-background flex flex-col items-center justify-center py-16 text-center">
              <Package className="size-12 text-muted-foreground/30 mb-3" />
              <p className="text-[13px] text-muted-foreground">No products found</p>
              <p className="text-[11px] text-muted-foreground mt-1">Try a different search or category</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {products.map((product) => {
                const inCart = cart.find((c) => c.product.id === product.id && c.product.type === product.type)
                return (
                  <div
                    key={`${product.type}-${product.id}`}
                    className={`rounded-2xl macos-shadow p-3 bg-background cursor-pointer transition-all hover:shadow-lg ${inCart ? 'ring-1 ring-macos-green/40' : ''}`}
                    onClick={() => addToCart(product)}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-[13px] font-medium leading-tight line-clamp-2 tracking-tight">{product.name}</p>
                        <span className="rounded-md text-[10px] font-semibold tracking-wide px-1.5 py-0.5 bg-macos-purple/10 text-macos-purple shrink-0">
                          {product.type === 'book' ? 'Book' : 'Item'}
                        </span>
                      </div>
                      {product.author && (
                        <p className="text-[11px] text-muted-foreground truncate tracking-tight">by {product.author}</p>
                      )}
                      {product.brand && (
                        <p className="text-[11px] text-muted-foreground truncate tracking-tight">{product.brand}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div>
                          {product.discount > 0 ? (
                            <div className="flex items-center gap-1">
                              <span className="text-[11px] text-muted-foreground line-through tracking-tight">${product.price.toFixed(2)}</span>
                              <span className="text-[13px] font-bold text-macos-green tracking-tight">${(product.price * (1 - product.discount / 100)).toFixed(2)}</span>
                            </div>
                          ) : (
                            <span className="text-[13px] font-bold tracking-tight">${product.price.toFixed(2)}</span>
                          )}
                        </div>
                        {inCart ? (
                          <span className="rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 bg-macos-green/10 text-macos-green">
                            x{inCart.quantity}
                          </span>
                        ) : (
                          <Plus className="size-4 text-macos-green" />
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right: Cart */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl macos-shadow bg-background sticky top-4">
            {/* Cart Header */}
            <div className="p-4 pb-3 flex items-center justify-between border-b border-border/30">
              <h3 className="text-[13px] font-semibold tracking-tight flex items-center gap-2">
                <ShoppingCart className="size-3.5" />
                Cart ({cart.length})
              </h3>
              {cart.length > 0 && (
                <Button variant="ghost" size="sm" className="h-6 text-[11px] text-macos-red hover:text-macos-red hover:bg-macos-red/10 rounded-md" onClick={clearCart}>
                  <Trash2 className="size-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            <div className="p-4 space-y-4">
              {/* Customer Selection */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Customer</Label>
                  <Button variant="ghost" size="sm" className="h-5 text-[11px] rounded-md" onClick={() => setCustomerLookupOpen(true)}>
                    <UserCircle className="size-3 mr-1" />
                    {selectedCustomer ? 'Change' : 'Select'}
                  </Button>
                </div>
                {selectedCustomer ? (
                  <div className="flex items-center justify-between rounded-xl bg-secondary/50 p-2.5">
                    <div>
                      <p className="text-[13px] font-medium tracking-tight">{selectedCustomer.name}</p>
                      <p className="text-[11px] text-muted-foreground tracking-tight">{selectedCustomer.loyaltyPoints} pts</p>
                    </div>
                    <Button variant="ghost" size="icon" className="size-5 rounded-md" onClick={() => setSelectedCustomer(null)}>
                      <X className="size-3" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground tracking-tight">Walk-in customer</p>
                )}
              </div>

              <Separator />

              {/* Cart Items */}
              <ScrollArea className="max-h-64">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <ShoppingCart className="size-8 text-muted-foreground/30 mb-2" />
                    <p className="text-[13px] text-muted-foreground tracking-tight">Cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-2 pr-1">
                    {cart.map((item, index) => (
                      <div key={`${item.product.type}-${item.product.id}`} className="flex items-start gap-2 rounded-xl bg-secondary/30 p-2.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium truncate tracking-tight">{item.product.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-muted-foreground tracking-tight">${item.unitPrice.toFixed(2)}</span>
                            {item.discount > 0 && (
                              <span className="rounded-md text-[10px] font-semibold tracking-wide px-1.5 py-0 bg-macos-green/10 text-macos-green">
                                -{item.discount}%
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <button
                            className="size-6 rounded-md bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-colors"
                            onClick={() => updateQuantity(index, item.quantity - 1)}
                          >
                            <Minus className="size-2.5" />
                          </button>
                          <span className="w-7 text-center text-[13px] font-medium tracking-tight">{item.quantity}</span>
                          <button
                            className="size-6 rounded-md bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-colors"
                            onClick={() => updateQuantity(index, item.quantity + 1)}
                          >
                            <Plus className="size-2.5" />
                          </button>
                        </div>
                        <div className="text-right min-w-[50px]">
                          <p className="text-[13px] font-medium tracking-tight">${item.totalPrice.toFixed(2)}</p>
                          <button
                            className="size-4 text-macos-red hover:text-macos-red/80 mt-0.5 inline-flex items-center justify-center"
                            onClick={() => removeFromCart(index)}
                          >
                            <X className="size-2.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              <Separator />

              {/* Discount */}
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1">
                  <Tag className="size-2.5" />
                  Cart Discount
                </Label>
                <div className="flex gap-2">
                  <Select value={discountType} onValueChange={(v: 'percentage' | 'fixed') => setDiscountType(v)}>
                    <SelectTrigger className="rounded-lg bg-secondary/80 border-0 text-[13px] h-7 w-[100px]">
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
                    className="w-20 rounded-lg bg-secondary/80 border-0 text-[13px] h-7 focus-visible:ring-1 focus-visible:ring-primary/30"
                  />
                </div>
              </div>

              {/* Tax */}
              <div className="flex items-center justify-between">
                <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Tax Rate (%)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={taxRate || ''}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-16 text-right rounded-lg bg-secondary/80 border-0 text-[13px] h-7 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-1.5 text-[13px] tracking-tight">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-macos-green">
                    <span>Discount</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax ({taxRate}%)</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-base tracking-tight">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-2 gap-2">
                  {paymentMethods.map((pm) => {
                    const Icon = pm.icon
                    return (
                      <Label
                        key={pm.value}
                        className={`flex items-center gap-2 rounded-xl p-2.5 cursor-pointer transition-all ${paymentMethod === pm.value ? 'bg-primary/10 ring-1 ring-primary/30' : 'bg-secondary/50 hover:bg-secondary/80'}`}
                      >
                        <RadioGroupItem value={pm.value} className="sr-only" />
                        <Icon className="size-3.5" />
                        <span className="text-[12px] font-medium">{pm.label}</span>
                      </Label>
                    )
                  })}
                </RadioGroup>
              </div>

              {/* Complete Sale */}
              <Button
                className="w-full bg-primary text-primary-foreground rounded-lg font-medium text-[13px] h-11"
                onClick={handleCompleteSale}
                disabled={cart.length === 0 || completing}
              >
                {completing ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Processing...
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

      {/* Customer Lookup Dialog */}
      <Dialog open={customerLookupOpen} onOpenChange={setCustomerLookupOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl macos-shadow-elevated">
          <DialogHeader>
            <DialogTitle className="text-[13px] font-semibold tracking-tight">Select Customer</DialogTitle>
            <DialogDescription className="text-[11px]">Search for an existing customer</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 pl-8 focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {customers.length === 0 && customerSearch ? (
                <p className="text-[13px] text-muted-foreground text-center py-4 tracking-tight">No customers found</p>
              ) : (
                customers.map((c) => (
                  <button
                    key={c.id}
                    className="w-full flex items-center justify-between rounded-xl p-3 hover:bg-secondary/50 transition-colors text-left"
                    onClick={() => {
                      setSelectedCustomer(c)
                      setCustomerLookupOpen(false)
                      setCustomerSearch('')
                    }}
                  >
                    <div>
                      <p className="text-[13px] font-medium tracking-tight">{c.name}</p>
                      <p className="text-[11px] text-muted-foreground tracking-tight">{c.email || c.phone || 'No contact info'}</p>
                    </div>
                    <span className="rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 bg-macos-teal/10 text-macos-teal">{c.loyaltyPoints} pts</span>
                  </button>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              className="bg-secondary text-secondary-foreground rounded-lg text-[13px] h-8"
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
