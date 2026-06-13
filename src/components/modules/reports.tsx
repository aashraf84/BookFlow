'use client'

import * as React from 'react'
import {
  BarChart3,
  Download,
  Calendar,
  DollarSign,
  Package,
  TrendingUp,
  ShoppingCart,
  BookOpen,
  Truck,
  GraduationCap,
  Users,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { useAppStore } from '@/store/app-store'

// Report categories
const reportCategories = [
  { id: 'sales', label: 'Sales', icon: DollarSign },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'publisher', label: 'Publisher', icon: BookOpen },
  { id: 'author', label: 'Author', icon: Users },
  { id: 'wholesale', label: 'Wholesale', icon: Truck },
  { id: 'school', label: 'School', icon: GraduationCap },
  { id: 'financial', label: 'Financial', icon: TrendingUp },
] as const

type ReportCategory = typeof reportCategories[number]['id']

// macOS chart colors
const CHART_COLORS = ['#007AFF', '#34C759', '#FF9500', '#AF52DE', '#5AC8FA', '#FF2D55', '#32ADE6']

// Chart configs for recharts shadcn integration
const revenueChartConfig: ChartConfig = {
  revenue: { label: 'Revenue', color: '#007AFF' },
  profit: { label: 'Profit', color: '#34C759' },
}

const stockChartConfig: ChartConfig = {
  inStock: { label: 'In Stock', color: '#007AFF' },
  low: { label: 'Low Stock', color: '#FF9500' },
  out: { label: 'Out of Stock', color: '#FF3B30' },
}

const publisherChartConfig: ChartConfig = {
  revenue: { label: 'Revenue', color: '#007AFF' },
}

const authorChartConfig: ChartConfig = {
  sold: { label: 'Books Sold', color: '#007AFF' },
  royalties: { label: 'Royalties', color: '#34C759' },
}

const financialChartConfig: ChartConfig = {
  income: { label: 'Income', color: '#007AFF' },
  expense: { label: 'Expenses', color: '#FF3B30' },
  net: { label: 'Net Profit', color: '#34C759' },
}

const schoolChartConfig: ChartConfig = {
  value: { label: 'Contract Value', color: '#AF52DE' },
}

const paymentChartConfig: ChartConfig = {
  Cash: { label: 'Cash', color: '#007AFF' },
  Card: { label: 'Card', color: '#34C759' },
  'Bank Transfer': { label: 'Bank Transfer', color: '#FF9500' },
  Wallet: { label: 'Wallet', color: '#AF52DE' },
}

// ============ MOCK DATA ============

const monthlyRevenue = [
  { month: 'Jan', revenue: 42000, orders: 320, profit: 12600 },
  { month: 'Feb', revenue: 38000, orders: 290, profit: 11400 },
  { month: 'Mar', revenue: 55000, orders: 410, profit: 16500 },
  { month: 'Apr', revenue: 48000, orders: 365, profit: 14400 },
  { month: 'May', revenue: 62000, orders: 470, profit: 18600 },
  { month: 'Jun', revenue: 51000, orders: 390, profit: 15300 },
  { month: 'Jul', revenue: 44000, orders: 335, profit: 13200 },
  { month: 'Aug', revenue: 78000, orders: 590, profit: 23400 },
  { month: 'Sep', revenue: 89000, orders: 670, profit: 26700 },
  { month: 'Oct', revenue: 56000, orders: 425, profit: 16800 },
  { month: 'Nov', revenue: 64000, orders: 485, profit: 19200 },
  { month: 'Dec', revenue: 95000, orders: 720, profit: 28500 },
]

const topProducts = [
  { name: 'The Great Adventure', category: 'Fiction', sold: 1240, revenue: 24800 },
  { name: 'Premium Notebook A5', category: 'Stationery', sold: 890, revenue: 8900 },
  { name: 'Math Workbook G5', category: 'Academic', sold: 760, revenue: 11400 },
  { name: 'Color Pencil Set 24pc', category: 'Art', sold: 650, revenue: 9750 },
  { name: 'Science Textbook G8', category: 'Academic', sold: 540, revenue: 16200 },
]

const salesByPayment = [
  { method: 'Cash', value: 45, amount: 280000 },
  { method: 'Card', value: 30, amount: 185000 },
  { method: 'Bank Transfer', value: 15, amount: 95000 },
  { method: 'Wallet', value: 10, amount: 62000 },
]

const stockLevels = [
  { name: 'Fiction', inStock: 2400, low: 120, out: 15 },
  { name: 'Academic', inStock: 1800, low: 340, out: 45 },
  { name: 'Stationery', inStock: 3200, low: 200, out: 30 },
  { name: 'Art Supplies', inStock: 900, low: 150, out: 20 },
  { name: 'Office', inStock: 1500, low: 80, out: 10 },
]

const movingItems = [
  { name: 'Premium Notebook A5', type: 'Fast', sold: 890, stock: 45 },
  { name: 'Math Workbook G5', type: 'Fast', sold: 760, stock: 12 },
  { name: 'Vintage Atlas 1998', type: 'Slow', sold: 5, stock: 120 },
  { name: 'Calligraphy Set Pro', type: 'Slow', sold: 8, stock: 85 },
  { name: 'Encyclopedia Vol.3', type: 'Dead', sold: 0, stock: 200 },
  { name: 'Old Dictionary Ed.5', type: 'Dead', sold: 1, stock: 150 },
]

const publisherData = [
  { name: 'Penguin Random House', titles: 45, revenue: 89000, orders: 340 },
  { name: 'HarperCollins', titles: 32, revenue: 67000, orders: 250 },
  { name: 'Simon & Schuster', titles: 28, revenue: 52000, orders: 190 },
  { name: 'Macmillan', titles: 22, revenue: 41000, orders: 150 },
  { name: 'Oxford University Press', titles: 18, revenue: 38000, orders: 120 },
]

const authorData = [
  { name: 'Sarah Mitchell', books: 8, sold: 3400, royalties: 17000 },
  { name: 'James Walker', books: 5, sold: 2800, royalties: 14000 },
  { name: 'Emily Chen', books: 6, sold: 2200, royalties: 11000 },
  { name: 'Robert Adams', books: 4, sold: 1800, royalties: 9000 },
  { name: 'Lisa Park', books: 3, sold: 1500, royalties: 7500 },
]

const wholesaleData = [
  { name: 'City Books Distributors', orders: 24, total: 45000, status: 'Active' },
  { name: 'Metro Book Supply', orders: 18, total: 32000, status: 'Active' },
  { name: 'National Book Traders', orders: 12, total: 28000, status: 'Active' },
  { name: 'Academic Supplies Co', orders: 8, total: 19000, status: 'Pending' },
]

const schoolContractData = [
  { name: 'Springfield Academy', value: 25000, items: 450, status: 'Active' },
  { name: 'Westside School', value: 18000, items: 320, status: 'Active' },
  { name: "St. Mary's School", value: 15000, items: 280, status: 'Active' },
  { name: 'Greenwood High', value: 12000, items: 210, status: 'Expiring' },
]

const financialSummary = [
  { month: 'Jan', income: 42000, expense: 29400, net: 12600 },
  { month: 'Feb', income: 38000, expense: 26600, net: 11400 },
  { month: 'Mar', income: 55000, expense: 38500, net: 16500 },
  { month: 'Apr', income: 48000, expense: 33600, net: 14400 },
  { month: 'May', income: 62000, expense: 43400, net: 18600 },
  { month: 'Jun', income: 51000, expense: 35700, net: 15300 },
]

const dateRanges = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '12m', label: 'Last 12 months' },
  { value: 'ytd', label: 'Year to date' },
]

// ─── Sub-components ───

function MetricCard({ title, value, change, up, icon: Icon, color }: {
  title: string; value: string; change?: string; up?: boolean
  icon: React.ElementType; color: string
}) {
  return (
    <div className="macos-card macos-shadow-card p-4">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{title}</p>
          <p className="text-[22px] font-bold tracking-tight mt-0.5">{value}</p>
          {change && (
            <div className="flex items-center gap-1 text-[11px] mt-1">
              {up ? <ArrowUpRight className="size-3 text-macos-green" /> : <ArrowDownRight className="size-3 text-macos-red" />}
              <span className={up ? 'text-macos-green font-semibold' : 'text-macos-red font-semibold'}>{change}</span>
            </div>
          )}
        </div>
        <div className={`rounded-lg p-2.5 ${color}`}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  )
}

// ─── Sales Report ───

function SalesReport() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Revenue" value="$682,000" change="+12.5%" up icon={DollarSign} color="bg-macos-blue/10 text-macos-blue" />
        <MetricCard title="Total Orders" value="5,045" change="+8.2%" up icon={ShoppingCart} color="bg-macos-green/10 text-macos-green" />
        <MetricCard title="Avg Order Value" value="$135.18" change="+3.1%" up icon={TrendingUp} color="bg-macos-orange/10 text-macos-orange" />
        <MetricCard title="Profit Margin" value="30.2%" change="-1.4%" up={false} icon={BarChart3} color="bg-macos-red/10 text-macos-red" />
      </div>

      {/* Revenue & Profit Area Chart */}
      <div className="macos-card macos-shadow-card p-5">
        <div className="macos-section-header">
          <div>
            <h3 className="macos-section-title">Monthly Revenue & Profit</h3>
            <p className="macos-section-desc">Revenue and profit trends over the past 12 months</p>
          </div>
          <Badge className="rounded-md bg-macos-blue/10 text-macos-blue text-[10px] font-semibold tracking-wider px-2 py-0.5">
            <Activity className="size-3 mr-1" />
            LIVE
          </Badge>
        </div>
        <ChartContainer config={revenueChartConfig} className="h-72 w-full">
          <BarChart data={monthlyRevenue} barCategoryGap="20%">
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#007AFF" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#007AFF" stopOpacity={0.6} />
              </linearGradient>
              <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34C759" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#34C759" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} className="fill-muted-foreground" axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
            <ChartTooltip
              content={<ChartTooltipContent />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="revenue" fill="url(#revenueGrad)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="profit" fill="url(#profitGrad)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Top Products Table */}
        <div className="macos-card macos-shadow-card p-5">
          <div className="macos-section-header">
            <div>
              <h3 className="macos-section-title">Top Products</h3>
              <p className="macos-section-desc">Best selling products by revenue</p>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Product</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Category</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Sold</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.map((p) => (
                <TableRow key={p.name} className="macos-table-row border-border/30">
                  <TableCell className="text-[13px] font-medium">{p.name}</TableCell>
                  <TableCell>
                    <Badge className="rounded-md bg-secondary text-secondary-foreground text-[10px] font-semibold tracking-wider px-2 py-0.5">{p.category}</Badge>
                  </TableCell>
                  <TableCell className="text-[13px] text-right tabular-nums">{p.sold.toLocaleString()}</TableCell>
                  <TableCell className="text-[13px] text-right font-medium tabular-nums">${p.revenue.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Sales by Payment Pie */}
        <div className="macos-card macos-shadow-card p-5">
          <div className="macos-section-header">
            <div>
              <h3 className="macos-section-title">Sales by Payment Method</h3>
              <p className="macos-section-desc">Distribution of sales across payment methods</p>
            </div>
          </div>
          <ChartContainer config={paymentChartConfig} className="h-56 w-full">
            <PieChart>
              <Pie
                data={salesByPayment}
                dataKey="value"
                nameKey="method"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={80}
                paddingAngle={3}
                strokeWidth={0}
              >
                {salesByPayment.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip
                content={<ChartTooltipContent />}
              />
            </PieChart>
          </ChartContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {salesByPayment.map((s, i) => (
              <div key={s.method} className="flex items-center gap-2 text-[13px]">
                <div className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i] }} />
                <span className="text-muted-foreground text-[12px]">{s.method}:</span>
                <span className="font-medium text-[13px] tabular-nums">${s.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Inventory Report ───

function InventoryReport() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total SKUs" value="4,238" change="+5.2%" up icon={Package} color="bg-macos-blue/10 text-macos-blue" />
        <MetricCard title="Low Stock" value="120" change="+12" up={false} icon={BarChart3} color="bg-macos-orange/10 text-macos-orange" />
        <MetricCard title="Out of Stock" value="45" change="-8" up icon={TrendingUp} color="bg-macos-red/10 text-macos-red" />
        <MetricCard title="Dead Stock" value="23" change="+3" up={false} icon={FileText} color="bg-macos-purple/10 text-macos-purple" />
      </div>

      {/* Stock Levels Area Chart */}
      <div className="macos-card macos-shadow-card p-5">
        <div className="macos-section-header">
          <div>
            <h3 className="macos-section-title">Stock Levels by Category</h3>
            <p className="macos-section-desc">Current inventory status across product categories</p>
          </div>
          <Badge className="rounded-md bg-macos-teal/10 text-macos-teal text-[10px] font-semibold tracking-wider px-2 py-0.5">
            <Package className="size-3 mr-1" />
            INVENTORY
          </Badge>
        </div>
        <ChartContainer config={stockChartConfig} className="h-72 w-full">
          <BarChart data={stockLevels} barCategoryGap="20%">
            <defs>
              <linearGradient id="inStockGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#007AFF" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#007AFF" stopOpacity={0.5} />
              </linearGradient>
              <linearGradient id="lowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF9500" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#FF9500" stopOpacity={0.5} />
              </linearGradient>
              <linearGradient id="outGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF3B30" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#FF3B30" stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} className="fill-muted-foreground" axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" axisLine={false} tickLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="inStock" stackId="a" fill="url(#inStockGrad)" />
            <Bar dataKey="low" stackId="a" fill="url(#lowGrad)" />
            <Bar dataKey="out" stackId="a" fill="url(#outGrad)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </div>

      {/* Moving Items Table */}
      <div className="macos-card macos-shadow-card p-5">
        <div className="macos-section-header">
          <div>
            <h3 className="macos-section-title">Fast / Slow / Dead Moving Items</h3>
            <p className="macos-section-desc">Product movement analysis</p>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Product</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Movement</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Units Sold</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Current Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movingItems.map((item) => (
              <TableRow key={item.name} className="macos-table-row border-border/30">
                <TableCell className="text-[13px] font-medium">{item.name}</TableCell>
                <TableCell>
                  <Badge
                    className={`rounded-md text-[10px] font-semibold tracking-wider px-2 py-0.5 ${
                      item.type === 'Fast' ? 'bg-macos-green/10 text-macos-green' :
                      item.type === 'Slow' ? 'bg-macos-orange/10 text-macos-orange' :
                      'bg-macos-red/10 text-macos-red'
                    }`}
                  >
                    {item.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-[13px] text-right tabular-nums">{item.sold}</TableCell>
                <TableCell className="text-[13px] text-right tabular-nums">{item.stock}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// ─── Publisher Report ───

function PublisherReport() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Publishers" value="24" change="+3" up icon={BookOpen} color="bg-macos-blue/10 text-macos-blue" />
        <MetricCard title="Total Titles" value="145" change="+12" up icon={FileText} color="bg-macos-green/10 text-macos-green" />
        <MetricCard title="Publisher Revenue" value="$287,000" change="+9.3%" up icon={DollarSign} color="bg-macos-orange/10 text-macos-orange" />
        <MetricCard title="Avg Orders/Pub" value="210" change="+5.1%" up icon={ShoppingCart} color="bg-macos-purple/10 text-macos-purple" />
      </div>

      <div className="macos-card macos-shadow-card p-5">
        <div className="macos-section-header">
          <div>
            <h3 className="macos-section-title">Publisher Performance</h3>
            <p className="macos-section-desc">Revenue and order distribution by publisher</p>
          </div>
          <Badge className="rounded-md bg-gg-bridge/10 text-gg-bridge text-[10px] font-semibold tracking-wider px-2 py-0.5">
            <BookOpen className="size-3 mr-1" />
            PUBLISHERS
          </Badge>
        </div>
        <ChartContainer config={publisherChartConfig} className="h-72 w-full">
          <BarChart data={publisherData} layout="vertical" barCategoryGap="25%">
            <defs>
              <linearGradient id="pubGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="5%" stopColor="#007AFF" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#5AC8FA" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} className="fill-muted-foreground" axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
            <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 11 }} className="fill-muted-foreground" axisLine={false} tickLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="revenue" fill="url(#pubGrad)" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ChartContainer>
      </div>

      <div className="macos-card macos-shadow-card p-5">
        <div className="macos-section-header">
          <h3 className="macos-section-title">Publisher Details</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Publisher</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Titles</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Revenue</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Orders</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {publisherData.map((p) => (
              <TableRow key={p.name} className="macos-table-row border-border/30">
                <TableCell className="text-[13px] font-medium">{p.name}</TableCell>
                <TableCell className="text-[13px] text-right tabular-nums">{p.titles}</TableCell>
                <TableCell className="text-[13px] text-right font-medium tabular-nums">${p.revenue.toLocaleString()}</TableCell>
                <TableCell className="text-[13px] text-right tabular-nums">{p.orders}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// ─── Author Report ───

function AuthorReport() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Authors" value="56" change="+8" up icon={Users} color="bg-macos-blue/10 text-macos-blue" />
        <MetricCard title="Books Published" value="89" change="+6" up icon={BookOpen} color="bg-macos-green/10 text-macos-green" />
        <MetricCard title="Total Royalties" value="$58,500" change="+4.2%" up icon={DollarSign} color="bg-macos-orange/10 text-macos-orange" />
        <MetricCard title="Avg Books/Author" value="1.6" change="+0.3" up icon={BarChart3} color="bg-macos-purple/10 text-macos-purple" />
      </div>

      <div className="macos-card macos-shadow-card p-5">
        <div className="macos-section-header">
          <div>
            <h3 className="macos-section-title">Top Authors by Sales</h3>
            <p className="macos-section-desc">Author performance and royalty overview</p>
          </div>
          <Badge className="rounded-md bg-macos-purple/10 text-macos-purple text-[10px] font-semibold tracking-wider px-2 py-0.5">
            <Users className="size-3 mr-1" />
            AUTHORS
          </Badge>
        </div>
        <ChartContainer config={authorChartConfig} className="h-72 w-full">
          <BarChart data={authorData} barCategoryGap="20%">
            <defs>
              <linearGradient id="soldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#007AFF" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#007AFF" stopOpacity={0.5} />
              </linearGradient>
              <linearGradient id="royGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34C759" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#34C759" stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} className="fill-muted-foreground" axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" axisLine={false} tickLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="sold" fill="url(#soldGrad)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="royalties" fill="url(#royGrad)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </div>

      <div className="macos-card macos-shadow-card p-5">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Author</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Books</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Sold</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Royalties</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {authorData.map((a) => (
              <TableRow key={a.name} className="macos-table-row border-border/30">
                <TableCell className="text-[13px] font-medium">{a.name}</TableCell>
                <TableCell className="text-[13px] text-right tabular-nums">{a.books}</TableCell>
                <TableCell className="text-[13px] text-right tabular-nums">{a.sold.toLocaleString()}</TableCell>
                <TableCell className="text-[13px] text-right font-medium tabular-nums">${a.royalties.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// ─── Wholesale Report ───

function WholesaleReport() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Distributors" value="12" change="+2" up icon={Truck} color="bg-macos-blue/10 text-macos-blue" />
        <MetricCard title="Wholesale Orders" value="62" change="+8" up icon={ShoppingCart} color="bg-macos-green/10 text-macos-green" />
        <MetricCard title="Wholesale Revenue" value="$124,000" change="+15.2%" up icon={DollarSign} color="bg-macos-orange/10 text-macos-orange" />
        <MetricCard title="Avg Order Value" value="$2,000" change="+3.8%" up icon={TrendingUp} color="bg-macos-purple/10 text-macos-purple" />
      </div>

      <div className="macos-card macos-shadow-card p-5">
        <div className="macos-section-header">
          <div>
            <h3 className="macos-section-title">Distributor Performance</h3>
            <p className="macos-section-desc">Orders and revenue by wholesale partner</p>
          </div>
          <Badge className="rounded-md bg-macos-teal/10 text-macos-teal text-[10px] font-semibold tracking-wider px-2 py-0.5">
            <Truck className="size-3 mr-1" />
            WHOLESALE
          </Badge>
        </div>
        <ChartContainer config={paymentChartConfig} className="h-64 w-full">
          <PieChart>
            <Pie
              data={wholesaleData}
              dataKey="total"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={3}
              strokeWidth={0}
            >
              {wholesaleData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ChartContainer>
      </div>

      <div className="macos-card macos-shadow-card p-5">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Distributor</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Orders</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Total Value</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {wholesaleData.map((w) => (
              <TableRow key={w.name} className="macos-table-row border-border/30">
                <TableCell className="text-[13px] font-medium">{w.name}</TableCell>
                <TableCell className="text-[13px] text-right tabular-nums">{w.orders}</TableCell>
                <TableCell className="text-[13px] text-right font-medium tabular-nums">${w.total.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge className={`rounded-md text-[10px] font-semibold tracking-wider px-2 py-0.5 ${
                    w.status === 'Active' ? 'bg-macos-green/10 text-macos-green' : 'bg-macos-orange/10 text-macos-orange'
                  }`}>
                    {w.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// ─── School Contract Report ───

function SchoolContractReport() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Schools" value="18" change="+4" up icon={GraduationCap} color="bg-macos-blue/10 text-macos-blue" />
        <MetricCard title="Active Contracts" value="14" change="+2" up icon={FileText} color="bg-macos-green/10 text-macos-green" />
        <MetricCard title="Contract Value" value="$70,000" change="+18.5%" up icon={DollarSign} color="bg-macos-orange/10 text-macos-orange" />
        <MetricCard title="Items Supplied" value="1,260" change="+9.2%" up icon={Package} color="bg-macos-purple/10 text-macos-purple" />
      </div>

      <div className="macos-card macos-shadow-card p-5">
        <div className="macos-section-header">
          <div>
            <h3 className="macos-section-title">Contract Value by School</h3>
            <p className="macos-section-desc">Revenue distribution across school partnerships</p>
          </div>
          <Badge className="rounded-md bg-gg-sunset/10 text-gg-sunset text-[10px] font-semibold tracking-wider px-2 py-0.5">
            <GraduationCap className="size-3 mr-1" />
            SCHOOLS
          </Badge>
        </div>
        <ChartContainer config={schoolChartConfig} className="h-64 w-full">
          <BarChart data={schoolContractData} barCategoryGap="25%">
            <defs>
              <linearGradient id="schoolGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#AF52DE" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#AF52DE" stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} className="fill-muted-foreground" axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" fill="url(#schoolGrad)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </div>

      <div className="macos-card macos-shadow-card p-5">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">School</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Contract Value</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Items</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schoolContractData.map((s) => (
              <TableRow key={s.name} className="macos-table-row border-border/30">
                <TableCell className="text-[13px] font-medium">{s.name}</TableCell>
                <TableCell className="text-[13px] text-right font-medium tabular-nums">${s.value.toLocaleString()}</TableCell>
                <TableCell className="text-[13px] text-right tabular-nums">{s.items}</TableCell>
                <TableCell>
                  <Badge className={`rounded-md text-[10px] font-semibold tracking-wider px-2 py-0.5 ${
                    s.status === 'Active' ? 'bg-macos-green/10 text-macos-green' : 'bg-macos-orange/10 text-macos-orange'
                  }`}>
                    {s.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// ─── Financial Report ───

function FinancialReport() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Income" value="$296,000" change="+10.5%" up icon={TrendingUp} color="bg-macos-blue/10 text-macos-blue" />
        <MetricCard title="Total Expenses" value="$207,200" change="+8.3%" up icon={DollarSign} color="bg-macos-red/10 text-macos-red" />
        <MetricCard title="Net Profit" value="$88,800" change="+15.8%" up icon={BarChart3} color="bg-macos-green/10 text-macos-green" />
        <MetricCard title="Profit Margin" value="30.0%" change="+2.1%" up icon={FileText} color="bg-macos-orange/10 text-macos-orange" />
      </div>

      <div className="macos-card macos-shadow-card p-5">
        <div className="macos-section-header">
          <div>
            <h3 className="macos-section-title">Income vs Expenses</h3>
            <p className="macos-section-desc">Monthly financial trends</p>
          </div>
          <Badge className="rounded-md bg-gg-golden/10 text-gg-golden text-[10px] font-semibold tracking-wider px-2 py-0.5">
            <TrendingUp className="size-3 mr-1" />
            FINANCIAL
          </Badge>
        </div>
        <ChartContainer config={financialChartConfig} className="h-72 w-full">
          <AreaChart data={financialSummary}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#007AFF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF3B30" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FF3B30" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34C759" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#34C759" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} className="fill-muted-foreground" axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area type="monotone" dataKey="income" stroke="#007AFF" strokeWidth={2} fill="url(#incomeGrad)" />
            <Area type="monotone" dataKey="expense" stroke="#FF3B30" strokeWidth={2} fill="url(#expenseGrad)" />
            <Area type="monotone" dataKey="net" stroke="#34C759" strokeWidth={2} fill="url(#netGrad)" />
          </AreaChart>
        </ChartContainer>
      </div>

      <div className="macos-card macos-shadow-card p-5">
        <div className="macos-section-header">
          <h3 className="macos-section-title">Financial Breakdown</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Month</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Income</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Expenses</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Net Profit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {financialSummary.map((f) => (
              <TableRow key={f.month} className="macos-table-row border-border/30">
                <TableCell className="text-[13px] font-medium">{f.month}</TableCell>
                <TableCell className="text-[13px] text-right text-macos-blue tabular-nums">${f.income.toLocaleString()}</TableCell>
                <TableCell className="text-[13px] text-right text-macos-red tabular-nums">${f.expense.toLocaleString()}</TableCell>
                <TableCell className="text-[13px] text-right font-medium text-macos-green tabular-nums">${f.net.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// ─── Main Reports Component ───

export function ReportsModule() {
  const { authUser } = useAppStore()
  const isViewOnly = authUser?.isViewOnly ?? false
  const [activeCategory, setActiveCategory] = React.useState<ReportCategory>('sales')
  const [dateRange, setDateRange] = React.useState('12m')

  const renderReport = () => {
    switch (activeCategory) {
      case 'sales': return <SalesReport />
      case 'inventory': return <InventoryReport />
      case 'publisher': return <PublisherReport />
      case 'author': return <AuthorReport />
      case 'wholesale': return <WholesaleReport />
      case 'school': return <SchoolContractReport />
      case 'financial': return <FinancialReport />
      default: return <SalesReport />
    }
  }

  return (
    <div className="space-y-5">
      {/* macOS Activity Monitor-style Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="macos-page-title">Reports & Analytics</h2>
          <p className="macos-page-subtitle">Comprehensive business intelligence and reporting</p>
        </div>
        <div className="flex items-center gap-2">
          {isViewOnly && (
            <Badge className="rounded-md bg-macos-orange/10 text-macos-orange text-[10px] font-semibold tracking-wider px-2 py-0.5">
              <Eye className="size-3 mr-1" />
              VIEW ONLY
            </Badge>
          )}
          <div className="macos-filter-bar">
            <Calendar className="size-3.5 text-muted-foreground ml-2" />
            {dateRanges.map((dr) => (
              <button
                key={dr.value}
                onClick={() => setDateRange(dr.value)}
                className={`text-[11px] font-medium ${
                  dateRange === dr.value ? 'macos-filter-item macos-filter-item-active' : 'macos-filter-item'
                }`}
              >
                {dr.label}
              </button>
            ))}
          </div>
          <Button className="bg-secondary text-secondary-foreground rounded-lg font-medium text-[13px] h-8" disabled={isViewOnly}>
            <Download className="size-3.5 mr-1.5" strokeWidth={2} />
            Export
          </Button>
        </div>
      </div>

      {/* Category Filter Bar (macOS Activity Monitor style tabs) */}
      <div className="macos-filter-bar">
        {reportCategories.map((cat) => {
          const Icon = cat.icon
          const isActive = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 ${
                isActive ? 'macos-filter-item macos-filter-item-active' : 'macos-filter-item'
              }`}
            >
              <Icon className="size-3.5" />
              <span className="text-[12px]">{cat.label}</span>
            </button>
          )
        })}
      </div>

      {/* Report Content */}
      {renderReport()}
    </div>
  )
}
