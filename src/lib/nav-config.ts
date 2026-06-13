import {
  LayoutDashboard,
  BookOpen,
  PenTool,
  Building2,
  PencilRuler,
  Warehouse,
  ShoppingCart,
  Truck,
  GraduationCap,
  Users,
  DollarSign,
  UserCog,
  Building,
  Printer,
  Globe,
  BarChart3,
  Brain,
  Crown,
  type LucideIcon,
} from 'lucide-react'

export interface NavModule {
  id: string
  label: string
  icon: LucideIcon
  group: 'owner' | 'main' | 'sales' | 'management' | 'intelligence'
  ownerOnly?: boolean
}

export const navModules: NavModule[] = [
  // Owner Portal — always first, only visible to owners
  { id: 'owner', label: 'Owner Portal', icon: Crown, group: 'owner', ownerOnly: true },
  // Core
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'main' },
  { id: 'book-catalog', label: 'Book Catalog', icon: BookOpen, group: 'main' },
  { id: 'authors', label: 'Authors', icon: PenTool, group: 'main' },
  { id: 'publishers', label: 'Publishers', icon: Building2, group: 'main' },
  { id: 'stationery', label: 'Stationery', icon: PencilRuler, group: 'main' },
  { id: 'inventory', label: 'Inventory', icon: Warehouse, group: 'main' },
  // Sales
  { id: 'retail-pos', label: 'Retail POS', icon: ShoppingCart, group: 'sales' },
  { id: 'wholesale', label: 'Wholesale', icon: Truck, group: 'sales' },
  { id: 'school-supply', label: 'School Supply', icon: GraduationCap, group: 'sales' },
  { id: 'crm-loyalty', label: 'CRM & Loyalty', icon: Users, group: 'sales' },
  // Management
  { id: 'finance', label: 'Finance', icon: DollarSign, group: 'management' },
  { id: 'employees', label: 'Employees', icon: UserCog, group: 'management' },
  { id: 'branches', label: 'Branches', icon: Building, group: 'management' },
  { id: 'publishing', label: 'Publishing', icon: Printer, group: 'management' },
  // Intelligence
  { id: 'e-commerce', label: 'E-Commerce', icon: Globe, group: 'intelligence' },
  { id: 'reports', label: 'Reports', icon: BarChart3, group: 'intelligence' },
  { id: 'ai-suite', label: 'AI Suite', icon: Brain, group: 'intelligence' },
]

export const navGroups = [
  { id: 'owner', label: 'Owner' },
  { id: 'main', label: 'Core' },
  { id: 'sales', label: 'Sales & Customers' },
  { id: 'management', label: 'Management' },
  { id: 'intelligence', label: 'Intelligence' },
] as const

export function getModuleById(id: string): NavModule | undefined {
  return navModules.find((m) => m.id === id)
}
