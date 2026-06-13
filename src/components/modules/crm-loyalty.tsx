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
    { value: 'customers', label: 'Customers', icon: Users },
    { value: 'loyalty', label: 'Loyalty', icon: Star },
    { value: 'campaigns', label: 'Campaigns', icon: Megaphone },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-xl bg-macos-purple/10 flex items-center justify-center">
          <Users className="size-4 text-macos-purple" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-[13px] font-semibold tracking-tight">CRM & Loyalty</h2>
          <p className="text-[11px] text-muted-foreground">
            Manage customers, loyalty programs, and marketing campaigns
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
        {activeTab === 'customers' && <CustomersTab />}
        {activeTab === 'loyalty' && <LoyaltyTab />}
        {activeTab === 'campaigns' && <CampaignsTab />}
      </div>
    </div>
  )
}

// ==================== CUSTOMERS TAB ====================

function CustomersTab() {
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

  const totalCustomers = customers.length
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0)
  const totalOutstanding = customers.reduce((sum, c) => sum + c.outstanding, 0)
  const totalPoints = customers.reduce((sum, c) => sum + c.loyaltyPoints, 0)

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="rounded-2xl macos-shadow border-0 p-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-macos-blue/10 flex items-center justify-center">
              <Users className="size-4 text-macos-blue" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight">{totalCustomers}</p>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Total Customers</p>
            </div>
          </div>
        </Card>
        <Card className="rounded-2xl macos-shadow border-0 p-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-macos-green/10 flex items-center justify-center">
              <DollarSign className="size-4 text-macos-green" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-macos-green">${totalRevenue.toLocaleString()}</p>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Total Revenue</p>
            </div>
          </div>
        </Card>
        <Card className="rounded-2xl macos-shadow border-0 p-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-macos-orange/10 flex items-center justify-center">
              <TrendingUp className="size-4 text-macos-orange" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-macos-orange">${totalOutstanding.toLocaleString()}</p>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Outstanding</p>
            </div>
          </div>
        </Card>
        <Card className="rounded-2xl macos-shadow border-0 p-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-macos-teal/10 flex items-center justify-center">
              <Star className="size-4 text-macos-teal" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-macos-teal">{totalPoints.toLocaleString()}</p>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Loyalty Points</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial sm:w-64">
            <Search className="absolute left-2.5 top-1.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 rounded-lg bg-secondary/80 border-0 text-[13px] h-8"
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
        <Button onClick={() => setShowAddDialog(true)} className="gap-1.5 bg-primary text-primary-foreground rounded-lg font-medium text-[13px]">
          <Plus className="size-3.5" strokeWidth={2} /> Add Customer
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
      ) : customers.length === 0 ? (
        <Card className="rounded-2xl macos-shadow border-0">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="size-10 text-muted-foreground mb-3" strokeWidth={1.5} />
            <p className="text-[13px] text-muted-foreground">No customers found</p>
            <p className="text-[11px] text-muted-foreground">Add your first customer to get started</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl macos-shadow border-0">
          <CardContent className="p-0">
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Name</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Contact</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Type</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Points</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Total Spent</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Outstanding</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      className="cursor-pointer hover:bg-secondary/50"
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <TableCell className="font-medium text-[13px]">{customer.name}</TableCell>
                      <TableCell>
                        <div className="text-[11px] space-y-0.5">
                          {customer.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="size-3" strokeWidth={1.5} /> {customer.email}
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="size-3" strokeWidth={1.5} /> {customer.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 ${getTypeBadge(customer.type)}`}>
                          {customer.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-macos-teal font-medium text-[13px]">{customer.loyaltyPoints}</span>
                      </TableCell>
                      <TableCell className="text-right text-[13px]">
                        ${customer.totalSpent.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`text-[13px] ${customer.outstanding > 0 ? 'text-macos-orange font-medium' : ''}`}>
                          ${customer.outstanding.toLocaleString()}
                        </span>
                      </TableCell>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
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

  const tierColors: Record<string, { bg: string; text: string; gradient: string; barColor: string }> = {
    Bronze: { bg: 'bg-macos-orange/10', text: 'text-macos-orange', gradient: 'from-macos-orange to-amber-700', barColor: 'bg-macos-orange' },
    Silver: { bg: 'bg-secondary', text: 'text-muted-foreground', gradient: 'from-gray-400 to-gray-600', barColor: 'bg-gray-400' },
    Gold: { bg: 'bg-macos-yellow/10', text: 'text-macos-yellow', gradient: 'from-yellow-500 to-amber-600', barColor: 'bg-macos-yellow' },
    Platinum: { bg: 'bg-macos-purple/10', text: 'text-macos-purple', gradient: 'from-macos-teal to-macos-blue', barColor: 'bg-macos-purple' },
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
    { action: 'Review', points: '20 bonus points', icon: Star, color: 'bg-macos-yellow/10 text-macos-yellow' },
    { action: 'Birthday', points: '100 bonus points', icon: Gift, color: 'bg-macos-purple/10 text-macos-purple' },
    { action: 'Social Share', points: '10 bonus points', icon: Megaphone, color: 'bg-macos-teal/10 text-macos-teal' },
  ]

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="rounded-2xl macos-shadow border-0 animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 bg-muted rounded w-1/2 mb-4" />
                <div className="h-3 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div>
            <h3 className="text-[13px] font-semibold tracking-tight mb-4">Loyalty Tiers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {displayTiers.map((tier) => {
                const Icon = tierIcons[tier.name] || Star
                const colors = tierColors[tier.name] || tierColors.Bronze
                const progress = tier.maxPoints ? Math.min((tier.minPoints / (tier.maxPoints || 1)) * 100, 100) : 100
                return (
                  <Card key={tier.id} className="rounded-2xl macos-shadow border-0 relative overflow-hidden">
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient}`} />
                    <CardContent className="p-4 pt-5">
                      <div className="flex items-center gap-2.5 mb-4">
                        <div className={`size-8 rounded-xl ${colors.bg} flex items-center justify-center`}>
                          <Icon className={`size-4 ${colors.text}`} strokeWidth={1.5} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-[13px] tracking-tight">{tier.name}</h4>
                          <p className="text-[10px] font-semibold tracking-wide text-macos-green">{tier.discount}% discount</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Points Range</span>
                          <span className="font-medium">
                            {tier.minPoints} - {tier.maxPoints || '∞'}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div
                            className={`h-full rounded-full ${colors.barColor} transition-all`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        {tier.benefits && (
                          <p className="text-[11px] text-muted-foreground mt-2">{tier.benefits}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          <Separator className="bg-border/50" />

          <div>
            <h3 className="text-[13px] font-semibold tracking-tight mb-4">Points Rules</h3>
            <Card className="rounded-2xl macos-shadow border-0">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Action</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Points Earned</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pointsRules.map((rule) => {
                      const Icon = rule.icon
                      return (
                        <TableRow key={rule.action} className="hover:bg-secondary/50">
                          <TableCell className="flex items-center gap-2 text-[13px]">
                            <div className={`size-6 rounded-lg ${rule.color} flex items-center justify-center`}>
                              <Icon className="size-3" strokeWidth={1.5} />
                            </div>
                            {rule.action}
                          </TableCell>
                          <TableCell className="font-medium text-macos-teal text-[13px]">{rule.points}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

// ==================== CAMPAIGNS TAB ====================

function CampaignsTab() {
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
        return 'bg-macos-purple/10 text-macos-purple'
      default:
        return 'bg-secondary text-secondary-foreground'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{campaigns.length} campaigns</p>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-1.5 bg-primary text-primary-foreground rounded-lg font-medium text-[13px]">
          <Plus className="size-3.5" strokeWidth={2} /> Create Campaign
        </Button>
      </div>

      {loading ? (
        <Card className="rounded-2xl macos-shadow border-0">
          <CardContent className="p-6">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : campaigns.length === 0 ? (
        <Card className="rounded-2xl macos-shadow border-0">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Megaphone className="size-10 text-muted-foreground mb-3" strokeWidth={1.5} />
            <p className="text-[13px] text-muted-foreground">No campaigns found</p>
            <p className="text-[11px] text-muted-foreground">Create your first marketing campaign</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl macos-shadow border-0">
          <CardContent className="p-0">
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Name</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Type</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Sent</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Responses</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Schedule</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id} className="hover:bg-secondary/50">
                      <TableCell className="font-medium text-[13px]">{campaign.name}</TableCell>
                      <TableCell>
                        <Badge className={`rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 ${getTypeBadge(campaign.type)}`}>
                          {campaign.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 ${getStatusBadge(campaign.status)}`}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-[13px]">
                        <span className="flex items-center justify-end gap-1">
                          <Send className="size-3 text-muted-foreground" strokeWidth={1.5} /> {campaign.sentCount}
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
          </CardContent>
        </Card>
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
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-[13px] font-semibold tracking-tight">Add Customer</DialogTitle>
          <DialogDescription className="text-[11px]">Register a new customer</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Smith" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8" />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1-555-0100" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Address</Label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main Street" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Customer Type</Label>
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
              <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Credit Limit ($)</Label>
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

  return (
    <Dialog open={!!customer} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[13px] font-semibold tracking-tight">
            <div className="size-7 rounded-lg bg-macos-purple/10 flex items-center justify-center">
              <Users className="size-4 text-macos-purple" strokeWidth={1.5} />
            </div>
            {customer.name}
          </DialogTitle>
          <DialogDescription className="text-[11px]">Customer details and purchase history</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className={`rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 ${getTypeBadge(customer.type)}`}>{customer.type}</Badge>
              </div>
              {customer.email && (
                <div className="flex items-center gap-2 text-[13px]">
                  <Mail className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                  {customer.email}
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center gap-2 text-[13px]">
                  <Phone className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                  {customer.phone}
                </div>
              )}
              {customer.address && (
                <div className="flex items-center gap-2 text-[13px]">
                  <MapPin className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                  {customer.address}
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-macos-green/10">
                <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold tracking-tight text-macos-green">${customer.totalSpent.toLocaleString()}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-xl bg-secondary/50">
                  <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Points</p>
                  <p className="font-bold text-macos-teal text-[13px]">{customer.loyaltyPoints}</p>
                </div>
                <div className="p-2 rounded-xl bg-secondary/50">
                  <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Outstanding</p>
                  <p className="font-bold text-macos-orange text-[13px]">${customer.outstanding.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-border/50" />

          <div>
            <h4 className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase mb-3">Purchase History</h4>
            {(customer._count?.sales || 0) > 0 || (customer._count?.wholesaleOrders || 0) > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/50 text-[13px]">
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="size-3.5 text-macos-green" strokeWidth={1.5} />
                    Retail Sales
                  </span>
                  <Badge className="rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5">{customer._count?.sales || 0}</Badge>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/50 text-[13px]">
                  <span className="flex items-center gap-2">
                    <DollarSign className="size-3.5 text-macos-teal" strokeWidth={1.5} />
                    Wholesale Orders
                  </span>
                  <Badge className="rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5">{customer._count?.wholesaleOrders || 0}</Badge>
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
                <h4 className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase mb-2">Linked School</h4>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-secondary/50 text-[13px]">
                  <Award className="size-4 text-macos-orange" strokeWidth={1.5} />
                  <span>{customer.school.name}</span>
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
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-[13px] font-semibold tracking-tight">Create Campaign</DialogTitle>
          <DialogDescription className="text-[11px]">Launch a new marketing campaign</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Campaign Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Summer Reading Sale" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Campaign Type</Label>
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
              <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Target Audience</Label>
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
            <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Message *</Label>
            <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Write your campaign message..." rows={4} className="rounded-lg bg-secondary/80 border-0 text-[13px]" required />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Schedule (optional)</Label>
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
