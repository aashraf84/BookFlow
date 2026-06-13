'use client'

import * as React from 'react'
import {
  Building,
  Plus,
  MapPin,
  Phone,
  Mail,
  User,
  MoreVertical,
  Pencil,
  Power,
  PowerOff,
  TrendingUp,
  Users,
  ShoppingCart,
  Package,
  Wifi,
  WifiOff,
  Globe,
  Signal,
  ChevronRight,
  Layers,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { useAppStore } from '@/store/app-store'

// Types
interface Branch {
  id: string
  name: string
  code: string
  address: string | null
  phone: string | null
  email: string | null
  manager: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    employees: number
    sales: number
    warehouses: number
  }
}

interface BranchFormData {
  name: string
  code: string
  address: string
  phone: string
  email: string
  manager: string
}

const defaultFormData: BranchFormData = {
  name: '',
  code: '',
  address: '',
  phone: '',
  email: '',
  manager: '',
}

export function BranchesModule() {
  const authUser = useAppStore((s) => s.authUser)
  const isViewOnly = authUser?.isViewOnly ?? false
  const { toast } = useToast()
  const [branches, setBranches] = React.useState<Branch[]>([])
  const [loading, setLoading] = React.useState(true)
  const [addDialogOpen, setAddDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [formData, setFormData] = React.useState<BranchFormData>(defaultFormData)
  const [editingBranch, setEditingBranch] = React.useState<Branch | null>(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [selectedBranch, setSelectedBranch] = React.useState<Branch | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)

  const fetchBranches = React.useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/branches')
      if (!res.ok) throw new Error('Failed to fetch branches')
      const json = await res.json()
      setBranches(json.data || [])
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch branches', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  React.useEffect(() => {
    fetchBranches()
  }, [fetchBranches])

  const handleAddBranch = async () => {
    if (!formData.name || !formData.code) {
      toast({ title: 'Validation Error', description: 'Name and code are required', variant: 'destructive' })
      return
    }
    try {
      setSubmitting(true)
      const res = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create branch')
      }
      toast({ title: 'Success', description: 'Branch created successfully' })
      setAddDialogOpen(false)
      setFormData(defaultFormData)
      fetchBranches()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to create branch', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditBranch = async () => {
    if (!editingBranch) return
    try {
      setSubmitting(true)
      const res = await fetch('/api/branches', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingBranch.id, ...formData }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update branch')
      }
      toast({ title: 'Success', description: 'Branch updated successfully' })
      setEditDialogOpen(false)
      setEditingBranch(null)
      setFormData(defaultFormData)
      fetchBranches()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to update branch', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleStatus = async (branch: Branch) => {
    try {
      const res = await fetch('/api/branches', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: branch.id, isActive: !branch.isActive }),
      })
      if (!res.ok) throw new Error('Failed to update branch status')
      toast({
        title: 'Success',
        description: `Branch ${branch.isActive ? 'deactivated' : 'activated'} successfully`,
      })
      fetchBranches()
    } catch {
      toast({ title: 'Error', description: 'Failed to update branch status', variant: 'destructive' })
    }
  }

  const openEditDialog = (branch: Branch) => {
    setEditingBranch(branch)
    setFormData({
      name: branch.name,
      code: branch.code,
      address: branch.address || '',
      phone: branch.phone || '',
      email: branch.email || '',
      manager: branch.manager || '',
    })
    setEditDialogOpen(true)
  }

  const openDetailDialog = (branch: Branch) => {
    setSelectedBranch(branch)
    setDetailOpen(true)
  }

  const activeBranches = branches.filter((b) => b.isActive)
  const inactiveBranches = branches.filter((b) => !b.isActive)

  const totalEmployees = branches.reduce((sum, b) => sum + (b._count?.employees || 0), 0)
  const totalSales = branches.reduce((sum, b) => sum + (b._count?.sales || 0), 0)
  const totalWarehouses = branches.reduce((sum, b) => sum + (b._count?.warehouses || 0), 0)

  // Helper: Network signal strength indicator
  const SignalBars = ({ strength }: { strength: number }) => {
    const bars = [1, 2, 3, 4]
    return (
      <div className="flex items-end gap-[2px]">
        {bars.map((bar) => (
          <div
            key={bar}
            className={`w-[3px] rounded-sm transition-colors ${
              bar <= strength
                ? 'bg-macos-green'
                : 'bg-muted-foreground/20'
            }`}
            style={{ height: `${bar * 3 + 2}px` }}
          />
        ))}
      </div>
    )
  }

  // Get signal strength based on metrics
  const getSignalStrength = (branch: Branch) => {
    const employees = branch._count?.employees || 0
    const sales = branch._count?.sales || 0
    if (employees >= 5 && sales >= 10) return 4
    if (employees >= 3 && sales >= 5) return 3
    if (employees >= 1) return 2
    return 1
  }

  return (
    <div className="space-y-5">
      {/* Page Header - macOS 27 style */}
      <div className="macos-page-header">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-gg-bay/10 flex items-center justify-center">
            <Globe className="size-[18px] text-gg-bay" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="macos-page-title">Network Locations</h1>
            <p className="macos-page-subtitle">Manage branch locations &amp; connectivity</p>
          </div>
        </div>
        {!isViewOnly && (
          <Button onClick={() => { setFormData(defaultFormData); setAddDialogOpen(true) }} className="gap-1.5 bg-primary text-primary-foreground rounded-lg font-medium text-[13px]">
            <Plus className="size-3.5" strokeWidth={2} />
            Add Location
          </Button>
        )}
      </div>

      {/* Performance Metrics - Network dashboard style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="macos-stat macos-shadow-card">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-gg-bay/10 flex items-center justify-center">
              <Building className="size-4 text-gg-bay" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[22px] font-bold tracking-[-0.03em]">{branches.length}</p>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Locations</p>
            </div>
          </div>
        </div>
        <div className="macos-stat macos-shadow-card">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-macos-green/10 flex items-center justify-center">
              <Wifi className="size-4 text-macos-green" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[22px] font-bold tracking-[-0.03em] text-macos-green">{activeBranches.length}</p>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Online</p>
            </div>
          </div>
        </div>
        <div className="macos-stat macos-shadow-card">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-gg-sunset/10 flex items-center justify-center">
              <Users className="size-4 text-gg-sunset" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[22px] font-bold tracking-[-0.03em] text-gg-sunset">{totalEmployees}</p>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Staff</p>
            </div>
          </div>
        </div>
        <div className="macos-stat macos-shadow-card">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-macos-purple/10 flex items-center justify-center">
              <ShoppingCart className="size-4 text-macos-purple" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[22px] font-bold tracking-[-0.03em] text-macos-purple">{totalSales}</p>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Sales</p>
            </div>
          </div>
        </div>
      </div>

      {/* Branch Cards - macOS System Settings > Network style */}
      {loading ? (
        <div className="macos-card macos-shadow-card p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : branches.length === 0 ? (
        <div className="macos-card macos-shadow-card">
          <div className="macos-empty py-16">
            <Globe className="size-10 text-muted-foreground mb-3" strokeWidth={1.5} />
            <p className="text-[13px] font-medium text-foreground">No network locations</p>
            <p className="text-[11px] text-muted-foreground mt-1">Add your first branch location to get started</p>
            {!isViewOnly && (
              <Button onClick={() => setAddDialogOpen(true)} className="mt-4 bg-primary text-primary-foreground rounded-lg font-medium text-[13px]">
                <Plus className="size-3.5 mr-1.5" strokeWidth={2} />
                Add Location
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="macos-card macos-shadow-card">
          {/* Section: Active Locations */}
          <div className="p-4 pb-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Wifi className="size-3.5 text-macos-green" strokeWidth={1.5} />
                <h3 className="macos-section-title">Active Locations</h3>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{activeBranches.length} online</span>
            </div>
          </div>

          {/* Network-style list items */}
          <div className="divide-y divide-border/30">
            {activeBranches.map((branch) => (
              <div
                key={branch.id}
                className="flex items-center gap-4 px-4 py-3 cursor-pointer macos-table-row group"
                onClick={() => openDetailDialog(branch)}
              >
                {/* Network icon with status indicator */}
                <div className="relative shrink-0">
                  <div className="size-10 rounded-xl bg-gg-bay/10 flex items-center justify-center">
                    <Building className="size-5 text-gg-bay" strokeWidth={1.5} />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-macos-green ring-2 ring-card" />
                </div>

                {/* Branch info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-semibold truncate">{branch.name}</p>
                    <Badge className="rounded-md text-[10px] font-semibold tracking-wider px-1.5 py-0 bg-gg-bay/10 text-gg-bay">
                      {branch.code}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    {branch.address && (
                      <span className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                        <MapPin className="size-3 shrink-0" strokeWidth={1.5} />
                        {branch.address}
                      </span>
                    )}
                  </div>
                </div>

                {/* Signal strength + metrics */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="hidden sm:flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Users className="size-3 text-muted-foreground" strokeWidth={1.5} />
                      <span className="text-[11px] text-muted-foreground font-medium">{branch._count?.employees || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShoppingCart className="size-3 text-muted-foreground" strokeWidth={1.5} />
                      <span className="text-[11px] text-muted-foreground font-medium">{branch._count?.sales || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Package className="size-3 text-muted-foreground" strokeWidth={1.5} />
                      <span className="text-[11px] text-muted-foreground font-medium">{branch._count?.warehouses || 0}</span>
                    </div>
                  </div>
                  <SignalBars strength={getSignalStrength(branch)} />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {!isViewOnly && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-7 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="size-3.5" strokeWidth={1.5} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl macos-shadow-float">
                        <DropdownMenuItem onClick={() => openEditDialog(branch)} className="rounded-lg text-[13px]">
                          <Pencil className="size-3.5 mr-2" strokeWidth={1.5} />
                          Edit Location
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(branch)} className="rounded-lg text-[13px]">
                          <PowerOff className="size-3.5 mr-2" strokeWidth={1.5} />
                          Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <ChevronRight className="size-3.5 text-muted-foreground/40 shrink-0" strokeWidth={1.5} />
                </div>
              </div>
            ))}
          </div>

          {/* Inactive Locations Section */}
          {inactiveBranches.length > 0 && (
            <>
              <div className="p-4 pb-2 pt-5">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <WifiOff className="size-3.5 text-macos-red" strokeWidth={1.5} />
                    <h3 className="macos-section-title">Offline Locations</h3>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{inactiveBranches.length} offline</span>
                </div>
              </div>

              <div className="divide-y divide-border/30">
                {inactiveBranches.map((branch) => (
                  <div
                    key={branch.id}
                    className="flex items-center gap-4 px-4 py-3 opacity-60 cursor-pointer macos-table-row group"
                    onClick={() => openDetailDialog(branch)}
                  >
                    {/* Network icon with offline indicator */}
                    <div className="relative shrink-0">
                      <div className="size-10 rounded-xl bg-secondary/50 flex items-center justify-center">
                        <Building className="size-5 text-muted-foreground" strokeWidth={1.5} />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-macos-red ring-2 ring-card" />
                    </div>

                    {/* Branch info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-semibold truncate">{branch.name}</p>
                        <Badge className="rounded-md text-[10px] font-semibold tracking-wider px-1.5 py-0 bg-secondary text-secondary-foreground">
                          {branch.code}
                        </Badge>
                        <Badge className="rounded-md text-[10px] font-semibold tracking-wider px-1.5 py-0 bg-macos-red/10 text-macos-red">
                          Offline
                        </Badge>
                      </div>
                      {branch.address && (
                        <span className="text-[11px] text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="size-3 shrink-0" strokeWidth={1.5} />
                          {branch.address}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {!isViewOnly && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleStatus(branch)}
                          className="rounded-lg text-[11px] text-macos-green hover:text-macos-green hover:bg-macos-green/10"
                        >
                          <Power className="size-3.5 mr-1" strokeWidth={1.5} />
                          Reactivate
                        </Button>
                      )}
                      <ChevronRight className="size-3.5 text-muted-foreground/40 shrink-0" strokeWidth={1.5} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-border/30">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
              {branches.length} location{branches.length !== 1 ? 's' : ''} · {activeBranches.length} online · {inactiveBranches.length} offline
            </p>
          </div>
        </div>
      )}

      {/* Branch Detail Dialog - macOS Network Details style */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        {selectedBranch && (
          <DialogContent className="sm:max-w-lg rounded-2xl macos-shadow-float">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="relative">
                  <div className="size-10 rounded-xl bg-gg-bay/10 flex items-center justify-center">
                    <Building className="size-5 text-gg-bay" strokeWidth={1.5} />
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full ring-2 ring-card ${selectedBranch.isActive ? 'bg-macos-green' : 'bg-macos-red'}`} />
                </div>
                <div>
                  <p className="text-[15px] font-semibold tracking-[-0.02em]">{selectedBranch.name}</p>
                  <p className="text-[12px] font-normal text-muted-foreground">{selectedBranch.code} · {selectedBranch.isActive ? 'Online' : 'Offline'}</p>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Location Info */}
              <div className="macos-card p-4 space-y-3">
                <h4 className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Location Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedBranch.address && (
                    <div className="flex items-center gap-2.5 text-[13px]">
                      <div className="size-7 rounded-lg bg-gg-sunset/10 flex items-center justify-center shrink-0">
                        <MapPin className="size-3.5 text-gg-sunset" strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Address</p>
                        <p className="truncate">{selectedBranch.address}</p>
                      </div>
                    </div>
                  )}
                  {selectedBranch.phone && (
                    <div className="flex items-center gap-2.5 text-[13px]">
                      <div className="size-7 rounded-lg bg-macos-green/10 flex items-center justify-center shrink-0">
                        <Phone className="size-3.5 text-macos-green" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Phone</p>
                        <p>{selectedBranch.phone}</p>
                      </div>
                    </div>
                  )}
                  {selectedBranch.email && (
                    <div className="flex items-center gap-2.5 text-[13px]">
                      <div className="size-7 rounded-lg bg-macos-blue/10 flex items-center justify-center shrink-0">
                        <Mail className="size-3.5 text-macos-blue" strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Email</p>
                        <p className="truncate">{selectedBranch.email}</p>
                      </div>
                    </div>
                  )}
                  {selectedBranch.manager && (
                    <div className="flex items-center gap-2.5 text-[13px]">
                      <div className="size-7 rounded-lg bg-macos-purple/10 flex items-center justify-center shrink-0">
                        <User className="size-3.5 text-macos-purple" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Manager</p>
                        <p>{selectedBranch.manager}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="macos-card p-4 space-y-3">
                <h4 className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Performance</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-macos-blue/10 text-center">
                    <p className="text-[22px] font-bold tracking-[-0.03em] text-macos-blue">{selectedBranch._count?.employees || 0}</p>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Staff</p>
                  </div>
                  <div className="p-3 rounded-xl bg-macos-green/10 text-center">
                    <p className="text-[22px] font-bold tracking-[-0.03em] text-macos-green">{selectedBranch._count?.sales || 0}</p>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Sales</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gg-golden/10 text-center">
                    <p className="text-[22px] font-bold tracking-[-0.03em] text-gg-golden">{selectedBranch._count?.warehouses || 0}</p>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Warehouses</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-muted-foreground">Signal strength</span>
                  <SignalBars strength={getSignalStrength(selectedBranch)} />
                  <span className="text-[11px] text-muted-foreground">
                    {getSignalStrength(selectedBranch) >= 4 ? 'Excellent' : getSignalStrength(selectedBranch) >= 3 ? 'Good' : getSignalStrength(selectedBranch) >= 2 ? 'Fair' : 'Weak'}
                  </span>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Add Branch Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl macos-shadow-float">
          <DialogHeader>
            <DialogTitle className="text-[13px] font-semibold tracking-[-0.01em]">Add New Location</DialogTitle>
            <DialogDescription className="text-[11px]">Create a new branch location for your bookstore</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-name" className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Name *</Label>
                <Input
                  id="add-name"
                  placeholder="Downtown Store"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="macos-search rounded-lg text-[13px] h-8 border-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-code" className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Code *</Label>
                <Input
                  id="add-code"
                  placeholder="DT-001"
                  value={formData.code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="macos-search rounded-lg text-[13px] h-8 border-0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-address" className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Address</Label>
              <Input
                id="add-address"
                placeholder="123 Main Street, City"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                className="macos-search rounded-lg text-[13px] h-8 border-0"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-phone" className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Phone</Label>
                <Input
                  id="add-phone"
                  placeholder="+1 555-0100"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="macos-search rounded-lg text-[13px] h-8 border-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-email" className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Email</Label>
                <Input
                  id="add-email"
                  placeholder="branch@bookflow.com"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="macos-search rounded-lg text-[13px] h-8 border-0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-manager" className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Manager</Label>
              <Input
                id="add-manager"
                placeholder="John Smith"
                value={formData.manager}
                onChange={(e) => setFormData((prev) => ({ ...prev, manager: e.target.value }))}
                className="macos-search rounded-lg text-[13px] h-8 border-0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddDialogOpen(false)} className="rounded-lg text-[13px]">Cancel</Button>
            <Button onClick={handleAddBranch} disabled={submitting} className="bg-primary text-primary-foreground rounded-lg font-medium text-[13px]">
              {submitting ? 'Creating...' : 'Create Location'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Branch Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl macos-shadow-float">
          <DialogHeader>
            <DialogTitle className="text-[13px] font-semibold tracking-[-0.01em]">Edit Location</DialogTitle>
            <DialogDescription className="text-[11px]">Update branch information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="macos-search rounded-lg text-[13px] h-8 border-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-code" className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Code *</Label>
                <Input
                  id="edit-code"
                  value={formData.code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="macos-search rounded-lg text-[13px] h-8 border-0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address" className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Address</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                className="macos-search rounded-lg text-[13px] h-8 border-0"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone" className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Phone</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="macos-search rounded-lg text-[13px] h-8 border-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email" className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Email</Label>
                <Input
                  id="edit-email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="macos-search rounded-lg text-[13px] h-8 border-0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-manager" className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Manager</Label>
              <Input
                id="edit-manager"
                value={formData.manager}
                onChange={(e) => setFormData((prev) => ({ ...prev, manager: e.target.value }))}
                className="macos-search rounded-lg text-[13px] h-8 border-0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditDialogOpen(false)} className="rounded-lg text-[13px]">Cancel</Button>
            <Button onClick={handleEditBranch} disabled={submitting} className="bg-primary text-primary-foreground rounded-lg font-medium text-[13px]">
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
