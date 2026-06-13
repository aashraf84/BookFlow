'use client'

import React, { useState, useEffect } from 'react'
import {
  DollarSign,
  Users,
  Package,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  BookOpen,
  AlertTriangle,
  Brain,
  Warehouse,
  Truck,
  GraduationCap,
  PenTool,
  Building2,
  PencilRuler,
  Activity,
  RefreshCw,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { useAppStore } from '@/store/app-store'

// ── Types ────────────────────────────────────────────────────────
interface DashboardData {
  todaySales: number
  monthlyRevenue: number
  activeCustomers: number
  inventoryValue: number
  wholesaleOrdersCount: number
  onlineOrdersCount: number
  pendingPOsCount: number
  lowStockCount: number
  recentSales: {
    id: string
    invoiceNumber: string
    total: number
    paymentMethod: string
    paymentStatus: string
    saleType: string
    createdAt: string
    customer: { name: string } | null
    branch: { name: string } | null
  }[]
  topSellingBooks: {
    bookId: string
    title: string
    author: string
    totalSold: number
  }[]
}

// ── Mock chart data ──────────────────────────────────────────────
const monthlyRevenueData = [
  { month: 'Jan', revenue: 42000 },
  { month: 'Feb', revenue: 38000 },
  { month: 'Mar', revenue: 55000 },
  { month: 'Apr', revenue: 47000 },
  { month: 'May', revenue: 62000 },
  { month: 'Jun', revenue: 58000 },
  { month: 'Jul', revenue: 71000 },
  { month: 'Aug', revenue: 89000 },
  { month: 'Sep', revenue: 95000 },
  { month: 'Oct', revenue: 78000 },
  { month: 'Nov', revenue: 68000 },
  { month: 'Dec', revenue: 82000 },
]

const salesByCategoryData = [
  { category: 'Books', sales: 62400, fill: '#007AFF' },
  { category: 'Stationery', sales: 38200, fill: '#34C759' },
  { category: 'School Supplies', sales: 28600, fill: '#FF9500' },
]

const branchPerformanceData = [
  { branch: 'Downtown', revenue: 34500, orders: 156 },
  { branch: 'Mall', revenue: 28200, orders: 128 },
  { branch: 'Online', revenue: 22800, orders: 203 },
  { branch: 'University', revenue: 18500, orders: 94 },
]

const revenueChartConfig: ChartConfig = {
  revenue: { label: 'Revenue', color: '#007AFF' },
}

const categoryChartConfig: ChartConfig = {
  sales: { label: 'Sales', color: '#007AFF' },
}

// ── Component ────────────────────────────────────────────────────
export default function DashboardModule() {
  const setActiveModule = useAppStore((s) => s.setActiveModule)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/dashboard')
      if (!res.ok) throw new Error('Failed to fetch dashboard data')
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // ── Loading skeletons ────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl macos-shadow bg-card p-4 space-y-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="rounded-2xl macos-shadow bg-card p-5"><Skeleton className="h-64 w-full" /></div>
          <div className="rounded-2xl macos-shadow bg-card p-5"><Skeleton className="h-64 w-full" /></div>
        </div>
      </div>
    )
  }

  // ── Error state ──────────────────────────────────────────────
  if (error) {
    return (
      <div className="rounded-2xl macos-shadow bg-card p-6 text-center space-y-3">
        <AlertTriangle className="size-8 text-macos-red mx-auto" strokeWidth={1.5} />
        <p className="text-[13px] font-semibold text-macos-red">Failed to load dashboard</p>
        <p className="text-[11px] text-muted-foreground">{error}</p>
        <Button variant="secondary" onClick={fetchDashboard} className="rounded-lg text-[13px]">
          <RefreshCw className="size-4 mr-2" strokeWidth={1.5} /> Retry
        </Button>
      </div>
    )
  }

  const stats = [
    {
      label: "Today's Sales",
      value: formatCurrency(data?.todaySales ?? 0),
      change: '+12.5%',
      up: true,
      icon: DollarSign,
      iconColor: 'text-macos-green',
      bgColor: 'bg-macos-green/10',
    },
    {
      label: 'Monthly Revenue',
      value: formatCurrency(data?.monthlyRevenue ?? 0),
      change: '+8.2%',
      up: true,
      icon: TrendingUp,
      iconColor: 'text-macos-blue',
      bgColor: 'bg-macos-blue/10',
    },
    {
      label: 'Active Customers',
      value: (data?.activeCustomers ?? 0).toLocaleString(),
      change: '+3.1%',
      up: true,
      icon: Users,
      iconColor: 'text-macos-purple',
      bgColor: 'bg-macos-purple/10',
    },
    {
      label: 'Inventory Value',
      value: formatCurrency(data?.inventoryValue ?? 0),
      change: '-1.4%',
      up: false,
      icon: Package,
      iconColor: 'text-macos-orange',
      bgColor: 'bg-macos-orange/10',
    },
  ]

  const quickActions = [
    { label: 'Book Catalog', icon: BookOpen, module: 'book-catalog', color: 'text-macos-green bg-macos-green/10' },
    { label: 'Retail POS', icon: ShoppingCart, module: 'retail-pos', color: 'text-macos-blue bg-macos-blue/10' },
    { label: 'Wholesale', icon: Truck, module: 'wholesale', color: 'text-macos-orange bg-macos-orange/10' },
    { label: 'Authors', icon: PenTool, module: 'authors', color: 'text-macos-purple bg-macos-purple/10' },
    { label: 'Publishers', icon: Building2, module: 'publishers', color: 'text-macos-red bg-macos-red/10' },
    { label: 'Stationery', icon: PencilRuler, module: 'stationery', color: 'text-macos-teal bg-macos-teal/10' },
    { label: 'Inventory', icon: Warehouse, module: 'inventory', color: 'text-macos-orange bg-macos-orange/10' },
    { label: 'Schools', icon: GraduationCap, module: 'school-supply', color: 'text-macos-pink bg-macos-pink/10' },
  ]

  return (
    <div className="space-y-4">
      {/* ── Stats Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rounded-2xl macos-shadow bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                  {stat.label}
                </span>
                <div className={`size-8 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`size-4 ${stat.iconColor}`} strokeWidth={1.5} />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
              <div className="mt-1.5 flex items-center gap-1">
                {stat.up ? (
                  <ArrowUpRight className="size-3 text-macos-green" strokeWidth={2} />
                ) : (
                  <ArrowDownRight className="size-3 text-macos-red" strokeWidth={2} />
                )}
                <span className={`text-[11px] font-semibold ${stat.up ? 'text-macos-green' : 'text-macos-red'}`}>
                  {stat.change}
                </span>
                <span className="text-[11px] text-muted-foreground">vs last month</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Charts Row ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Revenue Trend */}
        <div className="rounded-2xl macos-shadow bg-card p-5">
          <div className="mb-4">
            <h3 className="text-[13px] font-semibold tracking-tight">Revenue Trend</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Monthly revenue over the past year</p>
          </div>
          <ChartContainer config={revenueChartConfig} className="h-56 w-full">
            <AreaChart data={monthlyRevenueData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#007AFF" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#007AFF" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} tick={{ fill: '#86868B' }} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} tick={{ fill: '#86868B' }} tickFormatter={(v: number) => `$${v / 1000}k`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="revenue" stroke="#007AFF" fill="url(#fillRevenue)" strokeWidth={2} />
            </AreaChart>
          </ChartContainer>
        </div>

        {/* Sales by Category */}
        <div className="rounded-2xl macos-shadow bg-card p-5">
          <div className="mb-4">
            <h3 className="text-[13px] font-semibold tracking-tight">Sales by Category</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Revenue breakdown by product type</p>
          </div>
          <ChartContainer config={categoryChartConfig} className="h-56 w-full">
            <BarChart data={salesByCategoryData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="category" tickLine={false} axisLine={false} fontSize={11} tick={{ fill: '#86868B' }} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} tick={{ fill: '#86868B' }} tickFormatter={(v: number) => `$${v / 1000}k`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="sales" radius={[6, 6, 0, 0]}>
                {salesByCategoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </div>

      {/* ── Top Selling + Recent Transactions ────────────────── */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Top Selling Books */}
        <div className="rounded-2xl macos-shadow bg-card p-5">
          <div className="mb-3">
            <h3 className="text-[13px] font-semibold tracking-tight">Top Selling Books</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">This month&apos;s best performers</p>
          </div>
          {data && data.topSellingBooks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">#</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Title</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Author</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Sold</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topSellingBooks.map((book, idx) => (
                  <TableRow key={book.bookId} className="hover:bg-secondary/50">
                    <TableCell className="text-[13px] text-muted-foreground font-medium">{idx + 1}</TableCell>
                    <TableCell className="text-[13px] font-medium max-w-[160px] truncate">{book.title}</TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">{book.author}</TableCell>
                    <TableCell className="text-[13px] text-right">
                      <Badge className="rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 bg-macos-green/10 text-macos-green">
                        {book.totalSold}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center py-8 text-[13px] text-muted-foreground">
              No sales data yet
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="rounded-2xl macos-shadow bg-card p-5">
          <div className="mb-3">
            <h3 className="text-[13px] font-semibold tracking-tight">Recent Transactions</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Latest sales activity</p>
          </div>
          {data && data.recentSales.length > 0 ? (
            <div className="space-y-0 max-h-72 overflow-y-auto custom-scrollbar">
              {data.recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0">
                  <div className="size-8 rounded-lg bg-macos-blue/10 flex items-center justify-center shrink-0">
                    <DollarSign className="size-4 text-macos-blue" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">
                      {sale.customer?.name || 'Walk-in Customer'}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {sale.branch?.name || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-semibold tracking-tight">{formatCurrency(sale.total)}</p>
                    <div className="flex items-center justify-end gap-1">
                      <Badge className={`rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 ${
                        sale.paymentStatus === 'paid'
                          ? 'bg-macos-green/10 text-macos-green'
                          : 'bg-macos-orange/10 text-macos-orange'
                      }`}>
                        {sale.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-[13px] text-muted-foreground">
              No transactions yet
            </div>
          )}
        </div>
      </div>

      {/* ── AI Insights ─────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Brain className="size-4 text-macos-purple" strokeWidth={1.5} />
          <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">AI Insights</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Sales Forecast */}
          <div className="rounded-2xl macos-shadow bg-macos-blue/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="size-6 rounded-lg bg-macos-blue/10 flex items-center justify-center">
                <TrendingUp className="size-3.5 text-macos-blue" strokeWidth={2} />
              </div>
              <span className="text-[11px] font-semibold text-macos-blue">Sales Forecast</span>
            </div>
            <p className="text-2xl font-bold tracking-tight text-macos-blue">
              {formatCurrency(Math.round((data?.monthlyRevenue ?? 78000) * 1.12))}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">Predicted next month revenue</p>
            <div className="mt-2 flex items-center gap-1">
              <ArrowUpRight className="size-3 text-macos-green" strokeWidth={2} />
              <span className="text-[11px] font-semibold text-macos-green">+12% projected</span>
            </div>
            <div className="mt-2.5 h-1.5 rounded-full bg-macos-blue/10 overflow-hidden">
              <div className="h-full rounded-full bg-macos-blue w-[78%]" />
            </div>
          </div>

          {/* Inventory Alert */}
          <div className="rounded-2xl macos-shadow bg-macos-orange/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="size-6 rounded-lg bg-macos-orange/10 flex items-center justify-center">
                <AlertTriangle className="size-3.5 text-macos-orange" strokeWidth={2} />
              </div>
              <span className="text-[11px] font-semibold text-macos-orange">Inventory Alert</span>
            </div>
            <p className="text-2xl font-bold tracking-tight text-macos-orange">
              {data?.lowStockCount ?? 0}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">Items below reorder level</p>
            <div className="mt-2 flex items-center gap-1">
              {(data?.lowStockCount ?? 0) > 5 ? (
                <>
                  <AlertTriangle className="size-3 text-macos-orange" strokeWidth={2} />
                  <span className="text-[11px] font-semibold text-macos-orange">Action needed</span>
                </>
              ) : (
                <>
                  <Package className="size-3 text-macos-green" strokeWidth={2} />
                  <span className="text-[11px] font-semibold text-macos-green">Healthy levels</span>
                </>
              )}
            </div>
          </div>

          {/* Demand Prediction */}
          <div className="rounded-2xl macos-shadow bg-macos-purple/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="size-6 rounded-lg bg-macos-purple/10 flex items-center justify-center">
                <GraduationCap className="size-3.5 text-macos-purple" strokeWidth={2} />
              </div>
              <span className="text-[11px] font-semibold text-macos-purple">Demand Prediction</span>
            </div>
            <p className="text-2xl font-bold tracking-tight text-macos-purple">High</p>
            <p className="text-[11px] text-muted-foreground mt-1">Academic season demand</p>
            <div className="mt-2 flex items-center gap-1">
              <Activity className="size-3 text-macos-purple" strokeWidth={2} />
              <span className="text-[11px] font-semibold text-macos-purple">Back-to-school surge expected</span>
            </div>
            <div className="mt-2.5 flex gap-1">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map((m, i) => (
                <div
                  key={m}
                  className="flex-1 h-1.5 rounded-full"
                  style={{
                    backgroundColor: i === 7 || i === 8 ? '#AF52DE' : 'rgba(175, 82, 222, 0.15)',
                  }}
                />
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">Peak: Aug–Sep</p>
          </div>
        </div>
      </div>

      {/* ── Branch Performance ───────────────────────────────── */}
      <div className="rounded-2xl macos-shadow bg-card p-5">
        <div className="mb-4">
          <h3 className="text-[13px] font-semibold tracking-tight">Branch Performance</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Revenue comparison across locations</p>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {branchPerformanceData.map((branch, idx) => (
            <div key={branch.branch} className="rounded-xl bg-secondary/50 p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className={`size-6 rounded-lg flex items-center justify-center ${
                  idx === 0 ? 'bg-macos-green/10' :
                  idx === 1 ? 'bg-macos-blue/10' :
                  idx === 2 ? 'bg-macos-purple/10' :
                  'bg-macos-orange/10'
                }`}>
                  <Building2 className={`size-3.5 ${
                    idx === 0 ? 'text-macos-green' :
                    idx === 1 ? 'text-macos-blue' :
                    idx === 2 ? 'text-macos-purple' :
                    'text-macos-orange'
                  }`} strokeWidth={1.5} />
                </div>
                <span className="text-[13px] font-semibold">{branch.branch}</span>
              </div>
              <p className="text-lg font-bold tracking-tight">{formatCurrency(branch.revenue)}</p>
              <p className="text-[11px] text-muted-foreground">{branch.orders} orders</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick Actions ────────────────────────────────────── */}
      <div className="rounded-2xl macos-shadow bg-card p-4">
        <div className="mb-3">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Quick Actions</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.label}
                onClick={() => setActiveModule(action.module)}
                className="macos-pill flex items-center gap-1.5 bg-secondary/80 px-3 py-1.5 text-[13px] font-medium hover:bg-secondary transition-colors"
              >
                <div className={`size-5 rounded-md flex items-center justify-center ${action.color}`}>
                  <Icon className="size-3" strokeWidth={1.5} />
                </div>
                {action.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
