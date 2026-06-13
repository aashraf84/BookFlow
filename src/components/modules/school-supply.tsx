'use client'

import * as React from 'react'
import {
  GraduationCap,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  User,
  Calendar,
  FileText,
  Package,
  BookOpen,
  PencilRuler,
  Trash2,
  ChevronRight,
  X,
  DollarSign,
  Eye,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// ==================== TYPES ====================

interface School {
  id: string
  name: string
  address?: string | null
  phone?: string | null
  email?: string | null
  contactPerson?: string | null
  academicSession?: string | null
  isActive: boolean
  createdAt: string
  customer?: { id: string; name: string } | null
  _count?: { contracts: number; packages: number }
}

interface SchoolContract {
  id: string
  schoolId: string
  title: string
  academicSession?: string | null
  totalValue: number
  status: string
  startDate?: string | null
  endDate?: string | null
  notes?: string | null
  createdAt: string
  school?: { id: string; name: string }
}

interface AcademicPackage {
  id: string
  name: string
  schoolId?: string | null
  grade?: string | null
  academicLevel?: string | null
  description?: string | null
  totalPrice: number
  discount: number
  isActive: boolean
  createdAt: string
  school?: { id: string; name: string } | null
  items: AcademicPackageItem[]
}

interface AcademicPackageItem {
  id: string
  bookId?: string | null
  stationeryId?: string | null
  quantity: number
  unitPrice: number
  book?: { id: string; title: string } | null
  stationery?: { id: string; name: string } | null
}

interface Book {
  id: string
  title: string
  price: number
}

interface StationeryProduct {
  id: string
  name: string
  price: number
}

// ==================== SCHOOL SUPPLY MODULE ====================

export function SchoolSupplyModule() {
  const [activeTab, setActiveTab] = React.useState('schools')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-950/40">
          <GraduationCap className="size-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">School Supply</h2>
          <p className="text-sm text-muted-foreground">
            Manage schools, contracts, and academic packages
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="schools" className="gap-1.5">
            <GraduationCap className="size-3.5" />
            <span className="hidden sm:inline">Schools</span>
          </TabsTrigger>
          <TabsTrigger value="contracts" className="gap-1.5">
            <FileText className="size-3.5" />
            <span className="hidden sm:inline">Contracts</span>
          </TabsTrigger>
          <TabsTrigger value="packages" className="gap-1.5">
            <Package className="size-3.5" />
            <span className="hidden sm:inline">Packages</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schools" className="mt-4">
          <SchoolsTab />
        </TabsContent>
        <TabsContent value="contracts" className="mt-4">
          <ContractsTab />
        </TabsContent>
        <TabsContent value="packages" className="mt-4">
          <PackagesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ==================== SCHOOLS TAB ====================

function SchoolsTab() {
  const [schools, setSchools] = React.useState<School[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [showAddDialog, setShowAddDialog] = React.useState(false)
  const [selectedSchool, setSelectedSchool] = React.useState<School | null>(null)

  const fetchSchools = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/schools?search=${encodeURIComponent(search)}&limit=50`)
      const json = await res.json()
      if (json.data) setSchools(json.data)
    } catch (err) {
      console.error('Failed to fetch schools:', err)
    } finally {
      setLoading(false)
    }
  }, [search])

  React.useEffect(() => {
    fetchSchools()
  }, [fetchSchools])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this school?')) return
    try {
      await fetch(`/api/schools?id=${id}`, { method: 'DELETE' })
      fetchSchools()
    } catch (err) {
      console.error('Failed to delete school:', err)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search schools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="size-4" /> Add School
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-2/3 mb-3" />
                <div className="h-3 bg-muted rounded w-1/2 mb-2" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : schools.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <GraduationCap className="size-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No schools found</p>
            <p className="text-sm text-muted-foreground">Add your first school to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schools.map((school) => (
            <Card
              key={school.id}
              className="hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => setSelectedSchool(school)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-emerald-100 p-1.5 dark:bg-emerald-950/40">
                      <GraduationCap className="size-4 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm leading-tight">{school.name}</h3>
                      {school.academicSession && (
                        <p className="text-xs text-muted-foreground">{school.academicSession}</p>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={school.isActive ? 'default' : 'secondary'}
                    className={
                      school.isActive
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px]'
                        : 'text-[10px]'
                    }
                  >
                    {school.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  {school.address && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="size-3 shrink-0" />
                      <span className="truncate">{school.address}</span>
                    </div>
                  )}
                  {school.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="size-3 shrink-0" />
                      {school.phone}
                    </div>
                  )}
                  {school.contactPerson && (
                    <div className="flex items-center gap-1.5">
                      <User className="size-3 shrink-0" />
                      {school.contactPerson}
                    </div>
                  )}
                </div>
                <Separator className="my-3" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {school._count?.contracts || 0} contracts
                  </span>
                  <span className="text-muted-foreground">
                    {school._count?.packages || 0} packages
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(school.id)
                    }}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddSchoolDialog open={showAddDialog} onOpenChange={setShowAddDialog} onSuccess={fetchSchools} />
      <SchoolDetailDialog school={selectedSchool} onOpenChange={(open) => !open && setSelectedSchool(null)} onSuccess={fetchSchools} />
    </div>
  )
}

// ==================== CONTRACTS TAB ====================

function ContractsTab() {
  const [contracts, setContracts] = React.useState<SchoolContract[]>([])
  const [schools, setSchools] = React.useState<School[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showCreateDialog, setShowCreateDialog] = React.useState(false)

  const fetchContracts = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/schools/contracts')
      if (res.ok) {
        const json = await res.json()
        if (json.data) setContracts(json.data)
      } else {
        // Fallback: fetch schools with contracts
        const schoolRes = await fetch('/api/schools?limit=50')
        const schoolJson = await schoolRes.json()
        if (schoolJson.data) {
          const allContracts: SchoolContract[] = []
          schoolJson.data.forEach((s: School & { contracts?: SchoolContract[] }) => {
            if (s.contracts) {
              s.contracts.forEach((c) => allContracts.push({ ...c, school: { id: s.id, name: s.name } }))
            }
          })
          setContracts(allContracts)
        }
      }
    } catch (err) {
      console.error('Failed to fetch contracts:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchSchools = React.useCallback(async () => {
    try {
      const res = await fetch('/api/schools?limit=50')
      const json = await res.json()
      if (json.data) setSchools(json.data)
    } catch (err) {
      console.error('Failed to fetch schools:', err)
    }
  }, [])

  React.useEffect(() => {
    fetchContracts()
    fetchSchools()
  }, [fetchContracts, fetchSchools])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
      case 'expired':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{contracts.length} contracts</p>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="size-4" /> Create Contract
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : contracts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="size-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No contracts found</p>
            <p className="text-sm text-muted-foreground">Create your first school contract</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Period</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.title}</TableCell>
                      <TableCell>{contract.school?.name || '—'}</TableCell>
                      <TableCell>{contract.academicSession || '—'}</TableCell>
                      <TableCell>${contract.totalValue.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] ${getStatusColor(contract.status)}`}>
                          {contract.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {contract.startDate
                          ? `${new Date(contract.startDate).toLocaleDateString()} - ${contract.endDate ? new Date(contract.endDate).toLocaleDateString() : '...'}`
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <CreateContractDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        schools={schools}
        onSuccess={fetchContracts}
      />
    </div>
  )
}

// ==================== PACKAGES TAB ====================

function PackagesTab() {
  const [packages, setPackages] = React.useState<AcademicPackage[]>([])
  const [schools, setSchools] = React.useState<School[]>([])
  const [books, setBooks] = React.useState<Book[]>([])
  const [stationery, setStationery] = React.useState<StationeryProduct[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showCreateDialog, setShowCreateDialog] = React.useState(false)
  const [selectedPackage, setSelectedPackage] = React.useState<AcademicPackage | null>(null)

  const fetchPackages = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/schools/packages')
      if (res.ok) {
        const json = await res.json()
        if (json.data) setPackages(json.data)
      } else {
        // Fallback: fetch schools with packages
        const schoolRes = await fetch('/api/schools?limit=50')
        const schoolJson = await schoolRes.json()
        if (schoolJson.data) {
          const allPackages: AcademicPackage[] = []
          schoolJson.data.forEach((s: School & { packages?: AcademicPackage[] }) => {
            if (s.packages) {
              s.packages.forEach((p) => allPackages.push({ ...p, school: { id: s.id, name: s.name } }))
            }
          })
          setPackages(allPackages)
        }
      }
    } catch (err) {
      console.error('Failed to fetch packages:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchReferenceData = React.useCallback(async () => {
    try {
      const [schoolsRes, booksRes, stationeryRes] = await Promise.all([
        fetch('/api/schools?limit=50'),
        fetch('/api/books?limit=100'),
        fetch('/api/stationery?limit=100'),
      ])
      const [schoolsJson, booksJson, stationeryJson] = await Promise.all([
        schoolsRes.json(),
        booksRes.json(),
        stationeryRes.json(),
      ])
      if (schoolsJson.data) setSchools(schoolsJson.data)
      if (booksJson.data) setBooks(booksJson.data)
      if (stationeryJson.data) setStationery(stationeryJson.data)
    } catch (err) {
      console.error('Failed to fetch reference data:', err)
    }
  }, [])

  React.useEffect(() => {
    fetchPackages()
    fetchReferenceData()
  }, [fetchPackages, fetchReferenceData])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{packages.length} academic packages</p>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="size-4" /> Create Package
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
      ) : packages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="size-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No packages found</p>
            <p className="text-sm text-muted-foreground">Create your first academic package</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedPackage(pkg)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-teal-100 p-1.5 dark:bg-teal-950/40">
                      <Package className="size-4 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{pkg.name}</h3>
                      {pkg.grade && (
                        <p className="text-xs text-muted-foreground">Grade: {pkg.grade}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">${pkg.totalPrice.toLocaleString()}</p>
                    {pkg.discount > 0 && (
                      <p className="text-xs text-muted-foreground">{pkg.discount}% off</p>
                    )}
                  </div>
                </div>
                {pkg.school && (
                  <p className="text-xs text-muted-foreground mb-2">
                    <GraduationCap className="size-3 inline mr-1" />
                    {pkg.school.name}
                  </p>
                )}
                {pkg.items && pkg.items.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {pkg.items.slice(0, 5).map((item) => (
                      <Badge key={item.id} variant="secondary" className="text-[10px]">
                        {item.book?.title || item.stationery?.name || 'Item'} x{item.quantity}
                      </Badge>
                    ))}
                    {pkg.items.length > 5 && (
                      <Badge variant="secondary" className="text-[10px]">
                        +{pkg.items.length - 5} more
                      </Badge>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between mt-3 pt-2 border-t">
                  <span className="text-xs text-muted-foreground">
                    {pkg.items?.length || 0} items
                  </span>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-teal-600">
                    <Eye className="size-3 mr-1" /> View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreatePackageDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        schools={schools}
        books={books}
        stationery={stationery}
        onSuccess={fetchPackages}
      />

      <PackageDetailDialog
        pkg={selectedPackage}
        onOpenChange={(open) => !open && setSelectedPackage(null)}
      />
    </div>
  )
}

// ==================== ADD SCHOOL DIALOG ====================

function AddSchoolDialog({
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
    address: '',
    phone: '',
    email: '',
    contactPerson: '',
    academicSession: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setForm({ name: '', address: '', phone: '', email: '', contactPerson: '', academicSession: '' })
        onOpenChange(false)
        onSuccess()
      } else {
        const json = await res.json()
        alert(json.error || 'Failed to create school')
      }
    } catch (err) {
      console.error('Failed to create school:', err)
      alert('Failed to create school')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add School</DialogTitle>
          <DialogDescription>Register a new school for supply programs</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="school-name">Name *</Label>
            <Input
              id="school-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Springfield Academy"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="school-address">Address</Label>
            <Input
              id="school-address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="123 Education Street"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="school-phone">Phone</Label>
              <Input
                id="school-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1-555-0100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school-email">Email</Label>
              <Input
                id="school-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="school@example.com"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="school-contact">Contact Person</Label>
              <Input
                id="school-contact"
                value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                placeholder="John Smith"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school-session">Academic Session</Label>
              <Input
                id="school-session"
                value={form.academicSession}
                onChange={(e) => setForm({ ...form, academicSession: e.target.value })}
                placeholder="2025-2026"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !form.name.trim()} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? 'Saving...' : 'Add School'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ==================== SCHOOL DETAIL DIALOG ====================

function SchoolDetailDialog({
  school,
  onOpenChange,
  onSuccess,
}: {
  school: School | null
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    contactPerson: '',
    academicSession: '',
  })

  React.useEffect(() => {
    if (school) {
      setForm({
        name: school.name || '',
        address: school.address || '',
        phone: school.phone || '',
        email: school.email || '',
        contactPerson: school.contactPerson || '',
        academicSession: school.academicSession || '',
      })
    }
  }, [school])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!school) return
    setSaving(true)
    try {
      const res = await fetch('/api/schools', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: school.id, ...form }),
      })
      if (res.ok) {
        onOpenChange(false)
        onSuccess()
      } else {
        const json = await res.json()
        alert(json.error || 'Failed to update school')
      }
    } catch (err) {
      console.error('Failed to update school:', err)
      alert('Failed to update school')
    } finally {
      setSaving(false)
    }
  }

  if (!school) return null

  return (
    <Dialog open={!!school} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit School</DialogTitle>
          <DialogDescription>Update school information</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Contact Person</Label>
              <Input
                value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Academic Session</Label>
              <Input
                value={form.academicSession}
                onChange={(e) => setForm({ ...form, academicSession: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? 'Saving...' : 'Update School'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ==================== CREATE CONTRACT DIALOG ====================

function CreateContractDialog({
  open,
  onOpenChange,
  schools,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  schools: School[]
  onSuccess: () => void
}) {
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState({
    schoolId: '',
    title: '',
    academicSession: '',
    totalValue: '',
    startDate: '',
    endDate: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.schoolId || !form.title.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/schools/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId: form.schoolId,
          title: form.title,
          academicSession: form.academicSession,
          totalValue: parseFloat(form.totalValue) || 0,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          notes: form.notes,
        }),
      })
      if (res.ok) {
        setForm({ schoolId: '', title: '', academicSession: '', totalValue: '', startDate: '', endDate: '', notes: '' })
        onOpenChange(false)
        onSuccess()
      } else {
        const json = await res.json()
        alert(json.error || 'Failed to create contract')
      }
    } catch (err) {
      console.error('Failed to create contract:', err)
      alert('Failed to create contract')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Contract</DialogTitle>
          <DialogDescription>Create a new school supply contract</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>School *</Label>
            <Select value={form.schoolId} onValueChange={(v) => setForm({ ...form, schoolId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select school" />
              </SelectTrigger>
              <SelectContent>
                {schools.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Contract Title *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Annual Supply Agreement"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Academic Session</Label>
              <Input
                value={form.academicSession}
                onChange={(e) => setForm({ ...form, academicSession: e.target.value })}
                placeholder="2025-2026"
              />
            </div>
            <div className="space-y-2">
              <Label>Total Value ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.totalValue}
                onChange={(e) => setForm({ ...form, totalValue: e.target.value })}
                placeholder="50000"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Additional contract details..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !form.schoolId || !form.title.trim()} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? 'Creating...' : 'Create Contract'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ==================== CREATE PACKAGE DIALOG ====================

interface PackageItemForm {
  key: string
  itemType: 'book' | 'stationery'
  itemId: string
  quantity: number
  unitPrice: number
  name: string
}

function CreatePackageDialog({
  open,
  onOpenChange,
  schools,
  books,
  stationery,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  schools: School[]
  books: Book[]
  stationery: StationeryProduct[]
  onSuccess: () => void
}) {
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState({
    schoolId: '',
    name: '',
    grade: '',
    academicLevel: '',
    description: '',
    discount: '',
  })
  const [items, setItems] = React.useState<PackageItemForm[]>([
    { key: crypto.randomUUID(), itemType: 'book', itemId: '', quantity: 1, unitPrice: 0, name: '' },
  ])

  const totalPrice = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  const addItem = () => {
    setItems([
      ...items,
      { key: crypto.randomUUID(), itemType: 'book', itemId: '', quantity: 1, unitPrice: 0, name: '' },
    ])
  }

  const removeItem = (key: string) => {
    if (items.length > 1) {
      setItems(items.filter((i) => i.key !== key))
    }
  }

  const updateItem = (key: string, updates: Partial<PackageItemForm>) => {
    setItems(
      items.map((item) => {
        if (item.key !== key) return item
        const updated = { ...item, ...updates }

        // Auto-fill price and name when selecting a book/stationery
        if (updates.itemId) {
          if (updated.itemType === 'book') {
            const book = books.find((b) => b.id === updates.itemId)
            if (book) {
              updated.unitPrice = book.price
              updated.name = book.title
            }
          } else {
            const product = stationery.find((s) => s.id === updates.itemId)
            if (product) {
              updated.unitPrice = product.price
              updated.name = product.name
            }
          }
        }

        return updated
      })
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/schools/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId: form.schoolId || null,
          name: form.name,
          grade: form.grade,
          academicLevel: form.academicLevel,
          description: form.description,
          totalPrice,
          discount: parseFloat(form.discount) || 0,
          items: items
            .filter((i) => i.itemId)
            .map((i) => ({
              bookId: i.itemType === 'book' ? i.itemId : null,
              stationeryId: i.itemType === 'stationery' ? i.itemId : null,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
            })),
        }),
      })
      if (res.ok) {
        setForm({ schoolId: '', name: '', grade: '', academicLevel: '', description: '', discount: '' })
        setItems([{ key: crypto.randomUUID(), itemType: 'book', itemId: '', quantity: 1, unitPrice: 0, name: '' }])
        onOpenChange(false)
        onSuccess()
      } else {
        const json = await res.json()
        alert(json.error || 'Failed to create package')
      }
    } catch (err) {
      console.error('Failed to create package:', err)
      alert('Failed to create package')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Academic Package</DialogTitle>
          <DialogDescription>Build a grade-wise package with books and stationery</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>School</Label>
              <Select value={form.schoolId} onValueChange={(v) => setForm({ ...form, schoolId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select school" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Package Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Grade 1 Package"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Grade</Label>
              <Input
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                placeholder="1"
              />
            </div>
            <div className="space-y-2">
              <Label>Academic Level</Label>
              <Input
                value={form.academicLevel}
                onChange={(e) => setForm({ ...form, academicLevel: e.target.value })}
                placeholder="Primary"
              />
            </div>
            <div className="space-y-2">
              <Label>Discount (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={form.discount}
                onChange={(e) => setForm({ ...form, discount: e.target.value })}
                placeholder="10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Package description..."
              rows={2}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Package Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1">
                <Plus className="size-3" /> Add Item
              </Button>
            </div>
            {items.map((item, idx) => (
              <div key={item.key} className="flex items-end gap-2 p-3 rounded-lg border bg-muted/30">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <Select
                    value={item.itemType}
                    onValueChange={(v: 'book' | 'stationery') =>
                      updateItem(item.key, { itemType: v, itemId: '', unitPrice: 0, name: '' })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="book">
                        <span className="flex items-center gap-1">
                          <BookOpen className="size-3" /> Book
                        </span>
                      </SelectItem>
                      <SelectItem value="stationery">
                        <span className="flex items-center gap-1">
                          <PencilRuler className="size-3" /> Stationery
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-[2] space-y-1">
                  <Label className="text-xs text-muted-foreground">Item</Label>
                  <Select value={item.itemId} onValueChange={(v) => updateItem(item.key, { itemId: v })}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder={`Select ${item.itemType}...`} />
                    </SelectTrigger>
                    <SelectContent>
                      {(item.itemType === 'book' ? books : stationery).map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name || b.title} — ${b.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-16 space-y-1">
                  <Label className="text-xs text-muted-foreground">Qty</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.key, { quantity: parseInt(e.target.value) || 1 })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="w-20 space-y-1">
                  <Label className="text-xs text-muted-foreground">Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(item.key, { unitPrice: parseFloat(e.target.value) || 0 })}
                    className="h-8 text-xs"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  onClick={() => removeItem(item.key)}
                  disabled={items.length <= 1}
                >
                  <X className="size-3" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <span className="text-sm font-medium">Total Package Price</span>
            <span className="text-lg font-bold text-emerald-600">${totalPrice.toLocaleString()}</span>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !form.name.trim()} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? 'Creating...' : 'Create Package'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ==================== PACKAGE DETAIL DIALOG ====================

function PackageDetailDialog({
  pkg,
  onOpenChange,
}: {
  pkg: AcademicPackage | null
  onOpenChange: (open: boolean) => void
}) {
  if (!pkg) return null

  return (
    <Dialog open={!!pkg} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="size-5 text-teal-600" />
            {pkg.name}
          </DialogTitle>
          <DialogDescription>
            {pkg.grade && `Grade ${pkg.grade}`}
            {pkg.academicLevel && ` • ${pkg.academicLevel}`}
            {pkg.school && ` • ${pkg.school.name}`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {pkg.description && (
            <p className="text-sm text-muted-foreground">{pkg.description}</p>
          )}

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Package Items</h4>
            <div className="space-y-2">
              {pkg.items && pkg.items.length > 0 ? (
                pkg.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      {item.bookId ? (
                        <div className="rounded p-1.5 bg-teal-100 dark:bg-teal-950/40">
                          <BookOpen className="size-4 text-teal-600" />
                        </div>
                      ) : (
                        <div className="rounded p-1.5 bg-amber-100 dark:bg-amber-950/40">
                          <PencilRuler className="size-4 text-amber-600" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {item.book?.title || item.stationery?.name || 'Unknown Item'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.bookId ? 'Book' : 'Stationery'} • Qty: {item.quantity} × ${item.unitPrice}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-sm">
                      ${(item.quantity * item.unitPrice).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No items in this package</p>
              )}
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Price</p>
              {pkg.discount > 0 && (
                <p className="text-xs text-emerald-600">{pkg.discount}% discount applied</p>
              )}
            </div>
            <p className="text-2xl font-bold text-emerald-600">${pkg.totalPrice.toLocaleString()}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
