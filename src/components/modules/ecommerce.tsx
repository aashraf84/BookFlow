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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-sky-100 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400', icon: CheckCircle2 },
  shipped: { label: 'Shipped', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-teal-100 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400', icon: Package },
  cancelled: { label: 'Cancelled', color: 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400', icon: XCircle },
}

const deliveryMethodConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  home: { label: 'Home Delivery', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400', icon: Truck },
  pickup: { label: 'Store Pickup', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400', icon: Store },
  'click-collect': { label: 'Click & Collect', color: 'bg-teal-100 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400', icon: ShoppingBag },
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

  // Summary metrics
  const pendingCount = orders.filter((o) => o.status === 'pending').length
  const confirmedCount = orders.filter((o) => o.status === 'confirmed').length
  const shippedCount = orders.filter((o) => o.status === 'shipped').length
  const totalRevenue = orders.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0)

  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Pending Orders</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
              <div className="rounded-lg bg-amber-100 p-2.5 dark:bg-amber-950/30">
                <Clock className="size-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold">{confirmedCount}</p>
              </div>
              <div className="rounded-lg bg-emerald-100 p-2.5 dark:bg-emerald-950/30">
                <CheckCircle2 className="size-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Shipped</p>
                <p className="text-2xl font-bold">{shippedCount}</p>
              </div>
              <div className="rounded-lg bg-teal-100 p-2.5 dark:bg-teal-950/30">
                <Truck className="size-5 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-rose-100 p-2.5 dark:bg-rose-950/30">
                <Globe className="size-5 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header + Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Online Orders</h2>
          <p className="text-sm text-muted-foreground">Manage e-commerce orders, fulfillment, and delivery</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] h-8 text-sm">
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
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground animate-pulse">
            Loading orders...
          </CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Globe className="size-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-1">No orders found</h3>
            <p className="text-sm text-muted-foreground">
              {statusFilter !== 'all' ? 'No orders match the selected filter' : 'Online orders will appear here'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const st = statusConfig[order.status] || statusConfig.pending
                  const dm = deliveryMethodConfig[order.deliveryMethod] || deliveryMethodConfig.home
                  const DmIcon = dm.icon
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono font-medium text-sm">{order.orderNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{order.customerName}</p>
                          {order.customerEmail && (
                            <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">${order.total.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={st.color}>
                          {st.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1 text-xs">
                          <DmIcon className="size-3" />
                          {dm.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {nextStatusMap[order.status]?.map((ns) => {
                            const nsConfig = statusConfig[ns]
                            const NsIcon = nsConfig?.icon || ChevronRight
                            return (
                              <Button
                                key={ns}
                                size="sm"
                                variant="outline"
                                className={`h-7 text-xs ${ns === 'cancelled' ? 'text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/30' : ''}`}
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
                            className="h-7 text-xs"
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
          </CardContent>
        </Card>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Order {selectedOrder?.orderNumber}
              {selectedOrder && (() => {
                const st = statusConfig[selectedOrder.status] || statusConfig.pending
                return <Badge className={st.color}>{st.label}</Badge>
              })()}
            </DialogTitle>
            <DialogDescription>Order details and item breakdown</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedOrder.customerEmail || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedOrder.customerPhone || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Delivery Method</p>
                  <Badge variant="outline" className="gap-1 mt-0.5">
                    {(() => {
                      const dm = deliveryMethodConfig[selectedOrder.deliveryMethod] || deliveryMethodConfig.home
                      const DmIcon = dm.icon
                      return <><DmIcon className="size-3" />{dm.label}</>
                    })()}
                  </Badge>
                </div>
              </div>

              {selectedOrder.deliveryAddress && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Delivery Address</p>
                  <div className="flex items-start gap-1.5 mt-0.5">
                    <MapPin className="size-3.5 mt-0.5 text-muted-foreground shrink-0" />
                    <p>{selectedOrder.deliveryAddress}</p>
                  </div>
                </div>
              )}

              <Separator />

              {/* Items */}
              <div>
                <p className="font-medium text-sm mb-2">Order Items</p>
                <div className="space-y-2">
                  {parseItems(selectedOrder.items).map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm py-1.5 px-2 rounded bg-muted/50">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                      </div>
                      <p className="font-medium">${(item.quantity * item.price).toFixed(2)}</p>
                    </div>
                  ))}
                  {parseItems(selectedOrder.items).length === 0 && (
                    <p className="text-sm text-muted-foreground">No items data available</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-bold text-emerald-600">${selectedOrder.total.toLocaleString()}</span>
              </div>

              {selectedOrder.notes && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Notes</p>
                  <p className="mt-0.5">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Status Actions */}
              {nextStatusMap[selectedOrder.status]?.length > 0 && (
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-sm text-muted-foreground">Update Status:</span>
                  {nextStatusMap[selectedOrder.status].map((ns) => (
                    <Button
                      key={ns}
                      size="sm"
                      variant={ns === 'cancelled' ? 'destructive' : 'default'}
                      className={ns !== 'cancelled' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
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
