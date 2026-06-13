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
  Users,
  ShoppingCart,
  Package,
  Wifi,
  WifiOff,
  Globe,
  ChevronRight,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { useAppStore } from '@/store/app-store'
import {
  MacosPageHeader,
  MacosStatCard,
  MacosStatGrid,
  MacosCard,
  MacosButton,
  MacosBadge,
  MacosDialog,
  MacosEmptyState,
  MacosFormField,
} from '@/components/macos-ui'

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

// Helper: Network signal strength indicator
function SignalBars({ strength }: { strength: number }) {
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
function getSignalStrength(branch: Branch) {
  const employees = branch._count?.employees || 0
  const sales = branch._count?.sales || 0
  if (employees >= 5 && sales >= 10) return 4
  if (employees >= 3 && sales >= 5) return 3
  if (employees >= 1) return 2
  return 1
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

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <MacosPageHeader
        title="Network Locations"
        subtitle="Manage branch locations & connectivity"
        icon={Globe}
        iconColor="text-gg-bay"
        iconBg="bg-gg-bay/10"
      >
        {!isViewOnly && (
          <MacosButton variant="primary" icon={Plus} onClick={() => { setFormData(defaultFormData); setAddDialogOpen(true) }}>
            Add Location
          </MacosButton>
        )}
      </MacosPageHeader>

      {/* Performance Metrics */}
      <MacosStatGrid>
        <MacosStatCard
          label="Locations"
          value={branches.length}
          icon={Building}
          iconColor="text-gg-bay"
          iconBg="bg-gg-bay/10"
        />
        <MacosStatCard
          label="Online"
          value={activeBranches.length}
          icon={Wifi}
          iconColor="text-macos-green"
          iconBg="bg-macos-green/10"
        />
        <MacosStatCard
          label="Staff"
          value={totalEmployees}
          icon={Users}
          iconColor="text-gg-sunset"
          iconBg="bg-gg-sunset/10"
        />
        <MacosStatCard
          label="Sales"
          value={totalSales}
          icon={ShoppingCart}
          iconColor="text-macos-purple"
          iconBg="bg-macos-purple/10"
        />
      </MacosStatGrid>

      {/* Branch Cards - macOS System Settings > Network style */}
      {loading ? (
        <MacosCard>
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </MacosCard>
      ) : branches.length === 0 ? (
        <MacosCard>
          <MacosEmptyState
            icon={Globe}
            title="No network locations"
            description="Add your first branch location to get started"
            action={
              !isViewOnly ? (
                <MacosButton variant="primary" icon={Plus} onClick={() => setAddDialogOpen(true)}>
                  Add Location
                </MacosButton>
              ) : undefined
            }
          />
        </MacosCard>
      ) : (
        <MacosCard noPadding>
          {/* Section: Active Locations */}
          <div className="px-4 pt-4 pb-2">
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
                    <MacosBadge variant="info">{branch.code}</MacosBadge>
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
                        <button className="size-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-secondary/80 transition-opacity">
                          <MoreVertical className="size-3.5" strokeWidth={1.5} />
                        </button>
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
              <div className="px-4 pt-5 pb-2">
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
                        <MacosBadge variant="default">{branch.code}</MacosBadge>
                        <MacosBadge variant="danger">Offline</MacosBadge>
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
                        <MacosButton
                          variant="ghost"
                          icon={Power}
                          onClick={() => handleToggleStatus(branch)}
                          className="text-macos-green hover:text-macos-green hover:bg-macos-green/10"
                        >
                          Reactivate
                        </MacosButton>
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
        </MacosCard>
      )}

      {/* Branch Detail Dialog - macOS Network Details style */}
      <MacosDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title=""
      >
        {selectedBranch && (
          <>
            {/* Custom header with network icon */}
            <div className="flex items-center gap-3 -mt-2 mb-2">
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
            </div>

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
          </>
        )}
      </MacosDialog>

      {/* Add Branch Dialog */}
      <MacosDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        title="Add New Location"
        description="Create a new branch location for your bookstore"
        footer={
          <>
            <MacosButton variant="secondary" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </MacosButton>
            <MacosButton variant="primary" onClick={handleAddBranch} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Location'}
            </MacosButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <MacosFormField label="Name *">
              <Input
                placeholder="Downtown Store"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="macos-search rounded-lg text-[13px] h-8 border-0"
              />
            </MacosFormField>
            <MacosFormField label="Code *">
              <Input
                placeholder="DT-001"
                value={formData.code}
                onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                className="macos-search rounded-lg text-[13px] h-8 border-0"
              />
            </MacosFormField>
          </div>
          <MacosFormField label="Address">
            <Input
              placeholder="123 Main Street, City"
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              className="macos-search rounded-lg text-[13px] h-8 border-0"
            />
          </MacosFormField>
          <div className="grid grid-cols-2 gap-4">
            <MacosFormField label="Phone">
              <Input
                placeholder="+1 555-0100"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                className="macos-search rounded-lg text-[13px] h-8 border-0"
              />
            </MacosFormField>
            <MacosFormField label="Email">
              <Input
                placeholder="branch@bookflow.com"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="macos-search rounded-lg text-[13px] h-8 border-0"
              />
            </MacosFormField>
          </div>
          <MacosFormField label="Manager">
            <Input
              placeholder="John Smith"
              value={formData.manager}
              onChange={(e) => setFormData((prev) => ({ ...prev, manager: e.target.value }))}
              className="macos-search rounded-lg text-[13px] h-8 border-0"
            />
          </MacosFormField>
        </div>
      </MacosDialog>

      {/* Edit Branch Dialog */}
      <MacosDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        title="Edit Location"
        description="Update branch information"
        footer={
          <>
            <MacosButton variant="secondary" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </MacosButton>
            <MacosButton variant="primary" onClick={handleEditBranch} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </MacosButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <MacosFormField label="Name *">
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="macos-search rounded-lg text-[13px] h-8 border-0"
              />
            </MacosFormField>
            <MacosFormField label="Code *">
              <Input
                value={formData.code}
                onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                className="macos-search rounded-lg text-[13px] h-8 border-0"
              />
            </MacosFormField>
          </div>
          <MacosFormField label="Address">
            <Input
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              className="macos-search rounded-lg text-[13px] h-8 border-0"
            />
          </MacosFormField>
          <div className="grid grid-cols-2 gap-4">
            <MacosFormField label="Phone">
              <Input
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                className="macos-search rounded-lg text-[13px] h-8 border-0"
              />
            </MacosFormField>
            <MacosFormField label="Email">
              <Input
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="macos-search rounded-lg text-[13px] h-8 border-0"
              />
            </MacosFormField>
          </div>
          <MacosFormField label="Manager">
            <Input
              value={formData.manager}
              onChange={(e) => setFormData((prev) => ({ ...prev, manager: e.target.value }))}
              className="macos-search rounded-lg text-[13px] h-8 border-0"
            />
          </MacosFormField>
        </div>
      </MacosDialog>
    </div>
  )
}
