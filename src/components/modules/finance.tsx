'use client'

import * as React from 'react'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Wallet,
  BookOpen,
  Plus,
  Trash2,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  FileText,
  CreditCard,
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  PieChart,
  Activity,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { useAppStore } from '@/store/app-store'
import {
  MacosPageHeader,
  MacosStatCard,
  MacosSearch,
  MacosFilterBar,
  MacosButton,
  MacosBadge,
  MacosEmptyState,
  MacosDialog,
  MacosFormField,
  MacosStatGrid,
} from '@/components/macos-ui'

// ==================== TYPES ====================

interface Account {
  id: string
  code: string
  name: string
  type: string
  parentCode?: string | null
  balance: number
  isActive: boolean
}

interface JournalEntryLine {
  id: string
  accountId: string
  account?: { id: string; code: string; name: string; type: string }
  debit: number
  credit: number
  description?: string | null
}

interface JournalEntry {
  id: string
  date: string
  description: string
  reference?: string | null
  isPosted: boolean
  createdAt: string
  lines: JournalEntryLine[]
}

interface Expense {
  id: string
  category: string
  amount: number
  date: string
  description?: string | null
  paidBy?: string | null
  receipt?: string | null
  status: string
  createdAt: string
}

// ==================== CHART COLORS ====================

const CHART_COLORS = {
  blue: '#007AFF',
  green: '#34C759',
  orange: '#FF9500',
  red: '#FF3B30',
  purple: '#AF52DE',
  teal: '#5AC8FA',
  bridge: '#C0392B',
  golden: '#D4A853',
  bay: '#2D5F8A',
  sunset: '#FF6B35',
}

// ==================== FINANCE MODULE ====================

export function FinanceModule() {
  const [activeTab, setActiveTab] = React.useState('overview')
  const tabs = [
    { id: 'overview', label: 'Overview', count: undefined },
    { id: 'accounts', label: 'Accounts', count: undefined },
    { id: 'entries', label: 'Journal', count: undefined },
    { id: 'expenses', label: 'Expenses', count: undefined },
  ]

  return (
    <div className="space-y-5">
      <MacosPageHeader
        title="Finance"
        subtitle="Financial management, accounting, and reporting"
        icon={DollarSign}
        iconColor="text-macos-green"
        iconBg="bg-macos-green/10"
      />

      <MacosFilterBar
        items={tabs}
        activeId={activeTab}
        onChange={setActiveTab}
      />

      <div>
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'accounts' && <AccountsTab />}
        {activeTab === 'entries' && <JournalEntriesTab />}
        {activeTab === 'expenses' && <ExpensesTab />}
      </div>
    </div>
  )
}

// ==================== OVERVIEW TAB ====================

interface ChartData {
  revenueExpenseData: { month: string; revenue: number; expenses: number }[]
  cashFlowData: { month: string; inflow: number; outflow: number }[]
  trends: {
    revenue: number
    expenses: number
    netIncome: number
  }
}

function OverviewTab() {
  const [accounts, setAccounts] = React.useState<Account[]>([])
  const [expenses, setExpenses] = React.useState<Expense[]>([])
  const [chartData, setChartData] = React.useState<ChartData | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [accRes, expRes, chartsRes] = await Promise.all([
          fetch('/api/finance?type=accounts&limit=100'),
          fetch('/api/finance?type=expenses&limit=100'),
          fetch('/api/finance?type=charts'),
        ])
        const [accJson, expJson, chartsJson] = await Promise.all([accRes.json(), expRes.json(), chartsRes.json()])
        if (accJson.data) setAccounts(accJson.data)
        if (expJson.data) setExpenses(expJson.data)
        if (chartsJson.success && chartsJson.data) setChartData(chartsJson.data)
      } catch (err) {
        console.error('Failed to fetch finance data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const revenue = accounts.filter((a) => a.type === 'revenue').reduce((sum, a) => sum + a.balance, 0)
  const expenseTotal = accounts.filter((a) => a.type === 'expense').reduce((sum, a) => sum + a.balance, 0)
  const assets = accounts.filter((a) => a.type === 'asset').reduce((sum, a) => sum + a.balance, 0)
  const liabilities = accounts.filter((a) => a.type === 'liability').reduce((sum, a) => sum + a.balance, 0)
  const netIncome = revenue - expenseTotal
  const pendingExpenses = expenses.filter((e) => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0)

  const accountTypes = ['asset', 'liability', 'equity', 'revenue', 'expense'] as const
  const accountTypeLabels: Record<string, string> = {
    asset: 'Assets',
    liability: 'Liabilities',
    equity: 'Equity',
    revenue: 'Revenue',
    expense: 'Expenses',
  }
  const accountTypeColors: Record<string, string> = {
    asset: CHART_COLORS.green,
    liability: CHART_COLORS.red,
    equity: CHART_COLORS.teal,
    revenue: CHART_COLORS.blue,
    expense: CHART_COLORS.orange,
  }

  // Chart data from API
  const revenueExpenseData = chartData?.revenueExpenseData ?? []

  // Account breakdown for pie chart
  const accountBreakdown = accountTypes.map((type) => {
    const balance = accounts.filter((a) => a.type === type).reduce((sum, a) => sum + a.balance, 0)
    return { name: accountTypeLabels[type], value: Math.abs(balance), color: accountTypeColors[type] }
  }).filter((d) => d.value > 0)

  // Expense categories for bar chart
  const expenseByCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {} as Record<string, number>)

  const expenseCategoryData = Object.entries(expenseByCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8)

  const categoryColors = [CHART_COLORS.blue, CHART_COLORS.green, CHART_COLORS.orange, CHART_COLORS.purple, CHART_COLORS.teal, CHART_COLORS.red, CHART_COLORS.golden, CHART_COLORS.sunset]

  // Cash flow data from API
  const cashFlowData = chartData?.cashFlowData ?? []

  return (
    <div className="space-y-5">
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="macos-card macos-shadow-card p-5 animate-pulse">
              <div className="h-4 bg-muted/50 rounded w-2/3 mb-3" />
              <div className="h-8 bg-muted/50 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* P&L Summary Cards */}
          <MacosStatGrid className="grid-cols-1 sm:grid-cols-3">
            <MacosStatCard
              label="Revenue"
              value={`$${revenue.toLocaleString()}`}
              icon={TrendingUp}
              iconColor="text-macos-green"
              iconBg="bg-macos-green/10"
              trend={{ value: chartData?.trends?.revenue ?? 0, label: 'vs last month' }}
            />
            <MacosStatCard
              label="Expenses"
              value={`$${expenseTotal.toLocaleString()}`}
              icon={TrendingDown}
              iconColor="text-macos-red"
              iconBg="bg-macos-red/10"
              trend={{ value: chartData?.trends?.expenses ?? 0, label: 'vs last month' }}
            />
            <MacosStatCard
              label="Net Income"
              value={`$${netIncome.toLocaleString()}`}
              icon={DollarSign}
              iconColor="text-macos-blue"
              iconBg="bg-macos-blue/10"
              trend={{ value: chartData?.trends?.netIncome ?? 0, label: 'vs last month' }}
            />
          </MacosStatGrid>

          {/* Revenue vs Expenses Area Chart */}
          <div className="macos-card macos-shadow-card p-5">
            <div className="macos-section-header mb-4">
              <div>
                <h3 className="macos-section-title">Revenue vs Expenses</h3>
                <p className="macos-section-desc">Monthly financial performance</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="size-2.5 rounded-full bg-macos-green" />
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Revenue</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="size-2.5 rounded-full bg-macos-red" />
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Expenses</span>
                </div>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueExpenseData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.green} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS.green} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.red} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS.red} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#86868B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#86868B' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '10px',
                      border: '0.5px solid rgba(0,0,0,0.06)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                      fontSize: '12px',
                      padding: '8px 12px',
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke={CHART_COLORS.green} strokeWidth={2} fill="url(#revenueGradient)" />
                  <Area type="monotone" dataKey="expenses" stroke={CHART_COLORS.red} strokeWidth={2} fill="url(#expenseGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Two column: Cash Flow + Account Breakdown Pie */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Cash Flow Area Chart */}
            <div className="macos-card macos-shadow-card p-5">
              <div className="macos-section-header mb-4">
                <div>
                  <h3 className="macos-section-title">Cash Flow</h3>
                  <p className="macos-section-desc">Monthly inflow vs outflow</p>
                </div>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashFlowData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="inflowGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.blue} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={CHART_COLORS.blue} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="outflowGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.orange} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={CHART_COLORS.orange} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#86868B' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#86868B' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '10px',
                        border: '0.5px solid rgba(0,0,0,0.06)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                        fontSize: '12px',
                        padding: '8px 12px',
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
                    />
                    <Area type="monotone" dataKey="inflow" stroke={CHART_COLORS.blue} strokeWidth={2} fill="url(#inflowGradient)" />
                    <Area type="monotone" dataKey="outflow" stroke={CHART_COLORS.orange} strokeWidth={2} fill="url(#outflowGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Account Breakdown Pie */}
            <div className="macos-card macos-shadow-card p-5">
              <div className="macos-section-header mb-4">
                <div>
                  <h3 className="macos-section-title">Account Breakdown</h3>
                  <p className="macos-section-desc">Distribution by type</p>
                </div>
              </div>
              {accountBreakdown.length > 0 ? (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={accountBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {accountBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: '10px',
                          border: '0.5px solid rgba(0,0,0,0.06)',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                          fontSize: '12px',
                          padding: '8px 12px',
                        }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
                      />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '11px' }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-56 flex items-center justify-center">
                  <p className="text-[13px] text-muted-foreground">No account data</p>
                </div>
              )}
            </div>
          </div>

          {/* Balance Sheet + Expense Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Balance Sheet */}
            <div className="macos-card macos-shadow-card p-5">
              <div className="macos-section-header mb-4">
                <div>
                  <h3 className="macos-section-title">Balance Sheet</h3>
                  <p className="macos-section-desc">Financial position summary</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted-foreground">Total Assets</span>
                  <span className="font-medium">${assets.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-macos-green rounded-full transition-all"
                    style={{ width: `${assets > 0 ? Math.min((assets / (assets + liabilities || 1)) * 100, 100) : 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted-foreground">Total Liabilities</span>
                  <span className="font-medium">${liabilities.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-macos-red rounded-full transition-all"
                    style={{ width: `${liabilities > 0 ? Math.min((liabilities / (assets + liabilities || 1)) * 100, 100) : 0}%` }}
                  />
                </div>
                <Separator className="bg-border/50" />
                <div className="flex justify-between text-[13px] font-semibold">
                  <span>Net Worth</span>
                  <span className={(assets - liabilities) >= 0 ? 'text-macos-green' : 'text-macos-red'}>
                    ${(assets - liabilities).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Expense Categories Bar Chart */}
            <div className="macos-card macos-shadow-card p-5">
              <div className="macos-section-header mb-4">
                <div>
                  <h3 className="macos-section-title">Expense Categories</h3>
                  <p className="macos-section-desc">Spending by category</p>
                </div>
              </div>
              {expenseCategoryData.length > 0 ? (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expenseCategoryData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: '#86868B' }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="category" tick={{ fontSize: 10, fill: '#86868B' }} axisLine={false} tickLine={false} width={80} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '10px',
                          border: '0.5px solid rgba(0,0,0,0.06)',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                          fontSize: '12px',
                          padding: '8px 12px',
                        }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
                      />
                      <Bar dataKey="amount" radius={[0, 4, 4, 0]} maxBarSize={24}>
                        {expenseCategoryData.map((_, index) => (
                          <Cell key={`cat-${index}`} fill={categoryColors[index % categoryColors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-56 flex items-center justify-center">
                  <p className="text-[13px] text-muted-foreground">No expense data</p>
                </div>
              )}
            </div>
          </div>

          {/* Pending Payments */}
          {pendingExpenses > 0 && (
            <div className="macos-stat macos-shadow-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-macos-orange/10 flex items-center justify-center">
                    <Clock className="size-4 text-macos-orange" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Pending Payments</p>
                    <p className="text-[24px] font-bold text-macos-orange tracking-tight">${pendingExpenses.toLocaleString()}</p>
                  </div>
                </div>
                <MacosBadge variant="warning">Requires Attention</MacosBadge>
              </div>
            </div>
          )}

          {/* Recent Expenses */}
          <div className="macos-card macos-shadow-card p-5">
            <div className="macos-section-header mb-4">
              <div>
                <h3 className="macos-section-title">Recent Expenses</h3>
                <p className="macos-section-desc">Latest expense records</p>
              </div>
            </div>
            {expenses.length === 0 ? (
              <p className="text-[13px] text-muted-foreground text-center py-4">No expenses recorded</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {expenses.slice(0, 5).map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 text-[13px]">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-macos-red/10 flex items-center justify-center">
                        <Receipt className="size-3.5 text-macos-red" strokeWidth={1.8} />
                      </div>
                      <div>
                        <p className="font-medium">{expense.category}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {expense.description || 'No description'} · {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-macos-red">${expense.amount.toLocaleString()}</p>
                      <MacosBadge
                        variant={
                          expense.status === 'paid' ? 'success' :
                          expense.status === 'approved' ? 'info' :
                          'warning'
                        }
                      >
                        {expense.status}
                      </MacosBadge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ==================== ACCOUNTS TAB ====================

function AccountsTab() {
  const { authUser } = useAppStore()
  const isViewOnly = authUser?.isViewOnly ?? false
  const [accounts, setAccounts] = React.useState<Account[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showCreateDialog, setShowCreateDialog] = React.useState(false)

  const fetchAccounts = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/finance?type=accounts&limit=100')
      const json = await res.json()
      if (json.data) setAccounts(json.data)
    } catch (err) {
      console.error('Failed to fetch accounts:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const getTypeBadge = (type: string): 'success' | 'danger' | 'info' | 'warning' | 'default' => {
    switch (type) {
      case 'asset': return 'success'
      case 'liability': return 'danger'
      case 'equity': return 'info'
      case 'revenue': return 'info'
      case 'expense': return 'warning'
      default: return 'default'
    }
  }

  const groupedAccounts = accounts.reduce(
    (groups, account) => {
      const type = account.type
      if (!groups[type]) groups[type] = []
      groups[type].push(account)
      return groups
    },
    {} as Record<string, Account[]>
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{accounts.length} accounts</p>
        {!isViewOnly && (
          <MacosButton variant="primary" icon={Plus} onClick={() => setShowCreateDialog(true)}>
            Create Account
          </MacosButton>
        )}
      </div>

      {loading ? (
        <div className="macos-card macos-shadow-card p-6">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 bg-muted/50 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      ) : accounts.length === 0 ? (
        <MacosEmptyState
          icon={Wallet}
          title="No accounts found"
          description="Create your chart of accounts"
        />
      ) : (
        <div className="macos-card macos-shadow-card overflow-hidden">
          <ScrollArea className="max-h-[500px] custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border/50">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Code</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Name</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Type</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Parent</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right">Balance</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(groupedAccounts).map(([type, typeAccounts]) => (
                  <React.Fragment key={type}>
                    <TableRow className="bg-secondary/30 hover:bg-secondary/30 border-b border-border/50">
                      <TableCell colSpan={6} className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground py-2">
                        {type} ({typeAccounts.length})
                      </TableCell>
                    </TableRow>
                    {typeAccounts.map((account) => (
                      <TableRow key={account.id} className="macos-table-row border-b border-border/30 last:border-0">
                        <TableCell className="font-mono text-[11px] text-muted-foreground">{account.code}</TableCell>
                        <TableCell className="font-medium text-[13px] tracking-tight">{account.name}</TableCell>
                        <TableCell>
                          <MacosBadge variant={getTypeBadge(account.type)}>
                            {account.type}
                          </MacosBadge>
                        </TableCell>
                        <TableCell className="text-[11px] text-muted-foreground">
                          {account.parentCode || '—'}
                        </TableCell>
                        <TableCell className="text-right font-medium text-[13px]">
                          ${account.balance.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <MacosBadge variant={account.isActive ? 'success' : 'danger'}>
                            {account.isActive ? 'Active' : 'Inactive'}
                          </MacosBadge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      )}

      <CreateAccountDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onSuccess={fetchAccounts} />
    </div>
  )
}

// ==================== JOURNAL ENTRIES TAB ====================

function JournalEntriesTab() {
  const { authUser } = useAppStore()
  const isViewOnly = authUser?.isViewOnly ?? false
  const [entries, setEntries] = React.useState<JournalEntry[]>([])
  const [accounts, setAccounts] = React.useState<Account[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showCreateDialog, setShowCreateDialog] = React.useState(false)
  const [selectedEntry, setSelectedEntry] = React.useState<JournalEntry | null>(null)

  const fetchEntries = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/finance?type=entries&limit=50')
      const json = await res.json()
      if (json.data) setEntries(json.data)
    } catch (err) {
      console.error('Failed to fetch entries:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAccounts = React.useCallback(async () => {
    try {
      const res = await fetch('/api/finance?type=accounts&limit=100')
      const json = await res.json()
      if (json.data) setAccounts(json.data)
    } catch (err) {
      console.error('Failed to fetch accounts:', err)
    }
  }, [])

  React.useEffect(() => {
    fetchEntries()
    fetchAccounts()
  }, [fetchEntries, fetchAccounts])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{entries.length} journal entries</p>
        {!isViewOnly && (
          <MacosButton variant="primary" icon={Plus} onClick={() => setShowCreateDialog(true)}>
            Create Entry
          </MacosButton>
        )}
      </div>

      {loading ? (
        <div className="macos-card macos-shadow-card p-6">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted/50 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      ) : entries.length === 0 ? (
        <MacosEmptyState
          icon={BookOpen}
          title="No journal entries found"
          description="Record your first journal entry"
        />
      ) : (
        <div className="macos-card macos-shadow-card overflow-hidden">
          <ScrollArea className="max-h-[500px] custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border/50">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Date</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Description</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Reference</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right">Debit</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right">Credit</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => {
                  const totalDebit = entry.lines.reduce((s, l) => s + l.debit, 0)
                  const totalCredit = entry.lines.reduce((s, l) => s + l.credit, 0)
                  return (
                    <TableRow key={entry.id} className="macos-table-row cursor-pointer border-b border-border/30 last:border-0" onClick={() => setSelectedEntry(entry)}>
                      <TableCell className="text-[11px] text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium text-[13px] max-w-48 truncate tracking-tight">
                        {entry.description}
                      </TableCell>
                      <TableCell className="text-[11px] text-muted-foreground">
                        {entry.reference || '—'}
                      </TableCell>
                      <TableCell className="text-right text-[13px] font-medium">
                        ${totalDebit.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-[13px] font-medium">
                        ${totalCredit.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <MacosBadge variant={entry.isPosted ? 'success' : 'warning'}>
                          {entry.isPosted ? 'Posted' : 'Draft'}
                        </MacosBadge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      )}

      <CreateJournalEntryDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        accounts={accounts}
        onSuccess={fetchEntries}
      />

      <JournalEntryDetailDialog
        entry={selectedEntry}
        onOpenChange={(open) => !open && setSelectedEntry(null)}
      />
    </div>
  )
}

// ==================== EXPENSES TAB ====================

function ExpensesTab() {
  const { authUser } = useAppStore()
  const isViewOnly = authUser?.isViewOnly ?? false
  const [expenses, setExpenses] = React.useState<Expense[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showAddDialog, setShowAddDialog] = React.useState(false)

  const fetchExpenses = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/finance?type=expenses&limit=50')
      const json = await res.json()
      if (json.data) setExpenses(json.data)
    } catch (err) {
      console.error('Failed to fetch expenses:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const getStatusBadge = (status: string): 'success' | 'info' | 'warning' => {
    switch (status) {
      case 'paid': return 'success'
      case 'approved': return 'info'
      case 'pending': return 'warning'
      default: return 'warning'
    }
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const pendingAmount = expenses.filter((e) => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0)
  const paidAmount = expenses.filter((e) => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="space-y-5">
      {/* Summary */}
      <MacosStatGrid className="grid-cols-3">
        <MacosStatCard label="Total Expenses" value={`$${totalExpenses.toLocaleString()}`} icon={Receipt} iconColor="text-macos-red" iconBg="bg-macos-red/10" />
        <MacosStatCard label="Pending" value={`$${pendingAmount.toLocaleString()}`} icon={Clock} iconColor="text-macos-orange" iconBg="bg-macos-orange/10" />
        <MacosStatCard label="Paid" value={`$${paidAmount.toLocaleString()}`} icon={CheckCircle2} iconColor="text-macos-green" iconBg="bg-macos-green/10" />
      </MacosStatGrid>

      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{expenses.length} expense records</p>
        {!isViewOnly && (
          <MacosButton variant="primary" icon={Plus} onClick={() => setShowAddDialog(true)}>
            Add Expense
          </MacosButton>
        )}
      </div>

      {loading ? (
        <div className="macos-card macos-shadow-card p-6">
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-muted/50 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      ) : expenses.length === 0 ? (
        <MacosEmptyState
          icon={Receipt}
          title="No expenses found"
          description="Record your first expense"
        />
      ) : (
        <div className="macos-card macos-shadow-card overflow-hidden">
          <ScrollArea className="max-h-[400px] custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border/50">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Category</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Description</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right">Amount</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Date</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Paid By</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id} className="macos-table-row border-b border-border/30 last:border-0">
                    <TableCell className="font-medium text-[13px] tracking-tight">{expense.category}</TableCell>
                    <TableCell className="text-[11px] text-muted-foreground max-w-32 truncate">
                      {expense.description || '—'}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-macos-red text-[13px]">
                      ${expense.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-[11px] text-muted-foreground">
                      {new Date(expense.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-[11px] text-muted-foreground">
                      {expense.paidBy || '—'}
                    </TableCell>
                    <TableCell>
                      <MacosBadge variant={getStatusBadge(expense.status)}>
                        {expense.status}
                      </MacosBadge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      )}

      <AddExpenseDialog open={showAddDialog} onOpenChange={setShowAddDialog} onSuccess={fetchExpenses} />
    </div>
  )
}

// ==================== CREATE ACCOUNT DIALOG ====================

function CreateAccountDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState({
    code: '',
    name: '',
    type: 'asset',
    parentCode: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.code.trim() || !form.name.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/finance?type=accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          parentCode: form.parentCode || null,
        }),
      })
      if (res.ok) {
        setForm({ code: '', name: '', type: 'asset', parentCode: '' })
        onOpenChange(false)
        onSuccess()
      } else {
        const json = await res.json()
        alert(json.error || 'Failed to create account')
      }
    } catch (err) {
      console.error('Failed to create account:', err)
      alert('Failed to create account')
    } finally {
      setSaving(false)
    }
  }

  return (
    <MacosDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create Account"
      description="Add a new account to your chart of accounts"
      footer={
        <>
          <MacosButton variant="secondary" onClick={() => onOpenChange(false)}>Cancel</MacosButton>
          <MacosButton variant="primary" onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)} disabled={saving || !form.code.trim() || !form.name.trim()}>
            {saving ? 'Creating...' : 'Create Account'}
          </MacosButton>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <MacosFormField label="Account Code *">
            <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="1000" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30" required />
          </MacosFormField>
          <MacosFormField label="Account Type *">
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asset">Asset</SelectItem>
                <SelectItem value="liability">Liability</SelectItem>
                <SelectItem value="equity">Equity</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </MacosFormField>
        </div>
        <MacosFormField label="Account Name *">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Cash on Hand" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30" required />
        </MacosFormField>
        <MacosFormField label="Parent Code">
          <Input value={form.parentCode} onChange={(e) => setForm({ ...form, parentCode: e.target.value })} placeholder="1000 (optional)" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30" />
        </MacosFormField>
      </form>
    </MacosDialog>
  )
}

// ==================== CREATE JOURNAL ENTRY DIALOG ====================

interface JournalLineForm {
  key: string
  accountId: string
  debit: string
  credit: string
  description: string
}

function CreateJournalEntryDialog({
  open,
  onOpenChange,
  accounts,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  accounts: Account[]
  onSuccess: () => void
}) {
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    reference: '',
    isPosted: false,
  })
  const [lines, setLines] = React.useState<JournalLineForm[]>([
    { key: crypto.randomUUID(), accountId: '', debit: '', credit: '', description: '' },
    { key: crypto.randomUUID(), accountId: '', debit: '', credit: '', description: '' },
  ])

  const totalDebit = lines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0)
  const totalCredit = lines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0

  const addLine = () => {
    setLines([...lines, { key: crypto.randomUUID(), accountId: '', debit: '', credit: '', description: '' }])
  }

  const removeLine = (key: string) => {
    if (lines.length > 2) {
      setLines(lines.filter((l) => l.key !== key))
    }
  }

  const updateLine = (key: string, updates: Partial<JournalLineForm>) => {
    setLines(lines.map((l) => (l.key === key ? { ...l, ...updates } : l)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.description.trim() || !isBalanced) return
    setSaving(true)
    try {
      const res = await fetch('/api/finance?type=entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          lines: lines
            .filter((l) => l.accountId && (parseFloat(l.debit) > 0 || parseFloat(l.credit) > 0))
            .map((l) => ({
              accountId: l.accountId,
              debit: parseFloat(l.debit) || 0,
              credit: parseFloat(l.credit) || 0,
              description: l.description || null,
            })),
        }),
      })
      if (res.ok) {
        setForm({ date: new Date().toISOString().split('T')[0], description: '', reference: '', isPosted: false })
        setLines([
          { key: crypto.randomUUID(), accountId: '', debit: '', credit: '', description: '' },
          { key: crypto.randomUUID(), accountId: '', debit: '', credit: '', description: '' },
        ])
        onOpenChange(false)
        onSuccess()
      } else {
        const json = await res.json()
        alert(json.error || 'Failed to create journal entry')
      }
    } catch (err) {
      console.error('Failed to create journal entry:', err)
      alert('Failed to create journal entry')
    } finally {
      setSaving(false)
    }
  }

  return (
    <MacosDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create Journal Entry"
      description="Record a double-entry journal transaction"
      className="max-w-2xl"
      footer={
        <>
          <MacosButton variant="secondary" onClick={() => onOpenChange(false)}>Cancel</MacosButton>
          <MacosButton variant="primary" onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)} disabled={saving || !form.description.trim() || !isBalanced}>
            {saving ? 'Creating...' : 'Create Entry'}
          </MacosButton>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <MacosFormField label="Date *">
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30" required />
          </MacosFormField>
          <MacosFormField label="Reference">
            <Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="JE-001" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30" />
          </MacosFormField>
        </div>
        <MacosFormField label="Description *">
          <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Monthly rent payment" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30" required />
        </MacosFormField>

        <Separator className="bg-border/50" />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Entry Lines</Label>
            <MacosButton variant="ghost" className="text-[11px]" onClick={addLine}>
              <Plus className="size-3" strokeWidth={2} /> Add Line
            </MacosButton>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {lines.map((line) => (
              <div key={line.key} className="flex items-end gap-2 p-3 rounded-xl bg-secondary/50">
                <div className="flex-[2] space-y-1">
                  <Label className="text-[10px] font-semibold tracking-wider text-muted-foreground">Account</Label>
                  <Select value={line.accountId} onValueChange={(v) => updateLine(line.key, { accountId: v })}>
                    <SelectTrigger className="h-7 text-[11px] rounded-lg border-0 bg-background">
                      <SelectValue placeholder="Select account..." />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.code} - {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24 space-y-1">
                  <Label className="text-[10px] font-semibold tracking-wider text-muted-foreground">Debit</Label>
                  <Input type="number" step="0.01" min="0" value={line.debit} onChange={(e) => updateLine(line.key, { debit: e.target.value })} className="h-7 text-[11px] rounded-lg border-0 bg-background" />
                </div>
                <div className="w-24 space-y-1">
                  <Label className="text-[10px] font-semibold tracking-wider text-muted-foreground">Credit</Label>
                  <Input type="number" step="0.01" min="0" value={line.credit} onChange={(e) => updateLine(line.key, { credit: e.target.value })} className="h-7 text-[11px] rounded-lg border-0 bg-background" />
                </div>
                <div className="flex-[1] space-y-1">
                  <Label className="text-[10px] font-semibold tracking-wider text-muted-foreground">Note</Label>
                  <Input value={line.description} onChange={(e) => updateLine(line.key, { description: e.target.value })} className="h-7 text-[11px] rounded-lg border-0 bg-background" placeholder="Optional" />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-macos-red hover:text-macos-red hover:bg-macos-red/10 rounded-lg"
                  onClick={() => removeLine(line.key)}
                  disabled={lines.length <= 2}
                >
                  <X className="size-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className={`flex items-center justify-between p-3 rounded-xl ${
          isBalanced
            ? 'bg-macos-green/10'
            : 'bg-macos-orange/10'
        }`}>
          <div className="flex items-center gap-4 text-[13px]">
            <span>
              Debit: <strong>${totalDebit.toLocaleString()}</strong>
            </span>
            <span>
              Credit: <strong>${totalCredit.toLocaleString()}</strong>
            </span>
          </div>
          <MacosBadge variant={isBalanced ? 'success' : 'warning'}>
            {isBalanced ? 'Balanced' : 'Unbalanced'}
          </MacosBadge>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="post-entry" className="text-[13px]">Post immediately</Label>
          <input
            id="post-entry"
            type="checkbox"
            checked={form.isPosted}
            onChange={(e) => setForm({ ...form, isPosted: e.target.checked })}
            className="rounded"
          />
        </div>
      </form>
    </MacosDialog>
  )
}

// ==================== JOURNAL ENTRY DETAIL DIALOG ====================

function JournalEntryDetailDialog({
  entry,
  onOpenChange,
}: {
  entry: JournalEntry | null
  onOpenChange: (open: boolean) => void
}) {
  if (!entry) return null

  const totalDebit = entry.lines.reduce((s, l) => s + l.debit, 0)
  const totalCredit = entry.lines.reduce((s, l) => s + l.credit, 0)

  return (
    <MacosDialog
      open={!!entry}
      onOpenChange={onOpenChange}
      title="Journal Entry"
      description={entry.description}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="grid grid-cols-2 gap-3 text-[13px] flex-1">
            <div>
              <span className="text-[10px] font-semibold tracking-wider text-muted-foreground">Date: </span>
              <span className="font-medium">{new Date(entry.date).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-[10px] font-semibold tracking-wider text-muted-foreground">Reference: </span>
              <span className="font-medium">{entry.reference || '—'}</span>
            </div>
          </div>
          <MacosBadge variant={entry.isPosted ? 'success' : 'warning'}>
            {entry.isPosted ? 'Posted' : 'Draft'}
          </MacosBadge>
        </div>

        <Separator className="bg-border/50" />

        <div className="space-y-2">
          <h4 className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Entry Lines</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {entry.lines.map((line) => (
              <div key={line.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <div>
                  <p className="text-[13px] font-medium">
                    {line.account?.name || 'Unknown'}
                    <span className="text-[11px] text-muted-foreground ml-1.5">({line.account?.code})</span>
                  </p>
                  {line.description && (
                    <p className="text-[11px] text-muted-foreground">{line.description}</p>
                  )}
                </div>
                <div className="text-right text-[13px] font-medium">
                  {line.debit > 0 && <span className="text-macos-blue">${line.debit.toLocaleString()}</span>}
                  {line.credit > 0 && <span className="text-macos-green">${line.credit.toLocaleString()}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-border/50" />

        <div className="grid grid-cols-2 gap-3">
          <div className="macos-stat macos-shadow-card text-center" style={{ padding: '12px' }}>
            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Total Debit</p>
            <p className="text-[13px] font-bold text-macos-blue">${totalDebit.toLocaleString()}</p>
          </div>
          <div className="macos-stat macos-shadow-card text-center" style={{ padding: '12px' }}>
            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Total Credit</p>
            <p className="text-[13px] font-bold text-macos-green">${totalCredit.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </MacosDialog>
  )
}

// ==================== ADD EXPENSE DIALOG ====================

function AddExpenseDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState({
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    paidBy: '',
    status: 'pending',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.category.trim() || !form.amount || !form.date) return
    setSaving(true)
    try {
      const res = await fetch('/api/finance?type=expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: form.category,
          amount: parseFloat(form.amount),
          date: form.date,
          description: form.description || null,
          paidBy: form.paidBy || null,
          status: form.status,
        }),
      })
      if (res.ok) {
        setForm({ category: '', amount: '', date: new Date().toISOString().split('T')[0], description: '', paidBy: '', status: 'pending' })
        onOpenChange(false)
        onSuccess()
      } else {
        const json = await res.json()
        alert(json.error || 'Failed to add expense')
      }
    } catch (err) {
      console.error('Failed to add expense:', err)
      alert('Failed to add expense')
    } finally {
      setSaving(false)
    }
  }

  return (
    <MacosDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add Expense"
      description="Record a new expense"
      footer={
        <>
          <MacosButton variant="secondary" onClick={() => onOpenChange(false)}>Cancel</MacosButton>
          <MacosButton variant="primary" onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)} disabled={saving || !form.category || !form.amount || !form.date}>
            {saving ? 'Adding...' : 'Add Expense'}
          </MacosButton>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <MacosFormField label="Category *">
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Rent">Rent</SelectItem>
                <SelectItem value="Utilities">Utilities</SelectItem>
                <SelectItem value="Salaries">Salaries</SelectItem>
                <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Transport">Transport</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Insurance">Insurance</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </MacosFormField>
          <MacosFormField label="Amount ($) *">
            <Input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="500" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30" required />
          </MacosFormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MacosFormField label="Date *">
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30" required />
          </MacosFormField>
          <MacosFormField label="Status">
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </MacosFormField>
        </div>
        <MacosFormField label="Description">
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Expense details..." rows={2} className="rounded-lg bg-secondary/80 border-0 text-[13px]" />
        </MacosFormField>
        <MacosFormField label="Paid By">
          <Input value={form.paidBy} onChange={(e) => setForm({ ...form, paidBy: e.target.value })} placeholder="John Smith" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30" />
        </MacosFormField>
      </form>
    </MacosDialog>
  )
}
