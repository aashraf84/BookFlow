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
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

// ==================== FINANCE MODULE ====================

export function FinanceModule() {
  const [activeTab, setActiveTab] = React.useState('overview')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-950/40">
          <DollarSign className="size-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Finance</h2>
          <p className="text-sm text-muted-foreground">
            Financial management, accounting, and reporting
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="gap-1.5">
            <BarChart3 className="size-3.5" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="accounts" className="gap-1.5">
            <Wallet className="size-3.5" />
            <span className="hidden sm:inline">Accounts</span>
          </TabsTrigger>
          <TabsTrigger value="entries" className="gap-1.5">
            <BookOpen className="size-3.5" />
            <span className="hidden sm:inline">Journal</span>
          </TabsTrigger>
          <TabsTrigger value="expenses" className="gap-1.5">
            <Receipt className="size-3.5" />
            <span className="hidden sm:inline">Expenses</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="accounts" className="mt-4">
          <AccountsTab />
        </TabsContent>
        <TabsContent value="entries" className="mt-4">
          <JournalEntriesTab />
        </TabsContent>
        <TabsContent value="expenses" className="mt-4">
          <ExpensesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ==================== OVERVIEW TAB ====================

function OverviewTab() {
  const [accounts, setAccounts] = React.useState<Account[]>([])
  const [expenses, setExpenses] = React.useState<Expense[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [accRes, expRes] = await Promise.all([
          fetch('/api/finance?type=accounts&limit=100'),
          fetch('/api/finance?type=expenses&limit=100'),
        ])
        const [accJson, expJson] = await Promise.all([accRes.json(), expRes.json()])
        if (accJson.data) setAccounts(accJson.data)
        if (expJson.data) setExpenses(expJson.data)
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

  const summaryCards = [
    {
      label: 'Total Revenue',
      value: `$${revenue.toLocaleString()}`,
      change: '+8.5%',
      up: true,
      icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/40',
    },
    {
      label: 'Total Expenses',
      value: `$${expenseTotal.toLocaleString()}`,
      change: '+3.2%',
      up: false,
      icon: TrendingDown,
      color: 'text-red-600 bg-red-100 dark:bg-red-950/40',
    },
    {
      label: 'Net Income',
      value: `$${netIncome.toLocaleString()}`,
      change: netIncome >= 0 ? '+12.1%' : '-5.3%',
      up: netIncome >= 0,
      icon: DollarSign,
      color: 'text-teal-600 bg-teal-100 dark:bg-teal-950/40',
    },
    {
      label: 'Pending Payments',
      value: `$${pendingExpenses.toLocaleString()}`,
      change: '',
      up: false,
      icon: Clock,
      color: 'text-amber-600 bg-amber-100 dark:bg-amber-950/40',
    },
  ]

  // Group accounts by type for P&L display
  const accountTypes = ['asset', 'liability', 'equity', 'revenue', 'expense'] as const
  const accountTypeLabels: Record<string, string> = {
    asset: 'Assets',
    liability: 'Liabilities',
    equity: 'Equity',
    revenue: 'Revenue',
    expense: 'Expenses',
  }

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-2/3 mb-3" />
                <div className="h-6 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryCards.map((card) => {
              const Icon = card.icon
              return (
                <Card key={card.label} className="relative overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">{card.label}</p>
                        <p className="text-2xl font-bold tracking-tight">{card.value}</p>
                      </div>
                      <div className={`rounded-lg p-2.5 ${card.color}`}>
                        <Icon className="size-5" />
                      </div>
                    </div>
                    {card.change && (
                      <div className="mt-2 flex items-center gap-1 text-xs">
                        {card.up ? (
                          <ArrowUpRight className="size-3 text-emerald-600" />
                        ) : (
                          <ArrowDownRight className="size-3 text-red-500" />
                        )}
                        <span className={card.up ? 'text-emerald-600 font-medium' : 'text-red-500 font-medium'}>
                          {card.change}
                        </span>
                        <span className="text-muted-foreground">vs last month</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* P&L and Balance Sheet */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Profit & Loss */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Profit & Loss Summary</CardTitle>
                <CardDescription>Revenue vs Expenses comparison</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Revenue</span>
                    <span className="font-medium text-emerald-600">${revenue.toLocaleString()}</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${revenue > 0 ? Math.min((revenue / (revenue + expenseTotal || 1)) * 100, 100) : 0}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expenses</span>
                    <span className="font-medium text-red-600">${expenseTotal.toLocaleString()}</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full transition-all"
                      style={{ width: `${expenseTotal > 0 ? Math.min((expenseTotal / (revenue + expenseTotal || 1)) * 100, 100) : 0}%` }}
                    />
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between text-sm font-semibold">
                  <span>Net {netIncome >= 0 ? 'Profit' : 'Loss'}</span>
                  <span className={netIncome >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                    ${Math.abs(netIncome).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Balance Sheet */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Balance Sheet</CardTitle>
                <CardDescription>Assets, liabilities, and equity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Assets</span>
                  <span className="font-medium">${assets.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Liabilities</span>
                  <span className="font-medium">${liabilities.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm font-semibold">
                  <span>Net Worth</span>
                  <span className={(assets - liabilities) >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                    ${(assets - liabilities).toLocaleString()}
                  </span>
                </div>
                <Separator />
                <div className="space-y-2">
                  {accountTypes.map((type) => {
                    const typeBalance = accounts
                      .filter((a) => a.type === type)
                      .reduce((sum, a) => sum + a.balance, 0)
                    return (
                      <div key={type} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{accountTypeLabels[type]}</span>
                        <span>${typeBalance.toLocaleString()}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Expenses */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No expenses recorded</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                  {expenses.slice(0, 5).map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-2 rounded border text-sm">
                      <div>
                        <p className="font-medium">{expense.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {expense.description || 'No description'} • {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">${expense.amount.toLocaleString()}</p>
                        <Badge
                          variant="secondary"
                          className={
                            expense.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px]'
                              : expense.status === 'approved'
                              ? 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 text-[10px]'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 text-[10px]'
                          }
                        >
                          {expense.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

// ==================== ACCOUNTS TAB ====================

function AccountsTab() {
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'asset':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
      case 'liability':
        return 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
      case 'equity':
        return 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400'
      case 'revenue':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
      case 'expense':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400'
      default:
        return ''
    }
  }

  const groupedAccounts = accounts.reduce(
    (groups, account) => {
      if (!groups[account.type]) groups[account.type] = []
      groups[account.type].push(account)
      return groups
    },
    {} as Record<string, Account[]>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{accounts.length} accounts</p>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="size-4" /> Create Account
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : accounts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Wallet className="size-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No accounts found</p>
            <p className="text-sm text-muted-foreground">Create your chart of accounts</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(groupedAccounts).map(([type, typeAccounts]) => (
                    <React.Fragment key={type}>
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={6} className="font-semibold text-xs uppercase tracking-wider text-muted-foreground py-2">
                          {type} ({typeAccounts.length})
                        </TableCell>
                      </TableRow>
                      {typeAccounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell className="font-mono text-xs">{account.code}</TableCell>
                          <TableCell className="font-medium">{account.name}</TableCell>
                          <TableCell>
                            <Badge className={`text-[10px] ${getTypeColor(account.type)}`}>
                              {account.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {account.parentCode || '—'}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${account.balance.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={account.isActive ? 'default' : 'secondary'}
                              className={
                                account.isActive
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px]'
                                  : 'text-[10px]'
                              }
                            >
                              {account.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <CreateAccountDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onSuccess={fetchAccounts} />
    </div>
  )
}

// ==================== JOURNAL ENTRIES TAB ====================

function JournalEntriesTab() {
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{entries.length} entries</p>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="size-4" /> Create Entry
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="size-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No journal entries found</p>
            <p className="text-sm text-muted-foreground">Record your first journal entry</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => {
                    const totalDebit = entry.lines.reduce((s, l) => s + l.debit, 0)
                    const totalCredit = entry.lines.reduce((s, l) => s + l.credit, 0)
                    return (
                      <TableRow key={entry.id} className="cursor-pointer" onClick={() => setSelectedEntry(entry)}>
                        <TableCell className="text-xs">
                          {new Date(entry.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium text-sm max-w-48 truncate">
                          {entry.description}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {entry.reference || '—'}
                        </TableCell>
                        <TableCell className="text-right text-xs font-medium">
                          ${totalDebit.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-xs font-medium">
                          ${totalCredit.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              entry.isPosted
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px]'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 text-[10px]'
                            }
                          >
                            {entry.isPosted ? 'Posted' : 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Eye className="size-3.5 text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 className="size-4 text-emerald-600" />
      case 'approved':
        return <CheckCircle2 className="size-4 text-teal-600" />
      case 'pending':
        return <Clock className="size-4 text-amber-600" />
      default:
        return <AlertCircle className="size-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
      case 'approved':
        return 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400'
      case 'pending':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
      default:
        return ''
    }
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const pendingAmount = expenses.filter((e) => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0)
  const paidAmount = expenses.filter((e) => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Total Expenses</p>
            <p className="text-lg font-bold">${totalExpenses.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-lg font-bold text-amber-600">${pendingAmount.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Paid</p>
            <p className="text-lg font-bold text-emerald-600">${paidAmount.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{expenses.length} expense records</p>
        <Button onClick={() => setShowAddDialog(true)} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="size-4" /> Add Expense
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : expenses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Receipt className="size-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No expenses found</p>
            <p className="text-sm text-muted-foreground">Record your first expense</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Paid By</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.category}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-32 truncate">
                        {expense.description || '—'}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-red-600">
                        ${expense.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs">
                        {new Date(expense.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {expense.paidBy || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] ${getStatusColor(expense.status)}`}>
                          {expense.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Account</DialogTitle>
          <DialogDescription>Add a new account to your chart of accounts</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="acc-code">Account Code *</Label>
              <Input
                id="acc-code"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="1000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Account Type *</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger>
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
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="acc-name">Account Name *</Label>
            <Input
              id="acc-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Cash on Hand"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="acc-parent">Parent Code</Label>
            <Input
              id="acc-parent"
              value={form.parentCode}
              onChange={(e) => setForm({ ...form, parentCode: e.target.value })}
              placeholder="1000 (optional)"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || !form.code.trim() || !form.name.trim()}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {saving ? 'Creating...' : 'Create Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Journal Entry</DialogTitle>
          <DialogDescription>Record a double-entry journal transaction</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Reference</Label>
              <Input
                value={form.reference}
                onChange={(e) => setForm({ ...form, reference: e.target.value })}
                placeholder="JE-001"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description *</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Monthly rent payment"
              required
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Entry Lines</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLine} className="gap-1">
                <Plus className="size-3" /> Add Line
              </Button>
            </div>
            {lines.map((line) => (
              <div key={line.key} className="flex items-end gap-2 p-3 rounded-lg border bg-muted/30">
                <div className="flex-[2] space-y-1">
                  <Label className="text-xs text-muted-foreground">Account</Label>
                  <Select value={line.accountId} onValueChange={(v) => updateLine(line.key, { accountId: v })}>
                    <SelectTrigger className="h-8 text-xs">
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
                  <Label className="text-xs text-muted-foreground">Debit</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={line.debit}
                    onChange={(e) => updateLine(line.key, { debit: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="w-24 space-y-1">
                  <Label className="text-xs text-muted-foreground">Credit</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={line.credit}
                    onChange={(e) => updateLine(line.key, { credit: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="flex-[1] space-y-1">
                  <Label className="text-xs text-muted-foreground">Note</Label>
                  <Input
                    value={line.description}
                    onChange={(e) => updateLine(line.key, { description: e.target.value })}
                    className="h-8 text-xs"
                    placeholder="Optional"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-500"
                  onClick={() => removeLine(line.key)}
                  disabled={lines.length <= 2}
                >
                  <X className="size-3" />
                </Button>
              </div>
            ))}
          </div>

          {/* Validation display */}
          <div className={`flex items-center justify-between p-3 rounded-lg border ${
            isBalanced
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
          }`}>
            <div className="flex items-center gap-4 text-sm">
              <span>
                Debit: <strong>${totalDebit.toLocaleString()}</strong>
              </span>
              <span>
                Credit: <strong>${totalCredit.toLocaleString()}</strong>
              </span>
            </div>
            <Badge className={isBalanced ? 'bg-emerald-100 text-emerald-700 text-[10px]' : 'bg-amber-100 text-amber-700 text-[10px]'}>
              {isBalanced ? 'Balanced' : 'Unbalanced'}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="post-entry" className="text-sm">Post immediately</Label>
            <input
              id="post-entry"
              type="checkbox"
              checked={form.isPosted}
              onChange={(e) => setForm({ ...form, isPosted: e.target.checked })}
              className="rounded"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || !form.description.trim() || !isBalanced}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {saving ? 'Creating...' : 'Create Entry'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
    <Dialog open={!!entry} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="size-5 text-emerald-600" />
            Journal Entry
          </DialogTitle>
          <DialogDescription>{entry.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Date:</span>{' '}
              <span className="font-medium">{new Date(entry.date).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Reference:</span>{' '}
              <span className="font-medium">{entry.reference || '—'}</span>
            </div>
          </div>
          <Badge
            className={
              entry.isPosted
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
            }
          >
            {entry.isPosted ? 'Posted' : 'Draft'}
          </Badge>

          <Separator />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entry.lines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell className="text-sm">
                    <div>
                      <span className="font-medium">{line.account?.name || 'Unknown'}</span>
                      <span className="text-xs text-muted-foreground ml-1">({line.account?.code})</span>
                    </div>
                    {line.description && (
                      <p className="text-xs text-muted-foreground">{line.description}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {line.debit > 0 ? `$${line.debit.toLocaleString()}` : ''}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {line.credit > 0 ? `$${line.credit.toLocaleString()}` : ''}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold">
                <TableCell>Total</TableCell>
                <TableCell className="text-right">${totalDebit.toLocaleString()}</TableCell>
                <TableCell className="text-right">${totalCredit.toLocaleString()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>Record a new expense</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger>
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="exp-amount">Amount ($) *</Label>
              <Input
                id="exp-amount"
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="500"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="exp-date">Date *</Label>
              <Input
                id="exp-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="exp-desc">Description</Label>
            <Textarea
              id="exp-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Expense details..."
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exp-paidby">Paid By</Label>
            <Input
              id="exp-paidby"
              value={form.paidBy}
              onChange={(e) => setForm({ ...form, paidBy: e.target.value })}
              placeholder="John Smith"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || !form.category || !form.amount || !form.date}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {saving ? 'Adding...' : 'Add Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
