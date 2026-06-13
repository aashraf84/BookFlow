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
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

// Report categories
const reportCategories = [
  { id: 'sales', label: 'Sales', icon: DollarSign },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'publisher', label: 'Publisher', icon: BookOpen },
  { id: 'author', label: 'Author', icon: Users },
  { id: 'wholesale', label: 'Wholesale', icon: Truck },
  { id: 'school', label: 'School Contracts', icon: GraduationCap },
  { id: 'financial', label: 'Financial', icon: TrendingUp },
] as const

type ReportCategory = typeof reportCategories[number]['id']

// Colors for charts (emerald/teal palette)
const CHART_COLORS = ['#10b981', '#14b8a6', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1']

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
  { name: 'St. Mary\'s School', value: 15000, items: 280, status: 'Active' },
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

// Date range options
const dateRanges = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '12m', label: 'Last 12 months' },
  { value: 'ytd', label: 'Year to date' },
]

// Sub-components

function MetricCard({ title, value, change, up, icon: Icon, color }: {
  title: string; value: string; change?: string; up?: boolean
  icon: React.ElementType; color: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <div className="flex items-center gap-1 text-xs">
                {up ? <ArrowUpRight className="size-3 text-emerald-600" /> : <ArrowDownRight className="size-3 text-rose-500" />}
                <span className={up ? 'text-emerald-600 font-medium' : 'text-rose-500 font-medium'}>{change}</span>
              </div>
            )}
          </div>
          <div className={`rounded-lg p-2.5 ${color}`}>
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SalesReport() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Revenue" value="$682,000" change="+12.5%" up icon={DollarSign} color="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30" />
        <MetricCard title="Total Orders" value="5,045" change="+8.2%" up icon={ShoppingCart} color="bg-teal-100 text-teal-600 dark:bg-teal-950/30" />
        <MetricCard title="Avg Order Value" value="$135.18" change="+3.1%" up icon={TrendingUp} color="bg-amber-100 text-amber-600 dark:bg-amber-950/30" />
        <MetricCard title="Profit Margin" value="30.2%" change="-1.4%" up={false} icon={BarChart3} color="bg-rose-100 text-rose-600 dark:bg-rose-950/30" />
      </div>

      {/* Monthly Revenue Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Monthly Revenue & Profit</CardTitle>
          <CardDescription>Revenue and profit trends over the past 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Profit" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Products</CardTitle>
            <CardDescription>Best selling products by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Sold</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((p) => (
                  <TableRow key={p.name}>
                    <TableCell className="font-medium text-sm">{p.name}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{p.category}</Badge></TableCell>
                    <TableCell className="text-right">{p.sold.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium">${p.revenue.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Sales by Payment */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sales by Payment Method</CardTitle>
            <CardDescription>Distribution of sales across payment methods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesByPayment}
                    dataKey="value"
                    nameKey="method"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ method, value }: { method: string; value: number }) => `${method} ${value}%`}
                  >
                    {salesByPayment.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value}%`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {salesByPayment.map((s, i) => (
                <div key={s.method} className="flex items-center gap-2 text-sm">
                  <div className="size-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                  <span className="text-muted-foreground">{s.method}:</span>
                  <span className="font-medium">${s.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function InventoryReport() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total SKUs" value="4,238" change="+5.2%" up icon={Package} color="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30" />
        <MetricCard title="Low Stock Items" value="120" change="+12" up={false} icon={BarChart3} color="bg-amber-100 text-amber-600 dark:bg-amber-950/30" />
        <MetricCard title="Out of Stock" value="45" change="-8" up icon={TrendingUp} color="bg-rose-100 text-rose-600 dark:bg-rose-950/30" />
        <MetricCard title="Dead Stock" value="23" change="+3" up={false} icon={FileText} color="bg-purple-100 text-purple-600 dark:bg-purple-950/30" />
      </div>

      {/* Stock Levels Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Stock Levels by Category</CardTitle>
          <CardDescription>Current inventory status across product categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockLevels}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="inStock" name="In Stock" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="low" name="Low Stock" fill="#f59e0b" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="out" name="Out of Stock" fill="#ef4444" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Moving Items Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Fast / Slow / Dead Moving Items</CardTitle>
          <CardDescription>Product movement analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Movement</TableHead>
                <TableHead className="text-right">Units Sold</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movingItems.map((item) => (
                <TableRow key={item.name}>
                  <TableCell className="font-medium text-sm">{item.name}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        item.type === 'Fast' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' :
                        item.type === 'Slow' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' :
                        'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                      }
                    >
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{item.sold}</TableCell>
                  <TableCell className="text-right">{item.stock}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function PublisherReport() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Publishers" value="24" change="+3" up icon={BookOpen} color="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30" />
        <MetricCard title="Total Titles" value="145" change="+12" up icon={FileText} color="bg-teal-100 text-teal-600 dark:bg-teal-950/30" />
        <MetricCard title="Publisher Revenue" value="$287,000" change="+9.3%" up icon={DollarSign} color="bg-amber-100 text-amber-600 dark:bg-amber-950/30" />
        <MetricCard title="Avg Orders/Pub" value="210" change="+5.1%" up icon={ShoppingCart} color="bg-rose-100 text-rose-600 dark:bg-rose-950/30" />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Publisher Performance</CardTitle>
          <CardDescription>Revenue and order distribution by publisher</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={publisherData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" width={150} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Publisher Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Publisher</TableHead>
                <TableHead className="text-right">Titles</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Orders</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {publisherData.map((p) => (
                <TableRow key={p.name}>
                  <TableCell className="font-medium text-sm">{p.name}</TableCell>
                  <TableCell className="text-right">{p.titles}</TableCell>
                  <TableCell className="text-right font-medium">${p.revenue.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{p.orders}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function AuthorReport() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Authors" value="56" change="+8" up icon={Users} color="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30" />
        <MetricCard title="Books Published" value="89" change="+6" up icon={BookOpen} color="bg-teal-100 text-teal-600 dark:bg-teal-950/30" />
        <MetricCard title="Total Royalties" value="$58,500" change="+4.2%" up icon={DollarSign} color="bg-amber-100 text-amber-600 dark:bg-amber-950/30" />
        <MetricCard title="Avg Books/Author" value="1.6" change="+0.3" up icon={BarChart3} color="bg-rose-100 text-rose-600 dark:bg-rose-950/30" />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Top Authors by Sales</CardTitle>
          <CardDescription>Author performance and royalty overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={authorData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="sold" name="Books Sold" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="royalties" name="Royalties ($)" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Author</TableHead>
                <TableHead className="text-right">Books</TableHead>
                <TableHead className="text-right">Sold</TableHead>
                <TableHead className="text-right">Royalties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {authorData.map((a) => (
                <TableRow key={a.name}>
                  <TableCell className="font-medium text-sm">{a.name}</TableCell>
                  <TableCell className="text-right">{a.books}</TableCell>
                  <TableCell className="text-right">{a.sold.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium">${a.royalties.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function WholesaleReport() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Distributors" value="12" change="+2" up icon={Truck} color="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30" />
        <MetricCard title="Wholesale Orders" value="62" change="+8" up icon={ShoppingCart} color="bg-teal-100 text-teal-600 dark:bg-teal-950/30" />
        <MetricCard title="Wholesale Revenue" value="$124,000" change="+15.2%" up icon={DollarSign} color="bg-amber-100 text-amber-600 dark:bg-amber-950/30" />
        <MetricCard title="Avg Order Value" value="$2,000" change="+3.8%" up icon={TrendingUp} color="bg-rose-100 text-rose-600 dark:bg-rose-950/30" />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Distributor Performance</CardTitle>
          <CardDescription>Orders and revenue by wholesale partner</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={wholesaleData}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, total }: { name: string; total: number }) => `$${(total / 1000).toFixed(0)}k`}
                >
                  {wholesaleData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Total']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Distributor</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wholesaleData.map((w) => (
                <TableRow key={w.name}>
                  <TableCell className="font-medium text-sm">{w.name}</TableCell>
                  <TableCell className="text-right">{w.orders}</TableCell>
                  <TableCell className="text-right font-medium">${w.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={w.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'}>
                      {w.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function SchoolContractReport() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Schools" value="18" change="+4" up icon={GraduationCap} color="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30" />
        <MetricCard title="Active Contracts" value="14" change="+2" up icon={FileText} color="bg-teal-100 text-teal-600 dark:bg-teal-950/30" />
        <MetricCard title="Contract Value" value="$70,000" change="+18.5%" up icon={DollarSign} color="bg-amber-100 text-amber-600 dark:bg-amber-950/30" />
        <MetricCard title="Items Supplied" value="1,260" change="+9.2%" up icon={Package} color="bg-rose-100 text-rose-600 dark:bg-rose-950/30" />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Contract Value by School</CardTitle>
          <CardDescription>Revenue distribution across school partnerships</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={schoolContractData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']} />
                <Bar dataKey="value" name="Contract Value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>School</TableHead>
                <TableHead className="text-right">Contract Value</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schoolContractData.map((s) => (
                <TableRow key={s.name}>
                  <TableCell className="font-medium text-sm">{s.name}</TableCell>
                  <TableCell className="text-right font-medium">${s.value.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{s.items}</TableCell>
                  <TableCell>
                    <Badge className={s.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'}>
                      {s.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function FinancialReport() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Income" value="$296,000" change="+10.5%" up icon={TrendingUp} color="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30" />
        <MetricCard title="Total Expenses" value="$207,200" change="+8.3%" up icon={DollarSign} color="bg-rose-100 text-rose-600 dark:bg-rose-950/30" />
        <MetricCard title="Net Profit" value="$88,800" change="+15.8%" up icon={BarChart3} color="bg-teal-100 text-teal-600 dark:bg-teal-950/30" />
        <MetricCard title="Profit Margin" value="30.0%" change="+2.1%" up icon={FileText} color="bg-amber-100 text-amber-600 dark:bg-amber-950/30" />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Income vs Expenses</CardTitle>
          <CardDescription>Monthly financial trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={financialSummary}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                <Legend />
                <Line type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
                <Line type="monotone" dataKey="expense" name="Expenses" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 4 }} />
                <Line type="monotone" dataKey="net" name="Net Profit" stroke="#14b8a6" strokeWidth={2} dot={{ fill: '#14b8a6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Financial Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Income</TableHead>
                <TableHead className="text-right">Expenses</TableHead>
                <TableHead className="text-right">Net Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {financialSummary.map((f) => (
                <TableRow key={f.month}>
                  <TableCell className="font-medium text-sm">{f.month}</TableCell>
                  <TableCell className="text-right text-emerald-600">${f.income.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-rose-500">${f.expense.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium text-teal-600">${f.net.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// Main Reports Component
export function ReportsModule() {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Reports & Analytics</h2>
          <p className="text-sm text-muted-foreground">Comprehensive business intelligence and reporting</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-muted-foreground" />
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px] h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateRanges.map((dr) => (
                <SelectItem key={dr.value} value={dr.value}>{dr.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="size-3.5" />
            Export
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {reportCategories.map((cat) => {
          const Icon = cat.icon
          const isActive = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="size-3.5" />
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Report Content */}
      {renderReport()}
    </div>
  )
}
