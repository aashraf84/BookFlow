'use client'

import * as React from 'react'
import {
  Printer,
  Plus,
  FileText,
  BookOpen,
  CheckCircle2,
  XCircle,
  Eye,
  ArrowRight,
  Clock,
  Package,
  DollarSign,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  submitted: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  reviewed: 'bg-sky-100 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
  published: 'bg-teal-100 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400',
  rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400',
}

const printStatusColors: Record<string, string> = {
  ordered: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  printing: 'bg-sky-100 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
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

  // Manuscript form
  const [msForm, setMsForm] = React.useState({ title: '', author: '', notes: '' })
  // Print order form
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
      // Silently fail - books are optional for display
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

  // Summary metrics
  const msByStatus = manuscripts.reduce<Record<string, number>>((acc, m) => {
    acc[m.status] = (acc[m.status] || 0) + 1
    return acc
  }, {})

  const poByStatus = printOrders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {})

  const totalPrintCost = printOrders.reduce((sum, o) => sum + o.totalCost, 0)

  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Manuscripts</p>
                <p className="text-2xl font-bold">{manuscripts.length}</p>
              </div>
              <div className="rounded-lg bg-emerald-100 p-2.5 dark:bg-emerald-950/30">
                <FileText className="size-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="text-2xl font-bold">{msByStatus['submitted'] || 0}</p>
              </div>
              <div className="rounded-lg bg-amber-100 p-2.5 dark:bg-amber-950/30">
                <Clock className="size-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">{msByStatus['published'] || 0}</p>
              </div>
              <div className="rounded-lg bg-teal-100 p-2.5 dark:bg-teal-950/30">
                <BookOpen className="size-5 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Print Orders</p>
                <p className="text-2xl font-bold">{printOrders.length}</p>
              </div>
              <div className="rounded-lg bg-rose-100 p-2.5 dark:bg-rose-950/30">
                <Printer className="size-5 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Print Cost</p>
                <p className="text-2xl font-bold">${totalPrintCost.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-purple-100 p-2.5 dark:bg-purple-950/30">
                <DollarSign className="size-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="manuscripts">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="manuscripts">Manuscripts</TabsTrigger>
            <TabsTrigger value="print-orders">Print Orders</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button
              onClick={() => setManuscriptDialogOpen(true)}
              variant="outline"
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
            >
              <Plus className="size-4 mr-1.5" />
              Submit Manuscript
            </Button>
            <Button onClick={() => setPrintOrderDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="size-4 mr-1.5" />
              Create Print Order
            </Button>
          </div>
        </div>

        {/* Manuscripts Tab */}
        <TabsContent value="manuscripts" className="mt-4">
          {loading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground animate-pulse">Loading manuscripts...</CardContent>
            </Card>
          ) : manuscripts.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <FileText className="size-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-1">No manuscripts yet</h3>
                <p className="text-sm text-muted-foreground">Submit your first manuscript to get started</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {manuscripts.map((ms) => {
                      const nextStatuses = getNextStatus(ms.status)
                      return (
                        <TableRow key={ms.id}>
                          <TableCell className="font-medium max-w-[200px] truncate">{ms.title}</TableCell>
                          <TableCell className="text-muted-foreground">{ms.author || '—'}</TableCell>
                          <TableCell>
                            <Badge className={manuscriptStatusColors[ms.status] || ''}>
                              {ms.status.charAt(0).toUpperCase() + ms.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(ms.submittedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {nextStatuses.map((ns) => (
                                <Button
                                  key={ns}
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
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
                                  className="h-7 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/30"
                                  onClick={() => handleManuscriptStatus(ms, 'rejected')}
                                >
                                  <XCircle className="size-3 mr-1" />
                                  Reject
                                </Button>
                              )}
                              {ms.status === 'published' && (
                                <CheckCircle2 className="size-4 text-emerald-600" />
                              )}
                              {ms.status === 'rejected' && (
                                <XCircle className="size-4 text-rose-500" />
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Print Orders Tab */}
        <TabsContent value="print-orders" className="mt-4">
          {loading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground animate-pulse">Loading print orders...</CardContent>
            </Card>
          ) : printOrders.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Printer className="size-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-1">No print orders yet</h3>
                <p className="text-sm text-muted-foreground">Create a print order for a published book</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Cost/Unit</TableHead>
                      <TableHead>Total Cost</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {printOrders.map((po) => (
                      <TableRow key={po.id}>
                        <TableCell className="font-medium">
                          {po.book?.title || 'Unknown Book'}
                        </TableCell>
                        <TableCell>{po.quantity.toLocaleString()}</TableCell>
                        <TableCell>${po.costPerUnit.toFixed(2)}</TableCell>
                        <TableCell className="font-medium">${po.totalCost.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={printStatusColors[po.status] || ''}>
                            {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {po.status === 'ordered' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
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
                                className="h-7 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950/30"
                                onClick={() => handlePrintOrderStatus(po, 'completed')}
                              >
                                <CheckCircle2 className="size-3 mr-1" />
                                Complete
                              </Button>
                            )}
                            {po.status === 'completed' && (
                              <Badge variant="outline" className="text-emerald-600 text-xs">
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
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Submit Manuscript Dialog */}
      <Dialog open={manuscriptDialogOpen} onOpenChange={setManuscriptDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Manuscript</DialogTitle>
            <DialogDescription>Submit a new manuscript for review and publishing</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ms-title">Title *</Label>
              <Input
                id="ms-title"
                placeholder="The Great Adventure"
                value={msForm.title}
                onChange={(e) => setMsForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ms-author">Author</Label>
              <Input
                id="ms-author"
                placeholder="Jane Doe"
                value={msForm.author}
                onChange={(e) => setMsForm((prev) => ({ ...prev, author: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ms-notes">Notes</Label>
              <Textarea
                id="ms-notes"
                placeholder="Additional notes about this manuscript..."
                value={msForm.notes}
                onChange={(e) => setMsForm((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setManuscriptDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitManuscript} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
              {submitting ? 'Submitting...' : 'Submit Manuscript'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Print Order Dialog */}
      <Dialog open={printOrderDialogOpen} onOpenChange={setPrintOrderDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Print Order</DialogTitle>
            <DialogDescription>Order a print run for a published book</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="po-book">Book *</Label>
              <Select
                value={poForm.bookId}
                onValueChange={(v) => setPoForm((prev) => ({ ...prev, bookId: v }))}
              >
                <SelectTrigger id="po-book">
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
                <Label htmlFor="po-qty">Quantity *</Label>
                <Input
                  id="po-qty"
                  type="number"
                  placeholder="500"
                  value={poForm.quantity}
                  onChange={(e) => setPoForm((prev) => ({ ...prev, quantity: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="po-cost">Cost Per Unit</Label>
                <Input
                  id="po-cost"
                  type="number"
                  step="0.01"
                  placeholder="2.50"
                  value={poForm.costPerUnit}
                  onChange={(e) => setPoForm((prev) => ({ ...prev, costPerUnit: e.target.value }))}
                />
              </div>
            </div>
            {poForm.quantity && poForm.costPerUnit && (
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 p-3 text-sm">
                <span className="text-muted-foreground">Total Cost: </span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  ${(parseInt(poForm.quantity) * parseFloat(poForm.costPerUnit)).toLocaleString()}
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPrintOrderDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreatePrintOrder} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
              {submitting ? 'Creating...' : 'Create Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
