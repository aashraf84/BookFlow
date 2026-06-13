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
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

// ── Component ────────────────────────────────────────────────────
export default function BookCatalogModule() {
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

  // ── Helpers for inventory stock display ──────────────────────
  // We fetch stock from inventory for each book or show N/A
  // For now, we'll just show the price and status

  return (
    <div className="space-y-4">
      {/* ── Header + Add Button ─────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Book Catalog</h2>
          <p className="text-sm text-muted-foreground">{total} books in collection</p>
        </div>
        <Button onClick={openAdd} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="size-4 mr-2" /> Add Book
        </Button>
      </div>

      {/* ── Search & Filters ────────────────────────────────── */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, ISBN, author..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
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
            <Select value={filterAuthor} onValueChange={setFilterAuthor}>
              <SelectTrigger>
                <SelectValue placeholder="All Authors" />
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
            <Select value={filterPublisher} onValueChange={setFilterPublisher}>
              <SelectTrigger>
                <SelectValue placeholder="All Publishers" />
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
          {(search || (filterCategory && filterCategory !== 'all') || (filterAuthor && filterAuthor !== 'all') || (filterPublisher && filterPublisher !== 'all')) && (
            <div className="mt-2 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('')
                  setFilterCategory('')
                  setFilterAuthor('')
                  setFilterPublisher('')
                }}
              >
                <X className="size-3 mr-1" /> Clear filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Books Table ─────────────────────────────────────── */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <BookOpen className="size-10 mb-3 opacity-40" />
              <p className="font-medium">No books found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>ISBN</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium truncate max-w-[240px]">{book.title}</p>
                          {book.subtitle && (
                            <p className="text-xs text-muted-foreground truncate max-w-[240px]">
                              {book.subtitle}
                            </p>
                          )}
                        </div>
                      </TableCell>
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
                      <TableCell className="text-right font-medium">
                        {formatCurrency(book.price)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={book.isActive ? 'secondary' : 'destructive'}
                          className="text-xs"
                        >
                          {book.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => openEdit(book)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(book.id)}
                            disabled={deleting === book.id}
                          >
                            {deleting === book.id ? (
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

      {/* ── Pagination ──────────────────────────────────────── */}
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
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Add/Edit Dialog ─────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open)
        if (!open) {
          setEditing(null)
          setForm(emptyForm)
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Book' : 'Add New Book'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
            {/* Title */}
            <div className="sm:col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Book title"
              />
            </div>

            {/* Subtitle */}
            <div className="sm:col-span-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={form.subtitle}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                placeholder="Subtitle (optional)"
              />
            </div>

            {/* ISBN */}
            <div>
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                value={form.isbn}
                onChange={(e) => setForm((f) => ({ ...f, isbn: e.target.value }))}
                placeholder="978-..."
              />
            </div>

            {/* Barcode */}
            <div>
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                value={form.barcode}
                onChange={(e) => setForm((f) => ({ ...f, barcode: e.target.value }))}
                placeholder="Barcode"
              />
            </div>

            {/* Author */}
            <div>
              <Label>Author</Label>
              <Select value={form.authorId} onValueChange={(v) => setForm((f) => ({ ...f, authorId: v === '__none__' ? '' : v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select author" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {authors.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Publisher */}
            <div>
              <Label>Publisher</Label>
              <Select value={form.publisherId} onValueChange={(v) => setForm((f) => ({ ...f, publisherId: v === '__none__' ? '' : v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select publisher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {publishers.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div>
              <Label>Category</Label>
              <Select value={form.categoryId} onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v === '__none__' ? '' : v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Edition */}
            <div>
              <Label htmlFor="edition">Edition</Label>
              <Input
                id="edition"
                value={form.edition}
                onChange={(e) => setForm((f) => ({ ...f, edition: e.target.value }))}
                placeholder="e.g. 3rd"
              />
            </div>

            {/* Language */}
            <div>
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                value={form.language}
                onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
                placeholder="English"
              />
            </div>

            {/* Pages */}
            <div>
              <Label htmlFor="pages">Pages</Label>
              <Input
                id="pages"
                type="number"
                value={form.pages}
                onChange={(e) => setForm((f) => ({ ...f, pages: e.target.value }))}
                placeholder="0"
              />
            </div>

            {/* Publish Year */}
            <div>
              <Label htmlFor="publishYear">Publish Year</Label>
              <Input
                id="publishYear"
                type="number"
                value={form.publishYear}
                onChange={(e) => setForm((f) => ({ ...f, publishYear: e.target.value }))}
                placeholder="2024"
              />
            </div>

            <Separator className="sm:col-span-2" />

            {/* Price */}
            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            {/* Cost Price */}
            <div>
              <Label htmlFor="costPrice">Cost Price ($)</Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                value={form.costPrice}
                onChange={(e) => setForm((f) => ({ ...f, costPrice: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            {/* Discount */}
            <div>
              <Label htmlFor="discount">Discount (%)</Label>
              <Input
                id="discount"
                type="number"
                step="0.1"
                value={form.discount}
                onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))}
                placeholder="0"
              />
            </div>

            {/* Academic Level */}
            <div>
              <Label htmlFor="academicLevel">Academic Level</Label>
              <Input
                id="academicLevel"
                value={form.academicLevel}
                onChange={(e) => setForm((f) => ({ ...f, academicLevel: e.target.value }))}
                placeholder="e.g. University, High School"
              />
            </div>

            {/* Subject */}
            <div className="sm:col-span-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                placeholder="e.g. Mathematics, History"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Book description..."
                rows={3}
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
              disabled={saving || !form.title.trim()}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {saving ? (
                <RefreshCw className="size-4 mr-2 animate-spin" />
              ) : (
                <Plus className="size-4 mr-2" />
              )}
              {editing ? 'Update Book' : 'Create Book'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
