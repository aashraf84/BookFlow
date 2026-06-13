'use client'

import * as React from 'react'
import {
  Settings,
  Building2,
  Globe,
  DollarSign,
  Receipt,
  ShoppingCart,
  Truck,
  Users,
  Shield,
  Bell,
  Printer,
  Palette,
  Database,
  Mail,
  Phone,
  Package,
  BarChart3,
  Save,
  RotateCcw,
  Check,
  Loader2,
  Eye,
  AlertCircle,
  X,
  ChevronRight,
  Webhook,
  FileText,
  Warehouse,
  Percent,
  Hash,
  HardDrive,
  Lock,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
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
  MacosBadge,
  MacosFormField,
} from '@/components/macos-ui'

// ─── Types ────────────────────────────────────────────────────────
interface GeneralSettings {
  companyName: string
  legalName: string
  taxId: string
  registrationNo: string
  industry: string
  website: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  postalCode: string
  logo: string
  fiscalYearStart: string
  dateFormat: string
  timeFormat: string
  timezone: string
  language: string
  currency: string
  currencySymbol: string
  currencyPosition: 'before' | 'after'
  thousandSeparator: string
  decimalSeparator: string
  decimalPlaces: number
}

interface PosSettings {
  defaultPaymentMethod: string
  autoPrintReceipt: boolean
  receiptHeader: string
  receiptFooter: string
  receiptPaperSize: string
  showTaxOnReceipt: boolean
  showDiscountOnReceipt: boolean
  showCustomerOnReceipt: boolean
  enableBarcodeScanning: boolean
  barcodePrefix: string
  enableQuickKeys: boolean
  requireCustomerForSale: boolean
  allowNegativeStock: boolean
  maxCartItems: number
  autoClearCart: boolean
  enableHoldCart: boolean
  maxHeldCarts: number
  roundingMode: string
  roundingAmount: number
}

interface InventorySettings {
  lowStockThreshold: number
  criticalStockThreshold: number
  enableStockAlerts: boolean
  alertFrequency: string
  enableAutoReorder: boolean
  reorderPoint: number
  reorderQuantity: number
  defaultSupplier: string
  trackSerialNumbers: boolean
  trackBatchNumbers: boolean
  enableExpiryTracking: boolean
  expiryAlertDays: number
  enableWarehouseManagement: boolean
  requireStockCount: boolean
  stockCountFrequency: string
  allowNegativeStock: boolean
  costMethod: string
  enableMultiWarehouse: boolean
}

interface TaxSettings {
  enableTax: boolean
  defaultTaxRate: number
  taxInclusivePricing: boolean
  enableMultiTax: boolean
  taxRegistrationNumber: string
  taxFrequency: string
  enableTaxExempt: boolean
  taxCalculationMethod: string
  enableWithholdingTax: boolean
  withholdingTaxRate: number
}

interface SalesSettings {
  enableWholesale: boolean
  wholesaleMinOrder: number
  enableSchoolSupply: boolean
  enableOnlineOrders: boolean
  orderPrefix: string
  invoicePrefix: string
  invoiceAutoNumber: boolean
  invoiceStartNumber: number
  quotationPrefix: string
  enableQuotations: boolean
  quotationValidityDays: number
  enableReturns: boolean
  returnWindowDays: number
  requireReturnReason: boolean
  enablePriceOverride: boolean
  maxDiscountPercent: number
  requireDiscountApproval: boolean
  enableLoyaltyProgram: boolean
  loyaltyPointValue: number
  loyaltyEarningRate: number
  minRedeemPoints: number
}

interface EmailSettings {
  enableEmailNotifications: boolean
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPassword: string
  smtpEncryption: string
  senderName: string
  senderEmail: string
  enableSaleConfirmation: boolean
  enableLowStockAlert: boolean
  enableDailyReport: boolean
  enableWeeklyReport: boolean
  enableMonthlyReport: boolean
}

interface NotificationSettings {
  enableNotifications: boolean
  enableSoundAlerts: boolean
  lowStockAlert: boolean
  newOrderAlert: boolean
  paymentReceivedAlert: boolean
  employeeClockInAlert: boolean
  dailySummaryAlert: boolean
  systemUpdateAlert: boolean
}

interface SecuritySettings {
  enableTwoFactor: boolean
  sessionTimeout: number
  maxLoginAttempts: number
  passwordMinLength: number
  requireSpecialChars: boolean
  requireNumbers: boolean
  requireUppercase: boolean
  passwordExpiryDays: number
  enableAuditLog: boolean
  auditLogRetention: number
  enableIpWhitelist: boolean
  ipWhitelist: string
}

interface PrintingSettings {
  defaultPrinter: string
  receiptPrinter: string
  labelPrinter: string
  receiptWidth: string
  labelSize: string
  enableAutoPrint: boolean
  printCopies: number
  enableBarcodeLabels: boolean
  barcodeFormat: string
  labelFields: string[]
}

interface AppearanceSettings {
  theme: string
  accentColor: string
  sidebarPosition: string
  compactMode: boolean
  fontSize: string
  showAnimations: boolean
  dashboardLayout: string
}

interface BackupSettings {
  enableAutoBackup: boolean
  backupFrequency: string
  backupRetention: number
  backupLocation: string
  lastBackupDate: string
  enableCloudBackup: boolean
  cloudProvider: string
}

interface IntegrationSettings {
  enableApi: boolean
  apiKey: string
  enableWebhooks: boolean
  webhookUrl: string
  enableAccountingSync: boolean
  accountingProvider: string
  enableEcommerceSync: boolean
  ecommercePlatform: string
  enablePaymentGateway: boolean
  paymentProvider: string
}

// ─── Default Settings ─────────────────────────────────────────────
const defaultGeneral: GeneralSettings = {
  companyName: 'BookFlow Store',
  legalName: '',
  taxId: '',
  registrationNo: '',
  industry: 'bookstore',
  website: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  country: 'US',
  postalCode: '',
  logo: '',
  fiscalYearStart: '01-01',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  timezone: 'America/New_York',
  language: 'en',
  currency: 'USD',
  currencySymbol: '$',
  currencyPosition: 'before',
  thousandSeparator: ',',
  decimalSeparator: '.',
  decimalPlaces: 2,
}

const defaultPos: PosSettings = {
  defaultPaymentMethod: 'cash',
  autoPrintReceipt: true,
  receiptHeader: 'BookFlow OS',
  receiptFooter: 'Thank you for your purchase!',
  receiptPaperSize: '80mm',
  showTaxOnReceipt: true,
  showDiscountOnReceipt: true,
  showCustomerOnReceipt: false,
  enableBarcodeScanning: true,
  barcodePrefix: 'BF',
  enableQuickKeys: true,
  requireCustomerForSale: false,
  allowNegativeStock: false,
  maxCartItems: 99,
  autoClearCart: true,
  enableHoldCart: true,
  maxHeldCarts: 5,
  roundingMode: 'none',
  roundingAmount: 0.05,
}

const defaultInventory: InventorySettings = {
  lowStockThreshold: 10,
  criticalStockThreshold: 3,
  enableStockAlerts: true,
  alertFrequency: 'daily',
  enableAutoReorder: false,
  reorderPoint: 5,
  reorderQuantity: 20,
  defaultSupplier: '',
  trackSerialNumbers: false,
  trackBatchNumbers: false,
  enableExpiryTracking: false,
  expiryAlertDays: 30,
  enableWarehouseManagement: true,
  requireStockCount: false,
  stockCountFrequency: 'monthly',
  allowNegativeStock: false,
  costMethod: 'weighted_average',
  enableMultiWarehouse: false,
}

const defaultTax: TaxSettings = {
  enableTax: true,
  defaultTaxRate: 10,
  taxInclusivePricing: false,
  enableMultiTax: false,
  taxRegistrationNumber: '',
  taxFrequency: 'monthly',
  enableTaxExempt: true,
  taxCalculationMethod: 'exclusive',
  enableWithholdingTax: false,
  withholdingTaxRate: 0,
}

const defaultSales: SalesSettings = {
  enableWholesale: true,
  wholesaleMinOrder: 10,
  enableSchoolSupply: true,
  enableOnlineOrders: false,
  orderPrefix: 'ORD',
  invoicePrefix: 'INV',
  invoiceAutoNumber: true,
  invoiceStartNumber: 1001,
  quotationPrefix: 'QUO',
  enableQuotations: true,
  quotationValidityDays: 30,
  enableReturns: true,
  returnWindowDays: 14,
  requireReturnReason: true,
  enablePriceOverride: false,
  maxDiscountPercent: 20,
  requireDiscountApproval: true,
  enableLoyaltyProgram: true,
  loyaltyPointValue: 0.01,
  loyaltyEarningRate: 1,
  minRedeemPoints: 100,
}

const defaultEmail: EmailSettings = {
  enableEmailNotifications: false,
  smtpHost: '',
  smtpPort: 587,
  smtpUser: '',
  smtpPassword: '',
  smtpEncryption: 'tls',
  senderName: 'BookFlow OS',
  senderEmail: '',
  enableSaleConfirmation: true,
  enableLowStockAlert: true,
  enableDailyReport: false,
  enableWeeklyReport: true,
  enableMonthlyReport: true,
}

const defaultNotification: NotificationSettings = {
  enableNotifications: true,
  enableSoundAlerts: true,
  lowStockAlert: true,
  newOrderAlert: true,
  paymentReceivedAlert: true,
  employeeClockInAlert: false,
  dailySummaryAlert: true,
  systemUpdateAlert: true,
}

const defaultSecurity: SecuritySettings = {
  enableTwoFactor: false,
  sessionTimeout: 30,
  maxLoginAttempts: 5,
  passwordMinLength: 8,
  requireSpecialChars: true,
  requireNumbers: true,
  requireUppercase: true,
  passwordExpiryDays: 90,
  enableAuditLog: true,
  auditLogRetention: 365,
  enableIpWhitelist: false,
  ipWhitelist: '',
}

const defaultPrinting: PrintingSettings = {
  defaultPrinter: 'system',
  receiptPrinter: 'thermal',
  labelPrinter: 'label',
  receiptWidth: '80mm',
  labelSize: '40x20',
  enableAutoPrint: false,
  printCopies: 1,
  enableBarcodeLabels: true,
  barcodeFormat: 'CODE128',
  labelFields: ['name', 'price', 'barcode'],
}

const defaultAppearance: AppearanceSettings = {
  theme: 'system',
  accentColor: 'default',
  sidebarPosition: 'left',
  compactMode: false,
  fontSize: 'default',
  showAnimations: true,
  dashboardLayout: 'grid',
}

const defaultBackup: BackupSettings = {
  enableAutoBackup: true,
  backupFrequency: 'daily',
  backupRetention: 30,
  backupLocation: '/backups',
  lastBackupDate: '',
  enableCloudBackup: false,
  cloudProvider: 'none',
}

const defaultIntegration: IntegrationSettings = {
  enableApi: false,
  apiKey: '',
  enableWebhooks: false,
  webhookUrl: '',
  enableAccountingSync: false,
  accountingProvider: 'none',
  enableEcommerceSync: false,
  ecommercePlatform: 'none',
  enablePaymentGateway: false,
  paymentProvider: 'none',
}

// ─── Section Config ───────────────────────────────────────────────
const settingsSections = [
  { id: 'general', label: 'General', icon: Building2, desc: 'Company info, regional & localization' },
  { id: 'pos', label: 'POS & Retail', icon: ShoppingCart, desc: 'Point of sale configuration' },
  { id: 'inventory', label: 'Inventory', icon: Warehouse, desc: 'Stock management & warehousing' },
  { id: 'tax', label: 'Tax & Compliance', icon: Receipt, desc: 'Tax rates, calculation & filing' },
  { id: 'sales', label: 'Sales & Orders', icon: Truck, desc: 'Wholesale, invoices, returns & loyalty' },
  { id: 'email', label: 'Email & SMTP', icon: Mail, desc: 'Email server & notification templates' },
  { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Alert preferences & sounds' },
  { id: 'security', label: 'Security', icon: Shield, desc: 'Authentication, passwords & audit logs' },
  { id: 'printing', label: 'Printing', icon: Printer, desc: 'Receipts, labels & printer setup' },
  { id: 'appearance', label: 'Appearance', icon: Palette, desc: 'Theme, layout & display options' },
  { id: 'backup', label: 'Backup & Data', icon: Database, desc: 'Auto-backup & data retention' },
  { id: 'integrations', label: 'Integrations', icon: Webhook, desc: 'API, webhooks & third-party sync' },
]

// ─── Component ────────────────────────────────────────────────────
export function SettingsModule() {
  const { authUser } = useAppStore()
  const isViewOnly = authUser?.isViewOnly ?? false

  const [activeSection, setActiveSection] = React.useState('general')
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [hasChanges, setHasChanges] = React.useState(false)

  // Settings state
  const [general, setGeneral] = React.useState<GeneralSettings>(defaultGeneral)
  const [pos, setPos] = React.useState<PosSettings>(defaultPos)
  const [inventory, setInventory] = React.useState<InventorySettings>(defaultInventory)
  const [tax, setTax] = React.useState<TaxSettings>(defaultTax)
  const [sales, setSales] = React.useState<SalesSettings>(defaultSales)
  const [email, setEmail] = React.useState<EmailSettings>(defaultEmail)
  const [notifications, setNotifications] = React.useState<NotificationSettings>(defaultNotification)
  const [security, setSecurity] = React.useState<SecuritySettings>(defaultSecurity)
  const [printing, setPrinting] = React.useState<PrintingSettings>(defaultPrinting)
  const [appearance, setAppearance] = React.useState<AppearanceSettings>(defaultAppearance)
  const [backup, setBackup] = React.useState<BackupSettings>(defaultBackup)
  const [integrations, setIntegrations] = React.useState<IntegrationSettings>(defaultIntegration)

  // Load settings from API
  React.useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.settings) {
            const s = data.settings
            if (s.general) setGeneral({ ...defaultGeneral, ...s.general })
            if (s.pos) setPos({ ...defaultPos, ...s.pos })
            if (s.inventory) setInventory({ ...defaultInventory, ...s.inventory })
            if (s.tax) setTax({ ...defaultTax, ...s.tax })
            if (s.sales) setSales({ ...defaultSales, ...s.sales })
            if (s.email) setEmail({ ...defaultEmail, ...s.email })
            if (s.notifications) setNotifications({ ...defaultNotification, ...s.notifications })
            if (s.security) setSecurity({ ...defaultSecurity, ...s.security })
            if (s.printing) setPrinting({ ...defaultPrinting, ...s.printing })
            if (s.appearance) setAppearance({ ...defaultAppearance, ...s.appearance })
            if (s.backup) setBackup({ ...defaultBackup, ...s.backup })
            if (s.integrations) setIntegrations({ ...defaultIntegration, ...s.integrations })
          }
        }
      } catch {
        // Settings will use defaults
      }
    }
    loadSettings()
  }, [])

  // Mark changes
  const markChanged = React.useCallback(() => {
    if (!hasChanges) setHasChanges(true)
    setSaved(false)
  }, [hasChanges])

  // Save all settings
  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          general, pos, inventory, tax, sales, email,
          notifications, security, printing, appearance, backup, integrations,
        }),
      })
      if (!res.ok) throw new Error('Failed to save settings')
      setSaved(true)
      setHasChanges(false)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  // Reset current section
  const handleResetSection = () => {
    switch (activeSection) {
      case 'general': setGeneral(defaultGeneral); break
      case 'pos': setPos(defaultPos); break
      case 'inventory': setInventory(defaultInventory); break
      case 'tax': setTax(defaultTax); break
      case 'sales': setSales(defaultSales); break
      case 'email': setEmail(defaultEmail); break
      case 'notifications': setNotifications(defaultNotification); break
      case 'security': setSecurity(defaultSecurity); break
      case 'printing': setPrinting(defaultPrinting); break
      case 'appearance': setAppearance(defaultAppearance); break
      case 'backup': setBackup(defaultBackup); break
      case 'integrations': setIntegrations(defaultIntegration); break
    }
    markChanged()
  }

  const currentSectionInfo = settingsSections.find(s => s.id === activeSection)!
  const CurrentIcon = currentSectionInfo.icon

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <MacosPageHeader
        title="Settings"
        subtitle="Configure your ERP system — manage company, POS, inventory, tax, security, and integrations"
        icon={Settings}
        iconColor="text-gg-bridge"
        iconBg="bg-gg-bridge/10"
      >
        {isViewOnly && (
          <MacosBadge variant="warning" className="flex items-center gap-1.5">
            <Eye className="size-3" />
            View Only
          </MacosBadge>
        )}
        <div className="flex items-center gap-2">
          {hasChanges && (
            <MacosBadge variant="warning">Unsaved changes</MacosBadge>
          )}
          {saved && (
            <MacosBadge variant="success" className="flex items-center gap-1">
              <Check className="size-3" />
              Saved
            </MacosBadge>
          )}
        </div>
      </MacosPageHeader>

      {/* Error Alert */}
      {error && (
        <div className="macos-card macos-shadow-card flex items-center gap-2.5 p-3 border-macos-red/20 bg-macos-red/5 flex-shrink-0">
          <div className="size-6 rounded-md bg-macos-red/10 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="size-3.5 text-macos-red" />
          </div>
          <span className="text-[13px] font-medium text-macos-red flex-1">{error}</span>
          <button className="size-6 rounded-md hover:bg-macos-red/10 flex items-center justify-center" onClick={() => setError(null)}>
            <X className="size-3.5 text-macos-red" />
          </button>
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="macos-card macos-shadow-card p-2 sticky top-4">
            <nav className="space-y-0.5">
              {settingsSections.map((section) => {
                const Icon = section.icon
                const isActive = activeSection === section.id
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all ${
                      isActive
                        ? 'bg-primary/10 text-primary shadow-[0_0.5px_1px_rgba(0,0,0,0.04)]'
                        : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                    }`}
                  >
                    <div className={`size-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isActive ? 'bg-primary/15' : 'bg-secondary/60'
                    }`}>
                      <Icon className={`size-3.5 ${isActive ? 'text-primary' : ''}`} strokeWidth={isActive ? 2 : 1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[12px] font-semibold tracking-tight truncate ${isActive ? 'text-primary' : ''}`}>{section.label}</p>
                    </div>
                    {isActive && (
                      <ChevronRight className="size-3 text-primary/50 flex-shrink-0" />
                    )}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Section Header */}
          <div className="macos-card macos-shadow-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <CurrentIcon className="size-4 text-primary" strokeWidth={1.8} />
              </div>
              <div>
                <h2 className="text-[15px] font-bold tracking-tight">{currentSectionInfo.label}</h2>
                <p className="text-[11px] text-muted-foreground font-medium">{currentSectionInfo.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-lg text-[12px] font-medium text-muted-foreground hover:text-foreground"
                onClick={handleResetSection}
                disabled={isViewOnly}
              >
                <RotateCcw className="size-3.5 mr-1.5" />
                Reset to Default
              </Button>
              <Button
                size="sm"
                className="h-8 rounded-lg bg-primary text-primary-foreground text-[12px] font-semibold px-4"
                onClick={handleSave}
                disabled={saving || isViewOnly}
              >
                {saving ? (
                  <><Loader2 className="size-3.5 mr-1.5 animate-spin" />Saving…</>
                ) : (
                  <><Save className="size-3.5 mr-1.5" />Save All</>
                )}
              </Button>
            </div>
          </div>

          {/* ─── General Settings ─── */}
          {activeSection === 'general' && (
            <div className="space-y-4">
              {/* Company Information */}
              <div className="macos-card macos-shadow-card p-5 space-y-4">
                <h3 className="macos-section-title flex items-center gap-2">
                  <Building2 className="size-4 text-gg-bridge" />
                  Company Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MacosFormField label="Company Name">
                    <Input value={general.companyName} onChange={e => { setGeneral(g => ({ ...g, companyName: e.target.value })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                  </MacosFormField>
                  <MacosFormField label="Legal Name">
                    <Input value={general.legalName} onChange={e => { setGeneral(g => ({ ...g, legalName: e.target.value })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                  </MacosFormField>
                  <MacosFormField label="Tax ID / Registration No.">
                    <Input value={general.taxId} onChange={e => { setGeneral(g => ({ ...g, taxId: e.target.value })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                  </MacosFormField>
                  <MacosFormField label="Registration Number">
                    <Input value={general.registrationNo} onChange={e => { setGeneral(g => ({ ...g, registrationNo: e.target.value })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                  </MacosFormField>
                  <MacosFormField label="Industry">
                    <Select value={general.industry} onValueChange={v => { setGeneral(g => ({ ...g, industry: v })); markChanged() }} disabled={isViewOnly}>
                      <SelectTrigger className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bookstore">Bookstore</SelectItem>
                        <SelectItem value="publishing">Publishing</SelectItem>
                        <SelectItem value="stationery">Stationery</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="wholesale">Wholesale</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </MacosFormField>
                  <MacosFormField label="Website">
                    <Input value={general.website} onChange={e => { setGeneral(g => ({ ...g, website: e.target.value })); markChanged() }} disabled={isViewOnly} placeholder="https://" className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                  </MacosFormField>
                </div>
              </div>

              {/* Contact Information */}
              <div className="macos-card macos-shadow-card p-5 space-y-4">
                <h3 className="macos-section-title flex items-center gap-2">
                  <Phone className="size-4 text-gg-sunset" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MacosFormField label="Email">
                    <Input type="email" value={general.email} onChange={e => { setGeneral(g => ({ ...g, email: e.target.value })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                  </MacosFormField>
                  <MacosFormField label="Phone">
                    <Input value={general.phone} onChange={e => { setGeneral(g => ({ ...g, phone: e.target.value })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                  </MacosFormField>
                  <MacosFormField label="Address" className="md:col-span-2">
                    <Textarea value={general.address} onChange={e => { setGeneral(g => ({ ...g, address: e.target.value })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] min-h-[60px]" />
                  </MacosFormField>
                  <MacosFormField label="City">
                    <Input value={general.city} onChange={e => { setGeneral(g => ({ ...g, city: e.target.value })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                  </MacosFormField>
                  <MacosFormField label="State / Province">
                    <Input value={general.state} onChange={e => { setGeneral(g => ({ ...g, state: e.target.value })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                  </MacosFormField>
                  <MacosFormField label="Country">
                    <Select value={general.country} onValueChange={v => { setGeneral(g => ({ ...g, country: v })); markChanged() }} disabled={isViewOnly}>
                      <SelectTrigger className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="GB">United Kingdom</SelectItem>
                        <SelectItem value="PK">Pakistan</SelectItem>
                        <SelectItem value="IN">India</SelectItem>
                        <SelectItem value="AE">UAE</SelectItem>
                        <SelectItem value="SA">Saudi Arabia</SelectItem>
                        <SelectItem value="MY">Malaysia</SelectItem>
                        <SelectItem value="SG">Singapore</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="DE">Germany</SelectItem>
                        <SelectItem value="FR">France</SelectItem>
                      </SelectContent>
                    </Select>
                  </MacosFormField>
                  <MacosFormField label="Postal Code">
                    <Input value={general.postalCode} onChange={e => { setGeneral(g => ({ ...g, postalCode: e.target.value })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                  </MacosFormField>
                </div>
              </div>

              {/* Localization */}
              <div className="macos-card macos-shadow-card p-5 space-y-4">
                <h3 className="macos-section-title flex items-center gap-2">
                  <Globe className="size-4 text-macos-blue" />
                  Localization & Regional
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MacosFormField label="Language">
                    <Select value={general.language} onValueChange={v => { setGeneral(g => ({ ...g, language: v })); markChanged() }} disabled={isViewOnly}>
                      <SelectTrigger className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ur">Urdu</SelectItem>
                        <SelectItem value="ar">Arabic</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="ms">Malay</SelectItem>
                      </SelectContent>
                    </Select>
                  </MacosFormField>
                  <MacosFormField label="Timezone">
                    <Select value={general.timezone} onValueChange={v => { setGeneral(g => ({ ...g, timezone: v })); markChanged() }} disabled={isViewOnly}>
                      <SelectTrigger className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern (UTC-5)</SelectItem>
                        <SelectItem value="America/Chicago">Central (UTC-6)</SelectItem>
                        <SelectItem value="America/Denver">Mountain (UTC-7)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific (UTC-8)</SelectItem>
                        <SelectItem value="Asia/Karachi">Pakistan (UTC+5)</SelectItem>
                        <SelectItem value="Asia/Kolkata">India (UTC+5:30)</SelectItem>
                        <SelectItem value="Asia/Dubai">Dubai (UTC+4)</SelectItem>
                        <SelectItem value="Asia/Singapore">Singapore (UTC+8)</SelectItem>
                        <SelectItem value="Europe/London">London (UTC+0)</SelectItem>
                        <SelectItem value="Europe/Berlin">Berlin (UTC+1)</SelectItem>
                      </SelectContent>
                    </Select>
                  </MacosFormField>
                  <MacosFormField label="Date Format">
                    <Select value={general.dateFormat} onValueChange={v => { setGeneral(g => ({ ...g, dateFormat: v })); markChanged() }} disabled={isViewOnly}>
                      <SelectTrigger className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                      </SelectContent>
                    </Select>
                  </MacosFormField>
                  <MacosFormField label="Time Format">
                    <Select value={general.timeFormat} onValueChange={v => { setGeneral(g => ({ ...g, timeFormat: v })); markChanged() }} disabled={isViewOnly}>
                      <SelectTrigger className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12 Hour</SelectItem>
                        <SelectItem value="24h">24 Hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </MacosFormField>
                  <MacosFormField label="Fiscal Year Start">
                    <Input value={general.fiscalYearStart} onChange={e => { setGeneral(g => ({ ...g, fiscalYearStart: e.target.value })); markChanged() }} disabled={isViewOnly} placeholder="MM-DD" className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                  </MacosFormField>
                </div>
              </div>

              {/* Currency */}
              <div className="macos-card macos-shadow-card p-5 space-y-4">
                <h3 className="macos-section-title flex items-center gap-2">
                  <DollarSign className="size-4 text-macos-green" />
                  Currency Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MacosFormField label="Currency">
                    <Select value={general.currency} onValueChange={v => { setGeneral(g => ({ ...g, currency: v })); markChanged() }} disabled={isViewOnly}>
                      <SelectTrigger className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD — US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR — Euro</SelectItem>
                        <SelectItem value="GBP">GBP — British Pound</SelectItem>
                        <SelectItem value="PKR">PKR — Pakistani Rupee</SelectItem>
                        <SelectItem value="INR">INR — Indian Rupee</SelectItem>
                        <SelectItem value="AED">AED — UAE Dirham</SelectItem>
                        <SelectItem value="SAR">SAR — Saudi Riyal</SelectItem>
                        <SelectItem value="MYR">MYR — Malaysian Ringgit</SelectItem>
                        <SelectItem value="SGD">SGD — Singapore Dollar</SelectItem>
                        <SelectItem value="AUD">AUD — Australian Dollar</SelectItem>
                        <SelectItem value="CAD">CAD — Canadian Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </MacosFormField>
                  <MacosFormField label="Currency Symbol">
                    <Input value={general.currencySymbol} onChange={e => { setGeneral(g => ({ ...g, currencySymbol: e.target.value })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9 w-20" />
                  </MacosFormField>
                  <MacosFormField label="Symbol Position">
                    <Select value={general.currencyPosition} onValueChange={v => { setGeneral(g => ({ ...g, currencyPosition: v as 'before' | 'after' })); markChanged() }} disabled={isViewOnly}>
                      <SelectTrigger className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="before">Before amount ($100)</SelectItem>
                        <SelectItem value="after">After amount (100$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </MacosFormField>
                  <MacosFormField label="Decimal Places">
                    <Select value={String(general.decimalPlaces)} onValueChange={v => { setGeneral(g => ({ ...g, decimalPlaces: parseInt(v) })); markChanged() }} disabled={isViewOnly}>
                      <SelectTrigger className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                      </SelectContent>
                    </Select>
                  </MacosFormField>
                  <MacosFormField label="Thousand Separator">
                    <Input value={general.thousandSeparator} onChange={e => { setGeneral(g => ({ ...g, thousandSeparator: e.target.value })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9 w-20" />
                  </MacosFormField>
                  <MacosFormField label="Decimal Separator">
                    <Input value={general.decimalSeparator} onChange={e => { setGeneral(g => ({ ...g, decimalSeparator: e.target.value })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9 w-20" />
                  </MacosFormField>
                </div>
              </div>
            </div>
          )}

          {/* ─── POS Settings ─── */}
          {activeSection === 'pos' && (
            <div className="space-y-4">
              {/* Receipt Configuration */}
              <div className="macos-card macos-shadow-card p-5 space-y-4">
                <h3 className="macos-section-title flex items-center gap-2">
                  <Receipt className="size-4 text-gg-bridge" />
                  Receipt Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MacosFormField label="Receipt Header">
                    <Input value={pos.receiptHeader} onChange={e => { setPos(p => ({ ...p, receiptHeader: e.target.value })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                  </MacosFormField>
                  <MacosFormField label="Receipt Footer">
                    <Input value={pos.receiptFooter} onChange={e => { setPos(p => ({ ...p, receiptFooter: e.target.value })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                  </MacosFormField>
                  <MacosFormField label="Paper Size">
                    <Select value={pos.receiptPaperSize} onValueChange={v => { setPos(p => ({ ...p, receiptPaperSize: v })); markChanged() }} disabled={isViewOnly}>
                      <SelectTrigger className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="58mm">58mm (Small)</SelectItem>
                        <SelectItem value="80mm">80mm (Standard)</SelectItem>
                        <SelectItem value="A4">A4 (Full Page)</SelectItem>
                      </SelectContent>
                    </Select>
                  </MacosFormField>
                  <MacosFormField label="Default Payment Method">
                    <Select value={pos.defaultPaymentMethod} onValueChange={v => { setPos(p => ({ ...p, defaultPaymentMethod: v })); markChanged() }} disabled={isViewOnly}>
                      <SelectTrigger className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                        <SelectItem value="wallet">Digital Wallet</SelectItem>
                      </SelectContent>
                    </Select>
                  </MacosFormField>
                </div>
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[12px] font-semibold tracking-tight">Auto-Print Receipt</Label>
                      <p className="text-[11px] text-muted-foreground">Print receipt automatically after sale</p>
                    </div>
                    <Switch checked={pos.autoPrintReceipt} onCheckedChange={v => { setPos(p => ({ ...p, autoPrintReceipt: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[12px] font-semibold tracking-tight">Show Tax on Receipt</Label>
                    </div>
                    <Switch checked={pos.showTaxOnReceipt} onCheckedChange={v => { setPos(p => ({ ...p, showTaxOnReceipt: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[12px] font-semibold tracking-tight">Show Discount on Receipt</Label>
                    </div>
                    <Switch checked={pos.showDiscountOnReceipt} onCheckedChange={v => { setPos(p => ({ ...p, showDiscountOnReceipt: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[12px] font-semibold tracking-tight">Show Customer on Receipt</Label>
                    </div>
                    <Switch checked={pos.showCustomerOnReceipt} onCheckedChange={v => { setPos(p => ({ ...p, showCustomerOnReceipt: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                </div>
              </div>

              {/* Scanning & Input */}
              <div className="macos-card macos-shadow-card p-5 space-y-4">
                <h3 className="macos-section-title flex items-center gap-2">
                  <Hash className="size-4 text-macos-purple" />
                  Scanning & Input
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[12px] font-semibold tracking-tight">Barcode Scanning</Label>
                      <p className="text-[11px] text-muted-foreground">Enable barcode scanner input</p>
                    </div>
                    <Switch checked={pos.enableBarcodeScanning} onCheckedChange={v => { setPos(p => ({ ...p, enableBarcodeScanning: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  <MacosFormField label="Barcode Prefix">
                    <Input value={pos.barcodePrefix} onChange={e => { setPos(p => ({ ...p, barcodePrefix: e.target.value })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9 w-24" />
                  </MacosFormField>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[12px] font-semibold tracking-tight">Quick Keys</Label>
                      <p className="text-[11px] text-muted-foreground">Enable quick-add product keys</p>
                    </div>
                    <Switch checked={pos.enableQuickKeys} onCheckedChange={v => { setPos(p => ({ ...p, enableQuickKeys: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                </div>
              </div>

              {/* Cart & Checkout */}
              <div className="macos-card macos-shadow-card p-5 space-y-4">
                <h3 className="macos-section-title flex items-center gap-2">
                  <ShoppingCart className="size-4 text-macos-green" />
                  Cart & Checkout Behavior
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[12px] font-semibold tracking-tight">Require Customer for Sale</Label>
                      <p className="text-[11px] text-muted-foreground">Must select a customer to complete sale</p>
                    </div>
                    <Switch checked={pos.requireCustomerForSale} onCheckedChange={v => { setPos(p => ({ ...p, requireCustomerForSale: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[12px] font-semibold tracking-tight">Allow Negative Stock Sale</Label>
                      <p className="text-[11px] text-muted-foreground">Allow selling items with zero stock</p>
                    </div>
                    <Switch checked={pos.allowNegativeStock} onCheckedChange={v => { setPos(p => ({ ...p, allowNegativeStock: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[12px] font-semibold tracking-tight">Auto-Clear Cart After Sale</Label>
                    </div>
                    <Switch checked={pos.autoClearCart} onCheckedChange={v => { setPos(p => ({ ...p, autoClearCart: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[12px] font-semibold tracking-tight">Enable Hold/Suspend Cart</Label>
                      <p className="text-[11px] text-muted-foreground">Allow suspending transactions</p>
                    </div>
                    <Switch checked={pos.enableHoldCart} onCheckedChange={v => { setPos(p => ({ ...p, enableHoldCart: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MacosFormField label="Max Cart Items">
                      <Input type="number" value={pos.maxCartItems} onChange={e => { setPos(p => ({ ...p, maxCartItems: parseInt(e.target.value) || 99 })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                    </MacosFormField>
                    <MacosFormField label="Max Held Carts">
                      <Input type="number" value={pos.maxHeldCarts} onChange={e => { setPos(p => ({ ...p, maxHeldCarts: parseInt(e.target.value) || 5 })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                    </MacosFormField>
                  </div>
                </div>
              </div>

              {/* Rounding */}
              <div className="macos-card macos-shadow-card p-5 space-y-4">
                <h3 className="macos-section-title flex items-center gap-2">
                  <Percent className="size-4 text-macos-orange" />
                  Rounding
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MacosFormField label="Rounding Mode">
                    <Select value={pos.roundingMode} onValueChange={v => { setPos(p => ({ ...p, roundingMode: v })); markChanged() }} disabled={isViewOnly}>
                      <SelectTrigger className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Rounding</SelectItem>
                        <SelectItem value="nearest">Nearest 0.05</SelectItem>
                        <SelectItem value="up">Round Up</SelectItem>
                        <SelectItem value="down">Round Down</SelectItem>
                      </SelectContent>
                    </Select>
                  </MacosFormField>
                  <MacosFormField label="Rounding Amount">
                    <Input type="number" step="0.01" value={pos.roundingAmount} onChange={e => { setPos(p => ({ ...p, roundingAmount: parseFloat(e.target.value) || 0 })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                  </MacosFormField>
                </div>
              </div>
            </div>
          )}

          {/* ─── Inventory Settings ─── */}
          {activeSection === 'inventory' && (
            <div className="space-y-4">
              <div className="macos-card macos-shadow-card p-5 space-y-4">
                <h3 className="macos-section-title flex items-center gap-2">
                  <Package className="size-4 text-macos-orange" />
                  Stock Thresholds
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MacosFormField label="Low Stock Threshold">
                    <Input type="number" value={inventory.lowStockThreshold} onChange={e => { setInventory(i => ({ ...i, lowStockThreshold: parseInt(e.target.value) || 10 })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                  </MacosFormField>
                  <MacosFormField label="Critical Stock Threshold">
                    <Input type="number" value={inventory.criticalStockThreshold} onChange={e => { setInventory(i => ({ ...i, criticalStockThreshold: parseInt(e.target.value) || 3 })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                  </MacosFormField>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[12px] font-semibold tracking-tight">Enable Stock Alerts</Label>
                    </div>
                    <Switch checked={inventory.enableStockAlerts} onCheckedChange={v => { setInventory(i => ({ ...i, enableStockAlerts: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  <MacosFormField label="Alert Frequency">
                    <Select value={inventory.alertFrequency} onValueChange={v => { setInventory(i => ({ ...i, alertFrequency: v })); markChanged() }} disabled={isViewOnly}>
                      <SelectTrigger className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9 w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">Real-time</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </MacosFormField>
                </div>
              </div>

              <div className="macos-card macos-shadow-card p-5 space-y-4">
                <h3 className="macos-section-title flex items-center gap-2">
                  <RotateCcw className="size-4 text-macos-blue" />
                  Auto Reorder
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[12px] font-semibold tracking-tight">Enable Auto-Reorder</Label>
                      <p className="text-[11px] text-muted-foreground">Automatically create purchase orders when stock is low</p>
                    </div>
                    <Switch checked={inventory.enableAutoReorder} onCheckedChange={v => { setInventory(i => ({ ...i, enableAutoReorder: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MacosFormField label="Reorder Point">
                      <Input type="number" value={inventory.reorderPoint} onChange={e => { setInventory(i => ({ ...i, reorderPoint: parseInt(e.target.value) || 5 })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                    </MacosFormField>
                    <MacosFormField label="Reorder Quantity">
                      <Input type="number" value={inventory.reorderQuantity} onChange={e => { setInventory(i => ({ ...i, reorderQuantity: parseInt(e.target.value) || 20 })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                    </MacosFormField>
                  </div>
                </div>
              </div>

              <div className="macos-card macos-shadow-card p-5 space-y-4">
                <h3 className="macos-section-title flex items-center gap-2">
                  <Warehouse className="size-4 text-gg-bridge" />
                  Warehouse & Tracking
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-[12px] font-semibold tracking-tight">Warehouse Management</Label>
                    <Switch checked={inventory.enableWarehouseManagement} onCheckedChange={v => { setInventory(i => ({ ...i, enableWarehouseManagement: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-[12px] font-semibold tracking-tight">Multi-Warehouse</Label>
                    <Switch checked={inventory.enableMultiWarehouse} onCheckedChange={v => { setInventory(i => ({ ...i, enableMultiWarehouse: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-[12px] font-semibold tracking-tight">Track Serial Numbers</Label>
                    <Switch checked={inventory.trackSerialNumbers} onCheckedChange={v => { setInventory(i => ({ ...i, trackSerialNumbers: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-[12px] font-semibold tracking-tight">Track Batch Numbers</Label>
                    <Switch checked={inventory.trackBatchNumbers} onCheckedChange={v => { setInventory(i => ({ ...i, trackBatchNumbers: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[12px] font-semibold tracking-tight">Expiry Tracking</Label>
                      <p className="text-[11px] text-muted-foreground">Track product expiration dates</p>
                    </div>
                    <Switch checked={inventory.enableExpiryTracking} onCheckedChange={v => { setInventory(i => ({ ...i, enableExpiryTracking: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  {inventory.enableExpiryTracking && (
                    <MacosFormField label="Expiry Alert (Days Before)">
                      <Input type="number" value={inventory.expiryAlertDays} onChange={e => { setInventory(i => ({ ...i, expiryAlertDays: parseInt(e.target.value) || 30 })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9 w-24" />
                    </MacosFormField>
                  )}
                  <div className="flex items-center justify-between">
                    <Label className="text-[12px] font-semibold tracking-tight">Allow Negative Stock</Label>
                    <Switch checked={inventory.allowNegativeStock} onCheckedChange={v => { setInventory(i => ({ ...i, allowNegativeStock: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  <MacosFormField label="Cost Calculation Method">
                    <Select value={inventory.costMethod} onValueChange={v => { setInventory(i => ({ ...i, costMethod: v })); markChanged() }} disabled={isViewOnly}>
                      <SelectTrigger className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9 w-52"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fifo">FIFO (First In, First Out)</SelectItem>
                        <SelectItem value="lifo">LIFO (Last In, First Out)</SelectItem>
                        <SelectItem value="weighted_average">Weighted Average</SelectItem>
                        <SelectItem value="standard">Standard Cost</SelectItem>
                      </SelectContent>
                    </Select>
                  </MacosFormField>
                </div>
              </div>
            </div>
          )}

          {/* ─── Tax Settings ─── */}
          {activeSection === 'tax' && (
            <div className="space-y-4">
              <div className="macos-card macos-shadow-card p-5 space-y-4">
                <h3 className="macos-section-title flex items-center gap-2">
                  <Receipt className="size-4 text-macos-green" />
                  Tax Configuration
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[12px] font-semibold tracking-tight">Enable Tax</Label>
                      <p className="text-[11px] text-muted-foreground">Apply tax to sales transactions</p>
                    </div>
                    <Switch checked={tax.enableTax} onCheckedChange={v => { setTax(t => ({ ...t, enableTax: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  {tax.enableTax && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <MacosFormField label="Default Tax Rate (%)">
                          <Input type="number" step="0.5" value={tax.defaultTaxRate} onChange={e => { setTax(t => ({ ...t, defaultTaxRate: parseFloat(e.target.value) || 0 })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                        </MacosFormField>
                        <MacosFormField label="Tax Registration Number">
                          <Input value={tax.taxRegistrationNumber} onChange={e => { setTax(t => ({ ...t, taxRegistrationNumber: e.target.value })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                        </MacosFormField>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-[12px] font-semibold tracking-tight">Tax-Inclusive Pricing</Label>
                          <p className="text-[11px] text-muted-foreground">Product prices include tax</p>
                        </div>
                        <Switch checked={tax.taxInclusivePricing} onCheckedChange={v => { setTax(t => ({ ...t, taxInclusivePricing: v })); markChanged() }} disabled={isViewOnly} />
                      </div>
                      <MacosFormField label="Tax Calculation Method">
                        <Select value={tax.taxCalculationMethod} onValueChange={v => { setTax(t => ({ ...t, taxCalculationMethod: v })); markChanged() }} disabled={isViewOnly}>
                          <SelectTrigger className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9 w-52"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="exclusive">Exclusive (Add tax on top)</SelectItem>
                            <SelectItem value="inclusive">Inclusive (Tax included in price)</SelectItem>
                          </SelectContent>
                        </Select>
                      </MacosFormField>
                      <div className="flex items-center justify-between">
                        <Label className="text-[12px] font-semibold tracking-tight">Enable Multi-Tax</Label>
                        <Switch checked={tax.enableMultiTax} onCheckedChange={v => { setTax(t => ({ ...t, enableMultiTax: v })); markChanged() }} disabled={isViewOnly} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-[12px] font-semibold tracking-tight">Tax-Exempt Customers</Label>
                        <Switch checked={tax.enableTaxExempt} onCheckedChange={v => { setTax(t => ({ ...t, enableTaxExempt: v })); markChanged() }} disabled={isViewOnly} />
                      </div>
                      <MacosFormField label="Tax Filing Frequency">
                        <Select value={tax.taxFrequency} onValueChange={v => { setTax(t => ({ ...t, taxFrequency: v })); markChanged() }} disabled={isViewOnly}>
                          <SelectTrigger className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9 w-40"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="annually">Annually</SelectItem>
                          </SelectContent>
                        </Select>
                      </MacosFormField>
                    </>
                  )}
                </div>
              </div>

              <div className="macos-card macos-shadow-card p-5 space-y-4">
                <h3 className="macos-section-title flex items-center gap-2">
                  <DollarSign className="size-4 text-macos-red" />
                  Withholding Tax
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[12px] font-semibold tracking-tight">Enable Withholding Tax</Label>
                    </div>
                    <Switch checked={tax.enableWithholdingTax} onCheckedChange={v => { setTax(t => ({ ...t, enableWithholdingTax: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  {tax.enableWithholdingTax && (
                    <MacosFormField label="Withholding Tax Rate (%)">
                      <Input type="number" step="0.5" value={tax.withholdingTaxRate} onChange={e => { setTax(t => ({ ...t, withholdingTaxRate: parseFloat(e.target.value) || 0 })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9 w-32" />
                    </MacosFormField>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─── Sales & Orders ─── */}
          {activeSection === 'sales' && (
            <div className="space-y-4">
              <div className="macos-card macos-shadow-card p-5 space-y-4">
                <h3 className="macos-section-title flex items-center gap-2">
                  <Truck className="size-4 text-gg-sunset" />
                  Sales Channels
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[12px] font-semibold tracking-tight">Wholesale</Label>
                      <p className="text-[11px] text-muted-foreground">Enable wholesale ordering</p>
                    </div>
                    <Switch checked={sales.enableWholesale} onCheckedChange={v => { setSales(s => ({ ...s, enableWholesale: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  {sales.enableWholesale && (
                    <MacosFormField label="Minimum Wholesale Order Qty">
                      <Input type="number" value={sales.wholesaleMinOrder} onChange={e => { setSales(s => ({ ...s, wholesaleMinOrder: parseInt(e.target.value) || 10 })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9 w-32" />
                    </MacosFormField>
                  )}
                  <div className="flex items-center justify-between">
                    <Label className="text-[12px] font-semibold tracking-tight">School Supply</Label>
                    <Switch checked={sales.enableSchoolSupply} onCheckedChange={v => { setSales(s => ({ ...s, enableSchoolSupply: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-[12px] font-semibold tracking-tight">Online Orders</Label>
                    <Switch checked={sales.enableOnlineOrders} onCheckedChange={v => { setSales(s => ({ ...s, enableOnlineOrders: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                </div>
              </div>

              <div className="macos-card macos-shadow-card p-5 space-y-4">
                <h3 className="macos-section-title flex items-center gap-2">
                  <FileText className="size-4 text-macos-blue" />
                  Invoicing & Quotations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MacosFormField label="Order Prefix">
                    <Input value={sales.orderPrefix} onChange={e => { setSales(s => ({ ...s, orderPrefix: e.target.value })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                  </MacosFormField>
                  <MacosFormField label="Invoice Prefix">
                    <Input value={sales.invoicePrefix} onChange={e => { setSales(s => ({ ...s, invoicePrefix: e.target.value })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                  </MacosFormField>
                  <MacosFormField label="Invoice Start Number">
                    <Input type="number" value={sales.invoiceStartNumber} onChange={e => { setSales(s => ({ ...s, invoiceStartNumber: parseInt(e.target.value) || 1001 })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                  </MacosFormField>
                  <MacosFormField label="Quotation Prefix">
                    <Input value={sales.quotationPrefix} onChange={e => { setSales(s => ({ ...s, quotationPrefix: e.target.value })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                  </MacosFormField>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-[12px] font-semibold tracking-tight">Auto-Number Invoices</Label>
                    <Switch checked={sales.invoiceAutoNumber} onCheckedChange={v => { setSales(s => ({ ...s, invoiceAutoNumber: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-[12px] font-semibold tracking-tight">Enable Quotations</Label>
                    <Switch checked={sales.enableQuotations} onCheckedChange={v => { setSales(s => ({ ...s, enableQuotations: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  {sales.enableQuotations && (
                    <MacosFormField label="Quotation Validity (Days)">
                      <Input type="number" value={sales.quotationValidityDays} onChange={e => { setSales(s => ({ ...s, quotationValidityDays: parseInt(e.target.value) || 30 })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9 w-32" />
                    </MacosFormField>
                  )}
                </div>
              </div>

              <div className="macos-card macos-shadow-card p-5 space-y-4">
                <h3 className="macos-section-title flex items-center gap-2">
                  <RotateCcw className="size-4 text-macos-red" />
                  Returns & Discounts
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-[12px] font-semibold tracking-tight">Enable Returns</Label>
                    <Switch checked={sales.enableReturns} onCheckedChange={v => { setSales(s => ({ ...s, enableReturns: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  {sales.enableReturns && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <MacosFormField label="Return Window (Days)">
                        <Input type="number" value={sales.returnWindowDays} onChange={e => { setSales(s => ({ ...s, returnWindowDays: parseInt(e.target.value) || 14 })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                      </MacosFormField>
                      <div className="flex items-center justify-between pt-5">
                        <Label className="text-[12px] font-semibold tracking-tight">Require Return Reason</Label>
                        <Switch checked={sales.requireReturnReason} onCheckedChange={v => { setSales(s => ({ ...s, requireReturnReason: v })); markChanged() }} disabled={isViewOnly} />
                      </div>
                    </div>
                  )}
                  <Separator className="opacity-40" />
                  <div className="flex items-center justify-between">
                    <Label className="text-[12px] font-semibold tracking-tight">Enable Price Override</Label>
                    <Switch checked={sales.enablePriceOverride} onCheckedChange={v => { setSales(s => ({ ...s, enablePriceOverride: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MacosFormField label="Max Discount (%)">
                      <Input type="number" value={sales.maxDiscountPercent} onChange={e => { setSales(s => ({ ...s, maxDiscountPercent: parseInt(e.target.value) || 20 })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                    </MacosFormField>
                    <div className="flex items-center justify-between pt-5">
                      <Label className="text-[12px] font-semibold tracking-tight">Require Discount Approval</Label>
                      <Switch checked={sales.requireDiscountApproval} onCheckedChange={v => { setSales(s => ({ ...s, requireDiscountApproval: v })); markChanged() }} disabled={isViewOnly} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="macos-card macos-shadow-card p-5 space-y-4">
                <h3 className="macos-section-title flex items-center gap-2">
                  <Users className="size-4 text-gg-golden" />
                  Loyalty Program
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[12px] font-semibold tracking-tight">Enable Loyalty Program</Label>
                      <p className="text-[11px] text-muted-foreground">Reward customers with points on purchases</p>
                    </div>
                    <Switch checked={sales.enableLoyaltyProgram} onCheckedChange={v => { setSales(s => ({ ...s, enableLoyaltyProgram: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  {sales.enableLoyaltyProgram && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <MacosFormField label="Point Value ($)">
                        <Input type="number" step="0.001" value={sales.loyaltyPointValue} onChange={e => { setSales(s => ({ ...s, loyaltyPointValue: parseFloat(e.target.value) || 0.01 })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                      </MacosFormField>
                      <MacosFormField label="Earning Rate (pts/$)">
                        <Input type="number" value={sales.loyaltyEarningRate} onChange={e => { setSales(s => ({ ...s, loyaltyEarningRate: parseInt(e.target.value) || 1 })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                      </MacosFormField>
                      <MacosFormField label="Min Redeem Points">
                        <Input type="number" value={sales.minRedeemPoints} onChange={e => { setSales(s => ({ ...s, minRedeemPoints: parseInt(e.target.value) || 100 })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                      </MacosFormField>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─── Email & SMTP ─── */}
          {activeSection === 'email' && (
            <div className="space-y-4">
              <div className="macos-card macos-shadow-card p-5 space-y-4">
                <h3 className="macos-section-title flex items-center gap-2">
                  <Mail className="size-4 text-macos-blue" />
                  SMTP Configuration
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[12px] font-semibold tracking-tight">Enable Email Notifications</Label>
                    </div>
                    <Switch checked={email.enableEmailNotifications} onCheckedChange={v => { setEmail(e => ({ ...e, enableEmailNotifications: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  {email.enableEmailNotifications && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <MacosFormField label="SMTP Host">
                        <Input value={email.smtpHost} onChange={e => { setEmail(e => ({ ...e, smtpHost: e.target.value })); markChanged() }} disabled={isViewOnly} placeholder="smtp.gmail.com" className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                      </MacosFormField>
                      <MacosFormField label="SMTP Port">
                        <Input type="number" value={email.smtpPort} onChange={e => { setEmail(e => ({ ...e, smtpPort: parseInt(e.target.value) || 587 })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9 w-24" />
                      </MacosFormField>
                      <MacosFormField label="SMTP Username">
                        <Input value={email.smtpUser} onChange={e => { setEmail(e => ({ ...e, smtpUser: e.target.value })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                      </MacosFormField>
                      <MacosFormField label="SMTP Password">
                        <Input type="password" value={email.smtpPassword} onChange={e => { setEmail(e => ({ ...e, smtpPassword: e.target.value })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                      </MacosFormField>
                      <MacosFormField label="Encryption">
                        <Select value={email.smtpEncryption} onValueChange={v => { setEmail(e => ({ ...e, smtpEncryption: v })); markChanged() }} disabled={isViewOnly}>
                          <SelectTrigger className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9 w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tls">TLS</SelectItem>
                            <SelectItem value="ssl">SSL</SelectItem>
                            <SelectItem value="none">None</SelectItem>
                          </SelectContent>
                        </Select>
                      </MacosFormField>
                      <MacosFormField label="Sender Name">
                        <Input value={email.senderName} onChange={e => { setEmail(e => ({ ...e, senderName: e.target.value })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                      </MacosFormField>
                      <MacosFormField label="Sender Email" className="md:col-span-2">
                        <Input type="email" value={email.senderEmail} onChange={e => { setEmail(e => ({ ...e, senderEmail: e.target.value })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                      </MacosFormField>
                    </div>
                  )}
                </div>
              </div>

              <div className="macos-card macos-shadow-card p-5 space-y-4">
                <h3 className="macos-section-title flex items-center gap-2">
                  <Bell className="size-4 text-macos-orange" />
                  Email Templates
                </h3>
                <div className="space-y-3">
                  {[
                    { key: 'enableSaleConfirmation', label: 'Sale Confirmation', desc: 'Send receipt to customer after purchase' },
                    { key: 'enableLowStockAlert', label: 'Low Stock Alert', desc: 'Notify when products are running low' },
                    { key: 'enableDailyReport', label: 'Daily Report', desc: 'Daily sales summary' },
                    { key: 'enableWeeklyReport', label: 'Weekly Report', desc: 'Weekly performance report' },
                    { key: 'enableMonthlyReport', label: 'Monthly Report', desc: 'Monthly financial summary' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div>
                        <Label className="text-[12px] font-semibold tracking-tight">{item.label}</Label>
                        <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch
                        checked={email[item.key as keyof EmailSettings] as boolean}
                        onCheckedChange={v => { setEmail(e => ({ ...e, [item.key]: v })); markChanged() }}
                        disabled={isViewOnly}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── Notifications ─── */}
          {activeSection === 'notifications' && (
            <div className="macos-card macos-shadow-card p-5 space-y-4">
              <h3 className="macos-section-title flex items-center gap-2">
                <Bell className="size-4 text-macos-orange" />
                Alert Preferences
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-[12px] font-semibold tracking-tight">Enable Notifications</Label>
                    <p className="text-[11px] text-muted-foreground">Master switch for all in-app notifications</p>
                  </div>
                  <Switch checked={notifications.enableNotifications} onCheckedChange={v => { setNotifications(n => ({ ...n, enableNotifications: v })); markChanged() }} disabled={isViewOnly} />
                </div>
                <Separator className="opacity-40" />
                {[
                  { key: 'enableSoundAlerts', label: 'Sound Alerts', desc: 'Play sounds for notifications' },
                  { key: 'lowStockAlert', label: 'Low Stock Alert', desc: 'When inventory falls below threshold' },
                  { key: 'newOrderAlert', label: 'New Order Alert', desc: 'When a new order is placed' },
                  { key: 'paymentReceivedAlert', label: 'Payment Received', desc: 'When payment is confirmed' },
                  { key: 'employeeClockInAlert', label: 'Employee Clock In', desc: 'When employees check in' },
                  { key: 'dailySummaryAlert', label: 'Daily Summary', desc: 'End-of-day sales summary' },
                  { key: 'systemUpdateAlert', label: 'System Updates', desc: 'Software updates and announcements' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <Label className="text-[12px] font-semibold tracking-tight">{item.label}</Label>
                      <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={notifications[item.key as keyof NotificationSettings] as boolean}
                      onCheckedChange={v => { setNotifications(n => ({ ...n, [item.key]: v })); markChanged() }}
                      disabled={isViewOnly || !notifications.enableNotifications}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Security ─── */}
          {activeSection === 'security' && (
            <div className="space-y-4">
              <div className="macos-card macos-shadow-card p-5 space-y-4">
                <h3 className="macos-section-title flex items-center gap-2">
                  <Shield className="size-4 text-macos-red" />
                  Authentication
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[12px] font-semibold tracking-tight">Two-Factor Authentication</Label>
                      <p className="text-[11px] text-muted-foreground">Require 2FA for all users</p>
                    </div>
                    <Switch checked={security.enableTwoFactor} onCheckedChange={v => { setSecurity(s => ({ ...s, enableTwoFactor: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MacosFormField label="Session Timeout (minutes)">
                      <Input type="number" value={security.sessionTimeout} onChange={e => { setSecurity(s => ({ ...s, sessionTimeout: parseInt(e.target.value) || 30 })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                    </MacosFormField>
                    <MacosFormField label="Max Login Attempts">
                      <Input type="number" value={security.maxLoginAttempts} onChange={e => { setSecurity(s => ({ ...s, maxLoginAttempts: parseInt(e.target.value) || 5 })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                    </MacosFormField>
                  </div>
                </div>
              </div>

              <div className="macos-card macos-shadow-card p-5 space-y-4">
                <h3 className="macos-section-title flex items-center gap-2">
                  <Lock className="size-4 text-macos-purple" />
                  Password Policy
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MacosFormField label="Minimum Password Length">
                      <Input type="number" value={security.passwordMinLength} onChange={e => { setSecurity(s => ({ ...s, passwordMinLength: parseInt(e.target.value) || 8 })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                    </MacosFormField>
                    <MacosFormField label="Password Expiry (days)">
                      <Input type="number" value={security.passwordExpiryDays} onChange={e => { setSecurity(s => ({ ...s, passwordExpiryDays: parseInt(e.target.value) || 90 })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                    </MacosFormField>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-[12px] font-semibold tracking-tight">Require Special Characters</Label>
                    <Switch checked={security.requireSpecialChars} onCheckedChange={v => { setSecurity(s => ({ ...s, requireSpecialChars: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-[12px] font-semibold tracking-tight">Require Numbers</Label>
                    <Switch checked={security.requireNumbers} onCheckedChange={v => { setSecurity(s => ({ ...s, requireNumbers: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-[12px] font-semibold tracking-tight">Require Uppercase Letters</Label>
                    <Switch checked={security.requireUppercase} onCheckedChange={v => { setSecurity(s => ({ ...s, requireUppercase: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                </div>
              </div>

              <div className="macos-card macos-shadow-card p-5 space-y-4">
                <h3 className="macos-section-title flex items-center gap-2">
                  <FileText className="size-4 text-macos-blue" />
                  Audit & Access
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[12px] font-semibold tracking-tight">Audit Logging</Label>
                      <p className="text-[11px] text-muted-foreground">Log all user actions for compliance</p>
                    </div>
                    <Switch checked={security.enableAuditLog} onCheckedChange={v => { setSecurity(s => ({ ...s, enableAuditLog: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  {security.enableAuditLog && (
                    <MacosFormField label="Audit Log Retention (days)">
                      <Input type="number" value={security.auditLogRetention} onChange={e => { setSecurity(s => ({ ...s, auditLogRetention: parseInt(e.target.value) || 365 })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9 w-32" />
                    </MacosFormField>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[12px] font-semibold tracking-tight">IP Whitelist</Label>
                      <p className="text-[11px] text-muted-foreground">Restrict access to specific IP addresses</p>
                    </div>
                    <Switch checked={security.enableIpWhitelist} onCheckedChange={v => { setSecurity(s => ({ ...s, enableIpWhitelist: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  {security.enableIpWhitelist && (
                    <MacosFormField label="Allowed IPs (comma-separated)">
                      <Textarea value={security.ipWhitelist} onChange={e => { setSecurity(s => ({ ...s, ipWhitelist: e.target.value })); markChanged() }} disabled={isViewOnly} placeholder="192.168.1.0/24, 10.0.0.1" className="rounded-lg bg-secondary/50 border-0 text-[13px] min-h-[60px]" />
                    </MacosFormField>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─── Printing ─── */}
          {activeSection === 'printing' && (
            <div className="space-y-4">
              <div className="macos-card macos-shadow-card p-5 space-y-4">
                <h3 className="macos-section-title flex items-center gap-2">
                  <Printer className="size-4 text-gg-bridge" />
                  Printer Setup
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MacosFormField label="Default Printer">
                    <Select value={printing.defaultPrinter} onValueChange={v => { setPrinting(p => ({ ...p, defaultPrinter: v })); markChanged() }} disabled={isViewOnly}>
                      <SelectTrigger className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">System Default</SelectItem>
                        <SelectItem value="thermal">Thermal Printer</SelectItem>
                        <SelectItem value="laser">Laser Printer</SelectItem>
                      </SelectContent>
                    </Select>
                  </MacosFormField>
                  <MacosFormField label="Receipt Printer">
                    <Select value={printing.receiptPrinter} onValueChange={v => { setPrinting(p => ({ ...p, receiptPrinter: v })); markChanged() }} disabled={isViewOnly}>
                      <SelectTrigger className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="thermal">Thermal Printer</SelectItem>
                        <SelectItem value="system">System Default</SelectItem>
                      </SelectContent>
                    </Select>
                  </MacosFormField>
                  <MacosFormField label="Label Printer">
                    <Select value={printing.labelPrinter} onValueChange={v => { setPrinting(p => ({ ...p, labelPrinter: v })); markChanged() }} disabled={isViewOnly}>
                      <SelectTrigger className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="label">Label Printer</SelectItem>
                        <SelectItem value="system">System Default</SelectItem>
                      </SelectContent>
                    </Select>
                  </MacosFormField>
                  <MacosFormField label="Print Copies">
                    <Input type="number" min={1} max={5} value={printing.printCopies} onChange={e => { setPrinting(p => ({ ...p, printCopies: parseInt(e.target.value) || 1 })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9 w-24" />
                  </MacosFormField>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-[12px] font-semibold tracking-tight">Auto-Print on Sale</Label>
                  <Switch checked={printing.enableAutoPrint} onCheckedChange={v => { setPrinting(p => ({ ...p, enableAutoPrint: v })); markChanged() }} disabled={isViewOnly} />
                </div>
              </div>

              <div className="macos-card macos-shadow-card p-5 space-y-4">
                <h3 className="macos-section-title flex items-center gap-2">
                  <Package className="size-4 text-macos-green" />
                  Barcode Labels
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-[12px] font-semibold tracking-tight">Enable Barcode Labels</Label>
                    <Switch checked={printing.enableBarcodeLabels} onCheckedChange={v => { setPrinting(p => ({ ...p, enableBarcodeLabels: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MacosFormField label="Barcode Format">
                      <Select value={printing.barcodeFormat} onValueChange={v => { setPrinting(p => ({ ...p, barcodeFormat: v })); markChanged() }} disabled={isViewOnly}>
                        <SelectTrigger className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CODE128">CODE128</SelectItem>
                          <SelectItem value="EAN13">EAN-13</SelectItem>
                          <SelectItem value="UPC">UPC-A</SelectItem>
                          <SelectItem value="QR">QR Code</SelectItem>
                        </SelectContent>
                      </Select>
                    </MacosFormField>
                    <MacosFormField label="Label Size">
                      <Select value={printing.labelSize} onValueChange={v => { setPrinting(p => ({ ...p, labelSize: v })); markChanged() }} disabled={isViewOnly}>
                        <SelectTrigger className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="40x20">40×20mm (Small)</SelectItem>
                          <SelectItem value="60x30">60×30mm (Medium)</SelectItem>
                          <SelectItem value="80x40">80×40mm (Large)</SelectItem>
                        </SelectContent>
                      </Select>
                    </MacosFormField>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── Appearance ─── */}
          {activeSection === 'appearance' && (
            <div className="space-y-4">
              <div className="macos-card macos-shadow-card p-5 space-y-4">
                <h3 className="macos-section-title flex items-center gap-2">
                  <Palette className="size-4 text-macos-purple" />
                  Theme & Display
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MacosFormField label="Theme">
                    <Select value={appearance.theme} onValueChange={v => { setAppearance(a => ({ ...a, theme: v })); markChanged() }} disabled={isViewOnly}>
                      <SelectTrigger className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">System Default</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </MacosFormField>
                  <MacosFormField label="Accent Color">
                    <Select value={appearance.accentColor} onValueChange={v => { setAppearance(a => ({ ...a, accentColor: v })); markChanged() }} disabled={isViewOnly}>
                      <SelectTrigger className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="blue">Blue</SelectItem>
                        <SelectItem value="green">Green</SelectItem>
                        <SelectItem value="purple">Purple</SelectItem>
                        <SelectItem value="orange">Orange</SelectItem>
                      </SelectContent>
                    </Select>
                  </MacosFormField>
                  <MacosFormField label="Font Size">
                    <Select value={appearance.fontSize} onValueChange={v => { setAppearance(a => ({ ...a, fontSize: v })); markChanged() }} disabled={isViewOnly}>
                      <SelectTrigger className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </MacosFormField>
                  <MacosFormField label="Dashboard Layout">
                    <Select value={appearance.dashboardLayout} onValueChange={v => { setAppearance(a => ({ ...a, dashboardLayout: v })); markChanged() }} disabled={isViewOnly}>
                      <SelectTrigger className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grid">Grid</SelectItem>
                        <SelectItem value="list">List</SelectItem>
                        <SelectItem value="compact">Compact</SelectItem>
                      </SelectContent>
                    </Select>
                  </MacosFormField>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-[12px] font-semibold tracking-tight">Compact Mode</Label>
                    <Switch checked={appearance.compactMode} onCheckedChange={v => { setAppearance(a => ({ ...a, compactMode: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-[12px] font-semibold tracking-tight">Show Animations</Label>
                    <Switch checked={appearance.showAnimations} onCheckedChange={v => { setAppearance(a => ({ ...a, showAnimations: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── Backup & Data ─── */}
          {activeSection === 'backup' && (
            <div className="space-y-4">
              <div className="macos-card macos-shadow-card p-5 space-y-4">
                <h3 className="macos-section-title flex items-center gap-2">
                  <Database className="size-4 text-macos-green" />
                  Backup Configuration
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[12px] font-semibold tracking-tight">Enable Auto-Backup</Label>
                      <p className="text-[11px] text-muted-foreground">Automatically backup your data</p>
                    </div>
                    <Switch checked={backup.enableAutoBackup} onCheckedChange={v => { setBackup(b => ({ ...b, enableAutoBackup: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  {backup.enableAutoBackup && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <MacosFormField label="Backup Frequency">
                        <Select value={backup.backupFrequency} onValueChange={v => { setBackup(b => ({ ...b, backupFrequency: v })); markChanged() }} disabled={isViewOnly}>
                          <SelectTrigger className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </MacosFormField>
                      <MacosFormField label="Retention (days)">
                        <Input type="number" value={backup.backupRetention} onChange={e => { setBackup(b => ({ ...b, backupRetention: parseInt(e.target.value) || 30 })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                      </MacosFormField>
                      <MacosFormField label="Backup Location">
                        <Input value={backup.backupLocation} onChange={e => { setBackup(b => ({ ...b, backupLocation: e.target.value })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                      </MacosFormField>
                    </div>
                  )}
                </div>
              </div>

              <div className="macos-card macos-shadow-card p-5 space-y-4">
                <h3 className="macos-section-title flex items-center gap-2">
                  <HardDrive className="size-4 text-macos-blue" />
                  Cloud Backup
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[12px] font-semibold tracking-tight">Enable Cloud Backup</Label>
                      <p className="text-[11px] text-muted-foreground">Sync backups to cloud storage</p>
                    </div>
                    <Switch checked={backup.enableCloudBackup} onCheckedChange={v => { setBackup(b => ({ ...b, enableCloudBackup: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  {backup.enableCloudBackup && (
                    <MacosFormField label="Cloud Provider">
                      <Select value={backup.cloudProvider} onValueChange={v => { setBackup(b => ({ ...b, cloudProvider: v })); markChanged() }} disabled={isViewOnly}>
                        <SelectTrigger className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9 w-48"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aws">Amazon S3</SelectItem>
                          <SelectItem value="gcp">Google Cloud</SelectItem>
                          <SelectItem value="azure">Azure Blob</SelectItem>
                          <SelectItem value="dropbox">Dropbox</SelectItem>
                        </SelectContent>
                      </Select>
                    </MacosFormField>
                  )}
                </div>
              </div>

              {/* Backup Status */}
              <div className="macos-card macos-shadow-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="macos-section-title">Backup Status</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Last backup: {backup.lastBackupDate || 'Never'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg text-[12px] font-medium h-8"
                    disabled={isViewOnly}
                    onClick={() => {
                      setBackup(b => ({ ...b, lastBackupDate: new Date().toLocaleString() }))
                      markChanged()
                    }}
                  >
                    <Database className="size-3.5 mr-1.5" />
                    Backup Now
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ─── Integrations ─── */}
          {activeSection === 'integrations' && (
            <div className="space-y-4">
              <div className="macos-card macos-shadow-card p-5 space-y-4">
                <h3 className="macos-section-title flex items-center gap-2">
                  <Webhook className="size-4 text-macos-purple" />
                  API Access
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[12px] font-semibold tracking-tight">Enable API Access</Label>
                      <p className="text-[11px] text-muted-foreground">Allow external apps to connect via API</p>
                    </div>
                    <Switch checked={integrations.enableApi} onCheckedChange={v => { setIntegrations(i => ({ ...i, enableApi: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  {integrations.enableApi && (
                    <MacosFormField label="API Key">
                      <div className="flex gap-2">
                        <Input value={integrations.apiKey} onChange={e => { setIntegrations(i => ({ ...i, apiKey: e.target.value })); markChanged() }} disabled={isViewOnly} className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9 font-mono" />
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg text-[11px] font-medium h-9 px-3 flex-shrink-0"
                          disabled={isViewOnly}
                          onClick={() => {
                            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
                            const key = 'bf_' + Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
                            setIntegrations(i => ({ ...i, apiKey: key }))
                            markChanged()
                          }}
                        >
                          Generate
                        </Button>
                      </div>
                    </MacosFormField>
                  )}
                </div>
              </div>

              <div className="macos-card macos-shadow-card p-5 space-y-4">
                <h3 className="macos-section-title flex items-center gap-2">
                  <Globe className="size-4 text-macos-blue" />
                  Webhooks
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[12px] font-semibold tracking-tight">Enable Webhooks</Label>
                      <p className="text-[11px] text-muted-foreground">Send event data to external services</p>
                    </div>
                    <Switch checked={integrations.enableWebhooks} onCheckedChange={v => { setIntegrations(i => ({ ...i, enableWebhooks: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  {integrations.enableWebhooks && (
                    <MacosFormField label="Webhook URL">
                      <Input value={integrations.webhookUrl} onChange={e => { setIntegrations(i => ({ ...i, webhookUrl: e.target.value })); markChanged() }} disabled={isViewOnly} placeholder="https://" className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9" />
                    </MacosFormField>
                  )}
                </div>
              </div>

              <div className="macos-card macos-shadow-card p-5 space-y-4">
                <h3 className="macos-section-title flex items-center gap-2">
                  <BarChart3 className="size-4 text-macos-green" />
                  Third-Party Sync
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[12px] font-semibold tracking-tight">Accounting Software Sync</Label>
                    </div>
                    <Switch checked={integrations.enableAccountingSync} onCheckedChange={v => { setIntegrations(i => ({ ...i, enableAccountingSync: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  {integrations.enableAccountingSync && (
                    <MacosFormField label="Accounting Provider">
                      <Select value={integrations.accountingProvider} onValueChange={v => { setIntegrations(i => ({ ...i, accountingProvider: v })); markChanged() }} disabled={isViewOnly}>
                        <SelectTrigger className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9 w-48"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="quickbooks">QuickBooks</SelectItem>
                          <SelectItem value="xero">Xero</SelectItem>
                          <SelectItem value="freshbooks">FreshBooks</SelectItem>
                          <SelectItem value="wave">Wave</SelectItem>
                        </SelectContent>
                      </Select>
                    </MacosFormField>
                  )}
                  <Separator className="opacity-40" />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[12px] font-semibold tracking-tight">E-Commerce Platform Sync</Label>
                    </div>
                    <Switch checked={integrations.enableEcommerceSync} onCheckedChange={v => { setIntegrations(i => ({ ...i, enableEcommerceSync: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  {integrations.enableEcommerceSync && (
                    <MacosFormField label="E-Commerce Platform">
                      <Select value={integrations.ecommercePlatform} onValueChange={v => { setIntegrations(i => ({ ...i, ecommercePlatform: v })); markChanged() }} disabled={isViewOnly}>
                        <SelectTrigger className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9 w-48"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="shopify">Shopify</SelectItem>
                          <SelectItem value="woocommerce">WooCommerce</SelectItem>
                          <SelectItem value="magento">Magento</SelectItem>
                          <SelectItem value="bigcommerce">BigCommerce</SelectItem>
                        </SelectContent>
                      </Select>
                    </MacosFormField>
                  )}
                  <Separator className="opacity-40" />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-[12px] font-semibold tracking-tight">Payment Gateway</Label>
                    </div>
                    <Switch checked={integrations.enablePaymentGateway} onCheckedChange={v => { setIntegrations(i => ({ ...i, enablePaymentGateway: v })); markChanged() }} disabled={isViewOnly} />
                  </div>
                  {integrations.enablePaymentGateway && (
                    <MacosFormField label="Payment Provider">
                      <Select value={integrations.paymentProvider} onValueChange={v => { setIntegrations(i => ({ ...i, paymentProvider: v })); markChanged() }} disabled={isViewOnly}>
                        <SelectTrigger className="rounded-lg bg-secondary/50 border-0 text-[13px] h-9 w-48"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="stripe">Stripe</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                          <SelectItem value="razorpay">Razorpay</SelectItem>
                          <SelectItem value="square">Square</SelectItem>
                        </SelectContent>
                      </Select>
                    </MacosFormField>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
