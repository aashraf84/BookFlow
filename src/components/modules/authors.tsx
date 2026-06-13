'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  BookOpen,
  RefreshCw,
  Globe,
  Mail,
  Phone,
  PenTool,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
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
interface AuthorData {
  id: string
  name: string
  bio: string | null
  nationality: string | null
  website: string | null
  email: string | null
  phone: string | null
  createdAt: string
  _count: { books: number }
}

interface BookData {
  id: string
  title: string
  isbn: string | null
  price: number
  category: { id: string; name: string; type: string | null } | null
  publisher: { id: string; name: string } | null
}

interface AuthorFormData {
  name: string
  bio: string
  nationality: string
  website: string
  email: string
  phone: string
}

const emptyForm: AuthorFormData = {
  name: '',
  bio: '',
  nationality: '',
  website: '',
  email: '',
  phone: '',
}

// ── Component ────────────────────────────────────────────────────
export default function AuthorsModule() {
  const [authors, setAuthors] = useState<AuthorData[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AuthorData | null>(null)
  const [form, setForm] = useState<AuthorFormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Detail view state
  const [selectedAuthor, setSelectedAuthor] = useState<AuthorData | null>(null)
  const [authorBooks, setAuthorBooks] = useState<BookData[]>([])
  const [loadingBooks, setLoadingBooks] = useState(false)

  const limit = 12

  // ── Fetch authors ──────────────────────────────────────────
  const fetchAuthors = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      })
      if (search) params.set('search', search)

      const res = await fetch(`/api/authors?${params}`)
      if (!res.ok) throw new Error('Failed to fetch authors')
      const json = await res.json()
      setAuthors(json.data || [])
      setTotal(json.pagination?.total || 0)
    } catch {
      setAuthors([])
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    fetchAuthors()
  }, [fetchAuthors])

  useEffect(() => {
    setPage(1)
  }, [search])

  // ── Fetch author books ─────────────────────────────────────
  const fetchAuthorBooks = async (authorId: string) => {
    setLoadingBooks(true)
    try {
      const res = await fetch(`/api/books?authorId=${authorId}&limit=50`)
      if (!res.ok) throw new Error('Failed to fetch books')
      const json = await res.json()
      setAuthorBooks(json.data || [])
    } catch {
      setAuthorBooks([])
    } finally {
      setLoadingBooks(false)
    }
  }

  // ── Open detail view ───────────────────────────────────────
  const openDetail = (author: AuthorData) => {
    setSelectedAuthor(author)
    fetchAuthorBooks(author.id)
  }

  // ── Save author ────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        bio: form.bio || null,
        nationality: form.nationality || null,
        website: form.website || null,
        email: form.email || null,
        phone: form.phone || null,
      }

      let res: Response
      if (editing) {
        res = await fetch('/api/authors', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editing.id, ...payload }),
        })
      } else {
        res = await fetch('/api/authors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save author')
      }

      setDialogOpen(false)
      setEditing(null)
      setForm(emptyForm)
      fetchAuthors()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save author')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete author ──────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this author?')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/authors?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to delete')
      }
      fetchAuthors()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete author')
    } finally {
      setDeleting(null)
    }
  }

  // ── Open dialog for edit ───────────────────────────────────
  const openEdit = (author: AuthorData) => {
    setEditing(author)
    setForm({
      name: author.name,
      bio: author.bio || '',
      nationality: author.nationality || '',
      website: author.website || '',
      email: author.email || '',
      phone: author.phone || '',
    })
    setDialogOpen(true)
  }

  // ── Open dialog for add ────────────────────────────────────
  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

  const totalPages = Math.ceil(total / limit)

  // ── Detail View ────────────────────────────────────────────
  if (selectedAuthor) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setSelectedAuthor(null)} className="mb-2">
          <ArrowLeft className="size-4 mr-2" /> Back to Authors
        </Button>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Avatar className="size-16">
                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-lg font-semibold dark:bg-emerald-950/30 dark:text-emerald-400">
                  {getInitials(selectedAuthor.name)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1 flex-1">
                <h2 className="text-xl font-bold">{selectedAuthor.name}</h2>
                {selectedAuthor.nationality && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Globe className="size-3" /> {selectedAuthor.nationality}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {selectedAuthor.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="size-3" /> {selectedAuthor.email}
                    </span>
                  )}
                  {selectedAuthor.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="size-3" /> {selectedAuthor.phone}
                    </span>
                  )}
                </div>
                {selectedAuthor.bio && (
                  <p className="text-sm text-muted-foreground mt-2">{selectedAuthor.bio}</p>
                )}
                <div className="mt-2">
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                    {selectedAuthor._count.books} books
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Books by {selectedAuthor.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingBooks ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : authorBooks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <BookOpen className="size-8 mb-2 opacity-40" />
                <p className="text-sm">No books by this author yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>ISBN</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Publisher</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {authorBooks.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell className="font-medium">{book.title}</TableCell>
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
                      <TableCell className="text-muted-foreground">
                        {book.publisher?.name || '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        ${book.price.toFixed(2)}
                      </TableCell>
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

  // ── Main List View ─────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header + Add */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Authors</h2>
          <p className="text-sm text-muted-foreground">{total} authors in database</p>
        </div>
        <Button onClick={openAdd} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="size-4 mr-2" /> Add Author
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, nationality, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Authors Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-12 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : authors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <PenTool className="size-10 mb-3 opacity-40" />
            <p className="font-medium">No authors found</p>
            <p className="text-sm">Try adjusting your search or add a new author</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {authors.map((author) => (
            <Card
              key={author.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => openDetail(author)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="size-12 shrink-0">
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold dark:bg-emerald-950/30 dark:text-emerald-400">
                      {getInitials(author.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{author.name}</h3>
                    {author.nationality && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Globe className="size-3" /> {author.nationality}
                      </p>
                    )}
                    <Badge
                      variant="secondary"
                      className="mt-1 text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                    >
                      {author._count.books} {author._count.books === 1 ? 'book' : 'books'}
                    </Badge>
                  </div>
                </div>
                {author.bio && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {author.bio}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-8"
                    onClick={() => openEdit(author)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(author.id)}
                    disabled={deleting === author.id}
                  >
                    {deleting === author.id ? (
                      <RefreshCw className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
            <DialogTitle>{editing ? 'Edit Author' : 'Add New Author'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label htmlFor="author-name">Name *</Label>
              <Input
                id="author-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Author name"
              />
            </div>
            <div>
              <Label htmlFor="author-bio">Bio</Label>
              <Textarea
                id="author-bio"
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder="Author biography..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="author-nationality">Nationality</Label>
                <Input
                  id="author-nationality"
                  value={form.nationality}
                  onChange={(e) => setForm((f) => ({ ...f, nationality: e.target.value }))}
                  placeholder="e.g. American"
                />
              </div>
              <div>
                <Label htmlFor="author-website">Website</Label>
                <Input
                  id="author-website"
                  value={form.website}
                  onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="author-email">Email</Label>
                <Input
                  id="author-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="author@example.com"
                />
              </div>
              <div>
                <Label htmlFor="author-phone">Phone</Label>
                <Input
                  id="author-phone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+1-..."
                />
              </div>
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
              {editing ? 'Update Author' : 'Create Author'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
