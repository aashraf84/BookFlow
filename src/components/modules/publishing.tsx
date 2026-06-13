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
  Eye,
  Send,
  PenTool,
  Shield,
  Globe,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  MacosFormField,
  MacosEmptyState,
  MacosSection,
} from '@/components/macos-ui'

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

// Manuscript status config - spec: submitted=blue, reviewed=purple, approved=green, published=teal, rejected=red
const manuscriptStatusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  submitted: { label: 'Submitted', color: 'text-macos-blue', bgColor: 'bg-macos-blue/10', icon: Send },
  reviewed: { label: 'Reviewed', color: 'text-macos-purple', bgColor: 'bg-macos-purple/10', icon: PenTool },
  approved: { label: 'Approved', color: 'text-macos-green', bgColor: 'bg-macos-green/10', icon: Shield },
  published: { label: 'Published', color: 'text-macos-teal', bgColor: 'bg-macos-teal/10', icon: Globe },
  rejected: { label: 'Rejected', color: 'text-macos-red', bgColor: 'bg-macos-red/10', icon: XCircle },
}

const printStatusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  ordered: { label: 'Ordered', color: 'text-macos-orange', bgColor: 'bg-macos-orange/10', icon: Clock },
  printing: { label: 'Printing', color: 'text-macos-blue', bgColor: 'bg-macos-blue/10', icon: Printer },
  completed: { label: 'Completed', color: 'text-macos-green', bgColor: 'bg-macos-green/10', icon: CheckCircle2 },
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

// Pipeline step component for manuscript workflow visualization
function PipelineStep({
  label,
  icon: Icon,
  isActive,
  isCompleted,
  count,
  color,
  bgColor,
  isLast,
}: {
  label: string
  icon: React.ElementType
  isActive: boolean
  isCompleted: boolean
  count: number
  color: string
  bgColor: string
  isLast: boolean
}) {
  return (
    <div className="flex items-center gap-0 flex-1 min-w-0">
      <div className="flex flex-col items-center gap-1.5 min-w-0 flex-1">
        <div
          className={`relative flex items-center justify-center size-10 rounded-xl transition-all duration-300 ${
            isActive
              ? `${bgColor} ring-2 ring-offset-1 ring-offset-background ${color.replace('text-', 'ring-')}`
              : isCompleted
              ? bgColor
              : 'bg-secondary/60'
          }`}
        >
          <Icon className={`size-4 ${isActive || isCompleted ? color : 'text-muted-foreground/50'}`} />
          {count > 0 && (
            <span className={`absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[9px] font-bold px-1 ${
              isActive ? 'bg-macos-blue text-white' : isCompleted ? bgColor + ' ' + color : 'bg-secondary text-muted-foreground'
            }`}>
              {count}
            </span>
          )}
        </div>
        <div className="text-center">
          <p className={`text-[10px] font-semibold uppercase tracking-wider ${isActive ? color : isCompleted ? 'text-foreground' : 'text-muted-foreground/60'}`}>
            {label}
          </p>
        </div>
      </div>
      {!isLast && (
        <div className="flex items-center pt-[-16px] self-start mt-5 -ml-1 -mr-1">
          <div className={`h-[2px] w-full min-w-[24px] rounded-full transition-colors ${
            isCompleted ? 'bg-macos-green/40' : 'bg-border'
          }`} />
          <ArrowRight className={`size-3 -ml-1 ${isCompleted ? 'text-macos-green/40' : 'text-muted-foreground/30'}`} />
        </div>
      )}
    </div>
  )
}

export function PublishingModule() {
  const { toast } = useToast()
  const authUser = useAppStore((s) => s.authUser)
  const isViewOnly = authUser?.isViewOnly ?? false

  const [manuscripts, setManuscripts] = React.useState<Manuscript[]>([])
  const [printOrders, setPrintOrders] = React.useState<PrintOrder[]>([])
  const [books, setBooks] = React.useState<BookOption[]>([])
  const [loading, setLoading] = React.useState(true)
  const [manuscriptDialogOpen, setManuscriptDialogOpen] = React.useState(false)
  const [printOrderDialogOpen, setPrintOrderDialogOpen] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState('manuscripts')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('all')

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

  // Filter manuscripts
  const filteredManuscripts = manuscripts.filter((m) => {
    const matchesSearch = !searchQuery ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.author && m.author.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const tabs = [
    { id: 'manuscripts', label: 'Manuscripts' },
    { id: 'print-orders', label: 'Print Orders' },
  ]

  return (
    <div className="space-y-6">
      {/* macOS Page Header */}
      <MacosPageHeader
        title="Publishing"
        subtitle="Manage manuscripts, reviews, and print production"
        icon={BookOpen}
        iconColor="text-macos-teal"
        iconBg="bg-macos-teal/10"
      >
        {isViewOnly && (
          <MacosBadge variant="warning">
            <Eye className="size-3 mr-1" />
            DEMO MODE
          </MacosBadge>
        )}
      </MacosPageHeader>

      {/* Summary Metrics - macOS Stat Cards */}
      <MacosStatGrid className="lg:grid-cols-5">
        <MacosStatCard label="Manuscripts" value={manuscripts.length} icon={FileText} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" />
        <MacosStatCard label="Submitted" value={msByStatus['submitted'] || 0} icon={Clock} iconColor="text-macos-orange" iconBg="bg-macos-orange/10" />
        <MacosStatCard label="Published" value={msByStatus['published'] || 0} icon={Globe} iconColor="text-macos-teal" iconBg="bg-macos-teal/10" />
        <MacosStatCard label="Print Orders" value={printOrders.length} icon={Printer} iconColor="text-macos-purple" iconBg="bg-macos-purple/10" />
        <MacosStatCard label="Print Cost" value={`$${totalPrintCost.toLocaleString()}`} icon={DollarSign} iconColor="text-macos-green" iconBg="bg-macos-green/10" />
      </MacosStatGrid>

      {/* Manuscript Workflow Pipeline Visualization */}
      <MacosCard noPadding>
        <div className="px-5 pt-5 pb-0">
          <MacosSection
            title="Manuscript Workflow Pipeline"
            subtitle="Track manuscripts through the publishing lifecycle"
          />
        </div>
        <div className="p-5 pt-2">
          <div className="flex items-start justify-between gap-2">
            {statusWorkflow.map((status, idx) => {
              const config = manuscriptStatusConfig[status]
              const count = msByStatus[status] || 0
              const isLast = idx === statusWorkflow.length - 1
              const isActive = count > 0
              const laterCounts = statusWorkflow.slice(idx + 1).reduce((sum, s) => sum + (msByStatus[s] || 0), 0)
              const isCompleted = count === 0 && laterCounts > 0
              return (
                <PipelineStep
                  key={status}
                  label={config.label}
                  icon={config.icon}
                  isActive={isActive}
                  isCompleted={isCompleted}
                  count={count}
                  color={config.color}
                  bgColor={config.bgColor}
                  isLast={isLast}
                />
              )
            })}
          </div>
          {/* Rejected count if any */}
          {(msByStatus['rejected'] || 0) > 0 && (
            <div className="mt-4 flex items-center gap-2 pt-3 border-t border-border">
              <XCircle className="size-3.5 text-macos-red" />
              <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">Rejected:</span>
              <MacosBadge variant="danger">{msByStatus['rejected']}</MacosBadge>
            </div>
          )}
        </div>
      </MacosCard>

      {/* Filter Bar + Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <MacosFilterBar
          items={tabs.map((tab) => ({ id: tab.id, label: tab.label }))}
          activeId={activeTab}
          onChange={setActiveTab}
        />
        <div className="flex items-center gap-2">
          {activeTab === 'manuscripts' && (
            <MacosSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search manuscripts..."
            />
          )}
          {activeTab === 'manuscripts' && (
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-8 text-[12px] font-medium rounded-lg bg-secondary/80 border-0">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          )}
          {!isViewOnly && (
            <>
              <MacosButton
                variant="secondary"
                icon={Plus}
                onClick={() => setManuscriptDialogOpen(true)}
              >
                Submit Manuscript
              </MacosButton>
              <MacosButton
                variant="primary"
                icon={Plus}
                onClick={() => setPrintOrderDialogOpen(true)}
              >
                Print Order
              </MacosButton>
            </>
          )}
        </div>
      </div>

      {/* Manuscripts Tab */}
      {activeTab === 'manuscripts' && (
        <div>
          {loading ? (
            <MacosCard>
              <div className="p-8 text-center text-muted-foreground animate-pulse text-[13px]">
                Loading manuscripts...
              </div>
            </MacosCard>
          ) : filteredManuscripts.length === 0 ? (
            <MacosCard>
              <MacosEmptyState
                icon={FileText}
                title="No manuscripts found"
                description={searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Submit your first manuscript to get started'}
              />
            </MacosCard>
          ) : (
            <div className="macos-card macos-shadow-card overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/50 hover:bg-transparent">
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Title</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Author</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Status</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Submitted</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredManuscripts.map((ms) => {
                      const nextStatuses = getNextStatus(ms.status)
                      const statusConf = manuscriptStatusConfig[ms.status] || manuscriptStatusConfig.submitted
                      const StatusIcon = statusConf.icon
                      return (
                        <TableRow key={ms.id} className="macos-table-row border-b border-border/30 last:border-0">
                          <TableCell className="text-[13px] font-medium tracking-tight py-3 max-w-[200px]">
                            <div className="flex items-center gap-2">
                              <div className={`size-7 rounded-lg flex items-center justify-center ${statusConf.bgColor}`}>
                                <StatusIcon className={`size-3.5 ${statusConf.color}`} />
                              </div>
                              <span className="truncate">{ms.title}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-[13px] font-medium tracking-tight py-3 text-muted-foreground">{ms.author || '—'}</TableCell>
                          <TableCell className="py-3">
                            <MacosBadge
                              variant={
                                ms.status === 'published' ? 'success' :
                                ms.status === 'rejected' ? 'danger' :
                                ms.status === 'submitted' ? 'info' :
                                ms.status === 'reviewed' ? 'purple' : 'default'
                              }
                            >
                              {statusConf.label}
                            </MacosBadge>
                          </TableCell>
                          <TableCell className="text-[13px] font-medium tracking-tight py-3 text-muted-foreground">
                            {new Date(ms.submittedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right py-3">
                            <div className="flex items-center justify-end gap-1">
                              {nextStatuses.map((ns) => {
                                const nsConf = manuscriptStatusConfig[ns]
                                return (
                                  <MacosButton
                                    key={ns}
                                    variant="secondary"
                                    icon={ArrowRight}
                                    onClick={() => handleManuscriptStatus(ms, ns)}
                                    disabled={isViewOnly}
                                    className={nsConf?.color}
                                  >
                                    {ns.charAt(0).toUpperCase() + ns.slice(1)}
                                  </MacosButton>
                                )
                              })}
                              {!rejectionStates.includes(ms.status) && ms.status !== 'published' && !isViewOnly && (
                                <MacosButton
                                  variant="danger"
                                  icon={XCircle}
                                  onClick={() => handleManuscriptStatus(ms, 'rejected')}
                                  disabled={isViewOnly}
                                >
                                  Reject
                                </MacosButton>
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
            </div>
          )}
        </div>
      )}

      {/* Print Orders Tab */}
      {activeTab === 'print-orders' && (
        <div>
          {loading ? (
            <MacosCard>
              <div className="p-8 text-center text-muted-foreground animate-pulse text-[13px]">
                Loading print orders...
              </div>
            </MacosCard>
          ) : printOrders.length === 0 ? (
            <MacosCard>
              <MacosEmptyState
                icon={Printer}
                title="No print orders yet"
                description="Create a print order for a published book"
              />
            </MacosCard>
          ) : (
            <div className="macos-card macos-shadow-card overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/50 hover:bg-transparent">
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Book</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Quantity</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Cost/Unit</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Total Cost</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9">Status</TableHead>
                      <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {printOrders.map((po) => {
                      const poConf = printStatusConfig[po.status] || printStatusConfig.ordered
                      const PoIcon = poConf.icon
                      return (
                        <TableRow key={po.id} className="macos-table-row border-b border-border/30 last:border-0">
                          <TableCell className="text-[13px] font-medium tracking-tight py-3">
                            <div className="flex items-center gap-2">
                              <div className={`size-7 rounded-lg flex items-center justify-center ${poConf.bgColor}`}>
                                <PoIcon className={`size-3.5 ${poConf.color}`} />
                              </div>
                              {po.book?.title || 'Unknown Book'}
                            </div>
                          </TableCell>
                          <TableCell className="text-[13px] font-medium tracking-tight py-3">{po.quantity.toLocaleString()}</TableCell>
                          <TableCell className="text-[13px] font-medium tracking-tight py-3">${po.costPerUnit.toFixed(2)}</TableCell>
                          <TableCell className="text-[13px] font-medium tracking-tight py-3 font-semibold">${po.totalCost.toLocaleString()}</TableCell>
                          <TableCell className="py-3">
                            <MacosBadge
                              variant={po.status === 'completed' ? 'success' : po.status === 'printing' ? 'info' : 'warning'}
                            >
                              {poConf.label}
                            </MacosBadge>
                          </TableCell>
                          <TableCell className="text-right py-3">
                            <div className="flex items-center justify-end gap-1">
                              {po.status === 'ordered' && !isViewOnly && (
                                <MacosButton
                                  variant="secondary"
                                  icon={ArrowRight}
                                  onClick={() => handlePrintOrderStatus(po, 'printing')}
                                  disabled={isViewOnly}
                                >
                                  Start Printing
                                </MacosButton>
                              )}
                              {po.status === 'printing' && !isViewOnly && (
                                <MacosButton
                                  variant="primary"
                                  icon={CheckCircle2}
                                  onClick={() => handlePrintOrderStatus(po, 'completed')}
                                  disabled={isViewOnly}
                                  className="bg-macos-green text-white hover:bg-macos-green/90"
                                >
                                  Complete
                                </MacosButton>
                              )}
                              {po.status === 'completed' && (
                                <MacosBadge variant="success">
                                  <CheckCircle2 className="size-3 mr-1" />
                                  Done
                                </MacosBadge>
                              )}
                              {isViewOnly && po.status !== 'completed' && (
                                <span className="text-[10px] text-muted-foreground">View only</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Submit Manuscript Dialog - frosted glass */}
      <MacosDialog
        open={manuscriptDialogOpen}
        onOpenChange={setManuscriptDialogOpen}
        title="Submit Manuscript"
        description="Submit a new manuscript for review and publishing"
        footer={
          <>
            <MacosButton variant="secondary" onClick={() => setManuscriptDialogOpen(false)}>
              Cancel
            </MacosButton>
            <MacosButton variant="primary" onClick={handleSubmitManuscript} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Manuscript'}
            </MacosButton>
          </>
        }
      >
        <div className="space-y-4">
          <MacosFormField label="Title" description="Required">
            <Input
              placeholder="The Great Adventure"
              value={msForm.title}
              onChange={(e) => setMsForm((prev) => ({ ...prev, title: e.target.value }))}
              className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-ring"
            />
          </MacosFormField>
          <MacosFormField label="Author">
            <Input
              placeholder="Jane Doe"
              value={msForm.author}
              onChange={(e) => setMsForm((prev) => ({ ...prev, author: e.target.value }))}
              className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-ring"
            />
          </MacosFormField>
          <MacosFormField label="Notes">
            <Textarea
              placeholder="Additional notes about this manuscript..."
              value={msForm.notes}
              onChange={(e) => setMsForm((prev) => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="rounded-lg bg-secondary/80 border-0 text-[13px] focus-visible:ring-1 focus-visible:ring-ring"
            />
          </MacosFormField>
        </div>
      </MacosDialog>

      {/* Create Print Order Dialog - frosted glass */}
      <MacosDialog
        open={printOrderDialogOpen}
        onOpenChange={setPrintOrderDialogOpen}
        title="Create Print Order"
        description="Order a print run for a published book"
        footer={
          <>
            <MacosButton variant="secondary" onClick={() => setPrintOrderDialogOpen(false)}>
              Cancel
            </MacosButton>
            <MacosButton variant="primary" onClick={handleCreatePrintOrder} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Order'}
            </MacosButton>
          </>
        }
      >
        <div className="space-y-4">
          <MacosFormField label="Book" description="Required">
            <Select
              value={poForm.bookId}
              onValueChange={(v) => setPoForm((prev) => ({ ...prev, bookId: v }))}
            >
              <SelectTrigger className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8">
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
          </MacosFormField>
          <div className="grid grid-cols-2 gap-4">
            <MacosFormField label="Quantity" description="Required">
              <Input
                type="number"
                placeholder="500"
                value={poForm.quantity}
                onChange={(e) => setPoForm((prev) => ({ ...prev, quantity: e.target.value }))}
                className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-ring"
              />
            </MacosFormField>
            <MacosFormField label="Cost Per Unit">
              <Input
                type="number"
                step="0.01"
                placeholder="2.50"
                value={poForm.costPerUnit}
                onChange={(e) => setPoForm((prev) => ({ ...prev, costPerUnit: e.target.value }))}
                className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-ring"
              />
            </MacosFormField>
          </div>
          {poForm.quantity && poForm.costPerUnit && (
            <div className="macos-card p-3 text-[13px]">
              <span className="text-muted-foreground">Total Cost: </span>
              <span className="font-bold text-gg-golden">
                ${(parseInt(poForm.quantity) * parseFloat(poForm.costPerUnit)).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </MacosDialog>
    </div>
  )
}
