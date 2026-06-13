'use client'

import * as React from 'react'
import {
  Printer,
  Plus,
  FileText,
  BookOpen,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Clock,
  Package,
  DollarSign,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
interface Manuscript {
  id: string
  title: string
  author: string | null
  status: string
  submittedAt: string
  reviewedAt: string | null
  publishedAt: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

interface PrintOrder {
  id: string
  bookId: string | null
  quantity: number
  status: string
  costPerUnit: number
  totalCost: number
  notes: string | null
  createdAt: string
  updatedAt: string
  book?: { id: string; title: string; isbn: string | null } | null
}

interface BookOption {
  id: string
  title: string
  isbn: string | null
}

const manuscriptStatusColors: Record<string, string> = {
  submitted: 'bg-macos-orange/10 text-macos-orange',
  reviewed: 'bg-macos-blue/10 text-macos-blue',
  approved: 'bg-macos-green/10 text-macos-green',
  published: 'bg-macos-purple/10 text-macos-purple',
  rejected: 'bg-macos-red/10 text-macos-red',
}

const printStatusColors: Record<string, string> = {
  ordered: 'bg-macos-orange/10 text-macos-orange',
  printing: 'bg-macos-blue/10 text-macos-blue',
  completed: 'bg-macos-green/10 text-macos-green',
}

const statusWorkflow = ['submitted', 'reviewed', 'approved', 'published']
const rejectionStates = ['rejected']

function getNextStatus(current: string): string[] {
  if (current === 'rejected') return []
  const idx = statusWorkflow.indexOf(current)
  if (idx === -1) return []
  if (idx === statusWorkflow.length - 1) return []
  return [statusWorkflow[idx + 1]]
}

export function PublishingModule() {
  const { toast } = useToast()
  const [manuscripts, setManuscripts] = React.useState<Manuscript[]>([])
  const [printOrders, setPrintOrders] = React.useState<PrintOrder[]>([])
  const [books, setBooks] = React.useState<BookOption[]>([])
  const [loading, setLoading] = React.useState(true)
  const [manuscriptDialogOpen, setManuscriptDialogOpen] = React.useState(false)
  const [printOrderDialogOpen, setPrintOrderDialogOpen] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState('manuscripts')

  const [msForm, setMsForm] = React.useState({ title: '', author: '', notes: '' })
  const [poForm, setPoForm] = React.useState({ bookId: '', quantity: '', costPerUnit: '' })

  const fetchManuscripts = React.useCallback(async () => {
    try {
      const res = await fetch('/api/publishing?type=manuscripts')
      if (!res.ok) throw new Error('Failed to fetch manuscripts')
      const json = await res.json()
      setManuscripts(json.data || [])
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch manuscripts', variant: 'destructive' })
    }
  }, [toast])

  const fetchPrintOrders = React.useCallback(async () => {
    try {
      const res = await fetch('/api/publishing?type=print-orders')
      if (!res.ok) throw new Error('Failed to fetch print orders')
      const json = await res.json()
      setPrintOrders(json.data || [])
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch print orders', variant: 'destructive' })
    }
  }, [toast])

  const fetchBooks = React.useCallback(async () => {
    try {
      const res = await fetch('/api/books')
      if (!res.ok) throw new Error('Failed to fetch books')
      const json = await res.json()
      setBooks(json.data || [])
    } catch {
      // Silently fail
    }
  }, [])

  React.useEffect(() => {
    const loadAll = async () => {
      setLoading(true)
      await Promise.all([fetchManuscripts(), fetchPrintOrders(), fetchBooks()])
      setLoading(false)
    }
    loadAll()
  }, [fetchManuscripts, fetchPrintOrders, fetchBooks])

  const handleSubmitManuscript = async () => {
    if (!msForm.title) {
      toast({ title: 'Validation Error', description: 'Title is required', variant: 'destructive' })
      return
    }
    try {
      setSubmitting(true)
      const res = await fetch('/api/publishing?type=manuscripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msForm),
      })
      if (!res.ok) throw new Error('Failed to submit manuscript')
      toast({ title: 'Success', description: 'Manuscript submitted successfully' })
      setManuscriptDialogOpen(false)
      setMsForm({ title: '', author: '', notes: '' })
      fetchManuscripts()
    } catch {
      toast({ title: 'Error', description: 'Failed to submit manuscript', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreatePrintOrder = async () => {
    if (!poForm.bookId || !poForm.quantity) {
      toast({ title: 'Validation Error', description: 'Book and quantity are required', variant: 'destructive' })
      return
    }
    try {
      setSubmitting(true)
      const res = await fetch('/api/publishing?type=print-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: poForm.bookId,
          quantity: parseInt(poForm.quantity),
          costPerUnit: parseFloat(poForm.costPerUnit) || 0,
        }),
      })
      if (!res.ok) throw new Error('Failed to create print order')
      toast({ title: 'Success', description: 'Print order created successfully' })
      setPrintOrderDialogOpen(false)
      setPoForm({ bookId: '', quantity: '', costPerUnit: '' })
      fetchPrintOrders()
    } catch {
      toast({ title: 'Error', description: 'Failed to create print order', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleManuscriptStatus = async (manuscript: Manuscript, newStatus: string) => {
    try {
      const res = await fetch('/api/publishing?type=manuscripts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: manuscript.id, status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      toast({ title: 'Success', description: `Manuscript status updated to ${newStatus}` })
      fetchManuscripts()
    } catch {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' })
    }
  }

  const handlePrintOrderStatus = async (order: PrintOrder, newStatus: string) => {
    try {
      const res = await fetch('/api/publishing?type=print-orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      toast({ title: 'Success', description: `Print order status updated to ${newStatus}` })
      fetchPrintOrders()
    } catch {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' })
    }
  }

  const msByStatus = manuscripts.reduce<Record<string, number>>((acc, m) => {
    acc[m.status] = (acc[m.status] || 0) + 1
    return acc
  }, {})

  const totalPrintCost = printOrders.reduce((sum, o) => sum + o.totalCost, 0)

  const tabs = [
    { id: 'manuscripts', label: 'Manuscripts' },
    { id: 'print-orders', label: 'Print Orders' },
  ]

  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl macos-shadow p-4 bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Manuscripts</p>
              <p className="text-2xl font-bold tracking-tight">{manuscripts.length}</p>
            </div>
            <div className="rounded-lg bg-macos-blue/10 p-2.5">
              <FileText className="size-5 text-macos-blue" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl macos-shadow p-4 bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Submitted</p>
              <p className="text-2xl font-bold tracking-tight">{msByStatus['submitted'] || 0}</p>
            </div>
            <div className="rounded-lg bg-macos-orange/10 p-2.5">
              <Clock className="size-5 text-macos-orange" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl macos-shadow p-4 bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Published</p>
              <p className="text-2xl font-bold tracking-tight">{msByStatus['published'] || 0}</p>
            </div>
            <div className="rounded-lg bg-macos-purple/10 p-2.5">
              <BookOpen className="size-5 text-macos-purple" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl macos-shadow p-4 bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Print Orders</p>
              <p className="text-2xl font-bold tracking-tight">{printOrders.length}</p>
            </div>
            <div className="rounded-lg bg-macos-teal/10 p-2.5">
              <Printer className="size-5 text-macos-teal" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl macos-shadow p-4 bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Print Cost</p>
              <p className="text-2xl font-bold tracking-tight">${totalPrintCost.toLocaleString()}</p>
            </div>
            <div className="rounded-lg bg-macos-green/10 p-2.5">
              <DollarSign className="size-5 text-macos-green" />
            </div>
          </div>
        </div>
      </div>

      {/* Header + Segmented Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Publishing</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">Manage manuscripts, reviews, and print production</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="macos-segmented inline-flex p-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1 text-[12px] font-medium rounded-md transition-colors ${
                  activeTab === tab.id ? 'macos-segmented-active' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <Button
            onClick={() => setManuscriptDialogOpen(true)}
            className="bg-secondary text-secondary-foreground rounded-lg font-medium text-[13px]"
          >
            <Plus className="size-3.5 mr-1.5" strokeWidth={2} />
            Submit Manuscript
          </Button>
          <Button
            onClick={() => setPrintOrderDialogOpen(true)}
            className="bg-primary text-primary-foreground rounded-lg font-medium text-[13px]"
          >
            <Plus className="size-3.5 mr-1.5" strokeWidth={2} />
            Print Order
          </Button>
        </div>
      </div>

      {/* Manuscripts Tab */}
      {activeTab === 'manuscripts' && (
        <div>
          {loading ? (
            <div className="rounded-2xl macos-shadow p-8 bg-card text-center text-muted-foreground animate-pulse text-[13px]">
              Loading manuscripts...
            </div>
          ) : manuscripts.length === 0 ? (
            <div className="rounded-2xl macos-shadow p-5 bg-card text-center py-16">
              <FileText className="size-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold tracking-tight mb-1">No manuscripts yet</h3>
              <p className="text-[13px] text-muted-foreground">Submit your first manuscript to get started</p>
            </div>
          ) : (
            <div className="rounded-2xl macos-shadow bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Title</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Author</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Submitted</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {manuscripts.map((ms) => {
                    const nextStatuses = getNextStatus(ms.status)
                    return (
                      <TableRow key={ms.id} className="hover:bg-secondary/50">
                        <TableCell className="text-[13px] font-medium max-w-[200px] truncate">{ms.title}</TableCell>
                        <TableCell className="text-[13px] text-muted-foreground">{ms.author || '—'}</TableCell>
                        <TableCell>
                          <Badge className={`rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 ${manuscriptStatusColors[ms.status] || ''}`}>
                            {ms.status.charAt(0).toUpperCase() + ms.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[13px] text-muted-foreground">
                          {new Date(ms.submittedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {nextStatuses.map((ns) => (
                              <Button
                                key={ns}
                                size="sm"
                                variant="outline"
                                className="h-7 text-[11px] rounded-md font-medium px-2"
                                onClick={() => handleManuscriptStatus(ms, ns)}
                              >
                                <ArrowRight className="size-3 mr-1" />
                                {ns.charAt(0).toUpperCase() + ns.slice(1)}
                              </Button>
                            ))}
                            {!rejectionStates.includes(ms.status) && ms.status !== 'published' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[11px] rounded-md font-medium px-2 text-macos-red border-macos-red/20 hover:bg-macos-red/10"
                                onClick={() => handleManuscriptStatus(ms, 'rejected')}
                              >
                                <XCircle className="size-3 mr-1" />
                                Reject
                              </Button>
                            )}
                            {ms.status === 'published' && (
                              <CheckCircle2 className="size-4 text-macos-green" />
                            )}
                            {ms.status === 'rejected' && (
                              <XCircle className="size-4 text-macos-red" />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* Print Orders Tab */}
      {activeTab === 'print-orders' && (
        <div>
          {loading ? (
            <div className="rounded-2xl macos-shadow p-8 bg-card text-center text-muted-foreground animate-pulse text-[13px]">
              Loading print orders...
            </div>
          ) : printOrders.length === 0 ? (
            <div className="rounded-2xl macos-shadow p-5 bg-card text-center py-16">
              <Printer className="size-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold tracking-tight mb-1">No print orders yet</h3>
              <p className="text-[13px] text-muted-foreground">Create a print order for a published book</p>
            </div>
          ) : (
            <div className="rounded-2xl macos-shadow bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Book</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Quantity</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Cost/Unit</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Total Cost</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {printOrders.map((po) => (
                    <TableRow key={po.id} className="hover:bg-secondary/50">
                      <TableCell className="text-[13px] font-medium">
                        {po.book?.title || 'Unknown Book'}
                      </TableCell>
                      <TableCell className="text-[13px]">{po.quantity.toLocaleString()}</TableCell>
                      <TableCell className="text-[13px]">${po.costPerUnit.toFixed(2)}</TableCell>
                      <TableCell className="text-[13px] font-medium">${po.totalCost.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={`rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 ${printStatusColors[po.status] || ''}`}>
                          {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {po.status === 'ordered' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[11px] rounded-md font-medium px-2"
                              onClick={() => handlePrintOrderStatus(po, 'printing')}
                            >
                              <ArrowRight className="size-3 mr-1" />
                              Start Printing
                            </Button>
                          )}
                          {po.status === 'printing' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[11px] rounded-md font-medium px-2 text-macos-green border-macos-green/20 hover:bg-macos-green/10"
                              onClick={() => handlePrintOrderStatus(po, 'completed')}
                            >
                              <CheckCircle2 className="size-3 mr-1" />
                              Complete
                            </Button>
                          )}
                          {po.status === 'completed' && (
                            <Badge className="rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 bg-macos-green/10 text-macos-green">
                              <CheckCircle2 className="size-3 mr-1" />
                              Done
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* Submit Manuscript Dialog */}
      <Dialog open={manuscriptDialogOpen} onOpenChange={setManuscriptDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[13px] font-semibold tracking-tight">Submit Manuscript</DialogTitle>
            <DialogDescription className="text-[13px]">Submit a new manuscript for review and publishing</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ms-title" className="text-[11px] font-semibold tracking-wide text-muted-foreground">Title *</Label>
              <Input
                id="ms-title"
                placeholder="The Great Adventure"
                value={msForm.title}
                onChange={(e) => setMsForm((prev) => ({ ...prev, title: e.target.value }))}
                className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ms-author" className="text-[11px] font-semibold tracking-wide text-muted-foreground">Author</Label>
              <Input
                id="ms-author"
                placeholder="Jane Doe"
                value={msForm.author}
                onChange={(e) => setMsForm((prev) => ({ ...prev, author: e.target.value }))}
                className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ms-notes" className="text-[11px] font-semibold tracking-wide text-muted-foreground">Notes</Label>
              <Textarea
                id="ms-notes"
                placeholder="Additional notes about this manuscript..."
                value={msForm.notes}
                onChange={(e) => setMsForm((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="rounded-lg bg-secondary/80 border-0 text-[13px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setManuscriptDialogOpen(false)} className="bg-secondary text-secondary-foreground rounded-lg font-medium text-[13px]">Cancel</Button>
            <Button onClick={handleSubmitManuscript} disabled={submitting} className="bg-primary text-primary-foreground rounded-lg font-medium text-[13px]">
              {submitting ? 'Submitting...' : 'Submit Manuscript'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Print Order Dialog */}
      <Dialog open={printOrderDialogOpen} onOpenChange={setPrintOrderDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[13px] font-semibold tracking-tight">Create Print Order</DialogTitle>
            <DialogDescription className="text-[13px]">Order a print run for a published book</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="po-book" className="text-[11px] font-semibold tracking-wide text-muted-foreground">Book *</Label>
              <Select
                value={poForm.bookId}
                onValueChange={(v) => setPoForm((prev) => ({ ...prev, bookId: v }))}
              >
                <SelectTrigger id="po-book" className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8">
                  <SelectValue placeholder="Select a book" />
                </SelectTrigger>
                <SelectContent>
                  {books.map((book) => (
                    <SelectItem key={book.id} value={book.id}>
                      {book.title}{book.isbn ? ` (${book.isbn})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="po-qty" className="text-[11px] font-semibold tracking-wide text-muted-foreground">Quantity *</Label>
                <Input
                  id="po-qty"
                  type="number"
                  placeholder="500"
                  value={poForm.quantity}
                  onChange={(e) => setPoForm((prev) => ({ ...prev, quantity: e.target.value }))}
                  className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="po-cost" className="text-[11px] font-semibold tracking-wide text-muted-foreground">Cost Per Unit</Label>
                <Input
                  id="po-cost"
                  type="number"
                  step="0.01"
                  placeholder="2.50"
                  value={poForm.costPerUnit}
                  onChange={(e) => setPoForm((prev) => ({ ...prev, costPerUnit: e.target.value }))}
                  className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8"
                />
              </div>
            </div>
            {poForm.quantity && poForm.costPerUnit && (
              <div className="rounded-xl bg-secondary/50 p-3 text-[13px]">
                <span className="text-muted-foreground">Total Cost: </span>
                <span className="font-bold text-macos-green">
                  ${(parseInt(poForm.quantity) * parseFloat(poForm.costPerUnit)).toLocaleString()}
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPrintOrderDialogOpen(false)} className="bg-secondary text-secondary-foreground rounded-lg font-medium text-[13px]">Cancel</Button>
            <Button onClick={handleCreatePrintOrder} disabled={submitting} className="bg-primary text-primary-foreground rounded-lg font-medium text-[13px]">
              {submitting ? 'Creating...' : 'Create Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
