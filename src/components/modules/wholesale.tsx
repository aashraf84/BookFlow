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
  X,
  ShoppingCart,
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
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'

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
  const { authUser } = useAppStore()
  const isViewOnly = authUser?.isViewOnly ?? false

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

  // Status badges — pending=orange, confirmed=blue, shipped=purple, delivered=green, cancelled=red
  const getStatusBadge = (status: string) => {
    const map: Record<string, { className: string; label: string }> = {
      pending: { className: 'bg-macos-orange/10 text-macos-orange', label: 'Pending' },
      confirmed: { className: 'bg-macos-blue/10 text-macos-blue', label: 'Confirmed' },
      shipped: { className: 'bg-macos-purple/10 text-macos-purple', label: 'Shipped' },
      delivered: { className: 'bg-macos-green/10 text-macos-green', label: 'Delivered' },
      cancelled: { className: 'bg-macos-red/10 text-macos-red', label: 'Cancelled' },
    }
    const s = map[status] || { className: 'bg-secondary text-secondary-foreground', label: status }
    return <span className={`rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 ${s.className}`}>{s.label}</span>
  }

  const getPaymentBadge = (status: string) => {
    const map: Record<string, { className: string; label: string }> = {
      unpaid: { className: 'bg-macos-red/10 text-macos-red', label: 'Unpaid' },
      partial: { className: 'bg-macos-orange/10 text-macos-orange', label: 'Partial' },
      paid: { className: 'bg-macos-green/10 text-macos-green', label: 'Paid' },
    }
    const s = map[status] || { className: 'bg-secondary text-secondary-foreground', label: status }
    return <span className={`rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 ${s.className}`}>{s.label}</span>
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

  // Stats
  const pendingOrders = orders.filter((o) => o.status === 'pending').length
  const shippedOrders = orders.filter((o) => o.status === 'shipped').length

  // Tabs
  const tabs = [
    { id: 'orders', label: 'Orders' },
    { id: 'dealers', label: 'Dealers' },
    { id: 'analytics', label: 'Analytics' },
  ]

  // Status filter tabs
  const statusTabs = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'shipped', label: 'Shipped' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' },
  ]

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="macos-page-header">
        <div>
          <h2 className="macos-page-title">Wholesale</h2>
          <p className="macos-page-subtitle">Manage bulk orders, dealers & distributor relationships</p>
        </div>
        {!isViewOnly && (
          <Button onClick={() => setOrderDialogOpen(true)} className="bg-primary text-primary-foreground rounded-lg font-medium text-[13px] h-8 shrink-0">
            <Plus className="size-3.5 mr-1.5" />
            New Order
          </Button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 macos-card macos-shadow-card p-3 text-[13px] text-macos-red bg-macos-red/5">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
          <Button variant="ghost" size="sm" className="ml-auto h-6 text-[10px] text-macos-red hover:text-macos-red" onClick={() => setError(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="macos-stat macos-shadow-card">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-gg-bay/10 flex items-center justify-center">
              <Package className="size-4 text-gg-bay" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Total Orders</p>
              <p className="text-[24px] font-bold tracking-tight leading-tight">{orders.length}</p>
            </div>
          </div>
        </div>
        <div className="macos-stat macos-shadow-card">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-macos-orange/10 flex items-center justify-center">
              <DollarSign className="size-4 text-macos-orange" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Pending</p>
              <p className="text-[24px] font-bold tracking-tight leading-tight text-macos-orange">{pendingOrders}</p>
            </div>
          </div>
        </div>
        <div className="macos-stat macos-shadow-card">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-macos-purple/10 flex items-center justify-center">
              <Truck className="size-4 text-macos-purple" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Shipped</p>
              <p className="text-[24px] font-bold tracking-tight leading-tight text-macos-purple">{shippedOrders}</p>
            </div>
          </div>
        </div>
        <div className="macos-stat macos-shadow-card">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-macos-red/10 flex items-center justify-center">
              <TrendingUp className="size-4 text-macos-red" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Outstanding</p>
              <p className="text-[24px] font-bold tracking-tight leading-tight text-macos-red">${outstandingReceivables.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar — Main Tabs */}
      <div className="macos-filter-bar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`macos-filter-item ${activeTab === tab.id ? 'macos-filter-item-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Status Filter */}
          <div className="macos-filter-bar">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                className={`macos-filter-item ${statusFilter === tab.id ? 'macos-filter-item-active' : ''}`}
                onClick={() => setStatusFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Orders Table */}
          <div className="macos-card macos-shadow-card overflow-hidden">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="macos-empty">
                <Package className="size-12 text-muted-foreground/30 mb-3" />
                <p className="text-[13px] font-medium text-muted-foreground">No wholesale orders found</p>
                <p className="text-[11px] text-muted-foreground mt-1">Create your first wholesale order</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/50 hover:bg-transparent">
                      <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Order #</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Dealer</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Total</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Payment</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground hidden sm:table-cell">Date</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id} className="macos-table-row border-b border-border/30">
                        <TableCell className="font-mono text-[13px] font-medium tracking-tight">{order.orderNumber}</TableCell>
                        <TableCell className="text-[13px] tracking-tight">
                          {order.customer?.name || order.dealerName || '—'}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right text-[13px] font-medium tracking-tight">${order.total.toFixed(2)}</TableCell>
                        <TableCell>{getPaymentBadge(order.paymentStatus)}</TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground text-[13px] tracking-tight">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-0.5">
                            <Button variant="ghost" size="sm" onClick={() => handleViewOrder(order)} className="h-7 text-[13px] rounded-lg hover:bg-secondary">
                              <Eye className="size-3 mr-1" />
                              View
                            </Button>
                            {!isViewOnly && order.status === 'pending' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[13px] text-macos-blue hover:text-macos-blue hover:bg-macos-blue/10 rounded-lg"
                                onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                                disabled={updatingStatus === order.id}
                              >
                                <CheckCircle2 className="size-3 mr-1" />
                                Confirm
                              </Button>
                            )}
                            {!isViewOnly && order.status === 'confirmed' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[13px] text-macos-purple hover:text-macos-purple hover:bg-macos-purple/10 rounded-lg"
                                onClick={() => handleStatusUpdate(order.id, 'shipped')}
                                disabled={updatingStatus === order.id}
                              >
                                <Ship className="size-3 mr-1" />
                                Ship
                              </Button>
                            )}
                            {!isViewOnly && order.status === 'shipped' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[13px] text-macos-green hover:text-macos-green hover:bg-macos-green/10 rounded-lg"
                                onClick={() => handleStatusUpdate(order.id, 'delivered')}
                                disabled={updatingStatus === order.id}
                              >
                                <PackageCheck className="size-3 mr-1" />
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
          </div>
        </div>
      )}

      {/* Dealers Tab */}
      {activeTab === 'dealers' && (
        <div className="macos-card macos-shadow-card overflow-hidden">
          <div className="p-4 border-b border-border/30">
            <h3 className="macos-section-title flex items-center gap-2">
              <Users className="size-3.5" />
              Wholesale Dealers & Distributors ({dealers.length})
            </h3>
          </div>
          {dealers.length === 0 ? (
            <div className="macos-empty">
              <Users className="size-12 text-muted-foreground/30 mb-3" />
              <p className="text-[13px] font-medium text-muted-foreground">No dealers found</p>
              <p className="text-[11px] text-muted-foreground mt-1">Add wholesale customers from the CRM module</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50 hover:bg-transparent">
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Name</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground hidden sm:table-cell">Type</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground hidden md:table-cell">Contact</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Total Spent</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Outstanding</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground hidden sm:table-cell text-right">Orders</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dealers.map((dealer) => (
                    <TableRow key={dealer.id} className="macos-table-row border-b border-border/30">
                      <TableCell className="text-[13px] font-medium tracking-tight">{dealer.name}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 bg-macos-purple/10 text-macos-purple capitalize">{dealer.type}</span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-[13px] tracking-tight">
                        {dealer.email || dealer.phone || '—'}
                      </TableCell>
                      <TableCell className="text-right text-[13px] font-medium tracking-tight">${dealer.totalSpent.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-[13px] tracking-tight">
                        {dealer.outstanding > 0 ? (
                          <span className="text-macos-red font-medium">${dealer.outstanding.toFixed(2)}</span>
                        ) : (
                          <span className="text-muted-foreground">$0.00</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-right text-muted-foreground text-[13px] tracking-tight">
                        {dealer._count?.wholesaleOrders || 0}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="macos-stat macos-shadow-card">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-macos-green/10 flex items-center justify-center">
                  <DollarSign className="size-4 text-macos-green" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Revenue (Delivered)</p>
                  <p className="text-[24px] font-bold tracking-tight leading-tight">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>
            <div className="macos-stat macos-shadow-card">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-macos-orange/10 flex items-center justify-center">
                  <BarChart3 className="size-4 text-macos-orange" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Pending Amount</p>
                  <p className="text-[24px] font-bold tracking-tight leading-tight text-macos-orange">${pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>
            <div className="macos-stat macos-shadow-card">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-macos-blue/10 flex items-center justify-center">
                  <Users className="size-4 text-macos-blue" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Active Dealers</p>
                  <p className="text-[24px] font-bold tracking-tight leading-tight">{dealers.filter((d) => d.isActive).length}</p>
                </div>
              </div>
            </div>
            <div className="macos-stat macos-shadow-card">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-macos-red/10 flex items-center justify-center">
                  <TrendingUp className="size-4 text-macos-red" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Outstanding</p>
                  <p className="text-[24px] font-bold tracking-tight leading-tight text-macos-red">${outstandingReceivables.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Dealers */}
          <div className="macos-card macos-shadow-card overflow-hidden">
            <div className="p-4 border-b border-border/30">
              <h3 className="macos-section-title">Top Dealers by Revenue</h3>
              <p className="macos-section-desc">Highest grossing wholesale partners</p>
            </div>
            {topDealers.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-[13px] tracking-tight">No dealer data available</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/50 hover:bg-transparent">
                      <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Rank</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Dealer</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Total Spent</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Outstanding</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topDealers.map((dealer, i) => (
                      <TableRow key={dealer.id} className="macos-table-row border-b border-border/30">
                        <TableCell>
                          <span className={`rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 ${i === 0 ? 'bg-gg-golden/10 text-gg-golden' : 'bg-secondary text-secondary-foreground'}`}>
                            #{i + 1}
                          </span>
                        </TableCell>
                        <TableCell className="text-[13px] font-medium tracking-tight">{dealer.name}</TableCell>
                        <TableCell className="text-right text-[13px] font-medium tracking-tight">${dealer.totalSpent.toFixed(2)}</TableCell>
                        <TableCell className="text-right text-[13px] tracking-tight">
                          {dealer.outstanding > 0 ? (
                            <span className="text-macos-red">${dealer.outstanding.toFixed(2)}</span>
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
          </div>

          {/* Order Status Breakdown */}
          <div className="macos-card macos-shadow-card overflow-hidden">
            <div className="p-4 border-b border-border/30">
              <h3 className="macos-section-title">Order Status Breakdown</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => {
                  const count = orders.filter((o) => o.status === status).length
                  const total = orders.filter((o) => o.status === status).reduce((s, o) => s + o.total, 0)
                  const colorMap: Record<string, string> = {
                    pending: 'bg-macos-orange/10 text-macos-orange',
                    confirmed: 'bg-macos-blue/10 text-macos-blue',
                    shipped: 'bg-macos-purple/10 text-macos-purple',
                    delivered: 'bg-macos-green/10 text-macos-green',
                    cancelled: 'bg-macos-red/10 text-macos-red',
                  }
                  return (
                    <div key={status} className="macos-stat macos-shadow-card text-center">
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{status}</p>
                      <p className="text-[24px] font-bold tracking-tight leading-tight">{count}</p>
                      <p className="text-[11px] text-muted-foreground tracking-tight mt-1">${total.toFixed(2)}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Order Dialog */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto rounded-2xl macos-shadow-float">
          <DialogHeader>
            <DialogTitle className="macos-section-title flex items-center gap-2">
              <ShoppingCart className="size-4" />
              New Wholesale Order
            </DialogTitle>
            <DialogDescription className="text-[12px]">Create a new bulk order for a dealer or distributor</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Dealer Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-medium text-muted-foreground">Dealer / Customer</Label>
                <Select value={selectedDealerId} onValueChange={(v) => {
                  setSelectedDealerId(v)
                  const dealer = dealers.find((d) => d.id === v)
                  if (dealer) setDealerName(dealer.name)
                }}>
                  <SelectTrigger className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8">
                    <SelectValue placeholder="Select dealer" />
                  </SelectTrigger>
                  <SelectContent>
                    {dealers.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name} ({d.type})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dealer-name" className="text-[12px] font-medium text-muted-foreground">Or Dealer Name</Label>
                <Input
                  id="dealer-name"
                  value={dealerName}
                  onChange={(e) => setDealerName(e.target.value)}
                  placeholder="Enter dealer name"
                  className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="delivery-addr" className="text-[12px] font-medium text-muted-foreground">Delivery Address</Label>
              <Input
                id="delivery-addr"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Delivery address"
                className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </div>

            {/* Add Products */}
            <div className="space-y-1.5">
              <Label className="text-[12px] font-medium text-muted-foreground">Add Products</Label>
              <div className="macos-search flex items-center">
                <Search className="size-3.5 text-muted-foreground ml-2.5 shrink-0" />
                <Input
                  placeholder="Search books or stationery..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="border-0 bg-transparent text-[13px] h-8 pl-2 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              {searchLoading && (
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground px-2">
                  <Loader2 className="size-3 animate-spin" /> Searching...
                </div>
              )}
              {searchResults.length > 0 && (
                <div className="macos-card macos-shadow overflow-hidden max-h-40 overflow-y-auto custom-scrollbar">
                  {searchResults.map((product) => (
                    <button
                      key={`${product.type}-${product.id}`}
                      className="w-full flex items-center justify-between p-2.5 hover:bg-secondary/80 text-left text-[13px] tracking-tight transition-colors"
                      onClick={() => addItemToOrder(product)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="rounded-md text-[10px] font-semibold tracking-wide px-1.5 py-0.5 bg-macos-purple/10 text-macos-purple">{product.type}</span>
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
              <div className="space-y-1.5">
                <Label className="text-[12px] font-medium text-muted-foreground">Order Items</Label>
                <div className="macos-card overflow-hidden divide-y divide-border/30">
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2.5">
                      <span className="rounded-md text-[10px] font-semibold tracking-wide px-1.5 py-0.5 bg-macos-purple/10 text-macos-purple shrink-0">{item.productType}</span>
                      <span className="text-[13px] flex-1 truncate tracking-tight">{item.productName}</span>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-14 text-center text-[13px] h-7 rounded-lg bg-secondary/80 border-0 focus-visible:ring-1 focus-visible:ring-primary/30"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => updateOrderItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-20 text-right text-[13px] h-7 rounded-lg bg-secondary/80 border-0 focus-visible:ring-1 focus-visible:ring-primary/30"
                      />
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discount}
                        onChange={(e) => updateOrderItem(index, 'discount', parseFloat(e.target.value) || 0)}
                        className="w-14 text-center text-[13px] h-7 rounded-lg bg-secondary/80 border-0 focus-visible:ring-1 focus-visible:ring-primary/30"
                        placeholder="%"
                      />
                      <Button variant="ghost" size="icon" className="size-6 rounded-lg text-macos-red hover:text-macos-red hover:bg-macos-red/10" onClick={() => removeOrderItem(index)}>
                        <X className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Discount / Tax */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="order-discount" className="text-[12px] font-medium text-muted-foreground">Discount ($)</Label>
                <Input
                  id="order-discount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={orderDiscount}
                  onChange={(e) => setOrderDiscount(e.target.value)}
                  placeholder="0.00"
                  className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="order-tax" className="text-[12px] font-medium text-muted-foreground">Tax (%)</Label>
                <Input
                  id="order-tax"
                  type="number"
                  step="0.5"
                  min="0"
                  value={orderTax}
                  onChange={(e) => setOrderTax(e.target.value)}
                  placeholder="0"
                  className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
            </div>

            {/* Order Total Preview */}
            {orderItems.length > 0 && (
              <div className="macos-card p-3 space-y-1 text-[13px] tracking-tight bg-secondary/50">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${orderSubtotal.toFixed(2)}</span>
                </div>
                {orderDiscountAmt > 0 && (
                  <div className="flex justify-between text-macos-green">
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
                <div className="flex justify-between font-bold text-base tracking-tight">
                  <span>Total</span>
                  <span>${orderTotal.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="order-notes" className="text-[12px] font-medium text-muted-foreground">Notes</Label>
              <Textarea
                id="order-notes"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Order notes..."
                rows={2}
                className="rounded-lg bg-secondary/80 border-0 text-[13px] focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setOrderDialogOpen(false)} disabled={saving} className="bg-secondary text-secondary-foreground rounded-lg text-[13px] h-8">
              Cancel
            </Button>
            <Button onClick={handleCreateOrder} disabled={saving || orderItems.length === 0} className="bg-primary text-primary-foreground rounded-lg font-medium text-[13px] h-8">
              {saving ? (
                <>
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
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
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto rounded-2xl macos-shadow-float">
          <DialogHeader>
            <DialogTitle className="macos-section-title flex items-center gap-2">
              <Eye className="size-4" />
              Order Details
            </DialogTitle>
            <DialogDescription className="text-[12px]">
              {detailOrder?.orderNumber || ''}
            </DialogDescription>
          </DialogHeader>
          {detailOrder && (
            <div className="space-y-4 py-4">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-3 text-[13px] tracking-tight">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Dealer</p>
                  <p className="font-medium">{detailOrder.customer?.name || detailOrder.dealerName || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(detailOrder.status)}</div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Payment</p>
                  <div className="mt-1">{getPaymentBadge(detailOrder.paymentStatus)}</div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Date</p>
                  <p className="font-medium">{new Date(detailOrder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {detailOrder.deliveryAddress && (
                <div className="text-[13px] tracking-tight">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Delivery Address</p>
                  <p className="font-medium">{detailOrder.deliveryAddress}</p>
                </div>
              )}

              <Separator />

              {/* Items */}
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Items ({detailOrder.items.length})</Label>
                <div className="macos-card overflow-hidden divide-y divide-border/30">
                  {detailOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2.5 text-[13px] tracking-tight">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{getItemName(item)}</p>
                        <p className="text-[11px] text-muted-foreground tracking-tight">
                          ${item.unitPrice.toFixed(2)} × {item.quantity}
                          {item.discount > 0 && <span className="text-macos-green ml-1">-{item.discount}%</span>}
                        </p>
                      </div>
                      <span className="font-medium ml-2">${item.totalPrice.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-1.5 text-[13px] tracking-tight">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${detailOrder.subtotal.toFixed(2)}</span>
                </div>
                {detailOrder.discount > 0 && (
                  <div className="flex justify-between text-macos-green">
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
                <div className="flex justify-between font-bold text-base tracking-tight">
                  <span>Total</span>
                  <span>${detailOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Status Actions */}
              {!isViewOnly && (
                <div className="flex gap-2 pt-2">
                  {detailOrder.status === 'pending' && (
                    <Button onClick={() => handleStatusUpdate(detailOrder.id, 'confirmed')} disabled={updatingStatus === detailOrder.id} className="bg-macos-blue text-white rounded-lg font-medium text-[13px] h-8">
                      <CheckCircle2 className="size-3.5 mr-1.5" />
                      Confirm Order
                    </Button>
                  )}
                  {detailOrder.status === 'confirmed' && (
                    <Button onClick={() => handleStatusUpdate(detailOrder.id, 'shipped')} disabled={updatingStatus === detailOrder.id} className="bg-macos-purple text-white rounded-lg font-medium text-[13px] h-8">
                      <Ship className="size-3.5 mr-1.5" />
                      Mark as Shipped
                    </Button>
                  )}
                  {detailOrder.status === 'shipped' && (
                    <Button onClick={() => handleStatusUpdate(detailOrder.id, 'delivered')} disabled={updatingStatus === detailOrder.id} className="bg-macos-green text-white rounded-lg font-medium text-[13px] h-8">
                      <PackageCheck className="size-3.5 mr-1.5" />
                      Mark as Delivered
                    </Button>
                  )}
                  {(detailOrder.status === 'pending' || detailOrder.status === 'confirmed') && (
                    <Button variant="ghost" className="text-macos-red hover:text-macos-red hover:bg-macos-red/10 rounded-lg text-[13px] h-8" onClick={() => handleStatusUpdate(detailOrder.id, 'cancelled')} disabled={updatingStatus === detailOrder.id}>
                      Cancel Order
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
