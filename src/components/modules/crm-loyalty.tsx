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
    { id: 'customers', label: 'Customers', count: undefined },
    { id: 'loyalty', label: 'Loyalty', count: undefined },
    { id: 'campaigns', label: 'Campaigns', count: undefined },
  ]

  return (
    <div className="space-y-5">
      <MacosPageHeader
        title="CRM & Loyalty"
        subtitle="Manage customers, loyalty programs, and marketing campaigns"
        icon={Contact}
        iconColor="text-gg-bridge"
        iconBg="bg-gg-bridge/10"
      />

      <MacosFilterBar
        items={tabs}
        activeId={activeTab}
        onChange={setActiveTab}
      />

      <div>
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
    const variants: Record<string, 'success' | 'info' | 'warning' | 'purple' | 'danger'> = {
      retail: 'success',
      wholesale: 'info',
      school: 'warning',
      dealer: 'purple',
      distributor: 'danger',
    }
    return variants[type] || 'default'
  }

  const getLoyaltyTier = (points: number) => {
    if (points >= 5000) return { name: 'Platinum', variant: 'purple' as const, icon: Crown }
    if (points >= 2000) return { name: 'Gold', variant: 'warning' as const, icon: Award }
    if (points >= 500) return { name: 'Silver', variant: 'default' as const, icon: Star }
    return { name: 'Bronze', variant: 'warning' as const, icon: Gift }
  }

  const totalCustomers = customers.length
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0)
  const totalOutstanding = customers.reduce((sum, c) => sum + c.outstanding, 0)
  const totalPoints = customers.reduce((sum, c) => sum + c.loyaltyPoints, 0)

  return (
    <div className="space-y-5">
      {/* Stats Row */}
      <MacosStatGrid>
        <MacosStatCard label="Total Customers" value={totalCustomers} icon={Users} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" />
        <MacosStatCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={DollarSign} iconColor="text-macos-green" iconBg="bg-macos-green/10" />
        <MacosStatCard label="Outstanding" value={`$${totalOutstanding.toLocaleString()}`} icon={TrendingUp} iconColor="text-macos-orange" iconBg="bg-macos-orange/10" />
        <MacosStatCard label="Loyalty Points" value={totalPoints.toLocaleString()} icon={Sparkles} iconColor="text-gg-bridge" iconBg="bg-gg-bridge/10" />
      </MacosStatGrid>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
          <MacosSearch value={search} onChange={setSearch} placeholder="Search customers..." className="w-full sm:w-64" />
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
          <MacosButton variant="primary" icon={Plus} onClick={() => setShowAddDialog(true)}>
            Add Customer
          </MacosButton>
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
        <MacosEmptyState
          icon={Contact}
          title="No customers found"
          description="Add your first customer to get started"
        />
      ) : (
        <div className="macos-card macos-shadow-card overflow-hidden">
          <ScrollArea className="max-h-[500px] custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border/50">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Name</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Contact</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Type</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Tier</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right">Points</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right">Total Spent</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right">Outstanding</TableHead>
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
                      className="macos-table-row cursor-pointer border-b border-border/30 last:border-0"
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <TableCell className="font-medium text-[13px] tracking-tight">
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
                              <Mail className="size-3" strokeWidth={1.8} /> {customer.email}
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="size-3" strokeWidth={1.8} /> {customer.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <MacosBadge variant={getTypeBadge(customer.type)}>
                          {customer.type}
                        </MacosBadge>
                      </TableCell>
                      <TableCell>
                        <div className="inline-flex items-center gap-1 macos-badge">
                          <TierIcon className="size-3" strokeWidth={1.8} />
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
                          <MacosButton
                            variant="danger"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(customer.id)
                            }}
                          >
                            <Trash2 className="size-3" strokeWidth={1.8} />
                          </MacosButton>
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
          {/* Loyalty Tiers */}
          <div>
            <div className="macos-section-header">
              <div>
                <h3 className="macos-section-title">Loyalty Tiers</h3>
                <p className="macos-section-desc">Customer rewards progression</p>
              </div>
              <MacosBadge variant="purple">
                <Crown className="size-3 mr-1" strokeWidth={1.8} />
                {displayTiers.length} Tiers
              </MacosBadge>
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
                        <div className={`size-9 rounded-xl ${colors.bg} flex items-center justify-center`}>
                          <Icon className={`size-4 ${colors.text}`} strokeWidth={1.8} />
                        </div>
                        <div>
                          <h4 className="text-[13px] font-semibold tracking-tight">{tier.name}</h4>
                          <p className="text-[10px] font-semibold tracking-wider text-macos-green">{tier.discount}% discount</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Points Range</span>
                          <span className="font-medium text-[13px]">
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
                  <TableRow className="hover:bg-transparent border-b border-border/50">
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Action</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Points Earned</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pointsRules.map((rule) => {
                    const Icon = rule.icon
                    return (
                      <TableRow key={rule.action} className="macos-table-row border-b border-border/30 last:border-0">
                        <TableCell className="flex items-center gap-2.5 text-[13px]">
                          <div className={`size-7 rounded-lg ${rule.color} flex items-center justify-center`}>
                            <Icon className="size-3" strokeWidth={1.8} />
                          </div>
                          <span className="font-medium">{rule.action}</span>
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

  const getStatusBadge = (status: string): 'default' | 'warning' | 'info' | 'success' => {
    switch (status) {
      case 'draft': return 'default'
      case 'scheduled': return 'warning'
      case 'sent': return 'info'
      case 'completed': return 'success'
      default: return 'default'
    }
  }

  const getTypeBadge = (type: string): 'success' | 'info' | 'purple' => {
    switch (type) {
      case 'sms': return 'success'
      case 'whatsapp': return 'info'
      case 'email': return 'info'
      case 'social': return 'purple'
      default: return 'info'
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{campaigns.length} campaigns</p>
        {!isViewOnly && (
          <MacosButton variant="primary" icon={Plus} onClick={() => setShowCreateDialog(true)}>
            Create Campaign
          </MacosButton>
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
        <MacosEmptyState
          icon={Megaphone}
          title="No campaigns found"
          description="Create your first marketing campaign"
        />
      ) : (
        <div className="macos-card macos-shadow-card overflow-hidden">
          <ScrollArea className="max-h-[500px] custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border/50">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Name</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Type</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Status</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right">Sent</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right">Responses</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Schedule</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id} className="macos-table-row border-b border-border/30 last:border-0">
                    <TableCell className="font-medium text-[13px] tracking-tight">{campaign.name}</TableCell>
                    <TableCell>
                      <MacosBadge variant={getTypeBadge(campaign.type)}>
                        {campaign.type}
                      </MacosBadge>
                    </TableCell>
                    <TableCell>
                      <MacosBadge variant={getStatusBadge(campaign.status)}>
                        {campaign.status}
                      </MacosBadge>
                    </TableCell>
                    <TableCell className="text-right text-[13px]">
                      <span className="flex items-center justify-end gap-1 text-muted-foreground">
                        <Send className="size-3" strokeWidth={1.8} /> {campaign.sentCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-macos-green font-medium text-[13px] flex items-center justify-end gap-1">
                        <TrendingUp className="size-3" strokeWidth={1.8} /> {campaign.responseCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-[11px] text-muted-foreground">
                      {campaign.scheduledAt ? (
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" strokeWidth={1.8} />
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
    <MacosDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add Customer"
      description="Register a new customer"
      footer={
        <>
          <MacosButton variant="secondary" onClick={() => onOpenChange(false)}>Cancel</MacosButton>
          <MacosButton variant="primary" onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)} disabled={saving || !form.name.trim()}>
            {saving ? 'Saving...' : 'Add Customer'}
          </MacosButton>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <MacosFormField label="Name *">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Smith" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30" required />
        </MacosFormField>
        <div className="grid grid-cols-2 gap-3">
          <MacosFormField label="Email">
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30" />
          </MacosFormField>
          <MacosFormField label="Phone">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1-555-0100" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30" />
          </MacosFormField>
        </div>
        <MacosFormField label="Address">
          <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main Street" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30" />
        </MacosFormField>
        <div className="grid grid-cols-2 gap-3">
          <MacosFormField label="Customer Type">
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
          </MacosFormField>
          <MacosFormField label="Credit Limit ($)">
            <Input type="number" step="0.01" value={form.creditLimit} onChange={(e) => setForm({ ...form, creditLimit: e.target.value })} placeholder="5000" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30" />
          </MacosFormField>
        </div>
      </form>
    </MacosDialog>
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
    const variants: Record<string, 'success' | 'info' | 'warning' | 'purple' | 'danger'> = {
      retail: 'success',
      wholesale: 'info',
      school: 'warning',
      dealer: 'purple',
      distributor: 'danger',
    }
    return variants[type] || 'default'
  }

  const getLoyaltyTier = (points: number) => {
    if (points >= 5000) return { name: 'Platinum', variant: 'purple' as const, icon: Crown }
    if (points >= 2000) return { name: 'Gold', variant: 'warning' as const, icon: Award }
    if (points >= 500) return { name: 'Silver', variant: 'default' as const, icon: Star }
    return { name: 'Bronze', variant: 'warning' as const, icon: Gift }
  }

  const tier = getLoyaltyTier(customer.loyaltyPoints)
  const TierIcon = tier.icon

  return (
    <MacosDialog
      open={!!customer}
      onOpenChange={onOpenChange}
      title={customer.name}
      description="Customer details and purchase history"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-full bg-gg-bridge/10 flex items-center justify-center">
            <span className="text-sm font-bold text-gg-bridge">{customer.name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MacosBadge variant={getTypeBadge(customer.type)}>{customer.type}</MacosBadge>
            <div className="inline-flex items-center gap-1 macos-badge">
              <TierIcon className="size-3" strokeWidth={1.8} />
              {tier.name}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            {customer.email && (
              <div className="flex items-center gap-2 text-[13px]">
                <div className="size-6 rounded-lg bg-macos-blue/10 flex items-center justify-center">
                  <Mail className="size-3 text-macos-blue" strokeWidth={1.8} />
                </div>
                <span className="font-medium">{customer.email}</span>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-2 text-[13px]">
                <div className="size-6 rounded-lg bg-macos-green/10 flex items-center justify-center">
                  <Phone className="size-3 text-macos-green" strokeWidth={1.8} />
                </div>
                <span className="font-medium">{customer.phone}</span>
              </div>
            )}
            {customer.address && (
              <div className="flex items-center gap-2 text-[13px]">
                <div className="size-6 rounded-lg bg-macos-orange/10 flex items-center justify-center">
                  <MapPin className="size-3 text-macos-orange" strokeWidth={1.8} />
                </div>
                <span className="font-medium">{customer.address}</span>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div className="macos-stat macos-shadow-card" style={{ padding: '12px' }}>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Total Spent</p>
              <p className="text-[24px] font-bold text-macos-green tracking-tight">${customer.totalSpent.toLocaleString()}</p>
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
                    <ShoppingBag className="size-3 text-macos-green" strokeWidth={1.8} />
                  </div>
                  Retail Sales
                </span>
                <MacosBadge>{customer._count?.sales || 0}</MacosBadge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 text-[13px]">
                <span className="flex items-center gap-2">
                  <div className="size-6 rounded-lg bg-macos-teal/10 flex items-center justify-center">
                    <DollarSign className="size-3 text-macos-teal" strokeWidth={1.8} />
                  </div>
                  Wholesale Orders
                </span>
                <MacosBadge>{customer._count?.wholesaleOrders || 0}</MacosBadge>
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
                  <Award className="size-3 text-macos-orange" strokeWidth={1.8} />
                </div>
                <span className="font-medium">{customer.school.name}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </MacosDialog>
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
    <MacosDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create Campaign"
      description="Launch a new marketing campaign"
      footer={
        <>
          <MacosButton variant="secondary" onClick={() => onOpenChange(false)}>Cancel</MacosButton>
          <MacosButton variant="primary" onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)} disabled={saving || !form.name.trim() || !form.message.trim()}>
            {saving ? 'Creating...' : 'Create Campaign'}
          </MacosButton>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <MacosFormField label="Campaign Name *">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Summer Reading Sale" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30" required />
        </MacosFormField>
        <div className="grid grid-cols-2 gap-3">
          <MacosFormField label="Campaign Type">
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
          </MacosFormField>
          <MacosFormField label="Target Audience">
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
          </MacosFormField>
        </div>
        <MacosFormField label="Message *">
          <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Write your campaign message..." rows={4} className="rounded-lg bg-secondary/80 border-0 text-[13px]" required />
        </MacosFormField>
        <MacosFormField label="Schedule (optional)">
          <Input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30" />
        </MacosFormField>
      </form>
    </MacosDialog>
  )
}
