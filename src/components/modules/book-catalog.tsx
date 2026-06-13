'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  RefreshCw,
  X,
  Filter,
  Library,
  Tag,
  DollarSign,
  BookMarked,
  Hash,
  Languages,
  GraduationCap,
  FileText,
  Barcode,
  BookCopy,
  CircleDollarSign,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/store/app-store'
import {
  MacosPageHeader,
  MacosStatCard,
  MacosCard,
  MacosSearch,
  MacosButton,
  MacosBadge,
  MacosDialog,
  MacosEmptyState,
  MacosFormField,
  MacosStatGrid,
} from '@/components/macos-ui'

// ── Types ────────────────────────────────────────────────────────
interface Author {
  id: string
  name: string
}

interface Publisher {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
  type: string | null
  _count: { books: number }
}

interface Book {
  id: string
  isbn: string | null
  title: string
  subtitle: string | null
  authorId: string | null
  publisherId: string | null
  categoryId: string | null
  edition: string | null
  language: string
  pages: number | null
  publishYear: number | null
  description: string | null
  price: number
  costPrice: number
  discount: number
  academicLevel: string | null
  subject: string | null
  barcode: string | null
  isActive: boolean
  author: { id: string; name: string } | null
  publisher: { id: string; name: string; type: string | null } | null
  category: { id: string; name: string; type: string | null } | null
}

interface BookFormData {
  title: string
  subtitle: string
  isbn: string
  authorId: string
  publisherId: string
  categoryId: string
  edition: string
  language: string
  pages: string
  publishYear: string
  description: string
  price: string
  costPrice: string
  discount: string
  academicLevel: string
  subject: string
  barcode: string
}

const emptyForm: BookFormData = {
  title: '',
  subtitle: '',
  isbn: '',
  authorId: '',
  publisherId: '',
  categoryId: '',
  edition: '',
  language: 'English',
  pages: '',
  publishYear: '',
  description: '',
  price: '',
  costPrice: '',
  discount: '',
  academicLevel: '',
  subject: '',
  barcode: '',
}

// ── Cover color palette (macOS Retina + Golden Gate) ──────────
const coverColors = [
  { bg: 'bg-macos-blue/10', text: 'text-macos-blue', accent: 'bg-macos-blue' },
  { bg: 'bg-macos-purple/10', text: 'text-macos-purple', accent: 'bg-macos-purple' },
  { bg: 'bg-macos-orange/10', text: 'text-macos-orange', accent: 'bg-macos-orange' },
  { bg: 'bg-macos-green/10', text: 'text-macos-green', accent: 'bg-macos-green' },
  { bg: 'bg-macos-pink/10', text: 'text-macos-pink', accent: 'bg-macos-pink' },
  { bg: 'bg-macos-teal/10', text: 'text-macos-teal', accent: 'bg-macos-teal' },
  { bg: 'bg-gg-bay/10', text: 'text-gg-bay', accent: 'bg-gg-bay' },
  { bg: 'bg-gg-sunset/10', text: 'text-gg-sunset', accent: 'bg-gg-sunset' },
]

const getCoverColor = (title: string) => {
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash)
  }
  return coverColors[Math.abs(hash) % coverColors.length]
}

// ── Category badge colors ──────────────────────────────────────
const categoryBadgeVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'> = {
  'Fiction': 'purple',
  'Non-Fiction': 'info',
  'Science': 'info',
  'Technology': 'warning',
  'History': 'danger',
  'Art': 'purple',
  'Business': 'success',
  'Education': 'info',
  'Literature': 'default',
  'Philosophy': 'purple',
}

const getCategoryBadgeVariant = (name: string) => {
  return categoryBadgeVariant[name] || 'default'
}

// ── Component ────────────────────────────────────────────────────
export default function BookCatalogModule() {
  const { authUser } = useAppStore()
  const isViewOnly = authUser?.isViewOnly ?? false

  const [books, setBooks] = useState<Book[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterAuthor, setFilterAuthor] = useState('')
  const [filterPublisher, setFilterPublisher] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Book | null>(null)
  const [form, setForm] = useState<BookFormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Dropdown data
  const [authors, setAuthors] = useState<Author[]>([])
  const [publishers, setPublishers] = useState<Publisher[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const limit = 10

  // ── Fetch dropdown data ────────────────────────────────────
  useEffect(() => {
    Promise.all([
      fetch('/api/authors?limit=200').then((r) => r.json()),
      fetch('/api/publishers?limit=200').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ]).then(([authorsJson, publishersJson, categoriesJson]) => {
      setAuthors(authorsJson.data || [])
      setPublishers(publishersJson.data || [])
      setCategories(categoriesJson.data || [])
    })
  }, [])

  // ── Fetch books ────────────────────────────────────────────
  const fetchBooks = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      })
      if (search) params.set('search', search)
      if (filterCategory && filterCategory !== 'all') params.set('categoryId', filterCategory)
      if (filterAuthor && filterAuthor !== 'all') params.set('authorId', filterAuthor)
      if (filterPublisher && filterPublisher !== 'all') params.set('publisherId', filterPublisher)

      const res = await fetch(`/api/books?${params}`)
      if (!res.ok) throw new Error('Failed to fetch books')
      const json = await res.json()
      setBooks(json.data || [])
      setTotalPages(json.pagination?.totalPages || 1)
      setTotal(json.pagination?.total || 0)
    } catch {
      setBooks([])
    } finally {
      setLoading(false)
    }
  }, [page, search, filterCategory, filterAuthor, filterPublisher])

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [search, filterCategory, filterAuthor, filterPublisher])

  // ── Save book (create or update) ───────────────────────────
  const handleSave = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        subtitle: form.subtitle || null,
        isbn: form.isbn || null,
        authorId: form.authorId || null,
        publisherId: form.publisherId || null,
        categoryId: form.categoryId || null,
        edition: form.edition || null,
        language: form.language || 'English',
        pages: form.pages ? parseInt(form.pages) : null,
        publishYear: form.publishYear ? parseInt(form.publishYear) : null,
        description: form.description || null,
        price: form.price ? parseFloat(form.price) : 0,
        costPrice: form.costPrice ? parseFloat(form.costPrice) : 0,
        discount: form.discount ? parseFloat(form.discount) : 0,
        academicLevel: form.academicLevel || null,
        subject: form.subject || null,
        barcode: form.barcode || null,
      }

      let res: Response
      if (editing) {
        payload.id = editing.id
        res = await fetch('/api/books', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save book')
      }

      setDialogOpen(false)
      setEditing(null)
      setForm(emptyForm)
      fetchBooks()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save book')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete book ────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/books?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to delete')
      }
      fetchBooks()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete book')
    } finally {
      setDeleting(null)
    }
  }

  // ── Open dialog for edit ───────────────────────────────────
  const openEdit = (book: Book) => {
    setEditing(book)
    setForm({
      title: book.title,
      subtitle: book.subtitle || '',
      isbn: book.isbn || '',
      authorId: book.authorId || '',
      publisherId: book.publisherId || '',
      categoryId: book.categoryId || '',
      edition: book.edition || '',
      language: book.language || 'English',
      pages: book.pages?.toString() || '',
      publishYear: book.publishYear?.toString() || '',
      description: book.description || '',
      price: book.price?.toString() || '',
      costPrice: book.costPrice?.toString() || '',
      discount: book.discount?.toString() || '',
      academicLevel: book.academicLevel || '',
      subject: book.subject || '',
      barcode: book.barcode || '',
    })
    setDialogOpen(true)
  }

  // ── Open dialog for add ────────────────────────────────────
  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

  const hasActiveFilters = search || (filterCategory && filterCategory !== 'all') || (filterAuthor && filterAuthor !== 'all') || (filterPublisher && filterPublisher !== 'all')

  // ── Computed stats ─────────────────────────────────────────
  const activeBooks = books.filter((b) => b.isActive).length
  const totalValue = books.reduce((sum, b) => sum + b.price, 0)

  return (
    <div className="space-y-5">
      {/* ── macOS Page Header ──────────────────────────────────── */}
      <MacosPageHeader
        title="Book Catalog"
        subtitle={`${total} ${total === 1 ? 'book' : 'books'} in your library`}
        icon={Library}
        iconColor="text-macos-blue"
        iconBg="bg-macos-blue/10"
      >
        {!isViewOnly && (
          <MacosButton variant="primary" icon={Plus} onClick={openAdd}>
            Add Book
          </MacosButton>
        )}
      </MacosPageHeader>

      {/* ── Stat Cards ─────────────────────────────────────────── */}
      <MacosStatGrid>
        <MacosStatCard
          label="Total Books"
          value={total}
          icon={BookCopy}
          iconColor="text-macos-blue"
          iconBg="bg-macos-blue/10"
        />
        <MacosStatCard
          label="Active"
          value={activeBooks}
          icon={BookOpen}
          iconColor="text-macos-green"
          iconBg="bg-macos-green/10"
        />
        <MacosStatCard
          label="Categories"
          value={categories.length}
          icon={Tag}
          iconColor="text-macos-purple"
          iconBg="bg-macos-purple/10"
        />
        <MacosStatCard
          label="Page Value"
          value={formatCurrency(totalValue)}
          icon={CircleDollarSign}
          iconColor="text-macos-orange"
          iconBg="bg-macos-orange/10"
        />
      </MacosStatGrid>

      {/* ── Search & Filters Card ──────────────────────────────── */}
      <div className="macos-card macos-shadow-card p-4">
        {/* Spotlight-style search */}
        <div className="mb-3">
          <MacosSearch
            value={search}
            onChange={setSearch}
            placeholder="Search by title, ISBN, author..."
          />
        </div>

        {/* Filter bar with segmented control style */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="macos-filter-bar">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="border-0 bg-transparent shadow-none text-[12px] font-medium h-6 w-auto min-w-[120px] p-0 pl-2 pr-6 focus:ring-0">
                <Filter className="size-3 mr-1 text-muted-foreground" strokeWidth={1.5} />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="macos-filter-bar">
            <Select value={filterAuthor} onValueChange={setFilterAuthor}>
              <SelectTrigger className="border-0 bg-transparent shadow-none text-[12px] font-medium h-6 w-auto min-w-[110px] p-0 pl-2 pr-6 focus:ring-0">
                <Filter className="size-3 mr-1 text-muted-foreground" strokeWidth={1.5} />
                <SelectValue placeholder="Author" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Authors</SelectItem>
                {authors.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="macos-filter-bar">
            <Select value={filterPublisher} onValueChange={setFilterPublisher}>
              <SelectTrigger className="border-0 bg-transparent shadow-none text-[12px] font-medium h-6 w-auto min-w-[120px] p-0 pl-2 pr-6 focus:ring-0">
                <Filter className="size-3 mr-1 text-muted-foreground" strokeWidth={1.5} />
                <SelectValue placeholder="Publisher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Publishers</SelectItem>
                {publishers.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearch('')
                setFilterCategory('')
                setFilterAuthor('')
                setFilterPublisher('')
              }}
              className="macos-filter-item macos-filter-item-active flex items-center gap-1 text-[11px] text-macos-red"
            >
              <X className="size-3" strokeWidth={1.5} /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* ── Books Table Card ────────────────────────────────────── */}
      <div className="macos-card macos-shadow-card overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-3/5" />
                  <Skeleton className="h-3 w-2/5" />
                </div>
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <MacosEmptyState
            icon={BookOpen}
            title="No books found"
            description="Try adjusting your search or filters"
            action={
              !isViewOnly ? (
                <MacosButton variant="primary" icon={Plus} onClick={openAdd}>
                  Add Your First Book
                </MacosButton>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 px-5 text-left font-medium">Title</th>
                  <th className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 px-3 text-left font-medium">Author</th>
                  <th className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 px-3 text-left font-medium">ISBN</th>
                  <th className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 px-3 text-left font-medium">Category</th>
                  <th className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 px-3 text-right font-medium">Price</th>
                  <th className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 px-3 text-left font-medium">Stock</th>
                  {!isViewOnly && (
                    <th className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 h-9 px-3 text-right font-medium">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {books.map((book) => {
                  const colorClass = getCoverColor(book.title)
                  return (
                    <tr key={book.id} className="macos-table-row border-b border-border/30 last:border-0">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <div className={`size-9 rounded-xl ${colorClass.bg} flex items-center justify-center shrink-0`}>
                            <span className={`text-[11px] font-bold ${colorClass.text}`}>
                              {book.title.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold tracking-tight truncate max-w-[200px] leading-tight">{book.title}</p>
                            {book.subtitle && (
                              <p className="text-[11px] text-muted-foreground truncate max-w-[200px] mt-0.5">
                                {book.subtitle}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[13px] text-muted-foreground font-medium tracking-tight">
                        {book.author?.name || <span className="text-muted-foreground/50">—</span>}
                      </td>
                      <td className="py-3 px-3 text-[11px] text-muted-foreground font-mono">
                        {book.isbn || <span className="text-muted-foreground/50">—</span>}
                      </td>
                      <td className="py-3 px-3">
                        {book.category ? (
                          <MacosBadge variant={getCategoryBadgeVariant(book.category.name)}>
                            {book.category.name}
                          </MacosBadge>
                        ) : (
                          <span className="text-[13px] text-muted-foreground/50">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-[13px] text-right font-semibold tracking-tight text-foreground">
                        {formatCurrency(book.price)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <div className={`size-[6px] rounded-full ${
                            book.isActive ? 'bg-macos-green' : 'bg-macos-red'
                          }`} />
                          <span className="text-[11px] text-muted-foreground font-medium">
                            {book.isActive ? 'In Stock' : 'Out'}
                          </span>
                        </div>
                      </td>
                      {!isViewOnly && (
                        <td className="py-3 px-3 text-right">
                          <div className="flex justify-end gap-0.5">
                            <button
                              className="size-7 rounded-lg inline-flex items-center justify-center hover:bg-macos-blue/10 hover:text-macos-blue transition-colors text-muted-foreground"
                              onClick={() => openEdit(book)}
                            >
                              <Pencil className="size-3.5" strokeWidth={1.5} />
                            </button>
                            <button
                              className="size-7 rounded-lg inline-flex items-center justify-center hover:bg-macos-red/10 hover:text-macos-red transition-colors text-muted-foreground"
                              onClick={() => handleDelete(book.id)}
                              disabled={deleting === book.id}
                            >
                              {deleting === book.id ? (
                                <RefreshCw className="size-3.5 animate-spin" strokeWidth={1.5} />
                              ) : (
                                <Trash2 className="size-3.5" strokeWidth={1.5} />
                              )}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination ──────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-[11px] text-muted-foreground font-medium">
            Page {page} of {totalPages} &middot; {total} results
          </p>
          <div className="flex gap-1">
            <MacosButton
              variant="ghost"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              icon={ChevronLeft}
            >
              Prev
            </MacosButton>
            <MacosButton
              variant="ghost"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next <ChevronRight className="size-3.5 ml-1" strokeWidth={1.5} />
            </MacosButton>
          </div>
        </div>
      )}

      {/* ── Add/Edit Dialog ─────────────────────────────────────── */}
      <MacosDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setEditing(null)
            setForm(emptyForm)
          }
        }}
        title={editing ? 'Edit Book' : 'Add New Book'}
        description={editing ? 'Update book information' : 'Fill in the book details'}
        className="max-w-2xl"
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
              disabled={saving || !form.title.trim()}
            >
              {editing ? 'Update Book' : 'Create Book'}
            </MacosButton>
          </>
        }
      >
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar space-y-5 pr-1 -mr-1">
          {/* Section: Basic Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookMarked className="size-3.5 text-macos-blue" strokeWidth={1.8} />
              <p className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground">Basic Information</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <MacosFormField label="Title *" className="sm:col-span-2">
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Book title"
                  className="macos-search border-0 h-8 text-[13px] font-medium focus:ring-primary/20"
                />
              </MacosFormField>
              <MacosFormField label="Subtitle" className="sm:col-span-2">
                <Input
                  id="subtitle"
                  value={form.subtitle}
                  onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                  placeholder="Subtitle (optional)"
                  className="macos-search border-0 h-8 text-[13px] font-medium focus:ring-primary/20"
                />
              </MacosFormField>
              <MacosFormField label="ISBN">
                <div className="relative">
                  <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground/50" strokeWidth={1.5} />
                  <Input
                    id="isbn"
                    value={form.isbn}
                    onChange={(e) => setForm((f) => ({ ...f, isbn: e.target.value }))}
                    placeholder="978-..."
                    className="macos-search border-0 h-8 text-[13px] font-medium pl-7 focus:ring-primary/20"
                  />
                </div>
              </MacosFormField>
              <MacosFormField label="Barcode">
                <div className="relative">
                  <Barcode className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground/50" strokeWidth={1.5} />
                  <Input
                    id="barcode"
                    value={form.barcode}
                    onChange={(e) => setForm((f) => ({ ...f, barcode: e.target.value }))}
                    placeholder="Barcode"
                    className="macos-search border-0 h-8 text-[13px] font-medium pl-7 focus:ring-primary/20"
                  />
                </div>
              </MacosFormField>
            </div>
          </div>

          {/* Section: Classification */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="size-3.5 text-macos-purple" strokeWidth={1.8} />
              <p className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground">Classification</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <MacosFormField label="Author">
                <Select value={form.authorId} onValueChange={(v) => setForm((f) => ({ ...f, authorId: v === '__none__' ? '' : v }))}>
                  <SelectTrigger className="macos-search border-0 text-[13px] h-8 font-medium focus:ring-primary/20">
                    <SelectValue placeholder="Select author" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {authors.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </MacosFormField>
              <MacosFormField label="Publisher">
                <Select value={form.publisherId} onValueChange={(v) => setForm((f) => ({ ...f, publisherId: v === '__none__' ? '' : v }))}>
                  <SelectTrigger className="macos-search border-0 text-[13px] h-8 font-medium focus:ring-primary/20">
                    <SelectValue placeholder="Select publisher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {publishers.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </MacosFormField>
              <MacosFormField label="Category">
                <Select value={form.categoryId} onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v === '__none__' ? '' : v }))}>
                  <SelectTrigger className="macos-search border-0 text-[13px] h-8 font-medium focus:ring-primary/20">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </MacosFormField>
              <MacosFormField label="Edition">
                <Input
                  id="edition"
                  value={form.edition}
                  onChange={(e) => setForm((f) => ({ ...f, edition: e.target.value }))}
                  placeholder="e.g. 3rd"
                  className="macos-search border-0 h-8 text-[13px] font-medium focus:ring-primary/20"
                />
              </MacosFormField>
            </div>
          </div>

          {/* Section: Publication Details */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Languages className="size-3.5 text-macos-teal" strokeWidth={1.8} />
              <p className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground">Publication Details</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <MacosFormField label="Language">
                <div className="relative">
                  <Languages className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground/50" strokeWidth={1.5} />
                  <Input
                    id="language"
                    value={form.language}
                    onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
                    placeholder="English"
                    className="macos-search border-0 h-8 text-[13px] font-medium pl-7 focus:ring-primary/20"
                  />
                </div>
              </MacosFormField>
              <MacosFormField label="Pages">
                <div className="relative">
                  <FileText className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground/50" strokeWidth={1.5} />
                  <Input
                    id="pages"
                    type="number"
                    value={form.pages}
                    onChange={(e) => setForm((f) => ({ ...f, pages: e.target.value }))}
                    placeholder="0"
                    className="macos-search border-0 h-8 text-[13px] font-medium pl-7 focus:ring-primary/20"
                  />
                </div>
              </MacosFormField>
              <MacosFormField label="Publish Year">
                <Input
                  id="publishYear"
                  type="number"
                  value={form.publishYear}
                  onChange={(e) => setForm((f) => ({ ...f, publishYear: e.target.value }))}
                  placeholder="2024"
                  className="macos-search border-0 h-8 text-[13px] font-medium focus:ring-primary/20"
                />
              </MacosFormField>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border/50" />

          {/* Section: Pricing */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="size-3.5 text-macos-green" strokeWidth={1.8} />
              <p className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground">Pricing</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <MacosFormField label="Price ($)">
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="0.00"
                  className="macos-search border-0 h-8 text-[13px] font-medium focus:ring-primary/20"
                />
              </MacosFormField>
              <MacosFormField label="Cost Price ($)">
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  value={form.costPrice}
                  onChange={(e) => setForm((f) => ({ ...f, costPrice: e.target.value }))}
                  placeholder="0.00"
                  className="macos-search border-0 h-8 text-[13px] font-medium focus:ring-primary/20"
                />
              </MacosFormField>
              <MacosFormField label="Discount (%)">
                <Input
                  id="discount"
                  type="number"
                  step="0.1"
                  value={form.discount}
                  onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))}
                  placeholder="0"
                  className="macos-search border-0 h-8 text-[13px] font-medium focus:ring-primary/20"
                />
              </MacosFormField>
            </div>
          </div>

          {/* Section: Academic */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="size-3.5 text-macos-orange" strokeWidth={1.8} />
              <p className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground">Academic</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <MacosFormField label="Academic Level">
                <Input
                  id="academicLevel"
                  value={form.academicLevel}
                  onChange={(e) => setForm((f) => ({ ...f, academicLevel: e.target.value }))}
                  placeholder="e.g. University, High School"
                  className="macos-search border-0 h-8 text-[13px] font-medium focus:ring-primary/20"
                />
              </MacosFormField>
              <MacosFormField label="Subject">
                <Input
                  id="subject"
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  placeholder="e.g. Mathematics, History"
                  className="macos-search border-0 h-8 text-[13px] font-medium focus:ring-primary/20"
                />
              </MacosFormField>
            </div>
          </div>

          {/* Section: Description */}
          <div>
            <MacosFormField label="Description">
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Book description..."
                rows={3}
                className="macos-search border-0 text-[13px] font-medium rounded-lg focus:ring-primary/20 min-h-[60px]"
              />
            </MacosFormField>
          </div>
        </div>
      </MacosDialog>
    </div>
  )
}
