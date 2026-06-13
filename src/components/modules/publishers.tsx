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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setSelectedPublisher(null)} className="mb-2">
          <ArrowLeft className="size-4 mr-2" /> Back to Publishers
        </Button>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex size-14 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/30 shrink-0">
                <Building2 className="size-7 text-emerald-600" />
              </div>
              <div className="space-y-1 flex-1">
                <h2 className="text-xl font-bold">{selectedPublisher.name}</h2>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {selectedPublisher.contact && (
                    <span className="flex items-center gap-1">
                      <Mail className="size-3" /> Contact: {selectedPublisher.contact}
                    </span>
                  )}
                  {selectedPublisher.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="size-3" /> {selectedPublisher.email}
                    </span>
                  )}
                  {selectedPublisher.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="size-3" /> {selectedPublisher.phone}
                    </span>
                  )}
                </div>
                {selectedPublisher.address && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="size-3" /> {selectedPublisher.address}
                  </p>
                )}
                {selectedPublisher.website && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Globe className="size-3" /> {selectedPublisher.website}
                  </p>
                )}
                {selectedPublisher.agreement && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <FileText className="size-3" /> Agreement: {selectedPublisher.agreement}
                  </p>
                )}
                <Badge
                  variant="secondary"
                  className="mt-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                >
                  {selectedPublisher._count.books} books
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Books by {selectedPublisher.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingBooks ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : publisherBooks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Building2 className="size-8 mb-2 opacity-40" />
                <p className="text-sm">No books from this publisher yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>ISBN</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {publisherBooks.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell className="font-medium">{book.title}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {book.author?.name || '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {book.isbn || '—'}
                      </TableCell>
                      <TableCell>
                        {book.category ? (
                          <Badge variant="outline" className="text-xs">
                            {book.category.name}
                          </Badge>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="text-right">${book.price.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Main Table View ────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header + Add */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Publishers</h2>
          <p className="text-sm text-muted-foreground">{total} publishers in database</p>
        </div>
        <Button onClick={openAdd} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="size-4 mr-2" /> Add Publisher
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, contact, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Publishers Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : publishers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Building2 className="size-10 mb-3 opacity-40" />
              <p className="font-medium">No publishers found</p>
              <p className="text-sm">Try adjusting your search or add a new publisher</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-center">Books</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {publishers.map((pub) => (
                    <TableRow
                      key={pub.id}
                      className="cursor-pointer hover:bg-muted/30"
                      onClick={() => openDetail(pub)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="flex size-8 items-center justify-center rounded bg-emerald-100 dark:bg-emerald-950/30 shrink-0">
                            <Building2 className="size-4 text-emerald-600" />
                          </div>
                          {pub.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {pub.contact || '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {pub.email || '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {pub.phone || '—'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="secondary"
                          className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                        >
                          {pub._count.books}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => openEdit(pub)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(pub.id)}
                            disabled={deleting === pub.id}
                          >
                            {deleting === pub.id ? (
                              <RefreshCw className="size-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="size-3.5" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({total} results)
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
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
            <DialogTitle>{editing ? 'Edit Publisher' : 'Add New Publisher'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label htmlFor="pub-name">Name *</Label>
              <Input
                id="pub-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Publisher name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pub-contact">Contact Person</Label>
                <Input
                  id="pub-contact"
                  value={form.contact}
                  onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                  placeholder="Contact name"
                />
              </div>
              <div>
                <Label htmlFor="pub-email">Email</Label>
                <Input
                  id="pub-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="publisher@example.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pub-phone">Phone</Label>
                <Input
                  id="pub-phone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+1-..."
                />
              </div>
              <div>
                <Label htmlFor="pub-website">Website</Label>
                <Input
                  id="pub-website"
                  value={form.website}
                  onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div>
              <Label htmlFor="pub-address">Address</Label>
              <Textarea
                id="pub-address"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="Full address..."
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="pub-agreement">Agreement</Label>
              <Textarea
                id="pub-agreement"
                value={form.agreement}
                onChange={(e) => setForm((f) => ({ ...f, agreement: e.target.value }))}
                placeholder="Distribution agreement details..."
                rows={2}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
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
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {saving ? (
                <RefreshCw className="size-4 mr-2 animate-spin" />
              ) : (
                <Plus className="size-4 mr-2" />
              )}
              {editing ? 'Update Publisher' : 'Create Publisher'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
