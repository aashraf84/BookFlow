'use client'

import * as React from 'react'
import {
  Globe,
  ShoppingBag,
  Truck,
  Store,
  MapPin,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  Filter,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'

// Types
interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface OnlineOrder {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string | null
  customerPhone: string | null
  items: OrderItem[] | string
  total: number
  status: string
  deliveryMethod: string
  deliveryAddress: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-macos-orange/10 text-macos-orange', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-macos-blue/10 text-macos-blue', icon: CheckCircle2 },
  shipped: { label: 'Shipped', color: 'bg-macos-teal/10 text-macos-teal', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-macos-green/10 text-macos-green', icon: Package },
  cancelled: { label: 'Cancelled', color: 'bg-macos-red/10 text-macos-red', icon: XCircle },
}

const deliveryMethodConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  home: { label: 'Home Delivery', color: 'bg-macos-blue/10 text-macos-blue', icon: Truck },
  pickup: { label: 'Store Pickup', color: 'bg-macos-green/10 text-macos-green', icon: Store },
  'click-collect': { label: 'Click & Collect', color: 'bg-macos-purple/10 text-macos-purple', icon: ShoppingBag },
}

const nextStatusMap: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

function parseItems(items: OrderItem[] | string): OrderItem[] {
  if (typeof items === 'string') {
    try {
      return JSON.parse(items)
    } catch {
      return []
    }
  }
  return items
}

export function EcommerceModule() {
  const { toast } = useToast()
  const [orders, setOrders] = React.useState<OnlineOrder[]>([])
  const [loading, setLoading] = React.useState(true)
  const [statusFilter, setStatusFilter] = React.useState('all')
  const [selectedOrder, setSelectedOrder] = React.useState<OnlineOrder | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false)

  const fetchOrders = React.useCallback(async () => {
    try {
      setLoading(true)
      const url = statusFilter && statusFilter !== 'all' ? `/api/ecommerce?status=${statusFilter}` : '/api/ecommerce'
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch orders')
      const json = await res.json()
      setOrders(json.data || [])
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch online orders', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [statusFilter, toast])

  React.useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleStatusUpdate = async (order: OnlineOrder, newStatus: string) => {
    try {
      const res = await fetch('/api/ecommerce', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update order status')
      toast({ title: 'Success', description: `Order ${order.orderNumber} updated to ${newStatus}` })
      fetchOrders()
      if (selectedOrder?.id === order.id) {
        setSelectedOrder({ ...order, status: newStatus })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update order status', variant: 'destructive' })
    }
  }

  const openOrderDetail = (order: OnlineOrder) => {
    setSelectedOrder(order)
    setDetailDialogOpen(true)
  }

  const pendingCount = orders.filter((o) => o.status === 'pending').length
  const shippedCount = orders.filter((o) => o.status === 'shipped').length
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length
  const totalRevenue = orders.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl macos-shadow p-4 bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold tracking-tight">{orders.length}</p>
            </div>
            <div className="rounded-lg bg-macos-blue/10 p-2.5">
              <Globe className="size-5 text-macos-blue" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl macos-shadow p-4 bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold tracking-tight">{pendingCount}</p>
            </div>
            <div className="rounded-lg bg-macos-orange/10 p-2.5">
              <Clock className="size-5 text-macos-orange" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl macos-shadow p-4 bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Shipped</p>
              <p className="text-2xl font-bold tracking-tight">{shippedCount}</p>
            </div>
            <div className="rounded-lg bg-macos-teal/10 p-2.5">
              <Truck className="size-5 text-macos-teal" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl macos-shadow p-4 bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Delivered</p>
              <p className="text-2xl font-bold tracking-tight">{deliveredCount}</p>
            </div>
            <div className="rounded-lg bg-macos-green/10 p-2.5">
              <Package className="size-5 text-macos-green" />
            </div>
          </div>
        </div>
      </div>

      {/* Header + Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">E-Commerce</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">Manage online orders, fulfillment, and delivery</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="size-3.5 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] h-8 text-[13px] rounded-lg bg-secondary/80 border-0">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="rounded-2xl macos-shadow p-8 bg-card text-center text-muted-foreground animate-pulse text-[13px]">
          Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl macos-shadow p-5 bg-card text-center py-16">
          <Globe className="size-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold tracking-tight mb-1">No orders found</h3>
          <p className="text-[13px] text-muted-foreground">
            {statusFilter !== 'all' ? 'No orders match the selected filter' : 'Online orders will appear here'}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl macos-shadow bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Order #</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Customer</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Total</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Delivery</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Date</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const st = statusConfig[order.status] || statusConfig.pending
                const dm = deliveryMethodConfig[order.deliveryMethod] || deliveryMethodConfig.home
                const DmIcon = dm.icon
                return (
                  <TableRow key={order.id} className="hover:bg-secondary/50">
                    <TableCell className="text-[13px] font-mono font-medium">{order.orderNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-[13px]">{order.customerName}</p>
                        {order.customerEmail && (
                          <p className="text-[11px] text-muted-foreground">{order.customerEmail}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-[13px] font-medium">${order.total.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={`rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 ${st.color}`}>
                        {st.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 gap-1 ${dm.color}`}>
                        <DmIcon className="size-3" />
                        {dm.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {nextStatusMap[order.status]?.map((ns) => {
                          const NsIcon = ns === 'cancelled' ? XCircle : ChevronRight
                          return (
                            <Button
                              key={ns}
                              size="sm"
                              variant="outline"
                              className={`h-7 text-[11px] rounded-md font-medium px-2 ${
                                ns === 'cancelled' ? 'text-macos-red border-macos-red/20 hover:bg-macos-red/10' : ''
                              }`}
                              onClick={() => handleStatusUpdate(order, ns)}
                            >
                              <NsIcon className="size-3 mr-1" />
                              {ns.charAt(0).toUpperCase() + ns.slice(1)}
                            </Button>
                          )
                        })}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-[11px] rounded-md"
                          onClick={() => openOrderDetail(order)}
                        >
                          <Eye className="size-3 mr-1" />
                          View
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

      {/* Order Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[13px] font-semibold tracking-tight flex items-center gap-2">
              Order {selectedOrder?.orderNumber}
              {selectedOrder && (() => {
                const st = statusConfig[selectedOrder.status] || statusConfig.pending
                return <Badge className={`rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 ${st.color}`}>{st.label}</Badge>
              })()}
            </DialogTitle>
            <DialogDescription className="text-[13px]">Order details and item breakdown</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4 text-[13px]">
                <div>
                  <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Customer</p>
                  <p className="font-medium mt-0.5">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Email</p>
                  <p className="font-medium mt-0.5">{selectedOrder.customerEmail || '—'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Phone</p>
                  <p className="font-medium mt-0.5">{selectedOrder.customerPhone || '—'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Delivery</p>
                  <Badge className={`rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 gap-1 mt-1 ${
                    (deliveryMethodConfig[selectedOrder.deliveryMethod] || deliveryMethodConfig.home).color
                  }`}>
                    {(() => {
                      const dm = deliveryMethodConfig[selectedOrder.deliveryMethod] || deliveryMethodConfig.home
                      const DmIcon = dm.icon
                      return <><DmIcon className="size-3" />{dm.label}</>
                    })()}
                  </Badge>
                </div>
              </div>

              {selectedOrder.deliveryAddress && (
                <div className="text-[13px]">
                  <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Address</p>
                  <div className="flex items-start gap-1.5 mt-0.5">
                    <MapPin className="size-3.5 mt-0.5 text-muted-foreground shrink-0" />
                    <p>{selectedOrder.deliveryAddress}</p>
                  </div>
                </div>
              )}

              <Separator />

              {/* Items */}
              <div>
                <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase mb-2">Order Items</p>
                <div className="space-y-2">
                  {parseItems(selectedOrder.items).map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-[13px] py-1.5 px-3 rounded-xl bg-secondary/50">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                      </div>
                      <p className="font-medium">${(item.quantity * item.price).toFixed(2)}</p>
                    </div>
                  ))}
                  {parseItems(selectedOrder.items).length === 0 && (
                    <p className="text-[13px] text-muted-foreground">No items data available</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[13px]">Total</span>
                <span className="text-2xl font-bold tracking-tight text-macos-blue">${selectedOrder.total.toLocaleString()}</span>
              </div>

              {selectedOrder.notes && (
                <div className="text-[13px]">
                  <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Notes</p>
                  <p className="mt-0.5">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Status Actions */}
              {nextStatusMap[selectedOrder.status]?.length > 0 && (
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Update:</span>
                  {nextStatusMap[selectedOrder.status].map((ns) => (
                    <Button
                      key={ns}
                      size="sm"
                      variant={ns === 'cancelled' ? 'destructive' : 'default'}
                      className={`rounded-lg font-medium text-[13px] ${ns !== 'cancelled' ? 'bg-primary text-primary-foreground' : ''}`}
                      onClick={() => {
                        handleStatusUpdate(selectedOrder, ns)
                        setDetailDialogOpen(false)
                      }}
                    >
                      {ns.charAt(0).toUpperCase() + ns.slice(1)}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
