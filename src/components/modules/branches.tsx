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
  const { toast } = useToast()
  const [branches, setBranches] = React.useState<Branch[]>([])
  const [loading, setLoading] = React.useState(true)
  const [addDialogOpen, setAddDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [formData, setFormData] = React.useState<BranchFormData>(defaultFormData)
  const [editingBranch, setEditingBranch] = React.useState<Branch | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

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

  const activeBranches = branches.filter((b) => b.isActive)
  const inactiveBranches = branches.filter((b) => !b.isActive)

  const totalEmployees = branches.reduce((sum, b) => sum + (b._count?.employees || 0), 0)
  const totalSales = branches.reduce((sum, b) => sum + (b._count?.sales || 0), 0)
  const totalWarehouses = branches.reduce((sum, b) => sum + (b._count?.warehouses || 0), 0)

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl macos-shadow p-4 bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Total Branches</p>
              <p className="text-2xl font-bold tracking-tight">{branches.length}</p>
            </div>
            <div className="rounded-lg bg-macos-green/10 p-2.5">
              <Building className="size-5 text-macos-green" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl macos-shadow p-4 bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Active Branches</p>
              <p className="text-2xl font-bold tracking-tight">{activeBranches.length}</p>
            </div>
            <div className="rounded-lg bg-macos-teal/10 p-2.5">
              <TrendingUp className="size-5 text-macos-teal" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl macos-shadow p-4 bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Total Employees</p>
              <p className="text-2xl font-bold tracking-tight">{totalEmployees}</p>
            </div>
            <div className="rounded-lg bg-macos-orange/10 p-2.5">
              <Users className="size-5 text-macos-orange" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl macos-shadow p-4 bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Total Sales</p>
              <p className="text-2xl font-bold tracking-tight">{totalSales}</p>
            </div>
            <div className="rounded-lg bg-macos-purple/10 p-2.5">
              <ShoppingCart className="size-5 text-macos-purple" />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Branch Management</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">Manage your bookstore locations and branch operations</p>
        </div>
        <Button onClick={() => { setFormData(defaultFormData); setAddDialogOpen(true) }} className="bg-primary text-primary-foreground rounded-lg font-medium text-[13px]">
          <Plus className="size-3.5 mr-1.5" strokeWidth={2} />
          Add Branch
        </Button>
      </div>

      {/* Branch Performance Comparison */}
      {activeBranches.length > 0 && (
        <div className="rounded-2xl macos-shadow p-5 bg-card">
          <div className="mb-4">
            <h3 className="text-[13px] font-semibold tracking-tight">Branch Performance Comparison</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Key metrics across active locations</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeBranches.map((branch) => (
              <div key={branch.id} className="rounded-xl bg-secondary/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[13px] tracking-tight">{branch.name}</p>
                  <Badge className="rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 bg-macos-green/10 text-macos-green">
                    {branch.code}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="space-y-0.5">
                    <p className="text-lg font-bold tracking-tight text-macos-blue">{branch._count?.employees || 0}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Staff</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-lg font-bold tracking-tight text-macos-green">{branch._count?.sales || 0}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Sales</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-lg font-bold tracking-tight text-macos-orange">{branch._count?.warehouses || 0}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Warehouses</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Branch Cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl macos-shadow p-5 bg-card animate-pulse">
              <div className="h-5 bg-muted rounded w-1/2 mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : branches.length === 0 ? (
        <div className="rounded-2xl macos-shadow p-5 bg-card text-center py-16">
          <Building className="size-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold tracking-tight mb-1">No branches yet</h3>
          <p className="text-[13px] text-muted-foreground mb-4">Add your first branch to get started</p>
          <Button onClick={() => setAddDialogOpen(true)} className="bg-primary text-primary-foreground rounded-lg font-medium text-[13px]">
            <Plus className="size-3.5 mr-1.5" strokeWidth={2} />
            Add Branch
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch) => (
            <div key={branch.id} className={`rounded-2xl macos-shadow p-5 bg-card macos-card-hover ${!branch.isActive ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-macos-blue/10 p-2">
                    <Building className="size-4 text-macos-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[13px] tracking-tight">{branch.name}</h3>
                    <Badge className="rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 bg-secondary text-secondary-foreground mt-0.5">
                      {branch.code}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={`rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 ${
                      branch.isActive
                        ? 'bg-macos-green/10 text-macos-green'
                        : 'bg-macos-red/10 text-macos-red'
                    }`}
                  >
                    {branch.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-7">
                        <MoreVertical className="size-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(branch)}>
                        <Pencil className="size-3.5 mr-2" />
                        Edit Branch
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(branch)}>
                        {branch.isActive ? (
                          <>
                            <PowerOff className="size-3.5 mr-2" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Power className="size-3.5 mr-2" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="space-y-2 text-[13px]">
                {branch.address && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="size-3.5 shrink-0" />
                    <span className="truncate">{branch.address}</span>
                  </div>
                )}
                {branch.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="size-3.5 shrink-0" />
                    <span>{branch.phone}</span>
                  </div>
                )}
                {branch.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="size-3.5 shrink-0" />
                    <span className="truncate">{branch.email}</span>
                  </div>
                )}
                {branch.manager && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="size-3.5 shrink-0" />
                    <span>{branch.manager}</span>
                  </div>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-border flex items-center gap-4 text-[11px] text-muted-foreground font-medium">
                <span className="flex items-center gap-1"><Users className="size-3" />{branch._count?.employees || 0} staff</span>
                <span className="flex items-center gap-1"><ShoppingCart className="size-3" />{branch._count?.sales || 0} sales</span>
                <span className="flex items-center gap-1"><Package className="size-3" />{branch._count?.warehouses || 0} warehouses</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inactive Branches Table */}
      {inactiveBranches.length > 0 && (
        <div className="rounded-2xl macos-shadow p-5 bg-card">
          <div className="mb-4">
            <h3 className="text-[13px] font-semibold tracking-tight">Inactive Branches</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Deactivated branch locations</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Name</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Code</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Address</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Manager</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inactiveBranches.map((branch) => (
                <TableRow key={branch.id} className="hover:bg-secondary/50">
                  <TableCell className="text-[13px] font-medium">{branch.name}</TableCell>
                  <TableCell className="text-[13px]">
                    <Badge className="rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 bg-secondary text-secondary-foreground">
                      {branch.code}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[13px] text-muted-foreground">{branch.address || '—'}</TableCell>
                  <TableCell className="text-[13px] text-muted-foreground">{branch.manager || '—'}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => handleToggleStatus(branch)} className="rounded-lg text-[13px] text-macos-green">
                      <Power className="size-3.5 mr-1" />
                      Reactivate
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Branch Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[13px] font-semibold tracking-tight">Add New Branch</DialogTitle>
            <DialogDescription className="text-[13px]">Create a new branch location for your bookstore</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-name" className="text-[11px] font-semibold tracking-wide text-muted-foreground">Name *</Label>
                <Input
                  id="add-name"
                  placeholder="Downtown Store"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-code" className="text-[11px] font-semibold tracking-wide text-muted-foreground">Code *</Label>
                <Input
                  id="add-code"
                  placeholder="DT-001"
                  value={formData.code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-address" className="text-[11px] font-semibold tracking-wide text-muted-foreground">Address</Label>
              <Input
                id="add-address"
                placeholder="123 Main Street, City"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-phone" className="text-[11px] font-semibold tracking-wide text-muted-foreground">Phone</Label>
                <Input
                  id="add-phone"
                  placeholder="+1 555-0100"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-email" className="text-[11px] font-semibold tracking-wide text-muted-foreground">Email</Label>
                <Input
                  id="add-email"
                  placeholder="branch@bookflow.com"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-manager" className="text-[11px] font-semibold tracking-wide text-muted-foreground">Manager</Label>
              <Input
                id="add-manager"
                placeholder="John Smith"
                value={formData.manager}
                onChange={(e) => setFormData((prev) => ({ ...prev, manager: e.target.value }))}
                className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} className="bg-secondary text-secondary-foreground rounded-lg font-medium text-[13px]">Cancel</Button>
            <Button onClick={handleAddBranch} disabled={submitting} className="bg-primary text-primary-foreground rounded-lg font-medium text-[13px]">
              {submitting ? 'Creating...' : 'Create Branch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Branch Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[13px] font-semibold tracking-tight">Edit Branch</DialogTitle>
            <DialogDescription className="text-[13px]">Update branch information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-[11px] font-semibold tracking-wide text-muted-foreground">Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-code" className="text-[11px] font-semibold tracking-wide text-muted-foreground">Code *</Label>
                <Input
                  id="edit-code"
                  value={formData.code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address" className="text-[11px] font-semibold tracking-wide text-muted-foreground">Address</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone" className="text-[11px] font-semibold tracking-wide text-muted-foreground">Phone</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email" className="text-[11px] font-semibold tracking-wide text-muted-foreground">Email</Label>
                <Input
                  id="edit-email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-manager" className="text-[11px] font-semibold tracking-wide text-muted-foreground">Manager</Label>
              <Input
                id="edit-manager"
                value={formData.manager}
                onChange={(e) => setFormData((prev) => ({ ...prev, manager: e.target.value }))}
                className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="bg-secondary text-secondary-foreground rounded-lg font-medium text-[13px]">Cancel</Button>
            <Button onClick={handleEditBranch} disabled={submitting} className="bg-primary text-primary-foreground rounded-lg font-medium text-[13px]">
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
