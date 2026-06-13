'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Search,
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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
  { bg: 'bg-macos-red/10', text: 'text-macos-red' },
  { bg: 'bg-macos-teal/10', text: 'text-macos-teal' },
  { bg: 'bg-macos-indigo/10', text: 'text-macos-indigo' },
  { bg: 'bg-macos-pink/10', text: 'text-macos-pink' },
]

const getPublisherColor = (name: string) => {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return publisherColors[Math.abs(hash) % publisherColors.length]
}

// ── Component ────────────────────────────────────────────────────
export default function PublishersModule() {
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

  // ── Detail View ────────────────────────────────────────────
  if (selectedPublisher) {
    const pubColor = getPublisherColor(selectedPublisher.name)
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedPublisher(null)}
          className="flex items-center gap-1.5 text-[13px] font-medium text-macos-blue hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} /> Back to Publishers
        </button>

        <div className="rounded-2xl macos-shadow bg-card p-5">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className={`size-14 rounded-2xl ${pubColor.bg} flex items-center justify-center shrink-0`}>
              <Building2 className={`size-7 ${pubColor.text}`} strokeWidth={1.5} />
            </div>
            <div className="space-y-1 flex-1">
              <h2 className="text-xl font-bold tracking-tight">{selectedPublisher.name}</h2>
              <div className="flex flex-wrap gap-3 text-[13px] text-muted-foreground">
                {selectedPublisher.contact && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="size-3.5" strokeWidth={1.5} /> {selectedPublisher.contact}
                  </span>
                )}
                {selectedPublisher.email && (
                  <span className="flex items-center gap-1.5 text-macos-blue">
                    <Mail className="size-3.5" strokeWidth={1.5} /> {selectedPublisher.email}
                  </span>
                )}
                {selectedPublisher.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="size-3.5" strokeWidth={1.5} /> {selectedPublisher.phone}
                  </span>
                )}
              </div>
              {selectedPublisher.address && (
                <p className="text-[13px] text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="size-3.5" strokeWidth={1.5} /> {selectedPublisher.address}
                </p>
              )}
              {selectedPublisher.website && (
                <p className="text-[13px] text-muted-foreground flex items-center gap-1.5">
                  <Globe className="size-3.5" strokeWidth={1.5} /> {selectedPublisher.website}
                </p>
              )}
              {selectedPublisher.agreement && (
                <p className="text-[13px] text-muted-foreground flex items-center gap-1.5">
                  <FileText className="size-3.5" strokeWidth={1.5} /> Agreement: {selectedPublisher.agreement}
                </p>
              )}
              <div className="mt-2">
                <Badge className="rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 bg-macos-green/10 text-macos-green">
                  {selectedPublisher._count.books} books
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl macos-shadow bg-card p-5">
          <h3 className="text-[13px] font-semibold tracking-tight mb-3">
            Books by {selectedPublisher.name}
          </h3>
          {loadingBooks ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : publisherBooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Building2 className="size-8 mb-2 opacity-40" strokeWidth={1.5} />
              <p className="text-[13px]">No books from this publisher yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Title</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Author</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">ISBN</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Category</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {publisherBooks.map((book) => (
                  <TableRow key={book.id} className="hover:bg-secondary/50">
                    <TableCell className="text-[13px] font-medium">{book.title}</TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">
                      {book.author?.name || '—'}
                    </TableCell>
                    <TableCell className="text-[13px] text-muted-foreground font-mono">
                      {book.isbn || '—'}
                    </TableCell>
                    <TableCell>
                      {book.category ? (
                        <Badge className="rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 bg-macos-purple/10 text-macos-purple">
                          {book.category.name}
                        </Badge>
                      ) : (
                        <span className="text-[13px] text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-[13px] text-right font-semibold tracking-tight">
                      ${book.price.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    )
  }

  // ── Main Table View ────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header + Add */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold tracking-tight">Publishers</h2>
          <Badge className="rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 bg-macos-orange/10 text-macos-orange">
            {total} publishers
          </Badge>
        </div>
        <Button onClick={openAdd} className="bg-primary text-primary-foreground rounded-lg font-medium text-[13px] h-8">
          <Plus className="size-4 mr-1.5" strokeWidth={1.5} /> Add Publisher
        </Button>
      </div>

      {/* Spotlight Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" strokeWidth={1.5} />
        <Input
          placeholder="Search by name, contact, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 pl-8 focus-visible:ring-1 focus-visible:ring-primary/30"
        />
      </div>

      {/* Publishers Table */}
      <div className="rounded-2xl macos-shadow bg-card overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : publishers.length === 0 ? (
          <div className="p-8 flex flex-col items-center justify-center text-muted-foreground">
            <Building2 className="size-10 mb-3 opacity-40" strokeWidth={1.5} />
            <p className="text-[13px] font-semibold">No publishers found</p>
            <p className="text-[11px] mt-1">Try adjusting your search or add a new publisher</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Publisher</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Contact</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Email</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Phone</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-center">Books</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {publishers.map((pub) => {
                  const pubColor = getPublisherColor(pub.name)
                  return (
                    <TableRow
                      key={pub.id}
                      className="cursor-pointer hover:bg-secondary/50"
                      onClick={() => openDetail(pub)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className={`size-8 rounded-lg ${pubColor.bg} flex items-center justify-center shrink-0`}>
                            <Building2 className={`size-4 ${pubColor.text}`} strokeWidth={1.5} />
                          </div>
                          <span className="text-[13px] font-medium">{pub.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">
                        {pub.contact || '—'}
                      </TableCell>
                      <TableCell>
                        {pub.email ? (
                          <span className="text-[13px] text-macos-blue">{pub.email}</span>
                        ) : (
                          <span className="text-[13px] text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">
                        {pub.phone || '—'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 bg-macos-green/10 text-macos-green">
                          {pub._count.books}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 rounded-lg"
                            onClick={() => openEdit(pub)}
                          >
                            <Pencil className="size-3.5" strokeWidth={1.5} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 rounded-lg text-macos-red hover:text-macos-red"
                            onClick={() => handleDelete(pub.id)}
                            disabled={deleting === pub.id}
                          >
                            {deleting === pub.id ? (
                              <RefreshCw className="size-3.5 animate-spin" strokeWidth={1.5} />
                            ) : (
                              <Trash2 className="size-3.5" strokeWidth={1.5} />
                            )}
                          </Button>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">
            Page {page} of {totalPages} · {total} results
          </p>
          <div className="flex gap-1">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-lg h-7 text-[13px]"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Prev
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="rounded-lg h-7 text-[13px]"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setEditing(null)
            setForm(emptyForm)
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[13px] font-semibold tracking-tight">
              {editing ? 'Edit Publisher' : 'Add New Publisher'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <Label htmlFor="pub-name" className="text-[11px] font-semibold">Name *</Label>
              <Input
                id="pub-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Publisher name"
                className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="pub-contact" className="text-[11px] font-semibold">Contact Person</Label>
                <Input
                  id="pub-contact"
                  value={form.contact}
                  onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                  placeholder="Contact name"
                  className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
              <div>
                <Label htmlFor="pub-email" className="text-[11px] font-semibold">Email</Label>
                <Input
                  id="pub-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="publisher@example.com"
                  className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="pub-phone" className="text-[11px] font-semibold">Phone</Label>
                <Input
                  id="pub-phone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+1-..."
                  className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
              <div>
                <Label htmlFor="pub-website" className="text-[11px] font-semibold">Website</Label>
                <Input
                  id="pub-website"
                  value={form.website}
                  onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                  placeholder="https://..."
                  className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="pub-address" className="text-[11px] font-semibold">Address</Label>
              <Textarea
                id="pub-address"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="Full address..."
                rows={2}
                className="rounded-lg bg-secondary/80 border-0 text-[13px] focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </div>
            <div>
              <Label htmlFor="pub-agreement" className="text-[11px] font-semibold">Agreement</Label>
              <Textarea
                id="pub-agreement"
                value={form.agreement}
                onChange={(e) => setForm((f) => ({ ...f, agreement: e.target.value }))}
                placeholder="Distribution agreement details..."
                rows={2}
                className="rounded-lg bg-secondary/80 border-0 text-[13px] focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              className="rounded-lg text-[13px] font-medium h-8"
              onClick={() => {
                setDialogOpen(false)
                setEditing(null)
                setForm(emptyForm)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="bg-primary text-primary-foreground rounded-lg text-[13px] font-medium h-8"
            >
              {saving ? (
                <RefreshCw className="size-4 mr-1.5 animate-spin" strokeWidth={1.5} />
              ) : (
                <Plus className="size-4 mr-1.5" strokeWidth={1.5} />
              )}
              {editing ? 'Update Publisher' : 'Create Publisher'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
