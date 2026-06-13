'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  Building2,
  RefreshCw,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  Loader2,
  BookOpen,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAppStore } from '@/store/app-store'
import {
  MacosPageHeader,
  MacosSearch,
  MacosButton,
  MacosBadge,
  MacosDialog,
  MacosEmptyState,
  MacosFormField,
  MacosStatCard,
  MacosStatGrid,
  MacosCard,
} from '@/components/macos-ui'

// ── Types ────────────────────────────────────────────────────────
interface PublisherData {
  id: string
  name: string
  contact: string | null
  email: string | null
  phone: string | null
  address: string | null
  website: string | null
  agreement: string | null
  createdAt: string
  _count: { books: number }
}

interface BookData {
  id: string
  title: string
  isbn: string | null
  price: number
  category: { id: string; name: string; type: string | null } | null
  author: { id: string; name: string } | null
}

interface PublisherFormData {
  name: string
  contact: string
  email: string
  phone: string
  address: string
  website: string
  agreement: string
}

const emptyForm: PublisherFormData = {
  name: '',
  contact: '',
  email: '',
  phone: '',
  address: '',
  website: '',
  agreement: '',
}

// ── Publisher icon colors ─────────────────────────────────────
const publisherColors = [
  { bg: 'bg-macos-blue/10', text: 'text-macos-blue' },
  { bg: 'bg-macos-green/10', text: 'text-macos-green' },
  { bg: 'bg-macos-orange/10', text: 'text-macos-orange' },
  { bg: 'bg-macos-purple/10', text: 'text-macos-purple' },
  { bg: 'bg-gg-bridge/10', text: 'text-gg-bridge' },
  { bg: 'bg-macos-teal/10', text: 'text-macos-teal' },
  { bg: 'bg-gg-bay/10', text: 'text-gg-bay' },
  { bg: 'bg-gg-sunset/10', text: 'text-gg-sunset' },
]

const getPublisherColor = (name: string) => {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return publisherColors[Math.abs(hash) % publisherColors.length]
}

// ── Category badge color for book detail table ────────────────
const categoryColorMap: Record<string, { bg: string; text: string }> = {
  'Fiction': { bg: 'bg-macos-purple/10', text: 'text-macos-purple' },
  'Non-Fiction': { bg: 'bg-macos-blue/10', text: 'text-macos-blue' },
  'Science': { bg: 'bg-macos-teal/10', text: 'text-macos-teal' },
  'Technology': { bg: 'bg-macos-orange/10', text: 'text-macos-orange' },
  'History': { bg: 'bg-gg-bridge/10', text: 'text-gg-bridge' },
  'Art': { bg: 'bg-macos-pink/10', text: 'text-macos-pink' },
  'Business': { bg: 'bg-macos-green/10', text: 'text-macos-green' },
  'Education': { bg: 'bg-gg-bay/10', text: 'text-gg-bay' },
  'Literature': { bg: 'bg-gg-golden/10', text: 'text-gg-golden' },
  'Philosophy': { bg: 'bg-macos-indigo/10', text: 'text-macos-indigo' },
}

const getCategoryColor = (name: string) => {
  return categoryColorMap[name] || { bg: 'bg-macos-purple/10', text: 'text-macos-purple' }
}

// ── Component ────────────────────────────────────────────────────
export function PublishersModule() {
  const authUser = useAppStore((s) => s.authUser)
  const isViewOnly = authUser?.isViewOnly ?? false

  const [publishers, setPublishers] = useState<PublisherData[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<PublisherData | null>(null)
  const [form, setForm] = useState<PublisherFormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Detail view
  const [selectedPublisher, setSelectedPublisher] = useState<PublisherData | null>(null)
  const [publisherBooks, setPublisherBooks] = useState<BookData[]>([])
  const [loadingBooks, setLoadingBooks] = useState(false)

  const limit = 10

  // ── Fetch publishers ───────────────────────────────────────
  const fetchPublishers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      })
      if (search) params.set('search', search)

      const res = await fetch(`/api/publishers?${params}`)
      if (!res.ok) throw new Error('Failed to fetch publishers')
      const json = await res.json()
      setPublishers(json.data || [])
      setTotal(json.pagination?.total || 0)
      setTotalPages(json.pagination?.totalPages || 1)
    } catch {
      setPublishers([])
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    fetchPublishers()
  }, [fetchPublishers])

  useEffect(() => {
    setPage(1)
  }, [search])

  // ── Fetch publisher books ──────────────────────────────────
  const fetchPublisherBooks = async (publisherId: string) => {
    setLoadingBooks(true)
    try {
      const res = await fetch(`/api/books?publisherId=${publisherId}&limit=50`)
      if (!res.ok) throw new Error('Failed to fetch books')
      const json = await res.json()
      setPublisherBooks(json.data || [])
    } catch {
      setPublisherBooks([])
    } finally {
      setLoadingBooks(false)
    }
  }

  // ── Open detail view ───────────────────────────────────────
  const openDetail = (publisher: PublisherData) => {
    setSelectedPublisher(publisher)
    fetchPublisherBooks(publisher.id)
  }

  // ── Save publisher ─────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        contact: form.contact || null,
        email: form.email || null,
        phone: form.phone || null,
        address: form.address || null,
        website: form.website || null,
        agreement: form.agreement || null,
      }

      let res: Response
      if (editing) {
        res = await fetch('/api/publishers', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editing.id, ...payload }),
        })
      } else {
        res = await fetch('/api/publishers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save publisher')
      }

      setDialogOpen(false)
      setEditing(null)
      setForm(emptyForm)
      fetchPublishers()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save publisher')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete publisher ───────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this publisher?')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/publishers?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to delete')
      }
      fetchPublishers()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete publisher')
    } finally {
      setDeleting(null)
    }
  }

  // ── Open dialog for edit ───────────────────────────────────
  const openEdit = (publisher: PublisherData) => {
    setEditing(publisher)
    setForm({
      name: publisher.name,
      contact: publisher.contact || '',
      email: publisher.email || '',
      phone: publisher.phone || '',
      address: publisher.address || '',
      website: publisher.website || '',
      agreement: publisher.agreement || '',
    })
    setDialogOpen(true)
  }

  // ── Open dialog for add ────────────────────────────────────
  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  // ── Stats computation ──────────────────────────────────────
  const publishersWithBooks = publishers.filter(p => p._count.books > 0).length
  const publishersWithEmail = publishers.filter(p => p.email).length
  const publishersWithWebsite = publishers.filter(p => p.website).length

  // ── Detail View ────────────────────────────────────────────
  if (selectedPublisher) {
    const pubColor = getPublisherColor(selectedPublisher.name)
    return (
      <div className="space-y-5">
        {/* Back button */}
        <MacosButton variant="ghost" icon={ArrowLeft} onClick={() => setSelectedPublisher(null)}>
          Back to Publishers
        </MacosButton>

        {/* Publisher Profile Card */}
        <div className="macos-card macos-shadow-card p-6">
          <div className="flex flex-col sm:flex-row gap-5">
            <div className={`size-16 rounded-2xl ${pubColor.bg} flex items-center justify-center shrink-0`}>
              <Building2 className={`size-8 ${pubColor.text}`} strokeWidth={1.5} />
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              <h1 className="macos-page-title text-[20px]">{selectedPublisher.name}</h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] font-medium text-muted-foreground">
                {selectedPublisher.contact && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="size-3.5 text-muted-foreground" strokeWidth={1.5} /> {selectedPublisher.contact}
                  </span>
                )}
                {selectedPublisher.email && (
                  <a
                    href={`mailto:${selectedPublisher.email}`}
                    className="flex items-center gap-1.5 text-macos-blue hover:text-macos-blue/80 transition-colors"
                  >
                    <Mail className="size-3.5" strokeWidth={1.5} /> {selectedPublisher.email}
                  </a>
                )}
                {selectedPublisher.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="size-3.5 text-muted-foreground" strokeWidth={1.5} /> {selectedPublisher.phone}
                  </span>
                )}
              </div>
              {selectedPublisher.address && (
                <p className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="size-3.5 shrink-0" strokeWidth={1.5} /> {selectedPublisher.address}
                </p>
              )}
              {selectedPublisher.website && (
                <a
                  href={selectedPublisher.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] font-medium text-macos-blue flex items-center gap-1.5 hover:text-macos-blue/80 transition-colors"
                >
                  <Globe className="size-3.5 shrink-0" strokeWidth={1.5} /> {selectedPublisher.website}
                </a>
              )}
              {selectedPublisher.agreement && (
                <p className="text-[13px] font-medium text-gg-golden flex items-center gap-1.5">
                  <FileText className="size-3.5 shrink-0" strokeWidth={1.5} /> Agreement: {selectedPublisher.agreement}
                </p>
              )}
              <div className="pt-2">
                <MacosBadge variant="success">
                  {selectedPublisher._count.books} books
                </MacosBadge>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid for Detail */}
        <MacosStatGrid>
          <MacosStatCard
            label="Total Books"
            value={selectedPublisher._count.books}
            icon={BookOpen}
            iconColor="text-macos-purple"
            iconBg="bg-macos-purple/10"
          />
          <MacosStatCard
            label="Has Contact"
            value={selectedPublisher.contact ? 'Yes' : 'No'}
            icon={Mail}
            iconColor="text-macos-blue"
            iconBg="bg-macos-blue/10"
          />
          <MacosStatCard
            label="Has Website"
            value={selectedPublisher.website ? 'Yes' : 'No'}
            icon={Globe}
            iconColor="text-macos-teal"
            iconBg="bg-macos-teal/10"
          />
          <MacosStatCard
            label="Has Agreement"
            value={selectedPublisher.agreement ? 'Yes' : 'No'}
            icon={FileText}
            iconColor="text-gg-golden"
            iconBg="bg-gg-golden/10"
          />
        </MacosStatGrid>

        {/* Books by Publisher */}
        <MacosCard
          title={`Books by ${selectedPublisher.name}`}
          action={
            <MacosBadge variant="purple">{publisherBooks.length}</MacosBadge>
          }
          noPadding
        >
          {loadingBooks ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : publisherBooks.length === 0 ? (
            <MacosEmptyState
              icon={BookOpen}
              title="No books from this publisher yet"
              description="Books will appear here when added"
            />
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50 hover:bg-transparent">
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Title</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Author</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 hidden sm:table-cell">ISBN</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 hidden md:table-cell">Category</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {publisherBooks.map((book) => {
                    const catColor = book.category ? getCategoryColor(book.category.name) : null
                    return (
                      <TableRow key={book.id} className="macos-table-row border-b border-border/30">
                        <TableCell className="text-[13px] font-medium tracking-tight py-3">{book.title}</TableCell>
                        <TableCell className="text-[13px] text-muted-foreground py-3">
                          {book.author?.name || '\u2014'}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-[13px] text-muted-foreground font-mono py-3">
                          {book.isbn || '\u2014'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell py-3">
                          {book.category && catColor ? (
                            <span className={`macos-badge ${catColor.bg} ${catColor.text}`}>
                              {book.category.name}
                            </span>
                          ) : (
                            <span className="text-[13px] text-muted-foreground">{'\u2014'}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-[13px] text-right font-semibold tracking-tight py-3">
                          ${book.price.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </MacosCard>
      </div>
    )
  }

  // ── Main Table View ────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* macOS Page Header */}
      <MacosPageHeader
        title="Publishers"
        subtitle={`${total} publishers in directory`}
        icon={Building2}
        iconColor="text-macos-blue"
        iconBg="bg-macos-blue/10"
      >
        {!isViewOnly && (
          <MacosButton variant="primary" icon={Plus} onClick={openAdd}>
            Add Publisher
          </MacosButton>
        )}
      </MacosPageHeader>

      {/* Stats Grid */}
      {!loading && publishers.length > 0 && (
        <MacosStatGrid>
          <MacosStatCard
            label="Total Publishers"
            value={total}
            icon={Building2}
            iconColor="text-macos-blue"
            iconBg="bg-macos-blue/10"
          />
          <MacosStatCard
            label="With Books"
            value={publishersWithBooks}
            icon={BookOpen}
            iconColor="text-macos-purple"
            iconBg="bg-macos-purple/10"
          />
          <MacosStatCard
            label="With Email"
            value={publishersWithEmail}
            icon={Mail}
            iconColor="text-macos-green"
            iconBg="bg-macos-green/10"
          />
          <MacosStatCard
            label="With Website"
            value={publishersWithWebsite}
            icon={Globe}
            iconColor="text-macos-teal"
            iconBg="bg-macos-teal/10"
          />
        </MacosStatGrid>
      )}

      {/* Spotlight Search */}
      <MacosSearch
        value={search}
        onChange={setSearch}
        placeholder="Search by name, contact, email..."
      />

      {/* Publishers Table */}
      <div className="macos-card macos-shadow-card overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-xl shrink-0" />
                <Skeleton className="h-4 w-full rounded-lg" />
              </div>
            ))}
          </div>
        ) : publishers.length === 0 ? (
          <MacosEmptyState
            icon={Building2}
            title="No publishers found"
            description="Try adjusting your search or add a new publisher"
            action={
              !isViewOnly ? (
                <MacosButton variant="primary" icon={Plus} onClick={openAdd}>
                  Add Publisher
                </MacosButton>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/50 hover:bg-transparent">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Publisher</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 hidden sm:table-cell">Contact</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 hidden md:table-cell">Email</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 hidden lg:table-cell">Phone</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-center">Books</TableHead>
                  {!isViewOnly && (
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {publishers.map((pub) => {
                  const pubColor = getPublisherColor(pub.name)
                  return (
                    <TableRow
                      key={pub.id}
                      className="macos-table-row cursor-pointer border-b border-border/30 last:border-0"
                      onClick={() => openDetail(pub)}
                    >
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`size-8 rounded-xl ${pubColor.bg} flex items-center justify-center shrink-0`}>
                            <Building2 className={`size-4 ${pubColor.text}`} strokeWidth={1.5} />
                          </div>
                          <span className="text-[13px] font-medium tracking-tight">{pub.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-[13px] text-muted-foreground py-3">
                        {pub.contact || '\u2014'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell py-3">
                        {pub.email ? (
                          <span className="text-[13px] text-macos-blue">{pub.email}</span>
                        ) : (
                          <span className="text-[13px] text-muted-foreground">{'\u2014'}</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-[13px] text-muted-foreground py-3">
                        {pub.phone || '\u2014'}
                      </TableCell>
                      <TableCell className="text-center py-3">
                        <MacosBadge variant="warning">
                          {pub._count.books}
                        </MacosBadge>
                      </TableCell>
                      {!isViewOnly && (
                        <TableCell className="text-right py-3">
                          <div className="flex justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
                            <MacosButton
                              variant="ghost"
                              icon={Pencil}
                              onClick={() => openEdit(pub)}
                              className="hover:bg-macos-blue/10 hover:text-macos-blue"
                            />
                            <MacosButton
                              variant="ghost"
                              icon={deleting === pub.id ? Loader2 : Trash2}
                              onClick={() => handleDelete(pub.id)}
                              disabled={deleting === pub.id}
                              className="hover:bg-macos-red/10 hover:text-macos-red"
                            />
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-[11px] text-muted-foreground font-medium">
            Page {page} of {totalPages} &middot; {total} results
          </p>
          <div className="flex gap-1">
            <MacosButton
              variant="ghost"
              icon={ArrowLeft}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Prev
            </MacosButton>
            <MacosButton
              variant="ghost"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </MacosButton>
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <MacosDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setEditing(null)
            setForm(emptyForm)
          }
        }}
        title={editing ? 'Edit Publisher' : 'Add New Publisher'}
        description={editing ? 'Update publisher contact and agreement details.' : 'Add a new publisher to your directory.'}
        footer={
          <>
            <MacosButton
              variant="secondary"
              onClick={() => {
                setDialogOpen(false)
                setEditing(null)
                setForm(emptyForm)
              }}
            >
              Cancel
            </MacosButton>
            <MacosButton
              variant="primary"
              icon={saving ? RefreshCw : Plus}
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
            >
              {editing ? 'Update Publisher' : 'Create Publisher'}
            </MacosButton>
          </>
        }
      >
        <div className="space-y-4">
          <MacosFormField label="Name *" description="Required">
            <Input
              id="pub-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Publisher name"
              className="rounded-lg border-border/50 text-[13px] h-8 mt-1 focus-visible:ring-1 focus-visible:ring-primary/30"
            />
          </MacosFormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MacosFormField label="Contact Person">
              <Input
                id="pub-contact"
                value={form.contact}
                onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                placeholder="Contact name"
                className="rounded-lg border-border/50 text-[13px] h-8 mt-1 focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </MacosFormField>
            <MacosFormField label="Email">
              <Input
                id="pub-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="publisher@example.com"
                className="rounded-lg border-border/50 text-[13px] h-8 mt-1 focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </MacosFormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MacosFormField label="Phone">
              <Input
                id="pub-phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+1-..."
                className="rounded-lg border-border/50 text-[13px] h-8 mt-1 focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </MacosFormField>
            <MacosFormField label="Website">
              <Input
                id="pub-website"
                value={form.website}
                onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                placeholder="https://..."
                className="rounded-lg border-border/50 text-[13px] h-8 mt-1 focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </MacosFormField>
          </div>

          <MacosFormField label="Address">
            <Textarea
              id="pub-address"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="Full address..."
              rows={2}
              className="rounded-lg border-border/50 text-[13px] mt-1 focus-visible:ring-1 focus-visible:ring-primary/30"
            />
          </MacosFormField>

          <MacosFormField label="Agreement">
            <Textarea
              id="pub-agreement"
              value={form.agreement}
              onChange={(e) => setForm((f) => ({ ...f, agreement: e.target.value }))}
              placeholder="Distribution agreement details..."
              rows={2}
              className="rounded-lg border-border/50 text-[13px] mt-1 focus-visible:ring-1 focus-visible:ring-primary/30"
            />
          </MacosFormField>
        </div>
      </MacosDialog>
    </div>
  )
}
