'use client'

import * as React from 'react'
import {
  UserCog,
  Plus,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  DollarSign,
  Trash2,
  Pencil,
  Users,
  UserCheck,
  UserX,
  Clock,
  ChevronRight,
  Contact,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAppStore } from '@/store/app-store'
import {
  MacosPageHeader,
  MacosStatCard,
  MacosStatGrid,
  MacosCard,
  MacosSearch,
  MacosFilterBar,
  MacosButton,
  MacosBadge,
  MacosDialog,
  MacosEmptyState,
  MacosFormField,
} from '@/components/macos-ui'

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

function getDeptBadgeVariant(dept: string): 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' {
  const map: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'> = {
    Management: 'purple',
    Sales: 'info',
    Finance: 'success',
    Warehouse: 'warning',
    Marketing: 'danger',
    IT: 'info',
    HR: 'warning',
    Operations: 'purple',
  }
  return map[dept] || 'default'
}

function getDeptInitialsColor(dept: string) {
  const colors = departmentColors[dept]
  if (colors) return colors
  return { bg: 'bg-secondary', text: 'text-muted-foreground', icon: 'bg-secondary' }
}

// ==================== EMPLOYEES MODULE ====================

export function EmployeesModule() {
  const authUser = useAppStore((s) => s.authUser)
  const isViewOnly = authUser?.isViewOnly ?? false

  const [employees, setEmployees] = React.useState<Employee[]>([])
  const [branches, setBranches] = React.useState<Branch[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [departmentFilter, setDepartmentFilter] = React.useState('all')
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'inactive'>('all')
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

  // Apply status filter on client side
  const filteredEmployees = employees.filter((e) => {
    if (statusFilter === 'active') return e.isActive
    if (statusFilter === 'inactive') return !e.isActive
    return true
  })

  const statusFilterItems = [
    { id: 'all', label: 'All', count: totalEmployees },
    { id: 'active', label: 'Active', count: activeEmployees },
    { id: 'inactive', label: 'Inactive', count: inactiveEmployees },
  ]

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <MacosPageHeader
        title="Employees"
        subtitle="Manage your team, departments & payroll"
        icon={Contact}
        iconColor="text-gg-bridge"
        iconBg="bg-gg-bridge/10"
      >
        {!isViewOnly && (
          <MacosButton variant="primary" icon={Plus} onClick={() => setShowAddDialog(true)}>
            Add Employee
          </MacosButton>
        )}
      </MacosPageHeader>

      {/* Stats Row */}
      <MacosStatGrid>
        <MacosStatCard
          label="Total"
          value={totalEmployees}
          icon={Users}
          iconColor="text-macos-blue"
          iconBg="bg-macos-blue/10"
        />
        <MacosStatCard
          label="Active"
          value={activeEmployees}
          icon={UserCheck}
          iconColor="text-macos-green"
          iconBg="bg-macos-green/10"
        />
        <MacosStatCard
          label="Inactive"
          value={inactiveEmployees}
          icon={UserX}
          iconColor="text-macos-red"
          iconBg="bg-macos-red/10"
        />
        <MacosStatCard
          label="Monthly Payroll"
          value={`$${totalPayroll.toLocaleString()}`}
          icon={DollarSign}
          iconColor="text-gg-golden"
          iconBg="bg-gg-golden/10"
        />
      </MacosStatGrid>

      {/* macOS Contacts-style layout: Sidebar departments + Contact list */}
      <div className="flex gap-4 min-h-[480px]">
        {/* Left: Department Groups */}
        <div className="w-56 shrink-0 hidden md:block">
          <MacosCard noPadding>
            <div className="macos-section-header px-3 pt-3 pb-1">
              <h3 className="macos-section-title">Groups</h3>
            </div>
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar px-1.5 pb-2">
              <div className="space-y-0.5">
                <button
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[13px] font-medium cursor-pointer ${
                    departmentFilter === 'all'
                      ? 'macos-filter-item-active'
                      : 'text-foreground/70 hover:bg-secondary/50'
                  }`}
                  onClick={() => setDepartmentFilter('all')}
                >
                  <span className="flex items-center gap-2">
                    <Users className="size-3.5" strokeWidth={1.5} />
                    All Contacts
                  </span>
                  <span className="text-[10px] font-semibold text-muted-foreground">{totalEmployees}</span>
                </button>
                {Object.entries(departmentStats).map(([dept, stats]) => {
                  const colors = getDeptInitialsColor(dept)
                  return (
                    <button
                      key={dept}
                      className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[13px] font-medium cursor-pointer ${
                        departmentFilter === dept
                          ? `${colors.bg} ${colors.text}`
                          : 'text-foreground/70 hover:bg-secondary/50'
                      }`}
                      onClick={() => setDepartmentFilter(dept === departmentFilter ? 'all' : dept)}
                    >
                      <span className="flex items-center gap-2">
                        <Briefcase className="size-3.5" strokeWidth={1.5} />
                        {dept}
                      </span>
                      <span className="text-[10px] font-semibold text-muted-foreground">{stats.active}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </MacosCard>
        </div>

        {/* Right: Contact List */}
        <div className="flex-1 min-w-0">
          <MacosCard noPadding>
            {/* Search + Filter Bar */}
            <div className="p-3 border-b border-border/50">
              <div className="flex items-center gap-3">
                <MacosSearch
                  value={search}
                  onChange={setSearch}
                  placeholder="Search employees..."
                  className="flex-1"
                />
                <MacosFilterBar
                  items={statusFilterItems}
                  activeId={statusFilter}
                  onChange={(id) => setStatusFilter(id as 'all' | 'active' | 'inactive')}
                />
              </div>
              {/* Mobile department pills */}
              <div className="flex flex-wrap gap-1.5 mt-2 md:hidden">
                <button
                  className={`rounded-md px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase cursor-pointer ${
                    departmentFilter === 'all'
                      ? 'macos-badge bg-macos-blue/10 text-macos-blue'
                      : 'macos-badge bg-secondary/50 text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setDepartmentFilter('all')}
                >
                  All
                </button>
                {Object.entries(departmentStats).map(([dept, stats]) => (
                  <button
                    key={dept}
                    className={`rounded-md px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase cursor-pointer ${
                      departmentFilter === dept
                        ? `macos-badge ${getDeptInitialsColor(dept).bg} ${getDeptInitialsColor(dept).text}`
                        : 'macos-badge bg-secondary/50 text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setDepartmentFilter(dept === departmentFilter ? 'all' : dept)}
                  >
                    {dept} ({stats.active})
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Cards List */}
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredEmployees.length === 0 ? (
              <MacosEmptyState
                icon={Contact}
                title="No contacts found"
                description="Try adjusting your search or filters"
              />
            ) : (
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                <div className="divide-y divide-border/30">
                  {filteredEmployees.map((employee) => {
                    const deptColors = getDeptInitialsColor(employee.department || '')
                    return (
                      <div
                        key={employee.id}
                        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer macos-table-row group"
                        onClick={() => setSelectedEmployee(employee)}
                      >
                        {/* Avatar */}
                        <Avatar className="size-9 ring-1 ring-border/30">
                          <AvatarFallback className={`${deptColors.bg} ${deptColors.text} text-[11px] font-semibold`}>
                            {employee.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        {/* Name & Email */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-[13px] font-medium truncate">{employee.name}</p>
                            <div className={`size-1.5 rounded-full shrink-0 ${employee.isActive ? 'bg-macos-green' : 'bg-macos-red'}`} />
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">{employee.email}</p>
                        </div>

                        {/* Department Badge */}
                        <MacosBadge variant={getDeptBadgeVariant(employee.department || '')}>
                          {employee.department || '—'}
                        </MacosBadge>

                        {/* Position */}
                        <span className="text-[13px] text-muted-foreground truncate max-w-[120px] hidden lg:block">
                          {employee.position || '—'}
                        </span>

                        {/* Chevron */}
                        <ChevronRight className="size-3.5 text-muted-foreground/50 shrink-0 group-hover:text-muted-foreground" strokeWidth={1.5} />

                        {/* Actions (shown on hover, hidden for view-only) */}
                        {!isViewOnly && (
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                            <MacosButton
                              variant="ghost"
                              icon={Pencil}
                              onClick={() => setEditEmployee(employee)}
                              className="h-7 w-7 p-0 text-macos-blue hover:text-macos-blue hover:bg-macos-blue/10 rounded-lg"
                            />
                            <MacosButton
                              variant="ghost"
                              icon={Trash2}
                              onClick={() => handleDelete(employee.id)}
                              className="h-7 w-7 p-0 text-macos-red hover:text-macos-red hover:bg-macos-red/10 rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Footer count */}
            <div className="px-4 py-2 border-t border-border/30">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                {filteredEmployees.length} contact{filteredEmployees.length !== 1 ? 's' : ''}
                {departmentFilter !== 'all' ? ` in ${departmentFilter}` : ''}
              </p>
            </div>
          </MacosCard>
        </div>
      </div>

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
    <MacosDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add Employee"
      description="Register a new team member"
      footer={
        <>
          <MacosButton variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </MacosButton>
          <MacosButton
            variant="primary"
            onClick={handleSubmit as any}
            disabled={saving || !form.name.trim() || !form.email.trim()}
          >
            {saving ? 'Saving...' : 'Add Employee'}
          </MacosButton>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <MacosFormField label="Full Name *">
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="John Smith"
            className="macos-search rounded-lg text-[13px] h-8 border-0"
            required
          />
        </MacosFormField>
        <div className="grid grid-cols-2 gap-3">
          <MacosFormField label="Email *">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="john@bookflow.com"
              className="macos-search rounded-lg text-[13px] h-8 border-0"
              required
            />
          </MacosFormField>
          <MacosFormField label="Phone">
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+1-555-0100"
              className="macos-search rounded-lg text-[13px] h-8 border-0"
            />
          </MacosFormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MacosFormField label="Department">
            <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
              <SelectTrigger className="macos-search rounded-lg text-[13px] h-8 border-0">
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
          </MacosFormField>
          <MacosFormField label="Position">
            <Input
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              placeholder="Sales Manager"
              className="macos-search rounded-lg text-[13px] h-8 border-0"
            />
          </MacosFormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MacosFormField label="Monthly Salary ($)">
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.salary}
              onChange={(e) => setForm({ ...form, salary: e.target.value })}
              placeholder="5000"
              className="macos-search rounded-lg text-[13px] h-8 border-0"
            />
          </MacosFormField>
          <MacosFormField label="Hire Date">
            <Input
              type="date"
              value={form.hireDate}
              onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
              className="macos-search rounded-lg text-[13px] h-8 border-0"
            />
          </MacosFormField>
        </div>
        <MacosFormField label="Branch">
          <Select value={form.branchId} onValueChange={(v) => setForm({ ...form, branchId: v })}>
            <SelectTrigger className="macos-search rounded-lg text-[13px] h-8 border-0">
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
        </MacosFormField>
      </form>
    </MacosDialog>
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
    <MacosDialog
      open={!!employee}
      onOpenChange={onOpenChange}
      title="Edit Employee"
      description="Update employee information"
      footer={
        <>
          <MacosButton variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </MacosButton>
          <MacosButton variant="primary" onClick={handleSubmit as any} disabled={saving}>
            {saving ? 'Saving...' : 'Update Employee'}
          </MacosButton>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <MacosFormField label="Full Name *">
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="macos-search rounded-lg text-[13px] h-8 border-0"
            required
          />
        </MacosFormField>
        <div className="grid grid-cols-2 gap-3">
          <MacosFormField label="Email *">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="macos-search rounded-lg text-[13px] h-8 border-0"
              required
            />
          </MacosFormField>
          <MacosFormField label="Phone">
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="macos-search rounded-lg text-[13px] h-8 border-0"
            />
          </MacosFormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MacosFormField label="Department">
            <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
              <SelectTrigger className="macos-search rounded-lg text-[13px] h-8 border-0">
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
          </MacosFormField>
          <MacosFormField label="Position">
            <Input
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              className="macos-search rounded-lg text-[13px] h-8 border-0"
            />
          </MacosFormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MacosFormField label="Monthly Salary ($)">
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.salary}
              onChange={(e) => setForm({ ...form, salary: e.target.value })}
              className="macos-search rounded-lg text-[13px] h-8 border-0"
            />
          </MacosFormField>
          <MacosFormField label="Hire Date">
            <Input
              type="date"
              value={form.hireDate}
              onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
              className="macos-search rounded-lg text-[13px] h-8 border-0"
            />
          </MacosFormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MacosFormField label="Branch">
            <Select value={form.branchId} onValueChange={(v) => setForm({ ...form, branchId: v })}>
              <SelectTrigger className="macos-search rounded-lg text-[13px] h-8 border-0">
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
          </MacosFormField>
          <MacosFormField label="Status">
            <Select value={form.isActive ? 'active' : 'inactive'} onValueChange={(v) => setForm({ ...form, isActive: v === 'active' })}>
              <SelectTrigger className="macos-search rounded-lg text-[13px] h-8 border-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </MacosFormField>
        </div>
      </form>
    </MacosDialog>
  )
}

// ==================== EMPLOYEE DETAIL DIALOG (macOS Contacts Card) ====================

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
    <MacosDialog
      open={!!employee}
      onOpenChange={onOpenChange}
      title=""
    >
      {/* Custom header with avatar */}
      <div className="flex items-center gap-4 -mt-2 mb-2">
        <Avatar className="size-12 ring-1 ring-border/30">
          <AvatarFallback className={`${deptColors.bg} ${deptColors.text} font-semibold text-sm`}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-[15px] font-semibold tracking-[-0.02em]">{employee.name}</p>
          <p className="text-[12px] font-normal text-muted-foreground">{employee.position || 'No position assigned'}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Contact Info */}
        <div className="macos-card p-4 space-y-3">
          <h4 className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Contact Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2.5 text-[13px]">
              <div className="size-7 rounded-lg bg-macos-blue/10 flex items-center justify-center shrink-0">
                <Mail className="size-3.5 text-macos-blue" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Email</p>
                <p className="truncate">{employee.email}</p>
              </div>
            </div>
            {employee.phone && (
              <div className="flex items-center gap-2.5 text-[13px]">
                <div className="size-7 rounded-lg bg-macos-green/10 flex items-center justify-center shrink-0">
                  <Phone className="size-3.5 text-macos-green" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Phone</p>
                  <p>{employee.phone}</p>
                </div>
              </div>
            )}
            {employee.department && (
              <div className="flex items-center gap-2.5 text-[13px]">
                <div className="size-7 rounded-lg bg-macos-purple/10 flex items-center justify-center shrink-0">
                  <Briefcase className="size-3.5 text-macos-purple" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Department</p>
                  <MacosBadge variant={getDeptBadgeVariant(employee.department)}>
                    {employee.department}
                  </MacosBadge>
                </div>
              </div>
            )}
            {employee.branch && (
              <div className="flex items-center gap-2.5 text-[13px]">
                <div className="size-7 rounded-lg bg-gg-bay/10 flex items-center justify-center shrink-0">
                  <Building2 className="size-3.5 text-gg-bay" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Branch</p>
                  <p>{employee.branch.name}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Employment Details */}
        <div className="macos-card p-4 space-y-3">
          <h4 className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Employment</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-gg-golden/10">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Monthly Salary</p>
              <p className="text-[22px] font-bold tracking-[-0.03em] text-gg-golden">${employee.salary.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-macos-blue/10">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Sales Recorded</p>
              <p className="text-[22px] font-bold tracking-[-0.03em] text-macos-blue">{employee._count?.sales || 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {employee.hireDate && (
              <div className="flex items-center gap-1.5 text-[13px]">
                <Clock className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                <span className="text-muted-foreground">Hired {new Date(employee.hireDate).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <div className={`size-2 rounded-full ${employee.isActive ? 'bg-macos-green' : 'bg-macos-red'}`} />
              <span className="text-[13px] font-medium">{employee.isActive ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        </div>

        {/* Activity */}
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
    </MacosDialog>
  )
}
