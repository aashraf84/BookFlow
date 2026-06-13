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
import {
  MacosPageHeader,
  MacosStatCard,
  MacosStatGrid,
  MacosCard,
  MacosFilterBar,
  MacosButton,
  MacosBadge,
  MacosSection,
} from '@/components/macos-ui'

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
    <MacosStatCard
      label={title}
      value={value}
      icon={Icon}
      iconColor={color.split(' ')[1] || 'text-primary'}
      iconBg={color.split(' ')[0] || 'bg-primary/10'}
      trend={change ? { value: parseFloat(change), label: change } : undefined}
    />
  )
}

// ─── Sales Report ───

function SalesReport() {
  return (
    <div className="space-y-5">
      <MacosStatGrid>
        <MacosStatCard label="Total Revenue" value="$682,000" icon={DollarSign} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" trend={{ value: 12.5, label: '+12.5%' }} />
        <MacosStatCard label="Total Orders" value="5,045" icon={ShoppingCart} iconColor="text-macos-green" iconBg="bg-macos-green/10" trend={{ value: 8.2, label: '+8.2%' }} />
        <MacosStatCard label="Avg Order Value" value="$135.18" icon={TrendingUp} iconColor="text-macos-orange" iconBg="bg-macos-orange/10" trend={{ value: 3.1, label: '+3.1%' }} />
        <MacosStatCard label="Profit Margin" value="30.2%" icon={BarChart3} iconColor="text-macos-red" iconBg="bg-macos-red/10" trend={{ value: -1.4, label: '-1.4%' }} />
      </MacosStatGrid>

      {/* Revenue & Profit Area Chart */}
      <MacosCard noPadding>
        <div className="px-5 pt-5 pb-0">
          <MacosSection
            title="Monthly Revenue & Profit"
            subtitle="Revenue and profit trends over the past 12 months"
            action={
              <MacosBadge variant="info">
                <Activity className="size-3 mr-1" />
                LIVE
              </MacosBadge>
            }
          />
        </div>
        <div className="p-5 pt-2">
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
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="revenue" fill="url(#revenueGrad)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="profit" fill="url(#profitGrad)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>
      </MacosCard>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Top Products Table */}
        <MacosCard title="Top Products" subtitle="Best selling products by revenue" noPadding>
          <div className="overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/50 hover:bg-transparent">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Product</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Category</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Sold</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((p) => (
                  <TableRow key={p.name} className="macos-table-row border-b border-border/30 last:border-0">
                    <TableCell className="text-[13px] font-medium tracking-tight py-3">{p.name}</TableCell>
                    <TableCell className="py-3">
                      <MacosBadge>{p.category}</MacosBadge>
                    </TableCell>
                    <TableCell className="text-[13px] text-right tabular-nums py-3">{p.sold.toLocaleString()}</TableCell>
                    <TableCell className="text-[13px] text-right font-medium tabular-nums py-3">${p.revenue.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </MacosCard>

        {/* Sales by Payment Pie */}
        <MacosCard title="Sales by Payment Method" subtitle="Distribution of sales across payment methods" noPadding>
          <div className="p-5">
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
                <ChartTooltip content={<ChartTooltipContent />} />
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
        </MacosCard>
      </div>
    </div>
  )
}

// ─── Inventory Report ───

function InventoryReport() {
  return (
    <div className="space-y-5">
      <MacosStatGrid>
        <MacosStatCard label="Total SKUs" value="4,238" icon={Package} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" trend={{ value: 5.2, label: '+5.2%' }} />
        <MacosStatCard label="Low Stock" value="120" icon={BarChart3} iconColor="text-macos-orange" iconBg="bg-macos-orange/10" trend={{ value: -12, label: '+12' }} />
        <MacosStatCard label="Out of Stock" value="45" icon={TrendingUp} iconColor="text-macos-red" iconBg="bg-macos-red/10" trend={{ value: 8, label: '-8' }} />
        <MacosStatCard label="Dead Stock" value="23" icon={FileText} iconColor="text-macos-purple" iconBg="bg-macos-purple/10" trend={{ value: -3, label: '+3' }} />
      </MacosStatGrid>

      {/* Stock Levels Area Chart */}
      <MacosCard noPadding>
        <div className="px-5 pt-5 pb-0">
          <MacosSection
            title="Stock Levels by Category"
            subtitle="Current inventory status across product categories"
            action={
              <MacosBadge variant="info">
                <Package className="size-3 mr-1" />
                INVENTORY
              </MacosBadge>
            }
          />
        </div>
        <div className="p-5 pt-2">
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
      </MacosCard>

      {/* Moving Items Table */}
      <MacosCard title="Fast / Slow / Dead Moving Items" subtitle="Product movement analysis" noPadding>
        <div className="overflow-x-auto custom-scrollbar">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Product</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Movement</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Units Sold</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Current Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movingItems.map((item) => (
                <TableRow key={item.name} className="macos-table-row border-b border-border/30 last:border-0">
                  <TableCell className="text-[13px] font-medium tracking-tight py-3">{item.name}</TableCell>
                  <TableCell className="py-3">
                    <MacosBadge
                      variant={
                        item.type === 'Fast' ? 'success' :
                        item.type === 'Slow' ? 'warning' : 'danger'
                      }
                    >
                      {item.type}
                    </MacosBadge>
                  </TableCell>
                  <TableCell className="text-[13px] text-right tabular-nums py-3">{item.sold}</TableCell>
                  <TableCell className="text-[13px] text-right tabular-nums py-3">{item.stock}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </MacosCard>
    </div>
  )
}

// ─── Publisher Report ───

function PublisherReport() {
  return (
    <div className="space-y-5">
      <MacosStatGrid>
        <MacosStatCard label="Publishers" value="24" icon={BookOpen} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" trend={{ value: 3, label: '+3' }} />
        <MacosStatCard label="Total Titles" value="145" icon={FileText} iconColor="text-macos-green" iconBg="bg-macos-green/10" trend={{ value: 12, label: '+12' }} />
        <MacosStatCard label="Publisher Revenue" value="$287,000" icon={DollarSign} iconColor="text-macos-orange" iconBg="bg-macos-orange/10" trend={{ value: 9.3, label: '+9.3%' }} />
        <MacosStatCard label="Avg Orders/Pub" value="210" icon={ShoppingCart} iconColor="text-macos-purple" iconBg="bg-macos-purple/10" trend={{ value: 5.1, label: '+5.1%' }} />
      </MacosStatGrid>

      <MacosCard noPadding>
        <div className="px-5 pt-5 pb-0">
          <MacosSection
            title="Publisher Performance"
            subtitle="Revenue and order distribution by publisher"
            action={
              <MacosBadge variant="danger" className="bg-gg-bridge/10 text-gg-bridge">
                <BookOpen className="size-3 mr-1" />
                PUBLISHERS
              </MacosBadge>
            }
          />
        </div>
        <div className="p-5 pt-2">
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
      </MacosCard>

      <MacosCard title="Publisher Details" noPadding>
        <div className="overflow-x-auto custom-scrollbar">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Publisher</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Titles</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Revenue</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Orders</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {publisherData.map((p) => (
                <TableRow key={p.name} className="macos-table-row border-b border-border/30 last:border-0">
                  <TableCell className="text-[13px] font-medium tracking-tight py-3">{p.name}</TableCell>
                  <TableCell className="text-[13px] text-right tabular-nums py-3">{p.titles}</TableCell>
                  <TableCell className="text-[13px] text-right font-medium tabular-nums py-3">${p.revenue.toLocaleString()}</TableCell>
                  <TableCell className="text-[13px] text-right tabular-nums py-3">{p.orders}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </MacosCard>
    </div>
  )
}

// ─── Author Report ───

function AuthorReport() {
  return (
    <div className="space-y-5">
      <MacosStatGrid>
        <MacosStatCard label="Total Authors" value="56" icon={Users} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" trend={{ value: 8, label: '+8' }} />
        <MacosStatCard label="Books Published" value="89" icon={BookOpen} iconColor="text-macos-green" iconBg="bg-macos-green/10" trend={{ value: 6, label: '+6' }} />
        <MacosStatCard label="Total Royalties" value="$58,500" icon={DollarSign} iconColor="text-macos-orange" iconBg="bg-macos-orange/10" trend={{ value: 4.2, label: '+4.2%' }} />
        <MacosStatCard label="Avg Books/Author" value="1.6" icon={BarChart3} iconColor="text-macos-purple" iconBg="bg-macos-purple/10" trend={{ value: 0.3, label: '+0.3' }} />
      </MacosStatGrid>

      <MacosCard noPadding>
        <div className="px-5 pt-5 pb-0">
          <MacosSection
            title="Top Authors by Sales"
            subtitle="Author performance and royalty overview"
            action={
              <MacosBadge variant="purple">
                <Users className="size-3 mr-1" />
                AUTHORS
              </MacosBadge>
            }
          />
        </div>
        <div className="p-5 pt-2">
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
      </MacosCard>

      <MacosCard title="Author Details" noPadding>
        <div className="overflow-x-auto custom-scrollbar">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Author</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Books</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Sold</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Royalties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {authorData.map((a) => (
                <TableRow key={a.name} className="macos-table-row border-b border-border/30 last:border-0">
                  <TableCell className="text-[13px] font-medium tracking-tight py-3">{a.name}</TableCell>
                  <TableCell className="text-[13px] text-right tabular-nums py-3">{a.books}</TableCell>
                  <TableCell className="text-[13px] text-right tabular-nums py-3">{a.sold.toLocaleString()}</TableCell>
                  <TableCell className="text-[13px] text-right font-medium tabular-nums py-3">${a.royalties.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </MacosCard>
    </div>
  )
}

// ─── Wholesale Report ───

function WholesaleReport() {
  return (
    <div className="space-y-5">
      <MacosStatGrid>
        <MacosStatCard label="Distributors" value="12" icon={Truck} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" trend={{ value: 2, label: '+2' }} />
        <MacosStatCard label="Wholesale Orders" value="62" icon={ShoppingCart} iconColor="text-macos-green" iconBg="bg-macos-green/10" trend={{ value: 8, label: '+8' }} />
        <MacosStatCard label="Wholesale Revenue" value="$124,000" icon={DollarSign} iconColor="text-macos-orange" iconBg="bg-macos-orange/10" trend={{ value: 15.2, label: '+15.2%' }} />
        <MacosStatCard label="Avg Order Value" value="$2,000" icon={TrendingUp} iconColor="text-macos-purple" iconBg="bg-macos-purple/10" trend={{ value: 3.8, label: '+3.8%' }} />
      </MacosStatGrid>

      <MacosCard noPadding>
        <div className="px-5 pt-5 pb-0">
          <MacosSection
            title="Distributor Performance"
            subtitle="Orders and revenue by wholesale partner"
            action={
              <MacosBadge variant="info">
                <Truck className="size-3 mr-1" />
                WHOLESALE
              </MacosBadge>
            }
          />
        </div>
        <div className="p-5 pt-2">
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
      </MacosCard>

      <MacosCard title="Distributor Details" noPadding>
        <div className="overflow-x-auto custom-scrollbar">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Distributor</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Orders</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Total Value</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wholesaleData.map((w) => (
                <TableRow key={w.name} className="macos-table-row border-b border-border/30 last:border-0">
                  <TableCell className="text-[13px] font-medium tracking-tight py-3">{w.name}</TableCell>
                  <TableCell className="text-[13px] text-right tabular-nums py-3">{w.orders}</TableCell>
                  <TableCell className="text-[13px] text-right font-medium tabular-nums py-3">${w.total.toLocaleString()}</TableCell>
                  <TableCell className="py-3">
                    <MacosBadge variant={w.status === 'Active' ? 'success' : 'warning'}>
                      {w.status}
                    </MacosBadge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </MacosCard>
    </div>
  )
}

// ─── School Contract Report ───

function SchoolContractReport() {
  return (
    <div className="space-y-5">
      <MacosStatGrid>
        <MacosStatCard label="Schools" value="18" icon={GraduationCap} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" trend={{ value: 4, label: '+4' }} />
        <MacosStatCard label="Active Contracts" value="14" icon={FileText} iconColor="text-macos-green" iconBg="bg-macos-green/10" trend={{ value: 2, label: '+2' }} />
        <MacosStatCard label="Contract Value" value="$70,000" icon={DollarSign} iconColor="text-macos-orange" iconBg="bg-macos-orange/10" trend={{ value: 18.5, label: '+18.5%' }} />
        <MacosStatCard label="Items Supplied" value="1,260" icon={Package} iconColor="text-macos-purple" iconBg="bg-macos-purple/10" trend={{ value: 9.2, label: '+9.2%' }} />
      </MacosStatGrid>

      <MacosCard noPadding>
        <div className="px-5 pt-5 pb-0">
          <MacosSection
            title="Contract Value by School"
            subtitle="Revenue distribution across school partnerships"
            action={
              <MacosBadge variant="warning" className="bg-gg-sunset/10 text-gg-sunset">
                <GraduationCap className="size-3 mr-1" />
                SCHOOLS
              </MacosBadge>
            }
          />
        </div>
        <div className="p-5 pt-2">
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
      </MacosCard>

      <MacosCard title="School Contract Details" noPadding>
        <div className="overflow-x-auto custom-scrollbar">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">School</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Contract Value</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Items</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schoolContractData.map((s) => (
                <TableRow key={s.name} className="macos-table-row border-b border-border/30 last:border-0">
                  <TableCell className="text-[13px] font-medium tracking-tight py-3">{s.name}</TableCell>
                  <TableCell className="text-[13px] text-right font-medium tabular-nums py-3">${s.value.toLocaleString()}</TableCell>
                  <TableCell className="text-[13px] text-right tabular-nums py-3">{s.items}</TableCell>
                  <TableCell className="py-3">
                    <MacosBadge variant={s.status === 'Active' ? 'success' : 'warning'}>
                      {s.status}
                    </MacosBadge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </MacosCard>
    </div>
  )
}

// ─── Financial Report ───

function FinancialReport() {
  return (
    <div className="space-y-5">
      <MacosStatGrid>
        <MacosStatCard label="Total Income" value="$296,000" icon={TrendingUp} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" trend={{ value: 10.5, label: '+10.5%' }} />
        <MacosStatCard label="Total Expenses" value="$207,200" icon={DollarSign} iconColor="text-macos-red" iconBg="bg-macos-red/10" trend={{ value: 8.3, label: '+8.3%' }} />
        <MacosStatCard label="Net Profit" value="$88,800" icon={BarChart3} iconColor="text-macos-green" iconBg="bg-macos-green/10" trend={{ value: 15.8, label: '+15.8%' }} />
        <MacosStatCard label="Profit Margin" value="30.0%" icon={FileText} iconColor="text-macos-orange" iconBg="bg-macos-orange/10" trend={{ value: 2.1, label: '+2.1%' }} />
      </MacosStatGrid>

      <MacosCard noPadding>
        <div className="px-5 pt-5 pb-0">
          <MacosSection
            title="Income vs Expenses"
            subtitle="Monthly financial trends"
            action={
              <MacosBadge variant="warning" className="bg-gg-golden/10 text-gg-golden">
                <TrendingUp className="size-3 mr-1" />
                FINANCIAL
              </MacosBadge>
            }
          />
        </div>
        <div className="p-5 pt-2">
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
      </MacosCard>

      <MacosCard title="Financial Breakdown" noPadding>
        <div className="overflow-x-auto custom-scrollbar">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Month</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Income</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Expenses</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Net Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {financialSummary.map((f) => (
                <TableRow key={f.month} className="macos-table-row border-b border-border/30 last:border-0">
                  <TableCell className="text-[13px] font-medium tracking-tight py-3">{f.month}</TableCell>
                  <TableCell className="text-[13px] text-right text-macos-blue tabular-nums py-3">${f.income.toLocaleString()}</TableCell>
                  <TableCell className="text-[13px] text-right text-macos-red tabular-nums py-3">${f.expense.toLocaleString()}</TableCell>
                  <TableCell className="text-[13px] text-right font-medium text-macos-green tabular-nums py-3">${f.net.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </MacosCard>
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
      {/* macOS Page Header */}
      <MacosPageHeader
        title="Reports & Analytics"
        subtitle="Comprehensive business intelligence and reporting"
        icon={BarChart3}
        iconColor="text-macos-purple"
        iconBg="bg-macos-purple/10"
      >
        {isViewOnly && (
          <MacosBadge variant="warning">
            <Eye className="size-3 mr-1" />
            VIEW ONLY
          </MacosBadge>
        )}
        <MacosFilterBar
          items={dateRanges.map((dr) => ({ id: dr.value, label: dr.label }))}
          activeId={dateRange}
          onChange={setDateRange}
        />
        <MacosButton
          variant="secondary"
          icon={Download}
          disabled={isViewOnly}
        >
          Export
        </MacosButton>
      </MacosPageHeader>

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
