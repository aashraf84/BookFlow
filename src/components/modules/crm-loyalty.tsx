'use client'

import * as React from 'react'
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  MapPin,
  Star,
  Crown,
  Award,
  Gift,
  Megaphone,
  TrendingUp,
  Eye,
  Trash2,
  Send,
  Calendar,
  DollarSign,
  ShoppingBag,
  Sparkles,
  Contact,
} from 'lucide-react'
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
import { useAppStore } from '@/store/app-store'

// ==================== TYPES ====================

interface Customer {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
  type: string
  loyaltyPoints: number
  totalSpent: number
  creditLimit: number
  outstanding: number
  isActive: boolean
  createdAt: string
  _count?: { sales: number; wholesaleOrders: number }
  school?: { id: string; name: string } | null
}

interface LoyaltyTier {
  id: string
  name: string
  minPoints: number
  maxPoints?: number | null
  discount: number
  benefits?: string | null
}

interface Campaign {
  id: string
  name: string
  type: string
  target?: string | null
  message: string
  status: string
  sentCount: number
  responseCount: number
  scheduledAt?: string | null
  sentAt?: string | null
  createdAt: string
}

// ==================== CRM & LOYALTY MODULE ====================

export function CRMLoyaltyModule() {
  const [activeTab, setActiveTab] = React.useState('customers')
  const tabs = [
    { value: 'customers', label: 'Customers', icon: Contact },
    { value: 'loyalty', label: 'Loyalty', icon: Crown },
    { value: 'campaigns', label: 'Campaigns', icon: Megaphone },
  ]

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="macos-page-header">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gg-bridge/10 flex items-center justify-center macos-shadow-card">
            <Contact className="size-5 text-gg-bridge" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="macos-page-title">CRM & Loyalty</h2>
            <p className="macos-page-subtitle">Manage customers, loyalty programs, and marketing campaigns</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="macos-filter-bar">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.value
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`macos-filter-item flex items-center gap-1.5 ${isActive ? 'macos-filter-item-active' : ''}`}
            >
              <Icon className="size-3.5" strokeWidth={1.5} />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="mt-4">
        {activeTab === 'customers' && <CustomersTab />}
        {activeTab === 'loyalty' && <LoyaltyTab />}
        {activeTab === 'campaigns' && <CampaignsTab />}
      </div>
    </div>
  )
}

// ==================== CUSTOMERS TAB ====================

function CustomersTab() {
  const { authUser } = useAppStore()
  const isViewOnly = authUser?.isViewOnly ?? false
  const [customers, setCustomers] = React.useState<Customer[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [typeFilter, setTypeFilter] = React.useState('all')
  const [showAddDialog, setShowAddDialog] = React.useState(false)
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null)

  const fetchCustomers = React.useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (typeFilter && typeFilter !== 'all') params.set('type', typeFilter)
      params.set('limit', '50')
      const res = await fetch(`/api/customers?${params}`)
      const json = await res.json()
      if (json.data) setCustomers(json.data)
    } catch (err) {
      console.error('Failed to fetch customers:', err)
    } finally {
      setLoading(false)
    }
  }, [search, typeFilter])

  React.useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this customer?')) return
    try {
      await fetch(`/api/customers`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: false }),
      })
      fetchCustomers()
    } catch (err) {
      console.error('Failed to deactivate customer:', err)
    }
  }

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      retail: 'bg-macos-green/10 text-macos-green',
      wholesale: 'bg-macos-teal/10 text-macos-teal',
      school: 'bg-macos-orange/10 text-macos-orange',
      dealer: 'bg-macos-purple/10 text-macos-purple',
      distributor: 'bg-macos-red/10 text-macos-red',
    }
    return styles[type] || 'bg-secondary text-secondary-foreground'
  }

  const getLoyaltyTier = (points: number) => {
    if (points >= 5000) return { name: 'Platinum', color: 'bg-gg-bridge/10 text-gg-bridge', icon: Crown }
    if (points >= 2000) return { name: 'Gold', color: 'bg-gg-golden/10 text-gg-golden', icon: Award }
    if (points >= 500) return { name: 'Silver', color: 'text-muted-foreground bg-secondary', icon: Star }
    return { name: 'Bronze', color: 'bg-macos-orange/10 text-macos-orange', icon: Gift }
  }

  const totalCustomers = customers.length
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0)
  const totalOutstanding = customers.reduce((sum, c) => sum + c.outstanding, 0)
  const totalPoints = customers.reduce((sum, c) => sum + c.loyaltyPoints, 0)

  return (
    <div className="space-y-5">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="macos-stat macos-shadow-card">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-macos-blue/10 flex items-center justify-center">
              <Users className="size-4 text-macos-blue" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[24px] font-bold leading-tight" style={{ letterSpacing: '-0.03em' }}>{totalCustomers}</p>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Total Customers</p>
            </div>
          </div>
        </div>
        <div className="macos-stat macos-shadow-card">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-macos-green/10 flex items-center justify-center">
              <DollarSign className="size-4 text-macos-green" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[24px] font-bold leading-tight text-macos-green" style={{ letterSpacing: '-0.03em' }}>${totalRevenue.toLocaleString()}</p>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Total Revenue</p>
            </div>
          </div>
        </div>
        <div className="macos-stat macos-shadow-card">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-macos-orange/10 flex items-center justify-center">
              <TrendingUp className="size-4 text-macos-orange" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[24px] font-bold leading-tight text-macos-orange" style={{ letterSpacing: '-0.03em' }}>${totalOutstanding.toLocaleString()}</p>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Outstanding</p>
            </div>
          </div>
        </div>
        <div className="macos-stat macos-shadow-card">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-gg-bridge/10 flex items-center justify-center">
              <Sparkles className="size-4 text-gg-bridge" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[24px] font-bold leading-tight text-gg-bridge" style={{ letterSpacing: '-0.03em' }}>{totalPoints.toLocaleString()}</p>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Loyalty Points</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial sm:w-64 macos-search">
            <Search className="absolute left-2.5 top-1.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 border-0 bg-transparent text-[13px] h-8 focus:ring-0 focus:outline-none"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32 rounded-lg bg-secondary/80 border-0 text-[13px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="wholesale">Wholesale</SelectItem>
              <SelectItem value="school">School</SelectItem>
              <SelectItem value="dealer">Dealer</SelectItem>
              <SelectItem value="distributor">Distributor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {!isViewOnly && (
          <Button onClick={() => setShowAddDialog(true)} className="gap-1.5 bg-primary text-primary-foreground rounded-lg font-medium text-[13px]">
            <Plus className="size-3.5" strokeWidth={2} /> Add Customer
          </Button>
        )}
      </div>

      {/* Customer List */}
      {loading ? (
        <div className="macos-card macos-shadow-card p-6">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 bg-muted/50 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      ) : customers.length === 0 ? (
        <div className="macos-card macos-shadow-card macos-empty">
          <Contact className="size-12 text-muted-foreground/40 mb-3" strokeWidth={1} />
          <p className="text-[13px] font-medium text-muted-foreground">No customers found</p>
          <p className="text-[11px] text-muted-foreground mt-1">Add your first customer to get started</p>
        </div>
      ) : (
        <div className="macos-card macos-shadow-card overflow-hidden">
          <ScrollArea className="max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Name</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Contact</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Type</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Tier</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Points</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Total Spent</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Outstanding</TableHead>
                  {!isViewOnly && <TableHead className="w-10"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => {
                  const tier = getLoyaltyTier(customer.loyaltyPoints)
                  const TierIcon = tier.icon
                  return (
                    <TableRow
                      key={customer.id}
                      className="macos-table-row cursor-pointer"
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <TableCell className="font-medium text-[13px]">
                        <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-full bg-gg-bridge/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-[11px] font-semibold text-gg-bridge">{customer.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <span>{customer.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-[11px] space-y-0.5">
                          {customer.email && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="size-3" strokeWidth={1.5} /> {customer.email}
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="size-3" strokeWidth={1.5} /> {customer.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 border-0 ${getTypeBadge(customer.type)}`}>
                          {customer.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${tier.color}`}>
                          <TierIcon className="size-3" strokeWidth={1.5} />
                          {tier.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-gg-bridge font-medium text-[13px]">{customer.loyaltyPoints}</span>
                      </TableCell>
                      <TableCell className="text-right text-[13px]">
                        ${customer.totalSpent.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`text-[13px] ${customer.outstanding > 0 ? 'text-macos-orange font-medium' : ''}`}>
                          ${customer.outstanding.toLocaleString()}
                        </span>
                      </TableCell>
                      {!isViewOnly && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-macos-red hover:text-macos-red hover:bg-macos-red/10 rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(customer.id)
                            }}
                          >
                            <Trash2 className="size-3" strokeWidth={1.5} />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      )}

      <AddCustomerDialog open={showAddDialog} onOpenChange={setShowAddDialog} onSuccess={fetchCustomers} />
      <CustomerDetailDialog
        customer={selectedCustomer}
        onOpenChange={(open) => !open && setSelectedCustomer(null)}
      />
    </div>
  )
}

// ==================== LOYALTY TAB ====================

function LoyaltyTab() {
  const [tiers, setTiers] = React.useState<LoyaltyTier[]>([])
  const [loading, setLoading] = React.useState(true)

  const fetchTiers = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/crm/loyalty-tiers')
      if (res.ok) {
        const json = await res.json()
        if (json.data) setTiers(json.data)
      }
    } catch (err) {
      console.error('Failed to fetch loyalty tiers:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchTiers()
  }, [fetchTiers])

  const tierIcons: Record<string, React.ElementType> = {
    Bronze: Award,
    Silver: Star,
    Gold: Crown,
    Platinum: Gift,
  }

  const tierColors: Record<string, { bg: string; text: string; gradient: string; barColor: string; accentBg: string }> = {
    Bronze: { bg: 'bg-macos-orange/10', text: 'text-macos-orange', gradient: 'from-macos-orange to-amber-700', barColor: 'bg-macos-orange', accentBg: 'bg-macos-orange/5' },
    Silver: { bg: 'bg-secondary', text: 'text-muted-foreground', gradient: 'from-gray-400 to-gray-600', barColor: 'bg-gray-400', accentBg: 'bg-secondary/50' },
    Gold: { bg: 'bg-gg-golden/10', text: 'text-gg-golden', gradient: 'from-gg-golden to-amber-600', barColor: 'bg-gg-golden', accentBg: 'bg-gg-golden/5' },
    Platinum: { bg: 'bg-gg-bridge/10', text: 'text-gg-bridge', gradient: 'from-gg-bridge to-gg-sunset', barColor: 'bg-gg-bridge', accentBg: 'bg-gg-bridge/5' },
  }

  const defaultTiers: LoyaltyTier[] = [
    { id: '1', name: 'Bronze', minPoints: 0, maxPoints: 499, discount: 2, benefits: 'Birthday discount, Basic support' },
    { id: '2', name: 'Silver', minPoints: 500, maxPoints: 1999, discount: 5, benefits: 'Priority support, Early access to sales, Free shipping' },
    { id: '3', name: 'Gold', minPoints: 2000, maxPoints: 4999, discount: 10, benefits: 'VIP support, Exclusive offers, Free shipping, Gift wrapping' },
    { id: '4', name: 'Platinum', minPoints: 5000, maxPoints: null, discount: 15, benefits: 'Personal account manager, Best prices, Free shipping, Gift wrapping, Invitation to events' },
  ]

  const displayTiers = tiers.length > 0 ? tiers : defaultTiers

  const pointsRules = [
    { action: 'Purchase', points: '1 point per $1 spent', icon: ShoppingBag, color: 'bg-macos-green/10 text-macos-green' },
    { action: 'Referral', points: '50 bonus points', icon: Users, color: 'bg-macos-blue/10 text-macos-blue' },
    { action: 'Review', points: '20 bonus points', icon: Star, color: 'bg-gg-golden/10 text-gg-golden' },
    { action: 'Birthday', points: '100 bonus points', icon: Gift, color: 'bg-gg-bridge/10 text-gg-bridge' },
    { action: 'Social Share', points: '10 bonus points', icon: Megaphone, color: 'bg-macos-teal/10 text-macos-teal' },
  ]

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="macos-card macos-shadow-card p-6 animate-pulse">
              <div className="h-8 bg-muted/50 rounded w-1/2 mb-4" />
              <div className="h-3 bg-muted/50 rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted/50 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Loyalty Tiers - macOS Contacts style cards */}
          <div>
            <div className="macos-section-header">
              <div>
                <h3 className="macos-section-title">Loyalty Tiers</h3>
                <p className="macos-section-desc">Customer rewards progression</p>
              </div>
              <Badge className="rounded-md bg-gg-bridge/10 text-gg-bridge border-0 text-[10px] font-semibold px-2.5 py-1">
                <Crown className="size-3 mr-1" strokeWidth={1.5} />
                {displayTiers.length} Tiers
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {displayTiers.map((tier) => {
                const Icon = tierIcons[tier.name] || Star
                const colors = tierColors[tier.name] || tierColors.Bronze
                const progress = tier.maxPoints ? Math.min((tier.minPoints / (tier.maxPoints || 1)) * 100, 100) : 100
                return (
                  <div key={tier.id} className="macos-card macos-shadow-card relative overflow-hidden group">
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient}`} />
                    <div className="p-5 pt-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`size-9 rounded-xl ${colors.bg} flex items-center justify-center macos-shadow-card`}>
                          <Icon className={`size-4 ${colors.text}`} strokeWidth={1.5} />
                        </div>
                        <div>
                          <h4 className="text-[13px] font-semibold" style={{ letterSpacing: '-0.01em' }}>{tier.name}</h4>
                          <p className="text-[10px] font-semibold tracking-wider text-macos-green">{tier.discount}% discount</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Points Range</span>
                          <span className="font-medium text-[13px]" style={{ fontWeight: 500 }}>
                            {tier.minPoints.toLocaleString()} – {tier.maxPoints ? tier.maxPoints.toLocaleString() : '∞'}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div
                            className={`h-full rounded-full ${colors.barColor} transition-all duration-500`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        {tier.benefits && (
                          <p className="text-[11px] text-muted-foreground leading-relaxed">{tier.benefits}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Points Rules */}
          <div>
            <div className="macos-section-header">
              <div>
                <h3 className="macos-section-title">Points Rules</h3>
                <p className="macos-section-desc">How customers earn loyalty points</p>
              </div>
            </div>
            <div className="macos-card macos-shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Action</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Points Earned</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pointsRules.map((rule) => {
                    const Icon = rule.icon
                    return (
                      <TableRow key={rule.action} className="macos-table-row">
                        <TableCell className="flex items-center gap-2.5 text-[13px]">
                          <div className={`size-7 rounded-lg ${rule.color} flex items-center justify-center`}>
                            <Icon className="size-3" strokeWidth={1.5} />
                          </div>
                          <span style={{ fontWeight: 500 }}>{rule.action}</span>
                        </TableCell>
                        <TableCell className="font-medium text-gg-bridge text-[13px]">{rule.points}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ==================== CAMPAIGNS TAB ====================

function CampaignsTab() {
  const { authUser } = useAppStore()
  const isViewOnly = authUser?.isViewOnly ?? false
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showCreateDialog, setShowCreateDialog] = React.useState(false)

  const fetchCampaigns = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/crm/campaigns')
      if (res.ok) {
        const json = await res.json()
        if (json.data) setCampaigns(json.data)
      }
    } catch (err) {
      console.error('Failed to fetch campaigns:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-secondary text-secondary-foreground'
      case 'scheduled':
        return 'bg-macos-orange/10 text-macos-orange'
      case 'sent':
        return 'bg-macos-teal/10 text-macos-teal'
      case 'completed':
        return 'bg-macos-green/10 text-macos-green'
      default:
        return 'bg-secondary text-secondary-foreground'
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'sms':
        return 'bg-macos-green/10 text-macos-green'
      case 'whatsapp':
        return 'bg-macos-teal/10 text-macos-teal'
      case 'email':
        return 'bg-macos-blue/10 text-macos-blue'
      case 'social':
        return 'bg-gg-bridge/10 text-gg-bridge'
      default:
        return 'bg-secondary text-secondary-foreground'
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{campaigns.length} campaigns</p>
        {!isViewOnly && (
          <Button onClick={() => setShowCreateDialog(true)} className="gap-1.5 bg-primary text-primary-foreground rounded-lg font-medium text-[13px]">
            <Plus className="size-3.5" strokeWidth={2} /> Create Campaign
          </Button>
        )}
      </div>

      {loading ? (
        <div className="macos-card macos-shadow-card p-6">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-muted/50 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="macos-card macos-shadow-card macos-empty">
          <Megaphone className="size-12 text-muted-foreground/40 mb-3" strokeWidth={1} />
          <p className="text-[13px] font-medium text-muted-foreground">No campaigns found</p>
          <p className="text-[11px] text-muted-foreground mt-1">Create your first marketing campaign</p>
        </div>
      ) : (
        <div className="macos-card macos-shadow-card overflow-hidden">
          <ScrollArea className="max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Name</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Type</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Sent</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Responses</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Schedule</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id} className="macos-table-row">
                    <TableCell className="font-medium text-[13px]" style={{ fontWeight: 500 }}>{campaign.name}</TableCell>
                    <TableCell>
                      <Badge className={`rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 border-0 ${getTypeBadge(campaign.type)}`}>
                        {campaign.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 border-0 ${getStatusBadge(campaign.status)}`}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-[13px]">
                      <span className="flex items-center justify-end gap-1 text-muted-foreground">
                        <Send className="size-3" strokeWidth={1.5} /> {campaign.sentCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-macos-green font-medium text-[13px] flex items-center justify-end gap-1">
                        <TrendingUp className="size-3" strokeWidth={1.5} /> {campaign.responseCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-[11px] text-muted-foreground">
                      {campaign.scheduledAt ? (
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" strokeWidth={1.5} />
                          {new Date(campaign.scheduledAt).toLocaleDateString()}
                        </span>
                      ) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      )}

      <CreateCampaignDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onSuccess={fetchCampaigns} />
    </div>
  )
}

// ==================== ADD CUSTOMER DIALOG ====================

function AddCustomerDialog({
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
    name: '',
    email: '',
    phone: '',
    address: '',
    type: 'retail',
    creditLimit: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          creditLimit: parseFloat(form.creditLimit) || 0,
        }),
      })
      if (res.ok) {
        setForm({ name: '', email: '', phone: '', address: '', type: 'retail', creditLimit: '' })
        onOpenChange(false)
        onSuccess()
      } else {
        const json = await res.json()
        alert(json.error || 'Failed to create customer')
      }
    } catch (err) {
      console.error('Failed to create customer:', err)
      alert('Failed to create customer')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl macos-shadow-float">
        <DialogHeader>
          <DialogTitle className="text-[13px] font-semibold" style={{ letterSpacing: '-0.01em' }}>Add Customer</DialogTitle>
          <DialogDescription className="text-[11px]">Register a new customer</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Smith" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1-555-0100" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Address</Label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main Street" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Customer Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="wholesale">Wholesale</SelectItem>
                  <SelectItem value="school">School</SelectItem>
                  <SelectItem value="dealer">Dealer</SelectItem>
                  <SelectItem value="distributor">Distributor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Credit Limit ($)</Label>
              <Input type="number" step="0.01" value={form.creditLimit} onChange={(e) => setForm({ ...form, creditLimit: e.target.value })} placeholder="5000" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-lg text-[13px]">Cancel</Button>
            <Button type="submit" disabled={saving || !form.name.trim()} className="bg-primary text-primary-foreground rounded-lg font-medium text-[13px]">
              {saving ? 'Saving...' : 'Add Customer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ==================== CUSTOMER DETAIL DIALOG ====================

function CustomerDetailDialog({
  customer,
  onOpenChange,
}: {
  customer: Customer | null
  onOpenChange: (open: boolean) => void
}) {
  if (!customer) return null

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      retail: 'bg-macos-green/10 text-macos-green',
      wholesale: 'bg-macos-teal/10 text-macos-teal',
      school: 'bg-macos-orange/10 text-macos-orange',
      dealer: 'bg-macos-purple/10 text-macos-purple',
      distributor: 'bg-macos-red/10 text-macos-red',
    }
    return styles[type] || 'bg-secondary text-secondary-foreground'
  }

  const getLoyaltyTier = (points: number) => {
    if (points >= 5000) return { name: 'Platinum', color: 'bg-gg-bridge/10 text-gg-bridge', icon: Crown }
    if (points >= 2000) return { name: 'Gold', color: 'bg-gg-golden/10 text-gg-golden', icon: Award }
    if (points >= 500) return { name: 'Silver', color: 'text-muted-foreground bg-secondary', icon: Star }
    return { name: 'Bronze', color: 'bg-macos-orange/10 text-macos-orange', icon: Gift }
  }

  const tier = getLoyaltyTier(customer.loyaltyPoints)
  const TierIcon = tier.icon

  return (
    <Dialog open={!!customer} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl macos-shadow-float">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-[13px] font-semibold" style={{ letterSpacing: '-0.01em' }}>
            <div className="size-9 rounded-full bg-gg-bridge/10 flex items-center justify-center macos-shadow-card">
              <span className="text-sm font-bold text-gg-bridge">{customer.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <span>{customer.name}</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge className={`rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 border-0 ${getTypeBadge(customer.type)}`}>{customer.type}</Badge>
                <div className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${tier.color}`}>
                  <TierIcon className="size-3" strokeWidth={1.5} />
                  {tier.name}
                </div>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription className="text-[11px]">Customer details and purchase history</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              {customer.email && (
                <div className="flex items-center gap-2 text-[13px]">
                  <div className="size-6 rounded-lg bg-macos-blue/10 flex items-center justify-center">
                    <Mail className="size-3 text-macos-blue" strokeWidth={1.5} />
                  </div>
                  <span style={{ fontWeight: 500 }}>{customer.email}</span>
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center gap-2 text-[13px]">
                  <div className="size-6 rounded-lg bg-macos-green/10 flex items-center justify-center">
                    <Phone className="size-3 text-macos-green" strokeWidth={1.5} />
                  </div>
                  <span style={{ fontWeight: 500 }}>{customer.phone}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-center gap-2 text-[13px]">
                  <div className="size-6 rounded-lg bg-macos-orange/10 flex items-center justify-center">
                    <MapPin className="size-3 text-macos-orange" strokeWidth={1.5} />
                  </div>
                  <span style={{ fontWeight: 500 }}>{customer.address}</span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="macos-stat macos-shadow-card" style={{ padding: '12px' }}>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Total Spent</p>
                <p className="text-[24px] font-bold text-macos-green" style={{ letterSpacing: '-0.03em' }}>${customer.totalSpent.toLocaleString()}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="macos-stat macos-shadow-card" style={{ padding: '8px 12px' }}>
                  <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Points</p>
                  <p className="font-bold text-gg-bridge text-[13px]">{customer.loyaltyPoints}</p>
                </div>
                <div className="macos-stat macos-shadow-card" style={{ padding: '8px 12px' }}>
                  <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Outstanding</p>
                  <p className="font-bold text-macos-orange text-[13px]">${customer.outstanding.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-border/50" />

          <div>
            <h4 className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-3">Purchase History</h4>
            {(customer._count?.sales || 0) > 0 || (customer._count?.wholesaleOrders || 0) > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 text-[13px]">
                  <span className="flex items-center gap-2">
                    <div className="size-6 rounded-lg bg-macos-green/10 flex items-center justify-center">
                      <ShoppingBag className="size-3 text-macos-green" strokeWidth={1.5} />
                    </div>
                    Retail Sales
                  </span>
                  <Badge className="rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 border-0">{customer._count?.sales || 0}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 text-[13px]">
                  <span className="flex items-center gap-2">
                    <div className="size-6 rounded-lg bg-macos-teal/10 flex items-center justify-center">
                      <DollarSign className="size-3 text-macos-teal" strokeWidth={1.5} />
                    </div>
                    Wholesale Orders
                  </span>
                  <Badge className="rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 border-0">{customer._count?.wholesaleOrders || 0}</Badge>
                </div>
              </div>
            ) : (
              <p className="text-[13px] text-muted-foreground text-center py-4">No purchase history yet</p>
            )}
          </div>

          {customer.school && (
            <>
              <Separator className="bg-border/50" />
              <div>
                <h4 className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-2">Linked School</h4>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/50 text-[13px]">
                  <div className="size-6 rounded-lg bg-macos-orange/10 flex items-center justify-center">
                    <Award className="size-3 text-macos-orange" strokeWidth={1.5} />
                  </div>
                  <span style={{ fontWeight: 500 }}>{customer.school.name}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ==================== CREATE CAMPAIGN DIALOG ====================

function CreateCampaignDialog({
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
    name: '',
    type: 'email',
    target: 'all',
    message: '',
    scheduledAt: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.message.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/crm/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          scheduledAt: form.scheduledAt || null,
        }),
      })
      if (res.ok) {
        setForm({ name: '', type: 'email', target: 'all', message: '', scheduledAt: '' })
        onOpenChange(false)
        onSuccess()
      } else {
        const json = await res.json()
        alert(json.error || 'Failed to create campaign')
      }
    } catch (err) {
      console.error('Failed to create campaign:', err)
      alert('Failed to create campaign')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl macos-shadow-float">
        <DialogHeader>
          <DialogTitle className="text-[13px] font-semibold" style={{ letterSpacing: '-0.01em' }}>Create Campaign</DialogTitle>
          <DialogDescription className="text-[11px]">Launch a new marketing campaign</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Campaign Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Summer Reading Sale" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Campaign Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Target Audience</Label>
              <Select value={form.target} onValueChange={(v) => setForm({ ...form, target: v })}>
                <SelectTrigger className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="wholesale">Wholesale</SelectItem>
                  <SelectItem value="school">Schools</SelectItem>
                  <SelectItem value="dealer">Dealers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Message *</Label>
            <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Write your campaign message..." rows={4} className="rounded-lg bg-secondary/80 border-0 text-[13px]" required />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Schedule (optional)</Label>
            <Input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8" />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-lg text-[13px]">Cancel</Button>
            <Button type="submit" disabled={saving || !form.name.trim() || !form.message.trim()} className="bg-primary text-primary-foreground rounded-lg font-medium text-[13px]">
              {saving ? 'Creating...' : 'Create Campaign'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
