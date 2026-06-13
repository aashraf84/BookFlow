'use client'

import { Shield } from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import DashboardModule from '@/components/modules/dashboard'
import BookCatalogModule from '@/components/modules/book-catalog'
import { AuthorsModule } from '@/components/modules/authors'
import { PublishersModule } from '@/components/modules/publishers'
import { StationeryModule } from '@/components/modules/stationery'
import { InventoryModule } from '@/components/modules/inventory'
import { RetailPOSModule } from '@/components/modules/retail-pos'
import { WholesaleModule } from '@/components/modules/wholesale'
import { SchoolSupplyModule } from '@/components/modules/school-supply'
import { CRMLoyaltyModule } from '@/components/modules/crm-loyalty'
import { FinanceModule } from '@/components/modules/finance'
import { EmployeesModule } from '@/components/modules/employees'
import { BranchesModule } from '@/components/modules/branches'
import { PublishingModule } from '@/components/modules/publishing'
import { EcommerceModule } from '@/components/modules/ecommerce'
import { ReportsModule } from '@/components/modules/reports'
import { AiSuiteModule } from '@/components/modules/ai-suite'
import { OwnerModule } from '@/components/modules/owner'

// Modules that require owner role
const ownerOnlyModules = new Set(['owner'])

interface ModuleContentProps {
  activeModule: string
}

const moduleComponents: Record<string, React.ComponentType> = {
  'dashboard': DashboardModule,
  'book-catalog': BookCatalogModule,
  'authors': AuthorsModule,
  'publishers': PublishersModule,
  'stationery': StationeryModule,
  'inventory': InventoryModule,
  'retail-pos': RetailPOSModule,
  'wholesale': WholesaleModule,
  'school-supply': SchoolSupplyModule,
  'crm-loyalty': CRMLoyaltyModule,
  'finance': FinanceModule,
  'employees': EmployeesModule,
  'branches': BranchesModule,
  'publishing': PublishingModule,
  'e-commerce': EcommerceModule,
  'reports': ReportsModule,
  'ai-suite': AiSuiteModule,
  'owner': OwnerModule,
}

function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="w-16 h-16 rounded-full bg-[#FF453A]/10 flex items-center justify-center mb-4">
        <Shield className="size-7 text-[#FF453A]" strokeWidth={2} />
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-1">Access Restricted</h2>
      <p className="text-sm text-muted-foreground max-w-[300px]">
        This module is only available to the system owner. Contact your administrator for access.
      </p>
    </div>
  )
}

export function ModuleContent({ activeModule }: ModuleContentProps) {
  const { authUser } = useAppStore()

  // Check owner-only access
  if (ownerOnlyModules.has(activeModule) && authUser?.role !== 'owner') {
    return <AccessDenied />
  }

  const Component = moduleComponents[activeModule]
  if (Component) {
    return <Component />
  }
  return <DashboardModule />
}
