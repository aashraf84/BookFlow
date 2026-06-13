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

// ==================== DEPARTMENT COLORS ====================

const departmentColors: Record<string, { bg: string; text: string; icon: string }> = {
  Management: { bg: 'bg-macos-purple/10', text: 'text-macos-purple', icon: 'bg-macos-purple/10' },
  Sales: { bg: 'bg-macos-blue/10', text: 'text-macos-blue', icon: 'bg-macos-blue/10' },
  Finance: { bg: 'bg-macos-green/10', text: 'text-macos-green', icon: 'bg-macos-green/10' },
  Warehouse: { bg: 'bg-macos-orange/10', text: 'text-macos-orange', icon: 'bg-macos-orange/10' },
  Marketing: { bg: 'bg-macos-pink/10', text: 'text-macos-pink', icon: 'bg-macos-pink/10' },
  IT: { bg: 'bg-macos-teal/10', text: 'text-macos-teal', icon: 'bg-macos-teal/10' },
  HR: { bg: 'bg-macos-yellow/10', text: 'text-macos-yellow', icon: 'bg-macos-yellow/10' },
  Operations: { bg: 'bg-macos-indigo/10', text: 'text-macos-indigo', icon: 'bg-macos-indigo/10' },
}

function getDeptBadge(dept: string) {
  const colors = departmentColors[dept]
  if (colors) return `${colors.bg} ${colors.text}`
  return 'bg-secondary text-secondary-foreground'
}

function getDeptInitialsColor(dept: string) {
  const colors = departmentColors[dept]
  if (colors) return colors
  return { bg: 'bg-secondary', text: 'text-muted-foreground', icon: 'bg-secondary' }
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

  const totalEmployees = employees.length
  const activeEmployees = employees.filter((e) => e.isActive).length
  const inactiveEmployees = employees.filter((e) => !e.isActive).length
  const totalPayroll = employees.filter((e) => e.isActive).reduce((sum, e) => sum + e.salary, 0)

  const departmentList = [...new Set(employees.map((e) => e.department).filter(Boolean))] as string[]

  const departmentStats = employees.reduce(
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

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-xl bg-macos-orange/10 flex items-center justify-center">
          <UserCog className="size-4 text-macos-orange" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-[13px] font-semibold tracking-tight">Employees</h2>
          <p className="text-[11px] text-muted-foreground">
            Manage your team, departments, and payroll
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="rounded-2xl macos-shadow border-0 p-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-macos-blue/10 flex items-center justify-center">
              <Users className="size-4 text-macos-blue" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight">{totalEmployees}</p>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Total</p>
            </div>
          </div>
        </Card>
        <Card className="rounded-2xl macos-shadow border-0 p-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-macos-green/10 flex items-center justify-center">
              <UserCheck className="size-4 text-macos-green" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-macos-green">{activeEmployees}</p>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Active</p>
            </div>
          </div>
        </Card>
        <Card className="rounded-2xl macos-shadow border-0 p-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-macos-red/10 flex items-center justify-center">
              <UserX className="size-4 text-macos-red" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-macos-red">{inactiveEmployees}</p>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Inactive</p>
            </div>
          </div>
        </Card>
        <Card className="rounded-2xl macos-shadow border-0 p-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-macos-teal/10 flex items-center justify-center">
              <DollarSign className="size-4 text-macos-teal" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-macos-teal">${totalPayroll.toLocaleString()}</p>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Monthly Payroll</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Department Breakdown */}
      {Object.keys(departmentStats).length > 0 && (
        <Card className="rounded-2xl macos-shadow border-0">
          <CardContent className="p-4">
            <h3 className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-3">Department Breakdown</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(departmentStats).map(([dept, stats]) => {
                const colors = getDeptInitialsColor(dept)
                return (
                  <button
                    key={dept}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12px] font-medium cursor-pointer hover:opacity-80 transition-opacity ${
                      departmentFilter === dept ? colors.bg + ' ' + colors.text : 'bg-secondary/50 text-foreground'
                    }`}
                    onClick={() => setDepartmentFilter(dept === 'Unassigned' ? 'all' : dept === departmentFilter ? 'all' : dept)}
                  >
                    {dept}
                    <Badge className={`rounded-md text-[10px] font-semibold tracking-wide px-1.5 py-0 ${getDeptBadge(dept)}`}>
                      {stats.active}
                    </Badge>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial sm:w-64">
            <Search className="absolute left-2.5 top-1.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 rounded-lg bg-secondary/80 border-0 text-[13px] h-8"
            />
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-36 rounded-lg bg-secondary/80 border-0 text-[13px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departmentList.map((dept) => (
                <SelectItem key={dept!} value={dept!}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-1.5 bg-primary text-primary-foreground rounded-lg font-medium text-[13px]">
          <Plus className="size-3.5" strokeWidth={2} /> Add Employee
        </Button>
      </div>

      {/* Employee Table */}
      {loading ? (
        <Card className="rounded-2xl macos-shadow border-0">
          <CardContent className="p-6">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : employees.length === 0 ? (
        <Card className="rounded-2xl macos-shadow border-0">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <UserCog className="size-10 text-muted-foreground mb-3" strokeWidth={1.5} />
            <p className="text-[13px] text-muted-foreground">No employees found</p>
            <p className="text-[11px] text-muted-foreground">Add your first team member</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl macos-shadow border-0">
          <CardContent className="p-0">
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Employee</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Department</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Position</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Branch</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Salary</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => {
                    const deptColors = getDeptInitialsColor(employee.department || '')
                    return (
                      <TableRow
                        key={employee.id}
                        className="cursor-pointer hover:bg-secondary/50"
                        onClick={() => setSelectedEmployee(employee)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarFallback className={`${deptColors.bg} ${deptColors.text} text-[10px] font-semibold`}>
                                {employee.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-[13px]">{employee.name}</p>
                              <p className="text-[11px] text-muted-foreground">{employee.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 ${getDeptBadge(employee.department || '')}`}>
                            {employee.department || 'Unassigned'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[13px]">{employee.position || '—'}</TableCell>
                        <TableCell className="text-[13px]">
                          {employee.branch?.name || '—'}
                        </TableCell>
                        <TableCell className="text-right font-medium text-[13px]">
                          ${employee.salary.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <div className={`size-1.5 rounded-full ${employee.isActive ? 'bg-macos-green' : 'bg-macos-red'}`} />
                            <span className="text-[11px] text-muted-foreground">{employee.isActive ? 'Active' : 'Inactive'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-macos-blue hover:text-macos-blue hover:bg-macos-blue/10 rounded-lg"
                              onClick={() => setEditEmployee(employee)}
                            >
                              <Pencil className="size-3.5" strokeWidth={1.5} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-macos-red hover:text-macos-red hover:bg-macos-red/10 rounded-lg"
                              onClick={() => handleDelete(employee.id)}
                            >
                              <Trash2 className="size-3.5" strokeWidth={1.5} />
                            </Button>
                          </div>
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
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-[13px] font-semibold tracking-tight">Add Employee</DialogTitle>
          <DialogDescription className="text-[11px]">Register a new team member</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Full Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Smith" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@bookflow.com" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8" required />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1-555-0100" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Department</Label>
              <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                <SelectTrigger className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8">
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
              <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Position</Label>
              <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="Sales Manager" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Monthly Salary ($)</Label>
              <Input type="number" step="0.01" min="0" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="5000" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8" />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Hire Date</Label>
              <Input type="date" value={form.hireDate} onChange={(e) => setForm({ ...form, hireDate: e.target.value })} className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Branch</Label>
            <Select value={form.branchId} onValueChange={(v) => setForm({ ...form, branchId: v })}>
              <SelectTrigger className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8">
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
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-lg text-[13px]">Cancel</Button>
            <Button type="submit" disabled={saving || !form.name.trim() || !form.email.trim()} className="bg-primary text-primary-foreground rounded-lg font-medium text-[13px]">
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
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-[13px] font-semibold tracking-tight">Edit Employee</DialogTitle>
          <DialogDescription className="text-[11px]">Update employee information</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Full Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8" required />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Department</Label>
              <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                <SelectTrigger className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8">
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
              <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Position</Label>
              <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Monthly Salary ($)</Label>
              <Input type="number" step="0.01" min="0" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8" />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Hire Date</Label>
              <Input type="date" value={form.hireDate} onChange={(e) => setForm({ ...form, hireDate: e.target.value })} className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Branch</Label>
              <Select value={form.branchId} onValueChange={(v) => setForm({ ...form, branchId: v })}>
                <SelectTrigger className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8">
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
              <Label className="text-[11px] font-semibold tracking-wide text-muted-foreground">Status</Label>
              <Select value={form.isActive ? 'active' : 'inactive'} onValueChange={(v) => setForm({ ...form, isActive: v === 'active' })}>
                <SelectTrigger className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8">
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
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-lg text-[13px]">Cancel</Button>
            <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground rounded-lg font-medium text-[13px]">
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

  const deptColors = getDeptInitialsColor(employee.department || '')

  return (
    <Dialog open={!!employee} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarFallback className={`${deptColors.bg} ${deptColors.text} font-semibold`}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-[13px] font-semibold tracking-tight">{employee.name}</p>
              <p className="text-[11px] font-normal text-muted-foreground">{employee.position || 'No position assigned'}</p>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[13px]">
                <Mail className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                <span>{employee.email}</span>
              </div>
              {employee.phone && (
                <div className="flex items-center gap-2 text-[13px]">
                  <Phone className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                  <span>{employee.phone}</span>
                </div>
              )}
              {employee.department && (
                <div className="flex items-center gap-2 text-[13px]">
                  <Briefcase className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                  <Badge className={`rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 ${getDeptBadge(employee.department)}`}>
                    {employee.department}
                  </Badge>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {employee.branch && (
                <div className="flex items-center gap-2 text-[13px]">
                  <Building2 className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                  <span>{employee.branch.name}</span>
                </div>
              )}
              {employee.hireDate && (
                <div className="flex items-center gap-2 text-[13px]">
                  <Calendar className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                  <span>Hired {new Date(employee.hireDate).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <div className={`size-1.5 rounded-full ${employee.isActive ? 'bg-macos-green' : 'bg-macos-red'}`} />
                <span className="text-[11px] text-muted-foreground">{employee.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          </div>

          <Separator className="bg-border/50" />

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-macos-teal/10">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Monthly Salary</p>
              <p className="text-2xl font-bold tracking-tight text-macos-teal">${employee.salary.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-secondary/50">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Sales Recorded</p>
              <p className="text-2xl font-bold tracking-tight">{employee._count?.sales || 0}</p>
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase mb-2">Activity</h4>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-secondary/50 text-[11px]">
                <Calendar className="size-3 text-muted-foreground" strokeWidth={1.5} />
                Attendance: {employee._count?.attendance || 0}
              </div>
              <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-secondary/50 text-[11px]">
                <DollarSign className="size-3 text-muted-foreground" strokeWidth={1.5} />
                Sales: {employee._count?.sales || 0}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
