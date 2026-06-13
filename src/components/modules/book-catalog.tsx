'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Search,
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
} from 'lucide-react'
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
import { useAppStore } from '@/store/app-store'

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
  publisher: { id: string; name: string } | null
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

  return (
    <div className="space-y-5">
      {/* ── macOS Page Header ──────────────────────────────────── */}
      <div className="macos-page-header flex-col gap-3 sm:flex-row">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-9 rounded-xl bg-macos-blue/10">
            <Library className="size-[18px] text-macos-blue" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="macos-page-title">Book Catalog</h1>
            <p className="macos-page-subtitle">
              {total} {total === 1 ? 'book' : 'books'} in your library
            </p>
          </div>
        </div>
        {!isViewOnly && (
          <Button
            onClick={openAdd}
            className="bg-primary text-primary-foreground rounded-lg font-medium text-[13px] h-8 gap-1.5"
          >
            <Plus className="size-4" strokeWidth={1.5} /> Add Book
          </Button>
        )}
      </div>

      {/* ── Search & Filters Card ──────────────────────────────── */}
      <div className="macos-card macos-shadow-card p-4">
        {/* Spotlight-style search */}
        <div className="macos-search flex items-center gap-2 px-3 py-1.5 mb-3">
          <Search className="size-[14px] text-muted-foreground shrink-0" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search by title, ISBN, author..."
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

        {/* Filter bar */}
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
          <div className="macos-empty py-16">
            <div className="size-14 rounded-2xl bg-macos-orange/10 flex items-center justify-center mb-4">
              <BookOpen className="size-7 text-macos-orange" strokeWidth={1.5} />
            </div>
            <p className="text-[13px] font-semibold text-foreground">No books found</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/50 hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground min-w-[220px]">Title</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Author</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">ISBN</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Category</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Price</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Stock</TableHead>
                  {!isViewOnly && (
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {books.map((book) => {
                  const colorClass = getCoverColor(book.title)
                  const catColor = book.category ? getCategoryColor(book.category.name) : null
                  return (
                    <TableRow key={book.id} className="macos-table-row border-b border-border/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`size-9 rounded-lg ${colorClass.bg} flex items-center justify-center shrink-0`}>
                            <span className={`text-[11px] font-bold ${colorClass.text}`}>
                              {book.title.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium truncate max-w-[200px] leading-tight">{book.title}</p>
                            {book.subtitle && (
                              <p className="text-[11px] text-muted-foreground truncate max-w-[200px] mt-0.5">
                                {book.subtitle}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-[13px] text-muted-foreground font-medium">
                        {book.author?.name || <span className="text-muted-foreground/50">—</span>}
                      </TableCell>
                      <TableCell className="text-[13px] text-muted-foreground font-mono text-[11px]">
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
                      <TableCell className="text-[13px] text-right font-semibold tracking-tight text-foreground">
                        {formatCurrency(book.price)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <div className={`size-[6px] rounded-full ${
                            book.isActive ? 'bg-macos-green' : 'bg-macos-red'
                          }`} />
                          <span className="text-[11px] text-muted-foreground font-medium">
                            {book.isActive ? 'In Stock' : 'Out'}
                          </span>
                        </div>
                      </TableCell>
                      {!isViewOnly && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 rounded-lg hover:bg-macos-blue/10 hover:text-macos-blue"
                              onClick={() => openEdit(book)}
                            >
                              <Pencil className="size-3.5" strokeWidth={1.5} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 rounded-lg hover:bg-macos-red/10 hover:text-macos-red"
                              onClick={() => handleDelete(book.id)}
                              disabled={deleting === book.id}
                            >
                              {deleting === book.id ? (
                                <RefreshCw className="size-3.5 animate-spin" strokeWidth={1.5} />
                              ) : (
                                <Trash2 className="size-3.5" strokeWidth={1.5} />
                              )}
                            </Button>
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

      {/* ── Pagination ──────────────────────────────────────────── */}
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
              <ChevronLeft className="size-3.5" strokeWidth={1.5} /> Prev
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-lg h-7 text-[12px] font-medium gap-1 hover:bg-macos-blue/10 hover:text-macos-blue"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next <ChevronRight className="size-3.5" strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      )}

      {/* ── Add/Edit Dialog ─────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open)
        if (!open) {
          setEditing(null)
          setForm(emptyForm)
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl macos-shadow-float border-border/50 p-0">
          {/* macOS Dialog Header */}
          <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-border/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-8 rounded-lg bg-macos-blue/10">
                  <BookMarked className="size-4 text-macos-blue" strokeWidth={1.5} />
                </div>
                <div>
                  <DialogTitle className="text-[15px] font-semibold tracking-tight">
                    {editing ? 'Edit Book' : 'Add New Book'}
                  </DialogTitle>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {editing ? 'Update book information' : 'Fill in the book details'}
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

          <div className="px-6 py-4">
            {/* Section: Basic Info */}
            <div className="mb-5">
              <p className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground mb-3">Basic Information</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="title" className="text-[12px] font-medium text-muted-foreground">Title *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Book title"
                    className="rounded-lg border-border/50 text-[13px] h-8 mt-1 focus:ring-primary/20"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="subtitle" className="text-[12px] font-medium text-muted-foreground">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={form.subtitle}
                    onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                    placeholder="Subtitle (optional)"
                    className="rounded-lg border-border/50 text-[13px] h-8 mt-1 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <Label htmlFor="isbn" className="text-[12px] font-medium text-muted-foreground flex items-center gap-1"><Hash className="size-3" strokeWidth={1.5} /> ISBN</Label>
                  <Input
                    id="isbn"
                    value={form.isbn}
                    onChange={(e) => setForm((f) => ({ ...f, isbn: e.target.value }))}
                    placeholder="978-..."
                    className="rounded-lg border-border/50 text-[13px] h-8 mt-1 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <Label htmlFor="barcode" className="text-[12px] font-medium text-muted-foreground flex items-center gap-1"><Barcode className="size-3" strokeWidth={1.5} /> Barcode</Label>
                  <Input
                    id="barcode"
                    value={form.barcode}
                    onChange={(e) => setForm((f) => ({ ...f, barcode: e.target.value }))}
                    placeholder="Barcode"
                    className="rounded-lg border-border/50 text-[13px] h-8 mt-1 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            {/* Section: Classification */}
            <div className="mb-5">
              <p className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground mb-3">Classification</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-[12px] font-medium text-muted-foreground">Author</Label>
                  <Select value={form.authorId} onValueChange={(v) => setForm((f) => ({ ...f, authorId: v === '__none__' ? '' : v }))}>
                    <SelectTrigger className="rounded-lg border-border/50 text-[13px] h-8 mt-1 focus:ring-primary/20">
                      <SelectValue placeholder="Select author" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {authors.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[12px] font-medium text-muted-foreground">Publisher</Label>
                  <Select value={form.publisherId} onValueChange={(v) => setForm((f) => ({ ...f, publisherId: v === '__none__' ? '' : v }))}>
                    <SelectTrigger className="rounded-lg border-border/50 text-[13px] h-8 mt-1 focus:ring-primary/20">
                      <SelectValue placeholder="Select publisher" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {publishers.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[12px] font-medium text-muted-foreground flex items-center gap-1"><Tag className="size-3" strokeWidth={1.5} /> Category</Label>
                  <Select value={form.categoryId} onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v === '__none__' ? '' : v }))}>
                    <SelectTrigger className="rounded-lg border-border/50 text-[13px] h-8 mt-1 focus:ring-primary/20">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edition" className="text-[12px] font-medium text-muted-foreground">Edition</Label>
                  <Input
                    id="edition"
                    value={form.edition}
                    onChange={(e) => setForm((f) => ({ ...f, edition: e.target.value }))}
                    placeholder="e.g. 3rd"
                    className="rounded-lg border-border/50 text-[13px] h-8 mt-1 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            {/* Section: Publication Details */}
            <div className="mb-5">
              <p className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground mb-3">Publication Details</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="language" className="text-[12px] font-medium text-muted-foreground flex items-center gap-1"><Languages className="size-3" strokeWidth={1.5} /> Language</Label>
                  <Input
                    id="language"
                    value={form.language}
                    onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
                    placeholder="English"
                    className="rounded-lg border-border/50 text-[13px] h-8 mt-1 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <Label htmlFor="pages" className="text-[12px] font-medium text-muted-foreground flex items-center gap-1"><FileText className="size-3" strokeWidth={1.5} /> Pages</Label>
                  <Input
                    id="pages"
                    type="number"
                    value={form.pages}
                    onChange={(e) => setForm((f) => ({ ...f, pages: e.target.value }))}
                    placeholder="0"
                    className="rounded-lg border-border/50 text-[13px] h-8 mt-1 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <Label htmlFor="publishYear" className="text-[12px] font-medium text-muted-foreground">Publish Year</Label>
                  <Input
                    id="publishYear"
                    type="number"
                    value={form.publishYear}
                    onChange={(e) => setForm((f) => ({ ...f, publishYear: e.target.value }))}
                    placeholder="2024"
                    className="rounded-lg border-border/50 text-[13px] h-8 mt-1 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            <Separator className="mb-5" />

            {/* Section: Pricing */}
            <div className="mb-5">
              <p className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <DollarSign className="size-3" strokeWidth={1.5} /> Pricing
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <Label htmlFor="price" className="text-[12px] font-medium text-muted-foreground">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    placeholder="0.00"
                    className="rounded-lg border-border/50 text-[13px] h-8 mt-1 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <Label htmlFor="costPrice" className="text-[12px] font-medium text-muted-foreground">Cost Price ($)</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    value={form.costPrice}
                    onChange={(e) => setForm((f) => ({ ...f, costPrice: e.target.value }))}
                    placeholder="0.00"
                    className="rounded-lg border-border/50 text-[13px] h-8 mt-1 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <Label htmlFor="discount" className="text-[12px] font-medium text-muted-foreground">Discount (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    step="0.1"
                    value={form.discount}
                    onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))}
                    placeholder="0"
                    className="rounded-lg border-border/50 text-[13px] h-8 mt-1 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            {/* Section: Academic */}
            <div className="mb-5">
              <p className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <GraduationCap className="size-3" strokeWidth={1.5} /> Academic
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="academicLevel" className="text-[12px] font-medium text-muted-foreground">Academic Level</Label>
                  <Input
                    id="academicLevel"
                    value={form.academicLevel}
                    onChange={(e) => setForm((f) => ({ ...f, academicLevel: e.target.value }))}
                    placeholder="e.g. University, High School"
                    className="rounded-lg border-border/50 text-[13px] h-8 mt-1 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <Label htmlFor="subject" className="text-[12px] font-medium text-muted-foreground">Subject</Label>
                  <Input
                    id="subject"
                    value={form.subject}
                    onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                    placeholder="e.g. Mathematics, History"
                    className="rounded-lg border-border/50 text-[13px] h-8 mt-1 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            {/* Section: Description */}
            <div className="mb-5">
              <Label htmlFor="description" className="text-[12px] font-medium text-muted-foreground">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Book description..."
                rows={3}
                className="rounded-lg border-border/50 text-[13px] mt-1 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Dialog Footer */}
          <div className="sticky bottom-0 bg-card/95 backdrop-blur-xl border-t border-border/50 px-6 py-3 flex justify-end gap-2">
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
              disabled={saving || !form.title.trim()}
              className="bg-primary text-primary-foreground rounded-lg text-[13px] font-medium h-8 gap-1.5"
            >
              {saving ? (
                <RefreshCw className="size-4 animate-spin" strokeWidth={1.5} />
              ) : (
                <Plus className="size-4" strokeWidth={1.5} />
              )}
              {editing ? 'Update Book' : 'Create Book'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
