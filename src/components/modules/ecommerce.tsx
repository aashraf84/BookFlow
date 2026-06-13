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
  Eye,
  Search,
  ArrowRight,
  CreditCard,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useAppStore } from '@/store/app-store'
import {
  MacosPageHeader,
  MacosStatCard,
  MacosStatGrid,
  MacosCard,
  MacosSearch,
  MacosFilterBar,
  MacosButton,
  MacosBadge,
  MacosDialog,
  MacosEmptyState,
  MacosSection,
} from '@/components/macos-ui'

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

  const cancelledCount = orders.filter((o) => o.status === 'cancelled').length

  return (
    <div className="space-y-6">
      {/* macOS Page Header */}
      <MacosPageHeader
        title="E-Commerce"
        subtitle="Manage online orders, fulfillment, and delivery"
        icon={Globe}
        iconColor="text-macos-blue"
        iconBg="bg-macos-blue/10"
      >
        {isViewOnly && (
          <MacosBadge variant="warning">
            <Eye className="size-3 mr-1" />
            DEMO MODE
          </MacosBadge>
        )}
      </MacosPageHeader>

      {/* Stats - macOS Stat Cards */}
      <MacosStatGrid>
        <MacosStatCard label="Total Orders" value={orders.length} icon={Globe} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" />
        <MacosStatCard label="Pending" value={pendingCount} icon={Clock} iconColor="text-macos-orange" iconBg="bg-macos-orange/10" />
        <MacosStatCard label="Shipped" value={shippedCount} icon={Truck} iconColor="text-macos-purple" iconBg="bg-macos-purple/10" />
        <MacosStatCard label="Delivered" value={deliveredCount} icon={Package} iconColor="text-macos-green" iconBg="bg-macos-green/10" />
      </MacosStatGrid>

      {/* Order Tracking Delivery Pipeline */}
      <MacosCard noPadding>
        <div className="px-5 pt-5 pb-0">
          <MacosSection
            title="Order Tracking Pipeline"
            subtitle="Real-time order flow from placement to delivery"
            action={
              <div className="flex items-center gap-2">
                <CreditCard className="size-3.5 text-gg-golden" />
                <span className="text-[13px] font-semibold text-gg-golden">
                  ${totalRevenue.toLocaleString()} revenue
                </span>
              </div>
            }
          />
        </div>
        <div className="p-5 pt-2">
          <div className="flex items-start justify-between gap-2">
            {deliveryPipelineStages.map((stage, idx) => {
              const config = statusConfig[stage]
              const count = pipelineCounts[stage as keyof typeof pipelineCounts] || 0
              const isLast = idx === deliveryPipelineStages.length - 1
              const isActive = count > 0
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
          {cancelledCount > 0 && (
            <div className="mt-4 flex items-center gap-2 pt-3 border-t border-border">
              <XCircle className="size-3.5 text-macos-red" />
              <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">Cancelled:</span>
              <MacosBadge variant="danger">{cancelledCount}</MacosBadge>
            </div>
          )}
        </div>
      </MacosCard>

      {/* Filter Bar + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <MacosFilterBar
          items={[
            { id: 'all', label: 'All' },
            { id: 'pending', label: 'Pending' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'shipped', label: 'Shipped' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'cancelled', label: 'Cancelled' },
          ]}
          activeId={statusFilter}
          onChange={setStatusFilter}
        />
        <MacosSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search orders..."
        />
      </div>

      {/* Orders Table */}
      {loading ? (
        <MacosCard>
          <div className="p-8 text-center text-muted-foreground animate-pulse text-[13px]">
            Loading orders...
          </div>
        </MacosCard>
      ) : filteredOrders.length === 0 ? (
        <MacosCard>
          <MacosEmptyState
            icon={Globe}
            title="No orders found"
            description={statusFilter !== 'all' || searchQuery ? 'Try adjusting your filters' : 'Online orders will appear here'}
          />
        </MacosCard>
      ) : (
        <div className="macos-card macos-shadow-card overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/50 hover:bg-transparent">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Order #</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Customer</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Total</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Status</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Delivery</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Date</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const st = statusConfig[order.status] || statusConfig.pending
                  const dm = deliveryMethodConfig[order.deliveryMethod] || deliveryMethodConfig.home
                  const DmIcon = dm.icon
                  const StIcon = st.icon
                  return (
                    <TableRow key={order.id} className="macos-table-row border-b border-border/30 last:border-0">
                      <TableCell className="text-[13px] font-mono font-medium tracking-tight py-3">
                        <div className="flex items-center gap-2">
                          <div className={`size-7 rounded-lg flex items-center justify-center ${st.bgColor}`}>
                            <StIcon className={`size-3.5 ${st.color}`} />
                          </div>
                          {order.orderNumber}
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div>
                          <p className="font-medium text-[13px] tracking-tight">{order.customerName}</p>
                          {order.customerEmail && (
                            <p className="text-[11px] text-muted-foreground">{order.customerEmail}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-[13px] font-semibold tracking-tight py-3 text-gg-golden">${order.total.toLocaleString()}</TableCell>
                      <TableCell className="py-3">
                        <MacosBadge
                          variant={
                            order.status === 'delivered' ? 'success' :
                            order.status === 'cancelled' ? 'danger' :
                            order.status === 'pending' ? 'warning' :
                            order.status === 'confirmed' ? 'info' : 'purple'
                          }
                        >
                          {st.label}
                        </MacosBadge>
                      </TableCell>
                      <TableCell className="py-3">
                        <MacosBadge
                          variant={
                            order.deliveryMethod === 'home' ? 'info' :
                            order.deliveryMethod === 'pickup' ? 'success' : 'purple'
                          }
                        >
                          <DmIcon className="size-3 mr-1" />
                          {dm.label}
                        </MacosBadge>
                      </TableCell>
                      <TableCell className="text-[13px] font-medium tracking-tight py-3 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right py-3">
                        <div className="flex items-center justify-end gap-1">
                          {nextStatusMap[order.status]?.map((ns) => {
                            const NsIcon = ns === 'cancelled' ? XCircle : ChevronRight
                            return (
                              <MacosButton
                                key={ns}
                                variant={ns === 'cancelled' ? 'danger' : 'secondary'}
                                icon={NsIcon}
                                onClick={() => handleStatusUpdate(order, ns)}
                                disabled={isViewOnly}
                              >
                                {ns.charAt(0).toUpperCase() + ns.slice(1)}
                              </MacosButton>
                            )
                          })}
                          <MacosButton
                            variant="ghost"
                            icon={Eye}
                            onClick={() => openOrderDetail(order)}
                          >
                            View
                          </MacosButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Order Detail Dialog - frosted glass */}
      <MacosDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        title={
          selectedOrder
            ? `Order ${selectedOrder.orderNumber}`
            : 'Order Details'
        }
        description="Order details and delivery tracking"
        className="max-w-lg"
      >
        {selectedOrder && (
          <div className="space-y-4">
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              {(() => {
                const st = statusConfig[selectedOrder.status] || statusConfig.pending
                const variant =
                  selectedOrder.status === 'delivered' ? 'success' as const :
                  selectedOrder.status === 'cancelled' ? 'danger' as const :
                  selectedOrder.status === 'pending' ? 'warning' as const :
                  selectedOrder.status === 'confirmed' ? 'info' as const : 'purple' as const
                return <MacosBadge variant={variant}>{st.label}</MacosBadge>
              })()}
            </div>

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
                <div className="mt-1">
                  <MacosBadge
                    variant={
                      selectedOrder.deliveryMethod === 'home' ? 'info' :
                      selectedOrder.deliveryMethod === 'pickup' ? 'success' : 'purple'
                    }
                  >
                    {(() => {
                      const dm = deliveryMethodConfig[selectedOrder.deliveryMethod] || deliveryMethodConfig.home
                      const DmIcon = dm.icon
                      return <><DmIcon className="size-3 mr-1" />{dm.label}</>
                    })()}
                  </MacosBadge>
                </div>
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
                {nextStatusMap[selectedOrder.status].map((ns) => (
                  <MacosButton
                    key={ns}
                    variant={ns === 'cancelled' ? 'danger' : 'primary'}
                    onClick={() => {
                      handleStatusUpdate(selectedOrder, ns)
                      setDetailDialogOpen(false)
                    }}
                    disabled={isViewOnly}
                  >
                    {ns.charAt(0).toUpperCase() + ns.slice(1)}
                  </MacosButton>
                ))}
              </div>
            )}
          </div>
        )}
      </MacosDialog>
    </div>
  )
}
