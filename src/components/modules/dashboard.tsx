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
  BarChart3,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  { category: 'Books', sales: 62400 },
  { category: 'Stationery', sales: 38200 },
  { category: 'School Supplies', sales: 28600 },
]

const branchPerformanceData = [
  { branch: 'Downtown', revenue: 34500 },
  { branch: 'Mall', revenue: 28200 },
  { branch: 'Online', revenue: 22800 },
  { branch: 'University', revenue: 18500 },
]

const revenueChartConfig: ChartConfig = {
  revenue: { label: 'Revenue', color: '#10b981' },
}

const categoryChartConfig: ChartConfig = {
  sales: { label: 'Sales', color: '#14b8a6' },
}

const branchChartConfig: ChartConfig = {
  revenue: { label: 'Revenue', color: '#059669' },
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

  // ── Loading skeletons ────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card><CardContent className="p-4"><Skeleton className="h-64 w-full" /></CardContent></Card>
          <Card><CardContent className="p-4"><Skeleton className="h-64 w-full" /></CardContent></Card>
        </div>
      </div>
    )
  }

  // ── Error state ──────────────────────────────────────────────
  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6 text-center space-y-3">
          <AlertTriangle className="size-8 text-destructive mx-auto" />
          <p className="text-destructive font-medium">Failed to load dashboard</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={fetchDashboard}>
            <RefreshCw className="size-4 mr-2" /> Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const stats = [
    {
      label: "Today's Sales",
      value: formatCurrency(data?.todaySales ?? 0),
      change: '+12.5%',
      up: true,
      icon: DollarSign,
    },
    {
      label: 'Monthly Revenue',
      value: formatCurrency(data?.monthlyRevenue ?? 0),
      change: '+8.2%',
      up: true,
      icon: TrendingUp,
    },
    {
      label: 'Active Customers',
      value: (data?.activeCustomers ?? 0).toLocaleString(),
      change: '+3.1%',
      up: true,
      icon: Users,
    },
    {
      label: 'Inventory Value',
      value: formatCurrency(data?.inventoryValue ?? 0),
      change: '-1.4%',
      up: false,
      icon: Package,
    },
  ]

  const quickActions = [
    { label: 'Book Catalog', icon: BookOpen, module: 'book-catalog', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
    { label: 'Retail POS', icon: ShoppingCart, module: 'retail-pos', color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/30' },
    { label: 'Wholesale', icon: Truck, module: 'wholesale', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' },
    { label: 'Authors', icon: PenTool, module: 'authors', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/30' },
    { label: 'Publishers', icon: Building2, module: 'publishers', color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/30' },
    { label: 'Stationery', icon: PencilRuler, module: 'stationery', color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/30' },
    { label: 'Inventory', icon: Warehouse, module: 'inventory', color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/30' },
    { label: 'Schools', icon: GraduationCap, module: 'school-supply', color: 'text-pink-600 bg-pink-50 dark:bg-pink-950/30' },
  ]

  return (
    <div className="space-y-6">
      {/* ── Stats Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                  </div>
                  <div className="rounded-lg bg-emerald-500/10 p-2.5">
                    <Icon className="size-5 text-emerald-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs">
                  {stat.up ? (
                    <ArrowUpRight className="size-3 text-emerald-600" />
                  ) : (
                    <ArrowDownRight className="size-3 text-red-500" />
                  )}
                  <span className={stat.up ? 'text-emerald-600 font-medium' : 'text-red-500 font-medium'}>
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground">vs last month</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* ── Charts Row ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Revenue Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over the past year</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-64 w-full">
              <AreaChart data={monthlyRevenueData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v: number) => `$${v / 1000}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#fillRevenue)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sales by Category</CardTitle>
            <CardDescription>Revenue breakdown by product type</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={categoryChartConfig} className="h-64 w-full">
              <BarChart data={salesByCategoryData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="category" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v: number) => `$${v / 1000}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="sales" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Top Selling + Recent Transactions ────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Top Selling Books */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Selling Books</CardTitle>
            <CardDescription>This month&apos;s best performers</CardDescription>
          </CardHeader>
          <CardContent>
            {data && data.topSellingBooks.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead className="text-right">Sold</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topSellingBooks.map((book) => (
                    <TableRow key={book.bookId}>
                      <TableCell className="font-medium max-w-[160px] truncate">{book.title}</TableCell>
                      <TableCell className="text-muted-foreground">{book.author}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                          {book.totalSold}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                No sales data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Transactions</CardTitle>
            <CardDescription>Latest sales activity</CardDescription>
          </CardHeader>
          <CardContent>
            {data && data.recentSales.length > 0 ? (
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {data.recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-medium truncate">
                        {sale.customer?.name || 'Walk-in Customer'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sale.invoiceNumber} · {sale.branch?.name || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="font-semibold">{formatCurrency(sale.total)}</p>
                      <Badge
                        variant={sale.paymentStatus === 'paid' ? 'secondary' : 'outline'}
                        className="text-[10px] h-4"
                      >
                        {sale.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                No transactions yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── AI Widgets ───────────────────────────────────────── */}
      <div>
        <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
          <Brain className="size-4 text-emerald-600" />
          AI Insights
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Sales Forecast */}
          <Card className="border-emerald-200 dark:border-emerald-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="size-4 text-emerald-600" />
                Sales Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                {formatCurrency(Math.round((data?.monthlyRevenue ?? 78000) * 1.12))}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Predicted next month revenue</p>
              <div className="mt-2 flex items-center gap-1 text-xs">
                <ArrowUpRight className="size-3 text-emerald-600" />
                <span className="text-emerald-600 font-medium">+12% projected</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500 w-[78%]" />
              </div>
            </CardContent>
          </Card>

          {/* Inventory Alert */}
          <Card className="border-amber-200 dark:border-amber-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-600" />
                Inventory Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                {data?.lowStockCount ?? 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Items below reorder level</p>
              <div className="mt-2 flex items-center gap-1 text-xs">
                {(data?.lowStockCount ?? 0) > 5 ? (
                  <AlertTriangle className="size-3 text-amber-600" />
                ) : (
                  <Package className="size-3 text-emerald-600" />
                )}
                <span className={((data?.lowStockCount ?? 0) > 5) ? 'text-amber-600 font-medium' : 'text-emerald-600 font-medium'}>
                  {(data?.lowStockCount ?? 0) > 5 ? 'Action needed' : 'Healthy levels'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Demand Prediction */}
          <Card className="border-teal-200 dark:border-teal-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <GraduationCap className="size-4 text-teal-600" />
                Demand Prediction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-teal-700 dark:text-teal-400">High</p>
              <p className="text-xs text-muted-foreground mt-1">Academic season demand</p>
              <div className="mt-2 flex items-center gap-1 text-xs">
                <Activity className="size-3 text-teal-600" />
                <span className="text-teal-600 font-medium">Back-to-school surge expected</span>
              </div>
              <div className="mt-2 flex gap-1">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map((m, i) => (
                  <div
                    key={m}
                    className="flex-1 h-1.5 rounded-full"
                    style={{
                      backgroundColor: i === 7 || i === 8 ? '#14b8a6' : '#e5e7eb',
                    }}
                  />
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Peak: Aug–Sep</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Branch Performance ───────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Branch Performance</CardTitle>
          <CardDescription>Revenue comparison across locations</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={branchChartConfig} className="h-48 w-full">
            <BarChart layout="vertical" data={branchPerformanceData} margin={{ top: 5, right: 20, left: 60, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v: number) => `$${v / 1000}k`} />
              <YAxis type="category" dataKey="branch" tickLine={false} axisLine={false} fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="revenue" fill="#059669" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* ── Quick Actions ────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Quick Actions</CardTitle>
          <CardDescription>Navigate to key modules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.label}
                  onClick={() => setActiveModule(action.module)}
                  className="flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs transition-colors hover:bg-muted/50"
                >
                  <div className={`rounded-md p-1.5 ${action.color}`}>
                    <Icon className="size-4" />
                  </div>
                  <span className="text-center leading-tight">{action.label}</span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
