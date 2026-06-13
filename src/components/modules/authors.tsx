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
  Users,
  X,
  ExternalLink,
  MapPin,
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
import { useAppStore } from '@/store/app-store'

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

// ── Avatar color palette (macOS Retina + Golden Gate) ──────────
const avatarColors = [
  { bg: 'bg-macos-blue/10', text: 'text-macos-blue', ring: 'ring-macos-blue/20' },
  { bg: 'bg-macos-green/10', text: 'text-macos-green', ring: 'ring-macos-green/20' },
  { bg: 'bg-macos-purple/10', text: 'text-macos-purple', ring: 'ring-macos-purple/20' },
  { bg: 'bg-macos-orange/10', text: 'text-macos-orange', ring: 'ring-macos-orange/20' },
  { bg: 'bg-macos-pink/10', text: 'text-macos-pink', ring: 'ring-macos-pink/20' },
  { bg: 'bg-macos-teal/10', text: 'text-macos-teal', ring: 'ring-macos-teal/20' },
  { bg: 'bg-gg-bay/10', text: 'text-gg-bay', ring: 'ring-gg-bay/20' },
  { bg: 'bg-gg-sunset/10', text: 'text-gg-sunset', ring: 'ring-gg-sunset/20' },
  { bg: 'bg-macos-red/10', text: 'text-macos-red', ring: 'ring-macos-red/20' },
  { bg: 'bg-gg-golden/10', text: 'text-gg-golden', ring: 'ring-gg-golden/20' },
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
export function AuthorsModule() {
  const { authUser } = useAppStore()
  const isViewOnly = authUser?.isViewOnly ?? false

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
      <div className="space-y-5">
        {/* Back button */}
        <button
          onClick={() => setSelectedAuthor(null)}
          className="flex items-center gap-1.5 text-[13px] font-medium text-macos-blue hover:text-macos-blue/80 transition-colors"
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} /> Back to Authors
        </button>

        {/* Author Profile Card */}
        <div className="macos-card macos-shadow-card p-6">
          <div className="flex flex-col sm:flex-row gap-5">
            <div className={`size-16 rounded-2xl ${avatarColor.bg} flex items-center justify-center shrink-0 ring-2 ${avatarColor.ring} ring-offset-2 ring-offset-card`}>
              <span className={`text-xl font-bold ${avatarColor.text}`}>
                {getInitials(selectedAuthor.name)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="macos-page-title text-[20px]">{selectedAuthor.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {selectedAuthor.nationality && (
                  <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground font-medium">
                    <MapPin className="size-3" strokeWidth={1.5} />
                    {getFlag(selectedAuthor.nationality)} {selectedAuthor.nationality}
                  </span>
                )}
                <span className={`macos-badge bg-macos-green/10 text-macos-green`}>
                  {selectedAuthor._count.books} {selectedAuthor._count.books === 1 ? 'book' : 'books'}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 mt-3">
                {selectedAuthor.email && (
                  <a
                    href={`mailto:${selectedAuthor.email}`}
                    className="flex items-center gap-1.5 text-[12px] font-medium text-macos-blue hover:text-macos-blue/80 transition-colors"
                  >
                    <Mail className="size-3" strokeWidth={1.5} /> {selectedAuthor.email}
                  </a>
                )}
                {selectedAuthor.phone && (
                  <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground font-medium">
                    <Phone className="size-3" strokeWidth={1.5} /> {selectedAuthor.phone}
                  </span>
                )}
                {selectedAuthor.website && (
                  <a
                    href={selectedAuthor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[12px] font-medium text-macos-blue hover:text-macos-blue/80 transition-colors"
                  >
                    <ExternalLink className="size-3" strokeWidth={1.5} /> Website
                  </a>
                )}
              </div>
              {selectedAuthor.bio && (
                <p className="text-[13px] text-muted-foreground mt-3 leading-relaxed max-w-2xl">
                  {selectedAuthor.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Books by Author Card */}
        <div className="macos-card macos-shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border/30">
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-macos-purple" strokeWidth={1.5} />
              <h3 className="macos-section-title">
                Books by {selectedAuthor.name}
              </h3>
              <span className="macos-badge bg-macos-purple/10 text-macos-purple ml-1">
                {authorBooks.length}
              </span>
            </div>
          </div>
          {loadingBooks ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-8 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : authorBooks.length === 0 ? (
            <div className="macos-empty py-12">
              <div className="size-12 rounded-2xl bg-macos-orange/10 flex items-center justify-center mb-3">
                <BookOpen className="size-6 text-macos-orange" strokeWidth={1.5} />
              </div>
              <p className="text-[13px] font-semibold text-foreground">No books yet</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                This author hasn&apos;t been linked to any books
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50 hover:bg-transparent">
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Title</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">ISBN</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Category</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Publisher</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {authorBooks.map((book) => {
                    const catColor = book.category ? getCategoryColor(book.category.name) : null
                    return (
                      <TableRow key={book.id} className="macos-table-row border-b border-border/30">
                        <TableCell className="text-[13px] font-medium">{book.title}</TableCell>
                        <TableCell className="text-[11px] text-muted-foreground font-mono">
                          {book.isbn || <span className="text-muted-foreground/50">—</span>}
                        </TableCell>
                        <TableCell>
                          {book.category && catColor ? (
                            <span className={`macos-badge ${catColor.bg} ${catColor.text}`}>
                              {book.category.name}
                            </span>
                          ) : (
                            <span className="text-[13px] text-muted-foreground/50">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-[13px] text-muted-foreground font-medium">
                          {book.publisher?.name || <span className="text-muted-foreground/50">—</span>}
                        </TableCell>
                        <TableCell className="text-[13px] text-right font-semibold tracking-tight">
                          ${book.price.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Main List View ─────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* macOS Page Header */}
      <div className="macos-page-header flex-col gap-3 sm:flex-row">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-9 rounded-xl bg-gg-sunset/10">
            <Users className="size-[18px] text-gg-sunset" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="macos-page-title">Authors</h1>
            <p className="macos-page-subtitle">
              {total} {total === 1 ? 'author' : 'authors'} in your catalog
            </p>
          </div>
        </div>
        {!isViewOnly && (
          <Button
            onClick={openAdd}
            className="bg-primary text-primary-foreground rounded-lg font-medium text-[13px] h-8 gap-1.5"
          >
            <Plus className="size-4" strokeWidth={1.5} /> Add Author
          </Button>
        )}
      </div>

      {/* Spotlight Search */}
      <div className="macos-card macos-shadow-card p-4">
        <div className="macos-search flex items-center gap-2 px-3 py-1.5">
          <Search className="size-[14px] text-muted-foreground shrink-0" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search by name, nationality, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-0 outline-none text-[13px] font-medium placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="size-4 rounded-full bg-muted-foreground/20 flex items-center justify-center hover:bg-muted-foreground/30 transition-colors"
            >
              <X className="size-2.5 text-background" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* Authors Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="macos-card macos-shadow-card p-4 space-y-3">
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
        <div className="macos-card macos-shadow-card">
          <div className="macos-empty py-16">
            <div className="size-14 rounded-2xl bg-gg-golden/10 flex items-center justify-center mb-4">
              <PenTool className="size-7 text-gg-golden" strokeWidth={1.5} />
            </div>
            <p className="text-[13px] font-semibold text-foreground">No authors found</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Try adjusting your search or add a new author
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {authors.map((author) => {
            const avatarColor = getAvatarColor(author.name)
            return (
              <div
                key={author.id}
                className="macos-card macos-shadow-card macos-card-hover p-4 cursor-pointer group"
                onClick={() => openDetail(author)}
              >
                <div className="flex items-start gap-3">
                  <div className={`size-10 rounded-xl ${avatarColor.bg} flex items-center justify-center shrink-0`}>
                    <span className={`text-sm font-bold ${avatarColor.text}`}>
                      {getInitials(author.name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[13px] font-semibold truncate group-hover:text-macos-blue transition-colors">{author.name}</h3>
                    {author.nationality && (
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 font-medium">
                        <Globe className="size-3" strokeWidth={1.5} />
                        {getFlag(author.nationality)} {author.nationality}
                      </p>
                    )}
                    <span className="macos-badge bg-macos-green/10 text-macos-green mt-2 inline-block">
                      {author._count.books} {author._count.books === 1 ? 'book' : 'books'}
                    </span>
                  </div>
                </div>
                {author.bio && (
                  <p className="text-[13px] text-muted-foreground mt-3 line-clamp-2 leading-relaxed font-medium">
                    {author.bio}
                  </p>
                )}
                {/* Contact info row */}
                {(author.email || author.website) && (
                  <div className="flex items-center gap-3 mt-3 pt-2 border-t border-border/30">
                    {author.email && (
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium truncate">
                        <Mail className="size-3 shrink-0" strokeWidth={1.5} />
                        <span className="truncate">{author.email}</span>
                      </span>
                    )}
                  </div>
                )}
                {/* Actions */}
                {!isViewOnly && (
                  <div className="mt-3 flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="size-7 rounded-lg hover:bg-macos-blue/10 hover:text-macos-blue"
                      onClick={() => openEdit(author)}
                    >
                      <Pencil className="size-3.5" strokeWidth={1.5} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="size-7 rounded-lg hover:bg-macos-red/10 hover:text-macos-red"
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
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-[11px] text-muted-foreground font-medium">
            Page {page} of {totalPages} &middot; {total} results
          </p>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-lg h-7 text-[12px] font-medium gap-1 hover:bg-macos-blue/10 hover:text-macos-blue"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ArrowLeft className="size-3.5" strokeWidth={1.5} /> Prev
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-lg h-7 text-[12px] font-medium gap-1 hover:bg-macos-blue/10 hover:text-macos-blue"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next <ArrowLeft className="size-3.5 rotate-180" strokeWidth={1.5} />
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
        <DialogContent className="max-w-lg rounded-2xl macos-shadow-float border-border/50 p-0 overflow-hidden">
          {/* macOS Dialog Header */}
          <div className="bg-card/95 backdrop-blur-xl border-b border-border/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-8 rounded-lg bg-gg-sunset/10">
                  <PenTool className="size-4 text-gg-sunset" strokeWidth={1.5} />
                </div>
                <div>
                  <DialogTitle className="text-[15px] font-semibold tracking-tight">
                    {editing ? 'Edit Author' : 'Add New Author'}
                  </DialogTitle>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {editing ? 'Update author information' : 'Fill in the author details'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setDialogOpen(false)
                  setEditing(null)
                  setForm(emptyForm)
                }}
                className="size-6 rounded-md hover:bg-secondary flex items-center justify-center transition-colors"
              >
                <X className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <div className="px-6 py-4 space-y-4">
            {/* Name */}
            <div>
              <Label htmlFor="author-name" className="text-[12px] font-medium text-muted-foreground">Name *</Label>
              <Input
                id="author-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Author name"
                className="rounded-lg border-border/50 text-[13px] h-8 mt-1 focus:ring-primary/20"
              />
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="author-bio" className="text-[12px] font-medium text-muted-foreground">Bio</Label>
              <Textarea
                id="author-bio"
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder="Author biography..."
                rows={3}
                className="rounded-lg border-border/50 text-[13px] mt-1 focus:ring-primary/20"
              />
            </div>

            {/* Nationality + Website */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="author-nationality" className="text-[12px] font-medium text-muted-foreground flex items-center gap-1">
                  <Globe className="size-3" strokeWidth={1.5} /> Nationality
                </Label>
                <Input
                  id="author-nationality"
                  value={form.nationality}
                  onChange={(e) => setForm((f) => ({ ...f, nationality: e.target.value }))}
                  placeholder="e.g. American"
                  className="rounded-lg border-border/50 text-[13px] h-8 mt-1 focus:ring-primary/20"
                />
              </div>
              <div>
                <Label htmlFor="author-website" className="text-[12px] font-medium text-muted-foreground flex items-center gap-1">
                  <ExternalLink className="size-3" strokeWidth={1.5} /> Website
                </Label>
                <Input
                  id="author-website"
                  value={form.website}
                  onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                  placeholder="https://..."
                  className="rounded-lg border-border/50 text-[13px] h-8 mt-1 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="author-email" className="text-[12px] font-medium text-muted-foreground flex items-center gap-1">
                  <Mail className="size-3" strokeWidth={1.5} /> Email
                </Label>
                <Input
                  id="author-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="author@example.com"
                  className="rounded-lg border-border/50 text-[13px] h-8 mt-1 focus:ring-primary/20"
                />
              </div>
              <div>
                <Label htmlFor="author-phone" className="text-[12px] font-medium text-muted-foreground flex items-center gap-1">
                  <Phone className="size-3" strokeWidth={1.5} /> Phone
                </Label>
                <Input
                  id="author-phone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+1-..."
                  className="rounded-lg border-border/50 text-[13px] h-8 mt-1 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* Dialog Footer */}
          <div className="border-t border-border/50 px-6 py-3 flex justify-end gap-2">
            <Button
              variant="ghost"
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
              className="bg-primary text-primary-foreground rounded-lg text-[13px] font-medium h-8 gap-1.5"
            >
              {saving ? (
                <RefreshCw className="size-4 animate-spin" strokeWidth={1.5} />
              ) : (
                <Plus className="size-4" strokeWidth={1.5} />
              )}
              {editing ? 'Update Author' : 'Create Author'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
