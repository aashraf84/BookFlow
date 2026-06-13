'use client'

import * as React from 'react'
import {
  Search,
  Plus,
  Truck,
  Package,
  Users,
  BarChart3,
  Loader2,
  AlertCircle,
  Eye,
  CheckCircle2,
  Ship,
  PackageCheck,
  DollarSign,
  TrendingUp,
  UserPlus,
  X,
  ShoppingCart,
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
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'

// ─── Types ────────────────────────────────────────────────────────
interface Dealer {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
  type: string
  loyaltyPoints: number
  totalSpent: number
  creditLimit: number
  outstanding: number
  isActive: boolean
  _count?: { sales: number; wholesaleOrders: number }
}

interface OrderItem {
  id: string
  bookId: string | null
  stationeryId: string | null
  quantity: number
  unitPrice: number
  discount: number
  totalPrice: number
  book?: { id: string; title: string; price: number } | null
  stationery?: { id: string; name: string; price: number } | null
}

interface WholesaleOrder {
  id: string
  orderNumber: string
  customerId: string | null
  dealerName: string | null
  distributorName: string | null
  status: string
  subtotal: number
  discount: number
  tax: number
  total: number
  paymentStatus: string
  deliveryAddress: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  customer?: { id: string; name: string; type: string } | null
  items: OrderItem[]
}

interface OrderFormItem {
  productType: 'book' | 'stationery'
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discount: number
}

// ─── Component ────────────────────────────────────────────────────
export function WholesaleModule() {
  const [activeTab, setActiveTab] = React.useState('orders')
  const [orders, setOrders] = React.useState<WholesaleOrder[]>([])
  const [dealers, setDealers] = React.useState<Dealer[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Status filter
  const [statusFilter, setStatusFilter] = React.useState('all')

  // New order dialog
  const [orderDialogOpen, setOrderDialogOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [selectedDealerId, setSelectedDealerId] = React.useState('')
  const [dealerName, setDealerName] = React.useState('')
  const [orderDiscount, setOrderDiscount] = React.useState('')
  const [orderTax, setOrderTax] = React.useState('')
  const [deliveryAddress, setDeliveryAddress] = React.useState('')
  const [orderNotes, setOrderNotes] = React.useState('')
  const [orderItems, setOrderItems] = React.useState<OrderFormItem[]>([])

  // Product search for adding items
  const [productSearch, setProductSearch] = React.useState('')
  const [searchResults, setSearchResults] = React.useState<Array<{ id: string; type: 'book' | 'stationery'; name: string; price: number }>>([])
  const [searchLoading, setSearchLoading] = React.useState(false)

  // Order detail dialog
  const [detailOrder, setDetailOrder] = React.useState<WholesaleOrder | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false)

  // Updating status
  const [updatingStatus, setUpdatingStatus] = React.useState<string | null>(null)

  // Fetch orders
  const fetchOrders = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('limit', '50')
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      const res = await fetch(`/api/wholesale?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch orders')
      const json = await res.json()
      setOrders(json.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  // Fetch dealers (customers of type wholesale/dealer/distributor)
  const fetchDealers = React.useCallback(async () => {
    try {
      const res = await fetch('/api/customers?type=wholesale&limit=100')
      const res2 = await fetch('/api/customers?type=dealer&limit=100')
      const json1 = res.ok ? await res.json() : { data: [] }
      const json2 = res2.ok ? await res2.json() : { data: [] }
      // Also get distributors
      const res3 = await fetch('/api/customers?type=distributor&limit=100')
      const json3 = res3.ok ? await res3.json() : { data: [] }
      setDealers([...(json1.data || []), ...(json2.data || []), ...(json3.data || [])])
    } catch {
      // silent
    }
  }, [])

  React.useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  React.useEffect(() => {
    fetchDealers()
  }, [fetchDealers])

  // Product search for order items
  React.useEffect(() => {
    if (!productSearch) {
      setSearchResults([])
      return
    }
    const searchProducts = async () => {
      setSearchLoading(true)
      try {
        const params = new URLSearchParams()
        params.set('search', productSearch)
        params.set('limit', '10')

        const [booksRes, stationeryRes] = await Promise.all([
          fetch(`/api/books?${params.toString()}`),
          fetch(`/api/stationery?${params.toString()}`),
        ])

        const bookData = booksRes.ok ? await booksRes.json() : { data: [] }
        const stationeryData = stationeryRes.ok ? await stationeryRes.json() : { data: [] }

        const results: Array<{ id: string; type: 'book' | 'stationery'; name: string; price: number }> = [
          ...(bookData.data || []).map((b: Record<string, unknown>) => ({
            id: b.id as string,
            type: 'book' as const,
            name: b.title as string,
            price: (b.price as number) || 0,
          })),
          ...(stationeryData.data || []).map((s: Record<string, unknown>) => ({
            id: s.id as string,
            type: 'stationery' as const,
            name: s.name as string,
            price: (s.price as number) || 0,
          })),
        ]

        setSearchResults(results)
      } catch {
        // silent
      } finally {
        setSearchLoading(false)
      }
    }
    const debounce = setTimeout(searchProducts, 300)
    return () => clearTimeout(debounce)
  }, [productSearch])

  // Add product to order items
  const addItemToOrder = (product: { id: string; type: 'book' | 'stationery'; name: string; price: number }) => {
    const existing = orderItems.find((i) => i.productId === product.id && i.productType === product.type)
    if (existing) {
      setOrderItems((prev) =>
        prev.map((i) =>
          i.productId === product.id && i.productType === product.type
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      )
    } else {
      setOrderItems((prev) => [
        ...prev,
        {
          productType: product.type,
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: product.price,
          discount: 0,
        },
      ])
    }
    setProductSearch('')
    setSearchResults([])
  }

  // Remove order item
  const removeOrderItem = (index: number) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index))
  }

  // Update order item
  const updateOrderItem = (index: number, field: keyof OrderFormItem, value: number | string) => {
    setOrderItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  // Status badges
  const getStatusBadge = (status: string) => {
    const map: Record<string, { className: string; label: string }> = {
      pending: { className: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800', label: 'Pending' },
      confirmed: { className: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400 border-sky-200 dark:border-sky-800', label: 'Confirmed' },
      shipped: { className: 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 border-teal-200 dark:border-teal-800', label: 'Shipped' },
      delivered: { className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', label: 'Delivered' },
      cancelled: { className: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200 dark:border-red-800', label: 'Cancelled' },
    }
    const s = map[status] || { className: '', label: status }
    return <Badge className={`text-xs ${s.className}`}>{s.label}</Badge>
  }

  const getPaymentBadge = (status: string) => {
    const map: Record<string, { className: string; label: string }> = {
      unpaid: { className: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200 dark:border-red-800', label: 'Unpaid' },
      partial: { className: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800', label: 'Partial' },
      paid: { className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', label: 'Paid' },
    }
    const s = map[status] || { className: '', label: status }
    return <Badge className={`text-xs ${s.className}`}>{s.label}</Badge>
  }

  // Compute order total
  const orderSubtotal = orderItems.reduce((s, i) => s + i.quantity * i.unitPrice * (1 - i.discount / 100), 0)
  const orderDiscountAmt = parseFloat(orderDiscount) || 0
  const orderTaxAmt = (orderSubtotal - orderDiscountAmt) * ((parseFloat(orderTax) || 0) / 100)
  const orderTotal = orderSubtotal - orderDiscountAmt + orderTaxAmt

  // Create wholesale order
  const handleCreateOrder = async () => {
    if (orderItems.length === 0) return
    setSaving(true)
    setError(null)
    try {
      const items = orderItems.map((item) => ({
        bookId: item.productType === 'book' ? item.productId : undefined,
        stationeryId: item.productType === 'stationery' ? item.productId : undefined,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
      }))

      const res = await fetch('/api/wholesale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedDealerId || undefined,
          dealerName: dealerName || undefined,
          discount: orderDiscountAmt,
          tax: parseFloat(orderTax) || 0,
          paymentStatus: 'unpaid',
          deliveryAddress: deliveryAddress || undefined,
          notes: orderNotes || undefined,
          items,
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to create order')
      }

      // Reset form
      setOrderDialogOpen(false)
      setSelectedDealerId('')
      setDealerName('')
      setOrderDiscount('')
      setOrderTax('')
      setDeliveryAddress('')
      setOrderNotes('')
      setOrderItems([])
      fetchOrders()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order')
    } finally {
      setSaving(false)
    }
  }

  // Update order status
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId)
    try {
      const res = await fetch('/api/wholesale', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      fetchOrders()
      if (detailOrder?.id === orderId) {
        setDetailOrder((prev) => prev ? { ...prev, status: newStatus } : null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  // View order detail
  const handleViewOrder = (order: WholesaleOrder) => {
    setDetailOrder(order)
    setDetailDialogOpen(true)
  }

  // Analytics
  const totalRevenue = orders.filter((o) => o.status === 'delivered').reduce((s, o) => s + o.total, 0)
  const pendingAmount = orders.filter((o) => o.paymentStatus === 'unpaid' || o.paymentStatus === 'partial').reduce((s, o) => s + o.total, 0)
  const topDealers = dealers.sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5)
  const outstandingReceivables = dealers.reduce((s, d) => s + d.outstanding, 0)

  // Get item name
  const getItemName = (item: OrderItem): string => {
    if (item.book) return item.book.title
    if (item.stationery) return item.stationery.name
    return 'Unknown Item'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Wholesale Management</h2>
          <p className="text-muted-foreground text-sm">Manage bulk orders, dealers, and distributor relationships</p>
        </div>
        <Button onClick={() => setOrderDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 shrink-0">
          <Plus className="size-4 mr-1.5" />
          New Order
        </Button>
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders" className="text-xs sm:text-sm">
            <Package className="size-4 mr-1.5 hidden sm:inline" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="dealers" className="text-xs sm:text-sm">
            <Users className="size-4 mr-1.5 hidden sm:inline" />
            Dealers
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs sm:text-sm">
            <BarChart3 className="size-4 mr-1.5 hidden sm:inline" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          {/* Status Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Filter:</span>
                {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    size="sm"
                    className={statusFilter === status ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Package className="size-12 text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground">No wholesale orders found</p>
                  <p className="text-xs text-muted-foreground mt-1">Create your first wholesale order</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Dealer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead className="hidden sm:table-cell">Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm font-medium">{order.orderNumber}</TableCell>
                          <TableCell className="text-sm">
                            {order.customer?.name || order.dealerName || '—'}
                          </TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell className="text-right font-medium">${order.total.toFixed(2)}</TableCell>
                          <TableCell>{getPaymentBadge(order.paymentStatus)}</TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => handleViewOrder(order)}>
                                <Eye className="size-3.5 mr-1" />
                                View
                              </Button>
                              {order.status === 'pending' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-sky-600 hover:text-sky-700"
                                  onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                                  disabled={updatingStatus === order.id}
                                >
                                  <CheckCircle2 className="size-3.5 mr-1" />
                                  Confirm
                                </Button>
                              )}
                              {order.status === 'confirmed' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-teal-600 hover:text-teal-700"
                                  onClick={() => handleStatusUpdate(order.id, 'shipped')}
                                  disabled={updatingStatus === order.id}
                                >
                                  <Ship className="size-3.5 mr-1" />
                                  Ship
                                </Button>
                              )}
                              {order.status === 'shipped' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-emerald-600 hover:text-emerald-700"
                                  onClick={() => handleStatusUpdate(order.id, 'delivered')}
                                  disabled={updatingStatus === order.id}
                                >
                                  <PackageCheck className="size-3.5 mr-1" />
                                  Deliver
                                </Button>
                              )}
                            </div>
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

        {/* Dealers Tab */}
        <TabsContent value="dealers" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="size-4" />
                Wholesale Dealers & Distributors ({dealers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {dealers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="size-12 text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground">No dealers found</p>
                  <p className="text-xs text-muted-foreground mt-1">Add wholesale customers from the CRM module</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden sm:table-cell">Type</TableHead>
                        <TableHead className="hidden md:table-cell">Contact</TableHead>
                        <TableHead className="text-right">Total Spent</TableHead>
                        <TableHead className="text-right">Outstanding</TableHead>
                        <TableHead className="hidden sm:table-cell text-right">Orders</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dealers.map((dealer) => (
                        <TableRow key={dealer.id}>
                          <TableCell className="font-medium">{dealer.name}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant="outline" className="text-xs capitalize">{dealer.type}</Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                            {dealer.email || dealer.phone || '—'}
                          </TableCell>
                          <TableCell className="text-right font-medium">${dealer.totalSpent.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            {dealer.outstanding > 0 ? (
                              <span className="text-red-600 font-medium">${dealer.outstanding.toFixed(2)}</span>
                            ) : (
                              <span className="text-muted-foreground">$0.00</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-right text-muted-foreground">
                            {dealer._count?.wholesaleOrders || 0}
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

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue (Delivered)</p>
                    <p className="text-2xl font-bold">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="rounded-lg bg-emerald-100 dark:bg-emerald-950/30 p-2">
                    <DollarSign className="size-5 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Amount</p>
                    <p className="text-2xl font-bold text-amber-600">${pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="rounded-lg bg-amber-100 dark:bg-amber-950/30 p-2">
                    <TrendingUp className="size-5 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Dealers</p>
                    <p className="text-2xl font-bold">{dealers.filter((d) => d.isActive).length}</p>
                  </div>
                  <div className="rounded-lg bg-teal-100 dark:bg-teal-950/30 p-2">
                    <Users className="size-5 text-teal-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Outstanding</p>
                    <p className="text-2xl font-bold text-red-600">${outstandingReceivables.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="rounded-lg bg-red-100 dark:bg-red-950/30 p-2">
                    <AlertCircle className="size-5 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Dealers */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Top Dealers by Revenue</CardTitle>
              <CardDescription>Highest grossing wholesale partners</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {topDealers.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">No dealer data available</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Dealer</TableHead>
                        <TableHead className="text-right">Total Spent</TableHead>
                        <TableHead className="text-right">Outstanding</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topDealers.map((dealer, i) => (
                        <TableRow key={dealer.id}>
                          <TableCell>
                            <Badge variant="outline" className={`text-xs ${i === 0 ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' : ''}`}>
                              #{i + 1}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{dealer.name}</TableCell>
                          <TableCell className="text-right font-medium">${dealer.totalSpent.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            {dealer.outstanding > 0 ? (
                              <span className="text-red-600">${dealer.outstanding.toFixed(2)}</span>
                            ) : (
                              <span className="text-muted-foreground">$0.00</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Status Breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Order Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => {
                  const count = orders.filter((o) => o.status === status).length
                  const total = orders.filter((o) => o.status === status).reduce((s, o) => s + o.total, 0)
                  return (
                    <div key={status} className="rounded-lg border p-3 text-center space-y-1">
                      <p className="text-xs text-muted-foreground capitalize">{status}</p>
                      <p className="text-xl font-bold">{count}</p>
                      <p className="text-xs text-muted-foreground">${total.toFixed(2)}</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Order Dialog */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="size-5" />
              New Wholesale Order
            </DialogTitle>
            <DialogDescription>Create a new bulk order for a dealer or distributor</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Dealer Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dealer / Customer</Label>
                <Select value={selectedDealerId} onValueChange={(v) => {
                  setSelectedDealerId(v)
                  const dealer = dealers.find((d) => d.id === v)
                  if (dealer) setDealerName(dealer.name)
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select dealer" />
                  </SelectTrigger>
                  <SelectContent>
                    {dealers.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name} ({d.type})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dealer-name">Or Dealer Name</Label>
                <Input
                  id="dealer-name"
                  value={dealerName}
                  onChange={(e) => setDealerName(e.target.value)}
                  placeholder="Enter dealer name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery-addr">Delivery Address</Label>
              <Input
                id="delivery-addr"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Delivery address"
              />
            </div>

            {/* Add Products */}
            <div className="space-y-2">
              <Label>Add Products</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search books or stationery..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="border rounded-lg max-h-40 overflow-y-auto">
                  {searchResults.map((product) => (
                    <button
                      key={`${product.type}-${product.id}`}
                      className="w-full flex items-center justify-between p-2 hover:bg-muted/50 transition-colors text-left text-sm"
                      onClick={() => addItemToOrder(product)}
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{product.type}</Badge>
                        <span>{product.name}</span>
                      </div>
                      <span className="text-muted-foreground">${product.price.toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Order Items */}
            {orderItems.length > 0 && (
              <div className="space-y-2">
                <Label>Order Items</Label>
                <div className="border rounded-lg divide-y">
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2">
                      <Badge variant="outline" className="text-[10px] shrink-0">{item.productType}</Badge>
                      <span className="text-sm flex-1 truncate">{item.productName}</span>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-16 text-center text-sm"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => updateOrderItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-20 text-right text-sm"
                      />
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discount}
                        onChange={(e) => updateOrderItem(index, 'discount', parseFloat(e.target.value) || 0)}
                        className="w-16 text-center text-sm"
                        placeholder="%"
                      />
                      <Button variant="ghost" size="icon" className="size-7 text-red-500" onClick={() => removeOrderItem(index)}>
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Discount / Tax */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order-discount">Discount ($)</Label>
                <Input
                  id="order-discount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={orderDiscount}
                  onChange={(e) => setOrderDiscount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order-tax">Tax (%)</Label>
                <Input
                  id="order-tax"
                  type="number"
                  step="0.5"
                  min="0"
                  value={orderTax}
                  onChange={(e) => setOrderTax(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Order Total Preview */}
            {orderItems.length > 0 && (
              <div className="rounded-lg bg-muted p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${orderSubtotal.toFixed(2)}</span>
                </div>
                {orderDiscountAmt > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>-${orderDiscountAmt.toFixed(2)}</span>
                  </div>
                )}
                {orderTaxAmt > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${orderTaxAmt.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>${orderTotal.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="order-notes">Notes</Label>
              <Textarea
                id="order-notes"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Order notes..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrder} disabled={saving || orderItems.length === 0} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? (
                <>
                  <Loader2 className="size-4 mr-1.5 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Order'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="size-5" />
              Order Details
            </DialogTitle>
            <DialogDescription>
              {detailOrder?.orderNumber || ''}
            </DialogDescription>
          </DialogHeader>
          {detailOrder && (
            <div className="space-y-4 py-4">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Dealer</p>
                  <p className="font-medium">{detailOrder.customer?.name || detailOrder.dealerName || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(detailOrder.status)}</div>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment</p>
                  <div className="mt-1">{getPaymentBadge(detailOrder.paymentStatus)}</div>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{new Date(detailOrder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {detailOrder.deliveryAddress && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Delivery Address</p>
                  <p className="font-medium">{detailOrder.deliveryAddress}</p>
                </div>
              )}

              <Separator />

              {/* Items */}
              <div className="space-y-2">
                <Label className="text-sm">Items ({detailOrder.items.length})</Label>
                <div className="border rounded-lg divide-y">
                  {detailOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2.5 text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{getItemName(item)}</p>
                        <p className="text-xs text-muted-foreground">
                          ${item.unitPrice.toFixed(2)} x {item.quantity}
                          {item.discount > 0 && <span className="text-emerald-600 ml-1">-{item.discount}%</span>}
                        </p>
                      </div>
                      <span className="font-medium ml-2">${item.totalPrice.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${detailOrder.subtotal.toFixed(2)}</span>
                </div>
                {detailOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>-${detailOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                {detailOrder.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${detailOrder.tax.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${detailOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex gap-2 pt-2">
                {detailOrder.status === 'pending' && (
                  <Button onClick={() => handleStatusUpdate(detailOrder.id, 'confirmed')} disabled={updatingStatus === detailOrder.id} className="bg-sky-600 hover:bg-sky-700">
                    <CheckCircle2 className="size-4 mr-1.5" />
                    Confirm Order
                  </Button>
                )}
                {detailOrder.status === 'confirmed' && (
                  <Button onClick={() => handleStatusUpdate(detailOrder.id, 'shipped')} disabled={updatingStatus === detailOrder.id} className="bg-teal-600 hover:bg-teal-700">
                    <Ship className="size-4 mr-1.5" />
                    Mark as Shipped
                  </Button>
                )}
                {detailOrder.status === 'shipped' && (
                  <Button onClick={() => handleStatusUpdate(detailOrder.id, 'delivered')} disabled={updatingStatus === detailOrder.id} className="bg-emerald-600 hover:bg-emerald-700">
                    <PackageCheck className="size-4 mr-1.5" />
                    Mark as Delivered
                  </Button>
                )}
                {(detailOrder.status === 'pending' || detailOrder.status === 'confirmed') && (
                  <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleStatusUpdate(detailOrder.id, 'cancelled')} disabled={updatingStatus === detailOrder.id}>
                    Cancel Order
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
