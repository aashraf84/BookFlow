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

// ── Avatar colors ──────────────────────────────────────────────
const avatarColors = [
  { bg: 'bg-macos-blue/10', text: 'text-macos-blue' },
  { bg: 'bg-macos-green/10', text: 'text-macos-green' },
  { bg: 'bg-macos-purple/10', text: 'text-macos-purple' },
  { bg: 'bg-macos-orange/10', text: 'text-macos-orange' },
  { bg: 'bg-macos-pink/10', text: 'text-macos-pink' },
  { bg: 'bg-macos-teal/10', text: 'text-macos-teal' },
  { bg: 'bg-macos-red/10', text: 'text-macos-red' },
  { bg: 'bg-macos-indigo/10', text: 'text-macos-indigo' },
]

const getAvatarColor = (name: string) => {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

// ── Nationality flag emoji ────────────────────────────────────
const nationalityFlags: Record<string, string> = {
  'American': '🇺🇸', 'British': '🇬🇧', 'French': '🇫🇷', 'German': '🇩🇪',
  'Japanese': '🇯🇵', 'Chinese': '🇨🇳', 'Indian': '🇮🇳', 'Spanish': '🇪🇸',
  'Italian': '🇮🇹', 'Russian': '🇷🇺', 'Brazilian': '🇧🇷', 'Canadian': '🇨🇦',
  'Australian': '🇦🇺', 'Mexican': '🇲🇽', 'Korean': '🇰🇷', 'Arab': '🌍',
  'Egyptian': '🇪🇬', 'Turkish': '🇹🇷', 'Iranian': '🇮🇷', 'Pakistani': '🇵🇰',
  'Nigerian': '🇳🇬', 'South African': '🇿🇦', 'Swedish': '🇸🇪', 'Norwegian': '🇳🇴',
  'Danish': '🇩🇰', 'Dutch': '🇳🇱', 'Portuguese': '🇵🇹', 'Greek': '🇬🇷',
  'Polish': '🇵🇱', 'Czech': '🇨🇿', 'Argentine': '🇦🇷', 'Colombian': '🇨🇴',
  'Thai': '🇹🇭', 'Vietnamese': '🇻🇳', 'Indonesian': '🇮🇩', 'Filipino': '🇵🇭',
  'Malaysian': '🇲🇾', 'Singaporean': '🇸🇬', 'Lebanese': '🇱🇧', 'Moroccan': '🇲🇦',
}

const getFlag = (nationality: string | null) => {
  if (!nationality) return ''
  return nationalityFlags[nationality] || '🌍'
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
    const avatarColor = getAvatarColor(selectedAuthor.name)
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedAuthor(null)}
          className="flex items-center gap-1.5 text-[13px] font-medium text-macos-blue hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} /> Back to Authors
        </button>

        <div className="rounded-2xl macos-shadow bg-card p-5">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className={`size-14 rounded-2xl ${avatarColor.bg} flex items-center justify-center shrink-0`}>
              <span className={`text-lg font-bold ${avatarColor.text}`}>
                {getInitials(selectedAuthor.name)}
              </span>
            </div>
            <div className="space-y-1 flex-1">
              <h2 className="text-xl font-bold tracking-tight">{selectedAuthor.name}</h2>
              {selectedAuthor.nationality && (
                <p className="text-[13px] text-muted-foreground flex items-center gap-1.5">
                  <Globe className="size-3.5" strokeWidth={1.5} /> {getFlag(selectedAuthor.nationality)} {selectedAuthor.nationality}
                </p>
              )}
              <div className="flex flex-wrap gap-3 text-[13px] text-muted-foreground mt-1">
                {selectedAuthor.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="size-3.5" strokeWidth={1.5} /> {selectedAuthor.email}
                  </span>
                )}
                {selectedAuthor.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="size-3.5" strokeWidth={1.5} /> {selectedAuthor.phone}
                  </span>
                )}
              </div>
              {selectedAuthor.bio && (
                <p className="text-[13px] text-muted-foreground mt-2">{selectedAuthor.bio}</p>
              )}
              <div className="mt-2">
                <Badge className="rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 bg-macos-green/10 text-macos-green">
                  {selectedAuthor._count.books} {selectedAuthor._count.books === 1 ? 'book' : 'books'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl macos-shadow bg-card p-5">
          <h3 className="text-[13px] font-semibold tracking-tight mb-3">
            Books by {selectedAuthor.name}
          </h3>
          {loadingBooks ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : authorBooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <BookOpen className="size-8 mb-2 opacity-40" strokeWidth={1.5} />
              <p className="text-[13px]">No books by this author yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Title</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">ISBN</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Category</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Publisher</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {authorBooks.map((book) => (
                  <TableRow key={book.id} className="hover:bg-secondary/50">
                    <TableCell className="text-[13px] font-medium">{book.title}</TableCell>
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
                    <TableCell className="text-[13px] text-muted-foreground">
                      {book.publisher?.name || '—'}
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

  // ── Main List View ─────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header + Add */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold tracking-tight">Authors</h2>
          <Badge className="rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 bg-macos-purple/10 text-macos-purple">
            {total} authors
          </Badge>
        </div>
        <Button onClick={openAdd} className="bg-primary text-primary-foreground rounded-lg font-medium text-[13px] h-8">
          <Plus className="size-4 mr-1.5" strokeWidth={1.5} /> Add Author
        </Button>
      </div>

      {/* Spotlight Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" strokeWidth={1.5} />
        <Input
          placeholder="Search by name, nationality, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 pl-8 focus-visible:ring-1 focus-visible:ring-primary/30"
        />
      </div>

      {/* Authors Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl macos-shadow bg-card p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-xl" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      ) : authors.length === 0 ? (
        <div className="rounded-2xl macos-shadow bg-card p-8 flex flex-col items-center justify-center text-muted-foreground">
          <PenTool className="size-10 mb-3 opacity-40" strokeWidth={1.5} />
          <p className="text-[13px] font-semibold">No authors found</p>
          <p className="text-[11px] mt-1">Try adjusting your search or add a new author</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {authors.map((author) => {
            const avatarColor = getAvatarColor(author.name)
            return (
              <div
                key={author.id}
                className="rounded-2xl macos-shadow macos-card-hover bg-card p-4 cursor-pointer"
                onClick={() => openDetail(author)}
              >
                <div className="flex items-start gap-3">
                  <div className={`size-10 rounded-xl ${avatarColor.bg} flex items-center justify-center shrink-0`}>
                    <span className={`text-sm font-bold ${avatarColor.text}`}>
                      {getInitials(author.name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[13px] font-semibold truncate">{author.name}</h3>
                    {author.nationality && (
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        {getFlag(author.nationality)} {author.nationality}
                      </p>
                    )}
                    <Badge className="mt-1.5 rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5 bg-macos-green/10 text-macos-green">
                      {author._count.books} {author._count.books === 1 ? 'book' : 'books'}
                    </Badge>
                  </div>
                </div>
                {author.bio && (
                  <p className="text-[13px] text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                    {author.bio}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-7 rounded-lg"
                    onClick={() => openEdit(author)}
                  >
                    <Pencil className="size-3.5" strokeWidth={1.5} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-7 rounded-lg text-macos-red hover:text-macos-red"
                    onClick={() => handleDelete(author.id)}
                    disabled={deleting === author.id}
                  >
                    {deleting === author.id ? (
                      <RefreshCw className="size-3.5 animate-spin" strokeWidth={1.5} />
                    ) : (
                      <Trash2 className="size-3.5" strokeWidth={1.5} />
                    )}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

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
              {editing ? 'Edit Author' : 'Add New Author'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <Label htmlFor="author-name" className="text-[11px] font-semibold">Name *</Label>
              <Input
                id="author-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Author name"
                className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </div>
            <div>
              <Label htmlFor="author-bio" className="text-[11px] font-semibold">Bio</Label>
              <Textarea
                id="author-bio"
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder="Author biography..."
                rows={3}
                className="rounded-lg bg-secondary/80 border-0 text-[13px] focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="author-nationality" className="text-[11px] font-semibold">Nationality</Label>
                <Input
                  id="author-nationality"
                  value={form.nationality}
                  onChange={(e) => setForm((f) => ({ ...f, nationality: e.target.value }))}
                  placeholder="e.g. American"
                  className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
              <div>
                <Label htmlFor="author-website" className="text-[11px] font-semibold">Website</Label>
                <Input
                  id="author-website"
                  value={form.website}
                  onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                  placeholder="https://..."
                  className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="author-email" className="text-[11px] font-semibold">Email</Label>
                <Input
                  id="author-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="author@example.com"
                  className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
              <div>
                <Label htmlFor="author-phone" className="text-[11px] font-semibold">Phone</Label>
                <Input
                  id="author-phone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+1-..."
                  className="rounded-lg bg-secondary/80 border-0 text-[13px] h-8 focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
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
              {editing ? 'Update Author' : 'Create Author'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
