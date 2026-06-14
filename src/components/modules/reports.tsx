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
  Loader2,
  Printer,
  Calendar,
  Building2,
  UserCheck,
  CreditCard,
  Receipt,
  AlertTriangle,
  RefreshCw,
  Search,
  ChevronRight,
  ChevronDown,
  Filter,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  FolderOpen,
  Warehouse,
  Store,
  School,
  Briefcase,
  Landmark,
  Wallet,
  Coins,
  ClipboardList,
  PackageCheck,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  Clock,
  Target,
  Award,
  Star,
  Gift,
  Stamp,
  Scale,
  TruckIcon,
  Sheet,
  Eye,
  ArrowRight,
  PackageX,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
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
  LineChart,
  Line,
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
  MacosEmptyState,
} from '@/components/macos-ui'

// ─── Types ─────────────────────────────────────────────────────

type ReportCategory =
  | 'sales'
  | 'inventory'
  | 'purchase'
  | 'financial'
  | 'publisher'
  | 'customer'
  | 'wholesale'
  | 'school'
  | 'hr'
  | 'branch'

interface ReportDef {
  id: string
  title: string
  description: string
  category: ReportCategory
  icon: React.ElementType
  requiresDateRange: boolean
  requiresBranchFilter: boolean
}

interface CategoryDef {
  id: ReportCategory
  label: string
  icon: React.ElementType
}

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

// ─── Constants ─────────────────────────────────────────────────

const CHART_COLORS = ['#007AFF', '#34C759', '#FF9500', '#AF52DE', '#5AC8FA', '#FF2D55', '#32ADE6']

const categories: CategoryDef[] = [
  { id: 'sales', label: 'Sales', icon: DollarSign },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'purchase', label: 'Purchase & Supplier', icon: TruckIcon },
  { id: 'financial', label: 'Financial', icon: Landmark },
  { id: 'publisher', label: 'Publisher & Author', icon: BookOpen },
  { id: 'customer', label: 'Customer & CRM', icon: Users },
  { id: 'wholesale', label: 'Wholesale & Distribution', icon: Truck },
  { id: 'school', label: 'School & Academic', icon: GraduationCap },
  { id: 'hr', label: 'HR & Employee', icon: UserCheck },
  { id: 'branch', label: 'Branch & Location', icon: Building2 },
]

const reportDefinitions: ReportDef[] = [
  // A. Sales Reports
  { id: 'daily-sales', title: 'Daily Sales Summary', description: 'Day-by-day breakdown of sales revenue and transactions', category: 'sales', icon: Receipt, requiresDateRange: true, requiresBranchFilter: true },
  { id: 'monthly-sales', title: 'Monthly Sales Analysis', description: 'Monthly revenue, orders, and profit trends', category: 'sales', icon: Calendar, requiresDateRange: true, requiresBranchFilter: true },
  { id: 'sales-by-category', title: 'Sales by Category', description: 'Revenue breakdown by product category', category: 'sales', icon: FolderOpen, requiresDateRange: true, requiresBranchFilter: false },
  { id: 'sales-by-payment', title: 'Sales by Payment Method', description: 'Distribution of sales across payment methods', category: 'sales', icon: CreditCard, requiresDateRange: true, requiresBranchFilter: false },
  { id: 'sales-by-employee', title: 'Sales by Employee / Cashier', description: 'Individual employee sales performance', category: 'sales', icon: UserCheck, requiresDateRange: true, requiresBranchFilter: true },
  { id: 'customer-sales-history', title: 'Customer Sales History', description: 'Purchase history by customer', category: 'sales', icon: Users, requiresDateRange: true, requiresBranchFilter: false },
  { id: 'returns-refunds', title: 'Returns & Refunds Report', description: 'Summary of returned items and refund amounts', category: 'sales', icon: RefreshCw, requiresDateRange: true, requiresBranchFilter: true },
  { id: 'sales-trend', title: 'Sales Trend Analysis', description: 'Long-term sales trend patterns and forecasting', category: 'sales', icon: TrendingUp, requiresDateRange: true, requiresBranchFilter: false },

  // B. Inventory Reports
  { id: 'stock-level', title: 'Stock Level Summary', description: 'Current stock levels by category', category: 'inventory', icon: Warehouse, requiresDateRange: false, requiresBranchFilter: true },
  { id: 'low-stock-alert', title: 'Low Stock Alert Report', description: 'Items below reorder level requiring attention', category: 'inventory', icon: AlertTriangle, requiresDateRange: false, requiresBranchFilter: true },
  { id: 'inventory-valuation', title: 'Inventory Valuation Report', description: 'Total inventory value at cost and retail prices', category: 'inventory', icon: Coins, requiresDateRange: false, requiresBranchFilter: true },
  { id: 'inventory-movement', title: 'Inventory Movement Analysis', description: 'Fast, slow, and dead moving stock classification', category: 'inventory', icon: PackageCheck, requiresDateRange: true, requiresBranchFilter: false },
  { id: 'stock-adjustment', title: 'Stock Adjustment Log', description: 'Record of all stock adjustments and write-offs', category: 'inventory', icon: ClipboardList, requiresDateRange: true, requiresBranchFilter: true },
  { id: 'expiry-tracking', title: 'Expiry Tracking Report', description: 'Products nearing or past expiration dates', category: 'inventory', icon: Clock, requiresDateRange: false, requiresBranchFilter: true },
  { id: 'reorder-point', title: 'Reorder Point Report', description: 'Items at or below reorder level', category: 'inventory', icon: RefreshCw, requiresDateRange: false, requiresBranchFilter: true },

  // C. Purchase & Supplier Reports
  { id: 'purchase-order-summary', title: 'Purchase Order Summary', description: 'Overview of all purchase orders and their statuses', category: 'purchase', icon: ClipboardList, requiresDateRange: true, requiresBranchFilter: true },
  { id: 'supplier-performance', title: 'Supplier Performance Report', description: 'On-time delivery and quality metrics by supplier', category: 'purchase', icon: Award, requiresDateRange: true, requiresBranchFilter: false },
  { id: 'purchase-by-supplier', title: 'Purchase by Supplier', description: 'Spending breakdown by supplier', category: 'purchase', icon: TruckIcon, requiresDateRange: true, requiresBranchFilter: false },
  { id: 'goods-received', title: 'Goods Received Report', description: 'Summary of goods received against POs', category: 'purchase', icon: PackageCheck, requiresDateRange: true, requiresBranchFilter: true },
  { id: 'pending-purchase-orders', title: 'Pending Purchase Orders', description: 'Purchase orders awaiting fulfillment', category: 'purchase', icon: Clock, requiresDateRange: false, requiresBranchFilter: true },

  // D. Financial Reports
  { id: 'profit-loss', title: 'Profit & Loss Statement', description: 'Income statement with revenue, expenses, and net profit', category: 'financial', icon: Scale, requiresDateRange: true, requiresBranchFilter: true },
  { id: 'cash-flow', title: 'Cash Flow Report', description: 'Cash inflows and outflows over time', category: 'financial', icon: Wallet, requiresDateRange: true, requiresBranchFilter: true },
  { id: 'revenue-vs-expenses', title: 'Revenue vs Expenses', description: 'Monthly comparison of revenue against expenses', category: 'financial', icon: BarChart3, requiresDateRange: true, requiresBranchFilter: false },
  { id: 'tax-collection', title: 'Tax Collection Report', description: 'GST / Sales tax collected by period', category: 'financial', icon: Stamp, requiresDateRange: true, requiresBranchFilter: true },
  { id: 'daily-cash-register', title: 'Daily Cash Register Report', description: 'Cash register opening, closing, and variance', category: 'financial', icon: Receipt, requiresDateRange: true, requiresBranchFilter: true },
  { id: 'accounts-receivable', title: 'Accounts Receivable Aging', description: 'Outstanding receivables by aging bucket', category: 'financial', icon: DollarSign, requiresDateRange: false, requiresBranchFilter: true },
  { id: 'accounts-payable', title: 'Accounts Payable Aging', description: 'Outstanding payables by aging bucket', category: 'financial', icon: CreditCard, requiresDateRange: false, requiresBranchFilter: true },
  { id: 'expense-by-category', title: 'Expense by Category', description: 'Expense breakdown by category', category: 'financial', icon: PieChartIcon, requiresDateRange: true, requiresBranchFilter: false },

  // E. Publisher & Author Reports
  { id: 'publisher-sales', title: 'Publisher Sales Summary', description: 'Revenue and orders by publisher', category: 'publisher', icon: BookOpen, requiresDateRange: true, requiresBranchFilter: false },
  { id: 'publisher-ranking', title: 'Publisher Performance Ranking', description: 'Rank publishers by revenue, titles, and orders', category: 'publisher', icon: Award, requiresDateRange: true, requiresBranchFilter: false },
  { id: 'author-royalty', title: 'Author Royalty Report', description: 'Royalty calculations by author', category: 'publisher', icon: Star, requiresDateRange: true, requiresBranchFilter: false },
  { id: 'title-wise-sales', title: 'Title-wise Sales Report', description: 'Sales breakdown by individual book title', category: 'publisher', icon: FileText, requiresDateRange: true, requiresBranchFilter: false },

  // F. Customer & CRM Reports
  { id: 'customer-purchase-history', title: 'Customer Purchase History', description: 'Detailed purchase records per customer', category: 'customer', icon: ShoppingCart, requiresDateRange: true, requiresBranchFilter: false },
  { id: 'top-customers', title: 'Top Customers by Revenue', description: 'Highest spending customers ranked', category: 'customer', icon: Target, requiresDateRange: true, requiresBranchFilter: false },
  { id: 'loyalty-points', title: 'Customer Loyalty Points Summary', description: 'Loyalty points balance and redemptions', category: 'customer', icon: Gift, requiresDateRange: false, requiresBranchFilter: false },
  { id: 'customer-acquisition', title: 'Customer Acquisition Report', description: 'New customer sign-ups over time', category: 'customer', icon: UserCheck, requiresDateRange: true, requiresBranchFilter: false },

  // G. Wholesale & Distribution Reports
  { id: 'wholesale-order-summary', title: 'Wholesale Order Summary', description: 'Overview of all wholesale orders', category: 'wholesale', icon: Truck, requiresDateRange: true, requiresBranchFilter: true },
  { id: 'distributor-performance', title: 'Distributor Performance', description: 'Distributor delivery and order metrics', category: 'wholesale', icon: Award, requiresDateRange: true, requiresBranchFilter: false },
  { id: 'bulk-order-analysis', title: 'Bulk Order Analysis', description: 'Analysis of bulk and volume orders', category: 'wholesale', icon: Package, requiresDateRange: true, requiresBranchFilter: false },

  // H. School & Academic Reports
  { id: 'school-contract-summary', title: 'School Contract Summary', description: 'Active and expired school contracts', category: 'school', icon: School, requiresDateRange: false, requiresBranchFilter: true },
  { id: 'academic-package-sales', title: 'Academic Package Sales', description: 'Sales of academic book packages', category: 'school', icon: GraduationCap, requiresDateRange: true, requiresBranchFilter: true },
  { id: 'contract-expiry-alert', title: 'Contract Expiry Alert', description: 'Contracts nearing expiration', category: 'school', icon: AlertTriangle, requiresDateRange: false, requiresBranchFilter: true },

  // I. HR & Employee Reports
  { id: 'employee-attendance', title: 'Employee Attendance Summary', description: 'Attendance records by employee', category: 'hr', icon: Clock, requiresDateRange: true, requiresBranchFilter: true },
  { id: 'sales-by-employee-hr', title: 'Sales by Employee', description: 'Employee sales performance ranking', category: 'hr', icon: DollarSign, requiresDateRange: true, requiresBranchFilter: true },
  { id: 'employee-performance', title: 'Employee Performance Report', description: 'KPI-based employee performance', category: 'hr', icon: Award, requiresDateRange: true, requiresBranchFilter: true },
  { id: 'payroll-summary', title: 'Payroll Summary', description: 'Employee payroll and compensation', category: 'hr', icon: Wallet, requiresDateRange: true, requiresBranchFilter: true },

  // J. Branch & Location Reports
  { id: 'branch-performance', title: 'Branch Performance Comparison', description: 'Compare revenue and metrics across branches', category: 'branch', icon: Building2, requiresDateRange: true, requiresBranchFilter: false },
  { id: 'branch-revenue', title: 'Branch Revenue Summary', description: 'Revenue by branch location', category: 'branch', icon: Store, requiresDateRange: true, requiresBranchFilter: false },
  { id: 'inter-branch-transfer', title: 'Inter-branch Stock Transfer', description: 'Stock transfers between branches', category: 'branch', icon: ArrowRight, requiresDateRange: true, requiresBranchFilter: true },
]

const dateRanges = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '12m', label: 'Last 12 months' },
  { value: 'ytd', label: 'Year to date' },
]

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

// ─── Chart Configs ─────────────────────────────────────────────

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
  orders: { label: 'Orders', color: '#AF52DE' },
}

const authorChartConfig: ChartConfig = {
  sold: { label: 'Books Sold', color: '#007AFF' },
  royalties: { label: 'Royalties ($)', color: '#34C759' },
}

const financialChartConfig: ChartConfig = {
  income: { label: 'Income', color: '#007AFF' },
  expense: { label: 'Expenses', color: '#FF3B30' },
  net: { label: 'Net Profit', color: '#34C759' },
}

const paymentChartConfig: ChartConfig = {
  Cash: { label: 'Cash', color: '#007AFF' },
  Card: { label: 'Card', color: '#34C759' },
  'Bank Transfer': { label: 'Bank Transfer', color: '#FF9500' },
  Wallet: { label: 'Wallet', color: '#AF52DE' },
}

const schoolChartConfig: ChartConfig = {
  value: { label: 'Contract Value', color: '#AF52DE' },
}

const wholesaleChartConfig: ChartConfig = {
  total: { label: 'Order Value', color: '#007AFF' },
  orders: { label: 'Orders', color: '#34C759' },
}

const trendChartConfig: ChartConfig = {
  revenue: { label: 'Revenue', color: '#007AFF' },
  orders: { label: 'Orders', color: '#34C759' },
}

// ─── Utility Functions ─────────────────────────────────────────

function formatCurrency(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function getDateRangeLabel(range: string): string {
  const found = dateRanges.find((d) => d.value === range)
  return found ? found.label : 'Last 12 months'
}

function escapeCSV(value: string | number | null | undefined): string {
  const str = String(value ?? '')
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function exportToCSV(headers: { key: string; label: string }[], rows: Record<string, string | number | null | undefined>[], filename: string) {
  const headerLine = headers.map((h) => escapeCSV(h.label)).join(',')
  const dataLines = rows.map((row) =>
    headers.map((h) => escapeCSV(row[h.key])).join(',')
  )
  const csv = [headerLine, ...dataLines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

// ─── Report Header (Professional Letter-Size) ─────────────────

function ReportHeader({ title, dateRange }: { title: string; dateRange: string }) {
  return (
    <div className="print-report-header mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <BookOpen className="size-6 text-primary" strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">BookFlow OS</h2>
            <p className="text-[11px] text-muted-foreground">Enterprise Bookstore Management</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[12px] font-semibold text-foreground">{title}</p>
          <p className="text-[11px] text-muted-foreground">Period: {dateRange}</p>
          <p className="text-[11px] text-muted-foreground">Generated: {formatDate()}</p>
        </div>
      </div>
      <Separator className="mt-3" />
    </div>
  )
}

// ─── Report Footer ─────────────────────────────────────────────

function ReportFooter({ page, totalPages }: { page: number; totalPages: number }) {
  return (
    <div className="print-report-footer mt-6 pt-3 border-t border-border/50">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>BookFlow OS — Confidential</span>
        <span>Page {page} of {totalPages}</span>
        <span>Generated {formatDate()}</span>
      </div>
    </div>
  )
}

// ─── Report Toolbar ────────────────────────────────────────────

function ReportToolbar({
  dateRange,
  onDateRangeChange,
  onPrint,
  onExportCSV,
  reportTitle,
}: {
  dateRange: string
  onDateRangeChange: (v: string) => void
  onPrint: () => void
  onExportCSV: () => void
  reportTitle: string
}) {
  return (
    <div className="print-hide flex flex-wrap items-center gap-2 mb-4">
      <div className="flex items-center gap-2 mr-auto">
        <Calendar className="size-4 text-muted-foreground" strokeWidth={1.8} />
        <Select value={dateRange} onValueChange={onDateRangeChange}>
          <SelectTrigger className="h-8 w-[160px] text-[12px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {dateRanges.map((d) => (
              <SelectItem key={d.value} value={d.value} className="text-[12px]">
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <MacosButton variant="secondary" icon={Printer} onClick={onPrint}>
        Print
      </MacosButton>
      <MacosButton variant="secondary" icon={Sheet} onClick={onExportCSV}>
        Export CSV
      </MacosButton>
      <MacosButton variant="secondary" icon={Download} onClick={onPrint}>
        PDF
      </MacosButton>
    </div>
  )
}

// ─── Report Sidebar ────────────────────────────────────────────

function ReportSidebar({
  selectedReport,
  onSelectReport,
  searchQuery,
  onSearchChange,
}: {
  selectedReport: string | null
  onSelectReport: (id: string) => void
  searchQuery: string
  onSearchChange: (v: string) => void
}) {
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(
    new Set(categories.map((c) => c.id))
  )

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filteredReports = searchQuery
    ? reportDefinitions.filter(
        (r) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : reportDefinitions

  const visibleCategories = searchQuery
    ? categories.filter((c) => filteredReports.some((r) => r.category === c.id))
    : categories

  return (
    <div className="print-hide w-[260px] shrink-0 border-r border-border/50 bg-background overflow-y-auto custom-scrollbar">
      {/* Search */}
      <div className="p-3 border-b border-border/30">
        <div className="macos-search flex items-center gap-2 px-3 h-8">
          <Search className="size-3.5 text-muted-foreground/60 shrink-0" strokeWidth={2} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search reports..."
            className="flex-1 bg-transparent text-[12px] font-medium tracking-tight placeholder:text-muted-foreground/50 outline-none text-foreground"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="py-1">
        {visibleCategories.map((cat) => {
          const catReports = filteredReports.filter((r) => r.category === cat.id)
          if (catReports.length === 0) return null
          const isExpanded = expandedCategories.has(cat.id)
          const CatIcon = cat.icon

          return (
            <div key={cat.id}>
              <button
                onClick={() => toggleCategory(cat.id)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary/50 transition-colors text-left"
              >
                {isExpanded ? (
                  <ChevronDown className="size-3 text-muted-foreground shrink-0" strokeWidth={2} />
                ) : (
                  <ChevronRight className="size-3 text-muted-foreground shrink-0" strokeWidth={2} />
                )}
                <CatIcon className="size-3.5 text-muted-foreground shrink-0" strokeWidth={1.8} />
                <span className="text-[12px] font-semibold text-foreground tracking-tight">{cat.label}</span>
                <span className="ml-auto text-[10px] text-muted-foreground/50">{catReports.length}</span>
              </button>
              {isExpanded && (
                <div className="pb-1">
                  {catReports.map((report) => {
                    const isSelected = selectedReport === report.id
                    const RIcon = report.icon
                    return (
                      <button
                        key={report.id}
                        onClick={() => onSelectReport(report.id)}
                        className={`w-full flex items-center gap-2 pl-8 pr-3 py-1.5 text-left transition-colors ${
                          isSelected
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <RIcon className="size-3 shrink-0" strokeWidth={1.8} />
                        <span className="text-[11px] font-medium tracking-tight truncate">{report.title}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Loading Skeleton ──────────────────────────────────────────

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

// ─── Coming Soon Placeholder ──────────────────────────────────

function ComingSoonReport({ report }: { report: ReportDef }) {
  const RIcon = report.icon
  return (
    <div className="space-y-5">
      <ReportHeader title={report.title} dateRange="—" />
      <MacosEmptyState
        icon={RIcon}
        title={report.title}
        description={`${report.description} — This report is coming soon. Data will be available once the module is fully configured.`}
      />
      <ReportFooter page={1} totalPages={1} />
    </div>
  )
}

// ─── Individual Report Components ─────────────────────────────

// A. Sales Reports

function DailySalesReport({ data, dateRange }: { data: ReportData; dateRange: string }) {
  const { salesStats, monthlyRevenue } = data
  const csvHeaders = [
    { key: 'month', label: 'Month' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'orders', label: 'Orders' },
    { key: 'profit', label: 'Profit' },
  ]
  const csvRows = monthlyRevenue.map((m) => ({
    month: m.month,
    revenue: m.revenue,
    orders: m.orders,
    profit: m.profit,
  }))

  return (
    <div className="space-y-5">
      <ReportHeader title="Daily Sales Summary" dateRange={getDateRangeLabel(dateRange)} />
      <MacosStatGrid>
        <MacosStatCard label="Total Revenue" value={formatCurrency(salesStats.totalRevenue)} icon={DollarSign} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" />
        <MacosStatCard label="Total Orders" value={salesStats.totalOrders.toLocaleString()} icon={ShoppingCart} iconColor="text-macos-green" iconBg="bg-macos-green/10" />
        <MacosStatCard label="Avg Order Value" value={formatCurrency(salesStats.avgOrderValue)} icon={TrendingUp} iconColor="text-macos-orange" iconBg="bg-macos-orange/10" />
        <MacosStatCard label="Profit Margin" value={`${salesStats.profitMargin}%`} icon={BarChart3} iconColor="text-macos-purple" iconBg="bg-macos-purple/10" />
      </MacosStatGrid>
      <MacosCard noPadding>
        <div className="px-5 pt-5 pb-0">
          <MacosSection title="Revenue & Orders by Month" subtitle="Daily sales aggregated monthly" />
        </div>
        <div className="p-5 pt-2">
          {monthlyRevenue.length > 0 ? (
            <ChartContainer config={revenueChartConfig} className="h-72 w-full">
              <BarChart data={monthlyRevenue} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="revenue" fill="#007AFF" radius={[6, 6, 0, 0]} />
                <Bar dataKey="profit" fill="#34C759" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">No sales data available</div>
          )}
        </div>
      </MacosCard>
      <ReportFooter page={1} totalPages={1} />
      <span className="hidden" data-csv-headers={JSON.stringify(csvHeaders)} data-csv-rows={JSON.stringify(csvRows)} data-csv-filename="daily-sales-summary" />
    </div>
  )
}

function MonthlySalesReport({ data, dateRange }: { data: ReportData; dateRange: string }) {
  const { salesStats, monthlyRevenue } = data
  return (
    <div className="space-y-5">
      <ReportHeader title="Monthly Sales Analysis" dateRange={getDateRangeLabel(dateRange)} />
      <MacosStatGrid>
        <MacosStatCard label="Total Revenue" value={formatCurrency(salesStats.totalRevenue)} icon={DollarSign} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" />
        <MacosStatCard label="Total Orders" value={salesStats.totalOrders.toLocaleString()} icon={ShoppingCart} iconColor="text-macos-green" iconBg="bg-macos-green/10" />
        <MacosStatCard label="Avg Order Value" value={formatCurrency(salesStats.avgOrderValue)} icon={TrendingUp} iconColor="text-macos-orange" iconBg="bg-macos-orange/10" />
        <MacosStatCard label="Profit Margin" value={`${salesStats.profitMargin}%`} icon={BarChart3} iconColor="text-macos-purple" iconBg="bg-macos-purple/10" />
      </MacosStatGrid>
      <MacosCard noPadding>
        <div className="px-5 pt-5 pb-0">
          <MacosSection title="Monthly Revenue & Profit" subtitle="Revenue and profit trends over the selected period" />
        </div>
        <div className="p-5 pt-2">
          {monthlyRevenue.length > 0 ? (
            <ChartContainer config={revenueChartConfig} className="h-72 w-full">
              <BarChart data={monthlyRevenue} barCategoryGap="20%">
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#007AFF" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#007AFF" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34C759" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#34C759" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="revenue" fill="url(#revGrad)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="profit" fill="url(#profGrad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">No monthly data available</div>
          )}
        </div>
      </MacosCard>
      {monthlyRevenue.length > 0 && (
        <MacosCard title="Monthly Breakdown" noPadding>
          <div className="overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/50 hover:bg-transparent">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Month</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Revenue</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Orders</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyRevenue.map((m) => (
                  <TableRow key={m.month} className="macos-table-row border-b border-border/30 last:border-0">
                    <TableCell className="text-[13px] font-medium py-3">{m.month}</TableCell>
                    <TableCell className="text-[13px] text-right tabular-nums py-3">{formatCurrency(m.revenue)}</TableCell>
                    <TableCell className="text-[13px] text-right tabular-nums py-3">{m.orders.toLocaleString()}</TableCell>
                    <TableCell className="text-[13px] text-right font-medium tabular-nums py-3">{formatCurrency(m.profit)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </MacosCard>
      )}
      <ReportFooter page={1} totalPages={1} />
    </div>
  )
}

function SalesByCategoryReport({ data, dateRange }: { data: ReportData; dateRange: string }) {
  const { topProducts } = data
  const categoryMap = new Map<string, { sold: number; revenue: number }>()
  for (const p of topProducts) {
    const existing = categoryMap.get(p.category) || { sold: 0, revenue: 0 }
    existing.sold += p.sold
    existing.revenue += p.revenue
    categoryMap.set(p.category, existing)
  }
  const categoryData = Array.from(categoryMap.entries()).map(([name, d]) => ({ name, ...d }))

  return (
    <div className="space-y-5">
      <ReportHeader title="Sales by Category" dateRange={getDateRangeLabel(dateRange)} />
      <MacosCard noPadding>
        <div className="px-5 pt-5 pb-0">
          <MacosSection title="Revenue by Product Category" subtitle="Sales breakdown by category" />
        </div>
        <div className="p-5 pt-2">
          {categoryData.length > 0 ? (
            <ChartContainer config={publisherChartConfig} className="h-72 w-full">
              <BarChart data={categoryData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="#007AFF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">No category data available</div>
          )}
        </div>
      </MacosCard>
      {topProducts.length > 0 && (
        <MacosCard title="Product Details" noPadding>
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
                    <TableCell className="text-[13px] font-medium py-3">{p.name}</TableCell>
                    <TableCell className="py-3"><MacosBadge>{p.category}</MacosBadge></TableCell>
                    <TableCell className="text-[13px] text-right tabular-nums py-3">{p.sold.toLocaleString()}</TableCell>
                    <TableCell className="text-[13px] text-right font-medium tabular-nums py-3">{formatCurrency(p.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </MacosCard>
      )}
      <ReportFooter page={1} totalPages={1} />
    </div>
  )
}

function SalesByPaymentReport({ data, dateRange }: { data: ReportData; dateRange: string }) {
  const { salesByPayment, salesStats } = data
  return (
    <div className="space-y-5">
      <ReportHeader title="Sales by Payment Method" dateRange={getDateRangeLabel(dateRange)} />
      <MacosStatGrid>
        <MacosStatCard label="Total Revenue" value={formatCurrency(salesStats.totalRevenue)} icon={DollarSign} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" />
        <MacosStatCard label="Total Orders" value={salesStats.totalOrders.toLocaleString()} icon={ShoppingCart} iconColor="text-macos-green" iconBg="bg-macos-green/10" />
        <MacosStatCard label="Payment Methods" value={salesByPayment.length.toString()} icon={CreditCard} iconColor="text-macos-orange" iconBg="bg-macos-orange/10" />
        <MacosStatCard label="Avg Transaction" value={formatCurrency(salesStats.avgOrderValue)} icon={Receipt} iconColor="text-macos-purple" iconBg="bg-macos-purple/10" />
      </MacosStatGrid>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <MacosCard title="Payment Distribution" noPadding>
          {salesByPayment.length > 0 ? (
            <div className="p-5">
              <ChartContainer config={paymentChartConfig} className="h-56 w-full">
                <PieChart>
                  <Pie data={salesByPayment} dataKey="value" nameKey="method" cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} strokeWidth={0}>
                    {salesByPayment.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {salesByPayment.map((s, i) => (
                  <div key={s.method} className="flex items-center gap-2 text-[13px]">
                    <div className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-muted-foreground text-[12px]">{s.method}:</span>
                    <span className="font-medium text-[13px] tabular-nums">{formatCurrency(s.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-5 text-center text-muted-foreground text-sm">No payment data available</div>
          )}
        </MacosCard>
        <MacosCard title="Payment Breakdown" noPadding>
          {salesByPayment.length > 0 ? (
            <div className="overflow-x-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50 hover:bg-transparent">
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Method</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Amount</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesByPayment.map((s) => (
                    <TableRow key={s.method} className="macos-table-row border-b border-border/30 last:border-0">
                      <TableCell className="text-[13px] font-medium py-3">{s.method}</TableCell>
                      <TableCell className="text-[13px] text-right tabular-nums py-3">{formatCurrency(s.amount)}</TableCell>
                      <TableCell className="text-[13px] text-right py-3"><MacosBadge variant="info">{s.value}%</MacosBadge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-5 text-center text-muted-foreground text-sm">No data available</div>
          )}
        </MacosCard>
      </div>
      <ReportFooter page={1} totalPages={1} />
    </div>
  )
}

function SalesTrendReport({ data, dateRange }: { data: ReportData; dateRange: string }) {
  const { monthlyRevenue } = data
  return (
    <div className="space-y-5">
      <ReportHeader title="Sales Trend Analysis" dateRange={getDateRangeLabel(dateRange)} />
      <MacosCard noPadding>
        <div className="px-5 pt-5 pb-0">
          <MacosSection title="Revenue Trend" subtitle="Long-term revenue and order trends" />
        </div>
        <div className="p-5 pt-2">
          {monthlyRevenue.length > 0 ? (
            <ChartContainer config={trendChartConfig} className="h-72 w-full">
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="revAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#007AFF" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Area type="monotone" dataKey="revenue" stroke="#007AFF" fill="url(#revAreaGrad)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">No trend data available</div>
          )}
        </div>
      </MacosCard>
      <ReportFooter page={1} totalPages={1} />
    </div>
  )
}

// B. Inventory Reports

function StockLevelReport({ data, dateRange }: { data: ReportData; dateRange: string }) {
  const { inventoryStats, stockLevels } = data
  return (
    <div className="space-y-5">
      <ReportHeader title="Stock Level Summary" dateRange={getDateRangeLabel(dateRange)} />
      <MacosStatGrid>
        <MacosStatCard label="Total SKUs" value={inventoryStats.totalSKUs.toLocaleString()} icon={Package} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" />
        <MacosStatCard label="Low Stock" value={inventoryStats.lowStockCount.toString()} icon={AlertTriangle} iconColor="text-macos-orange" iconBg="bg-macos-orange/10" />
        <MacosStatCard label="Out of Stock" value={inventoryStats.outOfStockCount.toString()} icon={PackageX} iconColor="text-macos-red" iconBg="bg-macos-red/10" />
        <MacosStatCard label="Dead Stock" value={inventoryStats.deadStockCount.toString()} icon={FileText} iconColor="text-macos-purple" iconBg="bg-macos-purple/10" />
      </MacosStatGrid>
      <MacosCard noPadding>
        <div className="px-5 pt-5 pb-0">
          <MacosSection title="Stock Levels by Category" subtitle="Current inventory status across product categories" />
        </div>
        <div className="p-5 pt-2">
          {stockLevels.length > 0 ? (
            <ChartContainer config={stockChartConfig} className="h-72 w-full">
              <BarChart data={stockLevels} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="inStock" stackId="a" fill="#007AFF" />
                <Bar dataKey="low" stackId="a" fill="#FF9500" />
                <Bar dataKey="out" stackId="a" fill="#FF3B30" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">No inventory data available</div>
          )}
        </div>
      </MacosCard>
      <ReportFooter page={1} totalPages={1} />
    </div>
  )
}

function LowStockAlertReport({ data, dateRange }: { data: ReportData; dateRange: string }) {
  const { inventoryStats, movingItems } = data
  const lowItems = movingItems.filter((i) => i.type === 'Slow' && i.stock <= 10)
  return (
    <div className="space-y-5">
      <ReportHeader title="Low Stock Alert Report" dateRange={getDateRangeLabel(dateRange)} />
      <MacosStatGrid>
        <MacosStatCard label="Low Stock Items" value={inventoryStats.lowStockCount.toString()} icon={AlertTriangle} iconColor="text-macos-orange" iconBg="bg-macos-orange/10" />
        <MacosStatCard label="Out of Stock" value={inventoryStats.outOfStockCount.toString()} icon={PackageX} iconColor="text-macos-red" iconBg="bg-macos-red/10" />
        <MacosStatCard label="Total SKUs" value={inventoryStats.totalSKUs.toLocaleString()} icon={Package} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" />
        <MacosStatCard label="Alert Rate" value={`${inventoryStats.totalSKUs > 0 ? Math.round(((inventoryStats.lowStockCount + inventoryStats.outOfStockCount) / inventoryStats.totalSKUs) * 100) : 0}%`} icon={BarChart3} iconColor="text-macos-purple" iconBg="bg-macos-purple/10" />
      </MacosStatGrid>
      <MacosCard title="Items Requiring Attention" subtitle="Products at or below reorder level" noPadding>
        {lowItems.length > 0 ? (
          <div className="overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/50 hover:bg-transparent">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Product</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Status</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Current Stock</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Units Sold</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowItems.map((item) => (
                  <TableRow key={item.name} className="macos-table-row border-b border-border/30 last:border-0">
                    <TableCell className="text-[13px] font-medium py-3">{item.name}</TableCell>
                    <TableCell className="py-3"><MacosBadge variant={item.stock === 0 ? 'danger' : 'warning'}>{item.stock === 0 ? 'Out of Stock' : 'Low Stock'}</MacosBadge></TableCell>
                    <TableCell className="text-[13px] text-right tabular-nums py-3">{item.stock}</TableCell>
                    <TableCell className="text-[13px] text-right tabular-nums py-3">{item.sold}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-5 text-center text-muted-foreground text-sm">No low stock alerts at this time</div>
        )}
      </MacosCard>
      <ReportFooter page={1} totalPages={1} />
    </div>
  )
}

function InventoryMovementReport({ data, dateRange }: { data: ReportData; dateRange: string }) {
  const { movingItems, inventoryStats } = data
  const fastCount = movingItems.filter((i) => i.type === 'Fast').length
  const slowCount = movingItems.filter((i) => i.type === 'Slow').length
  const deadCount = movingItems.filter((i) => i.type === 'Dead').length

  return (
    <div className="space-y-5">
      <ReportHeader title="Inventory Movement Analysis" dateRange={getDateRangeLabel(dateRange)} />
      <MacosStatGrid>
        <MacosStatCard label="Fast Moving" value={fastCount.toString()} icon={ArrowUpRight} iconColor="text-macos-green" iconBg="bg-macos-green/10" />
        <MacosStatCard label="Slow Moving" value={slowCount.toString()} icon={ArrowDownRight} iconColor="text-macos-orange" iconBg="bg-macos-orange/10" />
        <MacosStatCard label="Dead Stock" value={deadCount.toString()} icon={PackageX} iconColor="text-macos-red" iconBg="bg-macos-red/10" />
        <MacosStatCard label="Total SKUs" value={inventoryStats.totalSKUs.toLocaleString()} icon={Package} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" />
      </MacosStatGrid>
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
                    <TableCell className="text-[13px] font-medium py-3">{item.name}</TableCell>
                    <TableCell className="py-3">
                      <MacosBadge variant={item.type === 'Fast' ? 'success' : item.type === 'Slow' ? 'warning' : 'danger'}>
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
          <div className="p-5 text-center text-muted-foreground text-sm">No inventory movement data available</div>
        )}
      </MacosCard>
      <ReportFooter page={1} totalPages={1} />
    </div>
  )
}

function InventoryValuationReport({ data, dateRange }: { data: ReportData; dateRange: string }) {
  const { inventoryStats, stockLevels } = data
  const totalItems = stockLevels.reduce((sum, s) => sum + s.inStock + s.low, 0)
  const estimatedValue = totalItems * 150 // Estimate

  return (
    <div className="space-y-5">
      <ReportHeader title="Inventory Valuation Report" dateRange={getDateRangeLabel(dateRange)} />
      <MacosStatGrid>
        <MacosStatCard label="Total SKUs" value={inventoryStats.totalSKUs.toLocaleString()} icon={Package} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" />
        <MacosStatCard label="Items In Stock" value={totalItems.toLocaleString()} icon={Warehouse} iconColor="text-macos-green" iconBg="bg-macos-green/10" />
        <MacosStatCard label="Estimated Value" value={formatCurrency(estimatedValue)} icon={Coins} iconColor="text-macos-orange" iconBg="bg-macos-orange/10" />
        <MacosStatCard label="Out of Stock" value={inventoryStats.outOfStockCount.toString()} icon={PackageX} iconColor="text-macos-red" iconBg="bg-macos-red/10" />
      </MacosStatGrid>
      <MacosCard title="Valuation by Category" noPadding>
        {stockLevels.length > 0 ? (
          <div className="overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/50 hover:bg-transparent">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Category</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">In Stock</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Low</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Out</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Est. Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockLevels.map((s) => (
                  <TableRow key={s.name} className="macos-table-row border-b border-border/30 last:border-0">
                    <TableCell className="text-[13px] font-medium py-3">{s.name}</TableCell>
                    <TableCell className="text-[13px] text-right tabular-nums py-3">{s.inStock}</TableCell>
                    <TableCell className="text-[13px] text-right tabular-nums py-3"><span className={s.low > 0 ? 'text-macos-orange font-medium' : ''}>{s.low}</span></TableCell>
                    <TableCell className="text-[13px] text-right tabular-nums py-3"><span className={s.out > 0 ? 'text-macos-red font-medium' : ''}>{s.out}</span></TableCell>
                    <TableCell className="text-[13px] text-right font-medium tabular-nums py-3">{formatCurrency((s.inStock + s.low) * 150)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-5 text-center text-muted-foreground text-sm">No inventory valuation data available</div>
        )}
      </MacosCard>
      <ReportFooter page={1} totalPages={1} />
    </div>
  )
}

// D. Financial Reports

function ProfitLossReport({ data, dateRange }: { data: ReportData; dateRange: string }) {
  const { financialStats, financialSummary } = data
  return (
    <div className="space-y-5">
      <ReportHeader title="Profit & Loss Statement" dateRange={getDateRangeLabel(dateRange)} />
      <MacosStatGrid>
        <MacosStatCard label="Total Income" value={formatCurrency(financialStats.totalIncome)} icon={TrendingUp} iconColor="text-macos-green" iconBg="bg-macos-green/10" />
        <MacosStatCard label="Total Expenses" value={formatCurrency(financialStats.totalExpenses)} icon={ArrowDownRight} iconColor="text-macos-red" iconBg="bg-macos-red/10" />
        <MacosStatCard label="Net Profit" value={formatCurrency(financialStats.netProfit)} icon={DollarSign} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" />
        <MacosStatCard label="Profit Margin" value={`${financialStats.profitMargin}%`} icon={Scale} iconColor="text-macos-purple" iconBg="bg-macos-purple/10" />
      </MacosStatGrid>
      <MacosCard noPadding>
        <div className="px-5 pt-5 pb-0">
          <MacosSection title="Income Statement" subtitle="Revenue, expenses, and net profit by month" />
        </div>
        <div className="p-5 pt-2">
          {financialSummary.length > 0 ? (
            <ChartContainer config={financialChartConfig} className="h-72 w-full">
              <BarChart data={financialSummary} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="income" fill="#007AFF" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="#FF3B30" radius={[6, 6, 0, 0]} />
                <Bar dataKey="net" fill="#34C759" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">No financial data available</div>
          )}
        </div>
      </MacosCard>
      {financialSummary.length > 0 && (
        <MacosCard title="Monthly P&L Breakdown" noPadding>
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
                {financialSummary.map((m) => (
                  <TableRow key={m.month} className="macos-table-row border-b border-border/30 last:border-0">
                    <TableCell className="text-[13px] font-medium py-3">{m.month}</TableCell>
                    <TableCell className="text-[13px] text-right tabular-nums py-3 text-macos-green">{formatCurrency(m.income)}</TableCell>
                    <TableCell className="text-[13px] text-right tabular-nums py-3 text-macos-red">{formatCurrency(m.expense)}</TableCell>
                    <TableCell className="text-[13px] text-right font-medium tabular-nums py-3">{formatCurrency(m.net)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </MacosCard>
      )}
      <ReportFooter page={1} totalPages={1} />
    </div>
  )
}

function RevenueVsExpensesReport({ data, dateRange }: { data: ReportData; dateRange: string }) {
  const { financialSummary } = data
  return (
    <div className="space-y-5">
      <ReportHeader title="Revenue vs Expenses" dateRange={getDateRangeLabel(dateRange)} />
      <MacosCard noPadding>
        <div className="px-5 pt-5 pb-0">
          <MacosSection title="Monthly Revenue vs Expenses" subtitle="Comparison over the selected period" />
        </div>
        <div className="p-5 pt-2">
          {financialSummary.length > 0 ? (
            <ChartContainer config={financialChartConfig} className="h-72 w-full">
              <LineChart data={financialSummary}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="income" stroke="#007AFF" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="expense" stroke="#FF3B30" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">No data available</div>
          )}
        </div>
      </MacosCard>
      <ReportFooter page={1} totalPages={1} />
    </div>
  )
}

function CashFlowReport({ data, dateRange }: { data: ReportData; dateRange: string }) {
  const { financialSummary, financialStats } = data
  return (
    <div className="space-y-5">
      <ReportHeader title="Cash Flow Report" dateRange={getDateRangeLabel(dateRange)} />
      <MacosStatGrid>
        <MacosStatCard label="Total Inflow" value={formatCurrency(financialStats.totalIncome)} icon={ArrowUpRight} iconColor="text-macos-green" iconBg="bg-macos-green/10" />
        <MacosStatCard label="Total Outflow" value={formatCurrency(financialStats.totalExpenses)} icon={ArrowDownRight} iconColor="text-macos-red" iconBg="bg-macos-red/10" />
        <MacosStatCard label="Net Cash Flow" value={formatCurrency(financialStats.netProfit)} icon={Wallet} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" />
        <MacosStatCard label="Margin" value={`${financialStats.profitMargin}%`} icon={Scale} iconColor="text-macos-purple" iconBg="bg-macos-purple/10" />
      </MacosStatGrid>
      <MacosCard noPadding>
        <div className="px-5 pt-5 pb-0">
          <MacosSection title="Cash Flow Over Time" subtitle="Inflows vs outflows by month" />
        </div>
        <div className="p-5 pt-2">
          {financialSummary.length > 0 ? (
            <ChartContainer config={financialChartConfig} className="h-72 w-full">
              <AreaChart data={financialSummary}>
                <defs>
                  <linearGradient id="cfInflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34C759" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34C759" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="cfOutflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF3B30" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF3B30" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Area type="monotone" dataKey="income" stroke="#34C759" fill="url(#cfInflow)" strokeWidth={2} />
                <Area type="monotone" dataKey="expense" stroke="#FF3B30" fill="url(#cfOutflow)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">No cash flow data available</div>
          )}
        </div>
      </MacosCard>
      <ReportFooter page={1} totalPages={1} />
    </div>
  )
}

// E. Publisher & Author Reports

function PublisherSalesReport({ data, dateRange }: { data: ReportData; dateRange: string }) {
  const { publisherStats, publisherData } = data
  return (
    <div className="space-y-5">
      <ReportHeader title="Publisher Sales Summary" dateRange={getDateRangeLabel(dateRange)} />
      <MacosStatGrid>
        <MacosStatCard label="Publishers" value={publisherStats.totalPublishers.toString()} icon={BookOpen} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" />
        <MacosStatCard label="Total Titles" value={publisherStats.totalTitles.toString()} icon={FileText} iconColor="text-macos-green" iconBg="bg-macos-green/10" />
        <MacosStatCard label="Publisher Revenue" value={formatCurrency(publisherStats.publisherRevenue)} icon={DollarSign} iconColor="text-macos-orange" iconBg="bg-macos-orange/10" />
        <MacosStatCard label="Avg Orders/Publisher" value={publisherStats.avgOrdersPerPublisher.toString()} icon={ShoppingCart} iconColor="text-macos-purple" iconBg="bg-macos-purple/10" />
      </MacosStatGrid>
      <MacosCard noPadding>
        <div className="px-5 pt-5 pb-0">
          <MacosSection title="Revenue by Publisher" subtitle="Top publishers by revenue" />
        </div>
        <div className="p-5 pt-2">
          {publisherData.length > 0 ? (
            <ChartContainer config={publisherChartConfig} className="h-72 w-full">
              <BarChart data={publisherData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="revenue" fill="#007AFF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">No publisher data available</div>
          )}
        </div>
      </MacosCard>
      {publisherData.length > 0 && (
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
                    <TableCell className="text-[13px] font-medium py-3">{p.name}</TableCell>
                    <TableCell className="text-[13px] text-right tabular-nums py-3">{p.titles}</TableCell>
                    <TableCell className="text-[13px] text-right font-medium tabular-nums py-3">{formatCurrency(p.revenue)}</TableCell>
                    <TableCell className="text-[13px] text-right tabular-nums py-3">{p.orders}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </MacosCard>
      )}
      <ReportFooter page={1} totalPages={1} />
    </div>
  )
}

function PublisherRankingReport({ data, dateRange }: { data: ReportData; dateRange: string }) {
  const { publisherData } = data
  const ranked = [...publisherData].sort((a, b) => b.revenue - a.revenue)
  return (
    <div className="space-y-5">
      <ReportHeader title="Publisher Performance Ranking" dateRange={getDateRangeLabel(dateRange)} />
      <MacosCard title="Publisher Rankings" subtitle="Ranked by revenue" noPadding>
        {ranked.length > 0 ? (
          <div className="overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/50 hover:bg-transparent">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Rank</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Publisher</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Titles</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Revenue</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Orders</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ranked.map((p, i) => (
                  <TableRow key={p.name} className="macos-table-row border-b border-border/30 last:border-0">
                    <TableCell className="py-3">
                      <MacosBadge variant={i === 0 ? 'success' : i === 1 ? 'info' : i === 2 ? 'warning' : 'default'}>
                        #{i + 1}
                      </MacosBadge>
                    </TableCell>
                    <TableCell className="text-[13px] font-medium py-3">{p.name}</TableCell>
                    <TableCell className="text-[13px] text-right tabular-nums py-3">{p.titles}</TableCell>
                    <TableCell className="text-[13px] text-right font-medium tabular-nums py-3">{formatCurrency(p.revenue)}</TableCell>
                    <TableCell className="text-[13px] text-right tabular-nums py-3">{p.orders}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-5 text-center text-muted-foreground text-sm">No publisher ranking data available</div>
        )}
      </MacosCard>
      <ReportFooter page={1} totalPages={1} />
    </div>
  )
}

function AuthorRoyaltyReport({ data, dateRange }: { data: ReportData; dateRange: string }) {
  const { authorStats, authorData } = data
  return (
    <div className="space-y-5">
      <ReportHeader title="Author Royalty Report" dateRange={getDateRangeLabel(dateRange)} />
      <MacosStatGrid>
        <MacosStatCard label="Total Authors" value={authorStats.totalAuthors.toString()} icon={Users} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" />
        <MacosStatCard label="Books Published" value={authorStats.totalBooksPublished.toString()} icon={BookOpen} iconColor="text-macos-green" iconBg="bg-macos-green/10" />
        <MacosStatCard label="Total Royalties" value={formatCurrency(authorStats.totalRoyalties)} icon={Coins} iconColor="text-macos-orange" iconBg="bg-macos-orange/10" />
        <MacosStatCard label="Avg Books/Author" value={authorStats.avgBooksPerAuthor.toString()} icon={BarChart3} iconColor="text-macos-purple" iconBg="bg-macos-purple/10" />
      </MacosStatGrid>
      <MacosCard noPadding>
        <div className="px-5 pt-5 pb-0">
          <MacosSection title="Royalties by Author" subtitle="Top authors by royalty earnings" />
        </div>
        <div className="p-5 pt-2">
          {authorData.length > 0 ? (
            <ChartContainer config={authorChartConfig} className="h-72 w-full">
              <BarChart data={authorData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="sold" fill="#007AFF" radius={[6, 6, 0, 0]} />
                <Bar dataKey="royalties" fill="#34C759" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">No author data available</div>
          )}
        </div>
      </MacosCard>
      {authorData.length > 0 && (
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
                    <TableCell className="text-[13px] font-medium py-3">{a.name}</TableCell>
                    <TableCell className="text-[13px] text-right tabular-nums py-3">{a.books}</TableCell>
                    <TableCell className="text-[13px] text-right tabular-nums py-3">{a.sold}</TableCell>
                    <TableCell className="text-[13px] text-right font-medium tabular-nums py-3">{formatCurrency(a.royalties)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </MacosCard>
      )}
      <ReportFooter page={1} totalPages={1} />
    </div>
  )
}

function TitleWiseSalesReport({ data, dateRange }: { data: ReportData; dateRange: string }) {
  const { topProducts } = data
  return (
    <div className="space-y-5">
      <ReportHeader title="Title-wise Sales Report" dateRange={getDateRangeLabel(dateRange)} />
      <MacosCard title="Book Title Sales" subtitle="Individual title sales breakdown" noPadding>
        {topProducts.length > 0 ? (
          <div className="overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/50 hover:bg-transparent">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">#</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Title</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Category</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Qty Sold</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((p, i) => (
                  <TableRow key={p.name} className="macos-table-row border-b border-border/30 last:border-0">
                    <TableCell className="py-3"><MacosBadge variant={i < 3 ? 'success' : 'default'}>#{i + 1}</MacosBadge></TableCell>
                    <TableCell className="text-[13px] font-medium py-3">{p.name}</TableCell>
                    <TableCell className="py-3"><MacosBadge>{p.category}</MacosBadge></TableCell>
                    <TableCell className="text-[13px] text-right tabular-nums py-3">{p.sold.toLocaleString()}</TableCell>
                    <TableCell className="text-[13px] text-right font-medium tabular-nums py-3">{formatCurrency(p.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-5 text-center text-muted-foreground text-sm">No title sales data available</div>
        )}
      </MacosCard>
      <ReportFooter page={1} totalPages={1} />
    </div>
  )
}

// F. Customer Reports

function TopCustomersReport({ data, dateRange }: { data: ReportData; dateRange: string }) {
  const { topProducts, salesStats } = data
  return (
    <div className="space-y-5">
      <ReportHeader title="Top Customers by Revenue" dateRange={getDateRangeLabel(dateRange)} />
      <MacosStatGrid>
        <MacosStatCard label="Total Revenue" value={formatCurrency(salesStats.totalRevenue)} icon={DollarSign} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" />
        <MacosStatCard label="Total Orders" value={salesStats.totalOrders.toLocaleString()} icon={ShoppingCart} iconColor="text-macos-green" iconBg="bg-macos-green/10" />
        <MacosStatCard label="Avg Order" value={formatCurrency(salesStats.avgOrderValue)} icon={Target} iconColor="text-macos-orange" iconBg="bg-macos-orange/10" />
        <MacosStatCard label="Margin" value={`${salesStats.profitMargin}%`} icon={BarChart3} iconColor="text-macos-purple" iconBg="bg-macos-purple/10" />
      </MacosStatGrid>
      <MacosCard title="Top Revenue Contributors" noPadding>
        {topProducts.length > 0 ? (
          <div className="overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/50 hover:bg-transparent">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">#</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Product</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Sold</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((p, i) => (
                  <TableRow key={p.name} className="macos-table-row border-b border-border/30 last:border-0">
                    <TableCell className="py-3"><MacosBadge variant={i < 3 ? 'success' : 'default'}>#{i + 1}</MacosBadge></TableCell>
                    <TableCell className="text-[13px] font-medium py-3">{p.name}</TableCell>
                    <TableCell className="text-[13px] text-right tabular-nums py-3">{p.sold.toLocaleString()}</TableCell>
                    <TableCell className="text-[13px] text-right font-medium tabular-nums py-3">{formatCurrency(p.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-5 text-center text-muted-foreground text-sm">No customer data available</div>
        )}
      </MacosCard>
      <ReportFooter page={1} totalPages={1} />
    </div>
  )
}

// G. Wholesale Reports

function WholesaleOrderSummaryReport({ data, dateRange }: { data: ReportData; dateRange: string }) {
  const { wholesaleStats, wholesaleData } = data
  return (
    <div className="space-y-5">
      <ReportHeader title="Wholesale Order Summary" dateRange={getDateRangeLabel(dateRange)} />
      <MacosStatGrid>
        <MacosStatCard label="Distributors" value={wholesaleStats.totalDistributors.toString()} icon={Truck} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" />
        <MacosStatCard label="Wholesale Orders" value={wholesaleStats.totalWholesaleOrders.toString()} icon={ShoppingCart} iconColor="text-macos-green" iconBg="bg-macos-green/10" />
        <MacosStatCard label="Wholesale Revenue" value={formatCurrency(wholesaleStats.wholesaleRevenue)} icon={DollarSign} iconColor="text-macos-orange" iconBg="bg-macos-orange/10" />
        <MacosStatCard label="Avg Order Value" value={formatCurrency(wholesaleStats.avgWholesaleOrderValue)} icon={TrendingUp} iconColor="text-macos-purple" iconBg="bg-macos-purple/10" />
      </MacosStatGrid>
      <MacosCard noPadding>
        <div className="px-5 pt-5 pb-0">
          <MacosSection title="Wholesale by Distributor" subtitle="Revenue and order count" />
        </div>
        <div className="p-5 pt-2">
          {wholesaleData.length > 0 ? (
            <ChartContainer config={wholesaleChartConfig} className="h-72 w-full">
              <BarChart data={wholesaleData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="total" fill="#007AFF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">No wholesale data available</div>
          )}
        </div>
      </MacosCard>
      {wholesaleData.length > 0 && (
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
                    <TableCell className="text-[13px] font-medium py-3">{w.name}</TableCell>
                    <TableCell className="text-[13px] text-right tabular-nums py-3">{w.orders}</TableCell>
                    <TableCell className="text-[13px] text-right font-medium tabular-nums py-3">{formatCurrency(w.total)}</TableCell>
                    <TableCell className="py-3"><MacosBadge variant={w.status === 'Active' ? 'success' : 'warning'}>{w.status}</MacosBadge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </MacosCard>
      )}
      <ReportFooter page={1} totalPages={1} />
    </div>
  )
}

// H. School Reports

function SchoolContractSummaryReport({ data, dateRange }: { data: ReportData; dateRange: string }) {
  const { schoolStats, schoolContractData } = data
  return (
    <div className="space-y-5">
      <ReportHeader title="School Contract Summary" dateRange={getDateRangeLabel(dateRange)} />
      <MacosStatGrid>
        <MacosStatCard label="Total Schools" value={schoolStats.totalSchools.toString()} icon={School} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" />
        <MacosStatCard label="Active Contracts" value={schoolStats.activeContracts.toString()} icon={ClipboardList} iconColor="text-macos-green" iconBg="bg-macos-green/10" />
        <MacosStatCard label="Contract Value" value={formatCurrency(schoolStats.totalContractValue)} icon={DollarSign} iconColor="text-macos-orange" iconBg="bg-macos-orange/10" />
        <MacosStatCard label="Avg Value/School" value={schoolStats.totalSchools > 0 ? formatCurrency(schoolStats.totalContractValue / schoolStats.totalSchools) : '$0'} icon={TrendingUp} iconColor="text-macos-purple" iconBg="bg-macos-purple/10" />
      </MacosStatGrid>
      <MacosCard noPadding>
        <div className="px-5 pt-5 pb-0">
          <MacosSection title="Contracts by School" subtitle="School contract values and status" />
        </div>
        <div className="p-5 pt-2">
          {schoolContractData.length > 0 ? (
            <ChartContainer config={schoolChartConfig} className="h-72 w-full">
              <BarChart data={schoolContractData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="#AF52DE" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">No school data available</div>
          )}
        </div>
      </MacosCard>
      {schoolContractData.length > 0 && (
        <MacosCard title="School Details" noPadding>
          <div className="overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/50 hover:bg-transparent">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">School</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Contracts</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Value</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schoolContractData.map((s) => (
                  <TableRow key={s.name} className="macos-table-row border-b border-border/30 last:border-0">
                    <TableCell className="text-[13px] font-medium py-3">{s.name}</TableCell>
                    <TableCell className="text-[13px] text-right tabular-nums py-3">{s.items}</TableCell>
                    <TableCell className="text-[13px] text-right font-medium tabular-nums py-3">{formatCurrency(s.value)}</TableCell>
                    <TableCell className="py-3"><MacosBadge variant={s.status === 'Active' ? 'success' : s.status === 'Expiring' ? 'warning' : 'danger'}>{s.status}</MacosBadge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </MacosCard>
      )}
      <ReportFooter page={1} totalPages={1} />
    </div>
  )
}

// ─── Report Content Router ─────────────────────────────────────

function ReportContent({ reportId, data, dateRange }: { reportId: string; data: ReportData; dateRange: string }) {
  const report = reportDefinitions.find((r) => r.id === reportId)
  if (!report) return <ComingSoonReport report={{ id: reportId, title: 'Unknown Report', description: '', category: 'sales', icon: FileText, requiresDateRange: false, requiresBranchFilter: false }} />

  switch (reportId) {
    // Sales
    case 'daily-sales': return <DailySalesReport data={data} dateRange={dateRange} />
    case 'monthly-sales': return <MonthlySalesReport data={data} dateRange={dateRange} />
    case 'sales-by-category': return <SalesByCategoryReport data={data} dateRange={dateRange} />
    case 'sales-by-payment': return <SalesByPaymentReport data={data} dateRange={dateRange} />
    case 'sales-trend': return <SalesTrendReport data={data} dateRange={dateRange} />
    // Inventory
    case 'stock-level': return <StockLevelReport data={data} dateRange={dateRange} />
    case 'low-stock-alert': return <LowStockAlertReport data={data} dateRange={dateRange} />
    case 'inventory-movement': return <InventoryMovementReport data={data} dateRange={dateRange} />
    case 'inventory-valuation': return <InventoryValuationReport data={data} dateRange={dateRange} />
    // Financial
    case 'profit-loss': return <ProfitLossReport data={data} dateRange={dateRange} />
    case 'cash-flow': return <CashFlowReport data={data} dateRange={dateRange} />
    case 'revenue-vs-expenses': return <RevenueVsExpensesReport data={data} dateRange={dateRange} />
    // Publisher
    case 'publisher-sales': return <PublisherSalesReport data={data} dateRange={dateRange} />
    case 'publisher-ranking': return <PublisherRankingReport data={data} dateRange={dateRange} />
    case 'author-royalty': return <AuthorRoyaltyReport data={data} dateRange={dateRange} />
    case 'title-wise-sales': return <TitleWiseSalesReport data={data} dateRange={dateRange} />
    // Customer
    case 'top-customers': return <TopCustomersReport data={data} dateRange={dateRange} />
    // Wholesale
    case 'wholesale-order-summary': return <WholesaleOrderSummaryReport data={data} dateRange={dateRange} />
    // School
    case 'school-contract-summary': return <SchoolContractSummaryReport data={data} dateRange={dateRange} />
    // All others: coming soon
    default: return <ComingSoonReport report={report} />
  }
}

// ─── Report Dashboard (No report selected) ────────────────────

function ReportDashboard({ data, onSelectReport }: { data: ReportData; onSelectReport: (id: string) => void }) {
  const quickStats = [
    { label: 'Total Revenue', value: formatCurrency(data.salesStats.totalRevenue), icon: DollarSign, color: 'text-macos-blue', bg: 'bg-macos-blue/10', reportId: 'monthly-sales' },
    { label: 'Total Orders', value: data.salesStats.totalOrders.toLocaleString(), icon: ShoppingCart, color: 'text-macos-green', bg: 'bg-macos-green/10', reportId: 'daily-sales' },
    { label: 'Net Profit', value: formatCurrency(data.financialStats.netProfit), icon: TrendingUp, color: 'text-macos-orange', bg: 'bg-macos-orange/10', reportId: 'profit-loss' },
    { label: 'Total SKUs', value: data.inventoryStats.totalSKUs.toLocaleString(), icon: Package, color: 'text-macos-purple', bg: 'bg-macos-purple/10', reportId: 'stock-level' },
    { label: 'Low Stock', value: data.inventoryStats.lowStockCount.toString(), icon: AlertTriangle, color: 'text-macos-orange', bg: 'bg-macos-orange/10', reportId: 'low-stock-alert' },
    { label: 'Publishers', value: data.publisherStats.totalPublishers.toString(), icon: BookOpen, color: 'text-macos-blue', bg: 'bg-macos-blue/10', reportId: 'publisher-sales' },
    { label: 'Authors', value: data.authorStats.totalAuthors.toString(), icon: Users, color: 'text-macos-green', bg: 'bg-macos-green/10', reportId: 'author-royalty' },
    { label: 'Schools', value: data.schoolStats.totalSchools.toString(), icon: GraduationCap, color: 'text-macos-purple', bg: 'bg-macos-purple/10', reportId: 'school-contract-summary' },
  ]

  const recentReports = [
    { id: 'monthly-sales', title: 'Monthly Sales Analysis', icon: Calendar, category: 'Sales' },
    { id: 'profit-loss', title: 'Profit & Loss Statement', icon: Scale, category: 'Financial' },
    { id: 'stock-level', title: 'Stock Level Summary', icon: Warehouse, category: 'Inventory' },
    { id: 'publisher-sales', title: 'Publisher Sales Summary', icon: BookOpen, category: 'Publisher' },
    { id: 'sales-by-payment', title: 'Sales by Payment Method', icon: CreditCard, category: 'Sales' },
    { id: 'author-royalty', title: 'Author Royalty Report', icon: Star, category: 'Publisher' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-foreground">Report Center</h2>
        <p className="text-[13px] text-muted-foreground mt-0.5">Select a report from the sidebar or choose from quick access below</p>
      </div>

      {/* Quick Stats Grid */}
      <MacosStatGrid>
        {quickStats.map((stat) => {
          const SIcon = stat.icon
          return (
            <button
              key={stat.reportId}
              onClick={() => onSelectReport(stat.reportId)}
              className="macos-stat macos-card-hover text-left group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`flex size-9 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${stat.bg}`}>
                  <SIcon className={`size-[18px] ${stat.color}`} strokeWidth={1.8} />
                </div>
                <ArrowRight className="size-3 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" strokeWidth={2} />
              </div>
              <div className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</div>
              <div className="text-[12px] font-medium text-muted-foreground mt-0.5">{stat.label}</div>
            </button>
          )
        })}
      </MacosStatGrid>

      {/* Recent / Popular Reports */}
      <MacosCard title="Quick Access Reports" subtitle="Frequently used reports">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentReports.map((r) => {
            const RIcon = r.icon
            return (
              <button
                key={r.id}
                onClick={() => onSelectReport(r.id)}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-secondary shrink-0">
                  <RIcon className="size-4 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold tracking-tight text-foreground truncate">{r.title}</p>
                  <p className="text-[10px] text-muted-foreground">{r.category}</p>
                </div>
                <ChevronRight className="size-3 text-muted-foreground/30 group-hover:text-primary shrink-0 ml-auto transition-colors" strokeWidth={2} />
              </button>
            )
          })}
        </div>
      </MacosCard>

      {/* Category Overview */}
      <MacosCard title="Report Categories" subtitle="Browse all report types">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {categories.map((cat) => {
            const CIcon = cat.icon
            const count = reportDefinitions.filter((r) => r.category === cat.id).length
            return (
              <div key={cat.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50">
                <div className="flex size-8 items-center justify-center rounded-lg bg-secondary shrink-0">
                  <CIcon className="size-4 text-muted-foreground" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-[12px] font-semibold tracking-tight text-foreground">{cat.label}</p>
                  <p className="text-[10px] text-muted-foreground">{count} reports</p>
                </div>
              </div>
            )
          })}
        </div>
      </MacosCard>
    </div>
  )
}

// ─── Main Module Component ─────────────────────────────────────

export function ReportsModule() {
  const { user } = useAppStore()
  const [selectedReport, setSelectedReport] = React.useState<string | null>(null)
  const [dateRange, setDateRange] = React.useState('12m')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [reportData, setReportData] = React.useState<ReportData>(emptyData)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const tenantId = user?.tenantId || ''

  // Fetch report data
  React.useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (tenantId) params.set('tenantId', tenantId)
        params.set('range', dateRange)
        const res = await fetch(`/api/reports?${params.toString()}`)
        const json = await res.json()
        if (!cancelled && json.success) {
          setReportData(json.data)
        } else if (!cancelled) {
          setError('Failed to load report data')
        }
      } catch {
        if (!cancelled) setError('Network error loading reports')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [tenantId, dateRange])

  const handlePrint = React.useCallback(() => {
    window.print()
  }, [])

  const handleExportCSV = React.useCallback(() => {
    if (!selectedReport) return
    const report = reportDefinitions.find((r) => r.id === selectedReport)
    if (!report) return

    // Build CSV data based on the report type
    let headers: { key: string; label: string }[] = []
    let rows: Record<string, string | number | null | undefined>[] = []
    let filename = report.id

    switch (selectedReport) {
      case 'daily-sales':
      case 'monthly-sales':
        headers = [
          { key: 'month', label: 'Month' },
          { key: 'revenue', label: 'Revenue' },
          { key: 'orders', label: 'Orders' },
          { key: 'profit', label: 'Profit' },
        ]
        rows = reportData.monthlyRevenue.map((m) => ({ month: m.month, revenue: m.revenue, orders: m.orders, profit: m.profit }))
        break
      case 'sales-by-payment':
        headers = [
          { key: 'method', label: 'Payment Method' },
          { key: 'amount', label: 'Amount' },
          { key: 'value', label: 'Share %' },
        ]
        rows = reportData.salesByPayment.map((s) => ({ method: s.method, amount: s.amount, value: s.value }))
        break
      case 'sales-by-category':
        headers = [
          { key: 'name', label: 'Product' },
          { key: 'category', label: 'Category' },
          { key: 'sold', label: 'Sold' },
          { key: 'revenue', label: 'Revenue' },
        ]
        rows = reportData.topProducts.map((p) => ({ name: p.name, category: p.category, sold: p.sold, revenue: p.revenue }))
        break
      case 'stock-level':
      case 'low-stock-alert':
      case 'inventory-valuation':
        headers = [
          { key: 'name', label: 'Category' },
          { key: 'inStock', label: 'In Stock' },
          { key: 'low', label: 'Low' },
          { key: 'out', label: 'Out' },
        ]
        rows = reportData.stockLevels.map((s) => ({ name: s.name, inStock: s.inStock, low: s.low, out: s.out }))
        break
      case 'inventory-movement':
        headers = [
          { key: 'name', label: 'Product' },
          { key: 'type', label: 'Movement' },
          { key: 'sold', label: 'Sold' },
          { key: 'stock', label: 'Current Stock' },
        ]
        rows = reportData.movingItems.map((i) => ({ name: i.name, type: i.type, sold: i.sold, stock: i.stock }))
        break
      case 'profit-loss':
      case 'cash-flow':
      case 'revenue-vs-expenses':
        headers = [
          { key: 'month', label: 'Month' },
          { key: 'income', label: 'Income' },
          { key: 'expense', label: 'Expenses' },
          { key: 'net', label: 'Net Profit' },
        ]
        rows = reportData.financialSummary.map((m) => ({ month: m.month, income: m.income, expense: m.expense, net: m.net }))
        break
      case 'publisher-sales':
      case 'publisher-ranking':
        headers = [
          { key: 'name', label: 'Publisher' },
          { key: 'titles', label: 'Titles' },
          { key: 'revenue', label: 'Revenue' },
          { key: 'orders', label: 'Orders' },
        ]
        rows = reportData.publisherData.map((p) => ({ name: p.name, titles: p.titles, revenue: p.revenue, orders: p.orders }))
        break
      case 'author-royalty':
        headers = [
          { key: 'name', label: 'Author' },
          { key: 'books', label: 'Books' },
          { key: 'sold', label: 'Sold' },
          { key: 'royalties', label: 'Royalties' },
        ]
        rows = reportData.authorData.map((a) => ({ name: a.name, books: a.books, sold: a.sold, royalties: a.royalties }))
        break
      case 'title-wise-sales':
        headers = [
          { key: 'name', label: 'Title' },
          { key: 'category', label: 'Category' },
          { key: 'sold', label: 'Sold' },
          { key: 'revenue', label: 'Revenue' },
        ]
        rows = reportData.topProducts.map((p) => ({ name: p.name, category: p.category, sold: p.sold, revenue: p.revenue }))
        break
      case 'wholesale-order-summary':
        headers = [
          { key: 'name', label: 'Distributor' },
          { key: 'orders', label: 'Orders' },
          { key: 'total', label: 'Total Value' },
          { key: 'status', label: 'Status' },
        ]
        rows = reportData.wholesaleData.map((w) => ({ name: w.name, orders: w.orders, total: w.total, status: w.status }))
        break
      case 'school-contract-summary':
        headers = [
          { key: 'name', label: 'School' },
          { key: 'items', label: 'Contracts' },
          { key: 'value', label: 'Value' },
          { key: 'status', label: 'Status' },
        ]
        rows = reportData.schoolContractData.map((s) => ({ name: s.name, items: s.items, value: s.value, status: s.status }))
        break
      default:
        // Generic export for coming-soon reports
        headers = [{ key: 'info', label: 'Info' }]
        rows = [{ info: 'Report data not yet available' }]
        filename = `${report.id}-placeholder`
        break
    }

    exportToCSV(headers, rows, filename)
  }, [selectedReport, reportData])

  const selectedReportDef = selectedReport ? reportDefinitions.find((r) => r.id === selectedReport) : null

  return (
    <div className="flex flex-col h-full">
      {/* Print CSS */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-report-area, .print-report-area * { visibility: visible; }
          .print-report-area { position: absolute; left: 0; top: 0; width: 100%; }
          .print-hide { display: none !important; }
          .print-report-header { position: running(header); }
          .print-report-footer { position: running(footer); }
          @page {
            size: A4;
            margin: 1in 0.75in;
          }
          .macos-card, .macos-shadow-card {
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
            border-radius: 0 !important;
          }
          .macos-stat {
            border: 1px solid #e5e7eb !important;
            box-shadow: none !important;
          }
          table { border-collapse: collapse; }
          th, td { border: 1px solid #d1d5db !important; padding: 6px 10px !important; }
          th { background: #f3f4f6 !important; color: #111827 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          * { color-adjust: exact; -webkit-print-color-adjust: exact; }
        }
      `}</style>

      {/* Page Header */}
      <div className="print-hide">
        <MacosPageHeader
          title="Reports"
          subtitle="Comprehensive business analytics and reporting"
          icon={BarChart3}
          iconColor="text-macos-blue"
          iconBg="bg-macos-blue/10"
        >
          <MacosBadge variant="info">
            <Activity className="size-3 mr-1" />
            {reportDefinitions.length} Reports
          </MacosBadge>
        </MacosPageHeader>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 min-h-0 mt-4 -mx-6 -mb-6">
        {/* Sidebar */}
        <ReportSidebar
          selectedReport={selectedReport}
          onSelectReport={setSelectedReport}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 print-report-area">
          {selectedReport && selectedReportDef ? (
            <>
              {/* Report Toolbar */}
              <ReportToolbar
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                onPrint={handlePrint}
                onExportCSV={handleExportCSV}
                reportTitle={selectedReportDef.title}
              />

              {/* Report Title Bar */}
              <div className="print-hide flex items-center gap-2 mb-4">
                {React.createElement(selectedReportDef.icon, { className: 'size-5 text-primary', strokeWidth: 1.8 })}
                <div>
                  <h2 className="text-[15px] font-bold tracking-tight text-foreground">{selectedReportDef.title}</h2>
                  <p className="text-[11px] text-muted-foreground">{selectedReportDef.description}</p>
                </div>
              </div>

              {/* Report Content */}
              {loading ? (
                <ReportSkeleton />
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <AlertTriangle className="size-10 text-macos-red/30 mb-3" strokeWidth={1.2} />
                  <p className="text-[13px] text-muted-foreground mb-3">{error}</p>
                  <MacosButton variant="primary" icon={RefreshCw} onClick={() => setDateRange(dateRange)}>
                    Retry
                  </MacosButton>
                </div>
              ) : (
                <ReportContent reportId={selectedReport} data={reportData} dateRange={dateRange} />
              )}
            </>
          ) : (
            // Dashboard when no report selected
            loading ? (
              <ReportSkeleton />
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20">
                <AlertTriangle className="size-10 text-macos-red/30 mb-3" strokeWidth={1.2} />
                <p className="text-[13px] text-muted-foreground mb-3">{error}</p>
                <MacosButton variant="primary" icon={RefreshCw} onClick={() => setDateRange(dateRange)}>
                  Retry
                </MacosButton>
              </div>
            ) : (
              <ReportDashboard data={reportData} onSelectReport={setSelectedReport} />
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default ReportsModule
