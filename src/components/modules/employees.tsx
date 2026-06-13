'use client'

import * as React from 'react'
import {
  UserCog,
  Search,
  Plus,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  DollarSign,
  Trash2,
  Pencil,
  Eye,
  Users,
  MapPin,
  UserCheck,
  UserX,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// ==================== TYPES ====================

interface Branch {
  id: string
  name: string
  code: string
}

interface Employee {
  id: string
  name: string
  email: string
  phone?: string | null
  department?: string | null
  position?: string | null
  salary: number
  hireDate?: string | null
  isActive: boolean
  branchId?: string | null
  branch?: Branch | null
  createdAt: string
  _count?: { sales: number; attendance: number }
}

// ==================== EMPLOYEES MODULE ====================

export function EmployeesModule() {
  const [employees, setEmployees] = React.useState<Employee[]>([])
  const [branches, setBranches] = React.useState<Branch[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [departmentFilter, setDepartmentFilter] = React.useState('all')
  const [showAddDialog, setShowAddDialog] = React.useState(false)
  const [editEmployee, setEditEmployee] = React.useState<Employee | null>(null)
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null)

  const fetchEmployees = React.useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (departmentFilter && departmentFilter !== 'all') params.set('department', departmentFilter)
      params.set('limit', '50')
      const res = await fetch(`/api/employees?${params}`)
      const json = await res.json()
      if (json.data) setEmployees(json.data)
    } catch (err) {
      console.error('Failed to fetch employees:', err)
    } finally {
      setLoading(false)
    }
  }, [search, departmentFilter])

  const fetchBranches = React.useCallback(async () => {
    try {
      const res = await fetch('/api/branches')
      const json = await res.json()
      if (json.data) setBranches(json.data)
    } catch (err) {
      console.error('Failed to fetch branches:', err)
    }
  }, [])

  React.useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  React.useEffect(() => {
    fetchBranches()
  }, [fetchBranches])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this employee?')) return
    try {
      await fetch(`/api/employees?id=${id}`, { method: 'DELETE' })
      fetchEmployees()
    } catch (err) {
      console.error('Failed to deactivate employee:', err)
    }
  }

  // Department stats
  const departments = employees.reduce(
    (acc, emp) => {
      const dept = emp.department || 'Unassigned'
      if (!acc[dept]) acc[dept] = { total: 0, active: 0, inactive: 0 }
      acc[dept].total++
      if (emp.isActive) acc[dept].active++
      else acc[dept].inactive++
      return acc
    },
    {} as Record<string, { total: number; active: number; inactive: number }>
  )

  const totalEmployees = employees.length
  const activeEmployees = employees.filter((e) => e.isActive).length
  const inactiveEmployees = employees.filter((e) => !e.isActive).length
  const totalPayroll = employees.filter((e) => e.isActive).reduce((sum, e) => sum + e.salary, 0)

  const departmentList = [...new Set(employees.map((e) => e.department).filter(Boolean))] as string[]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-950/40">
          <UserCog className="size-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Employees</h2>
          <p className="text-sm text-muted-foreground">
            Manage your team, departments, and payroll
          </p>
        </div>
      </div>

      {/* Department Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="rounded p-1.5 bg-emerald-100 dark:bg-emerald-950/40">
                <Users className="size-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-lg font-bold">{totalEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="rounded p-1.5 bg-teal-100 dark:bg-teal-950/40">
                <UserCheck className="size-4 text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active</p>
                <p className="text-lg font-bold text-teal-600">{activeEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="rounded p-1.5 bg-amber-100 dark:bg-amber-950/40">
                <UserX className="size-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Inactive</p>
                <p className="text-lg font-bold text-amber-600">{inactiveEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="rounded p-1.5 bg-emerald-100 dark:bg-emerald-950/40">
                <DollarSign className="size-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Monthly Payroll</p>
                <p className="text-lg font-bold text-emerald-600">${totalPayroll.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department breakdown */}
      {Object.keys(departments).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Department Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(departments).map(([dept, stats]) => (
                <div
                  key={dept}
                  className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setDepartmentFilter(dept === 'Unassigned' ? 'all' : dept)}
                >
                  <span className="font-medium">{dept}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {stats.active} active
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial sm:w-64">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departmentList.map((dept) => (
                <SelectItem key={dept} value={dept!}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="size-4" /> Add Employee
        </Button>
      </div>

      {/* Employee Table */}
      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : employees.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <UserCog className="size-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No employees found</p>
            <p className="text-sm text-muted-foreground">Add your first team member</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead className="text-right">Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow
                      key={employee.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedEmployee(employee)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-xs font-semibold">
                              {employee.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{employee.name}</p>
                            <p className="text-xs text-muted-foreground">{employee.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px]">
                          {employee.department || 'Unassigned'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{employee.position || '—'}</TableCell>
                      <TableCell className="text-sm">
                        {employee.branch?.name || '—'}
                      </TableCell>
                      <TableCell className="text-right font-medium text-sm">
                        ${employee.salary.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            employee.isActive
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px]'
                              : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 text-[10px]'
                          }
                        >
                          {employee.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-teal-600 hover:text-teal-700"
                            onClick={() => setEditEmployee(employee)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(employee.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <AddEmployeeDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        branches={branches}
        onSuccess={fetchEmployees}
      />
      <EditEmployeeDialog
        employee={editEmployee}
        onOpenChange={(open) => !open && setEditEmployee(null)}
        branches={branches}
        onSuccess={fetchEmployees}
      />
      <EmployeeDetailDialog
        employee={selectedEmployee}
        onOpenChange={(open) => !open && setSelectedEmployee(null)}
      />
    </div>
  )
}

// ==================== ADD EMPLOYEE DIALOG ====================

function AddEmployeeDialog({
  open,
  onOpenChange,
  branches,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  branches: Branch[]
  onSuccess: () => void
}) {
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    salary: '',
    hireDate: '',
    branchId: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          salary: parseFloat(form.salary) || 0,
          hireDate: form.hireDate || null,
          branchId: form.branchId || null,
        }),
      })
      if (res.ok) {
        setForm({ name: '', email: '', phone: '', department: '', position: '', salary: '', hireDate: '', branchId: '' })
        onOpenChange(false)
        onSuccess()
      } else {
        const json = await res.json()
        alert(json.error || 'Failed to create employee')
      }
    } catch (err) {
      console.error('Failed to create employee:', err)
      alert('Failed to create employee')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Employee</DialogTitle>
          <DialogDescription>Register a new team member</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emp-name">Full Name *</Label>
            <Input
              id="emp-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="John Smith"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="emp-email">Email *</Label>
              <Input
                id="emp-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="john@bookflow.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emp-phone">Phone</Label>
              <Input
                id="emp-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1-555-0100"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Management">Management</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Warehouse">Warehouse</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="emp-position">Position</Label>
              <Input
                id="emp-position"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                placeholder="Sales Manager"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="emp-salary">Monthly Salary ($)</Label>
              <Input
                id="emp-salary"
                type="number"
                step="0.01"
                min="0"
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
                placeholder="5000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emp-hire">Hire Date</Label>
              <Input
                id="emp-hire"
                type="date"
                value={form.hireDate}
                onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Branch</Label>
            <Select value={form.branchId} onValueChange={(v) => setForm({ ...form, branchId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select branch..." />
              </SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || !form.name.trim() || !form.email.trim()}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {saving ? 'Saving...' : 'Add Employee'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ==================== EDIT EMPLOYEE DIALOG ====================

function EditEmployeeDialog({
  employee,
  onOpenChange,
  branches,
  onSuccess,
}: {
  employee: Employee | null
  onOpenChange: (open: boolean) => void
  branches: Branch[]
  onSuccess: () => void
}) {
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    salary: '',
    hireDate: '',
    branchId: '',
    isActive: true,
  })

  React.useEffect(() => {
    if (employee) {
      setForm({
        name: employee.name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        department: employee.department || '',
        position: employee.position || '',
        salary: employee.salary?.toString() || '',
        hireDate: employee.hireDate ? new Date(employee.hireDate).toISOString().split('T')[0] : '',
        branchId: employee.branchId || '',
        isActive: employee.isActive,
      })
    }
  }, [employee])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!employee) return
    setSaving(true)
    try {
      const res = await fetch('/api/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: employee.id,
          name: form.name,
          email: form.email,
          phone: form.phone,
          department: form.department,
          position: form.position,
          salary: parseFloat(form.salary) || 0,
          hireDate: form.hireDate || null,
          branchId: form.branchId || null,
          isActive: form.isActive,
        }),
      })
      if (res.ok) {
        onOpenChange(false)
        onSuccess()
      } else {
        const json = await res.json()
        alert(json.error || 'Failed to update employee')
      }
    } catch (err) {
      console.error('Failed to update employee:', err)
      alert('Failed to update employee')
    } finally {
      setSaving(false)
    }
  }

  if (!employee) return null

  return (
    <Dialog open={!!employee} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogDescription>Update employee information</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Management">Management</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Warehouse">Warehouse</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Position</Label>
              <Input
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Monthly Salary ($)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Hire Date</Label>
              <Input
                type="date"
                value={form.hireDate}
                onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Branch</Label>
              <Select value={form.branchId} onValueChange={(v) => setForm({ ...form, branchId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select branch..." />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.isActive ? 'active' : 'inactive'} onValueChange={(v) => setForm({ ...form, isActive: v === 'active' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? 'Saving...' : 'Update Employee'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ==================== EMPLOYEE DETAIL DIALOG ====================

function EmployeeDetailDialog({
  employee,
  onOpenChange,
}: {
  employee: Employee | null
  onOpenChange: (open: boolean) => void
}) {
  if (!employee) return null

  const initials = employee.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <Dialog open={!!employee} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p>{employee.name}</p>
              <p className="text-sm font-normal text-muted-foreground">{employee.position || 'No position assigned'}</p>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="size-4 text-muted-foreground" />
                <span>{employee.email}</span>
              </div>
              {employee.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="size-4 text-muted-foreground" />
                  <span>{employee.phone}</span>
                </div>
              )}
              {employee.department && (
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="size-4 text-muted-foreground" />
                  <span>{employee.department}</span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {employee.branch && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="size-4 text-muted-foreground" />
                  <span>{employee.branch.name}</span>
                </div>
              )}
              {employee.hireDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span>Hired {new Date(employee.hireDate).toLocaleDateString()}</span>
                </div>
              )}
              <Badge
                className={
                  employee.isActive
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                }
              >
                {employee.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <p className="text-xs text-muted-foreground">Monthly Salary</p>
              <p className="text-xl font-bold text-emerald-600">${employee.salary.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg border">
              <p className="text-xs text-muted-foreground">Sales Recorded</p>
              <p className="text-xl font-bold">{employee._count?.sales || 0}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">Activity</h4>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 p-2 rounded border text-xs">
                <Calendar className="size-3 text-muted-foreground" />
                Attendance Records: {employee._count?.attendance || 0}
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded border text-xs">
                <DollarSign className="size-3 text-muted-foreground" />
                Sales Processed: {employee._count?.sales || 0}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
