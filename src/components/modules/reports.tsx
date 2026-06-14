'use client'

import * as React from 'react'
import {
  BarChart3,
  Download,
  DollarSign,
  Package,
  TrendingUp,
  ShoppingCart,
  BookOpen,
  Truck,
  GraduationCap,
  Users,
  FileText,
  Activity,
  Eye,
  Loader2,
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

const dateRanges = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '12m', label: 'Last 12 months' },
  { value: 'ytd', label: 'Year to date' },
]

// ─── Data Types ───

interface ReportData {
  monthlyRevenue: { month: string; revenue: number; orders: number; profit: number }[]
  topProducts: { name: string; category: string; sold: number; revenue: number }[]
  salesByPayment: { method: string; value: number; amount: number }[]
  salesStats: { totalRevenue: number; totalOrders: number; avgOrderValue: number; profitMargin: number }
  stockLevels: { name: string; inStock: number; low: number; out: number }[]
  movingItems: { name: string; type: 'Fast' | 'Slow' | 'Dead'; sold: number; stock: number }[]
  inventoryStats: { totalSKUs: number; lowStockCount: number; outOfStockCount: number; deadStockCount: number }
  publisherData: { name: string; titles: number; revenue: number; orders: number }[]
  publisherStats: { totalPublishers: number; totalTitles: number; publisherRevenue: number; avgOrdersPerPublisher: number }
  authorData: { name: string; books: number; sold: number; royalties: number }[]
  authorStats: { totalAuthors: number; totalBooksPublished: number; totalRoyalties: number; avgBooksPerAuthor: number }
  wholesaleData: { name: string; orders: number; total: number; status: string }[]
  wholesaleStats: { totalDistributors: number; totalWholesaleOrders: number; wholesaleRevenue: number; avgWholesaleOrderValue: number }
  schoolContractData: { name: string; value: number; items: number; status: string }[]
  schoolStats: { totalSchools: number; activeContracts: number; totalContractValue: number }
  financialSummary: { month: string; income: number; expense: number; net: number }[]
  financialStats: { totalIncome: number; totalExpenses: number; netProfit: number; profitMargin: number }
}

const emptyData: ReportData = {
  monthlyRevenue: [],
  topProducts: [],
  salesByPayment: [],
  salesStats: { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, profitMargin: 0 },
  stockLevels: [],
  movingItems: [],
  inventoryStats: { totalSKUs: 0, lowStockCount: 0, outOfStockCount: 0, deadStockCount: 0 },
  publisherData: [],
  publisherStats: { totalPublishers: 0, totalTitles: 0, publisherRevenue: 0, avgOrdersPerPublisher: 0 },
  authorData: [],
  authorStats: { totalAuthors: 0, totalBooksPublished: 0, totalRoyalties: 0, avgBooksPerAuthor: 0 },
  wholesaleData: [],
  wholesaleStats: { totalDistributors: 0, totalWholesaleOrders: 0, wholesaleRevenue: 0, avgWholesaleOrderValue: 0 },
  schoolContractData: [],
  schoolStats: { totalSchools: 0, activeContracts: 0, totalContractValue: 0 },
  financialSummary: [],
  financialStats: { totalIncome: 0, totalExpenses: 0, netProfit: 0, profitMargin: 0 },
}

// ─── Loading Skeleton ───

function ReportSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-muted/40" />
        ))}
      </div>
      <div className="h-80 rounded-xl bg-muted/40" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="h-64 rounded-xl bg-muted/40" />
        <div className="h-64 rounded-xl bg-muted/40" />
      </div>
    </div>
  )
}

// ─── Sales Report ───

function SalesReport({ data }: { data: ReportData }) {
  const { salesStats, monthlyRevenue, topProducts, salesByPayment } = data
  return (
    <div className="space-y-5">
      <MacosStatGrid>
        <MacosStatCard label="Total Revenue" value={`$${salesStats.totalRevenue.toLocaleString()}`} icon={DollarSign} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" />
        <MacosStatCard label="Total Orders" value={salesStats.totalOrders.toLocaleString()} icon={ShoppingCart} iconColor="text-macos-green" iconBg="bg-macos-green/10" />
        <MacosStatCard label="Avg Order Value" value={`$${salesStats.avgOrderValue.toLocaleString()}`} icon={TrendingUp} iconColor="text-macos-orange" iconBg="bg-macos-orange/10" />
        <MacosStatCard label="Profit Margin" value={`${salesStats.profitMargin}%`} icon={BarChart3} iconColor="text-macos-red" iconBg="bg-macos-red/10" />
      </MacosStatGrid>

      {/* Revenue & Profit Area Chart */}
      <MacosCard noPadding>
        <div className="px-5 pt-5 pb-0">
          <MacosSection
            title="Monthly Revenue & Profit"
            subtitle="Revenue and profit trends over the selected period"
            action={
              <MacosBadge variant="info">
                <Activity className="size-3 mr-1" />
                LIVE
              </MacosBadge>
            }
          />
        </div>
        <div className="p-5 pt-2">
          {monthlyRevenue.length > 0 ? (
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
          ) : (
            <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">
              No sales data available for this period
            </div>
          )}
        </div>
      </MacosCard>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Top Products Table */}
        <MacosCard title="Top Products" subtitle="Best selling products by revenue" noPadding>
          {topProducts.length > 0 ? (
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
          ) : (
            <div className="p-5 text-center text-muted-foreground text-sm">
              No product sales data available
            </div>
          )}
        </MacosCard>

        {/* Sales by Payment Pie */}
        <MacosCard title="Sales by Payment Method" subtitle="Distribution of sales across payment methods" noPadding>
          {salesByPayment.length > 0 ? (
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
          ) : (
            <div className="p-5 text-center text-muted-foreground text-sm">
              No payment method data available
            </div>
          )}
        </MacosCard>
      </div>
    </div>
  )
}

// ─── Inventory Report ───

function InventoryReport({ data }: { data: ReportData }) {
  const { inventoryStats, stockLevels, movingItems } = data
  return (
    <div className="space-y-5">
      <MacosStatGrid>
        <MacosStatCard label="Total SKUs" value={inventoryStats.totalSKUs.toLocaleString()} icon={Package} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" />
        <MacosStatCard label="Low Stock" value={inventoryStats.lowStockCount.toString()} icon={BarChart3} iconColor="text-macos-orange" iconBg="bg-macos-orange/10" />
        <MacosStatCard label="Out of Stock" value={inventoryStats.outOfStockCount.toString()} icon={TrendingUp} iconColor="text-macos-red" iconBg="bg-macos-red/10" />
        <MacosStatCard label="Dead Stock" value={inventoryStats.deadStockCount.toString()} icon={FileText} iconColor="text-macos-purple" iconBg="bg-macos-purple/10" />
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
          {stockLevels.length > 0 ? (
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
          ) : (
            <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">
              No inventory data available
            </div>
          )}
        </div>
      </MacosCard>

      {/* Moving Items Table */}
      <MacosCard title="Fast / Slow / Dead Moving Items" subtitle="Product movement analysis" noPadding>
        {movingItems.length > 0 ? (
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
        ) : (
          <div className="p-5 text-center text-muted-foreground text-sm">
            No inventory movement data available
          </div>
        )}
      </MacosCard>
    </div>
  )
}

// ─── Publisher Report ───

function PublisherReport({ data }: { data: ReportData }) {
  const { publisherStats, publisherData } = data
  return (
    <div className="space-y-5">
      <MacosStatGrid>
        <MacosStatCard label="Publishers" value={publisherStats.totalPublishers.toString()} icon={BookOpen} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" />
        <MacosStatCard label="Total Titles" value={publisherStats.totalTitles.toString()} icon={FileText} iconColor="text-macos-green" iconBg="bg-macos-green/10" />
        <MacosStatCard label="Publisher Revenue" value={`$${publisherStats.publisherRevenue.toLocaleString()}`} icon={DollarSign} iconColor="text-macos-orange" iconBg="bg-macos-orange/10" />
        <MacosStatCard label="Avg Orders/Pub" value={publisherStats.avgOrdersPerPublisher.toString()} icon={ShoppingCart} iconColor="text-macos-purple" iconBg="bg-macos-purple/10" />
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
          {publisherData.length > 0 ? (
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
          ) : (
            <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">
              No publisher data available
            </div>
          )}
        </div>
      </MacosCard>

      <MacosCard title="Publisher Details" noPadding>
        {publisherData.length > 0 ? (
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
        ) : (
          <div className="p-5 text-center text-muted-foreground text-sm">
            No publisher data available
          </div>
        )}
      </MacosCard>
    </div>
  )
}

// ─── Author Report ───

function AuthorReport({ data }: { data: ReportData }) {
  const { authorStats, authorData } = data
  return (
    <div className="space-y-5">
      <MacosStatGrid>
        <MacosStatCard label="Total Authors" value={authorStats.totalAuthors.toString()} icon={Users} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" />
        <MacosStatCard label="Books Published" value={authorStats.totalBooksPublished.toString()} icon={BookOpen} iconColor="text-macos-green" iconBg="bg-macos-green/10" />
        <MacosStatCard label="Total Royalties" value={`$${authorStats.totalRoyalties.toLocaleString()}`} icon={DollarSign} iconColor="text-macos-orange" iconBg="bg-macos-orange/10" />
        <MacosStatCard label="Avg Books/Author" value={authorStats.avgBooksPerAuthor.toString()} icon={BarChart3} iconColor="text-macos-purple" iconBg="bg-macos-purple/10" />
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
          {authorData.length > 0 ? (
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
          ) : (
            <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">
              No author data available
            </div>
          )}
        </div>
      </MacosCard>

      <MacosCard title="Author Details" noPadding>
        {authorData.length > 0 ? (
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
        ) : (
          <div className="p-5 text-center text-muted-foreground text-sm">
            No author data available
          </div>
        )}
      </MacosCard>
    </div>
  )
}

// ─── Wholesale Report ───

function WholesaleReport({ data }: { data: ReportData }) {
  const { wholesaleStats, wholesaleData } = data
  return (
    <div className="space-y-5">
      <MacosStatGrid>
        <MacosStatCard label="Distributors" value={wholesaleStats.totalDistributors.toString()} icon={Truck} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" />
        <MacosStatCard label="Wholesale Orders" value={wholesaleStats.totalWholesaleOrders.toString()} icon={ShoppingCart} iconColor="text-macos-green" iconBg="bg-macos-green/10" />
        <MacosStatCard label="Wholesale Revenue" value={`$${wholesaleStats.wholesaleRevenue.toLocaleString()}`} icon={DollarSign} iconColor="text-macos-orange" iconBg="bg-macos-orange/10" />
        <MacosStatCard label="Avg Order Value" value={`$${wholesaleStats.avgWholesaleOrderValue.toLocaleString()}`} icon={TrendingUp} iconColor="text-macos-purple" iconBg="bg-macos-purple/10" />
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
          {wholesaleData.length > 0 ? (
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
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
              No wholesale data available
            </div>
          )}
        </div>
      </MacosCard>

      <MacosCard title="Distributor Details" noPadding>
        {wholesaleData.length > 0 ? (
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
        ) : (
          <div className="p-5 text-center text-muted-foreground text-sm">
            No wholesale data available
          </div>
        )}
      </MacosCard>
    </div>
  )
}

// ─── School Contract Report ───

function SchoolContractReport({ data }: { data: ReportData }) {
  const { schoolStats, schoolContractData } = data
  return (
    <div className="space-y-5">
      <MacosStatGrid>
        <MacosStatCard label="Schools" value={schoolStats.totalSchools.toString()} icon={GraduationCap} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" />
        <MacosStatCard label="Active Contracts" value={schoolStats.activeContracts.toString()} icon={FileText} iconColor="text-macos-green" iconBg="bg-macos-green/10" />
        <MacosStatCard label="Contract Value" value={`$${schoolStats.totalContractValue.toLocaleString()}`} icon={DollarSign} iconColor="text-macos-orange" iconBg="bg-macos-orange/10" />
        <MacosStatCard label="Total Contracts" value={schoolContractData.length.toString()} icon={Package} iconColor="text-macos-purple" iconBg="bg-macos-purple/10" />
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
          {schoolContractData.length > 0 ? (
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
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
              No school contract data available
            </div>
          )}
        </div>
      </MacosCard>

      <MacosCard title="School Contract Details" noPadding>
        {schoolContractData.length > 0 ? (
          <div className="overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/50 hover:bg-transparent">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">School</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Contract Value</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Contracts</TableHead>
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
        ) : (
          <div className="p-5 text-center text-muted-foreground text-sm">
            No school contract data available
          </div>
        )}
      </MacosCard>
    </div>
  )
}

// ─── Financial Report ───

function FinancialReport({ data }: { data: ReportData }) {
  const { financialStats, financialSummary } = data
  return (
    <div className="space-y-5">
      <MacosStatGrid>
        <MacosStatCard label="Total Income" value={`$${financialStats.totalIncome.toLocaleString()}`} icon={TrendingUp} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" />
        <MacosStatCard label="Total Expenses" value={`$${financialStats.totalExpenses.toLocaleString()}`} icon={DollarSign} iconColor="text-macos-red" iconBg="bg-macos-red/10" />
        <MacosStatCard label="Net Profit" value={`$${financialStats.netProfit.toLocaleString()}`} icon={BarChart3} iconColor="text-macos-green" iconBg="bg-macos-green/10" />
        <MacosStatCard label="Profit Margin" value={`${financialStats.profitMargin}%`} icon={FileText} iconColor="text-macos-orange" iconBg="bg-macos-orange/10" />
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
          {financialSummary.length > 0 ? (
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
          ) : (
            <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">
              No financial data available for this period
            </div>
          )}
        </div>
      </MacosCard>

      <MacosCard title="Financial Breakdown" noPadding>
        {financialSummary.length > 0 ? (
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
        ) : (
          <div className="p-5 text-center text-muted-foreground text-sm">
            No financial data available
          </div>
        )}
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
  const [reportData, setReportData] = React.useState<ReportData>(emptyData)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Fetch report data from API
  React.useEffect(() => {
    let cancelled = false

    async function fetchReportData() {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (authUser?.tenantId) {
          params.set('tenantId', authUser.tenantId)
        }
        params.set('range', dateRange)

        const response = await fetch(`/api/reports?${params.toString()}`)
        const result = await response.json()

        if (!cancelled) {
          if (result.success && result.data) {
            setReportData(result.data)
          } else {
            setError(result.error || 'Failed to load report data')
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError('Network error: Failed to fetch report data')
          console.error('Reports fetch error:', err)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchReportData()

    return () => {
      cancelled = true
    }
  }, [authUser?.tenantId, dateRange])

  const renderReport = () => {
    if (loading) return <ReportSkeleton />

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <BarChart3 className="size-6 text-destructive" />
          </div>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={() => setDateRange(dateRange)}
            className="text-sm text-primary hover:underline"
          >
            Retry
          </button>
        </div>
      )
    }

    switch (activeCategory) {
      case 'sales': return <SalesReport data={reportData} />
      case 'inventory': return <InventoryReport data={reportData} />
      case 'publisher': return <PublisherReport data={reportData} />
      case 'author': return <AuthorReport data={reportData} />
      case 'wholesale': return <WholesaleReport data={reportData} />
      case 'school': return <SchoolContractReport data={reportData} />
      case 'financial': return <FinancialReport data={reportData} />
      default: return <SalesReport data={reportData} />
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
              {loading && isActive && (
                <Loader2 className="size-3 animate-spin text-muted-foreground" />
              )}
            </button>
          )
        })}
      </div>

      {/* Report Content */}
      {renderReport()}
    </div>
  )
}
