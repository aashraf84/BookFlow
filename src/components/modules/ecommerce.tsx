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
  Search,
  ArrowRight,
  CreditCard,
  Box,
  Home,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { useAppStore } from '@/store/app-store'

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

// Order status config - spec: pending=orange, confirmed=blue, shipped=purple, delivered=green, cancelled=red
const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'text-macos-orange', bgColor: 'bg-macos-orange/10', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'text-macos-blue', bgColor: 'bg-macos-blue/10', icon: CheckCircle2 },
  shipped: { label: 'Shipped', color: 'text-macos-purple', bgColor: 'bg-macos-purple/10', icon: Truck },
  delivered: { label: 'Delivered', color: 'text-macos-green', bgColor: 'bg-macos-green/10', icon: Package },
  cancelled: { label: 'Cancelled', color: 'text-macos-red', bgColor: 'bg-macos-red/10', icon: XCircle },
}

const deliveryMethodConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  home: { label: 'Home Delivery', color: 'text-macos-blue', bgColor: 'bg-macos-blue/10', icon: Truck },
  pickup: { label: 'Store Pickup', color: 'text-macos-green', bgColor: 'bg-macos-green/10', icon: Store },
  'click-collect': { label: 'Click & Collect', color: 'text-macos-purple', bgColor: 'bg-macos-purple/10', icon: ShoppingBag },
}

const nextStatusMap: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

// Delivery pipeline stages
const deliveryPipelineStages = ['pending', 'confirmed', 'shipped', 'delivered']

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

// Delivery Pipeline Step Component
function DeliveryPipelineStep({
  label,
  icon: Icon,
  isActive,
  isCompleted,
  isCurrent,
  color,
  bgColor,
  isLast,
}: {
  label: string
  icon: React.ElementType
  isActive: boolean
  isCompleted: boolean
  isCurrent: boolean
  color: string
  bgColor: string
  isLast: boolean
}) {
  return (
    <div className="flex items-center gap-0 flex-1 min-w-0">
      <div className="flex flex-col items-center gap-1.5 min-w-0 flex-1">
        <div
          className={`relative flex items-center justify-center size-10 rounded-xl transition-all duration-300 ${
            isCurrent
              ? `${bgColor} ring-2 ring-offset-1 ring-offset-background ${color.replace('text-', 'ring-')}`
              : isCompleted
              ? bgColor
              : 'bg-secondary/60'
          }`}
        >
          <Icon className={`size-4 ${isCurrent || isCompleted ? color : 'text-muted-foreground/50'}`} />
          {isCurrent && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center size-2.5 rounded-full bg-macos-blue animate-pulse" />
          )}
        </div>
        <div className="text-center">
          <p className={`text-[10px] font-semibold uppercase tracking-wider ${isCurrent ? color : isCompleted ? 'text-foreground' : 'text-muted-foreground/60'}`}>
            {label}
          </p>
        </div>
      </div>
      {!isLast && (
        <div className="flex items-center self-start mt-5 -ml-1 -mr-1">
          <div className={`h-[2px] w-full min-w-[24px] rounded-full transition-colors ${
            isCompleted ? 'bg-gg-golden/50' : 'bg-border'
          }`} />
          <ArrowRight className={`size-3 -ml-1 ${isCompleted ? 'text-gg-golden/50' : 'text-muted-foreground/30'}`} />
        </div>
      )}
    </div>
  )
}

// Order detail pipeline for a single order in the detail dialog
function OrderDeliveryPipeline({ status }: { status: string }) {
  const currentIdx = deliveryPipelineStages.indexOf(status)
  const isCancelled = status === 'cancelled'

  return (
    <div className="py-3">
      {isCancelled ? (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-macos-red/5 border border-macos-red/10">
          <XCircle className="size-5 text-macos-red" />
          <div>
            <p className="text-[13px] font-semibold text-macos-red">Order Cancelled</p>
            <p className="text-[11px] text-muted-foreground">This order has been cancelled</p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2">
          {deliveryPipelineStages.map((stage, idx) => {
            const config = statusConfig[stage]
            const isLast = idx === deliveryPipelineStages.length - 1
            const isCompleted = idx < currentIdx
            const isCurrent = idx === currentIdx
            return (
              <DeliveryPipelineStep
                key={stage}
                label={config.label}
                icon={config.icon}
                isActive={isCompleted || isCurrent}
                isCompleted={isCompleted}
                isCurrent={isCurrent}
                color={config.color}
                bgColor={config.bgColor}
                isLast={isLast}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

export function EcommerceModule() {
  const { toast } = useToast()
  const authUser = useAppStore((s) => s.authUser)
  const isViewOnly = authUser?.isViewOnly ?? false

  const [orders, setOrders] = React.useState<OnlineOrder[]>([])
  const [loading, setLoading] = React.useState(true)
  const [statusFilter, setStatusFilter] = React.useState('all')
  const [selectedOrder, setSelectedOrder] = React.useState<OnlineOrder | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')

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

  // Filter orders by search
  const filteredOrders = orders.filter((o) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      (o.customerEmail && o.customerEmail.toLowerCase().includes(q))
    )
  })

  const pendingCount = orders.filter((o) => o.status === 'pending').length
  const shippedCount = orders.filter((o) => o.status === 'shipped').length
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length
  const totalRevenue = orders.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0)

  // Pipeline aggregate counts
  const pipelineCounts = {
    pending: orders.filter((o) => o.status === 'pending').length,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="macos-page-title">E-Commerce</h1>
        <p className="macos-page-subtitle">Manage online orders, fulfillment, and delivery</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="macos-card macos-shadow-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold tracking-tight mt-0.5">{orders.length}</p>
            </div>
            <div className="rounded-xl bg-macos-blue/10 p-2.5">
              <Globe className="size-5 text-macos-blue" />
            </div>
          </div>
        </div>
        <div className="macos-card macos-shadow-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold tracking-tight mt-0.5">{pendingCount}</p>
            </div>
            <div className="rounded-xl bg-macos-orange/10 p-2.5">
              <Clock className="size-5 text-macos-orange" />
            </div>
          </div>
        </div>
        <div className="macos-card macos-shadow-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">Shipped</p>
              <p className="text-2xl font-bold tracking-tight mt-0.5">{shippedCount}</p>
            </div>
            <div className="rounded-xl bg-macos-purple/10 p-2.5">
              <Truck className="size-5 text-macos-purple" />
            </div>
          </div>
        </div>
        <div className="macos-card macos-shadow-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">Delivered</p>
              <p className="text-2xl font-bold tracking-tight mt-0.5">{deliveredCount}</p>
            </div>
            <div className="rounded-xl bg-macos-green/10 p-2.5">
              <Package className="size-5 text-macos-green" />
            </div>
          </div>
        </div>
      </div>

      {/* Order Tracking Delivery Pipeline */}
      <div className="macos-card macos-shadow p-6">
        <div className="macos-section-header mb-4">
          <div>
            <p className="macos-section-title">Order Tracking Pipeline</p>
            <p className="macos-section-desc">Real-time order flow from placement to delivery</p>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="size-3.5 text-gg-golden" />
            <span className="text-[13px] font-semibold text-gg-golden">
              ${totalRevenue.toLocaleString()} revenue
            </span>
          </div>
        </div>
        <div className="flex items-start justify-between gap-2">
          {deliveryPipelineStages.map((stage, idx) => {
            const config = statusConfig[stage]
            const count = pipelineCounts[stage as keyof typeof pipelineCounts] || 0
            const isLast = idx === deliveryPipelineStages.length - 1
            // A step is "active" if it has items in it
            const isActive = count > 0
            // A step is "completed" if all items have passed it
            const laterCounts = deliveryPipelineStages.slice(idx + 1).reduce((sum, s) => sum + (pipelineCounts[s as keyof typeof pipelineCounts] || 0), 0)
            const isCompleted = count === 0 && laterCounts > 0
            const StageIcon = config.icon
            return (
              <div key={stage} className="flex items-center gap-0 flex-1 min-w-0">
                <div className="flex flex-col items-center gap-1.5 min-w-0 flex-1">
                  <div
                    className={`relative flex items-center justify-center size-10 rounded-xl transition-all duration-300 ${
                      isActive
                        ? `${config.bgColor} ring-2 ring-offset-1 ring-offset-background ${config.color.replace('text-', 'ring-')}`
                        : isCompleted
                        ? config.bgColor
                        : 'bg-secondary/60'
                    }`}
                  >
                    <StageIcon className={`size-4 ${isActive || isCompleted ? config.color : 'text-muted-foreground/50'}`} />
                    {count > 0 && (
                      <span className={`absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[9px] font-bold px-1 ${
                        isActive ? config.bgColor + ' ' + config.color : 'bg-secondary text-muted-foreground'
                      }`}>
                        {count}
                      </span>
                    )}
                  </div>
                  <div className="text-center">
                    <p className={`text-[10px] font-semibold uppercase tracking-wider ${isActive ? config.color : isCompleted ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                      {config.label}
                    </p>
                  </div>
                </div>
                {!isLast && (
                  <div className="flex items-center self-start mt-5 -ml-1 -mr-1">
                    <div className={`h-[2px] w-full min-w-[24px] rounded-full transition-colors ${
                      isCompleted ? 'bg-gg-golden/50' : 'bg-border'
                    }`} />
                    <ArrowRight className={`size-3 -ml-1 ${isCompleted ? 'text-gg-golden/50' : 'text-muted-foreground/30'}`} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {/* Cancelled count */}
        {orders.filter((o) => o.status === 'cancelled').length > 0 && (
          <div className="mt-4 flex items-center gap-2 pt-3 border-t border-border">
            <XCircle className="size-3.5 text-macos-red" />
            <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">Cancelled:</span>
            <Badge className="rounded-md bg-macos-red/10 text-macos-red text-[10px] font-semibold px-2 py-0.5">
              {orders.filter((o) => o.status === 'cancelled').length}
            </Badge>
          </div>
        )}
      </div>

      {/* Header + Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="macos-filter-bar">
          {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`macos-filter-item ${statusFilter === filter ? 'macos-filter-item-active' : ''}`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="macos-search flex items-center gap-2 px-3 h-8">
            <Search className="size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent h-6 text-[13px] p-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="macos-card macos-shadow-card p-8 text-center text-muted-foreground animate-pulse text-[13px]">
          Loading orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="macos-card macos-shadow-card macos-empty">
          <Globe className="size-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-[13px] font-semibold tracking-tight mb-1">No orders found</h3>
          <p className="text-[13px] text-muted-foreground">
            {statusFilter !== 'all' || searchQuery ? 'Try adjusting your filters' : 'Online orders will appear here'}
          </p>
        </div>
      ) : (
        <div className="macos-card macos-shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border">
                <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Order #</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Customer</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Total</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Delivery</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Date</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const st = statusConfig[order.status] || statusConfig.pending
                const dm = deliveryMethodConfig[order.deliveryMethod] || deliveryMethodConfig.home
                const DmIcon = dm.icon
                const StIcon = st.icon
                return (
                  <TableRow key={order.id} className="macos-table-row">
                    <TableCell className="text-[13px] font-mono font-medium">
                      <div className="flex items-center gap-2">
                        <div className={`size-6 rounded-lg flex items-center justify-center ${st.bgColor}`}>
                          <StIcon className={`size-3 ${st.color}`} />
                        </div>
                        {order.orderNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-[13px]">{order.customerName}</p>
                        {order.customerEmail && (
                          <p className="text-[11px] text-muted-foreground">{order.customerEmail}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-[13px] font-semibold text-gg-golden">${order.total.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={`rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 ${st.bgColor} ${st.color}`}>
                        {st.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 gap-1 ${dm.bgColor} ${dm.color}`}>
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
                          const nsConf = statusConfig[ns]
                          return (
                            <Button
                              key={ns}
                              size="sm"
                              variant="outline"
                              className={`h-7 text-[10px] rounded-lg font-semibold px-2.5 ${
                                ns === 'cancelled' ? 'text-macos-red border-macos-red/20 hover:bg-macos-red/10' : nsConf ? `${nsConf.color} border-current/20` : ''
                              }`}
                              onClick={() => handleStatusUpdate(order, ns)}
                              disabled={isViewOnly}
                            >
                              <NsIcon className="size-3 mr-1" />
                              {ns.charAt(0).toUpperCase() + ns.slice(1)}
                            </Button>
                          )
                        })}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-[10px] rounded-lg"
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
        <DialogContent className="sm:max-w-lg macos-shadow-float rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[13px] font-semibold tracking-tight flex items-center gap-2">
              Order {selectedOrder?.orderNumber}
              {selectedOrder && (() => {
                const st = statusConfig[selectedOrder.status] || statusConfig.pending
                return <Badge className={`rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 ${st.bgColor} ${st.color}`}>{st.label}</Badge>
              })()}
            </DialogTitle>
            <DialogDescription className="text-[13px]">Order details and delivery tracking</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              {/* Delivery Status Pipeline */}
              <div className="macos-card p-4">
                <p className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground mb-2">Delivery Status</p>
                <OrderDeliveryPipeline status={selectedOrder.status} />
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4 text-[13px]">
                <div>
                  <p className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">Customer</p>
                  <p className="font-medium mt-0.5">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">Email</p>
                  <p className="font-medium mt-0.5">{selectedOrder.customerEmail || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">Phone</p>
                  <p className="font-medium mt-0.5">{selectedOrder.customerPhone || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">Delivery</p>
                  <Badge className={`rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 gap-1 mt-1 ${
                    (deliveryMethodConfig[selectedOrder.deliveryMethod] || deliveryMethodConfig.home).bgColor
                  } ${
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
                  <p className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">Address</p>
                  <div className="flex items-start gap-1.5 mt-0.5">
                    <MapPin className="size-3.5 mt-0.5 text-muted-foreground shrink-0" />
                    <p>{selectedOrder.deliveryAddress}</p>
                  </div>
                </div>
              )}

              <Separator />

              {/* Items */}
              <div>
                <p className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground mb-2">Order Items</p>
                <div className="space-y-2">
                  {parseItems(selectedOrder.items).map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-[13px] py-1.5 px-3 rounded-xl bg-secondary/50">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                      </div>
                      <p className="font-medium text-gg-golden">${(item.quantity * item.price).toFixed(2)}</p>
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
                <span className="text-2xl font-bold tracking-tight text-gg-golden">${selectedOrder.total.toLocaleString()}</span>
              </div>

              {selectedOrder.notes && (
                <div className="text-[13px]">
                  <p className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">Notes</p>
                  <p className="mt-0.5">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Status Actions */}
              {nextStatusMap[selectedOrder.status]?.length > 0 && !isViewOnly && (
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">Update:</span>
                  {nextStatusMap[selectedOrder.status].map((ns) => {
                    const nsConf = statusConfig[ns]
                    return (
                      <Button
                        key={ns}
                        size="sm"
                        variant={ns === 'cancelled' ? 'destructive' : 'default'}
                        className={`rounded-lg font-semibold text-[13px] ${ns !== 'cancelled' ? 'bg-primary text-primary-foreground' : ''}`}
                        onClick={() => {
                          handleStatusUpdate(selectedOrder, ns)
                          setDetailDialogOpen(false)
                        }}
                        disabled={isViewOnly}
                      >
                        {ns.charAt(0).toUpperCase() + ns.slice(1)}
                      </Button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
