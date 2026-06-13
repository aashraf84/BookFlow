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
import { Card, CardContent } from '@/components/ui/card'
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
  const tabs = [
    { value: 'overview', label: 'Overview', icon: BarChart3 },
    { value: 'accounts', label: 'Accounts', icon: Wallet },
    { value: 'entries', label: 'Journal', icon: BookOpen },
    { value: 'expenses', label: 'Expenses', icon: Receipt },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-xl bg-macos-green/10 flex items-center justify-center">
          <DollarSign className="size-4 text-macos-green" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-[13px] font-semibold tracking-tight">Finance</h2>
          <p className="text-[11px] text-muted-foreground">
            Financial management, accounting, and reporting
          </p>
        </div>
      </div>

      <div className="macos-segmented inline-flex p-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.value
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3 py-1 text-[12px] font-medium rounded-md flex items-center gap-1.5 transition-none ${
                isActive ? 'macos-segmented-active' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="size-3.5" strokeWidth={1.5} />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="mt-4">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'accounts' && <AccountsTab />}
        {activeTab === 'entries' && <JournalEntriesTab />}
        {activeTab === 'expenses' && <ExpensesTab />}
      </div>
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
            <Card key={i} className="rounded-2xl macos-shadow border-0 animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-2/3 mb-3" />
                <div className="h-6 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* P&L Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="rounded-2xl macos-shadow border-0 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold tracking-tight text-macos-green">${revenue.toLocaleString()}</p>
                  <div className="flex items-center gap-1 text-[11px] mt-1">
                    <ArrowUpRight className="size-3 text-macos-green" />
                    <span className="text-macos-green font-medium">+8.5%</span>
                    <span className="text-muted-foreground">vs last month</span>
                  </div>
                </div>
                <div className="size-8 rounded-xl bg-macos-green/10 flex items-center justify-center">
                  <TrendingUp className="size-4 text-macos-green" strokeWidth={1.5} />
                </div>
              </div>
            </Card>
            <Card className="rounded-2xl macos-shadow border-0 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Expenses</p>
                  <p className="text-2xl font-bold tracking-tight text-macos-red">${expenseTotal.toLocaleString()}</p>
                  <div className="flex items-center gap-1 text-[11px] mt-1">
                    <ArrowDownRight className="size-3 text-macos-red" />
                    <span className="text-macos-red font-medium">+3.2%</span>
                    <span className="text-muted-foreground">vs last month</span>
                  </div>
                </div>
                <div className="size-8 rounded-xl bg-macos-red/10 flex items-center justify-center">
                  <TrendingDown className="size-4 text-macos-red" strokeWidth={1.5} />
                </div>
              </div>
            </Card>
            <Card className="rounded-2xl macos-shadow border-0 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Net Income</p>
                  <p className="text-2xl font-bold tracking-tight text-macos-blue">${netIncome.toLocaleString()}</p>
                  <div className="flex items-center gap-1 text-[11px] mt-1">
                    {netIncome >= 0 ? (
                      <>
                        <ArrowUpRight className="size-3 text-macos-blue" />
                        <span className="text-macos-blue font-medium">+12.1%</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="size-3 text-macos-red" />
                        <span className="text-macos-red font-medium">-5.3%</span>
                      </>
                    )}
                    <span className="text-muted-foreground">vs last month</span>
                  </div>
                </div>
                <div className="size-8 rounded-xl bg-macos-blue/10 flex items-center justify-center">
                  <DollarSign className="size-4 text-macos-blue" strokeWidth={1.5} />
                </div>
              </div>
            </Card>
          </div>

          {/* Revenue vs Expenses Bar Chart */}
          <Card className="rounded-2xl macos-shadow border-0">
            <CardContent className="p-4">
              <h3 className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-4">Revenue vs Expenses</h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-muted-foreground">Revenue</span>
                    <span className="font-medium text-macos-green">${revenue.toLocaleString()}</span>
                  </div>
                  <div className="h-3 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-macos-green rounded-full transition-all"
                      style={{ width: `${revenue > 0 ? Math.min((revenue / (revenue + expenseTotal || 1)) * 100, 100) : 0}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-muted-foreground">Expenses</span>
                    <span className="font-medium text-macos-red">${expenseTotal.toLocaleString()}</span>
                  </div>
                  <div className="h-3 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-macos-red rounded-full transition-all"
                      style={{ width: `${expenseTotal > 0 ? Math.min((expenseTotal / (revenue + expenseTotal || 1)) * 100, 100) : 0}%` }}
                    />
                  </div>
                </div>
                <Separator className="bg-border/50" />
                <div className="flex justify-between text-[13px] font-semibold">
                  <span>Net {netIncome >= 0 ? 'Profit' : 'Loss'}</span>
                  <span className={netIncome >= 0 ? 'text-macos-green' : 'text-macos-red'}>
                    ${Math.abs(netIncome).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Balance Sheet */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="rounded-2xl macos-shadow border-0">
              <CardContent className="p-4">
                <h3 className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-4">Balance Sheet</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-muted-foreground">Total Assets</span>
                    <span className="font-medium">${assets.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-muted-foreground">Total Liabilities</span>
                    <span className="font-medium">${liabilities.toLocaleString()}</span>
                  </div>
                  <Separator className="bg-border/50" />
                  <div className="flex justify-between text-[13px] font-semibold">
                    <span>Net Worth</span>
                    <span className={(assets - liabilities) >= 0 ? 'text-macos-green' : 'text-macos-red'}>
                      ${(assets - liabilities).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl macos-shadow border-0">
              <CardContent className="p-4">
                <h3 className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-4">Account Breakdown</h3>
                <div className="space-y-2">
                  {accountTypes.map((type) => {
                    const typeBalance = accounts
                      .filter((a) => a.type === type)
                      .reduce((sum, a) => sum + a.balance, 0)
                    return (
                      <div key={type} className="flex justify-between text-[13px]">
                        <span className="text-muted-foreground">{accountTypeLabels[type]}</span>
                        <span>${typeBalance.toLocaleString()}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Payments */}
          {pendingExpenses > 0 && (
            <Card className="rounded-2xl macos-shadow border-0 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-xl bg-macos-orange/10 flex items-center justify-center">
                    <Clock className="size-4 text-macos-orange" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Pending Payments</p>
                    <p className="text-2xl font-bold tracking-tight text-macos-orange">${pendingExpenses.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Recent Expenses */}
          <Card className="rounded-2xl macos-shadow border-0">
            <CardContent className="p-4">
              <h3 className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-3">Recent Expenses</h3>
              {expenses.length === 0 ? (
                <p className="text-[13px] text-muted-foreground text-center py-4">No expenses recorded</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                  {expenses.slice(0, 5).map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/50 text-[13px]">
                      <div>
                        <p className="font-medium">{expense.category}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {expense.description || 'No description'} · {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-macos-red">${expense.amount.toLocaleString()}</p>
                        <Badge
                          className={`rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 ${
                            expense.status === 'paid'
                              ? 'bg-macos-green/10 text-macos-green'
                              : expense.status === 'approved'
                              ? 'bg-macos-blue/10 text-macos-blue'
                              : 'bg-macos-orange/10 text-macos-orange'
                          }`}
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

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'asset':
        return 'bg-macos-green/10 text-macos-green'
      case 'liability':
        return 'bg-macos-red/10 text-macos-red'
      case 'equity':
        return 'bg-macos-teal/10 text-macos-teal'
      case 'revenue':
        return 'bg-macos-orange/10 text-macos-orange'
      case 'expense':
        return 'bg-macos-purple/10 text-macos-purple'
      default:
        return 'bg-secondary text-secondary-foreground'
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
        <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{accounts.length} accounts</p>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-1.5 bg-primary text-primary-foreground rounded-lg font-medium text-[13px]">
          <Plus className="size-3.5" strokeWidth={2} /> Create Account
        </Button>
      </div>

      {loading ? (
        <Card className="rounded-2xl macos-shadow border-0">
          <CardContent className="p-6">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : accounts.length === 0 ? (
        <Card className="rounded-2xl macos-shadow border-0">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Wallet className="size-10 text-muted-foreground mb-3" strokeWidth={1.5} />
            <p className="text-[13px] text-muted-foreground">No accounts found</p>
            <p className="text-[11px] text-muted-foreground">Create your chart of accounts</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl macos-shadow border-0">
          <CardContent className="p-0">
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Code</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Name</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Type</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Parent</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Balance</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(groupedAccounts).map(([type, typeAccounts]) => (
                    <React.Fragment key={type}>
                      <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                        <TableCell colSpan={6} className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground py-2">
                          {type} ({typeAccounts.length})
                        </TableCell>
                      </TableRow>
                      {typeAccounts.map((account) => (
                        <TableRow key={account.id} className="hover:bg-secondary/50">
                          <TableCell className="font-mono text-[11px]">{account.code}</TableCell>
                          <TableCell className="font-medium text-[13px]">{account.name}</TableCell>
                          <TableCell>
                            <Badge className={`rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 ${getTypeBadge(account.type)}`}>
                              {account.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-[11px] text-muted-foreground">
                            {account.parentCode || '—'}
                          </TableCell>
                          <TableCell className="text-right font-medium text-[13px]">
                            ${account.balance.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 ${
                                account.isActive
                                  ? 'bg-macos-green/10 text-macos-green'
                                  : 'bg-macos-red/10 text-macos-red'
                              }`}
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
        <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{entries.length} entries</p>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-1.5 bg-primary text-primary-foreground rounded-lg font-medium text-[13px]">
          <Plus className="size-3.5" strokeWidth={2} /> Create Entry
        </Button>
      </div>

      {loading ? (
        <Card className="rounded-2xl macos-shadow border-0">
          <CardContent className="p-6">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : entries.length === 0 ? (
        <Card className="rounded-2xl macos-shadow border-0">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="size-10 text-muted-foreground mb-3" strokeWidth={1.5} />
            <p className="text-[13px] text-muted-foreground">No journal entries found</p>
            <p className="text-[11px] text-muted-foreground">Record your first journal entry</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl macos-shadow border-0">
          <CardContent className="p-0">
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Date</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Description</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Reference</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Debit</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Credit</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => {
                    const totalDebit = entry.lines.reduce((s, l) => s + l.debit, 0)
                    const totalCredit = entry.lines.reduce((s, l) => s + l.credit, 0)
                    return (
                      <TableRow key={entry.id} className="cursor-pointer hover:bg-secondary/50" onClick={() => setSelectedEntry(entry)}>
                        <TableCell className="text-[11px]">
                          {new Date(entry.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium text-[13px] max-w-48 truncate">
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
                          <Badge
                            className={`rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 ${
                              entry.isPosted
                                ? 'bg-macos-green/10 text-macos-green'
                                : 'bg-macos-orange/10 text-macos-orange'
                            }`}
                          >
                            {entry.isPosted ? 'Posted' : 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Eye className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-macos-green/10 text-macos-green'
      case 'approved':
        return 'bg-macos-blue/10 text-macos-blue'
      case 'pending':
        return 'bg-macos-orange/10 text-macos-orange'
      default:
        return 'bg-secondary text-secondary-foreground'
    }
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const pendingAmount = expenses.filter((e) => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0)
  const paidAmount = expenses.filter((e) => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="rounded-2xl macos-shadow border-0 p-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-macos-red/10 flex items-center justify-center">
              <Receipt className="size-4 text-macos-red" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight">${totalExpenses.toLocaleString()}</p>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Total Expenses</p>
            </div>
          </div>
        </Card>
        <Card className="rounded-2xl macos-shadow border-0 p-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-macos-orange/10 flex items-center justify-center">
              <Clock className="size-4 text-macos-orange" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-macos-orange">${pendingAmount.toLocaleString()}</p>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Pending</p>
            </div>
          </div>
        </Card>
        <Card className="rounded-2xl macos-shadow border-0 p-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-macos-green/10 flex items-center justify-center">
              <CheckCircle2 className="size-4 text-macos-green" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-macos-green">${paidAmount.toLocaleString()}</p>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Paid</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{expenses.length} expense records</p>
        <Button onClick={() => setShowAddDialog(true)} className="gap-1.5 bg-primary text-primary-foreground rounded-lg font-medium text-[13px]">
          <Plus className="size-3.5" strokeWidth={2} /> Add Expense
        </Button>
      </div>

      {loading ? (
        <Card className="rounded-2xl macos-shadow border-0">
          <CardContent className="p-6">
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : expenses.length === 0 ? (
        <Card className="rounded-2xl macos-shadow border-0">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Receipt className="size-10 text-muted-foreground mb-3" strokeWidth={1.5} />
            <p className="text-[13px] text-muted-foreground">No expenses found</p>
            <p className="text-[11px] text-muted-foreground">Record your first expense</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl macos-shadow border-0">
          <CardContent className="p-0">
            <ScrollArea className="max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Category</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Description</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Amount</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Date</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Paid By</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id} className="hover:bg-secondary/50">
                      <TableCell className="font-medium text-[13px]">{expense.category}</TableCell>
                      <TableCell className="text-[11px] text-muted-foreground max-w-32 truncate">
                        {expense.description || '—'}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-macos-red text-[13px]">
                        ${expense.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-[11px]">
                        {new Date(expense.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-[11px] text-muted-foreground">
                        {expense.paidBy || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge className={`rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 ${getStatusBadge(expense.status)}`}>
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
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-[13px] font-semibold tracking-tight">Create Account</DialogTitle>
          <DialogDescription className="text-[11px]">Add a new account to your chart of accounts</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Account Code *</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="1000" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8" required />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Account Type *</Label>
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
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Account Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Cash on Hand" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8" required />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Parent Code</Label>
            <Input value={form.parentCode} onChange={(e) => setForm({ ...form, parentCode: e.target.value })} placeholder="1000 (optional)" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8" />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-lg text-[13px]">Cancel</Button>
            <Button type="submit" disabled={saving || !form.code.trim() || !form.name.trim()} className="bg-primary text-primary-foreground rounded-lg font-medium text-[13px]">
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-[13px] font-semibold tracking-tight">Create Journal Entry</DialogTitle>
          <DialogDescription className="text-[11px]">Record a double-entry journal transaction</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Date *</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8" required />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Reference</Label>
              <Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="JE-001" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Description *</Label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Monthly rent payment" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8" required />
          </div>

          <Separator className="bg-border/50" />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Entry Lines</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addLine} className="gap-1 text-[11px] text-macos-blue hover:text-macos-blue rounded-lg">
                <Plus className="size-3" strokeWidth={2} /> Add Line
              </Button>
            </div>
            {lines.map((line) => (
              <div key={line.key} className="flex items-end gap-2 p-3 rounded-xl bg-secondary/50">
                <div className="flex-[2] space-y-1">
                  <Label className="text-[10px] font-semibold tracking-wide text-muted-foreground">Account</Label>
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
                  <Label className="text-[10px] font-semibold tracking-wide text-muted-foreground">Debit</Label>
                  <Input type="number" step="0.01" min="0" value={line.debit} onChange={(e) => updateLine(line.key, { debit: e.target.value })} className="h-7 text-[11px] rounded-lg border-0 bg-background" />
                </div>
                <div className="w-24 space-y-1">
                  <Label className="text-[10px] font-semibold tracking-wide text-muted-foreground">Credit</Label>
                  <Input type="number" step="0.01" min="0" value={line.credit} onChange={(e) => updateLine(line.key, { credit: e.target.value })} className="h-7 text-[11px] rounded-lg border-0 bg-background" />
                </div>
                <div className="flex-[1] space-y-1">
                  <Label className="text-[10px] font-semibold tracking-wide text-muted-foreground">Note</Label>
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
            <Badge className={`rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 ${isBalanced ? 'bg-macos-green/10 text-macos-green' : 'bg-macos-orange/10 text-macos-orange'}`}>
              {isBalanced ? 'Balanced' : 'Unbalanced'}
            </Badge>
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

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-lg text-[13px]">Cancel</Button>
            <Button type="submit" disabled={saving || !form.description.trim() || !isBalanced} className="bg-primary text-primary-foreground rounded-lg font-medium text-[13px]">
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
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[13px] font-semibold tracking-tight">
            <div className="size-7 rounded-lg bg-macos-green/10 flex items-center justify-center">
              <BookOpen className="size-4 text-macos-green" strokeWidth={1.5} />
            </div>
            Journal Entry
          </DialogTitle>
          <DialogDescription className="text-[11px]">{entry.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="grid grid-cols-2 gap-3 text-[13px] flex-1">
              <div>
                <span className="text-[11px] font-semibold tracking-wide text-muted-foreground">Date: </span>
                <span className="font-medium">{new Date(entry.date).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold tracking-wide text-muted-foreground">Reference: </span>
                <span className="font-medium">{entry.reference || '—'}</span>
              </div>
            </div>
            <Badge
              className={`rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 ${
                entry.isPosted
                  ? 'bg-macos-green/10 text-macos-green'
                  : 'bg-macos-orange/10 text-macos-orange'
              }`}
            >
              {entry.isPosted ? 'Posted' : 'Draft'}
            </Badge>
          </div>

          <Separator className="bg-border/50" />

          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Entry Lines</h4>
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

          <Separator className="bg-border/50" />

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-macos-blue/10 text-center">
              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Total Debit</p>
              <p className="text-[13px] font-bold text-macos-blue">${totalDebit.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-macos-green/10 text-center">
              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Total Credit</p>
              <p className="text-[13px] font-bold text-macos-green">${totalCredit.toLocaleString()}</p>
            </div>
          </div>
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
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-[13px] font-semibold tracking-tight">Add Expense</DialogTitle>
          <DialogDescription className="text-[11px]">Record a new expense</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Category *</Label>
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
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Amount ($) *</Label>
              <Input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="500" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Date *</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8" required />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Status</Label>
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
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Expense details..." rows={2} className="rounded-lg bg-secondary/80 border-0 text-[13px]" />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Paid By</Label>
            <Input value={form.paidBy} onChange={(e) => setForm({ ...form, paidBy: e.target.value })} placeholder="John Smith" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8" />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-lg text-[13px]">Cancel</Button>
            <Button type="submit" disabled={saving || !form.category || !form.amount || !form.date} className="bg-primary text-primary-foreground rounded-lg font-medium text-[13px]">
              {saving ? 'Adding...' : 'Add Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
