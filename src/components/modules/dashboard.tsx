'use client'

import React, { useState, useEffect, useMemo } from 'react'
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
  BarChart3,
  Clock,
  Sparkles,
  ChevronRight,
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
  ChartLegend,
  ChartLegendContent,
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
  ResponsiveContainer,
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
  trends: {
    todaySales: number
    monthlyRevenue: number
    activeCustomers: number
    inventoryValue: number
  }
  monthlyRevenueData: { month: string; revenue: number }[]
  salesByCategoryData: { category: string; sales: number; fill: string }[]
  branchPerformanceData: { branch: string; revenue: number; orders: number }[]
}

const revenueChartConfig: ChartConfig = {
  revenue: { label: 'Revenue', color: 'var(--color-macos-blue)' },
}

const categoryChartConfig: ChartConfig = {
  sales: { label: 'Sales', color: 'var(--color-macos-blue)' },
}

// ── Component ────────────────────────────────────────────────────
export default function DashboardModule() {
  const setActiveModule = useAppStore((s) => s.setActiveModule)
  const authUser = useAppStore((s) => s.authUser)
  const isViewOnly = authUser?.isViewOnly ?? false

  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

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

  // ── Stat card data ───────────────────────────────────────────
  const formatTrend = (val: number) => `${val >= 0 ? '+' : ''}${val}%`

  const stats = useMemo(() => [
    {
      label: "Today's Sales",
      value: formatCurrency(data?.todaySales ?? 0),
      change: formatTrend(data?.trends?.todaySales ?? 0),
      up: (data?.trends?.todaySales ?? 0) >= 0,
      icon: DollarSign,
      iconColor: 'text-macos-green',
      bgColor: 'bg-macos-green/10',
    },
    {
      label: 'Monthly Revenue',
      value: formatCurrency(data?.monthlyRevenue ?? 0),
      change: formatTrend(data?.trends?.monthlyRevenue ?? 0),
      up: (data?.trends?.monthlyRevenue ?? 0) >= 0,
      icon: TrendingUp,
      iconColor: 'text-macos-blue',
      bgColor: 'bg-macos-blue/10',
    },
    {
      label: 'Active Customers',
      value: (data?.activeCustomers ?? 0).toLocaleString(),
      change: formatTrend(data?.trends?.activeCustomers ?? 0),
      up: (data?.trends?.activeCustomers ?? 0) >= 0,
      icon: Users,
      iconColor: 'text-macos-purple',
      bgColor: 'bg-macos-purple/10',
    },
    {
      label: 'Inventory Value',
      value: formatCurrency(data?.inventoryValue ?? 0),
      change: formatTrend(data?.trends?.inventoryValue ?? 0),
      up: (data?.trends?.inventoryValue ?? 0) >= 0,
      icon: Package,
      iconColor: 'text-macos-orange',
      bgColor: 'bg-macos-orange/10',
    },
  ], [data])

  // ── Quick actions data ───────────────────────────────────────
  const quickActions = useMemo(() => [
    { label: 'Book Catalog', icon: BookOpen, module: 'book-catalog', color: 'text-macos-green bg-macos-green/10' },
    { label: 'Retail POS', icon: ShoppingCart, module: 'retail-pos', color: 'text-macos-blue bg-macos-blue/10' },
    { label: 'Wholesale', icon: Truck, module: 'wholesale', color: 'text-macos-orange bg-macos-orange/10' },
    { label: 'Authors', icon: PenTool, module: 'authors', color: 'text-macos-purple bg-macos-purple/10' },
    { label: 'Publishers', icon: Building2, module: 'publishers', color: 'text-macos-red bg-macos-red/10' },
    { label: 'Stationery', icon: PencilRuler, module: 'stationery', color: 'text-macos-teal bg-macos-teal/10' },
    { label: 'Inventory', icon: Warehouse, module: 'inventory', color: 'text-macos-orange bg-macos-orange/10' },
    { label: 'Schools', icon: GraduationCap, module: 'school-supply', color: 'text-macos-pink bg-macos-pink/10' },
  ], [])

  // ── Secondary stat data ──────────────────────────────────────
  const secondaryStats = useMemo(() => [
    {
      label: 'Wholesale Orders',
      value: data?.wholesaleOrdersCount ?? 0,
      icon: Truck,
      color: 'text-gg-sunset',
      bg: 'bg-gg-sunset/10',
    },
    {
      label: 'Online Orders',
      value: data?.onlineOrdersCount ?? 0,
      icon: ShoppingCart,
      color: 'text-macos-blue',
      bg: 'bg-macos-blue/10',
    },
    {
      label: 'Pending POs',
      value: data?.pendingPOsCount ?? 0,
      icon: Clock,
      color: 'text-gg-bridge',
      bg: 'bg-gg-bridge/10',
    },
    {
      label: 'Low Stock Items',
      value: data?.lowStockCount ?? 0,
      icon: AlertTriangle,
      color: 'text-macos-red',
      bg: 'bg-macos-red/10',
    },
  ], [data])

  // ── Loading skeletons ────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-5">
        {/* Page header skeleton */}
        <div className="macos-page-header">
          <div>
            <Skeleton className="h-7 w-40 mb-1" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>

        {/* Stat cards skeleton */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="macos-stat macos-shadow-card">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="size-9 rounded-xl" />
              </div>
              <Skeleton className="h-7 w-28 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>

        {/* Charts skeleton */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="macos-card macos-shadow-card p-5">
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-48 mb-4" />
            <Skeleton className="h-56 w-full" />
          </div>
          <div className="macos-card macos-shadow-card p-5">
            <Skeleton className="h-4 w-36 mb-1" />
            <Skeleton className="h-3 w-44 mb-4" />
            <Skeleton className="h-56 w-full" />
          </div>
        </div>

        {/* Tables skeleton */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="macos-card macos-shadow-card p-5">
            <Skeleton className="h-4 w-36 mb-4" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <Skeleton className="size-8 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-3.5 w-32 mb-1.5" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-5 w-12 rounded-md" />
              </div>
            ))}
          </div>
          <div className="macos-card macos-shadow-card p-5">
            <Skeleton className="h-4 w-40 mb-4" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <Skeleton className="size-8 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-3.5 w-28 mb-1.5" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-5 w-16 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Error state ──────────────────────────────────────────────
  if (error) {
    return (
      <div className="macos-empty py-16">
        <div className="size-14 rounded-2xl bg-macos-red/10 flex items-center justify-center mb-4">
          <AlertTriangle className="size-7 text-macos-red" strokeWidth={1.5} />
        </div>
        <h3 className="text-[15px] font-semibold tracking-tight mb-1">Failed to Load Dashboard</h3>
        <p className="text-[13px] text-muted-foreground mb-4 max-w-xs">{error}</p>
        <Button variant="secondary" onClick={fetchDashboard} className="rounded-lg text-[13px]">
          <RefreshCw className="size-3.5 mr-1.5" strokeWidth={1.5} />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="macos-page-header">
        <div>
          <h1 className="macos-page-title">Dashboard</h1>
          <p className="macos-page-subtitle">Overview of your bookstore performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchDashboard}
            className="rounded-lg text-[13px] text-muted-foreground"
          >
            <RefreshCw className="size-3.5 mr-1.5" strokeWidth={1.5} />
            Refresh
          </Button>
          {!isViewOnly && (
            <Button
              size="sm"
              className="rounded-lg text-[13px]"
              onClick={() => setActiveModule('retail-pos')}
            >
              <ShoppingCart className="size-3.5 mr-1.5" strokeWidth={1.5} />
              New Sale
            </Button>
          )}
        </div>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="macos-stat macos-shadow-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  {stat.label}
                </span>
                <div className={`size-9 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`size-4 ${stat.iconColor}`} strokeWidth={1.5} />
                </div>
              </div>
              <p className="text-[24px] font-bold tracking-[-0.03em] leading-tight">{stat.value}</p>
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

      {/* ── Secondary Stats Row ──────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {secondaryStats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="macos-card macos-shadow-card p-3.5 flex items-center gap-3">
              <div className={`size-8 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`size-3.5 ${stat.color}`} strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground truncate">{stat.label}</p>
                <p className="text-[15px] font-bold tracking-[-0.02em]">{stat.value.toLocaleString()}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Charts Row ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Revenue Trend */}
        <div className="macos-card macos-shadow-card p-5">
          <div className="macos-section-header">
            <div>
              <h3 className="macos-section-title">Revenue Trend</h3>
              <p className="macos-section-desc">Monthly revenue over the past year</p>
            </div>
            <div className="macos-filter-bar">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  className={`macos-filter-item ${timeRange === range ? 'macos-filter-item-active' : ''}`}
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <ChartContainer config={revenueChartConfig} className="h-56 w-full">
            <AreaChart data={data?.monthlyRevenueData ?? []} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-macos-blue)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--color-macos-blue)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} tick={{ fill: '#86868B' }} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} tick={{ fill: '#86868B' }} tickFormatter={(v: number) => `$${v / 1000}k`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="revenue" stroke="var(--color-macos-blue)" fill="url(#fillRevenue)" strokeWidth={2} />
            </AreaChart>
          </ChartContainer>
        </div>

        {/* Sales by Category */}
        <div className="macos-card macos-shadow-card p-5">
          <div className="macos-section-header">
            <div>
              <h3 className="macos-section-title">Sales by Category</h3>
              <p className="macos-section-desc">Revenue breakdown by product type</p>
            </div>
          </div>
          <ChartContainer config={categoryChartConfig} className="h-56 w-full">
            <BarChart data={data?.salesByCategoryData ?? []} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="category" tickLine={false} axisLine={false} fontSize={11} tick={{ fill: '#86868B' }} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} tick={{ fill: '#86868B' }} tickFormatter={(v: number) => `$${v / 1000}k`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent nameKey="category" />} />
              <Bar dataKey="sales" radius={[6, 6, 0, 0]}>
                {(data?.salesByCategoryData ?? []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </div>

      {/* ── Top Selling + Recent Transactions ────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Top Selling Books */}
        <div className="macos-card macos-shadow-card p-5">
          <div className="macos-section-header">
            <div>
              <h3 className="macos-section-title">Top Selling Books</h3>
              <p className="macos-section-desc">This month&apos;s best performers</p>
            </div>
            <BookOpen className="size-4 text-muted-foreground" strokeWidth={1.5} />
          </div>
          {data && data.topSellingBooks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-b hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground h-8">#</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground h-8">Title</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground h-8">Author</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground h-8 text-right">Sold</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topSellingBooks.map((book, idx) => (
                  <TableRow key={book.bookId} className="macos-table-row">
                    <TableCell className="text-[13px] text-muted-foreground font-medium">{idx + 1}</TableCell>
                    <TableCell className="text-[13px] font-medium max-w-[160px] truncate">{book.title}</TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">{book.author}</TableCell>
                    <TableCell className="text-[13px] text-right">
                      <Badge className="rounded-[6px] text-[10px] font-semibold tracking-wide px-2 py-0.5 bg-macos-green/10 text-macos-green border-0">
                        {book.totalSold}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="macos-empty py-12">
              <div className="size-10 rounded-xl bg-secondary/60 flex items-center justify-center mb-3">
                <BookOpen className="size-5 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <p className="text-[13px] font-medium text-muted-foreground">No sales data yet</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Start selling to see top performers</p>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="macos-card macos-shadow-card p-5">
          <div className="macos-section-header">
            <div>
              <h3 className="macos-section-title">Recent Transactions</h3>
              <p className="macos-section-desc">Latest sales activity</p>
            </div>
            <Clock className="size-4 text-muted-foreground" strokeWidth={1.5} />
          </div>
          {data && data.recentSales.length > 0 ? (
            <div className="space-y-0 max-h-72 overflow-y-auto custom-scrollbar">
              {data.recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0 macos-table-row rounded-lg px-1">
                  <div className="size-8 rounded-lg bg-macos-blue/10 flex items-center justify-center shrink-0">
                    <DollarSign className="size-4 text-macos-blue" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">
                      {sale.customer?.name || 'Walk-in Customer'}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {sale.branch?.name || 'N/A'} · {formatTime(sale.createdAt)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-semibold tracking-[-0.02em]">{formatCurrency(sale.total)}</p>
                    <div className="flex items-center justify-end gap-1">
                      <Badge className={`rounded-[6px] text-[10px] font-semibold tracking-wide px-2 py-0.5 border-0 ${
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
            <div className="macos-empty py-12">
              <div className="size-10 rounded-xl bg-secondary/60 flex items-center justify-center mb-3">
                <DollarSign className="size-5 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <p className="text-[13px] font-medium text-muted-foreground">No transactions yet</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Sales will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* ── AI Insights ─────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="size-6 rounded-lg bg-gg-bridge/10 flex items-center justify-center">
            <Brain className="size-3.5 text-gg-bridge" strokeWidth={1.5} />
          </div>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
            AI Insights
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Sales Forecast */}
          <div className="macos-card macos-shadow-card p-4 bg-macos-blue/[0.03]">
            <div className="flex items-center gap-2 mb-3">
              <div className="size-7 rounded-lg bg-macos-blue/10 flex items-center justify-center">
                <TrendingUp className="size-3.5 text-macos-blue" strokeWidth={2} />
              </div>
              <span className="text-[11px] font-semibold text-macos-blue">Sales Forecast</span>
            </div>
            <p className="text-[24px] font-bold tracking-[-0.03em] text-macos-blue">
              {formatCurrency(Math.round((data?.monthlyRevenue ?? 78000) * 1.12))}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">Predicted next month revenue</p>
            <div className="mt-2.5 flex items-center gap-1">
              <ArrowUpRight className="size-3 text-macos-green" strokeWidth={2} />
              <span className="text-[11px] font-semibold text-macos-green">+12% projected</span>
            </div>
            <div className="mt-2.5 h-1.5 rounded-full bg-macos-blue/10 overflow-hidden">
              <div className="h-full rounded-full bg-macos-blue w-[78%]" />
            </div>
          </div>

          {/* Inventory Alert */}
          <div className="macos-card macos-shadow-card p-4 bg-macos-orange/[0.03]">
            <div className="flex items-center gap-2 mb-3">
              <div className="size-7 rounded-lg bg-macos-orange/10 flex items-center justify-center">
                <AlertTriangle className="size-3.5 text-macos-orange" strokeWidth={2} />
              </div>
              <span className="text-[11px] font-semibold text-macos-orange">Inventory Alert</span>
            </div>
            <p className="text-[24px] font-bold tracking-[-0.03em] text-macos-orange">
              {data?.lowStockCount ?? 0}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">Items below reorder level</p>
            <div className="mt-2.5 flex items-center gap-1">
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
            <div className="mt-2.5 h-1.5 rounded-full bg-macos-orange/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-macos-orange"
                style={{ width: `${Math.min((data?.lowStockCount ?? 0) / 20 * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Demand Prediction */}
          <div className="macos-card macos-shadow-card p-4 bg-macos-purple/[0.03]">
            <div className="flex items-center gap-2 mb-3">
              <div className="size-7 rounded-lg bg-macos-purple/10 flex items-center justify-center">
                <GraduationCap className="size-3.5 text-macos-purple" strokeWidth={2} />
              </div>
              <span className="text-[11px] font-semibold text-macos-purple">Demand Prediction</span>
            </div>
            <p className="text-[24px] font-bold tracking-[-0.03em] text-macos-purple">High</p>
            <p className="text-[11px] text-muted-foreground mt-1">Academic season demand</p>
            <div className="mt-2.5 flex items-center gap-1">
              <Activity className="size-3 text-macos-purple" strokeWidth={2} />
              <span className="text-[11px] font-semibold text-macos-purple">Back-to-school surge expected</span>
            </div>
            <div className="mt-2.5 flex gap-1">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map((m, i) => (
                <div
                  key={m}
                  className="flex-1 h-1.5 rounded-full"
                  style={{
                    backgroundColor: i === 7 || i === 8 ? 'var(--color-macos-purple)' : 'rgba(175, 82, 222, 0.15)',
                  }}
                />
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">Peak: Aug–Sep</p>
          </div>
        </div>
      </div>

      {/* ── Branch Performance ───────────────────────────────── */}
      <div className="macos-card macos-shadow-card p-5">
        <div className="macos-section-header">
          <div>
            <h3 className="macos-section-title">Branch Performance</h3>
            <p className="macos-section-desc">Revenue comparison across locations</p>
          </div>
          <BarChart3 className="size-4 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {(data?.branchPerformanceData ?? []).map((branch, idx) => {
            const colorMap = [
              { text: 'text-macos-green', bg: 'bg-macos-green/10' },
              { text: 'text-macos-blue', bg: 'bg-macos-blue/10' },
              { text: 'text-macos-purple', bg: 'bg-macos-purple/10' },
              { text: 'text-macos-orange', bg: 'bg-macos-orange/10' },
            ]
            const color = colorMap[idx % colorMap.length]
            return (
              <div key={branch.branch} className="macos-card macos-shadow p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`size-7 rounded-lg flex items-center justify-center ${color.bg}`}>
                    <Building2 className={`size-3.5 ${color.text}`} strokeWidth={1.5} />
                  </div>
                  <span className="text-[13px] font-semibold">{branch.branch}</span>
                </div>
                <p className="text-[18px] font-bold tracking-[-0.02em]">{formatCurrency(branch.revenue)}</p>
                <p className="text-[11px] text-muted-foreground">{branch.orders} orders</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Quick Actions ────────────────────────────────────── */}
      <div className="macos-card macos-shadow-card p-4">
        <div className="macos-section-header mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-3.5 text-gg-golden" strokeWidth={1.5} />
            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
              Quick Actions
            </span>
          </div>
          <ChevronRight className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.label}
                onClick={() => setActiveModule(action.module)}
                className="macos-pill flex items-center gap-1.5 bg-secondary/80 px-3.5 py-2 text-[13px] font-medium hover:bg-secondary transition-colors"
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
