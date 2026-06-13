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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

  // Performance metrics
  const totalEmployees = branches.reduce((sum, b) => sum + (b._count?.employees || 0), 0)
  const totalSales = branches.reduce((sum, b) => sum + (b._count?.sales || 0), 0)
  const totalWarehouses = branches.reduce((sum, b) => sum + (b._count?.warehouses || 0), 0)

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Branches</p>
                <p className="text-2xl font-bold">{branches.length}</p>
              </div>
              <div className="rounded-lg bg-emerald-100 p-2.5 dark:bg-emerald-950/30">
                <Building className="size-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Active Branches</p>
                <p className="text-2xl font-bold">{activeBranches.length}</p>
              </div>
              <div className="rounded-lg bg-teal-100 p-2.5 dark:bg-teal-950/30">
                <TrendingUp className="size-5 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{totalEmployees}</p>
              </div>
              <div className="rounded-lg bg-amber-100 p-2.5 dark:bg-amber-950/30">
                <Users className="size-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold">{totalSales}</p>
              </div>
              <div className="rounded-lg bg-rose-100 p-2.5 dark:bg-rose-950/30">
                <ShoppingCart className="size-5 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Branch Management</h2>
          <p className="text-sm text-muted-foreground">Manage your bookstore locations and branch operations</p>
        </div>
        <Button onClick={() => { setFormData(defaultFormData); setAddDialogOpen(true) }} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="size-4 mr-1.5" />
          Add Branch
        </Button>
      </div>

      {/* Branch Performance Comparison */}
      {activeBranches.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Branch Performance Comparison</CardTitle>
            <CardDescription>Key metrics across active locations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {activeBranches.map((branch) => (
                <div key={branch.id} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">{branch.name}</p>
                    <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                      {branch.code}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="space-y-0.5">
                      <p className="text-lg font-bold text-emerald-600">{branch._count?.employees || 0}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Staff</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-lg font-bold text-teal-600">{branch._count?.sales || 0}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Sales</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-lg font-bold text-amber-600">{branch._count?.warehouses || 0}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Warehouses</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Branch Cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-5 bg-muted rounded w-1/2 mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : branches.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Building className="size-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-1">No branches yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Add your first branch to get started</p>
            <Button onClick={() => setAddDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="size-4 mr-1.5" />
              Add Branch
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch) => (
            <Card key={branch.id} className={`transition-all hover:shadow-md ${!branch.isActive ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-950/30">
                      <Building className="size-4 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{branch.name}</h3>
                      <Badge variant="outline" className="text-[10px] mt-0.5">{branch.code}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={branch.isActive ? 'default' : 'secondary'}
                      className={`text-[10px] ${branch.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : ''}`}
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
                <div className="space-y-2 text-sm">
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
                <div className="mt-3 pt-3 border-t flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="size-3" />{branch._count?.employees || 0} staff</span>
                  <span className="flex items-center gap-1"><ShoppingCart className="size-3" />{branch._count?.sales || 0} sales</span>
                  <span className="flex items-center gap-1"><Package className="size-3" />{branch._count?.warehouses || 0} warehouses</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Inactive Branches Table */}
      {inactiveBranches.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Inactive Branches</CardTitle>
            <CardDescription>Deactivated branch locations</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inactiveBranches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell><Badge variant="outline">{branch.code}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{branch.address || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{branch.manager || '—'}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => handleToggleStatus(branch)} className="text-emerald-600">
                        <Power className="size-3.5 mr-1" />
                        Reactivate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add Branch Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Branch</DialogTitle>
            <DialogDescription>Create a new branch location for your bookstore</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-name">Name *</Label>
                <Input
                  id="add-name"
                  placeholder="Downtown Store"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-code">Code *</Label>
                <Input
                  id="add-code"
                  placeholder="DT-001"
                  value={formData.code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-address">Address</Label>
              <Input
                id="add-address"
                placeholder="123 Main Street, City"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-phone">Phone</Label>
                <Input
                  id="add-phone"
                  placeholder="+1 555-0100"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-email">Email</Label>
                <Input
                  id="add-email"
                  placeholder="branch@bookflow.com"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-manager">Manager</Label>
              <Input
                id="add-manager"
                placeholder="John Smith"
                value={formData.manager}
                onChange={(e) => setFormData((prev) => ({ ...prev, manager: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddBranch} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
              {submitting ? 'Creating...' : 'Create Branch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Branch Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
            <DialogDescription>Update branch information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-code">Code *</Label>
                <Input
                  id="edit-code"
                  value={formData.code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-manager">Manager</Label>
              <Input
                id="edit-manager"
                value={formData.manager}
                onChange={(e) => setFormData((prev) => ({ ...prev, manager: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditBranch} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
