'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
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

  // ── Stats computation ──────────────────────────────────────
  const authorsWithBooks = authors.filter(a => a._count.books > 0).length
  const authorsWithEmail = authors.filter(a => a.email).length
  const nationalities = new Set(authors.map(a => a.nationality).filter(Boolean)).size

  // ── Detail View ────────────────────────────────────────────
  if (selectedAuthor) {
    const avatarColor = getAvatarColor(selectedAuthor.name)
    return (
      <div className="space-y-5">
        {/* Back button */}
        <MacosButton variant="ghost" icon={ArrowLeft} onClick={() => setSelectedAuthor(null)}>
          Back to Authors
        </MacosButton>

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
                <MacosBadge variant="success">
                  {selectedAuthor._count.books} {selectedAuthor._count.books === 1 ? 'book' : 'books'}
                </MacosBadge>
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

        {/* Stats Grid for Detail */}
        <MacosStatGrid>
          <MacosStatCard
            label="Total Books"
            value={selectedAuthor._count.books}
            icon={BookOpen}
            iconColor="text-macos-purple"
            iconBg="bg-macos-purple/10"
          />
          <MacosStatCard
            label="Nationality"
            value={selectedAuthor.nationality || 'N/A'}
            icon={Globe}
            iconColor="text-macos-teal"
            iconBg="bg-macos-teal/10"
          />
          <MacosStatCard
            label="Has Email"
            value={selectedAuthor.email ? 'Yes' : 'No'}
            icon={Mail}
            iconColor="text-macos-blue"
            iconBg="bg-macos-blue/10"
          />
          <MacosStatCard
            label="Has Website"
            value={selectedAuthor.website ? 'Yes' : 'No'}
            icon={ExternalLink}
            iconColor="text-macos-orange"
            iconBg="bg-macos-orange/10"
          />
        </MacosStatGrid>

        {/* Books by Author Card */}
        <MacosCard
          title={`Books by ${selectedAuthor.name}`}
          action={
            <MacosBadge variant="purple">{authorBooks.length}</MacosBadge>
          }
          noPadding
        >
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
            <MacosEmptyState
              icon={BookOpen}
              title="No books yet"
              description="This author hasn't been linked to any books"
            />
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50 hover:bg-transparent">
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Title</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">ISBN</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Category</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Publisher</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {authorBooks.map((book) => {
                    const catColor = book.category ? getCategoryColor(book.category.name) : null
                    return (
                      <TableRow key={book.id} className="macos-table-row border-b border-border/30">
                        <TableCell className="text-[13px] font-medium tracking-tight py-3">{book.title}</TableCell>
                        <TableCell className="text-[11px] text-muted-foreground font-mono py-3">
                          {book.isbn || <span className="text-muted-foreground/50">&mdash;</span>}
                        </TableCell>
                        <TableCell className="py-3">
                          {book.category && catColor ? (
                            <span className={`macos-badge ${catColor.bg} ${catColor.text}`}>
                              {book.category.name}
                            </span>
                          ) : (
                            <span className="text-[13px] text-muted-foreground/50">&mdash;</span>
                          )}
                        </TableCell>
                        <TableCell className="text-[13px] text-muted-foreground font-medium py-3">
                          {book.publisher?.name || <span className="text-muted-foreground/50">&mdash;</span>}
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

  // ── Main List View ─────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* macOS Page Header */}
      <MacosPageHeader
        title="Authors"
        subtitle={`${total} ${total === 1 ? 'author' : 'authors'} in your catalog`}
        icon={Users}
        iconColor="text-gg-sunset"
        iconBg="bg-gg-sunset/10"
      >
        {!isViewOnly && (
          <MacosButton variant="primary" icon={Plus} onClick={openAdd}>
            Add Author
          </MacosButton>
        )}
      </MacosPageHeader>

      {/* Stats Grid */}
      {!loading && authors.length > 0 && (
        <MacosStatGrid>
          <MacosStatCard
            label="Total Authors"
            value={total}
            icon={Users}
            iconColor="text-gg-sunset"
            iconBg="bg-gg-sunset/10"
          />
          <MacosStatCard
            label="With Books"
            value={authorsWithBooks}
            icon={BookOpen}
            iconColor="text-macos-purple"
            iconBg="bg-macos-purple/10"
          />
          <MacosStatCard
            label="With Email"
            value={authorsWithEmail}
            icon={Mail}
            iconColor="text-macos-blue"
            iconBg="bg-macos-blue/10"
          />
          <MacosStatCard
            label="Nationalities"
            value={nationalities}
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
        placeholder="Search by name, nationality, email..."
      />

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
        <MacosEmptyState
          icon={PenTool}
          title="No authors found"
          description="Try adjusting your search or add a new author"
          action={
            !isViewOnly ? (
              <MacosButton variant="primary" icon={Plus} onClick={openAdd}>
                Add Author
              </MacosButton>
            ) : undefined
          }
        />
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
                    <MacosBadge variant="success" className="mt-2">
                      {author._count.books} {author._count.books === 1 ? 'book' : 'books'}
                    </MacosBadge>
                  </div>
                </div>
                {author.bio && (
                  <p className="text-[13px] text-muted-foreground mt-3 line-clamp-2 leading-relaxed font-medium">
                    {author.bio}
                  </p>
                )}
                {/* Contact info row */}
                {author.email && (
                  <div className="flex items-center gap-3 mt-3 pt-2 border-t border-border/30">
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium truncate">
                      <Mail className="size-3 shrink-0" strokeWidth={1.5} />
                      <span className="truncate">{author.email}</span>
                    </span>
                  </div>
                )}
                {/* Actions */}
                {!isViewOnly && (
                  <div className="mt-3 flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                    <MacosButton
                      variant="ghost"
                      icon={Pencil}
                      onClick={() => openEdit(author)}
                      className="hover:bg-macos-blue/10 hover:text-macos-blue"
                    />
                    <MacosButton
                      variant="ghost"
                      icon={deleting === author.id ? RefreshCw : Trash2}
                      onClick={() => handleDelete(author.id)}
                      disabled={deleting === author.id}
                      className="hover:bg-macos-red/10 hover:text-macos-red"
                    />
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
        title={editing ? 'Edit Author' : 'Add New Author'}
        description={editing ? 'Update author information' : 'Fill in the author details'}
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
              {editing ? 'Update Author' : 'Create Author'}
            </MacosButton>
          </>
        }
      >
        <div className="space-y-4">
          <MacosFormField label="Name *" description="Required">
            <Input
              id="author-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Author name"
              className="rounded-lg border-border/50 text-[13px] h-8 mt-1 focus:ring-primary/20"
            />
          </MacosFormField>

          <MacosFormField label="Bio">
            <Textarea
              id="author-bio"
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="Author biography..."
              rows={3}
              className="rounded-lg border-border/50 text-[13px] mt-1 focus:ring-primary/20"
            />
          </MacosFormField>

          <div className="grid grid-cols-2 gap-3">
            <MacosFormField label="Nationality">
              <Input
                id="author-nationality"
                value={form.nationality}
                onChange={(e) => setForm((f) => ({ ...f, nationality: e.target.value }))}
                placeholder="e.g. American"
                className="rounded-lg border-border/50 text-[13px] h-8 mt-1 focus:ring-primary/20"
              />
            </MacosFormField>
            <MacosFormField label="Website">
              <Input
                id="author-website"
                value={form.website}
                onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                placeholder="https://..."
                className="rounded-lg border-border/50 text-[13px] h-8 mt-1 focus:ring-primary/20"
              />
            </MacosFormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MacosFormField label="Email">
              <Input
                id="author-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="author@example.com"
                className="rounded-lg border-border/50 text-[13px] h-8 mt-1 focus:ring-primary/20"
              />
            </MacosFormField>
            <MacosFormField label="Phone">
              <Input
                id="author-phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+1-..."
                className="rounded-lg border-border/50 text-[13px] h-8 mt-1 focus:ring-primary/20"
              />
            </MacosFormField>
          </div>
        </div>
      </MacosDialog>
    </div>
  )
}
