'use client'

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

export function ModuleContent({ activeModule }: ModuleContentProps) {
  const Component = moduleComponents[activeModule]
  if (Component) {
    return <Component />
  }
  return <DashboardModule />
}
