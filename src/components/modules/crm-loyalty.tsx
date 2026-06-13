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
import { Progress } from '@/components/ui/progress'
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-950/40">
          <Users className="size-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">CRM & Loyalty</h2>
          <p className="text-sm text-muted-foreground">
            Manage customers, loyalty programs, and marketing campaigns
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="customers" className="gap-1.5">
            <Users className="size-3.5" />
            <span className="hidden sm:inline">Customers</span>
          </TabsTrigger>
          <TabsTrigger value="loyalty" className="gap-1.5">
            <Star className="size-3.5" />
            <span className="hidden sm:inline">Loyalty</span>
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="gap-1.5">
            <Megaphone className="size-3.5" />
            <span className="hidden sm:inline">Campaigns</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="mt-4">
          <CustomersTab />
        </TabsContent>
        <TabsContent value="loyalty" className="mt-4">
          <LoyaltyTab />
        </TabsContent>
        <TabsContent value="campaigns" className="mt-4">
          <CampaignsTab />
        </TabsContent>
      </Tabs>
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
      retail: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
      wholesale: 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400',
      school: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
      dealer: 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400',
      distributor: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
    }
    return styles[type] || 'bg-gray-100 text-gray-700 dark:bg-gray-950/40 dark:text-gray-400'
  }

  const totalCustomers = customers.length
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0)
  const totalOutstanding = customers.reduce((sum, c) => sum + c.outstanding, 0)
  const totalPoints = customers.reduce((sum, c) => sum + c.loyaltyPoints, 0)

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Total Customers</p>
            <p className="text-lg font-bold">{totalCustomers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <p className="text-lg font-bold text-emerald-600">${totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Outstanding</p>
            <p className="text-lg font-bold text-amber-600">${totalOutstanding.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Loyalty Points</p>
            <p className="text-lg font-bold text-teal-600">{totalPoints.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial sm:w-64">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
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
        <Button onClick={() => setShowAddDialog(true)} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="size-4" /> Add Customer
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
      ) : customers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="size-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No customers found</p>
            <p className="text-sm text-muted-foreground">Add your first customer to get started</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                    <TableHead className="text-right">Total Spent</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>
                        <div className="text-xs space-y-0.5">
                          {customer.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="size-3" /> {customer.email}
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="size-3" /> {customer.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] ${getTypeBadge(customer.type)}`}>
                          {customer.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-teal-600 font-medium">{customer.loyaltyPoints}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        ${customer.totalSpent.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={customer.outstanding > 0 ? 'text-amber-600 font-medium' : ''}>
                          ${customer.outstanding.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(customer.id)
                          }}
                        >
                          <Trash2 className="size-3" />
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

  const tierColors: Record<string, string> = {
    Bronze: 'from-amber-600 to-amber-800',
    Silver: 'from-gray-400 to-gray-600',
    Gold: 'from-yellow-500 to-amber-600',
    Platinum: 'from-emerald-500 to-teal-700',
  }

  const defaultTiers: LoyaltyTier[] = [
    { id: '1', name: 'Bronze', minPoints: 0, maxPoints: 499, discount: 2, benefits: 'Birthday discount, Basic support' },
    { id: '2', name: 'Silver', minPoints: 500, maxPoints: 1999, discount: 5, benefits: 'Priority support, Early access to sales, Free shipping' },
    { id: '3', name: 'Gold', minPoints: 2000, maxPoints: 4999, discount: 10, benefits: 'VIP support, Exclusive offers, Free shipping, Gift wrapping' },
    { id: '4', name: 'Platinum', minPoints: 5000, maxPoints: null, discount: 15, benefits: 'Personal account manager, Best prices, Free shipping, Gift wrapping, Invitation to events' },
  ]

  const displayTiers = tiers.length > 0 ? tiers : defaultTiers

  const pointsRules = [
    { action: 'Purchase', points: '1 point per $1 spent', icon: ShoppingBag },
    { action: 'Referral', points: '50 bonus points', icon: Users },
    { action: 'Review', points: '20 bonus points', icon: Star },
    { action: 'Birthday', points: '100 bonus points', icon: Gift },
    { action: 'Social Share', points: '10 bonus points', icon: Megaphone },
  ]

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
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
            <h3 className="text-lg font-semibold mb-4">Loyalty Tiers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {displayTiers.map((tier) => {
                const Icon = tierIcons[tier.name] || Star
                return (
                  <Card key={tier.id} className="relative overflow-hidden">
                    <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${tierColors[tier.name] || 'from-emerald-500 to-teal-600'}`} />
                    <CardContent className="p-4 pt-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`rounded-lg bg-gradient-to-r ${tierColors[tier.name] || 'from-emerald-500 to-teal-600'} p-2`}>
                          <Icon className="size-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">{tier.name}</h4>
                          <p className="text-xs text-muted-foreground">{tier.discount}% discount</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Points Range</span>
                          <span className="font-medium">
                            {tier.minPoints} - {tier.maxPoints || '∞'}
                          </span>
                        </div>
                        <Progress
                          value={tier.maxPoints ? (tier.minPoints / tier.maxPoints) * 100 : 100}
                          className="h-1.5"
                        />
                        {tier.benefits && (
                          <p className="text-xs text-muted-foreground mt-2">{tier.benefits}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4">Points Rules</h3>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Points Earned</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pointsRules.map((rule) => {
                      const Icon = rule.icon
                      return (
                        <TableRow key={rule.action}>
                          <TableCell className="flex items-center gap-2">
                            <div className="rounded p-1 bg-emerald-100 dark:bg-emerald-950/40">
                              <Icon className="size-3.5 text-emerald-600" />
                            </div>
                            {rule.action}
                          </TableCell>
                          <TableCell className="font-medium text-teal-600">{rule.points}</TableCell>
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
      case 'scheduled':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
      case 'sent':
        return 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400'
      case 'completed':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
      default:
        return ''
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sms':
        return '📱'
      case 'whatsapp':
        return '💬'
      case 'email':
        return '📧'
      case 'social':
        return '📢'
      default:
        return '📣'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{campaigns.length} campaigns</p>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="size-4" /> Create Campaign
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-2/3 mb-3" />
                <div className="h-3 bg-muted rounded w-1/2 mb-2" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Megaphone className="size-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No campaigns found</p>
            <p className="text-sm text-muted-foreground">Create your first marketing campaign</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getTypeIcon(campaign.type)}</span>
                    <div>
                      <h3 className="font-semibold text-sm">{campaign.name}</h3>
                      <p className="text-xs text-muted-foreground capitalize">{campaign.type}</p>
                    </div>
                  </div>
                  <Badge className={`text-[10px] ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{campaign.message}</p>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex gap-3">
                    <span className="flex items-center gap-1">
                      <Send className="size-3" /> {campaign.sentCount}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600">
                      <TrendingUp className="size-3" /> {campaign.responseCount}
                    </span>
                  </div>
                  {campaign.scheduledAt && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="size-3" />
                      {new Date(campaign.scheduledAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Customer</DialogTitle>
          <DialogDescription>Register a new customer</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cust-name">Name *</Label>
            <Input
              id="cust-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="John Smith"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="cust-email">Email</Label>
              <Input
                id="cust-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cust-phone">Phone</Label>
              <Input
                id="cust-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1-555-0100"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cust-address">Address</Label>
            <Input
              id="cust-address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="123 Main Street"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Customer Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger>
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
              <Label htmlFor="cust-credit">Credit Limit ($)</Label>
              <Input
                id="cust-credit"
                type="number"
                step="0.01"
                value={form.creditLimit}
                onChange={(e) => setForm({ ...form, creditLimit: e.target.value })}
                placeholder="5000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !form.name.trim()} className="bg-emerald-600 hover:bg-emerald-700">
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
      retail: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
      wholesale: 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400',
      school: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
      dealer: 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400',
      distributor: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
    }
    return styles[type] || ''
  }

  return (
    <Dialog open={!!customer} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="size-5 text-emerald-600" />
            {customer.name}
          </DialogTitle>
          <DialogDescription>
            Customer details and purchase history
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className={`text-xs ${getTypeBadge(customer.type)}`}>{customer.type}</Badge>
              </div>
              {customer.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="size-4 text-muted-foreground" />
                  {customer.email}
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="size-4 text-muted-foreground" />
                  {customer.phone}
                </div>
              )}
              {customer.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="size-4 text-muted-foreground" />
                  {customer.address}
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                <p className="text-xs text-muted-foreground">Total Spent</p>
                <p className="text-lg font-bold text-emerald-600">${customer.totalSpent.toLocaleString()}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg border">
                  <p className="text-xs text-muted-foreground">Points</p>
                  <p className="font-bold text-teal-600">{customer.loyaltyPoints}</p>
                </div>
                <div className="p-2 rounded-lg border">
                  <p className="text-xs text-muted-foreground">Outstanding</p>
                  <p className="font-bold text-amber-600">${customer.outstanding.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-semibold mb-3">Purchase History</h4>
            {(customer._count?.sales || 0) > 0 || (customer._count?.wholesaleOrders || 0) > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded border text-sm">
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="size-3.5 text-emerald-600" />
                    Retail Sales
                  </span>
                  <Badge variant="secondary">{customer._count?.sales || 0} orders</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded border text-sm">
                  <span className="flex items-center gap-2">
                    <DollarSign className="size-3.5 text-teal-600" />
                    Wholesale Orders
                  </span>
                  <Badge variant="secondary">{customer._count?.wholesaleOrders || 0} orders</Badge>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No purchase history yet</p>
            )}
          </div>

          {customer.school && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-2">Linked School</h4>
                <div className="flex items-center gap-2 p-2 rounded border text-sm">
                  <Award className="size-4 text-amber-600" />
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Campaign</DialogTitle>
          <DialogDescription>Launch a new marketing campaign</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="camp-name">Campaign Name *</Label>
            <Input
              id="camp-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Summer Reading Sale"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Campaign Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger>
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
              <Label>Target Audience</Label>
              <Select value={form.target} onValueChange={(v) => setForm({ ...form, target: v })}>
                <SelectTrigger>
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
            <Label htmlFor="camp-message">Message *</Label>
            <Textarea
              id="camp-message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Write your campaign message..."
              rows={4}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="camp-schedule">Schedule (optional)</Label>
            <Input
              id="camp-schedule"
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !form.name.trim() || !form.message.trim()} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? 'Creating...' : 'Create Campaign'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
