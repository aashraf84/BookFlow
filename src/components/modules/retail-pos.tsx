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
    { value: 'bank', label: 'Bank Transfer', icon: Building },
    { value: 'wallet', label: 'Digital Wallet', icon: Smartphone },
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
        <h2 className="text-2xl font-bold tracking-tight">Point of Sale</h2>
        <p className="text-muted-foreground text-sm">Process retail sales quickly and efficiently</p>
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

      {/* Receipt Dialog */}
      <Dialog open={!!completedSale} onOpenChange={(open) => !open && setCompletedSale(null)}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="size-5 text-emerald-600" />
              Sale Completed
            </DialogTitle>
            <DialogDescription>Your transaction has been processed successfully</DialogDescription>
          </DialogHeader>
          {completedSale && (
            <div className="space-y-4 py-4">
              <div className="text-center space-y-1">
                <p className="text-lg font-bold">BookFlow OS</p>
                <p className="text-xs text-muted-foreground">Invoice: {completedSale.invoiceNumber}</p>
                <p className="text-xs text-muted-foreground">{new Date().toLocaleString()}</p>
              </div>
              <Separator />
              <div className="space-y-2">
                {completedSale.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="flex-1 truncate mr-2">{item.name} x{item.quantity}</span>
                    <span className="font-medium">${item.totalPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${completedSale.subtotal.toFixed(2)}</span>
                </div>
                {completedSale.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
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
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${completedSale.total.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Payment: {completedSale.paymentMethod}</span>
                {completedSale.customerName && <span>Customer: {completedSale.customerName}</span>}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setCompletedSale(null)} className="bg-emerald-600 hover:bg-emerald-700">
              <Check className="size-4 mr-1.5" />
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
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ISBN, or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categoryFilters.map((cat) => {
                  const Icon = cat.icon
                  const isActive = categoryFilter === cat.value
                  return (
                    <Button
                      key={cat.value}
                      variant={isActive ? 'default' : 'outline'}
                      size="sm"
                      className={isActive ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                      onClick={() => setCategoryFilter(cat.value)}
                    >
                      <Icon className="size-3.5 mr-1.5" />
                      {cat.label}
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Product Grid */}
          {searchLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-3 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-5 bg-muted rounded w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="size-12 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground">No products found</p>
                <p className="text-xs text-muted-foreground mt-1">Try a different search or category</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {products.map((product) => {
                const inCart = cart.find((c) => c.product.id === product.id && c.product.type === product.type)
                return (
                  <Card
                    key={`${product.type}-${product.id}`}
                    className={`cursor-pointer transition-all hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 ${inCart ? 'ring-2 ring-emerald-500/50 border-emerald-300 dark:border-emerald-700' : ''}`}
                    onClick={() => addToCart(product)}
                  >
                    <CardContent className="p-3 space-y-1.5">
                      <div className="flex items-start justify-between gap-1">
                        <p className="font-medium text-sm leading-tight line-clamp-2">{product.name}</p>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {product.type === 'book' ? 'Book' : 'Item'}
                        </Badge>
                      </div>
                      {product.author && (
                        <p className="text-xs text-muted-foreground truncate">by {product.author}</p>
                      )}
                      {product.brand && (
                        <p className="text-xs text-muted-foreground truncate">{product.brand}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div>
                          {product.discount > 0 ? (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground line-through">${product.price.toFixed(2)}</span>
                              <span className="text-sm font-bold text-emerald-600">${(product.price * (1 - product.discount / 100)).toFixed(2)}</span>
                            </div>
                          ) : (
                            <span className="text-sm font-bold">${product.price.toFixed(2)}</span>
                          )}
                        </div>
                        {inCart ? (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-xs">
                            x{inCart.quantity}
                          </Badge>
                        ) : (
                          <Plus className="size-4 text-emerald-600" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Right: Cart */}
        <div className="lg:col-span-2">
          <Card className="sticky top-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShoppingCart className="size-4" />
                  Cart ({cart.length})
                </CardTitle>
                {cart.length > 0 && (
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={clearCart}>
                    <Trash2 className="size-3.5 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Customer</Label>
                  <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setCustomerLookupOpen(true)}>
                    <UserCircle className="size-3 mr-1" />
                    {selectedCustomer ? 'Change' : 'Select'}
                  </Button>
                </div>
                {selectedCustomer ? (
                  <div className="flex items-center justify-between rounded-lg border p-2">
                    <div>
                      <p className="text-sm font-medium">{selectedCustomer.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedCustomer.loyaltyPoints} pts</p>
                    </div>
                    <Button variant="ghost" size="icon" className="size-6" onClick={() => setSelectedCustomer(null)}>
                      <X className="size-3" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Walk-in customer</p>
                )}
              </div>

              <Separator />

              {/* Cart Items */}
              <ScrollArea className="max-h-64">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <ShoppingCart className="size-8 text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">Cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-2 pr-1">
                    {cart.map((item, index) => (
                      <div key={`${item.product.type}-${item.product.id}`} className="flex items-start gap-2 rounded-lg border p-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.product.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">${item.unitPrice.toFixed(2)}</span>
                            {item.discount > 0 && (
                              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] px-1 py-0">
                                -{item.discount}%
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-6"
                            onClick={() => updateQuantity(index, item.quantity - 1)}
                          >
                            <Minus className="size-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-6"
                            onClick={() => updateQuantity(index, item.quantity + 1)}
                          >
                            <Plus className="size-3" />
                          </Button>
                        </div>
                        <div className="text-right min-w-[60px]">
                          <p className="text-sm font-medium">${item.totalPrice.toFixed(2)}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-5 text-red-500 hover:text-red-600 mt-0.5"
                            onClick={() => removeFromCart(index)}
                          >
                            <X className="size-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              <Separator />

              {/* Discount */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Tag className="size-3" />
                  Cart Discount
                </Label>
                <div className="flex gap-2">
                  <Select value={discountType} onValueChange={(v: 'percentage' | 'fixed') => setDiscountType(v)}>
                    <SelectTrigger className="w-[110px]">
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
                    className="w-24"
                  />
                </div>
              </div>

              {/* Tax */}
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Tax Rate (%)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={taxRate || ''}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-20 text-right"
                />
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
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
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-2 gap-2">
                  {paymentMethods.map((pm) => {
                    const Icon = pm.icon
                    return (
                      <Label
                        key={pm.value}
                        className={`flex items-center gap-2 rounded-lg border p-2.5 cursor-pointer transition-colors ${paymentMethod === pm.value ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' : 'hover:bg-muted/50'}`}
                      >
                        <RadioGroupItem value={pm.value} className="sr-only" />
                        <Icon className="size-4" />
                        <span className="text-sm">{pm.label}</span>
                      </Label>
                    )
                  })}
                </RadioGroup>
              </div>

              {/* Complete Sale */}
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base font-semibold"
                onClick={handleCompleteSale}
                disabled={cart.length === 0 || completing}
              >
                {completing ? (
                  <>
                    <Loader2 className="size-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="size-5 mr-2" />
                    Complete Sale — ${total.toFixed(2)}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Customer Lookup Dialog */}
      <Dialog open={customerLookupOpen} onOpenChange={setCustomerLookupOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Customer</DialogTitle>
            <DialogDescription>Search for an existing customer</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {customers.length === 0 && customerSearch ? (
                <p className="text-sm text-muted-foreground text-center py-4">No customers found</p>
              ) : (
                customers.map((c) => (
                  <button
                    key={c.id}
                    className="w-full flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors text-left"
                    onClick={() => {
                      setSelectedCustomer(c)
                      setCustomerLookupOpen(false)
                      setCustomerSearch('')
                    }}
                  >
                    <div>
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.email || c.phone || 'No contact info'}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{c.loyaltyPoints} pts</Badge>
                  </button>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
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
