'use client'

import * as React from 'react'
import {
  Crown,
  Users,
  UserCheck,
  UserX,
  UserPlus,
  CreditCard,
  FileText,
  Key,
  Monitor,
  Plus,
  Trash2,
  Pencil,
  Search,
  X,
  Eye,
  Printer,
  Copy,
  Check,
  ChevronDown,
  ArrowRightLeft,
  Shield,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Package,
  Calendar,
  Globe,
  Zap,
  Building2,
  Mail,
  Phone,
  MapPin,
  Hash,
  Activity,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { useAppStore } from '@/store/app-store'
import {
  MacosPageHeader,
  MacosStatCard,
  MacosSearch,
  MacosFilterBar,
  MacosButton,
  MacosBadge,
  MacosCard,
  MacosDialog,
  MacosFormField,
  MacosStatGrid,
  MacosTableCard,
  MacosEmptyState,
} from '@/components/macos-ui'

// ==================== TYPES ====================

interface Client {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  postalCode?: string | null
  taxId?: string | null
  website?: string | null
  logo?: string | null
  industry?: string | null
  notes?: string | null
  status: string
  onboardingDate: string
  createdAt: string
  updatedAt: string
  _count?: { subscriptions: number; invoices: number; devices: number; serialKeys: number }
}

interface Subscription {
  id: string
  clientId: string
  client?: { id: string; companyName: string; email: string } | null
  planName: string
  planType: string
  price: number
  currency: string
  startDate: string
  endDate?: string | null
  status: string
  autoRenew: boolean
  maxUsers: number
  maxBranches: number
  maxDevices: number
  storageGB: number
  features?: string | null
  createdAt: string
  updatedAt: string
}

interface InvoiceItem {
  id?: string
  description: string
  quantity: number
  unitPrice: number
  discount: number
  total: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  clientId: string
  client?: { id: string; companyName: string; email: string; address?: string | null; city?: string | null; country?: string | null; taxId?: string | null } | null
  subscriptionId?: string | null
  subscription?: { id: string; planName: string } | null
  issueDate: string
  dueDate: string
  subtotal: number
  discountAmount: number
  taxRate: number
  taxAmount: number
  total: number
  currency: string
  status: string
  paymentMethod?: string | null
  paymentRef?: string | null
  paidAt?: string | null
  notes?: string | null
  terms?: string | null
  createdAt: string
  updatedAt: string
  items: InvoiceItem[]
}

interface QuotationItem {
  id?: string
  description: string
  quantity: number
  unitPrice: number
  discount: number
  total: number
}

interface Quotation {
  id: string
  quotationNumber: string
  clientId: string
  client?: { id: string; companyName: string; email: string; address?: string | null; city?: string | null; country?: string | null; taxId?: string | null } | null
  issueDate: string
  validUntil: string
  subtotal: number
  discountAmount: number
  taxRate: number
  taxAmount: number
  total: number
  currency: string
  status: string
  notes?: string | null
  terms?: string | null
  convertedInvoiceId?: string | null
  createdAt: string
  updatedAt: string
  items: QuotationItem[]
}

interface SerialKey {
  id: string
  key: string
  clientId?: string | null
  client?: { id: string; companyName: string } | null
  plan: string
  maxDevices: number
  maxUsers: number
  activatedAt?: string | null
  expiresAt?: string | null
  isActive: boolean
  deviceFingerprint?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
}

interface Device {
  id: string
  clientId: string
  client?: { id: string; companyName: string } | null
  serialKeyId?: string | null
  deviceName?: string | null
  deviceType?: string | null
  os?: string | null
  browser?: string | null
  fingerprint?: string | null
  ipAddress?: string | null
  lastActiveAt?: string | null
  isActive: boolean
  registeredAt: string
  createdAt: string
  updatedAt: string
}

interface OwnerStats {
  totalClients: number
  activeClients: number
  churnedClients: number
  totalSubscriptions: number
  activeSubscriptions: number
  totalInvoices: number
  paidInvoices: number
  overdueInvoices: number
  totalRevenue: number
  totalQuotations: number
  pendingQuotations: number
  totalDevices: number
  activeDevices: number
  totalSerialKeys: number
  activeSerialKeys: number
}

// ==================== HELPERS ====================

function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount)
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function clientStatusVariant(status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' {
  const map: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'> = {
    active: 'success', suspended: 'warning', churned: 'danger', trial: 'info',
  }
  return map[status] || 'default'
}

function subStatusVariant(status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' {
  const map: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'> = {
    active: 'success', expired: 'danger', cancelled: 'default', past_due: 'warning', trial: 'info',
  }
  return map[status] || 'default'
}

function invoiceStatusVariant(status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' {
  const map: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'> = {
    draft: 'default', sent: 'info', paid: 'success', overdue: 'danger', cancelled: 'default', refunded: 'purple',
  }
  return map[status] || 'default'
}

function quotationStatusVariant(status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' {
  const map: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'> = {
    draft: 'default', sent: 'info', accepted: 'success', rejected: 'danger', expired: 'warning', converted: 'purple',
  }
  return map[status] || 'default'
}

// ==================== TAB CONFIG ====================

type TabId = 'clients' | 'subscriptions' | 'invoices' | 'quotations' | 'serial-keys' | 'devices'

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  { id: 'invoices', label: 'Invoices', icon: FileText },
  { id: 'quotations', label: 'Quotations', icon: FileText },
  { id: 'serial-keys', label: 'Serial Keys', icon: Key },
  { id: 'devices', label: 'Devices', icon: Monitor },
]

// ==================== LINE ITEMS EDITOR ====================

function LineItemsEditor({
  items,
  onChange,
}: {
  items: InvoiceItem[] | QuotationItem[]
  onChange: (items: InvoiceItem[] | QuotationItem[]) => void
}) {
  const addItem = () => {
    onChange([...items, { description: '', quantity: 1, unitPrice: 0, discount: 0, total: 0 }])
  }

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index)
    onChange(updated)
  }

  const updateItem = (index: number, field: string, value: number | string) => {
    const updated = [...items]
    const item = { ...updated[index], [field]: value }
    // Auto-calculate total
    if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
      const qty = field === 'quantity' ? Number(value) : item.quantity
      const price = field === 'unitPrice' ? Number(value) : item.unitPrice
      const disc = field === 'discount' ? Number(value) : item.discount
      item.total = Math.max(0, qty * price - disc)
    }
    updated[index] = item
    onChange(updated)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-[12px] font-semibold text-foreground/80">Line Items</Label>
        <MacosButton variant="ghost" icon={Plus} onClick={addItem}>Add Item</MacosButton>
      </div>
      {items.length === 0 && (
        <div className="text-center py-6 text-[12px] text-muted-foreground/50 border border-dashed border-border/50 rounded-lg">
          No items added. Click &quot;Add Item&quot; to add line items.
        </div>
      )}
      {items.map((item, i) => (
        <div key={i} className="grid grid-cols-12 gap-2 items-end p-2 rounded-lg bg-secondary/30 border border-border/30">
          <div className="col-span-4">
            <Label className="text-[10px] text-muted-foreground/60">Description</Label>
            <Input
              value={item.description}
              onChange={(e) => updateItem(i, 'description', e.target.value)}
              placeholder="Item description"
              className="h-7 text-[12px]"
            />
          </div>
          <div className="col-span-2">
            <Label className="text-[10px] text-muted-foreground/60">Qty</Label>
            <Input
              type="number"
              value={item.quantity}
              onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))}
              min={1}
              className="h-7 text-[12px]"
            />
          </div>
          <div className="col-span-2">
            <Label className="text-[10px] text-muted-foreground/60">Unit Price</Label>
            <Input
              type="number"
              value={item.unitPrice}
              onChange={(e) => updateItem(i, 'unitPrice', Number(e.target.value))}
              min={0}
              step={0.01}
              className="h-7 text-[12px]"
            />
          </div>
          <div className="col-span-2">
            <Label className="text-[10px] text-muted-foreground/60">Discount</Label>
            <Input
              type="number"
              value={item.discount}
              onChange={(e) => updateItem(i, 'discount', Number(e.target.value))}
              min={0}
              step={0.01}
              className="h-7 text-[12px]"
            />
          </div>
          <div className="col-span-1">
            <Label className="text-[10px] text-muted-foreground/60">Total</Label>
            <div className="h-7 px-2 flex items-center text-[12px] font-semibold text-foreground/80 rounded-md bg-secondary/50">
              {formatCurrency(item.total)}
            </div>
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <button onClick={() => removeItem(i)} className="p-1 rounded hover:bg-macos-red/10 text-muted-foreground/50 hover:text-macos-red transition-colors">
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ==================== INVOICE PRINT LAYOUT ====================

function InvoicePrintLayout({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Invoice ${invoice.invoiceNumber}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; color: #1a1a1a; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #f0f0f0; padding-bottom: 20px; }
  .company-name { font-size: 24px; font-weight: 700; color: #1a1a1a; }
  .company-details { font-size: 12px; color: #666; margin-top: 4px; }
  .invoice-title { font-size: 32px; font-weight: 800; color: #333; text-align: right; }
  .invoice-meta { text-align: right; font-size: 13px; color: #666; margin-top: 8px; }
  .bill-to { background: #f8f9fa; padding: 16px 20px; border-radius: 8px; margin-bottom: 30px; }
  .bill-to h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin: 0 0 8px; }
  .bill-to p { margin: 2px 0; font-size: 14px; color: #333; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
  thead th { background: #f8f9fa; padding: 10px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #666; text-align: left; border-bottom: 2px solid #e0e0e0; }
  tbody td { padding: 12px; font-size: 13px; border-bottom: 1px solid #f0f0f0; }
  .text-right { text-align: right; }
  .summary { margin-left: auto; width: 300px; }
  .summary-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
  .summary-total { display: flex; justify-content: space-between; padding: 12px 0; font-size: 18px; font-weight: 700; border-top: 2px solid #333; margin-top: 8px; }
  .notes { margin-top: 30px; padding: 16px; background: #f8f9fa; border-radius: 8px; }
  .notes h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin: 0 0 8px; }
  .notes p { font-size: 12px; color: #666; margin: 0; }
  .footer { margin-top: 40px; text-align: center; padding-top: 20px; border-top: 1px solid #e0e0e0; }
  .footer p { font-size: 12px; color: #999; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company-name">BookFlow OS</div>
      <div class="company-details">Enterprise Book Management Platform<br>123 Business Ave, Tech City, TC 12345<br>contact@bookflow.os</div>
    </div>
    <div>
      <div class="invoice-title">INVOICE</div>
      <div class="invoice-meta">
        <strong>${invoice.invoiceNumber}</strong><br>
        Issue Date: ${formatDate(invoice.issueDate)}<br>
        Due Date: ${formatDate(invoice.dueDate)}
      </div>
    </div>
  </div>
  <div class="bill-to">
    <h3>Bill To</h3>
    <p><strong>${invoice.client?.companyName || 'N/A'}</strong></p>
    <p>${invoice.client?.address || ''}</p>
    <p>${[invoice.client?.city, invoice.client?.country].filter(Boolean).join(', ')}</p>
    <p>${invoice.client?.email || ''}</p>
    ${invoice.client?.taxId ? `<p>Tax ID: ${invoice.client.taxId}</p>` : ''}
  </div>
  <table>
    <thead><tr><th>#</th><th>Description</th><th class="text-right">Qty</th><th class="text-right">Unit Price</th><th class="text-right">Discount</th><th class="text-right">Total</th></tr></thead>
    <tbody>
      ${invoice.items.map((item, idx) => `<tr><td>${idx + 1}</td><td>${item.description}</td><td class="text-right">${item.quantity}</td><td class="text-right">${formatCurrency(item.unitPrice, invoice.currency)}</td><td class="text-right">${formatCurrency(item.discount, invoice.currency)}</td><td class="text-right">${formatCurrency(item.total, invoice.currency)}</td></tr>`).join('\n')}
    </tbody>
  </table>
  <div class="summary">
    <div class="summary-row"><span>Subtotal</span><span>${formatCurrency(invoice.subtotal, invoice.currency)}</span></div>
    ${invoice.discountAmount > 0 ? `<div class="summary-row"><span>Discount</span><span>-${formatCurrency(invoice.discountAmount, invoice.currency)}</span></div>` : ''}
    ${invoice.taxRate > 0 ? `<div class="summary-row"><span>Tax (${invoice.taxRate}%)</span><span>${formatCurrency(invoice.taxAmount, invoice.currency)}</span></div>` : ''}
    <div class="summary-total"><span>Grand Total</span><span>${formatCurrency(invoice.total, invoice.currency)}</span></div>
  </div>
  ${invoice.notes ? `<div class="notes"><h3>Notes</h3><p>${invoice.notes}</p></div>` : ''}
  ${invoice.terms ? `<div class="notes" style="margin-top: 12px;"><h3>Terms & Conditions</h3><p>${invoice.terms}</p></div>` : ''}
  <div class="footer"><p>Thank you for your business</p></div>
</body>
</html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${invoice.invoiceNumber}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>
      <div className="print-area">
        {/* Toolbar - hidden when printing */}
        <div className="no-print flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MacosButton variant="primary" icon={Printer} onClick={handlePrint}>Print</MacosButton>
            <MacosButton variant="secondary" icon={Globe} onClick={handleExport}>Export HTML</MacosButton>
          </div>
          <MacosButton variant="ghost" icon={X} onClick={onClose}>Close</MacosButton>
        </div>

        {/* Invoice Document */}
        <div className="bg-background border border-border/50 rounded-xl p-8 max-w-3xl mx-auto" style={{ minHeight: '800px' }}>
          {/* Header */}
          <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-border/30">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                  <Crown className="size-4 text-primary" />
                </div>
                <span className="text-xl font-bold text-foreground">BookFlow OS</span>
              </div>
              <p className="text-[12px] text-muted-foreground/60 mt-1">Enterprise Book Management Platform</p>
              <p className="text-[12px] text-muted-foreground/60">123 Business Ave, Tech City, TC 12345</p>
              <p className="text-[12px] text-muted-foreground/60">contact@bookflow.os</p>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-extrabold text-foreground/90 tracking-tight">INVOICE</h2>
              <p className="text-[13px] font-bold text-foreground mt-2">{invoice.invoiceNumber}</p>
              <p className="text-[12px] text-muted-foreground/60 mt-1">Issue: {formatDate(invoice.issueDate)}</p>
              <p className="text-[12px] text-muted-foreground/60">Due: {formatDate(invoice.dueDate)}</p>
            </div>
          </div>

          {/* Bill To */}
          <div className="bg-secondary/30 rounded-lg p-4 mb-8">
            <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold mb-2">Bill To</h3>
            <p className="text-[14px] font-semibold text-foreground">{invoice.client?.companyName || 'N/A'}</p>
            {invoice.client?.address && <p className="text-[12px] text-muted-foreground/60">{invoice.client.address}</p>}
            <p className="text-[12px] text-muted-foreground/60">
              {[invoice.client?.city, invoice.client?.country].filter(Boolean).join(', ')}
            </p>
            {invoice.client?.email && <p className="text-[12px] text-muted-foreground/60">{invoice.client.email}</p>}
            {invoice.client?.taxId && <p className="text-[12px] text-muted-foreground/60">Tax ID: {invoice.client.taxId}</p>}
          </div>

          {/* Items Table */}
          <Table className="mb-6">
            <TableHeader>
              <TableRow className="border-b-2 border-border/40 hover:bg-transparent">
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 w-10">#</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">Description</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 text-right w-14">Qty</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 text-right">Unit Price</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 text-right">Discount</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item, idx) => (
                <TableRow key={idx} className="border-b border-border/20 hover:bg-transparent">
                  <TableCell className="text-[12px] text-muted-foreground/60 py-2">{idx + 1}</TableCell>
                  <TableCell className="text-[12px] font-medium py-2">{item.description}</TableCell>
                  <TableCell className="text-[12px] text-right py-2">{item.quantity}</TableCell>
                  <TableCell className="text-[12px] text-right py-2">{formatCurrency(item.unitPrice, invoice.currency)}</TableCell>
                  <TableCell className="text-[12px] text-right py-2">{formatCurrency(item.discount, invoice.currency)}</TableCell>
                  <TableCell className="text-[12px] text-right font-semibold py-2">{formatCurrency(item.total, invoice.currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Summary */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1">
              <div className="flex justify-between text-[12px] text-muted-foreground/60">
                <span>Subtotal</span>
                <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-[12px] text-macos-red">
                  <span>Discount</span>
                  <span>-{formatCurrency(invoice.discountAmount, invoice.currency)}</span>
                </div>
              )}
              {invoice.taxRate > 0 && (
                <div className="flex justify-between text-[12px] text-muted-foreground/60">
                  <span>Tax ({invoice.taxRate}%)</span>
                  <span>{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between text-[16px] font-bold text-foreground">
                <span>Grand Total</span>
                <span>{formatCurrency(invoice.total, invoice.currency)}</span>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          {(invoice.notes || invoice.terms) && (
            <div className="mt-8 pt-4 border-t border-border/20 space-y-3">
              {invoice.notes && (
                <div className="bg-secondary/20 rounded-lg p-3">
                  <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold mb-1">Notes</h4>
                  <p className="text-[12px] text-muted-foreground/70 whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              )}
              {invoice.terms && (
                <div className="bg-secondary/20 rounded-lg p-3">
                  <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold mb-1">Terms & Conditions</h4>
                  <p className="text-[12px] text-muted-foreground/70 whitespace-pre-wrap">{invoice.terms}</p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-10 text-center border-t border-border/20 pt-4">
            <p className="text-[12px] text-muted-foreground/40 font-medium">Thank you for your business</p>
          </div>
        </div>
      </div>
    </>
  )
}

// ==================== QUOTATION PRINT LAYOUT ====================

function QuotationPrintLayout({ quotation, onClose, onConvert }: { quotation: Quotation; onClose: () => void; onConvert: () => void }) {
  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Quotation ${quotation.quotationNumber}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; color: #1a1a1a; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #f0f0f0; padding-bottom: 20px; }
  .company-name { font-size: 24px; font-weight: 700; color: #1a1a1a; }
  .company-details { font-size: 12px; color: #666; margin-top: 4px; }
  .quotation-title { font-size: 32px; font-weight: 800; color: #333; text-align: right; }
  .quotation-meta { text-align: right; font-size: 13px; color: #666; margin-top: 8px; }
  .bill-to { background: #f8f9fa; padding: 16px 20px; border-radius: 8px; margin-bottom: 30px; }
  .bill-to h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin: 0 0 8px; }
  .bill-to p { margin: 2px 0; font-size: 14px; color: #333; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
  thead th { background: #f8f9fa; padding: 10px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #666; text-align: left; border-bottom: 2px solid #e0e0e0; }
  tbody td { padding: 12px; font-size: 13px; border-bottom: 1px solid #f0f0f0; }
  .text-right { text-align: right; }
  .summary { margin-left: auto; width: 300px; }
  .summary-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
  .summary-total { display: flex; justify-content: space-between; padding: 12px 0; font-size: 18px; font-weight: 700; border-top: 2px solid #333; margin-top: 8px; }
  .notes { margin-top: 30px; padding: 16px; background: #f8f9fa; border-radius: 8px; }
  .notes h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin: 0 0 8px; }
  .notes p { font-size: 12px; color: #666; margin: 0; }
  .signature { margin-top: 50px; }
  .signature-line { border-top: 1px solid #ccc; width: 250px; padding-top: 8px; font-size: 12px; color: #666; }
  .footer { margin-top: 40px; text-align: center; padding-top: 20px; border-top: 1px solid #e0e0e0; }
  .footer p { font-size: 12px; color: #999; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company-name">BookFlow OS</div>
      <div class="company-details">Enterprise Book Management Platform<br>123 Business Ave, Tech City, TC 12345<br>contact@bookflow.os</div>
    </div>
    <div>
      <div class="quotation-title">QUOTATION</div>
      <div class="quotation-meta">
        <strong>${quotation.quotationNumber}</strong><br>
        Issue Date: ${formatDate(quotation.issueDate)}<br>
        Valid Until: ${formatDate(quotation.validUntil)}
      </div>
    </div>
  </div>
  <div class="bill-to">
    <h3>Prepared For</h3>
    <p><strong>${quotation.client?.companyName || 'N/A'}</strong></p>
    <p>${quotation.client?.address || ''}</p>
    <p>${[quotation.client?.city, quotation.client?.country].filter(Boolean).join(', ')}</p>
    <p>${quotation.client?.email || ''}</p>
    ${quotation.client?.taxId ? `<p>Tax ID: ${quotation.client.taxId}</p>` : ''}
  </div>
  <table>
    <thead><tr><th>#</th><th>Description</th><th class="text-right">Qty</th><th class="text-right">Unit Price</th><th class="text-right">Discount</th><th class="text-right">Total</th></tr></thead>
    <tbody>
      ${quotation.items.map((item, idx) => `<tr><td>${idx + 1}</td><td>${item.description}</td><td class="text-right">${item.quantity}</td><td class="text-right">${formatCurrency(item.unitPrice, quotation.currency)}</td><td class="text-right">${formatCurrency(item.discount, quotation.currency)}</td><td class="text-right">${formatCurrency(item.total, quotation.currency)}</td></tr>`).join('\n')}
    </tbody>
  </table>
  <div class="summary">
    <div class="summary-row"><span>Subtotal</span><span>${formatCurrency(quotation.subtotal, quotation.currency)}</span></div>
    ${quotation.discountAmount > 0 ? `<div class="summary-row"><span>Discount</span><span>-${formatCurrency(quotation.discountAmount, quotation.currency)}</span></div>` : ''}
    ${quotation.taxRate > 0 ? `<div class="summary-row"><span>Tax (${quotation.taxRate}%)</span><span>${formatCurrency(quotation.taxAmount, quotation.currency)}</span></div>` : ''}
    <div class="summary-total"><span>Grand Total</span><span>${formatCurrency(quotation.total, quotation.currency)}</span></div>
  </div>
  ${quotation.terms ? `<div class="notes"><h3>Terms & Conditions</h3><p>${quotation.terms}</p></div>` : ''}
  ${quotation.notes ? `<div class="notes" style="margin-top: 12px;"><h3>Notes</h3><p>${quotation.notes}</p></div>` : ''}
  <div class="signature">
    <div class="signature-line">Authorized Signature</div>
  </div>
  <div class="footer"><p>Thank you for considering BookFlow OS</p></div>
</body>
</html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${quotation.quotationNumber}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>
      <div className="print-area">
        {/* Toolbar */}
        <div className="no-print flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MacosButton variant="primary" icon={Printer} onClick={handlePrint}>Print</MacosButton>
            <MacosButton variant="secondary" icon={Globe} onClick={handleExport}>Export HTML</MacosButton>
            {quotation.status !== 'converted' && (
              <MacosButton variant="primary" icon={ArrowRightLeft} onClick={onConvert}>Convert to Invoice</MacosButton>
            )}
          </div>
          <MacosButton variant="ghost" icon={X} onClick={onClose}>Close</MacosButton>
        </div>

        {/* Quotation Document */}
        <div className="bg-background border border-border/50 rounded-xl p-8 max-w-3xl mx-auto" style={{ minHeight: '800px' }}>
          {/* Header */}
          <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-border/30">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                  <Crown className="size-4 text-primary" />
                </div>
                <span className="text-xl font-bold text-foreground">BookFlow OS</span>
              </div>
              <p className="text-[12px] text-muted-foreground/60 mt-1">Enterprise Book Management Platform</p>
              <p className="text-[12px] text-muted-foreground/60">123 Business Ave, Tech City, TC 12345</p>
              <p className="text-[12px] text-muted-foreground/60">contact@bookflow.os</p>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-extrabold text-foreground/90 tracking-tight">QUOTATION</h2>
              <p className="text-[13px] font-bold text-foreground mt-2">{quotation.quotationNumber}</p>
              <p className="text-[12px] text-muted-foreground/60 mt-1">Issue: {formatDate(quotation.issueDate)}</p>
              <p className="text-[12px] text-muted-foreground/60">Valid Until: {formatDate(quotation.validUntil)}</p>
            </div>
          </div>

          {/* Prepared For */}
          <div className="bg-secondary/30 rounded-lg p-4 mb-8">
            <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold mb-2">Prepared For</h3>
            <p className="text-[14px] font-semibold text-foreground">{quotation.client?.companyName || 'N/A'}</p>
            {quotation.client?.address && <p className="text-[12px] text-muted-foreground/60">{quotation.client.address}</p>}
            <p className="text-[12px] text-muted-foreground/60">
              {[quotation.client?.city, quotation.client?.country].filter(Boolean).join(', ')}
            </p>
            {quotation.client?.email && <p className="text-[12px] text-muted-foreground/60">{quotation.client.email}</p>}
            {quotation.client?.taxId && <p className="text-[12px] text-muted-foreground/60">Tax ID: {quotation.client.taxId}</p>}
          </div>

          {/* Items Table */}
          <Table className="mb-6">
            <TableHeader>
              <TableRow className="border-b-2 border-border/40 hover:bg-transparent">
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 w-10">#</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">Description</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 text-right w-14">Qty</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 text-right">Unit Price</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 text-right">Discount</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotation.items.map((item, idx) => (
                <TableRow key={idx} className="border-b border-border/20 hover:bg-transparent">
                  <TableCell className="text-[12px] text-muted-foreground/60 py-2">{idx + 1}</TableCell>
                  <TableCell className="text-[12px] font-medium py-2">{item.description}</TableCell>
                  <TableCell className="text-[12px] text-right py-2">{item.quantity}</TableCell>
                  <TableCell className="text-[12px] text-right py-2">{formatCurrency(item.unitPrice, quotation.currency)}</TableCell>
                  <TableCell className="text-[12px] text-right py-2">{formatCurrency(item.discount, quotation.currency)}</TableCell>
                  <TableCell className="text-[12px] text-right font-semibold py-2">{formatCurrency(item.total, quotation.currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Summary */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1">
              <div className="flex justify-between text-[12px] text-muted-foreground/60">
                <span>Subtotal</span>
                <span>{formatCurrency(quotation.subtotal, quotation.currency)}</span>
              </div>
              {quotation.discountAmount > 0 && (
                <div className="flex justify-between text-[12px] text-macos-red">
                  <span>Discount</span>
                  <span>-{formatCurrency(quotation.discountAmount, quotation.currency)}</span>
                </div>
              )}
              {quotation.taxRate > 0 && (
                <div className="flex justify-between text-[12px] text-muted-foreground/60">
                  <span>Tax ({quotation.taxRate}%)</span>
                  <span>{formatCurrency(quotation.taxAmount, quotation.currency)}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between text-[16px] font-bold text-foreground">
                <span>Grand Total</span>
                <span>{formatCurrency(quotation.total, quotation.currency)}</span>
              </div>
            </div>
          </div>

          {/* Terms & Notes */}
          {(quotation.terms || quotation.notes) && (
            <div className="mt-8 pt-4 border-t border-border/20 space-y-3">
              {quotation.terms && (
                <div className="bg-secondary/20 rounded-lg p-3">
                  <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold mb-1">Terms & Conditions</h4>
                  <p className="text-[12px] text-muted-foreground/70 whitespace-pre-wrap">{quotation.terms}</p>
                </div>
              )}
              {quotation.notes && (
                <div className="bg-secondary/20 rounded-lg p-3">
                  <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold mb-1">Notes</h4>
                  <p className="text-[12px] text-muted-foreground/70 whitespace-pre-wrap">{quotation.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Acceptance Signature Line */}
          <div className="mt-12">
            <div className="border-t border-border/40 pt-3 w-64">
              <p className="text-[12px] text-muted-foreground/50">Authorized Signature</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-10 text-center border-t border-border/20 pt-4">
            <p className="text-[12px] text-muted-foreground/40 font-medium">Thank you for considering BookFlow OS</p>
          </div>
        </div>
      </div>
    </>
  )
}

// ==================== MAIN MODULE ====================

export function OwnerModule() {
  const authUser = useAppStore((s) => s.authUser)
  const isViewOnly = authUser?.isViewOnly ?? false

  // --- Tab State ---
  const [activeTab, setActiveTab] = React.useState<TabId>('clients')

  // --- Data States ---
  const [clients, setClients] = React.useState<Client[]>([])
  const [subscriptions, setSubscriptions] = React.useState<Subscription[]>([])
  const [invoices, setInvoices] = React.useState<Invoice[]>([])
  const [quotations, setQuotations] = React.useState<Quotation[]>([])
  const [serialKeys, setSerialKeys] = React.useState<SerialKey[]>([])
  const [devices, setDevices] = React.useState<Device[]>([])
  const [stats, setStats] = React.useState<OwnerStats | null>(null)
  const [loading, setLoading] = React.useState(true)

  // --- Search & Filter ---
  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('all')

  // --- Dialog States ---
  const [showClientDialog, setShowClientDialog] = React.useState(false)
  const [editClient, setEditClient] = React.useState<Client | null>(null)
  const [showSubDialog, setShowSubDialog] = React.useState(false)
  const [editSub, setEditSub] = React.useState<Subscription | null>(null)
  const [showInvoiceDialog, setShowInvoiceDialog] = React.useState(false)
  const [showQuotationDialog, setShowQuotationDialog] = React.useState(false)
  const [showSerialKeyDialog, setShowSerialKeyDialog] = React.useState(false)
  const [showDeviceDialog, setShowDeviceDialog] = React.useState(false)
  const [showInvoicePrint, setShowInvoicePrint] = React.useState(false)
  const [showQuotationPrint, setShowQuotationPrint] = React.useState(false)
  const [viewInvoice, setViewInvoice] = React.useState<Invoice | null>(null)
  const [viewQuotation, setViewQuotation] = React.useState<Quotation | null>(null)

  // --- Form States ---
  const [clientForm, setClientForm] = React.useState<Partial<Client>>({})
  const [subForm, setSubForm] = React.useState<Partial<Subscription>>({})
  const [invoiceForm, setInvoiceForm] = React.useState<Record<string, unknown>>({})
  const [quotationForm, setQuotationForm] = React.useState<Record<string, unknown>>({})
  const [serialKeyForm, setSerialKeyForm] = React.useState<Record<string, unknown>>({})
  const [deviceForm, setDeviceForm] = React.useState<Record<string, unknown>>({})
  const [saving, setSaving] = React.useState(false)

  // ==================== DATA FETCHING ====================

  const fetchStats = React.useCallback(async () => {
    try {
      const res = await fetch('/api/owner?type=stats')
      const json = await res.json()
      if (json.data) setStats(json.data)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }, [])

  const fetchClients = React.useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ type: 'clients' })
      if (search) params.set('search', search)
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      const res = await fetch(`/api/owner?${params}`)
      const json = await res.json()
      if (json.data) setClients(json.data)
    } catch (err) {
      console.error('Failed to fetch clients:', err)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  const fetchSubscriptions = React.useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ type: 'subscriptions' })
      if (search) params.set('search', search)
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      const res = await fetch(`/api/owner?${params}`)
      const json = await res.json()
      if (json.data) setSubscriptions(json.data)
    } catch (err) {
      console.error('Failed to fetch subscriptions:', err)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  const fetchInvoices = React.useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ type: 'invoices' })
      if (search) params.set('search', search)
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      const res = await fetch(`/api/owner?${params}`)
      const json = await res.json()
      if (json.data) setInvoices(json.data)
    } catch (err) {
      console.error('Failed to fetch invoices:', err)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  const fetchQuotations = React.useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ type: 'quotations' })
      if (search) params.set('search', search)
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      const res = await fetch(`/api/owner?${params}`)
      const json = await res.json()
      if (json.data) setQuotations(json.data)
    } catch (err) {
      console.error('Failed to fetch quotations:', err)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  const fetchSerialKeys = React.useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ type: 'serial-keys' })
      if (search) params.set('search', search)
      const res = await fetch(`/api/owner?${params}`)
      const json = await res.json()
      if (json.data) setSerialKeys(json.data)
    } catch (err) {
      console.error('Failed to fetch serial keys:', err)
    } finally {
      setLoading(false)
    }
  }, [search])

  const fetchDevices = React.useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ type: 'devices' })
      if (search) params.set('search', search)
      const res = await fetch(`/api/owner?${params}`)
      const json = await res.json()
      if (json.data) setDevices(json.data)
    } catch (err) {
      console.error('Failed to fetch devices:', err)
    } finally {
      setLoading(false)
    }
  }, [search])

  // Fetch on mount and when tab/search/filter changes
  React.useEffect(() => {
    fetchStats()
  }, [fetchStats])

  React.useEffect(() => {
    switch (activeTab) {
      case 'clients': fetchClients(); break
      case 'subscriptions': fetchSubscriptions(); break
      case 'invoices': fetchInvoices(); break
      case 'quotations': fetchQuotations(); break
      case 'serial-keys': fetchSerialKeys(); break
      case 'devices': fetchDevices(); break
    }
  }, [activeTab, fetchClients, fetchSubscriptions, fetchInvoices, fetchQuotations, fetchSerialKeys, fetchDevices])

  // Reset search and filter on tab change
  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab)
    setSearch('')
    setStatusFilter('all')
  }

  // ==================== CRUD HANDLERS ====================

  const handleSaveClient = async () => {
    try {
      setSaving(true)
      const isEdit = !!editClient
      const url = isEdit ? `/api/owner?type=clients` : `/api/owner?type=clients`
      const method = isEdit ? 'PUT' : 'POST'
      const body = isEdit ? { id: editClient!.id, ...clientForm } : clientForm
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) {
        const json = await res.json()
        alert(json.error || 'Failed to save client')
        return
      }
      setShowClientDialog(false)
      setEditClient(null)
      setClientForm({})
      fetchClients()
      fetchStats()
    } catch (err) {
      console.error('Failed to save client:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client? This will also delete related subscriptions, invoices, quotations, devices, and serial keys.')) return
    try {
      await fetch(`/api/owner?type=clients&id=${id}`, { method: 'DELETE' })
      fetchClients()
      fetchStats()
    } catch (err) {
      console.error('Failed to delete client:', err)
    }
  }

  const handleSaveSub = async () => {
    try {
      setSaving(true)
      const isEdit = !!editSub
      const method = isEdit ? 'PUT' : 'POST'
      const body = isEdit ? { id: editSub!.id, ...subForm } : subForm
      const res = await fetch(`/api/owner?type=subscriptions`, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) {
        const json = await res.json()
        alert(json.error || 'Failed to save subscription')
        return
      }
      setShowSubDialog(false)
      setEditSub(null)
      setSubForm({})
      fetchSubscriptions()
      fetchStats()
    } catch (err) {
      console.error('Failed to save subscription:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSub = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return
    try {
      await fetch(`/api/owner?type=subscriptions&id=${id}`, { method: 'DELETE' })
      fetchSubscriptions()
      fetchStats()
    } catch (err) {
      console.error('Failed to delete subscription:', err)
    }
  }

  const handleSaveInvoice = async () => {
    try {
      setSaving(true)
      const items = (invoiceForm.items as InvoiceItem[] | undefined) || []
      if (!invoiceForm.clientId || items.length === 0) {
        alert('Client and at least one item are required')
        setSaving(false)
        return
      }
      const res = await fetch(`/api/owner?type=invoices`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(invoiceForm) })
      if (!res.ok) {
        const json = await res.json()
        alert(json.error || 'Failed to create invoice')
        setSaving(false)
        return
      }
      setShowInvoiceDialog(false)
      setInvoiceForm({})
      fetchInvoices()
      fetchStats()
    } catch (err) {
      console.error('Failed to save invoice:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return
    try {
      await fetch(`/api/owner?type=invoices&id=${id}`, { method: 'DELETE' })
      fetchInvoices()
      fetchStats()
    } catch (err) {
      console.error('Failed to delete invoice:', err)
    }
  }

  const handleSaveQuotation = async () => {
    try {
      setSaving(true)
      const items = (quotationForm.items as QuotationItem[] | undefined) || []
      if (!quotationForm.clientId || items.length === 0) {
        alert('Client and at least one item are required')
        setSaving(false)
        return
      }
      const res = await fetch(`/api/owner?type=quotations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(quotationForm) })
      if (!res.ok) {
        const json = await res.json()
        alert(json.error || 'Failed to create quotation')
        setSaving(false)
        return
      }
      setShowQuotationDialog(false)
      setQuotationForm({})
      fetchQuotations()
      fetchStats()
    } catch (err) {
      console.error('Failed to save quotation:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteQuotation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quotation?')) return
    try {
      await fetch(`/api/owner?type=quotations&id=${id}`, { method: 'DELETE' })
      fetchQuotations()
      fetchStats()
    } catch (err) {
      console.error('Failed to delete quotation:', err)
    }
  }

  const handleGenerateKey = async () => {
    try {
      setSaving(true)
      const res = await fetch(`/api/owner?type=serial-keys`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(serialKeyForm) })
      if (!res.ok) {
        const json = await res.json()
        alert(json.error || 'Failed to generate serial key')
        setSaving(false)
        return
      }
      setShowSerialKeyDialog(false)
      setSerialKeyForm({})
      fetchSerialKeys()
      fetchStats()
    } catch (err) {
      console.error('Failed to generate serial key:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this serial key?')) return
    try {
      await fetch(`/api/owner?type=serial-keys&id=${id}`, { method: 'DELETE' })
      fetchSerialKeys()
      fetchStats()
    } catch (err) {
      console.error('Failed to delete serial key:', err)
    }
  }

  const handleSaveDevice = async () => {
    try {
      setSaving(true)
      const res = await fetch(`/api/owner?type=devices`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(deviceForm) })
      if (!res.ok) {
        const json = await res.json()
        alert(json.error || 'Failed to add device')
        setSaving(false)
        return
      }
      setShowDeviceDialog(false)
      setDeviceForm({})
      fetchDevices()
      fetchStats()
    } catch (err) {
      console.error('Failed to save device:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteDevice = async (id: string) => {
    if (!confirm('Are you sure you want to delete this device?')) return
    try {
      await fetch(`/api/owner?type=devices&id=${id}`, { method: 'DELETE' })
      fetchDevices()
      fetchStats()
    } catch (err) {
      console.error('Failed to delete device:', err)
    }
  }

  const handleViewInvoice = async (id: string) => {
    try {
      const res = await fetch(`/api/owner?type=invoice-detail&id=${id}`)
      const json = await res.json()
      if (json.data) {
        setViewInvoice(json.data)
        setShowInvoicePrint(true)
      }
    } catch (err) {
      console.error('Failed to fetch invoice details:', err)
    }
  }

  const handleViewQuotation = async (id: string) => {
    try {
      const res = await fetch(`/api/owner?type=quotation-detail&id=${id}`)
      const json = await res.json()
      if (json.data) {
        setViewQuotation(json.data)
        setShowQuotationPrint(true)
      }
    } catch (err) {
      console.error('Failed to fetch quotation details:', err)
    }
  }

  const handleConvertQuotationToInvoice = async () => {
    if (!viewQuotation) return
    if (!confirm('Convert this quotation to an invoice?')) return
    try {
      // Create invoice from quotation data
      const invoiceData = {
        clientId: viewQuotation.clientId,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        items: viewQuotation.items.map(i => ({
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          discount: i.discount,
          total: i.total,
        })),
        discountAmount: viewQuotation.discountAmount,
        taxRate: viewQuotation.taxRate,
        notes: viewQuotation.notes,
        terms: viewQuotation.terms,
        currency: viewQuotation.currency,
        status: 'draft',
      }
      const res = await fetch(`/api/owner?type=invoices`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(invoiceData) })
      if (res.ok) {
        const json = await res.json()
        // Update quotation status
        if (json.data) {
          await fetch(`/api/owner?type=quotations`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: viewQuotation.id, status: 'converted', convertedInvoiceId: json.data.id }),
          })
        }
        setShowQuotationPrint(false)
        setViewQuotation(null)
        fetchQuotations()
        fetchInvoices()
        fetchStats()
        alert('Quotation converted to invoice successfully!')
      }
    } catch (err) {
      console.error('Failed to convert quotation:', err)
    }
  }

  // ==================== COMPUTED VALUES ====================

  const trialClients = clients.filter(c => c.status === 'trial').length
  const pastDueSubs = subscriptions.filter(s => s.status === 'past_due').length
  const mrr = subscriptions.filter(s => s.status === 'active' && s.planType === 'monthly').reduce((sum, s) => sum + s.price, 0)
  const acceptedQuotations = quotations.filter(q => q.status === 'accepted').length
  const conversionRate = quotations.length > 0 ? Math.round((acceptedQuotations / quotations.length) * 100) : 0
  const assignedKeys = serialKeys.filter(k => k.clientId).length
  const expiredKeys = serialKeys.filter(k => !k.isActive || (k.expiresAt && new Date(k.expiresAt) < new Date())).length
  const inactiveDevices = devices.filter(d => !d.isActive).length

  // ==================== FILTER CONFIGS ====================

  const clientFilters = [
    { id: 'all', label: 'All', count: clients.length },
    { id: 'active', label: 'Active' },
    { id: 'trial', label: 'Trial' },
    { id: 'suspended', label: 'Suspended' },
    { id: 'churned', label: 'Churned' },
  ]

  const subFilters = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'trial', label: 'Trial' },
    { id: 'past_due', label: 'Past Due' },
    { id: 'expired', label: 'Expired' },
    { id: 'cancelled', label: 'Cancelled' },
  ]

  const invoiceFilters = [
    { id: 'all', label: 'All' },
    { id: 'draft', label: 'Draft' },
    { id: 'sent', label: 'Sent' },
    { id: 'paid', label: 'Paid' },
    { id: 'overdue', label: 'Overdue' },
  ]

  const quotationFilters = [
    { id: 'all', label: 'All' },
    { id: 'draft', label: 'Draft' },
    { id: 'sent', label: 'Sent' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'rejected', label: 'Rejected' },
    { id: 'expired', label: 'Expired' },
  ]

  // ==================== RENDER ====================

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <MacosPageHeader
        title="Owner Portal"
        subtitle="Manage clients, subscriptions, billing & licensing"
        icon={Crown}
        iconColor="text-macos-purple"
        iconBg="bg-macos-purple/10"
      />

      {/* Tab Navigation */}
      <div className="macos-filter-bar">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'macos-filter-item gap-1.5',
                activeTab === tab.id && 'macos-filter-item-active'
              )}
            >
              <Icon className="size-3.5" strokeWidth={1.8} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ==================== CLIENTS TAB ==================== */}
      {activeTab === 'clients' && (
        <div className="space-y-4">
          <MacosStatGrid>
            <MacosStatCard label="Total Clients" value={stats?.totalClients ?? 0} icon={Users} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" />
            <MacosStatCard label="Active Clients" value={stats?.activeClients ?? 0} icon={UserCheck} iconColor="text-macos-green" iconBg="bg-macos-green/10" />
            <MacosStatCard label="Churned" value={stats?.churnedClients ?? 0} icon={UserX} iconColor="text-macos-red" iconBg="bg-macos-red/10" />
            <MacosStatCard label="Trial" value={trialClients} icon={UserPlus} iconColor="text-macos-orange" iconBg="bg-macos-orange/10" />
          </MacosStatGrid>

          <div className="flex items-center gap-3">
            <MacosSearch value={search} onChange={setSearch} placeholder="Search by company, contact, email..." className="flex-1" />
            <MacosFilterBar items={clientFilters} activeId={statusFilter} onChange={setStatusFilter} />
            {!isViewOnly && (
              <MacosButton variant="primary" icon={Plus} onClick={() => { setEditClient(null); setClientForm({ status: 'active' }); setShowClientDialog(true) }}>
                Add Client
              </MacosButton>
            )}
          </div>

          {loading ? (
            <div className="macos-card macos-shadow-card p-8 text-center text-[13px] text-muted-foreground/50">Loading clients...</div>
          ) : clients.length === 0 ? (
            <MacosEmptyState icon={Users} title="No Clients Yet" description="Add your first client to get started with the owner portal." action={!isViewOnly ? <MacosButton variant="primary" icon={Plus} onClick={() => { setEditClient(null); setClientForm({ status: 'active' }); setShowClientDialog(true) }}>Add Client</MacosButton> : undefined} />
          ) : (
            <MacosTableCard
              headers={[
                { key: 'company', label: 'Company Name' },
                { key: 'contact', label: 'Contact Person' },
                { key: 'email', label: 'Email' },
                { key: 'phone', label: 'Phone' },
                { key: 'status', label: 'Status' },
                { key: 'industry', label: 'Industry' },
                { key: 'onboarded', label: 'Onboarded' },
                { key: 'actions', label: '' },
              ]}
              rows={clients.map((c) => ({
                company: <span className="font-semibold text-foreground">{c.companyName}</span>,
                contact: c.contactPerson,
                email: <span className="text-muted-foreground/70">{c.email}</span>,
                phone: c.phone || '—',
                status: <MacosBadge variant={clientStatusVariant(c.status)}>{c.status}</MacosBadge>,
                industry: c.industry || '—',
                onboarded: formatDate(c.onboardingDate),
                actions: !isViewOnly ? (
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditClient(c); setClientForm({ companyName: c.companyName, contactPerson: c.contactPerson, email: c.email, phone: c.phone, address: c.address, city: c.city, state: c.state, country: c.country, postalCode: c.postalCode, taxId: c.taxId, website: c.website, industry: c.industry, notes: c.notes, status: c.status }); setShowClientDialog(true) }} className="p-1 rounded hover:bg-secondary text-muted-foreground/50 hover:text-foreground transition-colors"><Pencil className="size-3.5" /></button>
                    <button onClick={() => handleDeleteClient(c.id)} className="p-1 rounded hover:bg-macos-red/10 text-muted-foreground/50 hover:text-macos-red transition-colors"><Trash2 className="size-3.5" /></button>
                  </div>
                ) : null,
              }))}
            />
          )}

          {/* Client Dialog */}
          <MacosDialog
            open={showClientDialog}
            onOpenChange={setShowClientDialog}
            title={editClient ? 'Edit Client' : 'Add Client'}
            description="Enter client information below"
            className="max-w-2xl"
            footer={
              <>
                <MacosButton variant="secondary" onClick={() => setShowClientDialog(false)} disabled={saving}>Cancel</MacosButton>
                <MacosButton variant="primary" onClick={handleSaveClient} disabled={saving}>{saving ? 'Saving...' : editClient ? 'Update' : 'Create'}</MacosButton>
              </>
            }
          >
            <ScrollArea className="max-h-[60vh] pr-2">
              <div className="grid grid-cols-2 gap-4">
                <MacosFormField label="Company Name *">
                  <Input value={clientForm.companyName || ''} onChange={(e) => setClientForm({ ...clientForm, companyName: e.target.value })} className="h-8 text-[12px]" placeholder="Acme Corp" />
                </MacosFormField>
                <MacosFormField label="Contact Person *">
                  <Input value={clientForm.contactPerson || ''} onChange={(e) => setClientForm({ ...clientForm, contactPerson: e.target.value })} className="h-8 text-[12px]" placeholder="John Doe" />
                </MacosFormField>
                <MacosFormField label="Email *">
                  <Input type="email" value={clientForm.email || ''} onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })} className="h-8 text-[12px]" placeholder="john@acme.com" />
                </MacosFormField>
                <MacosFormField label="Phone">
                  <Input value={clientForm.phone || ''} onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })} className="h-8 text-[12px]" placeholder="+1 555 0100" />
                </MacosFormField>
                <div className="col-span-2">
                  <MacosFormField label="Address">
                    <Input value={clientForm.address || ''} onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })} className="h-8 text-[12px]" placeholder="123 Business Ave" />
                  </MacosFormField>
                </div>
                <MacosFormField label="City">
                  <Input value={clientForm.city || ''} onChange={(e) => setClientForm({ ...clientForm, city: e.target.value })} className="h-8 text-[12px]" />
                </MacosFormField>
                <MacosFormField label="State">
                  <Input value={clientForm.state || ''} onChange={(e) => setClientForm({ ...clientForm, state: e.target.value })} className="h-8 text-[12px]" />
                </MacosFormField>
                <MacosFormField label="Country">
                  <Input value={clientForm.country || ''} onChange={(e) => setClientForm({ ...clientForm, country: e.target.value })} className="h-8 text-[12px]" />
                </MacosFormField>
                <MacosFormField label="Postal Code">
                  <Input value={clientForm.postalCode || ''} onChange={(e) => setClientForm({ ...clientForm, postalCode: e.target.value })} className="h-8 text-[12px]" />
                </MacosFormField>
                <MacosFormField label="Tax ID">
                  <Input value={clientForm.taxId || ''} onChange={(e) => setClientForm({ ...clientForm, taxId: e.target.value })} className="h-8 text-[12px]" />
                </MacosFormField>
                <MacosFormField label="Website">
                  <Input value={clientForm.website || ''} onChange={(e) => setClientForm({ ...clientForm, website: e.target.value })} className="h-8 text-[12px]" placeholder="https://acme.com" />
                </MacosFormField>
                <MacosFormField label="Industry">
                  <Select value={clientForm.industry || ''} onValueChange={(v) => setClientForm({ ...clientForm, industry: v })}>
                    <SelectTrigger className="h-8 text-[12px]"><SelectValue placeholder="Select industry" /></SelectTrigger>
                    <SelectContent>
                      {['Technology', 'Education', 'Retail', 'Healthcare', 'Finance', 'Manufacturing', 'Media', 'Other'].map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </MacosFormField>
                <MacosFormField label="Status">
                  <Select value={clientForm.status || 'active'} onValueChange={(v) => setClientForm({ ...clientForm, status: v })}>
                    <SelectTrigger className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="churned">Churned</SelectItem>
                    </SelectContent>
                  </Select>
                </MacosFormField>
                <div className="col-span-2">
                  <MacosFormField label="Notes">
                    <Textarea value={clientForm.notes || ''} onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })} className="text-[12px] min-h-[60px]" placeholder="Additional notes..." />
                  </MacosFormField>
                </div>
              </div>
            </ScrollArea>
          </MacosDialog>
        </div>
      )}

      {/* ==================== SUBSCRIPTIONS TAB ==================== */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-4">
          <MacosStatGrid>
            <MacosStatCard label="Total Subscriptions" value={stats?.totalSubscriptions ?? 0} icon={CreditCard} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" />
            <MacosStatCard label="Active" value={stats?.activeSubscriptions ?? 0} icon={CheckCircle2} iconColor="text-macos-green" iconBg="bg-macos-green/10" />
            <MacosStatCard label="Past Due" value={pastDueSubs} icon={AlertCircle} iconColor="text-macos-orange" iconBg="bg-macos-orange/10" />
            <MacosStatCard label="MRR" value={formatCurrency(mrr)} icon={DollarSign} iconColor="text-macos-purple" iconBg="bg-macos-purple/10" />
          </MacosStatGrid>

          <div className="flex items-center gap-3">
            <MacosSearch value={search} onChange={setSearch} placeholder="Search by plan or client..." className="flex-1" />
            <MacosFilterBar items={subFilters} activeId={statusFilter} onChange={setStatusFilter} />
            {!isViewOnly && (
              <MacosButton variant="primary" icon={Plus} onClick={() => { setEditSub(null); setSubForm({ planType: 'monthly', status: 'active', autoRenew: true, maxUsers: 5, maxBranches: 1, maxDevices: 3, storageGB: 5, currency: 'USD' }); setShowSubDialog(true) }}>
                Add Subscription
              </MacosButton>
            )}
          </div>

          {loading ? (
            <div className="macos-card macos-shadow-card p-8 text-center text-[13px] text-muted-foreground/50">Loading subscriptions...</div>
          ) : subscriptions.length === 0 ? (
            <MacosEmptyState icon={CreditCard} title="No Subscriptions" description="Create your first subscription plan." action={!isViewOnly ? <MacosButton variant="primary" icon={Plus} onClick={() => { setEditSub(null); setSubForm({ planType: 'monthly', status: 'active', autoRenew: true, maxUsers: 5, maxBranches: 1, maxDevices: 3, storageGB: 5, currency: 'USD' }); setShowSubDialog(true) }}>Add Subscription</MacosButton> : undefined} />
          ) : (
            <MacosTableCard
              headers={[
                { key: 'client', label: 'Client' },
                { key: 'plan', label: 'Plan' },
                { key: 'type', label: 'Type' },
                { key: 'price', label: 'Price' },
                { key: 'start', label: 'Start' },
                { key: 'end', label: 'End' },
                { key: 'status', label: 'Status' },
                { key: 'autoRenew', label: 'Auto-Renew' },
                { key: 'actions', label: '' },
              ]}
              rows={subscriptions.map((s) => ({
                client: <span className="font-semibold text-foreground">{s.client?.companyName || '—'}</span>,
                plan: s.planName,
                type: <MacosBadge variant={s.planType === 'yearly' ? 'info' : s.planType === 'trial' ? 'warning' : 'default'}>{s.planType}</MacosBadge>,
                price: formatCurrency(s.price, s.currency),
                start: formatDate(s.startDate),
                end: formatDate(s.endDate),
                status: <MacosBadge variant={subStatusVariant(s.status)}>{s.status.replace('_', ' ')}</MacosBadge>,
                autoRenew: s.autoRenew ? <Check className="size-3.5 text-macos-green" /> : <X className="size-3.5 text-muted-foreground/40" />,
                actions: !isViewOnly ? (
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditSub(s); setSubForm({ clientId: s.clientId, planName: s.planName, planType: s.planType, price: s.price, currency: s.currency, startDate: s.startDate ? new Date(s.startDate).toISOString().split('T')[0] : '', endDate: s.endDate ? new Date(s.endDate).toISOString().split('T')[0] : '', status: s.status, autoRenew: s.autoRenew, maxUsers: s.maxUsers, maxBranches: s.maxBranches, maxDevices: s.maxDevices, storageGB: s.storageGB, features: s.features }); setShowSubDialog(true) }} className="p-1 rounded hover:bg-secondary text-muted-foreground/50 hover:text-foreground transition-colors"><Pencil className="size-3.5" /></button>
                    <button onClick={() => handleDeleteSub(s.id)} className="p-1 rounded hover:bg-macos-red/10 text-muted-foreground/50 hover:text-macos-red transition-colors"><Trash2 className="size-3.5" /></button>
                  </div>
                ) : null,
              }))}
            />
          )}

          {/* Subscription Dialog */}
          <MacosDialog
            open={showSubDialog}
            onOpenChange={setShowSubDialog}
            title={editSub ? 'Edit Subscription' : 'Add Subscription'}
            className="max-w-2xl"
            footer={
              <>
                <MacosButton variant="secondary" onClick={() => setShowSubDialog(false)} disabled={saving}>Cancel</MacosButton>
                <MacosButton variant="primary" onClick={handleSaveSub} disabled={saving}>{saving ? 'Saving...' : editSub ? 'Update' : 'Create'}</MacosButton>
              </>
            }
          >
            <ScrollArea className="max-h-[60vh] pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <MacosFormField label="Client *">
                    <Select value={subForm.clientId || ''} onValueChange={(v) => setSubForm({ ...subForm, clientId: v })}>
                      <SelectTrigger className="h-8 text-[12px]"><SelectValue placeholder="Select client" /></SelectTrigger>
                      <SelectContent>
                        {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </MacosFormField>
                </div>
                <MacosFormField label="Plan Name *">
                  <Select value={subForm.planName || ''} onValueChange={(v) => setSubForm({ ...subForm, planName: v })}>
                    <SelectTrigger className="h-8 text-[12px]"><SelectValue placeholder="Select plan" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Trial">Trial</SelectItem>
                      <SelectItem value="Starter">Starter</SelectItem>
                      <SelectItem value="Professional">Professional</SelectItem>
                      <SelectItem value="Enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </MacosFormField>
                <MacosFormField label="Plan Type">
                  <Select value={subForm.planType || 'monthly'} onValueChange={(v) => setSubForm({ ...subForm, planType: v })}>
                    <SelectTrigger className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                    </SelectContent>
                  </Select>
                </MacosFormField>
                <MacosFormField label="Price">
                  <Input type="number" value={subForm.price || 0} onChange={(e) => setSubForm({ ...subForm, price: Number(e.target.value) })} className="h-8 text-[12px]" min={0} step={0.01} />
                </MacosFormField>
                <MacosFormField label="Currency">
                  <Select value={subForm.currency || 'USD'} onValueChange={(v) => setSubForm({ ...subForm, currency: v })}>
                    <SelectTrigger className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="SAR">SAR</SelectItem>
                      <SelectItem value="AED">AED</SelectItem>
                    </SelectContent>
                  </Select>
                </MacosFormField>
                <MacosFormField label="Start Date *">
                  <Input type="date" value={subForm.startDate || ''} onChange={(e) => setSubForm({ ...subForm, startDate: e.target.value })} className="h-8 text-[12px]" />
                </MacosFormField>
                <MacosFormField label="End Date">
                  <Input type="date" value={subForm.endDate || ''} onChange={(e) => setSubForm({ ...subForm, endDate: e.target.value })} className="h-8 text-[12px]" />
                </MacosFormField>
                <MacosFormField label="Status">
                  <Select value={subForm.status || 'active'} onValueChange={(v) => setSubForm({ ...subForm, status: v })}>
                    <SelectTrigger className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="past_due">Past Due</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </MacosFormField>
                <MacosFormField label="Auto Renew">
                  <div className="flex items-center gap-2 h-8">
                    <Checkbox checked={subForm.autoRenew !== false} onCheckedChange={(v) => setSubForm({ ...subForm, autoRenew: v === true })} />
                    <span className="text-[12px] text-muted-foreground/60">{subForm.autoRenew !== false ? 'Yes' : 'No'}</span>
                  </div>
                </MacosFormField>
                <MacosFormField label="Max Users">
                  <Input type="number" value={subForm.maxUsers || 5} onChange={(e) => setSubForm({ ...subForm, maxUsers: Number(e.target.value) })} className="h-8 text-[12px]" min={1} />
                </MacosFormField>
                <MacosFormField label="Max Branches">
                  <Input type="number" value={subForm.maxBranches || 1} onChange={(e) => setSubForm({ ...subForm, maxBranches: Number(e.target.value) })} className="h-8 text-[12px]" min={1} />
                </MacosFormField>
                <MacosFormField label="Max Devices">
                  <Input type="number" value={subForm.maxDevices || 3} onChange={(e) => setSubForm({ ...subForm, maxDevices: Number(e.target.value) })} className="h-8 text-[12px]" min={1} />
                </MacosFormField>
                <MacosFormField label="Storage (GB)">
                  <Input type="number" value={subForm.storageGB || 5} onChange={(e) => setSubForm({ ...subForm, storageGB: Number(e.target.value) })} className="h-8 text-[12px]" min={1} />
                </MacosFormField>
                <div className="col-span-2">
                  <MacosFormField label="Features (JSON)">
                    <Textarea value={subForm.features || ''} onChange={(e) => setSubForm({ ...subForm, features: e.target.value })} className="text-[12px] min-h-[60px]" placeholder='["feature1", "feature2"]' />
                  </MacosFormField>
                </div>
              </div>
            </ScrollArea>
          </MacosDialog>
        </div>
      )}

      {/* ==================== INVOICES TAB ==================== */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <MacosStatGrid>
            <MacosStatCard label="Total Invoices" value={stats?.totalInvoices ?? 0} icon={FileText} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" />
            <MacosStatCard label="Paid" value={stats?.paidInvoices ?? 0} icon={CheckCircle2} iconColor="text-macos-green" iconBg="bg-macos-green/10" />
            <MacosStatCard label="Overdue" value={stats?.overdueInvoices ?? 0} icon={AlertCircle} iconColor="text-macos-red" iconBg="bg-macos-red/10" />
            <MacosStatCard label="Total Revenue" value={formatCurrency(stats?.totalRevenue ?? 0)} icon={DollarSign} iconColor="text-macos-purple" iconBg="bg-macos-purple/10" />
          </MacosStatGrid>

          <div className="flex items-center gap-3">
            <MacosSearch value={search} onChange={setSearch} placeholder="Search by invoice # or client..." className="flex-1" />
            <MacosFilterBar items={invoiceFilters} activeId={statusFilter} onChange={setStatusFilter} />
            {!isViewOnly && (
              <MacosButton variant="primary" icon={Plus} onClick={() => {
                const today = new Date().toISOString().split('T')[0]
                const due = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
                setInvoiceForm({ issueDate: today, dueDate: due, currency: 'USD', discountAmount: 0, taxRate: 0, items: [], status: 'draft' })
                setShowInvoiceDialog(true)
              }}>
                New Invoice
              </MacosButton>
            )}
          </div>

          {loading ? (
            <div className="macos-card macos-shadow-card p-8 text-center text-[13px] text-muted-foreground/50">Loading invoices...</div>
          ) : invoices.length === 0 ? (
            <MacosEmptyState icon={FileText} title="No Invoices" description="Create your first invoice for a client." action={!isViewOnly ? <MacosButton variant="primary" icon={Plus} onClick={() => { const today = new Date().toISOString().split('T')[0]; const due = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]; setInvoiceForm({ issueDate: today, dueDate: due, currency: 'USD', discountAmount: 0, taxRate: 0, items: [], status: 'draft' }); setShowInvoiceDialog(true) }}>New Invoice</MacosButton> : undefined} />
          ) : (
            <MacosTableCard
              headers={[
                { key: 'number', label: 'Invoice #' },
                { key: 'client', label: 'Client' },
                { key: 'issueDate', label: 'Issue Date' },
                { key: 'dueDate', label: 'Due Date' },
                { key: 'total', label: 'Total' },
                { key: 'status', label: 'Status' },
                { key: 'payment', label: 'Payment' },
                { key: 'actions', label: '' },
              ]}
              rows={invoices.map((inv) => ({
                number: <span className="font-bold text-foreground">{inv.invoiceNumber}</span>,
                client: inv.client?.companyName || '—',
                issueDate: formatDate(inv.issueDate),
                dueDate: formatDate(inv.dueDate),
                total: <span className="font-semibold">{formatCurrency(inv.total, inv.currency)}</span>,
                status: <MacosBadge variant={invoiceStatusVariant(inv.status)}>{inv.status}</MacosBadge>,
                payment: inv.paymentMethod || '—',
                actions: (
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleViewInvoice(inv.id)} className="p-1 rounded hover:bg-secondary text-muted-foreground/50 hover:text-foreground transition-colors" title="View/Print"><Eye className="size-3.5" /></button>
                    <button onClick={() => handleViewInvoice(inv.id)} className="p-1 rounded hover:bg-secondary text-muted-foreground/50 hover:text-foreground transition-colors" title="Print"><Printer className="size-3.5" /></button>
                    {!isViewOnly && (
                      <button onClick={() => handleDeleteInvoice(inv.id)} className="p-1 rounded hover:bg-macos-red/10 text-muted-foreground/50 hover:text-macos-red transition-colors"><Trash2 className="size-3.5" /></button>
                    )}
                  </div>
                ),
              }))}
            />
          )}

          {/* New Invoice Dialog */}
          <MacosDialog
            open={showInvoiceDialog}
            onOpenChange={setShowInvoiceDialog}
            title="Create New Invoice"
            className="max-w-3xl"
            footer={
              <>
                <MacosButton variant="secondary" onClick={() => setShowInvoiceDialog(false)} disabled={saving}>Cancel</MacosButton>
                <MacosButton variant="primary" onClick={handleSaveInvoice} disabled={saving}>{saving ? 'Creating...' : 'Create Invoice'}</MacosButton>
              </>
            }
          >
            <ScrollArea className="max-h-[70vh] pr-2">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <MacosFormField label="Client *">
                    <Select value={(invoiceForm.clientId as string) || ''} onValueChange={(v) => setInvoiceForm({ ...invoiceForm, clientId: v })}>
                      <SelectTrigger className="h-8 text-[12px]"><SelectValue placeholder="Select client" /></SelectTrigger>
                      <SelectContent>
                        {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </MacosFormField>
                  <MacosFormField label="Subscription (optional)">
                    <Select value={(invoiceForm.subscriptionId as string) || 'none'} onValueChange={(v) => setInvoiceForm({ ...invoiceForm, subscriptionId: v === 'none' ? null : v })}>
                      <SelectTrigger className="h-8 text-[12px]"><SelectValue placeholder="None" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {subscriptions.filter(s => s.clientId === invoiceForm.clientId).map(s => <SelectItem key={s.id} value={s.id}>{s.planName} - {formatCurrency(s.price, s.currency)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </MacosFormField>
                  <MacosFormField label="Issue Date *">
                    <Input type="date" value={(invoiceForm.issueDate as string) || ''} onChange={(e) => setInvoiceForm({ ...invoiceForm, issueDate: e.target.value })} className="h-8 text-[12px]" />
                  </MacosFormField>
                  <MacosFormField label="Due Date *">
                    <Input type="date" value={(invoiceForm.dueDate as string) || ''} onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })} className="h-8 text-[12px]" />
                  </MacosFormField>
                  <MacosFormField label="Currency">
                    <Select value={(invoiceForm.currency as string) || 'USD'} onValueChange={(v) => setInvoiceForm({ ...invoiceForm, currency: v })}>
                      <SelectTrigger className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="SAR">SAR</SelectItem>
                        <SelectItem value="AED">AED</SelectItem>
                      </SelectContent>
                    </Select>
                  </MacosFormField>
                  <MacosFormField label="Discount Amount">
                    <Input type="number" value={(invoiceForm.discountAmount as number) || 0} onChange={(e) => setInvoiceForm({ ...invoiceForm, discountAmount: Number(e.target.value) })} className="h-8 text-[12px]" min={0} step={0.01} />
                  </MacosFormField>
                  <MacosFormField label="Tax Rate (%)">
                    <Input type="number" value={(invoiceForm.taxRate as number) || 0} onChange={(e) => setInvoiceForm({ ...invoiceForm, taxRate: Number(e.target.value) })} className="h-8 text-[12px]" min={0} max={100} step={0.1} />
                  </MacosFormField>
                </div>

                <Separator />

                {/* Line Items */}
                <LineItemsEditor
                  items={(invoiceForm.items as InvoiceItem[]) || []}
                  onChange={(items) => setInvoiceForm({ ...invoiceForm, items })}
                />

                {/* Auto-calc Summary */}
                {((invoiceForm.items as InvoiceItem[]) || []).length > 0 && (
                  <div className="bg-secondary/30 rounded-lg p-4 space-y-1">
                    <div className="flex justify-between text-[12px] text-muted-foreground/60">
                      <span>Subtotal</span>
                      <span>{formatCurrency(((invoiceForm.items as InvoiceItem[]) || []).reduce((s, i) => s + (i.total || 0), 0), (invoiceForm.currency as string) || 'USD')}</span>
                    </div>
                    {Number(invoiceForm.discountAmount) > 0 && (
                      <div className="flex justify-between text-[12px] text-macos-red">
                        <span>Discount</span>
                        <span>-{formatCurrency(Number(invoiceForm.discountAmount) || 0, (invoiceForm.currency as string) || 'USD')}</span>
                      </div>
                    )}
                    {Number(invoiceForm.taxRate) > 0 && (
                      <div className="flex justify-between text-[12px] text-muted-foreground/60">
                        <span>Tax ({String(invoiceForm.taxRate)}%)</span>
                        <span>{formatCurrency((((invoiceForm.items as InvoiceItem[]) || []).reduce((s, i) => s + (i.total || 0), 0) - (Number(invoiceForm.discountAmount) || 0)) * (Number(invoiceForm.taxRate) || 0) / 100, (invoiceForm.currency as string) || 'USD')}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-[14px] font-bold text-foreground">
                      <span>Grand Total</span>
                      <span>{formatCurrency(
                        ((invoiceForm.items as InvoiceItem[]) || []).reduce((s, i) => s + (i.total || 0), 0)
                        - (Number(invoiceForm.discountAmount) || 0)
                        + (((invoiceForm.items as InvoiceItem[]) || []).reduce((s, i) => s + (i.total || 0), 0) - (Number(invoiceForm.discountAmount) || 0)) * (Number(invoiceForm.taxRate) || 0) / 100,
                        (invoiceForm.currency as string) || 'USD'
                      )}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <MacosFormField label="Notes">
                    <Textarea value={(invoiceForm.notes as string) || ''} onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })} className="text-[12px] min-h-[60px]" placeholder="Invoice notes..." />
                  </MacosFormField>
                  <MacosFormField label="Terms & Conditions">
                    <Textarea value={(invoiceForm.terms as string) || ''} onChange={(e) => setInvoiceForm({ ...invoiceForm, terms: e.target.value })} className="text-[12px] min-h-[60px]" placeholder="Payment terms..." />
                  </MacosFormField>
                </div>
              </div>
            </ScrollArea>
          </MacosDialog>

          {/* Invoice Print Dialog */}
          <MacosDialog
            open={showInvoicePrint}
            onOpenChange={(open) => { setShowInvoicePrint(open); if (!open) setViewInvoice(null) }}
            title=""
            className="max-w-4xl max-h-[90vh]"
          >
            <ScrollArea className="max-h-[80vh]">
              {viewInvoice && <InvoicePrintLayout invoice={viewInvoice} onClose={() => { setShowInvoicePrint(false); setViewInvoice(null) }} />}
            </ScrollArea>
          </MacosDialog>
        </div>
      )}

      {/* ==================== QUOTATIONS TAB ==================== */}
      {activeTab === 'quotations' && (
        <div className="space-y-4">
          <MacosStatGrid>
            <MacosStatCard label="Total Quotations" value={stats?.totalQuotations ?? 0} icon={FileText} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" />
            <MacosStatCard label="Pending" value={stats?.pendingQuotations ?? 0} icon={Clock} iconColor="text-macos-orange" iconBg="bg-macos-orange/10" />
            <MacosStatCard label="Accepted" value={acceptedQuotations} icon={CheckCircle2} iconColor="text-macos-green" iconBg="bg-macos-green/10" />
            <MacosStatCard label="Conversion Rate" value={`${conversionRate}%`} icon={BarChart3} iconColor="text-macos-purple" iconBg="bg-macos-purple/10" />
          </MacosStatGrid>

          <div className="flex items-center gap-3">
            <MacosSearch value={search} onChange={setSearch} placeholder="Search by quotation # or client..." className="flex-1" />
            <MacosFilterBar items={quotationFilters} activeId={statusFilter} onChange={setStatusFilter} />
            {!isViewOnly && (
              <MacosButton variant="primary" icon={Plus} onClick={() => {
                const today = new Date().toISOString().split('T')[0]
                const validUntil = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
                setQuotationForm({ issueDate: today, validUntil, currency: 'USD', discountAmount: 0, taxRate: 0, items: [], status: 'draft' })
                setShowQuotationDialog(true)
              }}>
                New Quotation
              </MacosButton>
            )}
          </div>

          {loading ? (
            <div className="macos-card macos-shadow-card p-8 text-center text-[13px] text-muted-foreground/50">Loading quotations...</div>
          ) : quotations.length === 0 ? (
            <MacosEmptyState icon={FileText} title="No Quotations" description="Create your first quotation for a client." action={!isViewOnly ? <MacosButton variant="primary" icon={Plus} onClick={() => { const today = new Date().toISOString().split('T')[0]; const validUntil = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]; setQuotationForm({ issueDate: today, validUntil, currency: 'USD', discountAmount: 0, taxRate: 0, items: [], status: 'draft' }); setShowQuotationDialog(true) }}>New Quotation</MacosButton> : undefined} />
          ) : (
            <MacosTableCard
              headers={[
                { key: 'number', label: 'Quotation #' },
                { key: 'client', label: 'Client' },
                { key: 'issueDate', label: 'Issue Date' },
                { key: 'validUntil', label: 'Valid Until' },
                { key: 'total', label: 'Total' },
                { key: 'status', label: 'Status' },
                { key: 'actions', label: '' },
              ]}
              rows={quotations.map((q) => ({
                number: <span className="font-bold text-foreground">{q.quotationNumber}</span>,
                client: q.client?.companyName || '—',
                issueDate: formatDate(q.issueDate),
                validUntil: formatDate(q.validUntil),
                total: <span className="font-semibold">{formatCurrency(q.total, q.currency)}</span>,
                status: <MacosBadge variant={quotationStatusVariant(q.status)}>{q.status}</MacosBadge>,
                actions: (
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleViewQuotation(q.id)} className="p-1 rounded hover:bg-secondary text-muted-foreground/50 hover:text-foreground transition-colors" title="View/Print"><Eye className="size-3.5" /></button>
                    <button onClick={() => handleViewQuotation(q.id)} className="p-1 rounded hover:bg-secondary text-muted-foreground/50 hover:text-foreground transition-colors" title="Print"><Printer className="size-3.5" /></button>
                    {!isViewOnly && q.status !== 'converted' && (
                      <button onClick={async () => {
                        if (!confirm('Convert this quotation to an invoice?')) return
                        try {
                          const invData = {
                            clientId: q.clientId,
                            issueDate: new Date().toISOString().split('T')[0],
                            dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
                            items: q.items.map(i => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice, discount: i.discount, total: i.total })),
                            discountAmount: q.discountAmount,
                            taxRate: q.taxRate,
                            notes: q.notes,
                            terms: q.terms,
                            currency: q.currency,
                            status: 'draft',
                          }
                          const res = await fetch(`/api/owner?type=invoices`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(invData) })
                          if (res.ok) {
                            const json = await res.json()
                            if (json.data) {
                              await fetch(`/api/owner?type=quotations`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: q.id, status: 'converted', convertedInvoiceId: json.data.id }) })
                            }
                            fetchQuotations()
                            fetchInvoices()
                            fetchStats()
                            alert('Quotation converted to invoice!')
                          }
                        } catch (err) { console.error(err) }
                      }} className="p-1 rounded hover:bg-macos-purple/10 text-muted-foreground/50 hover:text-macos-purple transition-colors" title="Convert to Invoice"><ArrowRightLeft className="size-3.5" /></button>
                    )}
                    {!isViewOnly && (
                      <button onClick={() => handleDeleteQuotation(q.id)} className="p-1 rounded hover:bg-macos-red/10 text-muted-foreground/50 hover:text-macos-red transition-colors"><Trash2 className="size-3.5" /></button>
                    )}
                  </div>
                ),
              }))}
            />
          )}

          {/* New Quotation Dialog */}
          <MacosDialog
            open={showQuotationDialog}
            onOpenChange={setShowQuotationDialog}
            title="Create New Quotation"
            className="max-w-3xl"
            footer={
              <>
                <MacosButton variant="secondary" onClick={() => setShowQuotationDialog(false)} disabled={saving}>Cancel</MacosButton>
                <MacosButton variant="primary" onClick={handleSaveQuotation} disabled={saving}>{saving ? 'Creating...' : 'Create Quotation'}</MacosButton>
              </>
            }
          >
            <ScrollArea className="max-h-[70vh] pr-2">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <MacosFormField label="Client *">
                    <Select value={(quotationForm.clientId as string) || ''} onValueChange={(v) => setQuotationForm({ ...quotationForm, clientId: v })}>
                      <SelectTrigger className="h-8 text-[12px]"><SelectValue placeholder="Select client" /></SelectTrigger>
                      <SelectContent>
                        {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </MacosFormField>
                  <div />
                  <MacosFormField label="Issue Date *">
                    <Input type="date" value={(quotationForm.issueDate as string) || ''} onChange={(e) => setQuotationForm({ ...quotationForm, issueDate: e.target.value })} className="h-8 text-[12px]" />
                  </MacosFormField>
                  <MacosFormField label="Valid Until *">
                    <Input type="date" value={(quotationForm.validUntil as string) || ''} onChange={(e) => setQuotationForm({ ...quotationForm, validUntil: e.target.value })} className="h-8 text-[12px]" />
                  </MacosFormField>
                  <MacosFormField label="Currency">
                    <Select value={(quotationForm.currency as string) || 'USD'} onValueChange={(v) => setQuotationForm({ ...quotationForm, currency: v })}>
                      <SelectTrigger className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="SAR">SAR</SelectItem>
                        <SelectItem value="AED">AED</SelectItem>
                      </SelectContent>
                    </Select>
                  </MacosFormField>
                  <MacosFormField label="Discount Amount">
                    <Input type="number" value={(quotationForm.discountAmount as number) || 0} onChange={(e) => setQuotationForm({ ...quotationForm, discountAmount: Number(e.target.value) })} className="h-8 text-[12px]" min={0} step={0.01} />
                  </MacosFormField>
                  <MacosFormField label="Tax Rate (%)">
                    <Input type="number" value={(quotationForm.taxRate as number) || 0} onChange={(e) => setQuotationForm({ ...quotationForm, taxRate: Number(e.target.value) })} className="h-8 text-[12px]" min={0} max={100} step={0.1} />
                  </MacosFormField>
                </div>

                <Separator />

                {/* Line Items */}
                <LineItemsEditor
                  items={(quotationForm.items as QuotationItem[]) || []}
                  onChange={(items) => setQuotationForm({ ...quotationForm, items })}
                />

                {/* Auto-calc Summary */}
                {((quotationForm.items as QuotationItem[]) || []).length > 0 && (
                  <div className="bg-secondary/30 rounded-lg p-4 space-y-1">
                    <div className="flex justify-between text-[12px] text-muted-foreground/60">
                      <span>Subtotal</span>
                      <span>{formatCurrency(((quotationForm.items as QuotationItem[]) || []).reduce((s, i) => s + (i.total || 0), 0), (quotationForm.currency as string) || 'USD')}</span>
                    </div>
                    {Number(quotationForm.discountAmount) > 0 && (
                      <div className="flex justify-between text-[12px] text-macos-red">
                        <span>Discount</span>
                        <span>-{formatCurrency(Number(quotationForm.discountAmount) || 0, (quotationForm.currency as string) || 'USD')}</span>
                      </div>
                    )}
                    {Number(quotationForm.taxRate) > 0 && (
                      <div className="flex justify-between text-[12px] text-muted-foreground/60">
                        <span>Tax ({String(quotationForm.taxRate)}%)</span>
                        <span>{formatCurrency((((quotationForm.items as QuotationItem[]) || []).reduce((s, i) => s + (i.total || 0), 0) - (Number(quotationForm.discountAmount) || 0)) * (Number(quotationForm.taxRate) || 0) / 100, (quotationForm.currency as string) || 'USD')}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-[14px] font-bold text-foreground">
                      <span>Grand Total</span>
                      <span>{formatCurrency(
                        ((quotationForm.items as QuotationItem[]) || []).reduce((s, i) => s + (i.total || 0), 0)
                        - (Number(quotationForm.discountAmount) || 0)
                        + (((quotationForm.items as QuotationItem[]) || []).reduce((s, i) => s + (i.total || 0), 0) - (Number(quotationForm.discountAmount) || 0)) * (Number(quotationForm.taxRate) || 0) / 100,
                        (quotationForm.currency as string) || 'USD'
                      )}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <MacosFormField label="Notes">
                    <Textarea value={(quotationForm.notes as string) || ''} onChange={(e) => setQuotationForm({ ...quotationForm, notes: e.target.value })} className="text-[12px] min-h-[60px]" placeholder="Quotation notes..." />
                  </MacosFormField>
                  <MacosFormField label="Terms & Conditions">
                    <Textarea value={(quotationForm.terms as string) || ''} onChange={(e) => setQuotationForm({ ...quotationForm, terms: e.target.value })} className="text-[12px] min-h-[60px]" placeholder="Terms and conditions..." />
                  </MacosFormField>
                </div>
              </div>
            </ScrollArea>
          </MacosDialog>

          {/* Quotation Print Dialog */}
          <MacosDialog
            open={showQuotationPrint}
            onOpenChange={(open) => { setShowQuotationPrint(open); if (!open) setViewQuotation(null) }}
            title=""
            className="max-w-4xl max-h-[90vh]"
          >
            <ScrollArea className="max-h-[80vh]">
              {viewQuotation && <QuotationPrintLayout quotation={viewQuotation} onClose={() => { setShowQuotationPrint(false); setViewQuotation(null) }} onConvert={handleConvertQuotationToInvoice} />}
            </ScrollArea>
          </MacosDialog>
        </div>
      )}

      {/* ==================== SERIAL KEYS TAB ==================== */}
      {activeTab === 'serial-keys' && (
        <div className="space-y-4">
          <MacosStatGrid>
            <MacosStatCard label="Total Keys" value={stats?.totalSerialKeys ?? 0} icon={Key} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" />
            <MacosStatCard label="Active" value={stats?.activeSerialKeys ?? 0} icon={CheckCircle2} iconColor="text-macos-green" iconBg="bg-macos-green/10" />
            <MacosStatCard label="Assigned" value={assignedKeys} icon={UserCheck} iconColor="text-macos-purple" iconBg="bg-macos-purple/10" />
            <MacosStatCard label="Expired" value={expiredKeys} icon={AlertCircle} iconColor="text-macos-red" iconBg="bg-macos-red/10" />
          </MacosStatGrid>

          <div className="flex items-center gap-3">
            <MacosSearch value={search} onChange={setSearch} placeholder="Search by key or client..." className="flex-1" />
            {!isViewOnly && (
              <MacosButton variant="primary" icon={Plus} onClick={() => { setSerialKeyForm({ plan: 'professional', maxDevices: 3, maxUsers: 5 }); setShowSerialKeyDialog(true) }}>
                Generate Key
              </MacosButton>
            )}
          </div>

          {loading ? (
            <div className="macos-card macos-shadow-card p-8 text-center text-[13px] text-muted-foreground/50">Loading serial keys...</div>
          ) : serialKeys.length === 0 ? (
            <MacosEmptyState icon={Key} title="No Serial Keys" description="Generate your first serial key for license management." action={!isViewOnly ? <MacosButton variant="primary" icon={Plus} onClick={() => { setSerialKeyForm({ plan: 'professional', maxDevices: 3, maxUsers: 5 }); setShowSerialKeyDialog(true) }}>Generate Key</MacosButton> : undefined} />
          ) : (
            <MacosTableCard
              headers={[
                { key: 'key', label: 'Key' },
                { key: 'client', label: 'Client' },
                { key: 'plan', label: 'Plan' },
                { key: 'maxDevices', label: 'Max Devices' },
                { key: 'activated', label: 'Activated' },
                { key: 'expires', label: 'Expires' },
                { key: 'status', label: 'Status' },
                { key: 'actions', label: '' },
              ]}
              rows={serialKeys.map((sk) => ({
                key: <SerialKeyDisplay keyStr={sk.key} />,
                client: sk.client?.companyName || <span className="text-muted-foreground/40">Unassigned</span>,
                plan: <MacosBadge variant={sk.plan === 'enterprise' ? 'purple' : sk.plan === 'professional' ? 'info' : 'default'}>{sk.plan}</MacosBadge>,
                maxDevices: sk.maxDevices,
                activated: sk.activatedAt ? formatDate(sk.activatedAt) : '—',
                expires: sk.expiresAt ? formatDate(sk.expiresAt) : 'Never',
                status: <MacosBadge variant={sk.isActive ? 'success' : 'danger'}>{sk.isActive ? 'active' : 'inactive'}</MacosBadge>,
                actions: !isViewOnly ? (
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleDeleteKey(sk.id)} className="p-1 rounded hover:bg-macos-red/10 text-muted-foreground/50 hover:text-macos-red transition-colors"><Trash2 className="size-3.5" /></button>
                  </div>
                ) : null,
              }))}
            />
          )}

          {/* Generate Serial Key Dialog */}
          <MacosDialog
            open={showSerialKeyDialog}
            onOpenChange={setShowSerialKeyDialog}
            title="Generate Serial Key"
            description="A new key will be auto-generated in the format XXXXX-XXXXX-XXXXX-XXXXX"
            className="max-w-lg"
            footer={
              <>
                <MacosButton variant="secondary" onClick={() => setShowSerialKeyDialog(false)} disabled={saving}>Cancel</MacosButton>
                <MacosButton variant="primary" onClick={handleGenerateKey} disabled={saving}>{saving ? 'Generating...' : 'Generate Key'}</MacosButton>
              </>
            }
          >
            <div className="space-y-4">
              <MacosFormField label="Assign to Client (optional)">
                <Select value={(serialKeyForm.clientId as string) || 'none'} onValueChange={(v) => setSerialKeyForm({ ...serialKeyForm, clientId: v === 'none' ? null : v })}>
                  <SelectTrigger className="h-8 text-[12px]"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </MacosFormField>
              <MacosFormField label="Plan">
                <Select value={(serialKeyForm.plan as string) || 'professional'} onValueChange={(v) => setSerialKeyForm({ ...serialKeyForm, plan: v })}>
                  <SelectTrigger className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </MacosFormField>
              <div className="grid grid-cols-2 gap-4">
                <MacosFormField label="Max Devices">
                  <Input type="number" value={(serialKeyForm.maxDevices as number) || 3} onChange={(e) => setSerialKeyForm({ ...serialKeyForm, maxDevices: Number(e.target.value) })} className="h-8 text-[12px]" min={1} />
                </MacosFormField>
                <MacosFormField label="Max Users">
                  <Input type="number" value={(serialKeyForm.maxUsers as number) || 5} onChange={(e) => setSerialKeyForm({ ...serialKeyForm, maxUsers: Number(e.target.value) })} className="h-8 text-[12px]" min={1} />
                </MacosFormField>
              </div>
              <MacosFormField label="Expires At">
                <Input type="date" value={(serialKeyForm.expiresAt as string) || ''} onChange={(e) => setSerialKeyForm({ ...serialKeyForm, expiresAt: e.target.value || null })} className="h-8 text-[12px]" />
              </MacosFormField>
              <MacosFormField label="Notes">
                <Textarea value={(serialKeyForm.notes as string) || ''} onChange={(e) => setSerialKeyForm({ ...serialKeyForm, notes: e.target.value })} className="text-[12px] min-h-[50px]" placeholder="Optional notes..." />
              </MacosFormField>
            </div>
          </MacosDialog>
        </div>
      )}

      {/* ==================== DEVICES TAB ==================== */}
      {activeTab === 'devices' && (
        <div className="space-y-4">
          <MacosStatGrid>
            <MacosStatCard label="Total Devices" value={stats?.totalDevices ?? 0} icon={Monitor} iconColor="text-macos-blue" iconBg="bg-macos-blue/10" />
            <MacosStatCard label="Active" value={stats?.activeDevices ?? 0} icon={CheckCircle2} iconColor="text-macos-green" iconBg="bg-macos-green/10" />
            <MacosStatCard label="Inactive" value={inactiveDevices} icon={AlertCircle} iconColor="text-macos-red" iconBg="bg-macos-red/10" />
            <MacosStatCard label="Unique Clients" value={new Set(devices.map(d => d.clientId)).size} icon={Building2} iconColor="text-macos-purple" iconBg="bg-macos-purple/10" />
          </MacosStatGrid>

          <div className="flex items-center gap-3">
            <MacosSearch value={search} onChange={setSearch} placeholder="Search by device name, client..." className="flex-1" />
            {!isViewOnly && (
              <MacosButton variant="primary" icon={Plus} onClick={() => { setDeviceForm({}); setShowDeviceDialog(true) }}>
                Add Device
              </MacosButton>
            )}
          </div>

          {loading ? (
            <div className="macos-card macos-shadow-card p-8 text-center text-[13px] text-muted-foreground/50">Loading devices...</div>
          ) : devices.length === 0 ? (
            <MacosEmptyState icon={Monitor} title="No Devices" description="Register your first device for a client." action={!isViewOnly ? <MacosButton variant="primary" icon={Plus} onClick={() => { setDeviceForm({}); setShowDeviceDialog(true) }}>Add Device</MacosButton> : undefined} />
          ) : (
            <MacosTableCard
              headers={[
                { key: 'name', label: 'Device Name' },
                { key: 'type', label: 'Type' },
                { key: 'os', label: 'OS' },
                { key: 'client', label: 'Client' },
                { key: 'ip', label: 'IP Address' },
                { key: 'lastActive', label: 'Last Active' },
                { key: 'status', label: 'Status' },
                { key: 'actions', label: '' },
              ]}
              rows={devices.map((d) => ({
                name: <span className="font-semibold text-foreground">{d.deviceName || '—'}</span>,
                type: <MacosBadge variant="default">{d.deviceType || 'unknown'}</MacosBadge>,
                os: d.os || '—',
                client: d.client?.companyName || '—',
                ip: <span className="font-mono text-[12px] text-muted-foreground/70">{d.ipAddress || '—'}</span>,
                lastActive: d.lastActiveAt ? formatDate(d.lastActiveAt) : '—',
                status: <MacosBadge variant={d.isActive ? 'success' : 'danger'}>{d.isActive ? 'active' : 'inactive'}</MacosBadge>,
                actions: !isViewOnly ? (
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleDeleteDevice(d.id)} className="p-1 rounded hover:bg-macos-red/10 text-muted-foreground/50 hover:text-macos-red transition-colors"><Trash2 className="size-3.5" /></button>
                  </div>
                ) : null,
              }))}
            />
          )}

          {/* Add Device Dialog */}
          <MacosDialog
            open={showDeviceDialog}
            onOpenChange={setShowDeviceDialog}
            title="Add Device"
            description="Register a new device for a client"
            className="max-w-lg"
            footer={
              <>
                <MacosButton variant="secondary" onClick={() => setShowDeviceDialog(false)} disabled={saving}>Cancel</MacosButton>
                <MacosButton variant="primary" onClick={handleSaveDevice} disabled={saving}>{saving ? 'Adding...' : 'Add Device'}</MacosButton>
              </>
            }
          >
            <div className="space-y-4">
              <MacosFormField label="Client *">
                <Select value={(deviceForm.clientId as string) || ''} onValueChange={(v) => setDeviceForm({ ...deviceForm, clientId: v })}>
                  <SelectTrigger className="h-8 text-[12px]"><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>
                    {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </MacosFormField>
              <MacosFormField label="Device Name">
                <Input value={(deviceForm.deviceName as string) || ''} onChange={(e) => setDeviceForm({ ...deviceForm, deviceName: e.target.value })} className="h-8 text-[12px]" placeholder="Office Desktop" />
              </MacosFormField>
              <div className="grid grid-cols-2 gap-4">
                <MacosFormField label="Device Type">
                  <Select value={(deviceForm.deviceType as string) || ''} onValueChange={(v) => setDeviceForm({ ...deviceForm, deviceType: v })}>
                    <SelectTrigger className="h-8 text-[12px]"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desktop">Desktop</SelectItem>
                      <SelectItem value="laptop">Laptop</SelectItem>
                      <SelectItem value="tablet">Tablet</SelectItem>
                      <SelectItem value="mobile">Mobile</SelectItem>
                    </SelectContent>
                  </Select>
                </MacosFormField>
                <MacosFormField label="Operating System">
                  <Input value={(deviceForm.os as string) || ''} onChange={(e) => setDeviceForm({ ...deviceForm, os: e.target.value })} className="h-8 text-[12px]" placeholder="Windows 11" />
                </MacosFormField>
              </div>
              <MacosFormField label="Browser">
                <Input value={(deviceForm.browser as string) || ''} onChange={(e) => setDeviceForm({ ...deviceForm, browser: e.target.value })} className="h-8 text-[12px]" placeholder="Chrome 120" />
              </MacosFormField>
              <MacosFormField label="Fingerprint">
                <Input value={(deviceForm.fingerprint as string) || ''} onChange={(e) => setDeviceForm({ ...deviceForm, fingerprint: e.target.value })} className="h-8 text-[12px]" placeholder="Device fingerprint hash" />
              </MacosFormField>
              <MacosFormField label="IP Address">
                <Input value={(deviceForm.ipAddress as string) || ''} onChange={(e) => setDeviceForm({ ...deviceForm, ipAddress: e.target.value })} className="h-8 text-[12px]" placeholder="192.168.1.100" />
              </MacosFormField>
              <MacosFormField label="Serial Key (optional)">
                <Select value={(deviceForm.serialKeyId as string) || 'none'} onValueChange={(v) => setDeviceForm({ ...deviceForm, serialKeyId: v === 'none' ? null : v })}>
                  <SelectTrigger className="h-8 text-[12px]"><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {serialKeys.map(sk => <SelectItem key={sk.id} value={sk.id}>{sk.key.slice(0, 17)}...</SelectItem>)}
                  </SelectContent>
                </Select>
              </MacosFormField>
            </div>
          </MacosDialog>
        </div>
      )}
    </div>
  )
}

// ==================== SERIAL KEY DISPLAY COMPONENT ====================

function SerialKeyDisplay({ keyStr }: { keyStr: string }) {
  const [copied, setCopied] = React.useState(false)
  const masked = keyStr.slice(0, 6) + '●●●●●-●●●●●-●●●●●' + keyStr.slice(-5)

  const handleCopy = () => {
    navigator.clipboard.writeText(keyStr)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-[12px] font-semibold text-foreground/80">{masked}</span>
      <button onClick={handleCopy} className="p-0.5 rounded hover:bg-secondary transition-colors" title="Copy key">
        {copied ? <Check className="size-3 text-macos-green" /> : <Copy className="size-3 text-muted-foreground/40" />}
      </button>
    </div>
  )
}

// ==================== CN HELPER (local) ====================

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export default OwnerModule
